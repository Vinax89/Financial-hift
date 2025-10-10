/**
 * @fileoverview Route transition loader component
 * @description Displays a loading indicator during route transitions
 * with smooth animations and progress indication
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Route loading indicator with progress bar
 * @component
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {boolean} props.showProgress - Whether to show progress bar
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 * 
 * @example
 * <Suspense fallback={<RouteLoader message="Loading Dashboard..." />}>
 *   <Dashboard />
 * </Suspense>
 */
export function RouteLoader({ 
  message = "Loading...", 
  showProgress = true,
  className 
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    // Simulate progress for better UX
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90%, complete on actual load
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [showProgress]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] gap-4",
      className
    )}>
      {/* Spinner */}
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      
      {/* Message */}
      <p className="text-sm text-muted-foreground animate-pulse">
        {message}
      </p>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Minimal route loader for faster transitions
 * @component
 * @param {Object} props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @returns {JSX.Element}
 * 
 * @example
 * <Suspense fallback={<MinimalRouteLoader size="sm" />}>
 *   <ChildComponent />
 * </Suspense>
 */
export function MinimalRouteLoader({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
    </div>
  );
}

/**
 * Full page route loader with logo
 * @component
 * @param {Object} props
 * @param {string} props.appName - Application name
 * @returns {JSX.Element}
 * 
 * @example
 * <Suspense fallback={<FullPageLoader appName="Financial Hift" />}>
 *   <App />
 * </Suspense>
 */
export function FullPageLoader({ appName = "Financial $hift" }) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6">
      {/* App Logo/Name */}
      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        {appName}
      </div>
      
      {/* Animated Loader */}
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary/20 animate-pulse" />
      </div>
      
      {/* Loading Text */}
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading your financial dashboard...
      </p>
    </div>
  );
}

/**
 * Skeleton route loader that matches page layout
 * @component
 * @param {Object} props
 * @param {string} props.layout - Layout type: 'dashboard', 'list', 'form'
 * @returns {JSX.Element}
 */
export function SkeletonRouteLoader({ layout = 'dashboard' }) {
  if (layout === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        
        {/* Chart Skeleton */}
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        
        {/* List Items */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (layout === 'form') {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="h-8 w-56 bg-muted animate-pulse rounded" />
        
        {/* Form Fields */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        ))}
        
        {/* Button */}
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return <RouteLoader />;
}

export default RouteLoader;
