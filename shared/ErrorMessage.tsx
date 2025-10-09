/**
 * @fileoverview Error Message Components
 * @description Various error message components for different use cases
 */

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
  INFO: 'info',
} as const;

export type ErrorSeverity = (typeof ERROR_SEVERITY)[keyof typeof ERROR_SEVERITY];

/**
 * ErrorMessage component props
 */
export interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** Error message/description */
  message?: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional dismiss callback */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom content */
  children?: React.ReactNode;
}

/**
 * ErrorMessage Component
 * Displays error, warning, or info alerts with optional actions
 */
export function ErrorMessage({
  title = 'Error',
  message,
  severity = ERROR_SEVERITY.ERROR,
  onRetry,
  onDismiss,
  className,
  children,
}: ErrorMessageProps): JSX.Element {
  /**
   * Get icon based on severity
   */
  const getIcon = (): JSX.Element => {
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

  /**
   * Get alert variant based on severity
   */
  const getVariant = (): 'default' | 'destructive' => {
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
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-1">
          {title && <AlertTitle className="font-semibold">{title}</AlertTitle>}
          {message && <AlertDescription>{message}</AlertDescription>}
          {children}

          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm" className="h-8">
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button onClick={onDismiss} variant="ghost" size="sm" className="h-8">
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
 * InlineError component props
 */
export interface InlineErrorProps {
  /** Error message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Inline error message (smaller, more compact)
 */
export function InlineError({ message, className }: InlineErrorProps): JSX.Element | null {
  if (!message) return null;

  return (
    <p className={cn('text-sm text-destructive flex items-center gap-1 mt-1', className)}>
      <XCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

/**
 * FieldError component props
 */
export interface FieldErrorProps {
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Form field error message
 */
export function FieldError({ error, className }: FieldErrorProps): JSX.Element | null {
  if (!error) return null;

  return <p className={cn('text-xs text-destructive mt-1', className)}>{error}</p>;
}

export default ErrorMessage;
