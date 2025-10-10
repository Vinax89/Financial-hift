/**
 * @fileoverview Custom React Hook for form state management with auto-save and encryption
 * @description Provides auto-save functionality, encrypted draft persistence, and unsaved changes warning
 *
 * Features:
 * - Auto-save with debounce (configurable delay)
 * - Draft persistence with AES-GCM encryption support 🔐
 * - Automatic expiration for draft storage
 * - Unsaved changes warning on navigation
 * - Loading states integration
 * - Works with all FormComponents and react-hook-form
 *
 * Security Classifications:
 * - 🔴 CRITICAL: Enable encryption for forms with passwords, tokens, API keys
 * - 🟡 SENSITIVE: Enable encryption for forms with PII, financial data
 * - 🟢 PUBLIC: No encryption needed for non-sensitive forms
 *
 * @example Basic Usage
 * ```tsx
 * const TransactionForm = () => {
 *   const { methods, isSaving, lastSaved } = useFormWithAutoSave({
 *     schema: transactionSchema,
 *     onSave: async (data) => await saveTransaction(data),
 *     storageKey: 'transaction-draft',
 *     autoSaveDelay: 1000,
 *   });
 *
 *   return (
 *     <FormProvider {...methods}>
 *       <form onSubmit={methods.handleSubmit(onSubmit)}>
 *         <FormInput name="description" />
 *         {isSaving && <span>💾 Saving...</span>}
 *         {lastSaved && <span>✅ Last saved: {lastSaved}</span>}
 *       </form>
 *     </FormProvider>
 *   );
 * };
 * ```
 *
 * @example With Encryption (for sensitive forms)
 * ```tsx
 * const { methods } = useFormWithAutoSave({
 *   schema: transactionSchema,
 *   onSave: saveTransactionDraft,
 *   storageKey: 'transaction-draft',
 *   encryptDrafts: true, // 🔒 Enable AES-GCM encryption
 *   draftExpiresIn: 86400000, // 24 hours
 * });
 * ```
 */

import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef, useCallback } from 'react';
import { z } from 'zod';
import { useDebounce } from './useDebounce';
import { logError } from '@/utils/logger';
import { secureStorage } from '@/utils/secureStorage';

/**
 * Configuration options for useFormWithAutoSave
 */
export interface UseFormWithAutoSaveOptions<T extends FieldValues> {
  /** Zod validation schema */
  schema: z.ZodSchema<T>;
  /** Async function called when auto-saving (receives form data) */
  onSave: (data: T) => Promise<void>;
  /** localStorage key for draft persistence (optional) */
  storageKey?: string;
  /** Debounce delay for auto-save in milliseconds */
  autoSaveDelay?: number;
  /** Enable/disable auto-save functionality */
  enableAutoSave?: boolean;
  /** Enable/disable localStorage draft saving */
  enableDraftPersistence?: boolean;
  /** Show warning when leaving with unsaved changes */
  enableUnsavedWarning?: boolean;
  /** Default form values */
  defaultValues?: Partial<T>;
  /** react-hook-form validation mode */
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  /** Callback after successful auto-save */
  onAutoSaveSuccess?: (data: T) => void;
  /** Callback after failed auto-save */
  onAutoSaveError?: (error: Error, data: T) => void;
  /** 
   * Enable AES-GCM encryption for sensitive form drafts (🔴 HIGH SECURITY)
   * @default false
   * @remarks Use for forms containing PII, financial data, or credentials
   */
  encryptDrafts?: boolean;
  /**
   * Expiration time for draft storage in milliseconds
   * @default 86400000 (24 hours)
   * @remarks After this time, drafts will be automatically removed
   */
  draftExpiresIn?: number;
}

/**
 * Return type for useFormWithAutoSave
 */
export interface UseFormWithAutoSaveReturn<T extends FieldValues> {
  /** react-hook-form methods (spread into FormProvider) */
  methods: UseFormReturn<T>;
  /** True when auto-save is in progress */
  isSaving: boolean;
  /** Formatted timestamp of last successful save */
  lastSaved: string | null;
  /** Raw Date object of last save time */
  lastSavedTime: Date | null;
  /** True when form has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Clear draft from secure storage (async with encryption support) */
  clearDraft: () => Promise<void>;
  /** Manually save draft to secure storage (async with encryption support) */
  saveDraft: () => Promise<void>;
  /** Manually load draft from secure storage (async with automatic decryption) */
  loadDraft: () => Promise<T | null>;
  /** Manually trigger auto-save */
  triggerAutoSave: () => Promise<void>;
}

/**
 * Custom hook for form state management with auto-save functionality
 */
