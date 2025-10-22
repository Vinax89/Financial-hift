/**
 * @fileoverview Application entry point for Financial $hift
 * @description Initializes React root, React Query client with optimized caching,
 * Sentry error tracking, and development tools for debugging
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.tsx';
import '@/index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initSentry, ErrorBoundary } from '@/utils/sentry.js';
import { queryClient } from '@/lib/queryClient.js';

// Initialize Sentry for production error tracking
initSentry();

// Google OAuth Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* React Query DevTools (only visible in development) */}
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </ErrorBoundary>
); 