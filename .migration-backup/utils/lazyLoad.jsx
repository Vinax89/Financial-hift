/**
 * @fileoverview Lazy loading utility with Suspense wrapper
 * @description Provides utilities for code splitting and lazy loading React components
 * with loading fallbacks and error boundaries
 */

import { lazy, Suspense } from 'react';
import { CardSkeleton } from '@/shared/SkeletonLoaders';

/**
 * Wraps a lazy-loaded component with Suspense boundary
 * @param {Function} importFunc - Dynamic import function
 * @param {React.ReactNode} fallback - Optional custom loading component
 * @returns {React.Component} Lazy-loaded component with Suspense wrapper
 * 
 * @example
 * const Dashboard = lazyLoad(() => import('@/pages/Dashboard'));
 */
export function lazyLoad(importFunc, fallback = null) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props) {
    return (
      <Suspense fallback={fallback || <CardSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preloads a lazy-loaded component
 * Useful for optimistic loading on hover or route preparation
 * @param {Function} importFunc - Dynamic import function
 * @returns {Promise} Promise that resolves when component is loaded
 * 
 * @example
 * <Link 
 *   to="/dashboard" 
 *   onMouseEnter={() => preloadComponent(() => import('@/pages/Dashboard'))}
 * >
 */
export function preloadComponent(importFunc) {
  return importFunc();
}

/**
 * Creates a lazy-loaded component with custom loading state
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @param {React.ReactNode} options.fallback - Custom loading component
 * @param {number} options.delay - Minimum delay before showing content (prevents flash)
 * @param {Function} options.onError - Error callback
 * @returns {React.Component} Configured lazy component
 * 
 * @example
 * const Dashboard = lazyLoadWithOptions(
 *   () => import('@/pages/Dashboard'),
 *   { 
 *     fallback: <DashboardSkeleton />,
 *     delay: 200 
 *   }
 * );
 */
export function lazyLoadWithOptions(importFunc, options = {}) {
  const { fallback = <CardSkeleton />, delay = 0, onError } = options;
  
  const LazyComponent = lazy(async () => {
    try {
      // Add minimum delay to prevent flashing
      const [component] = await Promise.all([
        importFunc(),
        delay > 0 ? new Promise(resolve => setTimeout(resolve, delay)) : Promise.resolve()
      ]);
      return component;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  });
  
  return function LazyLoadedComponentWithOptions(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy loads multiple components in parallel
 * @param {Object} imports - Object mapping names to import functions
 * @returns {Object} Object with lazy-loaded components
 * 
 * @example
 * const { Dashboard, Analytics } = lazyLoadMultiple({
 *   Dashboard: () => import('@/pages/Dashboard'),
 *   Analytics: () => import('@/pages/Analytics')
 * });
 */
export function lazyLoadMultiple(imports) {
  const lazyComponents = {};
  
  for (const [name, importFunc] of Object.entries(imports)) {
    lazyComponents[name] = lazyLoad(importFunc);
  }
  
  return lazyComponents;
}

/**
 * Retries a failed lazy load up to specified attempts
 * Useful for handling network issues
 * @param {Function} importFunc - Dynamic import function
 * @param {number} retries - Maximum retry attempts
 * @param {number} retryDelay - Delay between retries (ms)
 * @returns {Promise} Component module
 * 
 * @example
 * const Dashboard = lazy(() => 
 *   lazyLoadWithRetry(() => import('@/pages/Dashboard'), 3, 1000)
 * );
 */
export async function lazyLoadWithRetry(importFunc, retries = 3, retryDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        console.warn(`Retry ${i + 1}/${retries} for lazy load...`);
      }
    }
  }
  
  throw new Error(`Failed to load component after ${retries} retries: ${lastError.message}`);
}

/**
 * Default export for common use case
 */
export default lazyLoad;
