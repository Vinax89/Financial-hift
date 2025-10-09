/**
 * @fileoverview Enhanced button components with loading states and advanced variants
 * @description Button extensions with loading states, floating action buttons, button groups, and confirm buttons
 */

import React from 'react';
import { Button } from '@/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Enhanced button with loading states and icon support
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {string} [props.loadingText='Loading...'] - Text shown when loading
 * @param {React.ComponentType} [props.icon] - Icon component
 * @param {'left'|'right'} [props.iconPosition='left'] - Icon position
 * @param {boolean} [props.fullWidth=false] - Full width button
 * @returns {JSX.Element} Enhanced button with loading state
 */
export function EnhancedButton({ 
    children,
    loading = false,
    loadingText = 'Loading...',
    icon: Icon,
    iconPosition = 'left',
    variant = 'default',
    size = 'default',
    fullWidth = false,
    disabled = false,
    className,
    onClick,
    ...props
}) {
    const isDisabled = disabled || loading;
    
    const handleClick = (e) => {
        if (isDisabled) return;
        onClick?.(e);
    };

    return (
        <Button
            variant={variant}
            size={size}
            disabled={isDisabled}
            className={cn(
                'relative transition-all duration-200',
                'focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
                fullWidth && 'w-full',
                loading && 'cursor-wait',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {loading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            
            {!loading && Icon && iconPosition === 'left' && (
                <Icon className="h-4 w-4 mr-2" />
            )}
            
            <span className={loading ? 'opacity-80' : ''}>
                {loading ? loadingText : children}
            </span>
            
            {!loading && Icon && iconPosition === 'right' && (
                <Icon className="h-4 w-4 ml-2" />
            )}
        </Button>
    );
}

// Floating Action Button
export function FloatingActionButton({ 
    icon: Icon,
    onClick,
    className,
    variant = 'primary',
    size = 'default',
    ...props
}) {
    const variants = {
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-lg hover:shadow-xl'
    };

    const sizes = {
        sm: 'h-12 w-12',
        default: 'h-14 w-14',
        lg: 'h-16 w-16'
    };

    return (
        <button
            className={cn(
                'fixed bottom-6 right-6 z-50 rounded-full flex items-center justify-center',
                'transition-all duration-200 hover:scale-110 focus:scale-95',
                'focus:outline-none focus:ring-4 focus:ring-emerald-500/25',
                variants[variant],
                sizes[size],
                className
            )}
            onClick={onClick}
            {...props}
        >
            {Icon && <Icon className="h-5 w-5" />}
        </button>
    );
}

// Button group for related actions
export function ButtonGroup({ children, className, ...props }) {
    return (
        <div 
            className={cn(
                'inline-flex rounded-lg border border-slate-200 overflow-hidden',
                className
            )} 
            {...props}
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        className: cn(
                            'rounded-none border-0',
                            index !== 0 && 'border-l border-slate-200',
                            child.props.className
                        )
                    });
                }
                return child;
            })}
        </div>
    );
}

// Action button with confirmation
export function ConfirmButton({ 
    children,
    confirmText = 'Are you sure?',
    onConfirm,
    variant = 'destructive',
    ...props
}) {
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [countdown, setCountdown] = React.useState(0);

    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && showConfirm) {
            setShowConfirm(false);
        }
    }, [countdown, showConfirm]);

    const handleClick = () => {
        if (showConfirm) {
            onConfirm?.();
            setShowConfirm(false);
        } else {
            setShowConfirm(true);
            setCountdown(3);
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleClick}
            {...props}
        >
            {showConfirm && countdown > 0 
                ? `Confirm (${countdown})` 
                : showConfirm 
                    ? confirmText 
                    : children
            }
        </Button>
    );
}