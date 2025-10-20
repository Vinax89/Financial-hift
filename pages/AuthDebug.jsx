/**
 * @fileoverview Debug Authentication Page
 * @description Test page to debug authentication storage and state
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { getAuthToken, getAuthTokens, getUserData, isAuthenticated, saveAuthTokens, saveUserData, clearAuth } from '@/utils/authStorage';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AuthDebug() {
    const [authStatus, setAuthStatus] = useState({
        isAuth: false,
        token: null,
        tokens: null,
        user: null,
        loading: true
    });

    const checkAuth = async () => {
        setAuthStatus(prev => ({ ...prev, loading: true }));
        
        const isAuth = await isAuthenticated();
        const token = await getAuthToken();
        const tokens = await getAuthTokens();
        const user = await getUserData();
        
        setAuthStatus({
            isAuth,
            token,
            tokens,
            user,
            loading: false
        });
        
        console.log('Auth Debug:', { isAuth, token, tokens, user });
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleTestLogin = async () => {
        await saveAuthTokens({
            accessToken: 'test-token-' + Date.now(),
            refreshToken: 'refresh-' + Date.now(),
            expiresIn: 3600000
        });
        
        await saveUserData({
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User'
        });
        
        await checkAuth();
    };

    const handleClearAuth = async () => {
        clearAuth();
        await checkAuth();
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Authentication Debug
                            <Button variant="outline" size="sm" onClick={checkAuth}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <span className="font-semibold">Is Authenticated:</span>
                                <span className="flex items-center gap-2">
                                    {authStatus.loading ? (
                                        'Loading...'
                                    ) : authStatus.isAuth ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            Yes
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            No
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="font-semibold mb-2">Access Token:</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {authStatus.token || 'null'}
                                </pre>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="font-semibold mb-2">All Tokens:</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(authStatus.tokens, null, 2) || 'null'}
                                </pre>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="font-semibold mb-2">User Data:</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify(authStatus.user, null, 2) || 'null'}
                                </pre>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="font-semibold mb-2">Environment:</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`VITE_ENABLE_AUTH: ${import.meta.env.VITE_ENABLE_AUTH}
VITE_GOOGLE_CLIENT_ID: ${import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}`}
                                </pre>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <div className="font-semibold mb-2">LocalStorage (plain):</div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                    {JSON.stringify({
                                        auth_token: localStorage.getItem('auth_token'),
                                        user_email: localStorage.getItem('user_email'),
                                        user_name: localStorage.getItem('user_name')
                                    }, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button onClick={handleTestLogin}>
                                Test Login (Save Auth Data)
                            </Button>
                            <Button variant="destructive" onClick={handleClearAuth}>
                                Clear Auth
                            </Button>
                            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                                Go to Dashboard
                            </Button>
                            <Button variant="outline" onClick={() => window.location.href = '/login'}>
                                Go to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Click "Test Login" to save mock authentication data</li>
                            <li>Check if "Is Authenticated" shows "Yes"</li>
                            <li>Try navigating to Dashboard - you should stay logged in</li>
                            <li>Click "Clear Auth" to log out</li>
                            <li>Try navigating to Dashboard - you should be redirected to Login</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
