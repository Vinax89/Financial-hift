/**
 * @fileoverview Authentication utilities for Financial $hift
 * @description Helper functions and hooks for authentication with TypeScript support
 */

import { useNavigate } from 'react-router-dom';
import { useToast } from '@/ui/use-toast';
import { logInfo, logError } from '@/utils/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User authentication data stored in localStorage
 */
export interface AuthUser {
  /** User's email address */
  email: string;
  /** User's display name (falls back to email username) */
  name: string;
  /** User ID if available */
  id?: string;
  /** User role for authorization */
  role?: 'user' | 'admin' | 'premium';
  /** Account creation timestamp */
  createdAt?: string;
  /** Profile picture URL */
  avatar?: string;
}

/**
 * Authentication token data
 */
export interface AuthToken {
  /** JWT or session token */
  token: string;
  /** Token expiration timestamp (ISO 8601) */
  expiresAt?: string;
  /** Token type (Bearer, Session, etc.) */
  type?: 'Bearer' | 'Session';
  /** Refresh token for token renewal */
  refreshToken?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Whether to remember the user (extended session) */
  rememberMe?: boolean;
}

/**
 * Signup credentials
 */
export interface SignupCredentials extends LoginCredentials {
  /** User's display name */
  name: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Authentication response from login/signup
 */
export interface AuthResponse {
  /** Whether authentication was successful */
  success: boolean;
  /** Authentication token data */
  token?: AuthToken;
  /** User information */
  user?: AuthUser;
  /** Error message if failed */
  error?: string;
  /** Error code for specific handling */
  errorCode?: string;
}

/**
 * Session data stored in localStorage
 */
export interface SessionData {
  /** Authentication token */
  auth_token?: string;
  /** User email */
  user_email?: string;
  /** User display name */
  user_name?: string;
  /** User ID */
  user_id?: string;
  /** User role */
  user_role?: string;
  /** Session expiration timestamp */
  session_expires?: string;
}

/**
 * Logout options
 */
export interface LogoutOptions {
  /** Whether to show a logout confirmation toast */
  showToast?: boolean;
  /** Path to redirect to after logout (default: '/login') */
  redirectTo?: string;
  /** Clear all storage (including preferences) */
  clearAll?: boolean;
}

/**
 * Logout hook return value
 */
export interface UseLogoutReturn {
  /** Function to perform logout */
  logout: (options?: LogoutOptions) => Promise<void>;
  /** Whether logout is in progress */
  isLoggingOut?: boolean;
}

/**
 * Password validation result
 */
export interface PasswordValidation {
  /** Whether the password is valid */
  isValid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Password strength score (0-4) */
  strength?: number;
  /** Strength label */
  strengthLabel?: 'weak' | 'fair' | 'good' | 'strong' | 'very strong';
}

/**
 * Token validation result
 */
export interface TokenValidation {
  /** Whether the token is valid */
  isValid: boolean;
  /** Whether the token is expired */
  isExpired: boolean;
  /** Remaining time in seconds (if not expired) */
  remainingTime?: number;
  /** Token payload if valid */
  payload?: Record<string, unknown>;
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid auth token
 * 
 * @example
 * if (isAuthenticated()) {
 *   // User is logged in
 * }
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return false;
  }

  // Check if token is expired
  const expiresAt = localStorage.getItem('session_expires');
  if (expiresAt) {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    
    if (currentTime >= expirationTime) {
      // Token expired, clear auth data
      clearAuthData();
      return false;
    }
  }

  return true;
}

/**
 * Get current user information from localStorage
 * @returns {AuthUser | null} User object or null if not authenticated
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log(`Welcome, ${user.name}!`);
 * }
 */
export function getCurrentUser(): AuthUser | null {
  const email = localStorage.getItem('user_email');
  const name = localStorage.getItem('user_name');
  const id = localStorage.getItem('user_id');
  const role = localStorage.getItem('user_role');

  if (!email) {
    return null;
  }

  return {
    email,
    name: name || email.split('@')[0], // Fallback to email username
    id: id || undefined,
    role: (role as AuthUser['role']) || undefined,
  };
}

/**
 * Get authentication token from localStorage
 * @returns {string | null} Auth token or null if not authenticated
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Store authentication data in localStorage
 * @param {AuthResponse} authData - Authentication data to store
 * 
 * @example
 * const response = await loginAPI(credentials);
 * if (response.success) {
 *   storeAuthData(response);
 * }
 */
