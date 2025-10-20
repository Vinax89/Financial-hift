/**
 * @fileoverview Authentication guard component for Financial $hift
 * @description Protects routes by checking user authentication status,
 * displays loading and error states appropriately, redirects to login when needed
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// TEMP: Commented out to prevent SDK initialization redirect in development
// import { User } from '@/api/entities';
import { Card, CardContent } from '@/ui/card';
import { Loader2 } from 'lucide-react';
import { logWarn, logInfo } from '@/utils/logger.js';
import { isAuthenticated, getUserData } from '@/utils/authStorage';

/**
 * Authentication state type definition
 * @typedef {Object} AuthState
 * @property {boolean} isLoading - Whether auth check is in progress
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {Object|null} user - User object if authenticated
 * @property {string|null} error - Error message if auth failed
 */

/**
 * Authentication Guard Component
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render when authenticated
 * @returns {JSX.Element} Loading state, error state, or protected children
 */
export default function AuthGuard({ children }) {
    const [authState, setAuthState] = useState({ 
        isLoading: true, 
        isAuthenticated: false, 
        user: null,
        error: null 
    });
    const navigate = useNavigate();
    const location = useLocation();

    // Check if auth is enabled via environment variable
    const AUTH_ENABLED = import.meta.env.VITE_ENABLE_AUTH === 'true';

    useEffect(() => {
        const checkAuth = async () => {
            // If auth is disabled in dev, skip check
            if (!AUTH_ENABLED) {
                logInfo('Authentication disabled in development mode');
                setAuthState({
                    isLoading: false,
                    isAuthenticated: true, // Fake authenticated state
                    user: { id: 'dev-user', email: 'dev@example.com', name: 'Dev User' },
                    error: null
                });
                return;
            }

            // TODO: Implement Base44 SDK authentication when ready
            try {
                // const user = await User.me();
                // setAuthState({
                //     isLoading: false,
                //     isAuthenticated: true,
                //     user,
                //     error: null
                // });
                
                // TEMPORARY: Mock auth check
                logInfo('Checking authentication status');
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check authentication using secure encrypted storage
                const authenticated = await isAuthenticated();
                
                if (authenticated) {
                    // Get user data from secure storage
                    const userData = await getUserData();
                    
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: true,
                        user: userData || { id: 'mock-user', email: 'user@example.com', name: 'Mock User' },
                        error: null
                    });
                } else {
                    throw new Error('No authentication token found');
                }
                
            } catch (error) {
                logWarn('Authentication check failed', error);
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    user: null,
                    error: error?.message || 'Authentication failed'
                });
            }
        };
        
        checkAuth();
    }, [AUTH_ENABLED, location.pathname]); // Re-check auth when route changes

    // Show loading state while checking auth
    if (authState.isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md border shadow-xl bg-card backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">Loading Financial $hift</h2>
                        <p className="text-muted-foreground">Setting up your financial dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!authState.isAuthenticated) {
        logInfo('User not authenticated, redirecting to login', { from: location.pathname });
        // Save the intended destination to redirect after login
        navigate('/login', { state: { from: location.pathname } });
        return null;
    }

    // User is authenticated, render protected content
    return children;
}
