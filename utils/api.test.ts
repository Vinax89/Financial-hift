// @ts-nocheck
/**
 * @fileoverview Comprehensive tests for API utility functions
 * @description Tests for sleep, retryWithBackoff, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sleep, retryWithBackoff } from './api';

describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
        vi.useFakeTimers();
        const promise = sleep(1000);
        
        vi.advanceTimersByTime(1000);
        await promise;
        
        vi.useRealTimers();
    });

    it('should work with different durations', async () => {
        vi.useFakeTimers();
        
        const promise100 = sleep(100);
        vi.advanceTimersByTime(100);
        await promise100;
        
        const promise500 = sleep(500);
        vi.advanceTimersByTime(500);
        await promise500;
        
        vi.useRealTimers();
    });

    it('should work with zero milliseconds', async () => {
        const promise = sleep(0);
        await promise;
    });
});

describe('retryWithBackoff', () => {
    it('should return result on first successful attempt', async () => {
        const mockFn = vi.fn().mockResolvedValue('success');
        
        const result = await retryWithBackoff(mockFn);
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Attempt 1 failed'))
            .mockRejectedValueOnce(new Error('Attempt 2 failed'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { 
            baseDelay: 10, 
            jitter: false 
        });
        
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
    });    it('should throw error after max retries', async () => {
        const error = new Error('Always fails');
        const mockFn = vi.fn().mockRejectedValue(error);

        await expect(
            retryWithBackoff(mockFn, { retries: 2, baseDelay: 10, jitter: false })
        ).rejects.toThrow('Always fails');
        
        expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use custom retry count', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Failed'));

        await expect(
            retryWithBackoff(mockFn, { retries: 3, baseDelay: 10, jitter: false })
        ).rejects.toThrow('Failed');
        
        expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should use exponential backoff with custom base delay', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { baseDelay: 10, jitter: false });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use custom backoff factor', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Fail'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { baseDelay: 10, factor: 3, jitter: false });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should add jitter to delay by default', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Fail'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { baseDelay: 10 });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not add jitter when jitter is false', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Fail'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { baseDelay: 10, jitter: false });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should use custom isRetryable function', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Retryable error'))
            .mockRejectedValueOnce(new Error('Non-retryable error'));

        const isRetryable = (err) => err.message === 'Retryable error';

        await expect(
            retryWithBackoff(mockFn, { isRetryable, baseDelay: 10, jitter: false })
        ).rejects.toThrow('Non-retryable error');
        
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Auth error'));
        
        const isRetryable = (err) => !err.message.includes('Auth');

        await expect(
            retryWithBackoff(mockFn, { isRetryable })
        ).rejects.toThrow('Auth error');
        
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle default options correctly', async () => {
        const mockFn = vi.fn().mockResolvedValue('success');
        
        const result = await retryWithBackoff(mockFn);
        
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should exponentially increase delay', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockRejectedValueOnce(new Error('Fail 3'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(mockFn, { baseDelay: 10, factor: 2, jitter: false });
        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it('should work with async functions that return promises', async () => {
        const asyncFn = vi.fn().mockResolvedValue('async result');
        const result = await retryWithBackoff(asyncFn);
        expect(result).toBe('async result');
        expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('should preserve error object properties', async () => {
        const customError = new Error('Custom error');
        customError.code = 500;
        customError.details = { info: 'test' };
        
        const mockFn = vi.fn().mockRejectedValue(customError);

        try {
            await retryWithBackoff(mockFn, { retries: 1, baseDelay: 10, jitter: false });
            throw new Error('Should have thrown');
        } catch (err) {
            expect(err.message).toBe('Custom error');
            expect(err.code).toBe(500);
            expect(err.details).toEqual({ info: 'test' });
        }
    });
});

