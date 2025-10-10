/**
 * Sentry Configuration & Initialization
 * 
 * Provides production error tracking, performance monitoring, and user feedback.
 * Only active in production environment to avoid cluttering dev logs.
 */

import * as Sentry from '@sentry/react';
import React from 'react';

// Initialize Sentry only in production
export const initSentry = () => {
  // Only run in production
  if (import.meta.env.PROD) {
    Sentry.init({
      // Replace with your actual Sentry DSN from https://sentry.io/
      // Format: https://[PUBLIC_KEY]@[ORG_ID].ingest.sentry.io/[PROJECT_ID]
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      
      // Environment
      environment: import.meta.env.MODE || 'production',
      
      // Release tracking (use git commit hash or version)
      release: `financial-hift@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Integration with React Router for better error tracking
      integrations: [
        // Automatically instrument React components
        Sentry.browserTracingIntegration(),
        
        // Replay sessions for debugging (optional, uses quota)
        Sentry.replayIntegration({
          // Capture 10% of all sessions
          sessionSampleRate: 0.1,
          // Capture 100% of sessions with errors
          errorSampleRate: 1.0,
          // Mask sensitive data
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
      
      // Filter out sensitive information
      beforeSend(event, hint) {
        // Don't send events if DSN is not configured
        if (!import.meta.env.VITE_SENTRY_DSN) {
          return null;
        }
        
        // Scrub sensitive data from error messages
        if (event.message) {
          event.message = event.message
            .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
            .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
            .replace(/api[_-]?key[=:]\s*\S+/gi, 'apiKey=[REDACTED]');
        }
        
        // Scrub sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.message) {
              breadcrumb.message = breadcrumb.message
                .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
                .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]');
            }
            return breadcrumb;
          });
        }
        
        return event;
      },
      
      // Ignore common non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Network errors (often transient)
        'NetworkError',
        'Network request failed',
        // ResizeObserver loop errors (benign)
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
      ],
    });
    
    console.log('✅ Sentry initialized for production error tracking');
  } else {
    console.log('🔧 Sentry disabled in development mode');
  }
};

/**
 * Capture an exception to Sentry
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export const captureException = (error, context = {}) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
};

/**
 * Capture a message to Sentry
 * @param {string} message - The message to capture
 * @param {string} level - The severity level (info, warning, error)
 */
export const captureMessage = (message, level = 'info') => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
export const setUser = (user) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: user?.id,
      email: user?.email,
      username: user?.username,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 * @param {Object} breadcrumb - Breadcrumb data
 */
export const addBreadcrumb = (breadcrumb) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

/**
 * Wrap component with Sentry error boundary
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Show user feedback dialog
 */
export const showReportDialog = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.showReportDialog();
  }
};

export default Sentry;
