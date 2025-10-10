/**
 * @fileoverview LocalStorage hook with SSR support and sync across tabs
 * @description Provides persistent state management using localStorage
 * with automatic JSON serialization and cross-tab synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import { logWarn } from '@/utils/logger.js';

/**
 * Persist state to localStorage with optimized cross-tab sync
 * @param {string} key - LocalStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @param {Object} options - Configuration options
 * @param {boolean} options.syncTabs - Enable cross-tab sync (default: true)
 * @param {number} options.syncDebounce - Debounce sync events in ms (default: 100)
 * @returns {[*, Function]} Tuple of [value, setValue]
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * const [data, setData] = useLocalStorage('data', {}, { syncDebounce: 500 });
 */
export function useLocalStorage(key, initialValue, options = {}) {
    const { syncTabs = true, syncDebounce = 100 } = options;
    
    const [storedValue, setStoredValue] = useState(() => {
        try {
            if (typeof window === 'undefined') {
                return initialValue;
            }
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;
            try {
                return JSON.parse(item);
            } catch {
                // Fallback: accept raw string values written elsewhere
                return item;
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                logWarn(`Error reading localStorage key "${key}"`, { error });
            }
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            setStoredValue(value);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                logWarn(`Error setting localStorage key "${key}"`, { error });
            }
        }
    }, [key]);

    useEffect(() => {
        if (!syncTabs || typeof window === 'undefined') return;

        let debounceTimer = null;
        
        const handleStorageChange = (e) => {
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
                    
                    try {
                        const parsed = JSON.parse(e.newValue);
                        
                        // Only update if value actually changed
                        setStoredValue(prev => {
                            if (JSON.stringify(prev) === JSON.stringify(parsed)) {
                                return prev; // No change, prevent re-render
                            }
                            return parsed;
                        });
                    } catch {
                        // Fallback to raw value if not JSON
                        setStoredValue(e.newValue);
                    }
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

    return [storedValue, setValue];
}