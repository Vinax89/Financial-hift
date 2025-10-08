import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert.jsx';
import { Button } from '@/ui/button.jsx';

/**
 * Standardized error message component for consistent error display across the app
 * @component
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object containing message
 * @param {string} props.title - Error title/heading
 * @param {Function} props.onRetry - Callback function for retry action
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Formatted error message with optional retry button
 */
export function ErrorMessage({ 
  error, 
  title = 'Error',
  onRetry,
  className = ''
}) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error?.message || 'An unexpected error occurred'}</span>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="ml-4 shrink-0"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Error message specifically for data loading failures
 */
export function DataLoadError({ onRetry }) {
  return (
    <ErrorMessage
      error={{ message: 'Failed to load data. Please check your connection and try again.' }}
      title="Loading Failed"
      onRetry={onRetry}
    />
  );
}

/**
 * Error message for form submission failures
 */
export function FormSubmitError({ error, onRetry }) {
  return (
    <ErrorMessage
      error={error || { message: 'Failed to submit form. Please try again.' }}
      title="Submission Failed"
      onRetry={onRetry}
    />
  );
}

/**
 * Generic inline error for smaller contexts
 */
export function InlineError({ message }) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
