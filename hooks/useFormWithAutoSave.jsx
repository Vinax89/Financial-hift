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
 * ```jsx
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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useBeforeUnload } from './useBeforeUnload';

/**
 * Custom hook for form state management with auto-save functionality
 * 
 * @param {Object} options - Configuration options
 * @param {import('zod').ZodSchema} options.schema - Zod validation schema
 * @param {Function} options.onSave - Async function called when auto-saving (receives form data)
 * @param {string} [options.storageKey] - localStorage key for draft persistence (optional)
 * @param {number} [options.autoSaveDelay=500] - Debounce delay for auto-save in milliseconds
 * @param {boolean} [options.enableAutoSave=true] - Enable/disable auto-save functionality
 * @param {boolean} [options.enableDraftPersistence=true] - Enable/disable localStorage draft saving
 * @param {boolean} [options.enableUnsavedWarning=true] - Show warning when leaving with unsaved changes
 * @param {Object} [options.defaultValues] - Default form values
 * @param {string} [options.mode='onBlur'] - react-hook-form validation mode
 * @param {Function} [options.onAutoSaveSuccess] - Callback after successful auto-save
 * @param {Function} [options.onAutoSaveError] - Callback after failed auto-save
 * 
 * @returns {Object} Form state and methods
 * @returns {Object} returns.methods - react-hook-form methods (spread into FormProvider)
 * @returns {boolean} returns.isSaving - True when auto-save is in progress
 * @returns {string|null} returns.lastSaved - Formatted timestamp of last successful save
 * @returns {boolean} returns.hasUnsavedChanges - True when form has unsaved changes
 * @returns {Function} returns.clearDraft - Clear draft from localStorage
 * @returns {Function} returns.saveDraft - Manually save draft to localStorage
 * @returns {Function} returns.loadDraft - Manually load draft from localStorage
 * @returns {Function} returns.triggerAutoSave - Manually trigger auto-save
 */
export const useFormWithAutoSave = ({
  schema,
  onSave,
  storageKey,
  autoSaveDelay = 500,
  enableAutoSave = true,
  enableDraftPersistence = true,
  enableUnsavedWarning = true,
  defaultValues = {},
  mode = 'onBlur',
  onAutoSaveSuccess,
  onAutoSaveError,
}) => {
  // State management
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);

  // Refs to avoid stale closures
  const onSaveRef = useRef(onSave);
  const lastSaveAttemptRef = useRef(null);
  const isMountedRef = useRef(true);

  // Update refs on prop changes
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Load draft from localStorage on mount
  const loadedDefaultValues = useRef(defaultValues);
  if (enableDraftPersistence && storageKey) {
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        loadedDefaultValues.current = { ...defaultValues, ...parsedDraft };
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
  }

  // Initialize react-hook-form
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: loadedDefaultValues.current,
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
  const loadDraft = useCallback(() => {
    if (!enableDraftPersistence || !storageKey) return null;

    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
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
  const autoSave = useCallback(async (data) => {
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
    } catch (error) {
      console.error('Auto-save failed:', error);

      if (!isMountedRef.current) return;

      // Call error callback if provided
      if (onAutoSaveError) {
        onAutoSaveError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [isSaving, isDirty, isValid, lastSavedData, autoSaveDelay, onAutoSaveSuccess, onAutoSaveError]);

  /**
   * Trigger auto-save manually
   */
  const triggerAutoSave = useCallback(() => {
    if (enableAutoSave && isValid) {
      autoSave(formValues);
    }
  }, [enableAutoSave, isValid, formValues, autoSave]);

  /**
   * Effect: Auto-save on debounced form changes
   */
  useEffect(() => {
    if (!enableAutoSave) return;

    // Only auto-save if form is dirty and valid
    if (isDirty && isValid && !isSubmitting) {
      autoSave(debouncedFormValues);
    }
  }, [enableAutoSave, debouncedFormValues, isDirty, isValid, isSubmitting, autoSave]);

  /**
   * Effect: Save draft to localStorage on form changes
   */
  useEffect(() => {
    if (enableDraftPersistence && isDirty) {
      saveDraft();
    }
  }, [enableDraftPersistence, isDirty, saveDraft]);

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
  const getLastSavedString = () => {
    if (!lastSavedTime) return null;

    const now = new Date();
    const diff = Math.floor((now - lastSavedTime) / 1000); // seconds

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
 * @param {boolean} when - Condition to show warning
 * @param {string} message - Warning message
 */
export const useBeforeUnload = (when, message = 'You have unsaved changes') => {
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event) => {
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
