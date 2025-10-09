/**
 * Optimized Lazy Loading System
 * 
 * Features:
 * - Intelligent code splitting
 * - Retry logic for failed chunks
 * - Loading states with skeleton UI
 * - Preloading strategies
 * - Error boundaries for each lazy component
 */

import React, { Suspense, lazy } from 'react';
import { announceLoading, announceError } from '@/utils/accessibility';

/**
 * Loading fallback component with skeleton UI
 */
export function LoadingFallback({ message = 'Loading...', variant = 'default' }) {
    React.useEffect(() => {
        announceLoading(message);
    }, [message]);

    if (variant === 'page') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">{message}</p>
                </div>
            </div>
        );
    }

    if (variant === 'skeleton') {
        return (
            <div className="space-y-4 p-4">
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                <div className="h-32 bg-muted animate-pulse rounded"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

/**
 * Error fallback component for lazy loaded components
 */
export function LazyErrorFallback({ error, resetErrorBoundary, componentName }) {
    React.useEffect(() => {
        announceError(`Failed to load ${componentName || 'component'}. Please try again.`);
    }, [componentName]);

    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-12 w-12 text-destructive"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    Failed to load {componentName || 'component'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {error?.message || 'An unexpected error occurred while loading this component.'}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

/**
 * Enhanced lazy loading with retry logic
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Options
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithRetry(importFunc, options = {}) {
    const {
        retries = 3,
        retryDelay = 1000,
        componentName = 'Component',
    } = options;

    return lazy(async () => {
        let lastError;

        for (let i = 0; i < retries; i++) {
            try {
                return await importFunc();
            } catch (error) {
                lastError = error;
                console.warn(
                    `Failed to load ${componentName} (attempt ${i + 1}/${retries}):`,
                    error
                );

                // Wait before retrying
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
                }
            }
        }

        // If all retries failed, throw the error
        console.error(`Failed to load ${componentName} after ${retries} attempts:`, lastError);
        throw lastError;
    });
}

/**
 * Preload a lazy component
 * @param {Function} importFunc - Dynamic import function
 */
export function preloadComponent(importFunc) {
    return importFunc();
}

/**
 * Create a lazy loaded component with error boundary and loading state
 */
export function createLazyComponent(importFunc, options = {}) {
    const {
        fallback = <LoadingFallback variant="default" />,
        componentName = 'Component',
        onError = null,
    } = options;

    const LazyComponent = lazyWithRetry(importFunc, { componentName });

    return function LazyComponentWrapper(props) {
        return (
            <ErrorBoundary
                fallback={LazyErrorFallback}
                onError={onError}
                componentName={componentName}
            >
                <Suspense fallback={fallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ErrorBoundary>
        );
    };
}

/**
 * Simple error boundary for lazy components
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('LazyComponent error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const Fallback = this.props.fallback;
            return (
                <Fallback
                    error={this.state.error}
                    resetErrorBoundary={this.resetErrorBoundary}
                    componentName={this.props.componentName}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Preload components on idle
 */
export function preloadOnIdle(importFuncs) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
            importFuncs.forEach(importFunc => {
                preloadComponent(importFunc);
            });
        });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            importFuncs.forEach(importFunc => {
                preloadComponent(importFunc);
            });
        }, 2000);
    }
}

/**
 * Preload components on hover
 */
export function usePreloadOnHover(importFunc) {
    const preloaded = React.useRef(false);

    const handleMouseEnter = React.useCallback(() => {
        if (!preloaded.current) {
            preloadComponent(importFunc);
            preloaded.current = true;
        }
    }, [importFunc]);

    return handleMouseEnter;
}

/**
 * Route-based code splitting helper
 */
export function createLazyRoute(importFunc, options = {}) {
    const {
        pageName = 'Page',
        preload = false,
    } = options;

    const LazyPage = createLazyComponent(importFunc, {
        fallback: <LoadingFallback message={`Loading ${pageName}...`} variant="page" />,
        componentName: pageName,
    });

    // Preload if specified
    if (preload) {
        preloadComponent(importFunc);
    }

    return LazyPage;
}

