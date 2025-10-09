/**
 * Type definitions for Lazy Loading utilities
 */

import type { ComponentType, ReactNode } from 'react';

/**
 * Dynamic import function that returns a promise resolving to a module
 */
export type ImportFunc<T extends ComponentType<any>> = () => Promise<{ default: T }>;

/**
 * Generic props type that any component might accept
 */
export type ComponentProps = Record<string, unknown>;

/**
 * Options for lazy loading with custom configuration
 */
export interface LazyLoadOptions {
  /** Custom loading fallback component */
  fallback?: ReactNode;
  /** Minimum delay in milliseconds before showing content (prevents flash) */
  delay?: number;
  /** Error callback function */
  onError?: (error: Error) => void;
}

/**
 * Map of component names to their import functions
 */
export type ImportsMap = Record<string, ImportFunc<ComponentType<any>>>;

/**
 * Map of component names to their lazy-loaded components
 */
export type LazyComponentsMap = Record<string, ComponentType<ComponentProps>>;
