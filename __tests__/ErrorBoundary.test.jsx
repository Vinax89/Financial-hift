import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary, { FormErrorBoundary } from '../ui/ErrorBoundary';

describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError = ({ shouldThrow = true }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Success</div>;
  };

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should display custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should show error details in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // In development, component stack should be visible
    expect(screen.getByText(/Component Stack/i)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });
});

describe('FormErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Form error');
  };

  it('should render children when no error', () => {
    render(
      <FormErrorBoundary formName="Test Form">
        <div>Form content</div>
      </FormErrorBoundary>
    );
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('should display form-specific error message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <FormErrorBoundary formName="Budget Form">
        <ThrowError />
      </FormErrorBoundary>
    );

    expect(screen.getByText(/Budget Form Error/i)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