/**
 * Lazy load all pages at once (useful for batch loading)
 */
export function createLazyPages(pages) {
    return Object.entries(pages).reduce((acc, [key, importFunc]) => {
        acc[key] = createLazyRoute(importFunc, {
            pageName: key,
        });
        return acc;
    }, {});
}

/**
 * Hook to preload routes on navigation intent
 */
export function usePreloadOnNavigationIntent(routes) {
    React.useEffect(() => {
        const preloadRoute = (path) => {
            const route = routes.find(r => r.path === path);
            if (route && route.preload) {
                route.preload();
            }
        };

        // Listen for link hover
        const handleLinkHover = (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const path = new URL(link.href).pathname;
                preloadRoute(path);
            }
        };

        document.addEventListener('mouseover', handleLinkHover);
        return () => document.removeEventListener('mouseover', handleLinkHover);
    }, [routes]);
}

/**
 * Intelligent prefetching based on viewport visibility
 */
export function usePrefetchOnVisible(importFunc, enabled = true) {
    const ref = React.useRef(null);
    const preloaded = React.useRef(false);

    React.useEffect(() => {
        if (!enabled || preloaded.current || !ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !preloaded.current) {
                    preloadComponent(importFunc);
                    preloaded.current = true;
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
            }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [importFunc, enabled]);

    return ref;
}

/**
 * Priority-based loading
 */
export const LoadPriority = {
    CRITICAL: 'critical', // Load immediately
    HIGH: 'high',         // Load on mount
    MEDIUM: 'medium',     // Load on idle
    LOW: 'low',           // Load on interaction
};

/**
 * Create lazy component with priority
 */
export function createPrioritizedLazyComponent(importFunc, priority = LoadPriority.MEDIUM, options = {}) {
    const LazyComponent = createLazyComponent(importFunc, options);

    return function PrioritizedComponent(props) {
        const [shouldLoad, setShouldLoad] = React.useState(
            priority === LoadPriority.CRITICAL || priority === LoadPriority.HIGH
        );

        React.useEffect(() => {
            if (shouldLoad) return;

            if (priority === LoadPriority.MEDIUM) {
                // Load on idle
                if ('requestIdleCallback' in window) {
                    const id = window.requestIdleCallback(() => setShouldLoad(true));
                    return () => window.cancelIdleCallback(id);
                } else {
                    const timeout = setTimeout(() => setShouldLoad(true), 1000);
                    return () => clearTimeout(timeout);
                }
            }
        }, [shouldLoad, priority]);

        // For LOW priority, load on user interaction
        const handleInteraction = React.useCallback(() => {
            if (priority === LoadPriority.LOW) {
                setShouldLoad(true);
            }
        }, [priority]);

        if (!shouldLoad) {
            return (
                <div
                    onClick={handleInteraction}
                    onMouseEnter={handleInteraction}
                    onFocus={handleInteraction}
                >
                    {options.placeholder || <LoadingFallback variant="skeleton" />}
                </div>
            );
        }

        return <LazyComponent {...props} />;
    };
}

/**
 * Bundle analyzer helper (development only)
 */
export function logChunkLoading(chunkName) {
    if (import.meta.env.DEV) {
        console.log(`[Lazy Loading] Loading chunk: ${chunkName}`);
    }
}

/**
 * Export all utilities
 */
export default {
    LoadingFallback,
    LazyErrorFallback,
    lazyWithRetry,
    preloadComponent,
    createLazyComponent,
    createLazyRoute,
    createLazyPages,
    preloadOnIdle,
    usePreloadOnHover,
    usePreloadOnNavigationIntent,
    usePrefetchOnVisible,
    LoadPriority,
    createPrioritizedLazyComponent,
    logChunkLoading,
};
