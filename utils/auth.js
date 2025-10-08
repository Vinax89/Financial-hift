/**
 * @fileoverview Authentication utilities for Financial $hift
 * @description Helper functions and components for authentication
 */

import { useNavigate } from 'react-router-dom';
import { useToast } from '@/ui/use-toast.jsx';
import { logInfo, logError } from '@/utils/logger.js';

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid auth token
 */
export function isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
}

/**
 * Get current user information
 * @returns {Object|null} User object or null if not authenticated
 */
export function getCurrentUser() {
    const email = localStorage.getItem('user_email');
    const name = localStorage.getItem('user_name');

    if (!email) return null;

    return {
        email,
        name: name || email.split('@')[0], // Fallback to email username
    };
}

/**
 * Logout hook
 * @returns {Object} Logout function
 */
export function useLogout() {
    const navigate = useNavigate();
    const { toast } = useToast();

    /**
     * Perform logout operation
     * @param {Object} options - Logout options
     * @param {boolean} options.showToast - Show logout confirmation toast
     * @param {string} options.redirectTo - Path to redirect to after logout
     */
    const logout = async ({ showToast = true, redirectTo = '/login' } = {}) => {
        try {
            logInfo('User logout initiated');

            // Clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');

            // Clear session storage
            sessionStorage.clear();

            if (showToast) {
                toast({
                    title: 'Logged out',
                    description: 'You have been successfully logged out.',
                });
            }

            logInfo('User logged out successfully');

            // Redirect to login page
            navigate(redirectTo, { replace: true });

        } catch (error) {
            logError('Logout failed', error);
            toast({
                title: 'Logout Failed',
                description: 'There was a problem logging out. Please try again.',
                variant: 'destructive'
            });
        }
    };

    return { logout };
}
