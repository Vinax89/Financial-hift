// @ts-nocheck
import React from 'react';
import { useToast } from '@/ui/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Enhanced toast system with better visual feedback
export function useEnhancedToast() {
    const { toast } = useToast();

    const showSuccess = (title, description, options = {}) => {
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span>{title}</span>
                </div>
            ),
            description,
            className: 'border-emerald-200 bg-emerald-50',
            ...options
        });
    };

    const showError = (title, description, options = {}) => {
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span>{title}</span>
                </div>
            ),
            description,
            variant: 'destructive',
            ...options
        });
    };

    const showWarning = (title, description, options = {}) => {
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>{title}</span>
                </div>
            ),
            description,
            className: 'border-amber-200 bg-amber-50',
            ...options
        });
    };

    const showInfo = (title, description, options = {}) => {
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span>{title}</span>
                </div>
            ),
            description,
            className: 'border-blue-200 bg-blue-50',
            ...options
        });
    };

    const showProgress = (title, progress, options = {}) => {
        toast({
            title,
            description: (
                <div className="mt-2">
                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{progress}% complete</p>
                </div>
            ),
            duration: 0, // Don't auto-dismiss
            ...options
        });
    };

    return {
        toast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showProgress
    };
}

// Toast templates for common actions
export const ToastTemplates = {
    SAVE_SUCCESS: (itemName = 'Item') => ({
        title: 'âœ… Saved successfully',
        description: `Your ${itemName.toLowerCase()} has been saved.`
    }),
    
    DELETE_SUCCESS: (itemName = 'Item') => ({
        title: 'ðŸ—‘ï¸ Deleted successfully',
        description: `${itemName} has been removed.`
    }),
    
    UPDATE_SUCCESS: (itemName = 'Item') => ({
        title: 'âœ¨ Updated successfully', 
        description: `Your ${itemName.toLowerCase()} has been updated.`
    }),
    
    GENERIC_ERROR: {
        title: 'âŒ Something went wrong',
        description: 'Please try again in a moment.'
    },
    
    NETWORK_ERROR: {
        title: 'ðŸ“¡ Connection error',
        description: 'Please check your internet connection.'
    },
    
    VALIDATION_ERROR: (field) => ({
        title: 'âš ï¸ Invalid input',
        description: `Please check your ${field} and try again.`
    }),

    LEVEL_UP: (level) => ({
        title: 'ðŸŽ‰ Level up!',
        description: `Congratulations! You've reached level ${level}!`
    }),

    BADGE_EARNED: (badgeName) => ({
        title: 'ðŸ† Badge unlocked!',
        description: `You've earned the "${badgeName}" badge!`
    }),

    GOAL_REACHED: (goalName) => ({
        title: 'ðŸŽ¯ Goal achieved!',
        description: `Congratulations on reaching your "${goalName}" goal!`
    })
};
