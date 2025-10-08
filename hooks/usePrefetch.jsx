/**
 * @fileoverview Advanced prefetching and preloading hooks
 * @description Implements intelligent route prefetching, data preloading, and resource hints
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { QueryKeys } from '@/hooks/useEntityQueries.jsx';
import * as entities from '@/api/entities.js';

/**
 * Prefetch route data on hover or idle
 * @param {string} route - Route to prefetch
 * @param {Object} options - Prefetch options
 */
export function usePrefetchRoute(route, options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, delay = 200 } = options;
  const timeoutRef = useRef(null);

  const prefetch = useCallback(() => {
    if (!enabled) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce prefetch
    timeoutRef.current = setTimeout(() => {
      // Prefetch common queries based on route
      switch (route) {
        case '/transactions':
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.TRANSACTIONS, 'date', 1000],
            queryFn: () => entities.Transaction.list({ sortBy: 'date', limit: 1000 }),
            staleTime: 60 * 1000,
          });
          break;
        
        case '/dashboard':
          // Prefetch critical dashboard data
          Promise.all([
            queryClient.prefetchQuery({
              queryKey: [QueryKeys.TRANSACTIONS, 'date', 100],
              queryFn: () => entities.Transaction.list({ sortBy: 'date', limit: 100 }),
              staleTime: 60 * 1000,
            }),
            queryClient.prefetchQuery({
              queryKey: [QueryKeys.SHIFTS],
              queryFn: () => entities.Shift.list(),
              staleTime: 60 * 1000,
            }),
          ]);
          break;

        case '/shifts':
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.SHIFTS],
            queryFn: () => entities.Shift.list(),
            staleTime: 60 * 1000,
          });
          break;

        case '/budget':
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.BUDGETS],
            queryFn: () => entities.Budget.list(),
            staleTime: 60 * 1000,
          });
          break;

        case '/goals':
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.GOALS],
            queryFn: () => entities.Goal.list(),
            staleTime: 60 * 1000,
          });
          break;

        case '/debt-planner':
          queryClient.prefetchQuery({
            queryKey: [QueryKeys.DEBTS],
            queryFn: () => entities.DebtAccount.list(),
            staleTime: 60 * 1000,
          });
          break;

        default:
          break;
      }
    }, delay);
  }, [route, queryClient, enabled, delay]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { prefetch, cancelPrefetch };
}

/**
 * Prefetch on link hover
 * @param {string} to - Route to prefetch
 */
export function usePrefetchOnHover(to) {
  const { prefetch, cancelPrefetch } = usePrefetchRoute(to);

  return {
    onMouseEnter: prefetch,
    onMouseLeave: cancelPrefetch,
    onTouchStart: prefetch,
  };
}

/**
 * Intelligent idle-time prefetching
 * Uses requestIdleCallback to prefetch during browser idle time
 */
export function useIdlePrefetch() {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    // Only prefetch if browser supports requestIdleCallback
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      return;
    }

    // Prefetch likely next routes based on current location
    const prefetchNextRoutes = () => {
      const currentRoute = location.pathname;
      
      // Define common navigation patterns
      const navigationPatterns = {
        '/': ['/dashboard', '/transactions', '/shifts'],
        '/transactions': ['/dashboard', '/budget', '/analytics'],
        '/dashboard': ['/transactions', '/goals', '/budget'],
        '/shifts': ['/paycheck', '/calendar', '/shift-rules'],
        '/budget': ['/transactions', '/goals', '/analytics'],
        '/goals': ['/budget', '/debt-planner', '/analytics'],
      };

      const nextRoutes = navigationPatterns[currentRoute] || [];

      // Prefetch data for likely next routes
      nextRoutes.forEach((route) => {
        window.requestIdleCallback(
          () => {
            usePrefetchRoute(route).prefetch();
          },
          { timeout: 2000 }
        );
      });
    };

    // Prefetch after a short delay
    const timeoutId = setTimeout(prefetchNextRoutes, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, queryClient]);
}

/**
 * Preload critical images
 * @param {string[]} imagePaths - Array of image paths to preload
 */
export function useImagePreload(imagePaths = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const images = imagePaths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.src = '';
      });
    };
  }, [imagePaths]);
}

/**
 * Parallel data loading hook
 * Loads multiple queries simultaneously with priority management
 */
export function useParallelQueries(queries = [], options = {}) {
  const queryClient = useQueryClient();
  const { priority = 'normal' } = options; // 'high', 'normal', 'low'

  useEffect(() => {
    if (queries.length === 0) return;

    const loadQueries = async () => {
      // Group queries by priority
      const highPriority = queries.filter(q => q.priority === 'high');
      const normalPriority = queries.filter(q => !q.priority || q.priority === 'normal');
      const lowPriority = queries.filter(q => q.priority === 'low');

      // Load high priority first
      if (highPriority.length > 0) {
        await Promise.all(
          highPriority.map(query =>
            queryClient.prefetchQuery({
              queryKey: query.queryKey,
              queryFn: query.queryFn,
              staleTime: query.staleTime || 60 * 1000,
            })
          )
        );
      }

      // Then normal priority
      if (normalPriority.length > 0) {
        await Promise.all(
          normalPriority.map(query =>
            queryClient.prefetchQuery({
              queryKey: query.queryKey,
              queryFn: query.queryFn,
              staleTime: query.staleTime || 60 * 1000,
            })
          )
        );
      }

      // Finally low priority (use idle callback if available)
      if (lowPriority.length > 0) {
        const prefetchLowPriority = () => {
          Promise.all(
            lowPriority.map(query =>
              queryClient.prefetchQuery({
                queryKey: query.queryKey,
                queryFn: query.queryFn,
                staleTime: query.staleTime || 60 * 1000,
              })
            )
          );
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(prefetchLowPriority, { timeout: 3000 });
        } else {
          setTimeout(prefetchLowPriority, 1000);
        }
      }
    };

    loadQueries();
  }, [queries, queryClient, priority]);
}

/**
 * DNS Prefetch helper
 * Adds DNS prefetch link tags for external domains
 */
export function useDNSPrefetch(domains = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const links = domains.map((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [domains]);
}

/**
 * Preconnect to external origins
 * Establishes early connections to important origins
 */
export function usePreconnect(origins = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const links = origins.map((origin) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [origins]);
}

/**
 * Resource preload helper
 * Preloads critical resources (fonts, scripts, styles)
 */
export function useResourcePreload(resources = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const links = resources.map((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as; // 'font', 'script', 'style', 'image', etc.
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);
}
