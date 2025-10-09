/**
 * Check if performance logging is enabled
 * @returns True if performance logging is enabled in localStorage
 */
export function perfEnabled(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("apex-finance:perf-logs") === "true";
  } catch {
    return false;
  }
}

/**
 * Log performance metrics to console
 * @param label - Label for the performance measurement
 * @param ms - Duration in milliseconds
 */
export function perfLog(label: string, ms: number): void {
  if (!perfEnabled()) return;
  try {
    // eslint-disable-next-line no-console
    console.log(`[perf] ${label}: ${typeof ms === "number" ? ms.toFixed(1) : ms}ms`);
  } catch {
    // noop
  }
}