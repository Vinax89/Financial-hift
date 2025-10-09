import React from 'react';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/ui/button';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 * 
 * Usage:
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    const errorDetails = {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      location: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', errorDetails);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
    }

    // TODO: Send error to logging service in production
    // Example: logErrorToService(errorDetails);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full">
            <div className="bg-card border border-border rounded-lg shadow-lg p-6 space-y-6">
              {/* Error Icon and Title */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-muted-foreground">
                    We&apos;re sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
                  </p>
                </div>
              </div>

              {/* Error Message (User-friendly) */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Error Details:</p>
                <p className="text-sm text-muted-foreground">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>

              {/* Development-only: Full error stack */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
                  <summary className="cursor-pointer font-medium text-foreground mb-2">
                    Component Stack (Development Only)
                  </summary>
                  <pre className="text-muted-foreground whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={this.handleReset}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>

              {/* Error Count (for debugging recurring errors) */}
              {this.state.errorCount > 1 && (
                <div className="text-xs text-muted-foreground">
                  This error has occurred {this.state.errorCount} times.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple Error Fallback Component
 * Can be used as a custom fallback prop for ErrorBoundary
 */
export function SimpleErrorFallback({ error, resetError }) {
  return (
    <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
      <h3 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Error
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      {resetError && (
        <Button onClick={resetError} size="sm" variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Form-specific Error Boundary
 * Provides better UX for form errors
 */
export function FormErrorBoundary({ children, formName = 'form' }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                {formName} Error
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                There was an error loading or processing this form. Please try refreshing the page.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                size="sm"
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;

