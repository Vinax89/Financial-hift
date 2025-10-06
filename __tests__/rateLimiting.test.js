import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, formatRetryTime } from '../utils/rateLimiting';

describe('rateLimiting utilities', () => {
  describe('RateLimiter', () => {
    let rateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(false);
    });

    it('should track different identifiers separately', () => {
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(true);
      expect(rateLimiter.tryRequest('user1')).toBe(false);
      
      // Different user should still be allowed
      expect(rateLimiter.tryRequest('user2')).toBe(true);
      expect(rateLimiter.tryRequest('user2')).toBe(true);
    });

    it('should get remaining requests correctly', () => {
      expect(rateLimiter.getRemainingRequests('user1')).toBe(3);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(2);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(1);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(0);
    });

    it('should calculate retry time correctly', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      
      const retryAfter = rateLimiter.getRetryAfter('user1');
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(1000);
    });

    it('should return 0 retry time when not rate limited', () => {
      expect(rateLimiter.getRetryAfter('user1')).toBe(0);
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.getRetryAfter('user1')).toBe(0);
    });

    it('should reset rate limit for identifier', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(false);
      
      rateLimiter.reset('user1');
      expect(rateLimiter.tryRequest('user1')).toBe(true);
    });

    it('should allow requests after time window expires', async () => {
      const shortLimiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });
      
      shortLimiter.tryRequest('user1');
      shortLimiter.tryRequest('user1');
      expect(shortLimiter.tryRequest('user1')).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(shortLimiter.tryRequest('user1')).toBe(true);
    });

    it('should cleanup expired entries', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user2');
      rateLimiter.tryRequest('user3');
      
      const statsBefore = rateLimiter.getStats();
      expect(statsBefore.totalIdentifiers).toBe(3);
      
      rateLimiter.cleanup();
      
      const statsAfter = rateLimiter.getStats();
      expect(statsAfter.totalIdentifiers).toBeLessThanOrEqual(3);
    });

    it('should return correct stats', () => {
      rateLimiter.tryRequest('user1');
      rateLimiter.tryRequest('user2');
      
      const stats = rateLimiter.getStats();
      expect(stats).toHaveProperty('totalIdentifiers');
      expect(stats).toHaveProperty('maxRequests');
      expect(stats).toHaveProperty('windowMs');
      expect(stats.maxRequests).toBe(3);
      expect(stats.windowMs).toBe(1000);
    });

    it('should use default options', () => {
      const defaultLimiter = new RateLimiter();
      const stats = defaultLimiter.getStats();
      expect(stats.maxRequests).toBe(10);
      expect(stats.windowMs).toBe(60000);
    });
  });

  describe('formatRetryTime', () => {
    it('should format 0 ms as "now"', () => {
      expect(formatRetryTime(0)).toBe('now');
      expect(formatRetryTime(-100)).toBe('now');
    });

    it('should format seconds correctly', () => {
      expect(formatRetryTime(1000)).toBe('1 second');
      expect(formatRetryTime(2500)).toBe('3 seconds');
      expect(formatRetryTime(5000)).toBe('5 seconds');
    });

    it('should format minutes correctly', () => {
      expect(formatRetryTime(60000)).toBe('1 minute');
      expect(formatRetryTime(120000)).toBe('2 minutes');
      expect(formatRetryTime(90000)).toBe('2 minutes');
    });

    it('should round up to nearest second', () => {
      expect(formatRetryTime(100)).toBe('1 second');
      expect(formatRetryTime(500)).toBe('1 second');
      expect(formatRetryTime(1100)).toBe('2 seconds');
    });

    it('should use singular for 1 second', () => {
      expect(formatRetryTime(999)).toBe('1 second');
      expect(formatRetryTime(1000)).toBe('1 second');
    });

    it('should use singular for 1 minute', () => {
      expect(formatRetryTime(60000)).toBe('1 minute');
    });
  });
});
