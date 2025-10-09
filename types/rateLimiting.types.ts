/**
 * Type definitions for Rate Limiting utilities
 */

/**
 * Configuration options for RateLimiter
 */
export interface RateLimiterOptions {
  /** Maximum number of requests allowed in the time window */
  maxRequests?: number;
  /** Time window in milliseconds (default: 60000ms = 1 minute) */
  windowMs?: number;
}

/**
 * Configuration options for useRateLimit hook
 */
export interface UseRateLimitOptions extends RateLimiterOptions {
  /** Unique identifier for rate limiting (userId, IP, etc.) */
  identifier?: string;
}

/**
 * Statistics about the rate limiter state
 */
export interface RateLimiterStats {
  /** Total number of unique identifiers being tracked */
  totalIdentifiers: number;
  /** Maximum requests allowed per window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Return type for useRateLimit hook
 */
export interface UseRateLimitReturn {
  /** Check if a request can be made and consume a slot if allowed */
  canMakeRequest: () => boolean;
  /** Get the number of remaining requests in the current window */
  getRemainingRequests: () => number;
  /** Get milliseconds until next request is allowed */
  getRetryAfter: () => number;
  /** Reset the rate limit for the identifier */
  reset: () => void;
}
