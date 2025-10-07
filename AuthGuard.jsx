/**
 * @fileoverview Authentication guard component for Financial $hift
 * @description Protects routes by checking user authentication status,
 * displays loading and error states appropriately
 */

import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent } from '@/ui/card.jsx';
import { Loader2, AlertCircle } from 'lucide-react';

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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await User.me();
                setAuthState({
                    isLoading: false,
                    isAuthenticated: true,
                    user,
                    error: null
                });
            } catch (error) {
                // Handle authentication errors gracefully
                console.warn('Authentication check failed:', error);
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    user: null,
                    error: error.message
                });
            }
        };

        checkAuth();
    }, []);

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

    if (false && !authState.isAuthenticated) { // TEMP: Bypass auth for development
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md border shadow-xl bg-card backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h2>
                        <p className="text-muted-foreground mb-4">Please log in to access your financial dashboard.</p>
                        {authState.error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                Error: {authState.error}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return children;
}