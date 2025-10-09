/**
 * @fileoverview Performance optimization utilities
 * @description Utilities for React memoization, profiling, and performance monitoring
 */

import { memo, useMemo, useCallback, useRef, useEffect, useState, ComponentType } from 'react';
import type { PropsComparisonFn, ComparatorFn, CalculationFn, CallbackFn } from '@/types/performance.types';

/**
 * Creates a memoized component with custom comparison
 * @param Component - Component to memoize
 * @param arePropsEqual - Custom props comparison function
 * @returns Memoized component
 * 
 * @example
 * const MemoizedCard = memoize(Card, (prevProps, nextProps) => 
 *   prevProps.id === nextProps.id && prevProps.data === nextProps.data
 * );
 */
export function memoize<P = any>(Component: ComponentType<P>, arePropsEqual?: PropsComparisonFn<P>) {
  return memo(Component, arePropsEqual);
}

/**
 * Creates a shallow comparison memoized component
 * Only re-renders if props reference changes (not deep equality)
 * @param Component - Component to memoize
 * @returns Memoized component
 * 
 * @example
 * export default shallowMemo(ExpensiveComponent);
 */
export function shallowMemo<P = any>(Component: ComponentType<P>) {
  return memo(Component);
}

/**
 * Memoizes expensive calculations
 * @param calculate - Calculation function
 * @param dependencies - Dependency array
 * @returns Memoized value
 * 
 * @example
 * const total = useMemoizedCalc(() => 
 *   transactions.reduce((sum, t) => sum + t.amount, 0),
 *   [transactions]
 * );
 */
export function useMemoizedCalc<T>(calculate: CalculationFn<T>, dependencies: React.DependencyList): T {
  return useMemo(calculate, dependencies);
}

/**
 * Memoizes callback functions
 * Prevents child re-renders when passing callbacks
 * @param callback - Callback function
 * @param dependencies - Dependency array
 * @returns Memoized callback
 * 
 * @example
 * const handleClick = useMemoizedCallback(() => {
 *   onClick(id);
 * }, [id, onClick]);
 */
export function useMemoizedCallback<T extends CallbackFn>(callback: T, dependencies: React.DependencyList): T {
  return useCallback(callback, dependencies);
}

/**
 * Tracks component render count (development only)
 * @param componentName - Name of component to track
 * @returns Render count
 * 
 * @example
 * const renderCount = useRenderCount('ExpensiveComponent');
 * console.log('Rendered', renderCount, 'times');
 */
import { logDebug } from './logger';

export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
    logDebug(`[Performance] ${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
}

/**
 * Measures component render time (development only)
 * @param componentName - Name of component to measure
 * 
 * @example
 * useRenderTime('ExpensiveComponent');
 */
export function useRenderTime(componentName: string): void {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (import.meta.env.DEV && renderTime > 16) { // >16ms = might cause frame drop
      console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    startTime.current = performance.now();
  });
}

/**
 * Debounces a value to prevent excessive updates
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 * 
 * @example
 * const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Throttles a function to limit execution rate
 * @param callback - Function to throttle
 * @param limit - Minimum time between executions (ms)
 * @returns Throttled function
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   // expensive scroll handler
 * }, 100);
 */
export function useThrottle<T extends CallbackFn>(callback: T, limit = 200): T {
  const inThrottle = useRef(false);
  
  return useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit]) as T;
}

/**
 * Memoizes array/object calculations to prevent reference changes
 * @param data - Data to stabilize
 * @param comparator - Optional custom comparison
 * @returns Stabilized reference
 * 
 * @example
 * const categories = useStableReference(
 *   transactions.map(t => t.category)
 * );
 */
export function useStableReference<T>(data: T, comparator?: ComparatorFn<T>): T {
  const dataRef = useRef(data);
  
  useMemo(() => {
    if (comparator) {
      if (!comparator(dataRef.current, data)) {
        dataRef.current = data;
      }
    } else {
      // Simple JSON comparison (works for simple objects/arrays)
      if (JSON.stringify(dataRef.current) !== JSON.stringify(data)) {
        dataRef.current = data;
      }
    }
  }, [data, comparator]);
  
  return dataRef.current;
}

/**
 * Prevents component from re-rendering more than once per frame
 * Useful for high-frequency updates (scroll, resize, etc.)
 * @param value - Value to update
 * @returns Frame-throttled value
 * 
 * @example
 * const scrollY = useFrameThrottle(currentScrollY);
 */
export function useFrameThrottle<T>(value: T): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      setThrottledValue(value);
    });
    
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);
  
  return throttledValue;
}

/**
 * Lazy initializes expensive state
 * @param initializer - State initialization function
 * @returns Initialized state
 * 
 * @example
 * const [data, setData] = useState(() => 
 *   useLazyState(() => calculateExpensiveInitialData())
 * );
 */
export function useLazyState<T>(initializer: CalculationFn<T>): T {
  return useMemo(initializer, []);
}

/**
 * Performance profiling decorator
 * Wraps a function to measure execution time
 * @param fn - Function to profile
 * @param label - Label for profiling output
 * @returns Profiled function
 * 
 * @example
 * const calculate = profileFunction(expensiveCalc, 'Calculation');
 */
export function profileFunction<T extends CallbackFn>(fn: T, label: string): T {
  return ((...args: Parameters<T>) => {
    if (!import.meta.env.DEV) {
      return fn(...args);
    }
    
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    logDebug(`[Profile] ${label}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  }) as T;
}

/**
 * Batch multiple state updates to prevent excessive re-renders
 * @param callback - Function containing state updates
 * 
 * @example
 * batchUpdates(() => {
 *   setState1(value1);
 *   setState2(value2);
 *   setState3(value3);
 * });
 */
export function batchUpdates(callback: () => void): void {
  // React 18+ automatically batches, but explicitly batch for older versions
  if (typeof queueMicrotask !== 'undefined') {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback);
  }
}

/**
 * Memoizes data filtering/transformation operations
 * @param data - Data array
 * @param filterFn - Filter function
 * @param transformFn - Transform function
 * @returns Filtered and transformed data
 * 
 * @example
 * const visibleTransactions = useMemoizedFilter(
 *   transactions,
 *   t => t.amount > 0,
 *   t => ({ ...t, formatted: formatCurrency(t.amount) })
 * );
 */
export function useMemoizedFilter<T, R = T>(
  data: T[], 
  filterFn: (item: T) => boolean,
  transformFn?: (item: T) => R
): (T | R)[] {
  return useMemo(() => {
    const filtered = data.filter(filterFn);
    return transformFn ? filtered.map(transformFn) : filtered;
  }, [data, filterFn, transformFn]);
}

export default {
  memoize,
  shallowMemo,
  useMemoizedCalc,
  useMemoizedCallback,
  useRenderCount,
  useRenderTime,
  useDebouncedValue,
  useThrottle,
  useStableReference,
  useFrameThrottle,
  useLazyState,
  profileFunction,
  batchUpdates,
  useMemoizedFilter
};
