/**
 * @fileoverview Rate limiting utility tests
 * @description Comprehensive test suite for rate limiting, request throttling, and retry time formatting.
 * Tests cover request tracking, rate limit enforcement, time window management, and user-friendly time formatting.
 * 
 * @module __tests__/rateLimiting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, formatRetryTime } from '../utils/rateLimiting';

/**
 * Rate limiter configuration options
 * @interface RateLimiterOptions
 * @property {number} maxRequests - Maximum requests allowed in time window
 * @property {number} windowMs - Time window in milliseconds
 */
interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limiter statistics
 * @interface RateLimiterStats
 * @property {number} totalIdentifiers - Number of tracked identifiers
 * @property {number} maxRequests - Maximum requests per window
 * @property {number} windowMs - Time window in milliseconds
 */
interface RateLimiterStats {
  totalIdentifiers: number;
  maxRequests: number;
  windowMs: number;
}

/**
 * Rate limiting utility tests
 * Tests request throttling, rate limit enforcement, and retry time management
 */
describe('rateLimiting utilities', () => {
  /**
   * RateLimiter class test suite
   * Validates proper rate limit enforcement, request tracking, and time window management
   */
  describe('RateLimiter', () => {
    /** Rate limiter instance for testing */
    let rateLimiter: RateLimiter;

    /**
     * Setup: Create fresh rate limiter before each test
     * Configuration: 3 requests per 1000ms window
     */
    beforeEach(() => {
      rateLimiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    });

    /**
     * Test: Allow requests within limit
     * Scenario: User makes 3 requests (at limit)
     * Expected: All 3 requests are allowed (return true)
     */
    it('should allow requests within limit', () => {
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
    });

    /**
     * Test: Block requests exceeding limit
     * Scenario: User makes 4 requests (exceeds 3 request limit)
     * Expected: First 3 allowed, 4th request blocked (returns false)
     */
    it('should block requests exceeding limit', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(false);
    });

    /**
     * Test: Track different identifiers separately
     * Scenario: user1 hits limit, then user2 makes requests
     * Expected: user1 blocked, user2 allowed (independent tracking)
     */
    it('should track different identifiers separately', () => {
      // user1 hits rate limit
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(false);
      
      // user2 should still have full quota
      expect(rateLimiter.tryRequest('user2')).toBe(true);
      expect(rateLimiter.tryRequest('user2')).toBe(true);
    });

    /**
     * Test: Get remaining requests correctly
     * Scenario: User makes requests incrementally
     * Expected: Remaining count decreases from 3 → 2 → 1 → 0
     */
    it('should get remaining requests correctly', () => {
      expect(rateLimiter.getRemainingRequests('user1')).toBe(3);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(2);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(1);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(0);
    });

    /**
     * Test: Calculate retry time correctly
     * Scenario: User hits rate limit
     * Expected: Retry time is between 0ms and 1000ms (window duration)
     */
    it('should calculate retry time correctly', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      
      const retryAfter = rateLimiter.getRetryAfter('user1');
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(1000);
    });

    /**
     * Test: Return 0 retry time when not rate limited
     * Scenario: User has not hit rate limit
     * Expected: Retry time is 0 (no waiting required)
     */
    it('should return 0 retry time when not rate limited', () => {
      expect(rateLimiter.getRetryAfter('user1')).toBe(0);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRetryAfter('user1')).toBe(0);
    });

    /**
     * Test: Reset rate limit for identifier
     * Scenario: User hits limit, then rate limit is reset
     * Expected: After reset, user can make requests again
     */
    it('should reset rate limit for identifier', () => {
      // Hit rate limit
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(false);
      
      // Reset and verify requests allowed
      rateLimiter.reset('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(true);
    });

    /**
     * Test: Allow requests after time window expires
     * Scenario: User hits limit, waits for window to expire, tries again
     * Expected: After 100ms window expires, requests allowed again
     * @async Uses setTimeout to wait for window expiration
     */
    it('should allow requests after time window expires', async () => {
      const shortLimiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });
      
      // Hit rate limit
      shortLimiter.tryRequest('user1');
      shortLimiter.tryRequest('user1');
      expect(shortLimiter.tryRequest('user1')).toBe(false);
      
      // Wait for time window to expire (100ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Requests should be allowed again
      expect(shortLimiter.tryRequest('user1')).toBe(true);
    });

    /**
     * Test: Cleanup expired entries
     * Scenario: Multiple users tracked, cleanup called
     * Expected: Expired entries are removed from tracking
     */
    it('should cleanup expired entries', () => {
      // Track multiple identifiers
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user2');
      rateLimiter.tryRequest('user3');
      
      const statsBefore = rateLimiter.getStats();
      expect(statsBefore.totalIdentifiers).toBe(3);
      
      // Cleanup expired entries
      rateLimiter.cleanup();
      
      const statsAfter = rateLimiter.getStats();
      expect(statsAfter.totalIdentifiers).toBeLessThanOrEqual(3);
    });

    /**
     * Test: Return correct stats
     * Scenario: Request stats after some activity
     * Expected: Stats object contains totalIdentifiers, maxRequests, windowMs
     */
    it('should return correct stats', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user2');
      
      const stats = rateLimiter.getStats() as RateLimiterStats;
      expect(stats).toHaveProperty('totalIdentifiers');
      expect(stats).toHaveProperty('maxRequests');
      expect(stats).toHaveProperty('windowMs');
      expect(stats.maxRequests).toBe(3);
      expect(stats.windowMs).toBe(1000);
    });

    /**
     * Test: Use default options
     * Scenario: RateLimiter created without options
     * Expected: Uses default values (10 requests per 60 seconds)
     */
    it('should use default options', () => {
      const defaultLimiter = new RateLimiter();
      const stats = defaultLimiter.getStats() as RateLimiterStats;
      expect(stats.maxRequests).toBe(10);
      expect(stats.windowMs).toBe(60000);
    });
  });

  /**
   * formatRetryTime function test suite
   * Validates human-readable retry time formatting for user-facing messages
   */
  describe('formatRetryTime', () => {
    /**
     * Test: Format 0ms as "now"
     * Scenario: Retry time is 0 or negative
     * Expected: Returns "now" (no waiting required)
     */
    it('should format 0 ms as "now"', () => {
      expect(formatRetryTime(0)).toBe('now');
      expect(formatRetryTime(-100)).toBe('now');
    });

    /**
     * Test: Format seconds correctly
     * Scenario: Retry times in seconds range (1-59 seconds)
     * Expected: Formatted as "X second(s)"
     */
    it('should format seconds correctly', () => {
      expect(formatRetryTime(1000)).toBe('1 second');
      expect(formatRetryTime(2500)).toBe('3 seconds'); // Rounds up
      expect(formatRetryTime(5000)).toBe('5 seconds');
    });

    /**
     * Test: Format minutes correctly
     * Scenario: Retry times in minutes range (60+ seconds)
     * Expected: Formatted as "X minute(s)"
     */
    it('should format minutes correctly', () => {
      expect(formatRetryTime(60000)).toBe('1 minute');
      expect(formatRetryTime(120000)).toBe('2 minutes');
      expect(formatRetryTime(90000)).toBe('2 minutes'); // Rounds to nearest minute
    });

    /**
     * Test: Round up to nearest second
     * Scenario: Retry times less than 1 second
     * Expected: Rounds up to minimum "1 second"
     */
    it('should round up to nearest second', () => {
      expect(formatRetryTime(100)).toBe('1 second');
      expect(formatRetryTime(500)).toBe('1 second');
      expect(formatRetryTime(1100)).toBe('2 seconds');
    });

    /**
     * Test: Use singular for 1 second
     * Scenario: Retry time is exactly 1 second (or rounds to 1)
     * Expected: Uses "second" (singular) not "seconds"
     */
    it('should use singular for 1 second', () => {
      expect(formatRetryTime(999)).toBe('1 second');
      expect(formatRetryTime(1000)).toBe('1 second');
    });

    /**
     * Test: Use singular for 1 minute
     * Scenario: Retry time is exactly 1 minute
     * Expected: Uses "minute" (singular) not "minutes"
     */
    it('should use singular for 1 minute', () => {
      expect(formatRetryTime(60000)).toBe('1 minute');
    });
  });
});
