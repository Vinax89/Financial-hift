/**
 * Rate Limiting Utility
 * Prevents API abuse by limiting the number of requests per time window
 * 
 * Usage:
 * import { RateLimiter, useRateLimit } from '@/utils/rateLimiting';
 * 
 * const rateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
 * 
 * if (rateLimiter.tryRequest('user123')) {
 *   await apiCall();
 * } else {
 *   // Show rate limit error
 * }
 */

/**
 * Rate Limiter Class
 * Tracks requests per identifier within a time window
 */
export class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 10;
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.requests = new Map(); // Map of identifier -> array of timestamps
  }

  /**
   * Try to make a request
   * @param {string} identifier - Unique identifier (userId, IP, etc.)
   * @returns {boolean} Whether the request is allowed
   */
  tryRequest(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the time window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (userRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    userRequests.push(now);
    this.requests.set(identifier, userRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.1) {
      this.cleanup();
    }

    return true;
  }

  /**
   * Check remaining requests without consuming one
   * @param {string} identifier - Unique identifier
   * @returns {number} Number of remaining requests
   */
  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = (this.requests.get(identifier) || [])
      .filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - userRequests.length);
  }

  /**
   * Get time until next available request
   * @param {string} identifier - Unique identifier
   * @returns {number} Milliseconds until next request allowed (0 if allowed now)
   */
  getRetryAfter(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = (this.requests.get(identifier) || [])
      .filter(timestamp => timestamp > windowStart);

    if (userRequests.length < this.maxRequests) {
      return 0;
    }

    // Time until oldest request expires
    const oldestRequest = Math.min(...userRequests);
    return Math.max(0, oldestRequest + this.windowMs - now);
  }

  /**
   * Reset rate limit for an identifier
   * @param {string} identifier - Unique identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }

  /**
   * Get statistics
   * @returns {Object} Stats about rate limiter
   */
  getStats() {
    return {
      totalIdentifiers: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}

/**
 * React Hook for Rate Limiting
 * 
 * Usage:
 * const { canMakeRequest, getRemainingRequests, getRetryAfter } = useRateLimit({
 *   maxRequests: 5,
 *   windowMs: 60000,
 *   identifier: userId
 * });
 * 
 * if (canMakeRequest()) {
 *   await apiCall();
 * } else {
 *   const retryAfter = getRetryAfter();
 *   showError(`Please wait ${Math.ceil(retryAfter / 1000)} seconds`);
 * }
 */
import { useRef, useCallback } from 'react';

export function useRateLimit(options = {}) {
  const { maxRequests = 10, windowMs = 60000, identifier = 'default' } = options;
  
  const rateLimiterRef = useRef(null);
  
  if (!rateLimiterRef.current) {
    rateLimiterRef.current = new RateLimiter({ maxRequests, windowMs });
  }

  const canMakeRequest = useCallback(() => {
    return rateLimiterRef.current.tryRequest(identifier);
  }, [identifier]);

  const getRemainingRequests = useCallback(() => {
    return rateLimiterRef.current.getRemainingRequests(identifier);
  }, [identifier]);

  const getRetryAfter = useCallback(() => {
    return rateLimiterRef.current.getRetryAfter(identifier);
  }, [identifier]);

  const reset = useCallback(() => {
    rateLimiterRef.current.reset(identifier);
  }, [identifier]);

  return {
    canMakeRequest,
    getRemainingRequests,
    getRetryAfter,
    reset
  };
}

/**
 * Global Rate Limiter instances for common use cases
 */
export const GlobalRateLimiters = {
  // AI API calls - 5 requests per minute
  ai: new RateLimiter({ maxRequests: 5, windowMs: 60000 }),
  
  // Search/Filter - 30 requests per minute
  search: new RateLimiter({ maxRequests: 30, windowMs: 60000 }),
  
  // Data mutations - 20 requests per minute
  mutations: new RateLimiter({ maxRequests: 20, windowMs: 60000 }),
  
  // File uploads - 10 per hour
  uploads: new RateLimiter({ maxRequests: 10, windowMs: 3600000 }),
};

/**
 * Format retry time for user display
 * @param {number} ms - Milliseconds until retry
 * @returns {string} Formatted time
 */
export function formatRetryTime(ms) {
  if (ms <= 0) return 'now';
  
  const seconds = Math.ceil(ms / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export default {
  RateLimiter,
  useRateLimit,
  GlobalRateLimiters,
  formatRetryTime
};
