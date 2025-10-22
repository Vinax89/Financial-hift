/**
 * @fileoverview Error logging utility tests
 * @description Comprehensive test suite for error handling, sanitization, and user-facing error messages.
 * Tests cover HTTP status codes, network errors, validation errors, and context-aware error logging.
 * 
 * @module __tests__/errorLogging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeError, logError, createUserErrorMessage } from '../utils/errorLogging';

/**
 * Mock HTTP error response structure
 * @interface MockHttpError
 * @property {object} response - HTTP response object
 * @property {number} response.status - HTTP status code
 */
interface MockHttpError {
  response: {
    status: number;
  };
}

/**
 * Mock network/validation error structure
 * @interface MockError
 * @property {string} [message] - Error message
 * @property {string} [name] - Error type name
 */
interface MockError {
  message?: string;
  name?: string;
}

/**
 * Sanitized error result structure
 * @interface SanitizeErrorResult
 * @property {string} userMessage - User-friendly error message
 * @property {string} code - Error code identifier
 * @property {string} timestamp - ISO timestamp of error occurrence
 */
interface SanitizeErrorResult {
  userMessage: string;
  code: string;
  timestamp: string;
}

/**
 * Error logging result structure
 * @interface LogErrorResult
 * @property {string} message - Error message
 * @property {string} timestamp - ISO timestamp of error logging
 * @property {object} [context] - Additional error context
 */
