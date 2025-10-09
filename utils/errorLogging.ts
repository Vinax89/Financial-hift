/**
 * Error Logging Utility
 * Provides safe error handling and logging without information leakage
 */

import React from 'react';

const isDevelopment = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

interface SanitizeErrorOptions {
  fallbackMessage?: string;
}

interface SanitizedError {
  userMessage: string;
  code: string;
  timestamp: string;
}

interface ErrorResponse {
  status: number;
}

interface ErrorWithResponse extends Error {
  response?: ErrorResponse;
}

/**
 * Sanitize error for user display
 * Removes sensitive information while keeping helpful context
 */
export function sanitizeError(error: any, options: SanitizeErrorOptions = {}): SanitizedError {
  const { fallbackMessage = 'An unexpected error occurred. Please try again.' } = options;

  // Default sanitized response
  const sanitized: SanitizedError = {
    userMessage: fallbackMessage,
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };

  if (!error) return sanitized;

  // Handle known API errors
  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        sanitized.userMessage = 'Invalid request. Please check your input and try again.';
        sanitized.code = 'BAD_REQUEST';
        break;
      case 401:
        sanitized.userMessage = 'Authentication required. Please log in again.';
        sanitized.code = 'UNAUTHORIZED';
        break;
      case 403:
        sanitized.userMessage = 'You don\'t have permission to perform this action.';
        sanitized.code = 'FORBIDDEN';
        break;
      case 404:
        sanitized.userMessage = 'The requested resource was not found.';
        sanitized.code = 'NOT_FOUND';
        break;
      case 429:
        sanitized.userMessage = 'Too many requests. Please wait a moment and try again.';
        sanitized.code = 'RATE_LIMITED';
        break;
      case 500:
      case 502:
      case 503:
        sanitized.userMessage = 'Server error. Please try again later.';
        sanitized.code = 'SERVER_ERROR';
        break;
      default:
        sanitized.userMessage = 'An error occurred. Please try again.';
        sanitized.code = `HTTP_${status}`;
    }
  }
  // Handle network errors
  else if (error.message && error.message.includes('network')) {
    sanitized.userMessage = 'Network error. Please check your connection and try again.';
    sanitized.code = 'NETWORK_ERROR';
  }
  // Handle timeout errors
  else if (error.message && error.message.includes('timeout')) {
    sanitized.userMessage = 'Request timed out. Please try again.';
    sanitized.code = 'TIMEOUT';
  }
  // Handle validation errors (safe to show)
  else if (error.name === 'ValidationError' || error.type === 'validation') {
    sanitized.userMessage = error.message || 'Please check your input and try again.';
    sanitized.code = 'VALIDATION_ERROR';
  }

  return sanitized;
}

interface ErrorContext {
  [key: string]: any;
}

/**
 * Log error securely
 * Logs full details in development, sanitized in production
 */
export function logError(error: any, context: ErrorContext = {}) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    message: error?.message || 'Unknown error',
    name: error?.name || 'Error',
    context,
    // DO NOT log sensitive data in production
    ...(isDevelopment && {
      stack: error?.stack,
      fullError: error
    })
  };

  // Console logging (visible in development)
  if (isDevelopment) {
    console.error(' Error:', errorDetails);
  } else {
    // Production: minimal console logging
    console.error('Error:', errorDetails.name, errorDetails.message);
  }

  // TODO: Send to error tracking service in production
  // Example: Sentry, LogRocket, Bugsnag, etc.
  // if (!isDevelopment) {
  //   sendToErrorTracker(errorDetails);
  // }

  return errorDetails;
}

type ActionType = 'fetch' | 'create' | 'update' | 'delete' | 'save' | 'load' | string;

/**
 * Create a user-friendly error message
 */
export function createUserErrorMessage(action: ActionType, error: any): string {
  const sanitized = sanitizeError(error);

  // Map common actions to friendly messages
  const actionMessages: Record<string, string> = {
    'fetch': 'loading data',
    'create': 'creating',
    'update': 'updating',
    'delete': 'deleting',
    'save': 'saving',
    'load': 'loading'
  };

  const friendlyAction = actionMessages[action?.toLowerCase()] || action || 'completing the action';

  return `Sorry, there was an error ${friendlyAction}. ${sanitized.userMessage}`;
}

interface ErrorHandlerOptions {
  context?: ErrorContext;
  onError?: ((error: SanitizedError) => void) | null;
  fallback?: any;
}

/**
 * Error handler for async functions
 * Wraps async functions with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  options: ErrorHandlerOptions = {}
): (...args: Parameters<T>) => Promise<any> {
  const {
    context = {},
    onError = null,
    fallback = null
  } = options;

  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);

      if (onError) {
        onError(sanitizeError(error));
      }
      
      if (fallback !== null) {
        return fallback;
      }

      throw error;
    }
  };
}

/**
 * React hook for error handling
 *
 * Usage:
 * const { handleError, errorMessage, clearError } = useErrorHandler();
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error, 'loading data');
 * }
 */
export function useErrorHandler() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleError = React.useCallback((error: any, action: ActionType) => {
    const message = createUserErrorMessage(action, error);
    setErrorMessage(message);
    logError(error, { action });
  }, []);

  const clearError = React.useCallback(() => {
    setErrorMessage(null);
  }, []);

  return { handleError, errorMessage, clearError };
}

export default {
  sanitizeError,
  logError,
  createUserErrorMessage,
  withErrorHandler,
  useErrorHandler
};
