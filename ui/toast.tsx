// @ts-nocheck
/**
 * @fileoverview Toast notification system with context provider
 * @description Animated toast notifications with multiple variants and auto-dismiss functionality
 */

import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Toast context for managing notification state
 * @type {React.Context}
 */
const ToastContext = createContext();

/**
 * Hook to access toast functionality
 * @returns {Object} Toast methods (toast, removeToast, success, error, warning, info)
 * @throws {Error} If used outside ToastProvider
 * @example
 * const { success } = useToast();
 * success('Saved!', 'Your changes were saved successfully');
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

/**
 * Toast icon component based on variant
 * @param {Object} props - Component props
 * @param {('default'|'success'|'error'|'warning'|'destructive')} props.variant - Toast variant
 * @returns {JSX.Element} Colored icon
 */
const ToastIcon = ({ variant }) => {
    const icons = {
        default: Info,
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        destructive: AlertCircle
    };
    
    const Icon = icons[variant] || Info;
    const colors = {
        default: 'text-blue-600',
        success: 'text-emerald-600',
        error: 'text-red-600',
        warning: 'text-orange-600',
        destructive: 'text-red-600'
    };
    
    return <Icon className={cn('h-5 w-5', colors[variant])} />;
};

/**
 * Toast provider component with notification management
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider with toast context and notification container
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    /**
     * Display a toast notification
     * @param {Object} params - Toast parameters
     * @param {string} params.title - Toast title
     * @param {string} [params.description] - Toast description
     * @param {('default'|'success'|'error'|'warning'|'destructive')} [params.variant='default'] - Toast variant
     * @param {number} [params.duration=5000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
     * @returns {string} Toast ID
     */
    const toast = ({ title, description, variant = 'default', duration = 5000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, title, description, variant };
        
        setToasts(prev => [...prev, newToast]);
        
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        
        return id;
    };

    /**
     * Remove a toast by ID
     * @param {string} id - Toast ID to remove
     */
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    /**
     * Show success toast
     * @param {string} title - Toast title
     * @param {string} [description] - Toast description
     * @returns {string} Toast ID
     */
    const success = (title, description) => toast({ title, description, variant: 'success' });
    
    /**
     * Show error toast
     * @param {string} title - Toast title
     * @param {string} [description] - Toast description
     * @returns {string} Toast ID
     */
    const error = (title, description) => toast({ title, description, variant: 'error' });
    
    /**
     * Show warning toast
     * @param {string} title - Toast title
     * @param {string} [description] - Toast description
     * @returns {string} Toast ID
     */
    const warning = (title, description) => toast({ title, description, variant: 'warning' });
    
    /**
     * Show info toast
     * @param {string} title - Toast title
     * @param {string} [description] - Toast description
     * @returns {string} Toast ID
     */
    const info = (title, description) => toast({ title, description, variant: 'default' });

    return (
        <ToastContext.Provider value={{ toast, removeToast, success, error, warning, info }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
                <AnimatePresence>
                    {toasts.map((toastItem) => (
                        <motion.div
                            key={toastItem.id}
                            initial={{ opacity: 0, x: 300, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }}
                            className={cn(
                                'bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-4 w-full',
                                'dark:bg-card/95 dark:border-border/40',
                                toastItem.variant === 'success' && 'border-emerald-200 dark:border-emerald-800',
                                toastItem.variant === 'error' && 'border-red-200 dark:border-red-800',
                                toastItem.variant === 'warning' && 'border-orange-200 dark:border-orange-800',
                                toastItem.variant === 'destructive' && 'border-red-200 dark:border-red-800'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <ToastIcon variant={toastItem.variant} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-foreground text-sm">
                                        {toastItem.title}
                                    </div>
                                    {toastItem.description && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {toastItem.description}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(toastItem.id)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
