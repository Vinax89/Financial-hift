/**
 * @fileoverview API utility functions for error handling and retry logic
 * @description Provides utilities for handling API requests with automatic retries,
 * exponential backoff, and jitter to prevent thundering herd problems.
 * 
 * @module utils/api
 * 
 * @example
 * ```typescript
 * import { retryWithBackoff } from '@/utils/api';
 * 
 * // Simple retry
 * const data = await retryWithBackoff(() => fetchData());
 * 
 * // Custom retry options
 * const data = await retryWithBackoff(
 *   () => fetchData(),
 *   {
 *     retries: 5,
 *     baseDelay: 1000,
 *     factor: 2,
 *     isRetryable: (err) => err.status >= 500
 *   }
 * );
 * ```
 */

/**
 * Sleep for a specified duration
 * 
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the specified duration
 * 
 * @example
 * ```typescript
 * await sleep(1000); // Wait 1 second
 * ```
 * 
 * @public
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Options for retry with exponential backoff
 * 
 * @property retries - Maximum number of retry attempts (default: 3)
 * @property baseDelay - Base delay in milliseconds (default: 300)
 * @property factor - Exponential backoff multiplier (default: 2)
 * @property jitter - Add random jitter to delay (default: true)
 * @property isRetryable - Function to determine if error is retryable (default: always true)
 */
interface RetryOptions {
  retries?: number;
  baseDelay?: number;
  factor?: number;
  jitter?: boolean;
  isRetryable?: (error: any) => boolean;
}

/**
 * Retry a function with exponential backoff
 * 
 * @description Executes the provided function, retrying on failure with exponential
 * backoff and optional jitter. Useful for handling transient network errors and
 * rate limiting (429 errors).
 * 
 * @typeParam T - The return type of the function being retried
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function's return value
 * @throws The last error if all retries are exhausted
 * 
 * @remarks
 * Retry delays use exponential backoff: baseDelay * (factor ^ attempt)
 * Jitter adds randomness (0-100ms) to prevent thundering herd
 * 
 * @example
 * ```typescript
 * // Retry API call with defaults (3 retries, 300ms base delay)
 * const data = await retryWithBackoff(() => api.getData());
 * 
 * // Custom configuration
 * const data = await retryWithBackoff(
 *   () => api.getData(),
 *   {
 *     retries: 5,
 *     baseDelay: 1000,
 *     factor: 2,
 *     jitter: true,
 *     isRetryable: (err) => {
 *       // Only retry rate limits and server errors
 *       return err.status === 429 || err.status >= 500;
 *     }
 *   }
 * );
 * ```
 * 
 * @public
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    baseDelay = 300,
    factor = 2,
    jitter = true,
    isRetryable = () => true,
  } = options;

  let attempt = 0;
  let delay = baseDelay;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries || !isRetryable(err)) {
        throw err;
      }
      const jitterAmount = jitter ? Math.random() * 100 : 0;
      await sleep(delay + jitterAmount);
      delay *= factor;
    }
  }
}
