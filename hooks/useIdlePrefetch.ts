/**
 * @fileoverview Idle prefetch hook for performance optimization
 * @description Prefetches resources when browser is idle to improve perceived performance
 */

import { useEffect, DependencyList } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Import function that can be prefetched
 */
export type ImportFunction = () => Promise<any>;

/**
 * Idle callback ID type (browser-specific)
 */
type IdleCallbackId = number;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Run function when browser is idle
 * @param fn - Function to run when idle
 * @returns Callback ID for cancellation
 */
function runWhenIdle(fn: () => void): IdleCallbackId {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(fn, { timeout: 3000 });
  }
  return (typeof window !== "undefined" ? window.setTimeout(fn, 1500) : 0) as any as IdleCallbackId;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Prefetch imports when browser is idle
 * 
 * @param importFns - Array of import functions to prefetch
 * @param deps - Dependency array (like useEffect)
 * 
 * @example
 * ```tsx
 * function App() {
 *   // Prefetch heavy components when idle
 *   useIdlePrefetch([
 *     () => import('./components/Dashboard'),
 *     () => import('./components/Analytics'),
 *     () => import('./components/Reports')
 *   ], []);
 *   
 *   return <div>App loaded, heavy components prefetching...</div>;
 * }
 * ```
 */
export function useIdlePrefetch(
  importFns: ImportFunction[] = [], 
  deps: DependencyList = []
): void {
  useEffect(() => {
    if (!Array.isArray(importFns) || importFns.length === 0) return;

    const timeouts: any[] = [];
    
    const schedule = (): void => {
      importFns.forEach((imp, idx) => {
        if (typeof imp === "function") {
          const h = setTimeout(() => {
            try { 
              imp(); 
            } catch { 
              // Silently ignore prefetch errors
            }
          }, 120 * idx);
          timeouts.push(h);
        }
      });
    };

    const idleHandle = runWhenIdle(schedule);

    return () => {
      // Cleanup: cancel idle callback
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        try { 
          window.cancelIdleCallback(idleHandle); 
        } catch { 
          // Ignore cancellation errors
        }
      } else {
        clearTimeout(idleHandle);
      }
      
      // Cancel all scheduled timeouts
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

