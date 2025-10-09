/**
 * Centralized logging utility for production-safe logging
 * 
 * @remarks
 * Provides structured logging with environment-aware output and integration
 * with external error tracking services (Sentry, LogRocket). In development,
 * all logs output to the browser console. In production, warnings and errors
 * are sent to Sentry for monitoring.
 * 
 * ## Features
 * 
 * - **Environment-aware**: Dev console output, production Sentry integration
 * - **Type-safe**: Full TypeScript support with comprehensive interfaces
 * - **Namespaced loggers**: Create module-specific loggers with `createLogger()`
 * - **Performance tracking**: Built-in performance measurement with `logPerformance()`
 * - **Production monitoring**: Automatic Sentry integration for errors and warnings
 * 
 * ## Usage Examples
 * 
 * ### Basic Logging
 * 
 * ```typescript
 * import logger from '@/utils/logger';
 * 
 * // Debug (development only)
 * logger.debug('User data loaded', { userId: '123', count: 50 });
 * 
 * // Info
 * logger.info('Transaction created', { amount: 100 });
 * 
 * // Warning (logged to Sentry in production)
 * logger.warn('API rate limit approaching', { remaining: 10 });
 * 
 * // Error (always logged to Sentry in production)
 * try {
 *   await saveTransaction(data);
 * } catch (error) {
 *   logger.error('Failed to save transaction', error);
 * }
 * ```
 * 
 * ### Namespaced Loggers
 * 
 * ```typescript
 * import { createLogger } from '@/utils/logger';
 * 
 * const log = createLogger('Dashboard');
 * log.info('Component mounted'); 
 * // Output: "[INFO] [Dashboard] Component mounted"
 * ```
 * 
 * ### Performance Tracking
 * 
 * ```typescript
 * const start = performance.now();
 * await fetchTransactions();
 * const duration = performance.now() - start;
 * logger.perf('fetchTransactions', duration);
 * // Output: "[PERF] fetchTransactions: 245.67ms"
 * ```
 * 
 * @packageDocumentation
 * @module utils/logger
 * @public
 */

import { captureException, captureMessage, addBreadcrumb } from './sentry.js';

/**
 * Log severity levels
 * 
 * @remarks
 * Defines the available log levels ordered by severity:
 * - `debug`: Verbose diagnostic information (development only)
 * - `info`: General informational messages
 * - `warn`: Warning messages for potentially harmful situations
 * - `error`: Error messages for failures and exceptions
 * 
 * @public
 */
export type LogLevelType = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger interface for namespaced loggers
 * 
 * @remarks
 * Returned by `createLogger()` to provide module-specific logging.
 * All methods automatically include the namespace in log output.
 * 
 * @example
 * ```typescript
 * const logger = createLogger('API');
 * logger.info('Request started');
 * // Output: "[INFO] [API] Request started"
 * ```
 * 
 * @public
 */
export interface Logger {
  /** Log debug information (development only) */
  debug: (message: string, data?: unknown) => void;
  
  /** Log informational messages */
  info: (message: string, data?: unknown) => void;
  
  /** Log warning messages (sent to Sentry in production) */
  warn: (message: string, data?: unknown) => void;
  
  /** Log error messages (sent to Sentry in production) */
  error: (message: string, error?: Error | unknown) => void;
  
  /** Log performance metrics (development only) */
  perf: (label: string, duration: number) => void;
}

/**
 * Check if running in development mode
 * 
 * @returns `true` if running in development, `false` in production
 * 
 * @internal
 */
const isDev = (): boolean => import.meta.env.DEV;

/**
 * Log level constants for categorizing messages
 * 
 * @remarks
 * Use these constants instead of magic strings when calling `log()`.
 * 
 * @example
 * ```typescript
 * import { LogLevel, log } from '@/utils/logger';
 * 
 * log(LogLevel.INFO, 'User logged in', { userId: '123' });
 * ```
 * 
 * @public
 */
export const LogLevel = {
  /** Debug level - verbose diagnostic information */
  DEBUG: 'debug' as const,
  
  /** Info level - general informational messages */
  INFO: 'info' as const,
  
  /** Warning level - potentially harmful situations */
  WARN: 'warn' as const,
  
  /** Error level - error events and exceptions */
  ERROR: 'error' as const,
};

/**
 * Log a debug message (only in development)
 * 
 * @remarks
 * Debug logs are verbose diagnostic information useful during development.
 * They are **completely suppressed** in production environments.
 * 
 * Use for:
 * - Detailed state information
 * - Function entry/exit tracing
 * - Variable inspection
 * - Development troubleshooting
 * 
 * @param message - Debug message
 * @param data - Optional additional data to log
 * 
 * @example
 * ```typescript
 * logDebug('Component rendering', { props, state });
 * logDebug('API response received', responseData);
 * ```
 * 
 * @public
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
