/**
 * @fileoverview Centralized logging utility for production-safe logging
 * @description Provides structured logging with DEV-only console output and
 * hooks for production error tracking services (Sentry, LogRocket, etc.)
 */

import { captureException, captureMessage, addBreadcrumb } from './sentry.js';

/**
 * Check if running in development mode
 * @returns {boolean}
 */
const isDev = () => import.meta.env.DEV;

/**
 * Log levels for categorizing messages
 * @enum {string}
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Log a debug message (only in development)
 * @param {string} message - Debug message
 * @param {*} [data] - Optional data to log
 */
export const logDebug = (message, data) => {
  if (isDev()) {
    console.log(`[DEBUG] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Log an info message (only in development)
 * @param {string} message - Info message
 * @param {*} [data] - Optional data to log
 */
export const logInfo = (message, data) => {
  if (isDev()) {
    console.info(`[INFO] ${message}`, data !== undefined ? data : '');
  }
};

/**
 * Log a warning message (only in development)
 * In production, send to error tracking service
 * @param {string} message - Warning message
 * @param {*} [data] - Optional data to log
 */
export const logWarn = (message, data) => {
  if (isDev()) {
    console.warn(`[WARN] ${message}`, data !== undefined ? data : '');
  } else {
    // Send to Sentry in production
    captureMessage(message, 'warning');
    if (data) {
      addBreadcrumb({
        category: 'warning',
        message,
        data,
        level: 'warning',
      });
    }
  }
};

/**
 * Log an error message (development and production)
 * In production, send to error tracking service
 * @param {string} message - Error message
 * @param {Error|*} [error] - Error object or additional data
 */
export const logError = (message, error) => {
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
 * @param {string} label - Performance label
 * @param {number} duration - Duration in milliseconds
 */
export const logPerformance = (label, duration) => {
  if (isDev()) {
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }
};

/**
 * Log a generic message with custom level
 * @param {LogLevel} level - Log level
 * @param {string} message - Message to log
 * @param {*} [data] - Optional data
 */
export const log = (level, message, data) => {
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
 * @param {string} namespace - Module name
 * @returns {Object} Namespaced logger functions
 */
export const createLogger = (namespace) => {
  return {
    debug: (message, data) => logDebug(`[${namespace}] ${message}`, data),
    info: (message, data) => logInfo(`[${namespace}] ${message}`, data),
    warn: (message, data) => logWarn(`[${namespace}] ${message}`, data),
    error: (message, error) => logError(`[${namespace}] ${message}`, error),
    perf: (label, duration) => logPerformance(`[${namespace}] ${label}`, duration),
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
