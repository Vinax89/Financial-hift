/**
 * @fileoverview Debouncing hooks for performance optimization
 * @description Provides debouncing utilities for values and callbacks
 * to reduce unnecessary re-renders and API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Generic function type
 */
type AnyFunction = (...args: any[]) => any;

/**
 * Debounced callback function type
 */
export type DebouncedFunction<T extends AnyFunction> = (
  ...args: Parameters<T>
) => void;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Debounce a value - delays updates until value stops changing
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {T} Debounced value
 * 
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * @example
 * const debouncedValue = useDebounce<string>(inputValue, 500);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function - delays execution until calls stop
 * @template T
 * @param {T} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {DebouncedFunction<T>} Debounced callback function
 * 
 * @example
 * const debouncedSave = useDebouncedCallback(() => saveData(), 500);
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 300);
 */
export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create stable debounced function
  const debouncedCallback = useCallback(
    (...args: Parameters<T>): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounce a callback with a cancel function
 * @template T
 * @param {T} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} Object with debounced callback and cancel function
 * 
 * @example
 * const { callback: debouncedSave, cancel } = useDebouncedCallbackWithCancel(
 *   () => saveData(),
 *   500
 * );
 * 
 * // Later, cancel if needed
 * cancel();
 */
export function useDebouncedCallbackWithCancel<T extends AnyFunction>(
  callback: T,
  delay: number
): {
  callback: DebouncedFunction<T>;
  cancel: () => void;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel function
  const cancel = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Create stable debounced function
  const debouncedCallback = useCallback(
    (...args: Parameters<T>): void => {
      cancel();

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { callback: debouncedCallback, cancel };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a debounced function outside of React (not a hook)
 * @template T
 * @param {T} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {DebouncedFunction<T> & { cancel: () => void }} Debounced function with cancel
 * 
 * @example
 * const debouncedLog = debounce((msg: string) => console.log(msg), 300);
 * debouncedLog('Hello'); // Will only log after 300ms of no calls
 * debouncedLog.cancel(); // Cancel pending execution
 */
export function debounce<T extends AnyFunction>(
  func: T,
  delay: number
): DebouncedFunction<T> & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFn = (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };

  debouncedFn.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn as DebouncedFunction<T> & { cancel: () => void };
}
