/**
 * @fileoverview Forgot Password page for Financial $hift
 * @description Password reset request page
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { useToast } from '@/ui/use-toast.jsx';
import { Loader2, DollarSign, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);
        
        try {
            logInfo('Password reset requested', { email });
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setEmailSent(true);
            
            toast({
                title: 'Email Sent',
                description: 'Check your inbox for password reset instructions.',
            });
            
            logInfo('Password reset email sent', { email });
            
        } catch (error) {
            logError('Password reset failed', error);
            toast({
                title: 'Request Failed',
                description: error?.message || 'Unable to send reset email. Please try again.',
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
                            {emailSent ? (
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            ) : (
                                <DollarSign className="h-8 w-8 text-primary" />
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {emailSent ? 'Check your email' : 'Forgot your password?'}
                    </CardTitle>
                    <CardDescription>
                        {emailSent 
                            ? 'We\'ve sent password reset instructions to your email address.'
                            : 'Enter your email and we\'ll send you instructions to reset your password.'
                        }
                    </CardDescription>
                </CardHeader>

                {!emailSent ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
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

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send reset instructions'
                                )}
                            </Button>
                        </CardContent>
                    </form>
                ) : (
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground text-center space-y-2">
                            <p>Didn't receive the email? Check your spam folder or try again.</p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                                className="w-full"
                            >
                                Try different email
                            </Button>
                        </div>
                    </CardContent>
                )}

                <CardFooter className="flex flex-col space-y-2">
                    <Link 
                        to="/login" 
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
/**
 * @fileoverview Forgot Password page for Financial $hift
 * @description Password reset request flow
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { useToast } from '@/ui/use-toast.jsx';
import { Loader2, DollarSign, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { logError, logInfo } from '@/utils/logger.js';
// import { User } from '@/api/entities'; // Uncomment when Base44 auth is configured

/**
 * Forgot Password Page Component
 * @component
 * @returns {JSX.Element} Password reset request form
 */
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { toast } = useToast();

    /**
     * Handle password reset request
     */
    const handleResetRequest = async (e) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement Base44 SDK password reset
            // await User.requestPasswordReset(email);

            // TEMPORARY: Mock successful request for development
            logInfo('Password reset requested', { email });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setEmailSent(true);

            toast({
                title: 'Email Sent',
                description: 'Check your inbox for password reset instructions.',
            });

        } catch (error) {
            logError('Password reset request failed', error);
            toast({
                title: 'Request Failed',
                description: error?.message || 'Unable to send reset email. Please try again.',
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
                    <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
                    <CardDescription>
                        {emailSent 
                            ? 'Check your email for reset instructions'
                            : 'Enter your email to receive reset instructions'
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {emailSent ? (
                        <div className="space-y-4 text-center py-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    We've sent password reset instructions to:
                                </p>
                                <p className="font-medium">{email}</p>
                                <p className="text-sm text-muted-foreground">
                                    If you don't see it, check your spam folder.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setEmailSent(false)}
                                className="w-full"
                            >
                                Send to a different email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetRequest} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send reset instructions'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link 
                        to="/login" 
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
