/**
 * @fileoverview Vite configuration for Financial $hift application
 * @description Optimized build configuration with code splitting, minification,
 * and performance enhancements for production deployment
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

// ES Module compatibility: __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite configuration
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  
  server: {
    // Allow connections from any host (useful for Docker/VM development)
    host: true,
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  
  optimizeDeps: {
    esbuildOptions: {
      // Treat .js files as JSX for proper parsing
      loader: {
        '.js': 'jsx',
      },
    },
  },
  
  build: {
    // Optimize bundle size with strategic code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries (changes infrequently, cache-friendly)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'radix-ui': Object.keys(JSON.parse(readFileSync('./package.json', 'utf-8')).dependencies).filter(
            key => key.startsWith('@radix-ui')
          ),
          // Chart library (used primarily in analytics)
          'charts': ['recharts'],
          
          // Utility libraries (date handling, validation, styling)
          'utils': ['date-fns', 'zod', 'clsx', 'tailwind-merge'],
        },
      },
    },
    
    // Chunk size configuration
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for production debugging (disable if concerned about size)
    sourcemap: true,
    
    // Minification with Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.logs in production
        drop_debugger: true,  // Remove debugger statements
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
    },
  },
  
  // ESBuild performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
