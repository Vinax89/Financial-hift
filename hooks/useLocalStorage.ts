/**
 * @fileoverview LocalStorage hook with SSR support and sync across tabs
 * @description Provides persistent state management using localStorage
 * with automatic JSON serialization and cross-tab synchronization
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { logWarn } from '@/utils/logger.js';

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
    console.warn('Failed to stringify value for localStorage:', error);
    return String(value);
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Persist state to localStorage with optimized cross-tab sync
 * @template T
 * @param {string} key - LocalStorage key
 * @param {T} initialValue - Initial value if key doesn't exist
 * @param {UseLocalStorageOptions} options - Configuration options
 * @returns {UseLocalStorageReturn<T>} Tuple of [value, setValue, removeValue]
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage<string>('theme', 'dark');
 * 
 * @example
 * const [user, setUser, removeUser] = useLocalStorage<User | null>('user', null);
 * 
 * @example
 * const [data, setData] = useLocalStorage('data', {}, { syncDebounce: 500 });
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const { syncTabs = true, syncDebounce = 100 } = options;

  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Return initialValue in SSR context
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return parseStorageValue(item, initialValue);
    } catch (error) {
      if (import.meta.env.DEV) {
        logWarn(`Error reading localStorage key "${key}"`, { error });
      }
      return initialValue;
    }
  });

  /**
   * Set value in state and localStorage
   */
  const setValue = useCallback(
    (value: SetStateAction<T>): void => {
      try {
        // Handle functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, stringifyStorageValue(valueToStore));
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          logWarn(`Error setting localStorage key "${key}"`, { error });
        }
      }
    },
    [key, storedValue]
  );

  /**
   * Remove value from localStorage and reset to initialValue
   */
  const removeValue = useCallback((): void => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logWarn(`Error removing localStorage key "${key}"`, { error });
      }
    }
  }, [key, initialValue]);

  // Cross-tab synchronization
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined') return;

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleStorageChange = (e: StorageEvent): void => {
      // Only handle changes to this specific key from other tabs
      if (e.key !== key) return;

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
            logWarn(`Error parsing localStorage key "${key}"`, { error });
          }
        }
      }, syncDebounce);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, syncTabs, syncDebounce]);

  return [storedValue, setValue, removeValue];
}

// ============================================================================
// ADDITIONAL UTILITIES
// ============================================================================

/**
 * Get value from localStorage without using a hook
 * @template T
 * @param {string} key - LocalStorage key
 * @param {T} fallback - Fallback value if key doesn't exist
 * @returns {T} Value from localStorage or fallback
 * 
 * @example
 * const theme = getLocalStorageValue('theme', 'dark');
 */
export function getLocalStorageValue<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') {
      return fallback;
    }

    const item = window.localStorage.getItem(key);
    return parseStorageValue(item, fallback);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

/**
 * Set value in localStorage without using a hook
 * @param {string} key - LocalStorage key
 * @param {unknown} value - Value to store
 * @returns {boolean} True if successful, false otherwise
 * 
 * @example
 * setLocalStorageValue('theme', 'dark');
 */
export function setLocalStorageValue(key: string, value: unknown): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    window.localStorage.setItem(key, stringifyStorageValue(value));
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove value from localStorage without using a hook
 * @param {string} key - LocalStorage key
 * @returns {boolean} True if successful, false otherwise
 * 
 * @example
 * removeLocalStorageValue('theme');
 */
export function removeLocalStorageValue(key: string): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all values from localStorage
 * @returns {boolean} True if successful, false otherwise
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
    console.warn('Error clearing localStorage:', error);
    return false;
  }
}
