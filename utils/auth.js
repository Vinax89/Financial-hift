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
