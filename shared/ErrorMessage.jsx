import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { Button } from '@/ui/button';
import { cn } from '@/lib/utils';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * ErrorMessage component
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message/description
 * @param {string} [props.severity='error'] - Error severity level (error, warning, info)
 * @param {Function} [props.onRetry] - Optional retry callback
 * @param {Function} [props.onDismiss] - Optional dismiss callback
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Custom content
 * @returns {JSX.Element} Error message component
 */
export function ErrorMessage({
  title = 'Error',
  message,
  severity = ERROR_SEVERITY.ERROR,
  onRetry,
  onDismiss,
  className,
  children
}) {
  const getIcon = () => {
    switch (severity) {
      case ERROR_SEVERITY.WARNING:
        return <AlertTriangle className="h-4 w-4" />;
      case ERROR_SEVERITY.INFO:
        return <AlertCircle className="h-4 w-4" />;
      case ERROR_SEVERITY.ERROR:
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (severity) {
      case ERROR_SEVERITY.WARNING:
        return 'default'; // Using default for warning
      case ERROR_SEVERITY.INFO:
        return 'default';
      case ERROR_SEVERITY.ERROR:
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant()} className={cn('mb-4', className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
          {message && <AlertDescription>{message}</AlertDescription>}
          {children}
          
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                >
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button 
                  onClick={onDismiss} 
                  variant="ghost" 
                  size="sm"
                  className="h-8"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Inline error message (smaller, more compact)
 * @component
 */
export function InlineError({ message, className }) {
  if (!message) return null;
  
  return (
    <p className={cn('text-sm text-destructive flex items-center gap-1 mt-1', className)}>
      <XCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

/**
 * Form field error message
 * @component
 */
export function FieldError({ error, className }) {
  if (!error) return null;
  
  return (
    <p className={cn('text-xs text-destructive mt-1', className)}>
      {error}
    </p>
  );
}

export default ErrorMessage;