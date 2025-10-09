/**
 * @fileoverview Performance logging utilities
 * @description Provides lightweight performance measurement utilities that can be
 * enabled/disabled via localStorage. Used for measuring render times, API latency,
 * and other performance metrics during development and debugging.
 * 
 * @module utils/perf
 * 
 * @example
 * ```typescript
 * import { perfLog, perfEnabled } from '@/utils/perf';
 * 
 * // Enable performance logging
 * localStorage.setItem('apex-finance:perf-logs', 'true');
 * 
 * // Measure operation
 * const start = performance.now();
 * await expensiveOperation();
 * perfLog('expensive-operation', performance.now() - start);
 * 
 * // Conditional logging
 * if (perfEnabled()) {
 *   // Do expensive perf measurement
 * }
 * ```
 */

/**
 * Check if performance logging is enabled
 * 
 * @description Checks localStorage for the 'apex-finance:perf-logs' flag.
 * Use this to conditionally enable expensive performance measurements.
 * 
 * @returns True if performance logging is enabled in localStorage
 * 
 * @example
 * ```typescript
 * if (perfEnabled()) {
 *   const metrics = collectDetailedMetrics();
 *   console.log('Metrics:', metrics);
 * }
 * ```
 * 
 * @public
 */
export function perfEnabled(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("apex-finance:perf-logs") === "true";
  } catch {
    return false;
  }
}

import { logPerformance } from './logger';

/**
 * Log performance metrics to console
 * 
 * @description Logs performance measurements if performance logging is enabled.
 * Uses the logger utility for consistent formatting.
 * 
 * @param label - Label for the performance measurement (e.g., 'component-render', 'api-call')
 * @param ms - Duration in milliseconds
 * 
 * @example
 * ```typescript
 * const start = performance.now();
 * await fetchData();
 * perfLog('data-fetch', performance.now() - start);
 * // Output: [PERF] data-fetch: 245.3ms
 * ```
 * 
 * @public
 */
export function perfLog(label: string, ms: number): void {
  if (!perfEnabled()) return;
  try {
    logPerformance(label, typeof ms === "number" ? ms : Number(ms));
  } catch {
    // noop
  }
}