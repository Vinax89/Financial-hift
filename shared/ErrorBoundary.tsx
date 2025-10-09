/**
 * @fileoverview Error Boundary component for React error handling
 * @description Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */

import React, { Component, ReactNode, ComponentType } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/ui/button';
import { ThemedCard } from '@/ui/enhanced-components';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI to display when an error occurs */
  fallback?: ReactNode;
  /** Custom error message to display */
  message?: string;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset error boundary when this key changes */
  resetKeys?: Array<string | number>;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error object */
  error: Error | null;
  /** React error info with component stack */
  errorInfo: React.ErrorInfo | null;
  /** Number of retry attempts */
  retryCount: number;
}

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error, errorInfo: React.ErrorInfo) => void;

/**
 * HOC props type
 */
type WithErrorBoundaryProps = Record<string, unknown>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe way to check if we're in development mode
 * @returns {boolean} True if in development environment
 */
const isDevelopment = ((): boolean => {
  try {
    // Check if running on localhost
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      return true;
    }
    // Check Vite dev mode
    if (import.meta.env.DEV) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
})();

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

/**
 * Error Boundary component that catches React errors
 * @class ErrorBoundary
 * @extends {Component<ErrorBoundaryProps, ErrorBoundaryState>}
 * 
 * @example
 * <ErrorBoundary message="Failed to load dashboard">
 *   <Dashboard />
 * </ErrorBoundary>
 * 
 * @example
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  /**
   * Update state when an error is caught
   * @param {Error} error - The error that was thrown
   * @returns {Partial<ErrorBoundaryState>} New state
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught
   * @param {Error} error - The error that was thrown
   * @param {React.ErrorInfo} errorInfo - React error info with component stack
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would log to a service like Sentry or LogRocket
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Reset error boundary and try rendering again
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error boundary when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.handleRetry();
    }
  }

  /**
   * Handle retry button click
   */
  handleRetry = (): void => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  /**
   * Render error UI or children
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedCard className="m-4 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive opacity-50" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground text-sm max-w-md">
                {this.props.message ||
                  'An unexpected error occurred in this section. Please try again or refresh the page.'}
              </p>
            </div>

            {isDevelopment && this.state.error && this.state.errorInfo && (
              <details className="mt-4 p-4 bg-muted rounded-lg text-left w-full max-w-2xl">
                <summary className="cursor-pointer font-medium text-sm mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-64">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleRetry} variant="default" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {this.state.retryCount > 2 && (
              <p className="text-sm text-muted-foreground mt-4">
                If this problem persists, please try contacting support.
              </p>
            )}
          </div>
        </ThemedCard>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for error handling in functional components
 * @returns {ErrorHandler} Error handler function
 * 
 * @example
 * function MyComponent() {
 *   const handleError = useErrorHandler();
 *   
 *   try {
 *     // risky operation
 *   } catch (error) {
 *     handleError(error, { componentStack: '' });
 *   }
 * }
 */
export function useErrorHandler(): ErrorHandler {
  return (error: Error, errorInfo: React.ErrorInfo): void => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    // You can dispatch to a global error state here if needed
  };
}

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

/**
 * Higher-order component wrapper for ErrorBoundary
 * @template P - Component props type
 * @param {ComponentType<P>} Component - Component to wrap
 * @param {ReactNode} fallback - Optional fallback UI
 * @returns {ComponentType<P>} Wrapped component with ErrorBoundary
 * 
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent, <ErrorFallback />);
 * 
 * @example
 * export default withErrorBoundary(Dashboard);
 */
export function withErrorBoundary<P extends WithErrorBoundaryProps>(
  Component: ComponentType<P>,
  fallback?: ReactNode
): ComponentType<P> {
  const WithErrorBoundaryComponent = (props: P): JSX.Element => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for debugging
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithErrorBoundaryComponent;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ErrorBoundary };
export default ErrorBoundary;
