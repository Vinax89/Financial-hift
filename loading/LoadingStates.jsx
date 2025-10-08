/**
 * @fileoverview Advanced loading state components
 * @description Rich loading states for better UX during data fetching and page transitions
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PulseLoader - Animated dots for inline loading
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.color - Color variant: 'primary' | 'secondary' | 'muted'
 * @param {string} props.text - Optional loading text
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function PulseLoader({ size = 'md', color = 'primary', text, className }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              sizes[size],
              colors[color]
            )}
            style={{
              animationDelay: `${i * 150}ms`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * ProgressiveLoader - Multi-step progress loader
 * @param {Object} props - Component props
 * @param {Array<{label: string, status: 'pending'|'loading'|'complete'|'error'}>} props.steps - Loading steps
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function ProgressiveLoader({ steps = [], className }) {
  const getStepIcon = (status) => {
    switch (status) {
      case 'complete':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'loading':
        return (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <div className="w-4 h-4 border-2 border-muted rounded-full" />
        );
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getStepIcon(step.status)}
          </div>
          <span className={cn(
            'text-sm transition-colors',
            step.status === 'complete' && 'text-green-600 line-through',
            step.status === 'loading' && 'text-foreground font-medium',
            step.status === 'error' && 'text-destructive',
            step.status === 'pending' && 'text-muted-foreground'
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * ShimmerEffect - Animated shimmer skeleton for loading content
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of lines to show
 * @param {string} props.variant - Variant: 'text' | 'card' | 'table' | 'list'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function ShimmerEffect({ lines = 3, variant = 'text', className }) {
  const shimmerClass = 'animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]';

  if (variant === 'card') {
    return (
      <div className={cn('rounded-lg border p-6 space-y-4', className)}>
        <div className={cn('h-4 rounded w-3/4', shimmerClass)} />
        <div className={cn('h-3 rounded w-full', shimmerClass)} />
        <div className={cn('h-3 rounded w-5/6', shimmerClass)} />
        <div className="flex gap-2 pt-2">
          <div className={cn('h-8 rounded w-20', shimmerClass)} />
          <div className={cn('h-8 rounded w-20', shimmerClass)} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn('h-10 rounded', shimmerClass)} />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className={cn('h-12 rounded flex-1', shimmerClass)} />
            <div className={cn('h-12 rounded flex-1', shimmerClass)} />
            <div className={cn('h-12 rounded flex-1', shimmerClass)} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-full', shimmerClass)} />
            <div className="flex-1 space-y-2">
              <div className={cn('h-4 rounded w-3/4', shimmerClass)} />
              <div className={cn('h-3 rounded w-1/2', shimmerClass)} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default text variant
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('h-4 rounded', shimmerClass)}
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
}

/**
 * PageTransition - Animated page transition wrapper
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.children - Content to show
 * @param {string} props.loadingText - Optional loading text
 * @param {string} props.variant - Transition variant: 'fade' | 'slide' | 'scale'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function PageTransition({
  loading,
  children,
  loadingText = 'Loading...',
  variant = 'fade',
  className,
}) {
  const variants = {
    fade: loading ? 'opacity-0' : 'opacity-100',
    slide: loading ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
    scale: loading ? 'scale-95 opacity-0' : 'scale-100 opacity-100',
  };

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px] gap-4', className)}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        {loadingText && (
          <p className="text-sm text-muted-foreground animate-pulse">{loadingText}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * SpinnerLoader - Simple spinning loader
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function SpinnerLoader({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        'border-primary border-t-transparent rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

/**
 * BarLoader - Horizontal progress bar loader
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage (0-100), undefined for indeterminate
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function BarLoader({ progress, className }) {
  const isIndeterminate = progress === undefined;

  return (
    <div className={cn('w-full h-1 bg-muted rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full bg-primary rounded-full transition-all duration-300',
          isIndeterminate && 'animate-indeterminate-progress'
        )}
        style={isIndeterminate ? undefined : { width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * DotsLoader - Three bouncing dots
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function DotsLoader({ size = 'md', className }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('flex gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-primary animate-bounce',
            sizes[size]
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Skeleton loading for card layouts
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton cards
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function SkeletonCard({ count = 1, className }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-lg border p-6 space-y-4 animate-pulse',
            className
          )}
        >
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="flex gap-2 pt-2">
            <div className="h-8 bg-muted rounded w-20" />
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * LoadingOverlay - Full-screen or contained loading overlay
 * @param {Object} props - Component props
 * @param {boolean} props.show - Show overlay
 * @param {string} props.text - Loading text
 * @param {string} props.variant - Variant: 'fixed' | 'absolute'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export function LoadingOverlay({ show, text = 'Loading...', variant = 'fixed', className }) {
  if (!show) return null;

  const positionClass = variant === 'fixed' ? 'fixed' : 'absolute';

  return (
    <div
      className={cn(
        positionClass,
        'inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <SpinnerLoader size="xl" />
      {text && (
        <p className="text-lg font-medium text-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Export all components
export default {
  PulseLoader,
  ProgressiveLoader,
  ShimmerEffect,
  PageTransition,
  SpinnerLoader,
  BarLoader,
  DotsLoader,
  SkeletonCard,
  LoadingOverlay,
};
