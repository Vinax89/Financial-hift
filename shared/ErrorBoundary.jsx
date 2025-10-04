import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/ui/button.jsx';
import { ThemedCard } from '@/ui/enhanced-components.jsx';

// Safe way to check if we're in development mode without using 'process'
const isDevelopment = (() => {
    try {
        // This check is imperfect but safer than accessing process.env directly in a browser context.
        // A build tool would typically replace a variable like `process.env.NODE_ENV`.
        // Without a build tool, we can make an educated guess.
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
})();

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: 0 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console, which is helpful in any environment
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In a real production environment, you would log to a service like Sentry or LogRocket
        // logErrorToService(error, errorInfo);
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    render() {
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
                                 "An unexpected error occurred in this section. Please try again or refresh the page."}
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
                            <Button 
                                onClick={this.handleRetry}
                                variant="default"
                                size="sm"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                            <Button 
                                onClick={() => window.location.href = '/'}
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

// Hook version for functional components
export function useErrorHandler() {
    return (error, errorInfo) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo);
        // You can dispatch to a global error state here if needed
    };
}

// Higher-order component wrapper
export function withErrorBoundary(Component, fallback) {
    return function WithErrorBoundaryComponent(props) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

export { ErrorBoundary };