/**
 * @fileoverview Signup page for Financial $hift
 * @description User registration with email/password and social signup options
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Separator } from '@/ui/separator';
import { Checkbox } from '@/ui/checkbox';
import { useToast } from '@/ui/use-toast';
import { Loader2, DollarSign, Mail, Lock, Eye, EyeOff, User, CheckCircle, XCircle } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';
import { saveAuthTokens, saveUserData } from '@/utils/authStorage';

export default function Signup() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const passwordRequirements = [
        { test: (pwd) => pwd.length >= 8, label: 'At least 8 characters' },
        { test: (pwd) => /[A-Z]/.test(pwd), label: 'One uppercase letter' },
        { test: (pwd) => /[a-z]/.test(pwd), label: 'One lowercase letter' },
        { test: (pwd) => /[0-9]/.test(pwd), label: 'One number' },
        { test: (pwd) => /[^A-Za-z0-9]/.test(pwd), label: 'One special character' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast({
                title: 'Name Required',
                description: 'Please enter your full name.',
                variant: 'destructive'
            });
            return false;
        }

        if (!formData.email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return false;
        }

        const failedReqs = passwordRequirements.filter(req => !req.test(formData.password));
        if (failedReqs.length > 0) {
            toast({
                title: 'Password Too Weak',
                description: 'Please meet all password requirements.',
                variant: 'destructive'
            });
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Passwords Don\'t Match',
                description: 'Please make sure your passwords match.',
                variant: 'destructive'
            });
            return false;
        }

        if (!acceptedTerms) {
            toast({
                title: 'Terms Required',
                description: 'Please accept the Terms of Service to continue.',
                variant: 'destructive'
            });
            return false;
        }

        return true;
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        
        try {
            logInfo('New user signup attempt', { email: formData.email });
            
            // TODO: Replace with actual API call to your backend
            // Simulate API registration
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock JWT token (in production, this would come from your API)
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            // Save authentication tokens using secure storage
            await saveAuthTokens({
                accessToken: mockToken,
                refreshToken: 'mock-refresh-token-' + Date.now(),
                expiresIn: 3600000, // 1 hour
            });
            
            // Save user data using secure storage
            await saveUserData({
                id: 'mock-user-' + Date.now(),
                email: formData.email,
                name: formData.fullName,
                provider: 'email',
            });
            
            toast({
                title: 'Welcome to Financial $hift!',
                description: 'Your account has been created successfully.',
            });
            
            logInfo('User signed up successfully', { email: formData.email });
            
            // Small delay to ensure storage is complete, then force reload
            setTimeout(() => {
                logInfo('Navigating to dashboard after signup');
                // Force a full page reload to ensure AuthGuard picks up new auth state
                window.location.href = '/dashboard';
            }, 200);
            
        } catch (error) {
            logError('Signup failed', error);
            toast({
                title: 'Signup Failed',
                description: error?.message || 'Unable to create account. Please try again.',
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    };

    const handleSocialSignup = async (provider) => {
        setIsLoading(true);
        
        try {
            logInfo('Social signup attempt', { provider });
            
            toast({
                title: 'Coming Soon',
                description: `${provider} signup will be available soon!`,
            });
            
        } catch (error) {
            logError('Social signup failed', { provider, error });
            toast({
                title: 'Signup Failed',
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
                    <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                    <CardDescription>
                        Join Financial $hift to start managing your money smarter
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder=""
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10 pr-10"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            
                            {formData.password && (
                                <div className="space-y-1 mt-2">
                                    {passwordRequirements.map((req, idx) => {
                                        const passed = req.test(formData.password);
                                        return (
                                            <div key={idx} className="flex items-center gap-2 text-xs">
                                                {passed ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 text-muted-foreground" />
                                                )}
                                                <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder=""
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    disabled={isLoading}
                                    className="pl-10 pr-10"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-destructive">Passwords do not match</p>
                            )}
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={setAcceptedTerms}
                                disabled={isLoading}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleSocialSignup('Google')}
                            disabled={isLoading}
                        >
                            Google
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleSocialSignup('GitHub')}
                            disabled={isLoading}
                        >
                            GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
