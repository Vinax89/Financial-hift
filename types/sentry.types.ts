/**
 * @fileoverview TypeScript type definitions for Sentry integration
 * @description Provides proper type safety for Sentry error tracking and monitoring
 */

import type { ErrorInfo } from 'react';
import type * as Sentry from '@sentry/react';

/**
 * Sentry event object structure
 */
export interface SentryEvent {
  message?: string;
  breadcrumbs?: SentryBreadcrumb[];
  user?: SentryUser;
  contexts?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: SentryLevel;
}

/**
 * Sentry breadcrumb for tracking user actions
 */
export interface SentryBreadcrumb {
  type?: string;
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  level?: SentryLevel;
  timestamp?: number;
}

/**
 * Sentry user context
 */
export interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

/**
 * Sentry severity levels
 */
export type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

/**
 * Sentry hint object for beforeSend
 */
export interface SentryHint {
  originalException?: Error | string;
  syntheticException?: Error;
  event_id?: string;
  data?: unknown;
}

/**
 * Additional context for error capture
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Error boundary fallback props
 */
export interface ErrorBoundaryFallbackProps {
  error?: Error;
  componentStack?: string | null;
  eventId?: string | null;
  resetError: () => void;
}

/**
 * React Error Info from error boundary
 */
export interface ReactErrorInfo extends ErrorInfo {
  componentStack: string;
}
