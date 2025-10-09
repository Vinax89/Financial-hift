/**
 * @fileoverview Centralized logging utility for production-safe logging
 * @description Provides structured logging with DEV-only console output and
 * hooks for production error tracking services (Sentry, LogRocket, etc.)
 */

import { captureException, captureMessage, addBreadcrumb } from './sentry.js';

/**
 * Log level type
 */
export type LogLevelType = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface for namespaced loggers
 */
export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, error?: Error | unknown) => void;
  perf: (label: string, duration: number) => void;
}

/**
 * Check if running in development mode
 */
const isDev = (): boolean => import.meta.env.DEV;

/**
 * Log levels for categorizing messages
 */
export const LogLevel = {
  DEBUG: 'debug' as const,
  INFO: 'info' as const,
  WARN: 'warn' as const,
  ERROR: 'error' as const,
};

/**
 * Log a debug message (only in development)
 * @param message - Debug message
 * @param data - Optional data to log
 */
export const logDebug = (message: string, data?: unknown): void => {
  if (isDev()) {
    console.log(`[DEBUG] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Log an info message (only in development)
 * @param message - Info message
 * @param data - Optional data to log
 */
export const logInfo = (message: string, data?: unknown): void => {
  if (isDev()) {
    console.info(`[INFO] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Log a warning message (only in development)
 * In production, send to error tracking service
 * @param message - Warning message
 * @param data - Optional data to log
 */
export const logWarn = (message: string, data?: unknown): void => {
  if (isDev()) {
    console.warn(`[WARN] ${message}`, data !== undefined ? data : '');
  } else {
    // Send to Sentry in production
    captureMessage(message, 'warning');
    if (data) {
      addBreadcrumb({
        category: 'warning',
        message,
        data: data as Record<string, unknown>,
        level: 'warning',
      });
    }
  }
};

/**
 * Log an error message (development and production)
 * In production, send to error tracking service
 * @param message - Error message
 * @param error - Error object or additional data
 */
export const logError = (message: string, error?: Error | unknown): void => {
  if (isDev()) {
    console.error(`[ERROR] ${message}`, error || '');
  } else {
    // Send to Sentry in production
    if (error instanceof Error) {
      captureException(error, { message });
    } else {
      captureMessage(`${message}: ${JSON.stringify(error)}`, 'error');
    }
  }
};

/**
 * Log performance metrics (only in development)
 * @param label - Performance label
 * @param duration - Duration in milliseconds
 */
export const logPerformance = (label: string, duration: number): void => {
  if (isDev()) {
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }
};

/**
 * Log a generic message with custom level
 * @param level - Log level
 * @param message - Message to log
 * @param data - Optional data
 */
export const log = (level: LogLevelType, message: string, data?: unknown): void => {
  switch (level) {
    case LogLevel.DEBUG:
      logDebug(message, data);
      break;
    case LogLevel.INFO:
      logInfo(message, data);
      break;
    case LogLevel.WARN:
      logWarn(message, data);
      break;
    case LogLevel.ERROR:
      logError(message, data);
      break;
    default:
      logInfo(message, data);
  }
};

/**
 * Create a namespaced logger for a specific module
 * @param namespace - Module name
 * @returns Namespaced logger functions
 */
export const createLogger = (namespace: string): Logger => {
  return {
    debug: (message: string, data?: unknown) => logDebug(`[${namespace}] ${message}`, data),
    info: (message: string, data?: unknown) => logInfo(`[${namespace}] ${message}`, data),
    warn: (message: string, data?: unknown) => logWarn(`[${namespace}] ${message}`, data),
    error: (message: string, error?: Error | unknown) => logError(`[${namespace}] ${message}`, error),
    perf: (label: string, duration: number) => logPerformance(`[${namespace}] ${label}`, duration),
  };
};

// Default export
export default {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  perf: logPerformance,
  log,
  createLogger,
  LogLevel,
};