export function storeAuthData(authData: AuthResponse): void {
  if (!authData.success || !authData.token || !authData.user) {
    logError('Cannot store invalid auth data', authData);
    return;
  }

  try {
    // Store token
    localStorage.setItem('auth_token', authData.token.token);

    // Store user info
    localStorage.setItem('user_email', authData.user.email);
    localStorage.setItem('user_name', authData.user.name);

    if (authData.user.id) {
      localStorage.setItem('user_id', authData.user.id);
    }

    if (authData.user.role) {
      localStorage.setItem('user_role', authData.user.role);
    }

    // Store expiration if provided
    if (authData.token.expiresAt) {
      localStorage.setItem('session_expires', authData.token.expiresAt);
    }

    // Store refresh token if provided
    if (authData.token.refreshToken) {
      localStorage.setItem('refresh_token', authData.token.refreshToken);
    }

    logInfo('Auth data stored successfully', { email: authData.user.email });
  } catch (error) {
    logError('Failed to store auth data', error);
  }
}

/**
 * Clear all authentication data from localStorage
 * @param {boolean} clearAll - If true, clears all storage including preferences
 * 
 * @example
 * clearAuthData(); // Clear only auth data
 * clearAuthData(true); // Clear everything
 */
export function clearAuthData(clearAll: boolean = false): void {
  try {
    // Clear auth-specific data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('session_expires');
    localStorage.removeItem('refresh_token');

    // Clear session storage
    sessionStorage.clear();

    // Optionally clear all localStorage
    if (clearAll) {
      localStorage.clear();
    }

    logInfo('Auth data cleared', { clearAll });
  } catch (error) {
    logError('Failed to clear auth data', error);
  }
}

/**
 * Validate password strength and requirements
 * @param {string} password - Password to validate
 * @returns {PasswordValidation} Validation result with errors and strength
 * 
 * @example
 * const validation = validatePassword('MyPassword123!');
 * if (!validation.isValid) {
 *   console.log(validation.errors);
 * }
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength = 0;

  // Check length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength++;
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength++;
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strength++;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength++;
  }

  // Check for special characters (optional, adds to strength)
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    strength++;
  }

  // Determine strength label
  let strengthLabel: PasswordValidation['strengthLabel'];
  if (strength <= 1) strengthLabel = 'weak';
  else if (strength === 2) strengthLabel = 'fair';
  else if (strength === 3) strengthLabel = 'good';
  else if (strength === 4) strengthLabel = 'strong';
  else strengthLabel = 'very strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthLabel,
  };
}

/**
 * Check if user has a specific role
 * @param {string | string[]} requiredRole - Role(s) required
 * @returns {boolean} True if user has the required role
 * 
 * @example
 * if (hasRole('admin')) {
 *   // Show admin panel
 * }
 */
export function hasRole(requiredRole: string | string[]): boolean {
  const user = getCurrentUser();
  if (!user || !user.role) {
    return false;
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

/**
 * Hook for logging out the user
 * @returns {UseLogoutReturn} Object with logout function
 * 
 * @example
 * function MyComponent() {
 *   const { logout } = useLogout();
 *   
 *   return (
 *     <button onClick={() => logout()}>
 *       Logout
 *     </button>
 *   );
 * }
 */
export function useLogout(): UseLogoutReturn {
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Perform logout operation
   * @param {LogoutOptions} options - Logout configuration options
   */
  const logout = async (options: LogoutOptions = {}): Promise<void> => {
    const {
      showToast = true,
      redirectTo = '/login',
      clearAll = false,
    } = options;

    try {
      logInfo('User logout initiated');

      // Clear authentication data
      clearAuthData(clearAll);

      // Show success message
      if (showToast) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
      }

      logInfo('User logged out successfully');

      // Redirect to specified page
      navigate(redirectTo, { replace: true });

    } catch (error) {
      logError('Logout failed', error);
      
      toast({
        title: 'Logout Failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { logout };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get session data from localStorage
 * @returns {SessionData} Session data object
 */
export function getSessionData(): SessionData {
  return {
    auth_token: localStorage.getItem('auth_token') || undefined,
    user_email: localStorage.getItem('user_email') || undefined,
    user_name: localStorage.getItem('user_name') || undefined,
    user_id: localStorage.getItem('user_id') || undefined,
    user_role: localStorage.getItem('user_role') || undefined,
    session_expires: localStorage.getItem('session_expires') || undefined,
  };
}

/**
 * Check if session is expired
 * @returns {boolean} True if session is expired
 */
export function isSessionExpired(): boolean {
  const expiresAt = localStorage.getItem('session_expires');
  
  if (!expiresAt) {
    return false; // No expiration set, consider valid
  }

  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Get time until session expires
 * @returns {number | null} Seconds until expiration, or null if no expiration set
 */
export function getTimeUntilExpiration(): number | null {
  const expiresAt = localStorage.getItem('session_expires');
  
  if (!expiresAt) {
    return null;
  }

  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const remainingMs = expirationTime - currentTime;

  return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
}

/**
 * Format user display name
 * @param {AuthUser | null} user - User object
 * @returns {string} Formatted display name
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) {
    return 'Guest';
  }

  return user.name || user.email.split('@')[0] || 'User';
}

/**
 * Check if email is valid format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
