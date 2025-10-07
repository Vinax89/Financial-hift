/**
 * @fileoverview Application entry point for Financial $hift
 * @description Initializes React root, React Query client with optimized caching,
 * Sentry error tracking, and development tools for debugging
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initSentry, ErrorBoundary } from '@/utils/sentry.js';

// Initialize Sentry for production error tracking
initSentry();

/**
 * Create React Query client with optimized settings
 * @type {QueryClient}
 * @see https://tanstack.com/query/latest/docs/react/reference/QueryClient
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,                    // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus (reduces API calls)
      staleTime: 2 * 60 * 1000,    // Consider data fresh for 2 minutes
      gcTime: 10 * 60 * 1000,      // Keep unused data in cache for 10 minutes
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

// Render application with Sentry error boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary
    fallback={({ error, resetError }) => (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p style={{ color: '#666', margin: '1rem 0' }}>
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetError}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )}
    showDialog={import.meta.env.PROD}
  >
    <QueryClientProvider client={queryClient}>
      <App />
      {/* React Query DevTools (only visible in development) */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </ErrorBoundary>
); 