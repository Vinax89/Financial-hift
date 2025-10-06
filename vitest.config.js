/**
 * @fileoverview Vitest configuration for Financial $hift test suite
 * @description Test runner configuration with React Testing Library,
 * happy-dom environment, and comprehensive coverage reporting
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Vitest configuration
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    
    // Lightweight DOM implementation for React components
    environment: 'happy-dom',
    
    // Global setup/teardown and mocks
    setupFiles: './__tests__/setup.js',
    
    // Enable CSS processing in tests
    css: true,
    
    // Timeout for async operations
    testTimeout: 10000,
    
    // Reset mocks between tests for isolation
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    
    // Test file patterns
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Coverage thresholds (adjust as needed)
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
      },
      
      // Exclude from coverage
      exclude: [
        'node_modules/',
        '__tests__/',
        'src/test/',
        '*.config.js',
        'dist/',
        '.eslintrc.cjs',
        'coverage/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
      ],
    },
  },
  
  // Match Vite's resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
});
