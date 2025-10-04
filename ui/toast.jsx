import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

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

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

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

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Convenience methods
    const success = (title, description) => toast({ title, description, variant: 'success' });
    const error = (title, description) => toast({ title, description, variant: 'error' });
    const warning = (title, description) => toast({ title, description, variant: 'warning' });
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