export const useFormWithAutoSave = <T extends FieldValues>({
  schema,
  onSave,
  storageKey,
  autoSaveDelay = 500,
  enableAutoSave = true,
  enableDraftPersistence = true,
  enableUnsavedWarning = true,
  defaultValues = {} as Partial<T>,
  mode = 'onBlur',
  onAutoSaveSuccess,
  onAutoSaveError,
  encryptDrafts = false,
  draftExpiresIn = 86400000, // 24 hours default
}: UseFormWithAutoSaveOptions<T>): UseFormWithAutoSaveReturn<T> => {
  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<T | null>(null);

  // Refs to avoid stale closures
  const onSaveRef = useRef(onSave);
  const lastSaveAttemptRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Update refs on prop changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Load draft from secure storage on mount (synchronously for initialization)
  const loadedDefaultValues = useRef<Partial<T>>(defaultValues);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Initialize react-hook-form
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: loadedDefaultValues.current as any,
    mode,
  });

  const { watch, formState } = methods;
  const { isDirty, isValid, isSubmitting } = formState;

  // Watch all form values
  const formValues = watch();

  // Debounced form values for auto-save
  const debouncedFormValues = useDebounce(formValues, autoSaveDelay);

  /**
   * Save draft to secure storage with optional encryption
   * @remarks Uses AES-GCM encryption if encryptDrafts is true
   */
  const saveDraft = useCallback(async () => {
    if (!enableDraftPersistence || !storageKey) return;

    try {
      await secureStorage.set(storageKey, formValues, {
        encrypt: encryptDrafts,
        expiresIn: draftExpiresIn,
      });
    } catch (error) {
      logError('Failed to save draft to secure storage', error);
    }
  }, [enableDraftPersistence, storageKey, formValues, encryptDrafts, draftExpiresIn]);

  /**
   * Load draft from secure storage with automatic decryption
   * @returns Promise resolving to draft data or null
   * @remarks Automatically decrypts if encryptDrafts is true
   */
  const loadDraft = useCallback(async (): Promise<T | null> => {
    if (!enableDraftPersistence || !storageKey) return null;

    try {
      const draft = await secureStorage.get<T>(storageKey, {
        decrypt: encryptDrafts,
      });
      if (draft) {
        methods.reset(draft);
        return draft;
      }
    } catch (error) {
      logError('Failed to load draft from secure storage', error);
    }
    return null;
  }, [enableDraftPersistence, storageKey, methods, encryptDrafts]);

  /**
   * Clear draft from secure storage
   * @remarks Removes both encrypted and unencrypted drafts
   */
  const clearDraft = useCallback(async () => {
    if (!storageKey) return;

    try {
      await secureStorage.remove(storageKey);
      setHasUnsavedChanges(false);
    } catch (error) {
      logError('Failed to clear draft from secure storage', error);
    }
  }, [storageKey]);

  /**
   * Auto-save function
   */
  const autoSave = useCallback(
    async (data: T) => {
      // Skip if already saving or data hasn't changed
      if (isSaving || !isDirty || !isValid) return;

      // Skip if data is the same as last saved
      if (JSON.stringify(data) === JSON.stringify(lastSavedData)) return;

      // Prevent rapid consecutive saves
      const now = Date.now();
      if (lastSaveAttemptRef.current && now - lastSaveAttemptRef.current < autoSaveDelay) {
        return;
      }

      lastSaveAttemptRef.current = now;
      setIsSaving(true);

      try {
        await onSaveRef.current(data);

        if (!isMountedRef.current) return;

        setLastSavedTime(new Date());
        setLastSavedData(data);
        setHasUnsavedChanges(false);

        // Call success callback if provided
        if (onAutoSaveSuccess) {
          onAutoSaveSuccess(data);
        }

        // Save to localStorage
        if (enableDraftPersistence && storageKey) {
          saveDraft();
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        logError('Auto-save failed', error);

        // Call error callback if provided
        if (onAutoSaveError) {
          onAutoSaveError(error as Error, data);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [
      isSaving,
      isDirty,
      isValid,
      lastSavedData,
      autoSaveDelay,
      onAutoSaveSuccess,
      onAutoSaveError,
      enableDraftPersistence,
      storageKey,
      saveDraft,
    ]
  );

  /**
   * Manually trigger auto-save
   */
  const triggerAutoSave = useCallback(async () => {
    if (!enableAutoSave) return;
    await autoSave(formValues as T);
  }, [enableAutoSave, autoSave, formValues]);

  /**
   * Effect: Auto-save when debounced form values change
   */
  useEffect(() => {
    if (!enableAutoSave || isSubmitting) return;

    autoSave(debouncedFormValues as T);
  }, [debouncedFormValues, enableAutoSave, isSubmitting, autoSave]);

  /**
   * Effect: Save draft to localStorage when form values change
   */
  useEffect(() => {
    if (!enableDraftPersistence || !storageKey) return;

    saveDraft();
  }, [formValues, enableDraftPersistence, storageKey, saveDraft]);

  /**
   * Effect: Track unsaved changes
   */
  useEffect(() => {
    if (isDirty && JSON.stringify(formValues) !== JSON.stringify(lastSavedData)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [isDirty, formValues, lastSavedData]);

  /**
   * Effect: Load draft from secure storage on mount
   */
  useEffect(() => {
    if (!enableDraftPersistence || !storageKey || isDraftLoaded) return;

    const loadInitialDraft = async () => {
      try {
        const draft = await secureStorage.get<Partial<T>>(storageKey, {
          decrypt: encryptDrafts,
        });
        if (draft && isMountedRef.current) {
          methods.reset({ ...defaultValues, ...draft } as any);
          setIsDraftLoaded(true);
        }
      } catch (error) {
        logError('Failed to load initial draft from secure storage', error);
      }
    };

    loadInitialDraft();
  }, [enableDraftPersistence, storageKey, encryptDrafts, methods, defaultValues, isDraftLoaded]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Show warning when leaving page with unsaved changes
   */
  useBeforeUnload(
    enableUnsavedWarning && hasUnsavedChanges,
    'You have unsaved changes. Are you sure you want to leave?'
  );

  /**
   * Format last saved time as relative string
   */
  const getLastSavedString = (): string | null => {
    if (!lastSavedTime) return null;

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSavedTime.getTime()) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return lastSavedTime.toLocaleDateString();
  };

  return {
    methods,
    isSaving,
    lastSaved: getLastSavedString(),
    lastSavedTime,
    hasUnsavedChanges,
    clearDraft,
    saveDraft,
    loadDraft,
    triggerAutoSave,
  };
};

/**
 * Hook to show warning when leaving page with unsaved changes
 */
export const useBeforeUnload = (when: boolean, message: string = 'You have unsaved changes'): void => {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when, message]);
};

export default useFormWithAutoSave;
