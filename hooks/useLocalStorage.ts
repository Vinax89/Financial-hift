/**
 * @fileoverview LocalStorage hook with SSR support, encryption, and cross-tab sync
 * @description Provides persistent state management using localStorage or encrypted storage
 * with automatic JSON serialization, AES-GCM encryption support, and cross-tab synchronization
 *
 * Security Classifications:
 * - 🔴 CRITICAL: Enable encryption for passwords, tokens, API keys
 * - 🟡 SENSITIVE: Enable encryption for PII, financial data
 * - 🟢 PUBLIC: No encryption needed for theme, preferences
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { logWarn } from '@/utils/logger';
import { secureStorage } from '@/utils/secureStorage';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Options for useLocalStorage hook
 */
export interface UseLocalStorageOptions {
  /** Enable cross-tab synchronization (default: true) */
  syncTabs?: boolean;
  /** Debounce sync events in milliseconds (default: 100) */
  syncDebounce?: number;
  /**
   * Enable AES-GCM encryption for sensitive data (🔴 HIGH SECURITY)
   * @default false
   * @remarks Use for PII, financial data, tokens, or credentials
   */
  encrypt?: boolean;
  /**
   * Expiration time in milliseconds
   * @default undefined (no expiration)
   * @remarks Data will be automatically removed after this time
   */
  expiresIn?: number;
  /**
   * Namespace for storage isolation
   * @default undefined
   * @remarks Useful for multi-tenant or user-specific data
   */
  namespace?: string;
}

/**
 * Return type for useLocalStorage hook
 */
export type UseLocalStorageReturn<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  () => void
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely parse JSON value from localStorage
 * @template T
 * @param {string | null} value - Value to parse
 * @param {T} fallback - Fallback value if parsing fails
 * @returns {T} Parsed value or fallback
 */
function parseStorageValue<T>(value: string | null, fallback: T): T {
  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // Fallback: accept raw string values written elsewhere
    return value as unknown as T;
  }
}

/**
 * Safely stringify value for localStorage
 * @param {unknown} value - Value to stringify
 * @returns {string} Stringified value
 */
