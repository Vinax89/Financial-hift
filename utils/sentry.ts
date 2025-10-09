/**
 * Sentry Configuration & Initialization
 * 
 * Provides production error tracking, performance monitoring, and user feedback.
 * Only active in production environment to avoid cluttering dev logs.
 */

import * as Sentry from '@sentry/react';
import type { SentryLevel, ErrorContext } from '@/types/sentry.types';

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
          // Mask sensitive data
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
      
      // Session Replay sampling
      replaysSessionSampleRate: 0.1, // 10% of all sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
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
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
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
 * @param error - The error to capture
 * @param context - Additional context
 */
export const captureException = (error: Error | string, context: Record<string, unknown> = {}) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

/**
 * Capture a message to Sentry
 * @param message - The message to capture
 * @param level - The severity level (info, warning, error)
 */
export const captureMessage = (message: string, level: SentryLevel = 'info') => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Set user context for error tracking
 * @param user - User information
 */
export const setUser = (user: { id?: string; email?: string; username?: string } | null) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
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
 * @param breadcrumb - Breadcrumb data
 */
export const addBreadcrumb = (breadcrumb: { message?: string; category?: string; level?: SentryLevel; data?: Record<string, unknown> }) => {
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
