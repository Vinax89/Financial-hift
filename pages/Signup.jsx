/**
 * @fileoverview Signup page for Financial $hift
 * @description User registration with email/password and social signup options
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { Separator } from '@/ui/separator.jsx';
import { Checkbox } from '@/ui/checkbox.jsx';
import { useToast } from '@/ui/use-toast.jsx';
import { Loader2, DollarSign, Mail, Lock, Eye, EyeOff, User, CheckCircle, XCircle } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';

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
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            localStorage.setItem('auth_token', 'mock-jwt-token-' + Date.now());
            localStorage.setItem('user_email', formData.email);
            localStorage.setItem('user_name', formData.fullName);
            
            toast({
                title: 'Welcome to Financial $hift!',
                description: 'Your account has been created successfully.',
            });
            
            logInfo('User signed up successfully', { email: formData.email });
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            logError('Signup failed', error);
            toast({
                title: 'Signup Failed',
                description: error?.message || 'Unable to create account. Please try again.',
                variant: 'destructive'
            });
        } finally {
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
/**
 * @fileoverview Signup/Registration page for Financial $hift
 * @description New user registration with email/password and social signup options
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { Separator } from '@/ui/separator.jsx';
import { Checkbox } from '@/ui/checkbox.jsx';
import { useToast } from '@/ui/use-toast.jsx';
import { Loader2, DollarSign, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';
// import { User } from '@/api/entities'; // Uncomment when Base44 auth is configured

/**
 * Signup Page Component
 * @component
 * @returns {JSX.Element} Registration form with email/password and social options
 */
export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    /**
     * Handle input changes
     */
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    /**
     * Validate password strength
     */
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!hasUpperCase || !hasLowerCase) {
            return { valid: false, message: 'Password must contain both uppercase and lowercase letters' };
        }
        if (!hasNumber) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        if (!hasSpecialChar) {
            return { valid: false, message: 'Password must contain at least one special character' };
        }

        return { valid: true };
    };

    /**
     * Handle email/password signup
     */
    const handleEmailSignup = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all fields.',
                variant: 'destructive'
            });
            return;
        }

        if (!agreeToTerms) {
            toast({
                title: 'Terms Required',
                description: 'Please agree to the Terms of Service and Privacy Policy.',
                variant: 'destructive'
            });
            return;
        }

        // Password validation
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            toast({
                title: 'Weak Password',
                description: passwordValidation.message,
                variant: 'destructive'
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Passwords Don\'t Match',
                description: 'Please make sure your passwords match.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement Base44 SDK user registration
            // const user = await User.create({
            //     name: formData.name,
            //     email: formData.email,
            //     password: formData.password
            // });

            // TEMPORARY: Mock successful signup for development
            logInfo('User signup attempt', { email: formData.email, name: formData.name });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock success
            toast({
                title: 'Account Created!',
                description: 'Welcome to Financial $hift. Let\'s set up your account.',
            });

            logInfo('User signed up successfully', { email: formData.email });
            
            // Navigate to onboarding or dashboard
            navigate('/dashboard');

        } catch (error) {
            logError('Signup failed', error);
            toast({
                title: 'Signup Failed',
                description: error?.message || 'Unable to create account. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle social signup (Google, GitHub, etc.)
     */
    const handleSocialSignup = async (provider) => {
        if (!agreeToTerms) {
            toast({
                title: 'Terms Required',
                description: 'Please agree to the Terms of Service and Privacy Policy.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement social auth (Auth0, Clerk, Supabase, etc.)
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
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Start your journey to financial freedom
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Email/Password Signup Form */}
                    <form onSubmit={handleEmailSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
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
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Must be 8+ characters with uppercase, lowercase, number, and special character
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                checked={agreeToTerms}
                                onCheckedChange={setAgreeToTerms}
                                disabled={isLoading}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
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

                    {/* Divider */}
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

                    {/* Social Signup Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleSocialSignup('Google')}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleSocialSignup('GitHub')}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-center">
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
