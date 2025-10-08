/**
 * @fileoverview Vite configuration for Financial $hift application
 * @description Optimized build configuration with code splitting, minification,
 * and performance enhancements for production deployment
 * Enhanced with bundle analysis and tree shaking optimization
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// ES Module compatibility: __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite configuration
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [
    react(),
    
    // Bundle size analyzer - generates stats.html after build
    visualizer({
      filename: 'stats.html', // Generate in root for easier access
      open: false, // Set to true to auto-open after build
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    
    // Gzip compression - reduces bundle size by ~70%
    viteCompression({
      verbose: true, // Log compression results
      filter: /\.(js|mjs|json|css|html)$/i, // Compress JS, CSS, HTML files
      threshold: 1024, // Compress files larger than 1KB
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false, // Keep original files
    }),
    
    // Brotli compression - better compression than gzip
    viteCompression({
      verbose: true, // Log compression results
      filter: /\.(js|mjs|json|css|html)$/i, // Compress JS, CSS, HTML files
      threshold: 1024, // Compress files larger than 1KB
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false, // Keep original files
    }),
  ],
  
  server: {
    // Allow connections from any host (useful for Docker/VM development)
    host: true,
    port: 5173,
    strictPort: false,
    // Optimize HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
    // Enable compression for faster transfers
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  optimizeDeps: {
    // Pre-bundle dependencies for faster page loads
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
      'recharts',
      'lucide-react',
    ],
    // Exclude large or problematic dependencies
    exclude: ['fsevents'],
    esbuildOptions: {
      // Treat .js files as JSX for proper parsing
      loader: {
        '.js': 'jsx',
      },
      target: 'es2020', // Modern JS for faster parsing
      // Tree shaking configuration
      treeShaking: true,
      // Enable pure annotations for better tree shaking
      pure: ['console.log', 'console.debug'],
    },
    // Force optimization on every start (removes stale cache)
    force: false,
  },
  
  build: {
    // Target modern browsers for smaller bundle sizes
    target: 'es2020',
    
    // Optimize CSS code splitting
    cssCodeSplit: true,
    
    // Optimize bundle size with strategic code splitting
    rollupOptions: {
      output: {
        // Aggressive code splitting for better caching
        manualChunks: (id) => {
          // Core React libraries (changes infrequently, cache-friendly)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'router';
          }
          // React Query (used everywhere)
          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // Chart libraries (heavy, lazy loaded)
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Utility libraries
          if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          // Base44 SDK
          if (id.includes('@base44')) {
            return 'base44-sdk';
          }
          // Split pages into separate chunks
          if (id.includes('/pages/') && !id.includes('node_modules')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Chunk size configuration
    chunkSizeWarningLimit: 800,

    // Disable source maps in production for faster builds
    sourcemap: false,

    // Use esbuild for faster minification (10x faster than terser)
    minify: 'esbuild',
    
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    
    // Report compressed size (disable for faster builds)
    reportCompressedSize: false,
  },
  
  // ESBuild performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Remove console logs and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  // Performance optimizations
  performance: {
    // Warn on large chunks
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
})
