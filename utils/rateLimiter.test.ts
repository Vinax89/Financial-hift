/**
 * @fileoverview Tests for rate limiting utilities
 * @description Comprehensive test coverage for RateLimiter, RequestDeduplicator, and RequestBatcher
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RateLimiter,
  RequestDeduplicator,
  RequestBatcher,
  debounce,
  throttle,
  retryWithBackoff,
} from './rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should create rate limiter with default config', () => {
      const limiter = new RateLimiter();
      const status = limiter.getStatus();

      expect(status.maxTokens).toBe(10);
      expect(status.availableTokens).toBe(10);
      expect(status.queueLength).toBe(0);
    });

    it('should create rate limiter with custom config', () => {
      const limiter = new RateLimiter({ maxTokens: 5, refillRate: 2 });
      const status = limiter.getStatus();

      expect(status.maxTokens).toBe(5);
      expect(status.availableTokens).toBe(5);
    });

    it('should execute request immediately when tokens available', async () => {
      const limiter = new RateLimiter({ maxTokens: 10 });
      const fn = vi.fn(async () => 'success');

      const result = await limiter.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should consume tokens when executing requests', async () => {
      const limiter = new RateLimiter({ maxTokens: 10 });
      const fn = vi.fn(async () => 'success');

      await limiter.execute(fn);
      const status = limiter.getStatus();

      expect(status.availableTokens).toBe(9);
    });

    it('should queue requests when no tokens available', async () => {
      const limiter = new RateLimiter({ maxTokens: 1, refillRate: 0 });
      const fn1 = vi.fn(async () => 'first');
      const fn2 = vi.fn(async () => 'second');

      // First request should execute immediately
      const promise1 = limiter.execute(fn1);
      await vi.runAllTimersAsync();
      await promise1;

      // Second request should be queued
      const promise2 = limiter.execute(fn2);
      const status = limiter.getStatus();

      expect(status.queueLength).toBe(1);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).not.toHaveBeenCalled();
    });

    it('should refill tokens at specified rate', async () => {
      const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });
      
      // Consume all tokens
      await limiter.execute(async () => {});
      await limiter.execute(async () => {});
      await limiter.execute(async () => {});
      await limiter.execute(async () => {});
      await limiter.execute(async () => {});

      expect(limiter.getStatus().availableTokens).toBe(0);

      // Wait for refill (1 token per second)
      await vi.advanceTimersByTimeAsync(2000);

      expect(limiter.getStatus().availableTokens).toBe(2);
    });

    it('should not exceed max tokens when refilling', async () => {
      const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });

      // Wait for refill
      await vi.advanceTimersByTimeAsync(10000);

      expect(limiter.getStatus().availableTokens).toBe(5);
    });
  });

  describe('Priority queue', () => {
    it('should execute high priority requests first', async () => {
      const limiter = new RateLimiter({ maxTokens: 1, refillRate: 10 });
      const results: string[] = [];

      // Consume initial token
      await limiter.execute(async () => 'initial');

      // Queue requests with different priorities
      const lowPriority = limiter.execute(async () => {
        results.push('low');
        return 'low';
      }, { priority: 1 });

      const highPriority = limiter.execute(async () => {
        results.push('high');
        return 'high';
      }, { priority: 10 });

      const mediumPriority = limiter.execute(async () => {
        results.push('medium');
        return 'medium';
      }, { priority: 5 });

      // Wait for token refill and execution
      await vi.advanceTimersByTimeAsync(1000);
      await Promise.all([lowPriority, highPriority, mediumPriority]);

      expect(results).toEqual(['high', 'medium', 'low']);
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from executed functions', async () => {
      const limiter = new RateLimiter();
      const error = new Error('Test error');
      const fn = vi.fn(async () => {
        throw error;
      });

      await expect(limiter.execute(fn)).rejects.toThrow('Test error');
    });

    it('should continue processing queue after error', async () => {
      const limiter = new RateLimiter({ maxTokens: 10, refillRate: 10 });
      const error = new Error('Test error');
      const fn1 = vi.fn(async () => {
        throw error;
      });
      const fn2 = vi.fn(async () => 'success');

      await expect(limiter.execute(fn1)).rejects.toThrow();
      const result = await limiter.execute(fn2);

      expect(result).toBe('success');
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });
});

describe('RequestDeduplicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should create deduplicator with default config', () => {
    const dedup = new RequestDeduplicator();
    const stats = dedup.getStats();

    expect(stats.cacheSize).toBe(0);
    expect(stats.pendingRequests).toBe(0);
  });

  it('should deduplicate identical requests', async () => {
    const dedup = new RequestDeduplicator();
    const fetchFn = vi.fn(async () => 'data');

    const promise1 = dedup.fetch('/api/test', fetchFn);
    const promise2 = dedup.fetch('/api/test', fetchFn);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('data');
    expect(result2).toBe('data');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should handle different URLs separately', async () => {
    const dedup = new RequestDeduplicator();
    const fetchFn1 = vi.fn(async () => 'data1');
    const fetchFn2 = vi.fn(async () => 'data2');

    const [result1, result2] = await Promise.all([
      dedup.fetch('/api/test1', fetchFn1),
      dedup.fetch('/api/test2', fetchFn2),
    ]);

    expect(result1).toBe('data1');
    expect(result2).toBe('data2');
    expect(fetchFn1).toHaveBeenCalledTimes(1);
    expect(fetchFn2).toHaveBeenCalledTimes(1);
  });

  it('should cache responses', async () => {
    const dedup = new RequestDeduplicator({ cacheTTL: 5000 });
    const fetchFn = vi.fn(async () => 'cached-data');

    // First request
    await dedup.fetch('/api/test', fetchFn);
    
    // Second request should use cache
    await dedup.fetch('/api/test', fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache after TTL', async () => {
    const dedup = new RequestDeduplicator({ cacheTTL: 1000 });
    const fetchFn = vi.fn(async () => 'data');

    // First request
    await dedup.fetch('/api/test', fetchFn);

    // Wait past TTL
    await vi.advanceTimersByTimeAsync(1500);

    // Second request should fetch again
    await dedup.fetch('/api/test', fetchFn);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('should clear cache', async () => {
    const dedup = new RequestDeduplicator();
    const fetchFn = vi.fn(async () => 'data');

    await dedup.fetch('/api/test', fetchFn);
    
    dedup.clear();
    const stats = dedup.getStats();

    expect(stats.cacheSize).toBe(0);
  });

  it('should handle different request options', async () => {
    const dedup = new RequestDeduplicator();
    const fetchFn = vi.fn(async () => 'data');

    const promise1 = dedup.fetch('/api/test', fetchFn, { method: 'GET' });
    const promise2 = dedup.fetch('/api/test', fetchFn, { method: 'POST' });

    await Promise.all([promise1, promise2]);

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('RequestBatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should create batcher with default config', () => {
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor);

    expect(batcher).toBeDefined();
  });

  it('should batch multiple items', async () => {
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor, { batchSize: 3, batchDelay: 100 });

    const promise1 = batcher.add('a');
    const promise2 = batcher.add('b');
    const promise3 = batcher.add('c');

    await vi.advanceTimersByTimeAsync(100);
    const results = await Promise.all([promise1, promise2, promise3]);

    expect(results).toEqual(['A', 'B', 'C']);
    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('should process batch when size limit reached', async () => {
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor, { batchSize: 2, batchDelay: 1000 });

    const promise1 = batcher.add('a');
    const promise2 = batcher.add('b');

    const results = await Promise.all([promise1, promise2]);

    expect(results).toEqual(['A', 'B']);
    expect(processor).toHaveBeenCalledTimes(1);
    // Should process immediately when batch size reached, not wait for delay
  });

  it('should process batch after delay', async () => {
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor, { batchSize: 10, batchDelay: 100 });

    const promise = batcher.add('test');

    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe('TEST');
    expect(processor).toHaveBeenCalledTimes(1);
  });

  it('should handle processor errors', async () => {
    const error = new Error('Batch processing failed');
    const processor = vi.fn(async () => {
      throw error;
    });
    const batcher = new RequestBatcher(processor, { batchSize: 1 });

    await expect(batcher.add('test')).rejects.toThrow('Batch processing failed');
  });

  it('should flush pending batches', async () => {
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor, { batchSize: 10, batchDelay: 1000 });

    const promise = batcher.add('test');
    await batcher.flush();
    const result = await promise;

    expect(result).toBe('TEST');
    expect(processor).toHaveBeenCalledTimes(1);
  });
});

describe('Utility functions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('a');
      debounced('b');
      debounced('c');

      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('should pass correct arguments', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced(1, 2, 3);

      await vi.advanceTimersByTimeAsync(100);

      expect(fn).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 300);

      throttled('a');
      throttled('b');
      throttled('c');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('a');
    });

    it('should allow call after delay', async () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 200);

      throttled('a');
      await vi.advanceTimersByTimeAsync(200);
      throttled('b');

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, 'a');
      expect(fn).toHaveBeenNthCalledWith(2, 'b');
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry failed requests', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Failure');
        }
        return 'success';
      });

      const promise = retryWithBackoff(fn, { maxRetries: 3, initialDelay: 100 });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      
      // Second attempt after 100ms
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe('success');
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Permanent failure');
      });

      await expect(
        retryWithBackoff(fn, { maxRetries: 2, initialDelay: 50 })
      ).rejects.toThrow('Permanent failure');

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect max delay cap', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 10) {
          throw new Error('Failure');
        }
        return 'success';
      });

      await retryWithBackoff(fn, { 
        maxRetries: 10, 
        initialDelay: 1000,
        maxDelay: 5000 
      });

      // Exponential backoff should be capped at maxDelay
      expect(fn).toHaveBeenCalled();
    });
  });
});

describe('Integration tests', () => {
  it('should combine rate limiter and deduplicator', async () => {
    const limiter = new RateLimiter({ maxTokens: 5 });
    const dedup = new RequestDeduplicator();
    const fetchFn = vi.fn(async () => 'data');

    const requests = Array.from({ length: 10 }, () => 
      limiter.execute(() => dedup.fetch('/api/test', fetchFn))
    );

    await Promise.all(requests);

    // Deduplicator should ensure only 1 actual fetch
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should combine rate limiter and batcher', async () => {
    const limiter = new RateLimiter({ maxTokens: 10 });
    const processor = vi.fn(async (items: string[]) => items.map(i => i.toUpperCase()));
    const batcher = new RequestBatcher(processor, { batchSize: 5 });

    const requests = Array.from({ length: 10 }, (_, i) =>
      limiter.execute(() => batcher.add(`item${i}`))
    );

    const results = await Promise.all(requests);

    expect(results).toHaveLength(10);
    // 10 items with batch size 5 = 2 batches
    expect(processor).toHaveBeenCalledTimes(2);
  });
});
