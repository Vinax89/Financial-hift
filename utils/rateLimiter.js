/**
 * @fileoverview Rate Limiting & Request Optimization Utilities
 * @description Prevents API rate limit errors by throttling, batching, and deduplicating requests
 */

/**
 * Rate limiter using token bucket algorithm
 * @class RateLimiter
 */
export class RateLimiter {
  constructor(config = {}) {
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
  refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Execute request with rate limiting
   * @param {Function} fn - Function to execute
   * @param {Object} options - Execution options
   * @returns {Promise} Result of function execution
   */
  async execute(fn, options = {}) {
    const priority = options.priority || 0;
    
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, priority });
      this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
      this.processQueue();
    });
  }

  /**
   * Process queued requests
   * @private
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const { fn, resolve, reject } = this.queue.shift();

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          // Check if it's a rate limit error (429)
          if (error.status === 429 || error.message?.includes('rate limit')) {
            // Re-queue with delay
            const retryAfter = error.retryAfter || 5000;
            await new Promise(r => setTimeout(r, retryAfter));
            this.queue.unshift({ fn, resolve, reject, priority: -1 }); // Low priority retry
          } else {
            reject(error);
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
   * Get current status
   * @returns {Object} Status information
   */
  getStatus() {
    this.refillTokens();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      utilization: ((this.maxTokens - this.tokens) / this.maxTokens * 100).toFixed(1) + '%'
    };
  }

  /**
   * Clear queue and reset
   */
  reset() {
    this.queue = [];
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

/**
 * Request deduplication with caching
 * @class RequestDeduplicator
 */
export class RequestDeduplicator {
  constructor(config = {}) {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5000; // 5 seconds default
  }

  /**
   * Generate cache key from request parameters
   * @private
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Execute deduplicated request
   * @param {string} url - Request URL
   * @param {Function} fn - Function to execute
   * @param {Object} options - Options
   * @returns {Promise} Request result
   */
  async execute(url, fn, options = {}) {
    const key = this.generateKey(url, options);

    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
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
   * @param {string|RegExp} pattern - URL pattern to invalidate
   */
  invalidate(pattern) {
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
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Request batcher for bulk operations
 * @class RequestBatcher
 */
export class RequestBatcher {
  constructor(config = {}) {
    this.batchSize = config.batchSize || 10;
    this.batchDelay = config.batchDelay || 100; // ms
    this.batches = new Map();
  }

  /**
   * Add request to batch
   * @param {string} batchKey - Batch identifier
   * @param {*} item - Item to batch
   * @param {Function} processor - Batch processor function
   * @returns {Promise} Result for this item
   */
  add(batchKey, item, processor) {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, {
        items: [],
        promises: [],
        processor,
        timeout: null
      });
    }

    const batch = this.batches.get(batchKey);

    return new Promise((resolve, reject) => {
      batch.items.push(item);
      batch.promises.push({ resolve, reject });

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
  async executeBatch(batchKey) {
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
      promises.forEach(p => p.reject(error));
    }
  }

  /**
   * Force flush all batches
   */
  async flush() {
    const batchKeys = Array.from(this.batches.keys());
    await Promise.all(batchKeys.map(key => this.executeBatch(key)));
  }
}

/**
 * Exponential backoff retry strategy
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of function
 */
export async function retryWithBackoff(fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 10000;
  const shouldRetry = options.shouldRetry || ((error) => {
    // Retry on network errors or 5xx errors
    return !error.response || error.response.status >= 500 || error.response.status === 429;
  });

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
      const delay = exponentialDelay + jitter;

      // Check for Retry-After header
      const retryAfter = error.response?.headers?.get?.('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;

      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(waitTime)}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  let timeout = null;

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    } else {
      if (timeout) clearTimeout(timeout);
      
      return new Promise(resolve => {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          resolve(fn.apply(this, args));
        }, delay - timeSinceLastCall);
      });
    }
  };
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeout = null;

  return function debounced(...args) {
    if (timeout) clearTimeout(timeout);
    
    return new Promise(resolve => {
      timeout = setTimeout(() => {
        resolve(fn.apply(this, args));
      }, delay);
    });
  };
}

// ============================================================================
// Global instances (singleton pattern)
// ============================================================================

/** Global rate limiter instance */
export const globalRateLimiter = new RateLimiter({
  maxTokens: 20, // 20 requests per window
  refillRate: 2, // 2 tokens per second = ~120 req/min
});

/** Global request deduplicator */
export const globalDeduplicator = new RequestDeduplicator({
  cacheTTL: 5000, // 5 second cache
});

/** Global request batcher */
export const globalBatcher = new RequestBatcher({
  batchSize: 10,
  batchDelay: 100,
});

/**
 * Monitor rate limiter status
 */
if (import.meta.env.DEV) {
  setInterval(() => {
    const status = globalRateLimiter.getStatus();
    if (status.queueLength > 5) {
      console.warn('⚠️ Rate limiter queue building up:', status);
    }
  }, 5000);
}