function stringifyStorageValue(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    logWarn('Failed to stringify value for localStorage', { error });
    return String(value);
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Persist state to localStorage with optional encryption and optimized cross-tab sync
 * 
 * **✨ NEW in Phase 3**: Automatic migration from plaintext to encrypted storage!
 * When `encrypt: true` is enabled, the hook automatically detects existing plaintext
 * data and migrates it to encrypted format on first use.
 * 
 * @template T
 * @param {string} key - LocalStorage key
 * @param {T} initialValue - Initial value if key doesn't exist
 * @param {UseLocalStorageOptions} options - Configuration options
 * @returns {UseLocalStorageReturn<T>} Tuple of [value, setValue, removeValue]
 * 
 * @example Basic usage (no encryption)
 * const [theme, setTheme] = useLocalStorage<string>('theme', 'dark');
 * 
 * @example With encryption for sensitive data (auto-migrates existing plaintext)
 * const [apiKey, setApiKey, removeApiKey] = useLocalStorage<string>(
 *   'apiKey',
 *   '',
 *   { encrypt: true, expiresIn: 3600000 } // 1 hour
 * );
 * // If plaintext 'apiKey' exists, it's automatically migrated to encrypted format
 * 
 * @example With namespace and expiration
 * const [userData, setUserData] = useLocalStorage<UserData>(
 *   'profile',
 *   {},
 *   { 
 *     encrypt: true,
 *     namespace: `user:${userId}`,
 *     expiresIn: 86400000 // 24 hours
 *   }
 * );
 * 
 * @example Migration behavior
 * // Before: plaintext localStorage.setItem('token', 'abc123')
 * const [token] = useLocalStorage('token', null, { encrypt: true });
 * // After: Automatically migrated to encrypted storage, plaintext deleted
 * // Console log (dev only): "🔒 Auto-migrated "token" to encrypted storage"
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const { 
    syncTabs = true, 
    syncDebounce = 100,
    encrypt = false,
    expiresIn,
    namespace
  } = options;

  // Build full storage key with optional namespace
  const storageKey = namespace ? `${namespace}:${key}` : key;

  // Initialize state with value from storage (encrypted or plaintext)
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Return initialValue in SSR context
    if (typeof window === 'undefined') {
      return initialValue;
    }

    // Use synchronous initialization (async load happens in useEffect)
    try {
      if (encrypt) {
        // For encrypted storage, return initialValue and load async in useEffect
        return initialValue;
      } else {
        // For plaintext, load synchronously
        const item = window.localStorage.getItem(storageKey);
        return parseStorageValue(item, initialValue);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logWarn(`Error reading localStorage key "${storageKey}"`, { error });
      }
      return initialValue;
    }
  });

  // Track if initial async load is complete (for encrypted storage)
  const [isInitialized, setIsInitialized] = useState<boolean>(!encrypt);

  /**
   * Set value in state and storage (encrypted or plaintext)
   */
  const setValue = useCallback(
    async (value: SetStateAction<T>): Promise<void> => {
      try {
        // Handle functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          if (encrypt) {
            // Use encrypted storage
            await secureStorage.set(storageKey, valueToStore, {
              encrypt: true,
              expiresIn,
            });
          } else {
            // Use plaintext localStorage
            window.localStorage.setItem(storageKey, stringifyStorageValue(valueToStore));
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          logWarn(`Error setting storage key "${storageKey}"`, { error });
        }
      }
    },
    [storageKey, storedValue, encrypt, expiresIn]
  );

  /**
   * Remove value from storage and reset to initialValue
   */
  const removeValue = useCallback(async (): Promise<void> => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        if (encrypt) {
          // Use secureStorage for encrypted data
          await secureStorage.remove(storageKey);
        } else {
          // Use plaintext localStorage
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logWarn(`Error removing storage key "${storageKey}"`, { error });
      }
    }
  }, [storageKey, initialValue, encrypt]);

  // Load encrypted data asynchronously on mount (with automatic migration)
  useEffect(() => {
    if (!encrypt || typeof window === 'undefined' || isInitialized) return;

    const loadEncryptedData = async () => {
      try {
        // Try to load encrypted data first
        const data = await secureStorage.get<T>(storageKey, {
          decrypt: true,
        });

        if (data !== null) {
          // Encrypted data found
          setStoredValue(data);
        } else {
          // No encrypted data - check for plaintext data to migrate
          const plaintextValue = window.localStorage.getItem(storageKey);
          
          if (plaintextValue !== null) {
            // Plaintext data exists - migrate to encrypted storage
            const parsedValue = parseStorageValue(plaintextValue, initialValue);
            
            // Store encrypted version
            await secureStorage.set(storageKey, parsedValue, {
              encrypt: true,
              expiresIn,
            });
            
            // Clear plaintext version for security
            window.localStorage.removeItem(storageKey);
            
            // Update state with migrated data
            setStoredValue(parsedValue);
            
            if (import.meta.env.DEV) {
              console.log(`🔒 Auto-migrated "${storageKey}" to encrypted storage`);
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        if (import.meta.env.DEV) {
          logWarn(`Error loading encrypted storage key "${storageKey}"`, { error });
        }
        setIsInitialized(true);
      }
    };

    loadEncryptedData();
  }, [encrypt, storageKey, isInitialized, initialValue, expiresIn]);

  // Cross-tab synchronization
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined' || encrypt) return;
    // Note: Cross-tab sync is not supported for encrypted storage
    // because the storage event provides encrypted data that can't be decrypted

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleStorageChange = (e: StorageEvent): void => {
      // Only handle changes to this specific key from other tabs
      if (e.key !== storageKey) return;

      // Debounce rapid changes to prevent excessive updates
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue);
            return;
          }

          const parsed = parseStorageValue(e.newValue, initialValue);

          // Only update if value actually changed
          setStoredValue((prev) => {
            const prevStr = stringifyStorageValue(prev);
            const newStr = stringifyStorageValue(parsed);

            if (prevStr === newStr) {
              return prev; // No change, prevent re-render
            }
            return parsed;
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            logWarn(`Error parsing storage key "${storageKey}"`, { error });
          }
        }
      }, syncDebounce);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, initialValue, syncTabs, syncDebounce, encrypt]);

  return [storedValue, setValue, removeValue];
}