interface LogErrorResult {
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Error logging context structure
 * @interface ErrorContext
 * @property {string} [component] - Component where error occurred
 * @property {string} [action] - Action being performed when error occurred
 */
interface ErrorContext {
  component?: string;
  action?: string;
}

/**
 * Error logging utility tests
 * Tests error sanitization, logging, and user message generation
 */
describe('errorLogging utilities', () => {
  /**
   * Error sanitization test suite
   * Validates proper handling and sanitization of various error types including:
   * - HTTP status codes (400, 401, 403, 404, 429, 500)
   * - Network errors
   * - Timeout errors
   * - Validation errors
   * - Null/undefined errors
   * - Custom fallback messages
   */
  describe('sanitizeError', () => {
    /**
     * Test: Handle null error input
     * Scenario: Error is null or undefined
     * Expected: Returns default unknown error message with UNKNOWN_ERROR code
     */
    it('should return default message for null error', () => {
      const result = sanitizeError(null) as SanitizeErrorResult;
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    /**
     * Test: Handle 400 Bad Request
     * Scenario: Server returns 400 status (invalid request data)
     * Expected: Returns invalid request message with BAD_REQUEST code
     */
    it('should handle 400 Bad Request', () => {
      const error: MockHttpError = { response: { status: 400 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('Invalid request');
      expect(result.code).toBe('BAD_REQUEST');
    });

    /**
     * Test: Handle 401 Unauthorized
     * Scenario: Authentication is required or token is invalid
     * Expected: Returns authentication required message with UNAUTHORIZED code
     */
    it('should handle 401 Unauthorized', () => {
      const error: MockHttpError = { response: { status: 401 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('Authentication required');
      expect(result.code).toBe('UNAUTHORIZED');
    });

    /**
     * Test: Handle 403 Forbidden
     * Scenario: User lacks permissions for requested resource
     * Expected: Returns permission denied message with FORBIDDEN code
     */
    it('should handle 403 Forbidden', () => {
      const error: MockHttpError = { response: { status: 403 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('permission');
      expect(result.code).toBe('FORBIDDEN');
    });

    /**
     * Test: Handle 404 Not Found
     * Scenario: Requested resource does not exist
     * Expected: Returns not found message with NOT_FOUND code
     */
    it('should handle 404 Not Found', () => {
      const error: MockHttpError = { response: { status: 404 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('not found');
      expect(result.code).toBe('NOT_FOUND');
    });

    /**
     * Test: Handle 429 Rate Limit
     * Scenario: Too many requests sent in given timeframe
     * Expected: Returns rate limit message with RATE_LIMITED code
     */
    it('should handle 429 Rate Limit', () => {
      const error: MockHttpError = { response: { status: 429 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('Too many requests');
      expect(result.code).toBe('RATE_LIMITED');
    });

    /**
     * Test: Handle 500 Server Error
     * Scenario: Internal server error occurred
     * Expected: Returns server error message with SERVER_ERROR code
     */
    it('should handle 500 Server Error', () => {
      const error: MockHttpError = { response: { status: 500 } };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('Server error');
      expect(result.code).toBe('SERVER_ERROR');
    });

    /**
     * Test: Handle network errors
     * Scenario: Network connectivity issue (offline, DNS failure, etc.)
     * Expected: Returns network error message with NETWORK_ERROR code
     */
    it('should handle network errors', () => {
      const error: MockError = { message: 'network error occurred' };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('Network error');
      expect(result.code).toBe('NETWORK_ERROR');
    });

    /**
     * Test: Handle timeout errors
     * Scenario: Request exceeded timeout threshold
     * Expected: Returns timeout message with TIMEOUT code
     */
    it('should handle timeout errors', () => {
      const error: MockError = { message: 'request timeout' };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toContain('timed out');
      expect(result.code).toBe('TIMEOUT');
    });

    /**
     * Test: Handle validation errors
     * Scenario: Data validation failed (e.g., invalid email format)
     * Expected: Returns validation error message with VALIDATION_ERROR code
     */
    it('should handle validation errors', () => {
      const error: MockError = { name: 'ValidationError', message: 'Invalid email format' };
      const result = sanitizeError(error) as SanitizeErrorResult;
      expect(result.userMessage).toBe('Invalid email format');
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    /**
     * Test: Use custom fallback message
     * Scenario: Custom fallback message provided for unknown errors
     * Expected: Returns custom fallback instead of default message
     */
    it('should use custom fallback message', () => {
      const result = sanitizeError(null, { fallbackMessage: 'Custom error' }) as SanitizeErrorResult;
      expect(result.userMessage).toBe('Custom error');
    });

    /**
     * Test: Include timestamp in error result
     * Scenario: Any error is sanitized
     * Expected: Result includes valid ISO timestamp
     */
    it('should include timestamp', () => {
      const result = sanitizeError(null) as SanitizeErrorResult;
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  /**
   * Error logging test suite
   * Validates proper error logging to console with context and metadata
   */
  describe('logError', () => {
    /** Console.error spy for testing log output */
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    /**
     * Setup: Mock console.error before each test
     * Prevents actual console output during testing
     */
    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    /**
     * Test: Log error to console
     * Scenario: Error is logged without additional context
     * Expected: console.error is called with error details
     */
    it('should log error to console', () => {
      const error = new Error('Test error');
      logError(error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    /**
     * Test: Include context in log
     * Scenario: Error logged with component and action context
     * Expected: Result includes context object with provided data
     */
    it('should include context in log', () => {
      const error = new Error('Test error');
      const context: ErrorContext = { component: 'TestComponent', action: 'test_action' };
      const result = logError(error, context) as LogErrorResult;
      expect(result.context).toEqual(context);
    });

    /**
     * Test: Include timestamp in log
     * Scenario: Error is logged
     * Expected: Result includes ISO timestamp of logging
     */
    it('should include timestamp', () => {
      const error = new Error('Test error');
      const result = logError(error) as LogErrorResult;
      expect(result.timestamp).toBeDefined();
    });

    /**
     * Test: Include error message in log
     * Scenario: Error with specific message is logged
     * Expected: Result includes exact error message
     */
    it('should include error message', () => {
      const error = new Error('Test error message');
      const result = logError(error) as LogErrorResult;
      expect(result.message).toBe('Test error message');
    });
  });

  /**
   * User error message generation test suite
   * Validates context-aware user-friendly error message creation
   */
  describe('createUserErrorMessage', () => {
    /**
     * Test: Create message with action context
     * Scenario: Error occurred during 'fetch' action with 404 status
     * Expected: Message includes action context ("loading data") and error details
     */
    it('should create message with action', () => {
      const error: MockHttpError = { response: { status: 404 } };
      const message = createUserErrorMessage('fetch', error) as string;
      expect(message).toContain('loading data');
      expect(message).toContain('not found');
    });

    /**
     * Test: Use default action when not provided
     * Scenario: No action specified for error
     * Expected: Message uses generic "completing the action" phrase
     */
    it('should use default action if not provided', () => {
      const error: MockHttpError = { response: { status: 500 } };
      const message = createUserErrorMessage(null, error) as string;
      expect(message).toContain('completing the action');
    });

    /**
     * Test: Map common actions to friendly names
     * Scenario: Common CRUD actions (create, update, delete) provided
     * Expected: Actions are mapped to user-friendly verbs in messages
     */
    it('should map common actions to friendly names', () => {
      const error: MockHttpError = { response: { status: 400 } };
      
      // Test 'create' action mapping
      const createMessage = createUserErrorMessage('create', error) as string;
      expect(createMessage).toContain('creating');

      // Test 'update' action mapping
      const updateMessage = createUserErrorMessage('update', error) as string;
      expect(updateMessage).toContain('updating');

      // Test 'delete' action mapping
      const deleteMessage = createUserErrorMessage('delete', error) as string;
      expect(deleteMessage).toContain('deleting');
    });
  });
});
