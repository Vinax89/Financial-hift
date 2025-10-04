import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

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

export function useDebouncedCallback(callback, delay) {
    const [debounceTimer, setDebounceTimer] = useState(null);

    const debouncedCallback = (...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);
        
        setDebounceTimer(newTimer);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return debouncedCallback;
}