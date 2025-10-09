/**
 * @fileoverview Type definitions for performance utilities
 */

import type { ComponentType, DependencyList } from 'react';

/**
 * Props comparison function for React.memo
 */
export type PropsComparisonFn<P = any> = (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean;

/**
 * Generic comparator function
 */
export type ComparatorFn<T> = (prev: T, next: T) => boolean;

/**
 * Calculation function for memoization
 */
export type CalculationFn<T> = () => T;

/**
 * Generic callback function
 */
export type CallbackFn<TArgs extends unknown[] = unknown[], TReturn = void> = (...args: TArgs) => TReturn;

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  lastRenderTime: number;
}

/**
 * Profiling result
 */
export interface ProfilingResult<T> {
  result: T;
  duration: number;
  timestamp: number;
}
