import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
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
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                try {
                    if (e.newValue === null) return;
                    try {
                        setStoredValue(JSON.parse(e.newValue));
                    } catch {
                        // Fallback to raw value if not JSON
                        setStoredValue(e.newValue);
                    }
                } catch (error) {
                    console.warn(`Error parsing localStorage key "${key}":`, error);
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
    }, [key]);

    return [storedValue, setValue];
}