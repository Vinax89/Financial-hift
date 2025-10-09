/**
 * Optimized React Query Configuration
 * Improves loading times and user experience
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for instant perceived loading
      staleTime: 60 * 1000, // 1 minute - data feels instant

      // Keep data in cache much longer
      gcTime: 10 * 60 * 1000, // 10 minutes - reduces re-fetching

      // Minimal retries for speed
      retry: 1, // Only retry once (was 3)
      retryDelay: 500, // Fast retry (was 1000ms)

      // Network optimizations
      networkMode: 'online',

      // Don't refetch automatically (use cache)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // KEY: Use cache immediately, don't refetch

      // Suspense mode for better loading UX
      suspense: false,
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
      retry: false, // No retries = instant error feedback
      staleTime: 10 * 60 * 1000, // 10 minutes - very long cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // Never refetch in dev (pure cache mode)
    },
    mutations: {
      retry: false, // Instant mutation feedback
    },
  });
}