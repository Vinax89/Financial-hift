/**
 * @fileoverview Secure Storage React Hook
 * @description React hook wrapper for secureStorage utility with encryption support.
 * Use this for sensitive data that needs to be persisted with encryption.
 * 
 * @security Provides AES-GCM 256-bit encryption for sensitive data
 * 
 * @example
 * ```typescript
 * // Store encrypted API key
 * const [apiKey, setApiKey] = useSecureStorage<string>('api_key', '', {
 *   encrypt: true,
 *   expiresIn: 3600000
 * });
 * 
 * // Store user preferences (unencrypted)
 * const [theme, setTheme] = useSecureStorage<string>('theme', 'dark', {
 *   encrypt: false
 * });
 * ```
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { secureStorage } from '@/utils/secureStorage';
import { logWarn, logDebug } from '@/utils/logger';
import type { SecureStorageOptions } from '@/utils/secureStorage';

/**
 * Options for useSecureStorage hook
 */
export interface UseSecureStorageOptions extends SecureStorageOptions {
  /** Enable cross-tab synchronization (default: true) */
  syncTabs?: boolean;
  /** Callback when value changes from another tab */
  onExternalChange?: (newValue: any) => void;
}

/**
 * Return type for useSecureStorage hook
 */
export type UseSecureStorageReturn<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  () => void,
  boolean
];

/**
 * React hook for secure storage with optional encryption
 * 
 * @template T - Type of stored value
 * @param key - Storage key
 * @param initialValue - Default value if key doesn't exist
 * @param options - Configuration options
 * @returns Tuple of [value, setValue, removeValue, isLoading]
 * 
 * @remarks
 * **When to Encrypt** (set `encrypt: true`):
 * - Authentication tokens
 * - API keys
 * - User credentials
 * - Personal identification information (PII)
 * - Financial data
 * - Session tokens
 * 
 * **When NOT to Encrypt** (set `encrypt: false` or omit):
 * - UI theme preferences
 * - Language selection
 * - Non-sensitive UI state
 * - Public configuration
 * 
 * @example
 * ```typescript
 * // Encrypted API key storage
 * const ApiKeyManager = () => {
 *   const [apiKey, setApiKey, removeApiKey] = useSecureStorage<string>(
 *     'api_key',
 *     '',
 *     { encrypt: true, expiresIn: 86400000 } // 24 hours
 *   );
 * 
 *   return (
 *     <div>
 *       <input 
 *         type="password" 
 *         value={apiKey} 
 *         onChange={(e) => setApiKey(e.target.value)} 
 *       />
 *       <button onClick={removeApiKey}>Clear</button>
 *     </div>
 *   );
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Unencrypted theme preference
 * const ThemeSelector = () => {
 *   const [theme, setTheme] = useSecureStorage<string>(
 *     'theme',
 *     'dark',
 *     { encrypt: false } // No encryption needed for public preference
 *   );
 * 
 *   return (
 *     <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *       <option value="dark">Dark</option>
 *       <option value="light">Light</option>
 *     </select>
 *   );
 * };
 * ```
 * 
 * @public
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  options: UseSecureStorageOptions = {}
): UseSecureStorageReturn<T> {
  const {
    encrypt = false,
    expiresIn,
    syncTabs = true,
    onExternalChange,
  } = options;

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value from secure storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await secureStorage.get<T>(key);
        if (value !== null) {
          setStoredValue(value);
          logDebug(`Loaded secure storage: ${key}`, { encrypted: encrypt });
        } else {
          setStoredValue(initialValue);
        }
      } catch (error) {
        logWarn(`Failed to load secure storage key "${key}"`, error);
        setStoredValue(initialValue);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key, initialValue, encrypt]);

  /**
   * Set value in state and secure storage
   */
  const setValue = useCallback(
    async (value: SetStateAction<T>): Promise<void> => {
      try {
        // Handle functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        // Save to secure storage with encryption if enabled
        await secureStorage.set(key, valueToStore, {
          encrypt,
          expiresIn,
        });

        logDebug(`Saved secure storage: ${key}`, { encrypted: encrypt });
      } catch (error) {
        logWarn(`Failed to save secure storage key "${key}"`, error);
      }
    },
    [key, storedValue, encrypt, expiresIn]
  );

  /**
   * Remove value from storage and reset to initial value
   */
  const removeValue = useCallback((): void => {
    try {
      setStoredValue(initialValue);
      secureStorage.remove(key);
      logDebug(`Removed secure storage: ${key}`);
    } catch (error) {
      logWarn(`Failed to remove secure storage key "${key}"`, error);
    }
  }, [key, initialValue]);

  // Cross-tab synchronization (if enabled and not encrypted)
  useEffect(() => {
    if (!syncTabs || encrypt) {
      // Skip sync for encrypted storage (can't decrypt in storage events)
      return;
    }

    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = await secureStorage.get<T>(key);
          if (newValue !== null) {
            setStoredValue(newValue);
            onExternalChange?.(newValue);
            logDebug(`External change detected: ${key}`);
          }
        } catch (error) {
          logWarn(`Failed to sync storage change for key "${key}"`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, syncTabs, encrypt, onExternalChange]);

  return [storedValue, setValue as any, removeValue, isLoading];
}

