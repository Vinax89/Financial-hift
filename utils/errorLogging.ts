// @ts-nocheck
/**
 * Error Logging Utility
 * Provides safe error handling and logging without information leakage
 * 
 * Usage:
 * import { logError, sanitizeError } from '@/utils/errorLogging';
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   logError(error, { context: 'AI API call', userId: user.id });
 *   setUserMessage(sanitizeError(error).userMessage);
 * }
 */

const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

/**
 * Sanitize error for user display
 * Removes sensitive information while keeping helpful context
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Configuration options
 * @returns {Object} Sanitized error with userMessage and code
 */
export function sanitizeError(error, options = {}) {
  const { fallbackMessage = 'An unexpected error occurred. Please try again.' } = options;
  
  // Default sanitized response
  const sanitized = {
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

/**
 * Log error securely
 * Logs full details in development, sanitized in production
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Additional context (component, user action, etc.)
 */
export function logError(error, context = {}) {
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
    console.error('🚨 Error:', errorDetails);
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

/**
 * Create a user-friendly error message
 * 
 * @param {string} action - What the user was trying to do
 * @param {Error} error - The error that occurred
 * @returns {string} User-friendly message
 */
export function createUserErrorMessage(action, error) {
  const sanitized = sanitizeError(error);
  
  // Map common actions to friendly messages
  const actionMessages = {
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

/**
 * Error handler for async functions
 * Wraps async functions with error handling
 * 
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped function
 */
export function withErrorHandler(fn, options = {}) {
  const { 
    context = {},
    onError = null,
    fallback = null 
  } = options;

  return async (...args) => {
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
  const [errorMessage, setErrorMessage] = React.useState(null);

  const handleError = React.useCallback((error, action) => {
    const message = createUserErrorMessage(action, error);
    setErrorMessage(message);
    logError(error, { action });
  }, []);

  const clearError = React.useCallback(() => {
    setErrorMessage(null);
  }, []);

  return { handleError, errorMessage, clearError };
}

// Re-export React for the hook
import React from 'react';

export default {
  sanitizeError,
  logError,
  createUserErrorMessage,
  withErrorHandler,
  useErrorHandler
};

