/**
 * @fileoverview Google OAuth authentication utilities
 * @description Handles Google Sign-In authentication flow and token management
 */

import { saveAuthTokens, saveUserData } from './authStorage';
import { logInfo, logError } from './logger';

/**
 * Handle successful Google login
 * @param {Object} credentialResponse - Google credential response
 * @returns {Promise<Object>} User data
 */
export async function handleGoogleSuccess(credentialResponse) {
    try {
        logInfo('Google login success', { hasCredential: !!credentialResponse.credential });
        
        // Decode JWT token to get user info
        const token = credentialResponse.credential;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        const userData = JSON.parse(jsonPayload);
        
        // Store authentication tokens
        await saveAuthTokens({
            accessToken: token,
            expiresIn: 3600000, // 1 hour default
        });
        
        // Store user data
        await saveUserData({
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            provider: 'google',
            emailVerified: userData.email_verified
        });
        
        logInfo('User data stored successfully', { 
            email: userData.email, 
            name: userData.name 
        });
        
        return {
            token,
            user: {
                id: userData.sub,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                provider: 'google'
            }
        };
        
    } catch (error) {
        logError('Failed to process Google login', error);
        throw new Error('Failed to process Google authentication');
    }
}

/**
 * Handle Google login error
 * @param {Error} error - Error object
 */
export function handleGoogleError(error) {
    logError('Google login failed', error);
    throw new Error(error?.message || 'Google authentication failed');
}

/**
 * Get Google OAuth configuration
 * @returns {Object} Configuration object
 */
export function getGoogleConfig() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        logError('Google Client ID not configured');
        throw new Error('Google authentication is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
    }
    
    return {
        clientId,
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        scope: 'email profile',
        hosted_domain: undefined, // Set to your domain to restrict to specific organization
        auto_select: false,
        use_fedcm_for_prompt: true
    };
}

/**
 * Validate Google OAuth configuration
 * @returns {boolean} True if configured correctly
 */
export function isGoogleAuthConfigured() {
    return !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
}