// ============================================================================
// ADDITIONAL UTILITIES
// ============================================================================

/**
 * Get value from storage without using a hook (supports encryption)
 * @template T
 * @param {string} key - Storage key
 * @param {T} fallback - Fallback value if key doesn't exist
 * @param {Object} options - Options object
 * @param {boolean} options.decrypt - Whether to decrypt the value
 * @returns {Promise<T>} Value from storage or fallback
 * 
 * @example Plaintext
 * const theme = await getLocalStorageValue('theme', 'dark');
 * 
 * @example Encrypted
 * const apiKey = await getLocalStorageValue('apiKey', '', { decrypt: true });
 */
export async function getLocalStorageValue<T>(
  key: string, 
  fallback: T,
  options: { decrypt?: boolean } = {}
): Promise<T> {
  try {
    if (typeof window === 'undefined') {
      return fallback;
    }

    if (options.decrypt) {
      const value = await secureStorage.get<T>(key, { decrypt: true });
      return value !== null ? value : fallback;
    } else {
      const item = window.localStorage.getItem(key);
      return parseStorageValue(item, fallback);
    }
  } catch (error) {
    logWarn(`Error reading storage key "${key}"`, { error, key });
    return fallback;
  }
}

/**
 * Set value in storage without using a hook (supports encryption)
 * @param {string} key - Storage key
 * @param {unknown} value - Value to store
 * @param {Object} options - Options object
 * @param {boolean} options.encrypt - Whether to encrypt the value
 * @param {number} options.expiresIn - Expiration time in milliseconds
 * @returns {Promise<boolean>} True if successful, false otherwise
 * 
 * @example Plaintext
 * await setLocalStorageValue('theme', 'dark');
 * 
 * @example Encrypted
 * await setLocalStorageValue('apiKey', 'secret', { 
 *   encrypt: true, 
 *   expiresIn: 3600000 
 * });
 */
export async function setLocalStorageValue(
  key: string, 
  value: unknown,
  options: { encrypt?: boolean; expiresIn?: number } = {}
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    if (options.encrypt) {
      await secureStorage.set(key, value, {
        encrypt: true,
        expiresIn: options.expiresIn,
      });
    } else {
      window.localStorage.setItem(key, stringifyStorageValue(value));
    }
    return true;
  } catch (error) {
    logWarn(`Error setting storage key "${key}"`, { error, key });
    return false;
  }
}

/**
 * Remove value from storage without using a hook (supports encrypted storage)
 * @param {string} key - Storage key
 * @param {Object} options - Options object
 * @param {boolean} options.encrypted - Whether the value was encrypted
 * @returns {Promise<boolean>} True if successful, false otherwise
 * 
 * @example Plaintext
 * await removeLocalStorageValue('theme');
 * 
 * @example Encrypted
 * await removeLocalStorageValue('apiKey', { encrypted: true });
 */
export async function removeLocalStorageValue(
  key: string,
  options: { encrypted?: boolean } = {}
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    if (options.encrypted) {
      await secureStorage.remove(key);
    } else {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    logWarn(`Error removing storage key "${key}"`, { error, key });
    return false;
  }
}

/**
 * Clear all values from localStorage
 * @returns {boolean} True if successful, false otherwise
 * @warning This will clear all plaintext localStorage data
 * @note This does NOT clear encrypted storage. For encrypted storage, 
 *       you must explicitly call secureStorage.remove() for each key,
 *       or use secureStorage.clear() if available.
 * 
 * @example
 * clearLocalStorage();
 */
export function clearLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    window.localStorage.clear();
    return true;
  } catch (error) {
    logWarn('Error clearing localStorage', { error });
    return false;
  }
}
