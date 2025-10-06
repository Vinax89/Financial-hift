/**
 * @fileoverview Application entry point for Financial $hift
 * @description Initializes React root, React Query client with optimized caching,
 * and development tools for debugging
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

// Render application
ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {/* React Query DevTools (only visible in development) */}
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
); 