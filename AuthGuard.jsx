import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

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

    if (!authState.isAuthenticated) {
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