/**
 * React Query Client Configuration
 * Optimized for performance with aggressive caching
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching strategy
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)

      // Fast retries
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network optimizations
      networkMode: 'online',

      // Don't refetch automatically (use cache)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // KEY: Use cache immediately, don't refetch
    },
    mutations: {
      // Faster mutation feedback
      retry: 1,
      retryDelay: 300, // Very fast retry
      networkMode: 'online',
    },
  },
});

// Development mode: even more aggressive caching
if (import.meta.env.DEV) {
  queryClient.setDefaultOptions({
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes in dev
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  });
}

export default queryClient;
