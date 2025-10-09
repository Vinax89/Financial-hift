/**
 * Type definitions for Lazy Loading System
 */

import type { ComponentType, ReactNode } from 'react';

/**
 * Loading fallback variants
 */
export type LoadingVariant = 'default' | 'page' | 'skeleton';

/**
 * Props for LoadingFallback component
 */
export interface LoadingFallbackProps {
  message?: string;
  variant?: LoadingVariant;
}

/**
 * Props for LazyErrorFallback component
 */
export interface LazyErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  componentName?: string;
}

/**
 * Options for lazy loading with retry logic
 */
export interface LazyRetryOptions {
  retries?: number;
  retryDelay?: number;
  componentName?: string;
}

/**
 * Options for creating lazy components
 */
export interface CreateLazyComponentOptions {
  fallback?: ReactNode;
  componentName?: string;
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | null;
  placeholder?: ReactNode;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ComponentType<LazyErrorFallbackProps>;
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | null;
  componentName?: string;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Dynamic import function type
 */
export type ImportFunc<T extends ComponentType<any>> = () => Promise<{ default: T }>;

/**
 * Options for creating lazy routes
 */
export interface CreateLazyRouteOptions {
  pageName?: string;
  preload?: boolean;
}

/**
 * Map of page names to import functions
 */
export type PagesMap = Record<string, ImportFunc<ComponentType<any>>>;

/**
 * Route with preload function
 */
export interface RouteWithPreload {
  path: string;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

/**
 * Load priority levels
 */
export enum LoadPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Options for prioritized lazy components
 */
export interface PrioritizedLazyComponentOptions extends CreateLazyComponentOptions {
  placeholder?: ReactNode;
}
