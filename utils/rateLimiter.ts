/**
 * @fileoverview Rate Limiting & Request Optimization Utilities
 * @description Prevents API rate limit errors by throttling, batching, and deduplicating requests
 * Includes token bucket rate limiter, request deduplication, batching, and retry strategies
 */

/// <reference types="vite/client" />

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Configuration for RateLimiter
 */
export interface RateLimiterConfig {
  maxTokens?: number;
  refillRate?: number;
}

/**
 * Options for executing rate-limited requests
 */
export interface ExecuteOptions {
  priority?: number;
}

/**
 * Rate limiter status information
 */
export interface RateLimiterStatus {
  availableTokens: number;
  maxTokens: number;
  queueLength: number;
  utilization: string;
}

/**
 * Queued request item
 */
interface QueueItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
}

/**
 * Configuration for RequestDeduplicator
 */
export interface DeduplicatorConfig {
  cacheTTL?: number;
}

/**
 * Cached response data
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Request options for deduplication
 */
export interface RequestOptions {
  method?: string;
  body?: unknown;
}

/**
 * Deduplicator statistics
 */
export interface DeduplicatorStats {
  cacheSize: number;
  pendingRequests: number;
  cacheKeys: string[];
}

/**
 * Configuration for RequestBatcher
 */
export interface BatcherConfig {
  batchSize?: number;
  batchDelay?: number;
}

/**
 * Batch data structure
 */
interface Batch<T, R> {
  items: T[];
  promises: Array<{
    resolve: (value: R) => void;
    reject: (error: Error) => void;
  }>;
  processor: (items: T[]) => Promise<R[]>;
  timeout: NodeJS.Timeout | null;
}

/**
 * Retry options configuration
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: RetryError) => boolean;
}

/**
 * Error type for retry logic
 */
export interface RetryError extends Error {
  response?: {
    status: number;
    headers?: {
      get?: (key: string) => string | null;
    };
  };
  retryAfter?: number;
  status?: number;
}

// ============================================================================
// RateLimiter Class
// ============================================================================

/**
 * Rate limiter using token bucket algorithm
 * Controls request throughput to prevent API rate limiting
 * 
 * @example
 * ```typescript
 * const limiter = new RateLimiter({ maxTokens: 10, refillRate: 1 });
 * await limiter.execute(() => fetch('/api/data'));
 * ```
 */
export class RateLimiter {
  private maxTokens: number;
  private refillRate: number;
  private tokens: number;
  private lastRefill: number;
  private queue: QueueItem<unknown>[];
  private processing: boolean;

  constructor(config: RateLimiterConfig = {}) {
    this.maxTokens = config.maxTokens || 10; // Max requests per window
    this.refillRate = config.refillRate || 1; // Tokens added per second
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
  }