/**
 * Hook for storing encrypted user preferences
 * 
 * @param userId - User ID for namespace isolation
 * @param key - Preference key
 * @param initialValue - Default value
 * @param encrypt - Whether to encrypt (default: true)
 * @returns Tuple of [value, setValue, removeValue, isLoading]
 * 
 * @example
 * ```typescript
 * const UserPreferences = ({ userId }: { userId: string }) => {
 *   const [preferences, setPreferences] = useSecureUserPreference<UserPrefs>(
 *     userId,
 *     'preferences',
 *     { theme: 'dark', notifications: true },
 *     true // Encrypt if contains PII
 *   );
 * 
 *   return <div>...</div>;
 * };
 * ```
 * 
 * @public
 */
export function useSecureUserPreference<T>(
  userId: string,
  key: string,
  initialValue: T,
  encrypt: boolean = true
): UseSecureStorageReturn<T> {
  const namespacedKey = `user:${userId}:${key}`;
  return useSecureStorage<T>(namespacedKey, initialValue, { encrypt });
}

/**
 * Hook for storing temporary session data
 * 
 * @param key - Session data key
 * @param initialValue - Default value
 * @param expiresIn - Expiration time in milliseconds (default: 1 hour)
 * @returns Tuple of [value, setValue, removeValue, isLoading]
 * 
 * @example
 * ```typescript
 * const SessionData = () => {
 *   const [sessionToken, setSessionToken] = useSecureSessionStorage(
 *     'session_token',
 *     '',
 *     3600000 // 1 hour
 *   );
 * 
 *   return <div>...</div>;
 * };
 * ```
 * 
 * @public
 */
export function useSecureSessionStorage<T>(
  key: string,
  initialValue: T,
  expiresIn: number = 3600000 // 1 hour default
): UseSecureStorageReturn<T> {
  return useSecureStorage<T>(key, initialValue, {
    encrypt: true,
    expiresIn,
  });
}

/**
 * Hook for checking if a secure storage key exists
 * 
 * @param key - Storage key to check
 * @returns Boolean indicating if key exists
 * 
 * @example
 * ```typescript
 * const hasApiKey = useSecureStorageExists('api_key');
 * 
 * if (hasApiKey) {
 *   console.log('API key is configured');
 * }
 * ```
 * 
 * @public
 */
export function useSecureStorageExists(key: string): boolean {
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const checkExists = async () => {
      try {
        const hasKey = await secureStorage.has(key);
        setExists(hasKey);
      } catch (error) {
        logWarn(`Failed to check storage key "${key}"`, error);
        setExists(false);
      }
    };

    checkExists();
  }, [key]);

  return exists;
}
