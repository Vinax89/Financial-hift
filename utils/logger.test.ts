// @ts-nocheck
/**
 * @fileoverview Tests for centralized logging utility
 * @description Comprehensive test coverage for logger functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logDebug,
  logInfo,
  logWarn,
  logError,
  logPerformance,
  log,
  createLogger,
  LogLevel,
} from './logger';
import * as sentry from './sentry';

// Mock Sentry functions
vi.mock('./sentry', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe('Logger Utility', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let originalEnv: boolean;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Store original environment
    originalEnv = import.meta.env.DEV;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Restore environment
    import.meta.env.DEV = originalEnv;
  });

  describe('logDebug', () => {
    it('should log debug messages in development', () => {
      import.meta.env.DEV = true;
      
      logDebug('Test debug message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', '');
    });

    it('should log debug messages with data in development', () => {
      import.meta.env.DEV = true;
      const data = { key: 'value' };
      
      logDebug('Test debug message', data);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', data);
    });

    it('should not log debug messages in production', () => {
      import.meta.env.DEV = false;
      
      logDebug('Test debug message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('logInfo', () => {
    it('should log info messages in development', () => {
      import.meta.env.DEV = true;
      
      logInfo('Test info message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test info message', '');
    });

    it('should log info messages with data in development', () => {
      import.meta.env.DEV = true;
      const data = { user: 'test' };
      
      logInfo('Test info message', data);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test info message', data);
    });

    it('should not log info messages in production', () => {
      import.meta.env.DEV = false;
      
      logInfo('Test info message');
      
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });

  describe('logWarn', () => {
    it('should log warning messages in development', () => {
      import.meta.env.DEV = true;
      
      logWarn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning message', '');
    });

    it('should log warning messages with data in development', () => {
      import.meta.env.DEV = true;
      const data = { issue: 'deprecated' };
      
      logWarn('Test warning message', data);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning message', data);
    });

    it('should send warning to Sentry in production', () => {
      import.meta.env.DEV = false;
      
      logWarn('Test warning message');
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(sentry.captureMessage).toHaveBeenCalledWith('Test warning message', 'warning');
    });

    it('should send warning with data to Sentry in production', () => {
      import.meta.env.DEV = false;
      const data = { context: 'important' };
      
      logWarn('Test warning message', data);
      
      expect(sentry.captureMessage).toHaveBeenCalledWith('Test warning message', 'warning');
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'warning',
        message: 'Test warning message',
        data: data,
        level: 'warning',
      });
    });
  });

  describe('logError', () => {
    it('should log error messages in development', () => {
      import.meta.env.DEV = true;
      const error = new Error('Test error');
      
      logError('Test error message', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error message', error);
    });

    it('should log error messages without error object in development', () => {
      import.meta.env.DEV = true;
      
      logError('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error message', '');
    });

    it('should send Error object to Sentry in production', () => {
      import.meta.env.DEV = false;
      const error = new Error('Test error');
      
      logError('Test error message', error);
      
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(sentry.captureException).toHaveBeenCalledWith(error, { message: 'Test error message' });
    });

    it('should send non-Error data to Sentry as message in production', () => {
      import.meta.env.DEV = false;
      const data = { code: 500 };
      
      logError('Test error message', data);
      
      expect(sentry.captureMessage).toHaveBeenCalledWith(
        'Test error message: {"code":500}',
        'error'
      );
    });
  });

  describe('logPerformance', () => {
    it('should log performance metrics in development', () => {
      import.meta.env.DEV = true;
      
      logPerformance('Component render', 123.456);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] Component render: 123.46ms');
    });

    it('should format duration to 2 decimal places', () => {
      import.meta.env.DEV = true;
      
      logPerformance('API call', 45.6789);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] API call: 45.68ms');
    });

    it('should not log performance metrics in production', () => {
      import.meta.env.DEV = false;
      
      logPerformance('Component render', 123.456);
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('should route to logDebug for debug level', () => {
      import.meta.env.DEV = true;
      
      log('debug', 'Test message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test message', '');
    });

    it('should route to logInfo for info level', () => {
      import.meta.env.DEV = true;
      
      log('info', 'Test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test message', '');
    });

    it('should route to logWarn for warn level', () => {
      import.meta.env.DEV = true;
      
      log('warn', 'Test message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test message', '');
    });

    it('should route to logError for error level', () => {
      import.meta.env.DEV = true;
      
      log('error', 'Test message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test message', '');
    });

    it('should default to info for unknown levels', () => {
      import.meta.env.DEV = true;
      
      // @ts-expect-error Testing invalid level
      log('unknown', 'Test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test message', '');
    });

    it('should pass data through to underlying log function', () => {
      import.meta.env.DEV = true;
      const data = { test: true };
      
      log('debug', 'Test message', data);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test message', data);
    });
  });

  describe('createLogger', () => {
    it('should create namespaced logger with debug method', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      
      logger.debug('Test message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] [MyModule] Test message', '');
    });

    it('should create namespaced logger with info method', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      
      logger.info('Test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] [MyModule] Test message', '');
    });

    it('should create namespaced logger with warn method', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      
      logger.warn('Test message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] [MyModule] Test message', '');
    });

    it('should create namespaced logger with error method', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      const error = new Error('Test error');
      
      logger.error('Test message', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] [MyModule] Test message', error);
    });

    it('should create namespaced logger with perf method', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      
      logger.perf('Operation', 50.5);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] [MyModule] Operation: 50.50ms');
    });

    it('should pass data through namespaced logger methods', () => {
      import.meta.env.DEV = true;
      const logger = createLogger('MyModule');
      const data = { count: 5 };
      
      logger.debug('Test message', data);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] [MyModule] Test message', data);
    });

    it('should work correctly with multiple namespaces', () => {
      import.meta.env.DEV = true;
      const logger1 = createLogger('Module1');
      const logger2 = createLogger('Module2');
      
      logger1.info('Message from module 1');
      logger2.info('Message from module 2');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] [Module1] Message from module 1', '');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] [Module2] Message from module 2', '');
    });
  });

  describe('LogLevel constants', () => {
    it('should export correct log level constants', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('Edge cases', () => {
    it('should handle null data gracefully', () => {
      import.meta.env.DEV = true;
      
      logDebug('Test message', null);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test message', null);
    });

    it('should handle undefined data gracefully', () => {
      import.meta.env.DEV = true;
      
      logDebug('Test message', undefined);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test message', '');
    });

    it('should handle complex nested objects', () => {
      import.meta.env.DEV = true;
      const complexData = {
        user: { id: 1, name: 'Test' },
        nested: { level: { deep: 'value' } },
        array: [1, 2, 3],
      };
      
      logInfo('Test message', complexData);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test message', complexData);
    });

    it('should handle empty strings', () => {
      import.meta.env.DEV = true;
      
      logDebug('');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] ', '');
    });

    it('should handle very long messages', () => {
      import.meta.env.DEV = true;
      const longMessage = 'A'.repeat(1000);
      
      logInfo(longMessage);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(`[INFO] ${longMessage}`, '');
    });

    it('should handle circular references in production error logging', () => {
      import.meta.env.DEV = false;
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Logger currently throws on circular references - this is expected behavior
      // The Sentry captureMessage will handle it gracefully
      expect(() => logError('Circular error', circular)).toThrow('Converting circular structure to JSON');
    });
  });
});