  /**
   * Refill tokens based on time elapsed
   * @private
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Execute request with rate limiting
   * @param fn - Async function to execute
   * @param options - Execution options (priority)
   * @returns Promise resolving to function result
   */
  async execute<T>(fn: () => Promise<T>, options: ExecuteOptions = {}): Promise<T> {
    const priority = options.priority || 0;
    
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, priority } as QueueItem<unknown>);
      this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const item = this.queue.shift();
        if (!item) continue;

        const { fn, resolve, reject } = item;

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          const retryError = error as RetryError;
          
          // Check if it's a rate limit error (429)
          if (retryError.status === 429 || retryError.message?.includes('rate limit')) {
            // Re-queue with delay
            const retryAfter = retryError.retryAfter || 5000;
            await new Promise(r => setTimeout(r, retryAfter));
            this.queue.unshift({ fn, resolve, reject, priority: -1 }); // Low priority retry
          } else {
            reject(error as Error);
          }
        }
      } else {
        // Wait for token refill
        const waitTime = (1 / this.refillRate) * 1000;
        await new Promise(r => setTimeout(r, waitTime));
      }
    }

    this.processing = false;
  }

  /**
   * Get current rate limiter status
   * @returns Status information
   */
  getStatus(): RateLimiterStatus {
    this.refillTokens();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      utilization: ((this.maxTokens - this.tokens) / this.maxTokens * 100).toFixed(1) + '%'
    };
  }

  /**
   * Clear queue and reset tokens
   */
  reset(): void {
    this.queue = [];
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

// ============================================================================
// RequestDeduplicator Class
// ============================================================================

/**
 * Request deduplication with caching
 * Prevents duplicate concurrent requests and caches GET responses
 * 
 * @example
 * ```typescript
 * const dedup = new RequestDeduplicator({ cacheTTL: 5000 });
 * const data = await dedup.execute('/api/users', () => fetchUsers());
 * ```
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<unknown>>;
  private cache: Map<string, CachedData<unknown>>;
  private cacheTTL: number;

  constructor(config: DeduplicatorConfig = {}) {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5000; // 5 seconds default
  }

  /**
   * Generate cache key from request parameters
   * @private
   */
  private generateKey(url: string, options: RequestOptions = {}): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Execute deduplicated request
   * @param url - Request URL
   * @param fn - Async function to execute
   * @param options - Request options
   * @returns Promise resolving to request result
   */
  async execute<T>(url: string, fn: () => Promise<T>, options: RequestOptions = {}): Promise<T> {
    const key = this.generateKey(url, options);

    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get(key) as CachedData<T> | undefined;
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    // Execute new request
    const promise = fn()
      .then(result => {
        // Cache GET responses
        if (!options.method || options.method === 'GET') {
          this.cache.set(key, {
            data: result,
            timestamp: Date.now()
          });
        }
        return result;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Invalidate cache for URL pattern
   * @param pattern - String or RegExp pattern to match cache keys
   */
  invalidate(pattern: string | RegExp): void {
    if (typeof pattern === 'string') {
      this.cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Statistics about cache and pending requests
   */
  getStats(): DeduplicatorStats {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}

// ============================================================================
// RequestBatcher Class
// ============================================================================

/**
 * Request batcher for bulk operations
 * Automatically batches multiple requests into a single bulk operation
 * 
 * @example
 * ```typescript
 * const batcher = new RequestBatcher({ batchSize: 10, batchDelay: 100 });
 * const result = await batcher.add('users', userId, (ids) => fetchUsersBatch(ids));
 * ```
 */
export class RequestBatcher {
  private batchSize: number;
  private batchDelay: number;
  private batches: Map<string, Batch<unknown, unknown>>;

  constructor(config: BatcherConfig = {}) {
    this.batchSize = config.batchSize || 10;
    this.batchDelay = config.batchDelay || 100; // ms
    this.batches = new Map();
  }

  /**
   * Add request to batch
   * @param batchKey - Batch identifier
   * @param item - Item to batch
   * @param processor - Function to process entire batch
   * @returns Promise resolving to result for this item
   */
  add<T, R>(batchKey: string, item: T, processor: (items: T[]) => Promise<R[]>): Promise<R> {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, {
        items: [],
        promises: [],
        processor: processor as (items: unknown[]) => Promise<unknown[]>,
        timeout: null
      });
    }

    const batch = this.batches.get(batchKey)!;

    return new Promise<R>((resolve, reject) => {
      batch.items.push(item);
      batch.promises.push({ resolve: resolve as (value: unknown) => void, reject });

      // Clear existing timeout
      if (batch.timeout) {
        clearTimeout(batch.timeout);
      }

      // Set new timeout or execute if batch is full
      if (batch.items.length >= this.batchSize) {
        this.executeBatch(batchKey);
      } else {
        batch.timeout = setTimeout(() => {
          this.executeBatch(batchKey);
        }, this.batchDelay);
      }
    });
  }

  /**
   * Execute batch
   * @private
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.items.length === 0) return;

    const { items, promises, processor } = batch;
    
    // Clear batch
    this.batches.delete(batchKey);

    try {
      const results = await processor(items);
      
      // Resolve individual promises
      results.forEach((result, index) => {
        if (promises[index]) {
          promises[index].resolve(result);
        }
      });
    } catch (error) {
      // Reject all promises
      promises.forEach(p => p.reject(error as Error));
    }
  }

  /**
   * Force flush all batches immediately
   * @returns Promise that resolves when all batches are flushed
   */
  async flush(): Promise<void> {
    const batchKeys = Array.from(this.batches.keys());
    await Promise.all(batchKeys.map(key => this.executeBatch(key)));
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Exponential backoff retry strategy
 * Retries failed requests with increasing delays
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Promise resolving to function result
 * 
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 10000;
  const shouldRetry = options.shouldRetry || ((error: RetryError) => {
    // Retry on network errors or 5xx errors
    return !error.response || error.response.status >= 500 || error.response.status === 429;
  });

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const retryError = error as RetryError;

      if (attempt === maxRetries || !shouldRetry(retryError)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
      const delay = exponentialDelay + jitter;

      // Check for Retry-After header
      const retryAfter = retryError.response?.headers?.get?.('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;

      console.warn(
        `Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(waitTime)}ms...`,
        retryError.message
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Throttle function execution
 * Ensures function is called at most once per delay period
 * 
 * @param fn - Function to throttle
 * @param delay - Minimum delay between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>): Promise<ReturnType<T>> {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return Promise.resolve(fn(...args));
    } else {
      if (timeout) clearTimeout(timeout);
      
      return new Promise(resolve => {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          resolve(fn(...args));
        }, delay - timeSinceLastCall);
      });
    }
  };
}

/**
 * Debounce function execution
 * Delays execution until after delay period of inactivity
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timeout) clearTimeout(timeout);
    
    return new Promise(resolve => {
      timeout = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
}

// ============================================================================
// Global Instances (Singleton Pattern)
// ============================================================================

/** Global rate limiter instance - 120 req/min */
export const globalRateLimiter = new RateLimiter({
  maxTokens: 20, // 20 requests per window
  refillRate: 2, // 2 tokens per second = ~120 req/min
});

/** Global request deduplicator with 5s cache */
export const globalDeduplicator = new RequestDeduplicator({
  cacheTTL: 5000, // 5 second cache
});

/** Global request batcher */
export const globalBatcher = new RequestBatcher({
  batchSize: 10,
  batchDelay: 100,
});

/**
 * Monitor rate limiter status in development
 */
if (import.meta.env.DEV) {
  setInterval(() => {
    const status = globalRateLimiter.getStatus();
    if (status.queueLength > 5) {
      console.warn('⚠️ Rate limiter queue building up:', status);
    }
  }, 5000);
}
