import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeError, logError, createUserErrorMessage } from '../utils/errorLogging';

describe('errorLogging utilities', () => {
  describe('sanitizeError', () => {
    it('should return default message for null error', () => {
      const result = sanitizeError(null);
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should handle 400 Bad Request', () => {
      const error = { response: { status: 400 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('Invalid request');
      expect(result.code).toBe('BAD_REQUEST');
    });

    it('should handle 401 Unauthorized', () => {
      const error = { response: { status: 401 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('Authentication required');
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('should handle 403 Forbidden', () => {
      const error = { response: { status: 403 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('permission');
      expect(result.code).toBe('FORBIDDEN');
    });

    it('should handle 404 Not Found', () => {
      const error = { response: { status: 404 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('not found');
      expect(result.code).toBe('NOT_FOUND');
    });

    it('should handle 429 Rate Limit', () => {
      const error = { response: { status: 429 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('Too many requests');
      expect(result.code).toBe('RATE_LIMITED');
    });

    it('should handle 500 Server Error', () => {
      const error = { response: { status: 500 } };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('Server error');
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should handle network errors', () => {
      const error = { message: 'network error occurred' };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('Network error');
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('should handle timeout errors', () => {
      const error = { message: 'request timeout' };
      const result = sanitizeError(error);
      expect(result.userMessage).toContain('timed out');
      expect(result.code).toBe('TIMEOUT');
    });

    it('should handle validation errors', () => {
      const error = { name: 'ValidationError', message: 'Invalid email format' };
      const result = sanitizeError(error);
      expect(result.userMessage).toBe('Invalid email format');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should use custom fallback message', () => {
      const result = sanitizeError(null, { fallbackMessage: 'Custom error' });
      expect(result.userMessage).toBe('Custom error');
    });

    it('should include timestamp', () => {
      const result = sanitizeError(null);
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('logError', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log error to console', () => {
      const error = new Error('Test error');
      logError(error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include context in log', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', action: 'test_action' };
      const result = logError(error, context);
      expect(result.context).toEqual(context);
    });

    it('should include timestamp', () => {
      const error = new Error('Test error');
      const result = logError(error);
      expect(result.timestamp).toBeDefined();
    });

    it('should include error message', () => {
      const error = new Error('Test error message');
      const result = logError(error);
      expect(result.message).toBe('Test error message');
    });
  });

  describe('createUserErrorMessage', () => {
    it('should create message with action', () => {
      const error = { response: { status: 404 } };
      const message = createUserErrorMessage('fetch', error);
      expect(message).toContain('loading data');
      expect(message).toContain('not found');
    });

    it('should use default action if not provided', () => {
      const error = { response: { status: 500 } };
      const message = createUserErrorMessage(null, error);
      expect(message).toContain('completing the action');
    });

    it('should map common actions to friendly names', () => {
      const error = { response: { status: 400 } };
      const createMessage = createUserErrorMessage('create', error);
      expect(createMessage).toContain('creating');

      const updateMessage = createUserErrorMessage('update', error);
      expect(updateMessage).toContain('updating');

      const deleteMessage = createUserErrorMessage('delete', error);
      expect(deleteMessage).toContain('deleting');
    });
  });
});
