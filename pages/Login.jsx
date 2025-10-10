/**
 * @fileoverview Login page for Financial $hift
 * @description User authentication with email/password and social login options
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Separator } from '@/ui/separator';
import { useToast } from '@/ui/use-toast';
import { Loader2, DollarSign, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const from = location.state?.from || '/dashboard';

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast({
                title: 'Missing Information',
                description: 'Please enter both email and password.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        
        try {
            logInfo('User login attempt', { email });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
            localStorage.setItem('user_email', email);
            
            toast({
                title: 'Welcome back!',
                description: 'Successfully logged in.',
            });
            
            logInfo('User logged in successfully', { email });
            navigate(from, { replace: true });
            
        } catch (error) {
            logError('Login failed', error);
            toast({
                title: 'Login Failed',
                description: error?.message || 'Invalid email or password. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setIsLoading(true);
        
        try {
            logInfo('Social login attempt', { provider });
            
            toast({
                title: 'Coming Soon',
                description: `${provider} login will be available soon!`,
            });
            
        } catch (error) {
            logError('Social login failed', { provider, error });
            toast({
                title: 'Login Failed',
                description: 'Unable to connect to authentication provider.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border shadow-2xl bg-card/95 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <DollarSign className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your Financial $hift account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder=""
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10 pr-10"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleSocialLogin('Google')}
                            disabled={isLoading}
                        >
                            Google
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleSocialLogin('GitHub')}
                            disabled={isLoading}
                        >
                            GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
