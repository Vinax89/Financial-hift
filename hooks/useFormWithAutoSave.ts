/**
 * @fileoverview Custom React Hook for form state management with auto-save
 * @description Provides auto-save functionality, draft persistence, and unsaved changes warning
 *
 * Features:
 * - Auto-save with debounce (configurable delay)
 * - Draft persistence to localStorage
 * - Unsaved changes warning on navigation
 * - Loading states integration
 * - Works with all FormComponents and react-hook-form
 *
 * @example
 * ```tsx
 * const TransactionForm = () => {
 *   const { methods, isSaving, lastSaved, hasUnsavedChanges } = useFormWithAutoSave({
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
 *         {isSaving && <span>Saving...</span>}
 *         {lastSaved && <span>Last saved: {lastSaved}</span>}
 *       </form>
 *     </FormProvider>
 *   );
 * };
 * ```
 */

import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef, useCallback } from 'react';
import { z } from 'zod';
import { useDebounce } from './useDebounce';

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
  /** Clear draft from localStorage */
  clearDraft: () => void;
  /** Manually save draft to localStorage */
  saveDraft: () => void;
  /** Manually load draft from localStorage */
  loadDraft: () => T | null;
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

  // Load draft from localStorage on mount
  const loadedDefaultValues = useRef<Partial<T>>(defaultValues);
  if (enableDraftPersistence && storageKey) {
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsedDraft = JSON.parse(draft) as Partial<T>;
        loadedDefaultValues.current = { ...defaultValues, ...parsedDraft };
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
  }

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
   * Save draft to localStorage
   */
  const saveDraft = useCallback(() => {
    if (!enableDraftPersistence || !storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(formValues));
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
    }
  }, [enableDraftPersistence, storageKey, formValues]);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback((): T | null => {
    if (!enableDraftPersistence || !storageKey) return null;

    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsedDraft = JSON.parse(draft) as T;
        methods.reset(parsedDraft);
        return parsedDraft;
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
    return null;
  }, [enableDraftPersistence, storageKey, methods]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error);
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

        console.error('Auto-save failed:', error);

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
