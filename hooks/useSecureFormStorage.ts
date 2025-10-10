/**
 * @fileoverview Secure Form Draft Storage Hook
 * @description Provides encrypted storage for form drafts containing sensitive data.
 * Use this for forms with financial information, personal data, or credentials.
 * 
 * @security All form drafts are encrypted using AES-GCM 256-bit encryption
 * 
 * @example
 * ```typescript
 * // In a transaction form component
 * const { 
 *   saveDraft, 
 *   loadDraft, 
 *   clearDraft 
 * } = useSecureFormStorage<TransactionFormData>('transaction-draft');
 * 
 * // Auto-save on form change
 * useEffect(() => {
 *   saveDraft(formData);
 * }, [formData]);
 * 
 * // Load on mount
 * useEffect(() => {
 *   const draft = await loadDraft();
 *   if (draft) {
 *     reset(draft);
 *   }
 * }, []);
 * ```
 */

import { useCallback } from 'react';
import { secureStorage } from '@/utils/secureStorage';
import { logError, logDebug } from '@/utils/logger';

/**
 * Options for secure form storage
 */
export interface SecureFormStorageOptions {
  /** Whether to encrypt the draft (default: true for sensitive data) */
  encrypt?: boolean;
  /** How long to keep the draft in milliseconds (default: 24 hours) */
  expiresIn?: number;
  /** Namespace for isolating form drafts (optional) */
  namespace?: string;
}

/**
 * Default expiration for form drafts (24 hours)
 * @constant
 */
const DEFAULT_DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Return type for useSecureFormStorage hook
 */
export interface UseSecureFormStorageReturn<T> {
  /** Save form data as encrypted draft */
  saveDraft: (data: T) => Promise<void>;
  /** Load encrypted draft */
  loadDraft: () => Promise<T | null>;
  /** Clear draft from storage */
  clearDraft: () => void;
  /** Check if draft exists */
  hasDraft: () => Promise<boolean>;
}

/**
 * Hook for secure form draft storage with encryption
 * 
 * @template T - Type of form data
 * @param storageKey - Unique key for this form's drafts
 * @param options - Configuration options
 * @returns Object with draft management functions
 * 
 * @remarks
 * Use this hook for forms containing:
 * - Financial information (transactions, accounts, balances)
 * - Personal identifiable information (PII)
 * - Authentication credentials
 * - Sensitive user preferences
 * 
 * For non-sensitive UI state, use regular `useLocalStorage` instead.
 * 
 * @example
 * ```typescript
 * // Secure transaction form
 * const TransactionForm = () => {
 *   const { saveDraft, loadDraft, clearDraft } = useSecureFormStorage<Transaction>(
 *     'transaction-draft',
 *     { encrypt: true, expiresIn: 86400000 } // 24 hours
 *   );
 * 
 *   const onFormChange = async (data: Transaction) => {
 *     await saveDraft(data);
 *   };
 * 
 *   useEffect(() => {
 *     const loadPrevious = async () => {
 *       const draft = await loadDraft();
 *       if (draft) {
 *         reset(draft);
 *       }
 *     };
 *     loadPrevious();
 *   }, []);
 * 
 *   const onSubmit = async (data: Transaction) => {
 *     await submitTransaction(data);
 *     clearDraft(); // Clear after successful submit
 *   };
 * 
 *   return <form>...</form>;
 * };
 * ```
 * 
 * @public
 */
