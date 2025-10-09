/**
 * @fileoverview Application entry point for Financial $hift
 * @description Initializes React root, React Query client with optimized caching,
 * Sentry error tracking, and development tools for debugging
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initSentry, ErrorBoundary } from '@/utils/sentry';
import { queryClient } from '@/lib/queryClient';

// Initialize Sentry for production error tracking
initSentry();

// Render application with Sentry error boundary
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <ErrorBoundary
    fallback={({ error, resetError }: { error?: Error; resetError: () => void }) => (
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
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  </ErrorBoundary>
);

