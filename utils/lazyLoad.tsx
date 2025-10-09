/**
 * @fileoverview Lazy loading utility with Suspense wrapper
 * @description Provides utilities for code splitting and lazy loading React components
 * with loading fallbacks and error boundaries
 */

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { CardSkeleton } from '@/shared/SkeletonLoaders';
import type { 
  ImportFunc, 
  ComponentProps, 
  LazyLoadOptions, 
  ImportsMap, 
  LazyComponentsMap 
} from '../types/lazyLoad.types';

/**
 * Wraps a lazy-loaded component with Suspense boundary
 * @param importFunc - Dynamic import function
 * @param fallback - Optional custom loading component
 * @returns Lazy-loaded component with Suspense wrapper
 * 
 * @example
 * const Dashboard = lazyLoad(() => import('@/pages/Dashboard'));
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: ImportFunc<T>,
  fallback: ReactNode = null
): ComponentType<any> {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props: any) {
    return (
      <Suspense fallback={fallback || <CardSkeleton className="" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preloads a lazy-loaded component
 * Useful for optimistic loading on hover or route preparation
 * @param importFunc - Dynamic import function
 * @returns Promise that resolves when component is loaded
 * 
 * @example
 * <Link 
 *   to="/dashboard" 
 *   onMouseEnter={() => preloadComponent(() => import('@/pages/Dashboard'))}
 * >
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: ImportFunc<T>
): Promise<{ default: T }> {
  return importFunc();
}

/**
 * Creates a lazy-loaded component with custom loading state
 * @param importFunc - Dynamic import function
 * @param options - Configuration options
 * @returns Configured lazy component
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
export function lazyLoadWithOptions<T extends ComponentType<any>>(
  importFunc: ImportFunc<T>,
  options: LazyLoadOptions = {}
): ComponentType<any> {
  const { fallback = <CardSkeleton className="" />, delay = 0, onError } = options;
  
  const LazyComponent = lazy(async () => {
    try {
      // Add minimum delay to prevent flashing
      const [component] = await Promise.all([
        importFunc(),
        delay > 0 ? new Promise(resolve => setTimeout(resolve, delay)) : Promise.resolve()
      ]);
      return component;
    } catch (error) {
      if (onError) onError(error as Error);
      throw error;
    }
  });
  
  return function LazyLoadedComponentWithOptions(props: any) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy loads multiple components in parallel
 * @param imports - Object mapping names to import functions
 * @returns Object with lazy-loaded components
 * 
 * @example
 * const { Dashboard, Analytics } = lazyLoadMultiple({
 *   Dashboard: () => import('@/pages/Dashboard'),
 *   Analytics: () => import('@/pages/Analytics')
 * });
 */
export function lazyLoadMultiple(imports: ImportsMap): LazyComponentsMap {
  const lazyComponents: LazyComponentsMap = {};
  
  for (const [name, importFunc] of Object.entries(imports)) {
    lazyComponents[name] = lazyLoad(importFunc);
  }
  
  return lazyComponents;
}

/**
 * Retries a failed lazy load up to specified attempts
 * Useful for handling network issues
 * @param importFunc - Dynamic import function
 * @param retries - Maximum retry attempts
 * @param retryDelay - Delay between retries (ms)
 * @returns Component module
 * 
 * @example
 * const Dashboard = lazy(() => 
 *   lazyLoadWithRetry(() => import('@/pages/Dashboard'), 3, 1000)
 * );
 */
export async function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFunc: ImportFunc<T>,
  retries = 3,
  retryDelay = 1000
): Promise<{ default: T }> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        console.warn(`Retry ${i + 1}/${retries} for lazy load...`);
      }
    }
  }
  
  throw new Error(`Failed to load component after ${retries} retries: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Default export for common use case
 */
export default lazyLoad;
