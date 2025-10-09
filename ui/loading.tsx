// @ts-nocheck

import React from 'react';
import { Skeleton } from '@/ui/skeleton';
import { Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/ThemeProvider';

// Professional loading component with enhanced UX
export function Loading({ 
    variant = 'spinner', 
    size = 'md', 
    className,
    children,
    text = 'Loading...',
    progress = null,
    error = false,
    success = false,
    theme: forcedTheme = null
}) {
    const { theme } = useTheme();
    const currentTheme = forcedTheme || theme;
    
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    const containerSizeClasses = {
        sm: 'p-4',
        md: 'p-8',
        lg: 'p-12',
        xl: 'p-16'
    };

    if (success) {
        return (
            <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
                <CheckCircle className={cn('animate-bounce text-emerald-600 dark:text-emerald-400 drop-shadow-lg', sizeClasses[size])} />
                <p className={cn('mt-4 text-emerald-700 dark:text-emerald-300 font-semibold', textSizeClasses[size])}>
                    Complete!
                </p>
                {children}
            </div>
        );
    }

    if (error) {
        return (
            <div role="alert" aria-live="assertive" className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
                <AlertCircle className={cn('text-red-600 dark:text-red-400 drop-shadow-lg', sizeClasses[size])} />
                <p className={cn('mt-4 text-red-700 dark:text-red-300 font-semibold', textSizeClasses[size])}>
                    Something went wrong
                </p>
                {children}
            </div>
        );
    }

    if (variant === 'skeleton') {
        return <Skeleton role="progressbar" aria-label="Loading content" className={cn('rounded-xl animate-pulse bg-muted/80', className)} />;
    }

    if (variant === 'progress' && progress !== null) {
        return (
            <div role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100" aria-label={`Loading progress: ${Math.round(progress)}%`} className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
                <div className="w-full max-w-xs mb-8">
                    <div className={cn(
                        'rounded-full h-4 overflow-hidden shadow-inner',
                        currentTheme === 'light' ? 'bg-slate-200' : 'bg-slate-700'
                    )}>
                        <div 
                            className={cn(
                                'h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden',
                                currentTheme === 'oled' 
                                    ? 'bg-gradient-to-r from-primary via-primary/90 to-primary shadow-lg shadow-primary/30' 
                                    : 'bg-primary'
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                        </div>
                    </div>
                </div>
                <Loader2 className={cn('animate-spin text-primary mb-4 drop-shadow-lg', sizeClasses[size])} />
                {text && (
                    <p className={cn('text-muted-foreground text-center font-semibold', textSizeClasses[size])}>
                        {text}
                    </p>
                )}
                <p className={cn('text-primary mt-3 font-bold', textSizeClasses[size])}>
                    {Math.round(progress)}% complete
                </p>
                {children}
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div role="status" aria-live="polite" className={cn('flex items-center gap-3 py-2', className)}>
                <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
                {text && (
                    <span className={cn('text-muted-foreground font-medium', textSizeClasses[size])}>
                        {text}
                    </span>
                )}
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div role="status" aria-label="Loading" className={cn('flex items-center justify-center', containerSizeClasses[size], className)}>
                <div className="flex space-x-2">
                    {[0, 150, 300].map((delay, index) => (
                        <div 
                            key={index}
                            className={cn(
                                'w-3 h-3 rounded-full animate-bounce',
                                currentTheme === 'oled' 
                                    ? 'bg-primary shadow-lg shadow-primary/40' 
                                    : 'bg-primary'
                            )} 
                            style={{ animationDelay: `${delay}ms` }}
                        />
                    ))}
                </div>
                {text && (
                    <p className={cn('ml-6 text-muted-foreground font-medium', textSizeClasses[size])}>
                        {text}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div role="status" aria-live="polite" aria-label="Loading" className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
                <div className={cn(
                    'relative rounded-full flex items-center justify-center',
                    currentTheme === 'oled' && 'shadow-2xl shadow-primary/30',
                    size === 'sm' ? 'h-16 w-16' :
                    size === 'md' ? 'h-20 w-20' :
                    size === 'lg' ? 'h-24 w-24' : 'h-28 w-28'
                )}>
                    <div className={cn(
                        'absolute inset-0 rounded-full animate-ping',
                        currentTheme === 'oled' 
                            ? 'bg-primary/40 shadow-2xl shadow-primary/20' 
                            : 'bg-primary/30'
                    )} />
                    <Zap className={cn('relative text-primary z-10 drop-shadow-lg', sizeClasses[size])} />
                </div>
                {text && (
                    <p className={cn('mt-8 text-muted-foreground text-center font-semibold', textSizeClasses[size])}>
                        {text}
                    </p>
                )}
                {children}
            </div>
        );
    }

    // Enhanced default spinner variant
    return (
        <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center', containerSizeClasses[size], className)}>
            <Loader2 className={cn(
                'animate-spin text-primary drop-shadow-lg',
                currentTheme === 'oled' && 'filter drop-shadow-[0_0_8px_theme(colors.primary.DEFAULT)]',
                sizeClasses[size]
            )} />
            {text && (
                <p className={cn('mt-6 text-muted-foreground text-center font-semibold', textSizeClasses[size])}>
                    {text}
                </p>
            )}
            {children}
        </div>
    );
}

// Enhanced specific loading components with better UX
export function TableLoading({ rows = 5, columns = 4, className }) {
    return (
        <div role="progressbar" aria-label="Loading table data" className={cn("space-y-4 p-6", className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex space-x-6">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton 
                            key={j} 
                            className={cn(
                                "h-8 flex-1 rounded-lg",
                                j === 0 && "flex-[2]", // Make first column wider
                                j === columns - 1 && "w-20 flex-none" // Make last column fixed width
                            )}
                            style={{ 
                                animationDelay: `${(i * columns + j) * 100}ms`,
                                animationDuration: '2s'
                            }} 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardLoading({ className }) {
    return (
        <div role="progressbar" aria-label="Loading card content" className={cn("p-8 rounded-2xl border bg-card shadow-lg", className)}>
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex space-x-4 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    );
}

export function ChartLoading({ className }) {
    return (
        <div role="progressbar" aria-label="Loading chart data" className={cn("p-8 rounded-2xl border bg-card min-h-[400px] shadow-lg", className)}>
            <div className="space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="flex items-end justify-between h-64 space-x-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton 
                            key={i} 
                            className="flex-1 rounded-t-lg"
                            style={{ 
                                height: `${Math.random() * 60 + 20}%`,
                                animationDelay: `${i * 150}ms`
                            }}
                        />
                    ))}
                </div>
                <div className="flex space-x-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    );
}

// Enhanced loading wrapper with better error states
export function LoadingWrapper({ 
    isLoading, 
    error,
    success,
    children, 
    fallback = <Loading />,
    className,
    emptyState = null,
    isEmpty = false
}) {
    if (error) {
        return (
            <div role="alert" aria-live="assertive" className={cn("flex flex-col items-center justify-center p-16 space-y-6 text-center", className)}>
                <AlertCircle className="h-16 w-16 text-red-500 drop-shadow-lg" />
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Something went wrong</h3>
                    <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again later.'}
                    </p>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className={cn("min-h-[300px] flex items-center justify-center", className)}>
                {fallback}
            </div>
        );
    }

    if (success) {
        return (
            <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center p-16 space-y-6", className)}>
                <CheckCircle className="h-16 w-16 text-emerald-500 drop-shadow-lg" />
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Success!</h3>
            </div>
        );
    }

    if (isEmpty && emptyState) {
        return <div className={cn("min-h-[300px]", className)}>{emptyState}</div>;
    }
    
    return <div className={className}>{children}</div>;
}

// Enhanced shimmer effect for premium loading states
export function ShimmerBox({ className, children }) {
    return (
        <div role="status" aria-label="Loading content" className={cn(
            "relative overflow-hidden bg-muted/60 rounded-xl my-3",
            "before:absolute before:inset-0 before:-translate-x-full",
            "before:bg-gradient-to-r before:from-transparent before:via-background/40 before:to-transparent",
            "before:animate-[shimmer_2.5s_ease-in-out_infinite]",
            className
        )}>
            {children}
        </div>
    );
}
