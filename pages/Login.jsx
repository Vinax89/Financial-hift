/**
 * @fileoverview Login page for Financial $hift
 * @description User authentication with email/password and social login options
 */

import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Separator } from "@/ui/separator";
import { useToast } from "@/ui/use-toast";
import { Loader2, DollarSign, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { logError, logInfo } from "@/utils/logger.js";
import {
  handleGoogleSuccess,
  handleGoogleError,
  isGoogleAuthConfigured,
} from "@/utils/googleAuth.js";
import { saveAuthTokens, saveUserData } from "@/utils/authStorage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from || "/dashboard";

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      logInfo("User login attempt", { email });

      // TODO: Replace with actual API call to your backend
      // Simulate API authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock JWT token (in production, this would come from your API)
      const mockToken = "mock-jwt-token-" + Date.now();

      // Save authentication tokens using secure storage
      await saveAuthTokens({
        accessToken: mockToken,
        refreshToken: "mock-refresh-token-" + Date.now(),
        expiresIn: 3600000, // 1 hour
      });

      // Save user data using secure storage
      await saveUserData({
        id: "mock-user-" + Date.now(),
        email: email,
        name: email.split("@")[0], // Extract name from email
        provider: "email",
      });

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });

      logInfo("User logged in successfully", { email });

      // Delay to ensure encrypted storage operations complete, then navigate
      setTimeout(() => {
        logInfo("Navigating to:", from);
        // Use React Router navigate to avoid full page reload
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      logError("Login failed", error);
      toast({
        title: "Login Failed",
        description:
          error?.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsLoading(true);

    try {
      const { user } = await handleGoogleSuccess(credentialResponse);

      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.name}`,
      });

      logInfo("User logged in via Google", { email: user.email });

      // Navigate to intended page or dashboard with sufficient delay for storage
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      logError("Google login processing failed", error);
      toast({
        title: "Login Failed",
        description:
          error?.message || "Failed to complete Google authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    logError("Google login failed");
    toast({
      title: "Authentication Failed",
      description: "Unable to sign in with Google. Please try again.",
      variant: "destructive",
    });
  };

  const handleSocialLogin = async (provider) => {
    toast({
      title: "Coming Soon",
      description: `${provider} login will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex-center p-4">
      <Card className="w-full max-w-md card-glass card-elevated">
        <CardHeader className="space-y-1 text-center">
          <div className="flex-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="heading-2">Welcome back</CardTitle>
          <CardDescription className="body-small">
            Sign in to your Financial $hift account
          </CardDescription>
        </CardHeader>

        <CardContent className="section-spacing card-padding">
          <form onSubmit={handleEmailLogin} className="section-spacing">
            <div className="section-spacing-sm">
              <Label htmlFor="email" className="body-small font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-subtle" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 input-base"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="section-spacing-sm">
              <div className="flex-between">
                <Label htmlFor="password" className="body-small font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="body-small text-primary hover:underline hover-opacity"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-subtle" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 input-base"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-subtle hover:text-foreground focus-ring"
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
              className="w-full btn-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex-center">
              <Separator />
            </div>
            <div className="relative flex-center text-xs uppercase">
              <span className="bg-card px-2 text-subtle">Or continue with</span>
            </div>
          </div>

          <div className="section-spacing-sm">
            {isGoogleAuthConfigured() ? (
              <div className="flex-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="350"
                />
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                disabled={isLoading}
                className="w-full btn-lg hover-lift"
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
                Sign in with Google
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => handleSocialLogin("GitHub")}
              disabled={isLoading}
              className="w-full btn-lg hover-lift"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex-col-center space-y-2">
          <div className="body-small text-center text-subtle">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium hover-opacity"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