export function useSecureFormStorage<T = any>(
  storageKey: string,
  options: SecureFormStorageOptions = {}
): UseSecureFormStorageReturn<T> {
  const {
    encrypt = true, // Default to encrypted for form data
    expiresIn = DEFAULT_DRAFT_EXPIRY,
    namespace,
  } = options;

  // Get storage instance (with namespace if provided)
  const storage = namespace ? secureStorage.namespace(namespace) : secureStorage;

  /**
   * Save form draft with encryption
   * 
   * @param data - Form data to save
   * @returns Promise that resolves when saved
   * 
   * @example
   * ```typescript
   * await saveDraft({ amount: 100, description: 'Payment' });
   * ```
   */
  const saveDraft = useCallback(
    async (data: T): Promise<void> => {
      try {
        await storage.set(storageKey, data, {
          encrypt,
          expiresIn,
        });
        logDebug(`Form draft saved: ${storageKey}`, { encrypted: encrypt });
      } catch (error) {
        logError(`Failed to save form draft: ${storageKey}`, error);
        throw new Error('Failed to save form draft');
      }
    },
    [storageKey, encrypt, expiresIn, storage]
  );

  /**
   * Load form draft and decrypt if needed
   * 
   * @returns Promise resolving to form data or null if not found
   * 
   * @example
   * ```typescript
   * const draft = await loadDraft();
   * if (draft) {
   *   console.log('Found saved draft:', draft);
   * }
   * ```
   */
  const loadDraft = useCallback(async (): Promise<T | null> => {
    try {
      const draft = await storage.get<T>(storageKey);
      if (draft) {
        logDebug(`Form draft loaded: ${storageKey}`);
      }
      return draft;
    } catch (error) {
      logError(`Failed to load form draft: ${storageKey}`, error);
      return null;
    }
  }, [storageKey, storage]);

  /**
   * Clear form draft from storage
   * 
   * @example
   * ```typescript
   * clearDraft(); // Remove draft after successful form submission
   * ```
   */
  const clearDraft = useCallback((): void => {
    try {
      storage.remove(storageKey);
      logDebug(`Form draft cleared: ${storageKey}`);
    } catch (error) {
      logError(`Failed to clear form draft: ${storageKey}`, error);
    }
  }, [storageKey, storage]);

  /**
   * Check if a draft exists
   * 
   * @returns Promise resolving to true if draft exists
   * 
   * @example
   * ```typescript
   * if (await hasDraft()) {
   *   console.log('Unsaved draft found');
   * }
   * ```
   */
  const hasDraft = useCallback(async (): Promise<boolean> => {
    try {
      return await storage.has(storageKey);
    } catch (error) {
      logError(`Failed to check form draft: ${storageKey}`, error);
      return false;
    }
  }, [storageKey, storage]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}

/**
 * Hook for managing multiple form drafts with encryption
 * 
 * @param basePath - Base path for form drafts
 * @param options - Configuration options
 * @returns Object with draft management functions for multiple forms
 * 
 * @example
 * ```typescript
 * const { saveDraft, loadDraft, clearDraft, listDrafts } = useSecureFormStorageMulti('forms');
 * 
 * // Save different form types
 * await saveDraft('transaction', transactionData);
 * await saveDraft('goal', goalData);
 * 
 * // Load specific form
 * const txDraft = await loadDraft('transaction');
 * 
 * // List all saved drafts
 * const allDrafts = await listDrafts();
 * ```
 * 
 * @public
 */
export function useSecureFormStorageMulti(
  basePath: string,
  options: SecureFormStorageOptions = {}
): {
  saveDraft: <T>(formId: string, data: T) => Promise<void>;
  loadDraft: <T>(formId: string) => Promise<T | null>;
  clearDraft: (formId: string) => void;
  listDrafts: () => Promise<string[]>;
} {
  const {
    encrypt = true,
    expiresIn = DEFAULT_DRAFT_EXPIRY,
    namespace,
  } = options;

  const storage = namespace ? secureStorage.namespace(namespace) : secureStorage;

  /**
   * Save a form draft by form ID
   */
  const saveDraft = useCallback(
    async <T>(formId: string, data: T): Promise<void> => {
      const key = `${basePath}:${formId}`;
      try {
        await storage.set(key, data, { encrypt, expiresIn });
        logDebug(`Multi-form draft saved: ${key}`);
      } catch (error) {
        logError(`Failed to save multi-form draft: ${key}`, error);
        throw new Error(`Failed to save form draft: ${formId}`);
      }
    },
    [basePath, encrypt, expiresIn, storage]
  );

  /**
   * Load a form draft by form ID
   */
  const loadDraft = useCallback(
    async <T>(formId: string): Promise<T | null> => {
      const key = `${basePath}:${formId}`;
      try {
        const draft = await storage.get<T>(key);
        if (draft) {
          logDebug(`Multi-form draft loaded: ${key}`);
        }
        return draft;
      } catch (error) {
        logError(`Failed to load multi-form draft: ${key}`, error);
        return null;
      }
    },
    [basePath, storage]
  );

  /**
   * Clear a form draft by form ID
   */
  const clearDraft = useCallback(
    (formId: string): void => {
      const key = `${basePath}:${formId}`;
      try {
        storage.remove(key);
        logDebug(`Multi-form draft cleared: ${key}`);
      } catch (error) {
        logError(`Failed to clear multi-form draft: ${key}`, error);
      }
    },
    [basePath, storage]
  );

  /**
   * List all form draft IDs under this base path
   */
  const listDrafts = useCallback(async (): Promise<string[]> => {
    try {
      const allKeys = await storage.keys({ namespace: basePath });
      const draftIds = allKeys
        .filter((key) => key.startsWith(`${basePath}:`))
        .map((key) => key.replace(`${basePath}:`, ''));
      
      logDebug(`Found ${draftIds.length} multi-form drafts under ${basePath}`);
      return draftIds;
    } catch (error) {
      logError(`Failed to list multi-form drafts: ${basePath}`, error);
      return [];
    }
  }, [basePath, storage]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    listDrafts,
  };
}
