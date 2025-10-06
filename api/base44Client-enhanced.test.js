import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cachedFetch,
  clearCache,
  getCacheStats,
  invalidateByPattern,
  CACHE_STRATEGIES
} from '@/api/base44Client-enhanced';

// Mock fetch
global.fetch = vi.fn();

describe('cachedFetch', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should cache successful responses', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    // First call - should hit network
    const result1 = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 60000
    });

    expect(result1).toEqual(mockData);
    expect(fetch).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const result2 = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 60000
    });

    expect(result2).toEqual(mockData);
    expect(fetch).toHaveBeenCalledTimes(1); // No additional call
  });

  it('should respect TTL and refetch after expiration', async () => {
    const mockData1 = { id: 1, value: 'first' };
    const mockData2 = { id: 1, value: 'second' };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      });

    // First call
    const result1 = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 5000 // 5 seconds
    });

    expect(result1).toEqual(mockData1);

    // Advance time beyond TTL
    vi.advanceTimersByTime(6000);

    // Second call - should refetch
    const result2 = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 5000
    });

    expect(result2).toEqual(mockData2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should use NETWORK_FIRST strategy', async () => {
    const mockData = { id: 1, name: 'Network' };
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    // Network first always hits network
    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      ttl: 60000
    });

    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      ttl: 60000
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should fall back to cache on network failure with STALE_WHILE_REVALIDATE', async () => {
    const cachedData = { id: 1, name: 'Cached' };
    
    // First successful call to populate cache
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => cachedData
    });

    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
      ttl: 60000
    });

    // Second call fails, should return cached data
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
      ttl: 60000
    });

    expect(result).toEqual(cachedData);
  });

  it('should invalidate cache by pattern', async () => {
    const mockData1 = { id: 1, name: 'Test 1' };
    const mockData2 = { id: 2, name: 'Test 2' };
    const mockData3 = { id: 3, name: 'Other' };

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData3 });

    // Populate cache
    await cachedFetch('/api/transactions/1', { strategy: CACHE_STRATEGIES.CACHE_FIRST });
    await cachedFetch('/api/transactions/2', { strategy: CACHE_STRATEGIES.CACHE_FIRST });
    await cachedFetch('/api/shifts/3', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    expect(fetch).toHaveBeenCalledTimes(3);

    // Invalidate transaction cache
    invalidateByPattern('/api/transactions');

    // Should refetch transactions
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData1 });
    await cachedFetch('/api/transactions/1', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    expect(fetch).toHaveBeenCalledTimes(4); // Refetched

    // Shifts cache should still work
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData3 });
    await cachedFetch('/api/shifts/3', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    expect(fetch).toHaveBeenCalledTimes(4); // Used cache, no refetch
  });

  it('should provide cache statistics', async () => {
    clearCache();
    
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    // Populate cache
    await cachedFetch('/api/test1', { strategy: CACHE_STRATEGIES.CACHE_FIRST });
    await cachedFetch('/api/test2', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    // Hit cache
    await cachedFetch('/api/test1', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    const stats = getCacheStats();

    expect(stats.size).toBe(2);
    expect(stats.hits).toBeGreaterThan(0);
  });

  it('should clear entire cache', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    await cachedFetch('/api/test', { strategy: CACHE_STRATEGIES.CACHE_FIRST });

    const statsBefore = getCacheStats();
    expect(statsBefore.size).toBeGreaterThan(0);

    clearCache();

    const statsAfter = getCacheStats();
    expect(statsAfter.size).toBe(0);
  });

  it('should handle query parameters in cache keys', async () => {
    const mockData1 = { results: [1, 2, 3] };
    const mockData2 = { results: [4, 5, 6] };

    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });

    const result1 = await cachedFetch('/api/transactions?page=1', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST
    });

    const result2 = await cachedFetch('/api/transactions?page=2', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST
    });

    expect(result1).toEqual(mockData1);
    expect(result2).toEqual(mockData2);
    expect(fetch).toHaveBeenCalledTimes(2); // Different cache keys
  });

  it('should handle network errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('Network failure'));

    await expect(
      cachedFetch('/api/test', {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST
      })
    ).rejects.toThrow('Network failure');
  });

  it('should respect cache size limits', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    // Populate cache with many entries
    for (let i = 0; i < 150; i++) {
      await cachedFetch(`/api/test${i}`, {
        strategy: CACHE_STRATEGIES.CACHE_FIRST
      });
    }

    const stats = getCacheStats();
    
    // Cache should have evicted oldest entries
    expect(stats.size).toBeLessThanOrEqual(100);
  });
});

describe('Cache Strategies', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('CACHE_FIRST should prefer cache', async () => {
    const cachedData = { id: 1, cached: true };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => cachedData
    });

    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 60000
    });

    const newData = { id: 1, cached: false };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => newData
    });

    const result = await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.CACHE_FIRST,
      ttl: 60000
    });

    // Should still have old data
    expect(result).toEqual(cachedData);
  });

  it('NETWORK_ONLY should never cache', async () => {
    const mockData = { id: 1, name: 'Network Only' };
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData
    });

    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.NETWORK_ONLY
    });

    await cachedFetch('/api/test', {
      strategy: CACHE_STRATEGIES.NETWORK_ONLY
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
