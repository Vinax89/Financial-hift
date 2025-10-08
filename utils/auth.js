/**
 * @fileoverview Authentication utilities for Financial $hift
 * @description Helper functions and components for authentication
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button.jsx';
import { LogOut } from 'lucide-react';
import { useToast } from '@/ui/use-toast.jsx';
import { logInfo } from './logger.js';

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
    if (!isAuthenticated()) return null;
    
    return {
        email: localStorage.getItem('user_email'),
        name: localStorage.getItem('user_name'),
        token: localStorage.getItem('auth_token')
    };
}

/**
 * Custom hook for logout functionality
 * @returns {Function} Logout function
 */
export function useLogout() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const logout = () => {
        try {
            const userEmail = localStorage.getItem('user_email');
            
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            
            logInfo('User logged out', { email: userEmail });
            
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });
            
            navigate('/login', { replace: true });
            
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: 'Logout Failed',
                description: 'Unable to log out. Please try again.',
                variant: 'destructive'
            });
        }
    };

    return logout;
}

/**
 * Logout button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Logout button
 */
export function LogoutButton({ variant = 'ghost', className = '' }) {
    const logout = useLogout();

    return (
        <Button
            variant={variant}
            onClick={logout}
            className={className}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    );
}
/**
 * @fileoverview Logout utility and component for Financial $hift
 * @description Handles user logout, session cleanup, and redirect to login
 */

import { useNavigate } from 'react-router-dom';
import { useToast } from '@/ui/use-toast.jsx';
import { logInfo } from '@/utils/logger.js';
// import { User } from '@/api/entities'; // Uncomment when Base44 auth is configured

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

            // TODO: Implement Base44 SDK logout when ready
            // await User.logout();

            // Clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            
            // Clear session storage
            sessionStorage.clear();

            // Optional: Clear all localStorage (be careful with this)
            // localStorage.clear();

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

/**
 * Logout button component
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Logout button
 */
export function LogoutButton({ children = 'Logout', variant = 'ghost', className = '', ...props }) {
    const { logout } = useLogout();

    return (
        <button
            onClick={() => logout()}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
}

/**
 * Get current user from storage
 * @returns {Object|null} User object or null
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
