/**
 * @fileoverview Authentication Storage Utilities
 * @description Secure storage wrapper for authentication tokens and user data.
 * Uses encrypted storage with automatic expiration for sensitive auth data.
 * 
 * @security All authentication tokens are encrypted using AES-GCM 256-bit encryption
 * 
 * @example
 * ```typescript
 * // Save auth tokens after login
 * await saveAuthTokens({
 *   accessToken: 'token123',
 *   refreshToken: 'refresh456',
 *   expiresIn: 3600000
 * });
 * 
 * // Check if user is authenticated
 * const isAuth = await isAuthenticated();
 * 
 * // Get current auth token
 * const token = await getAuthToken();
 * 
 * // Clear auth on logout
 * clearAuth();
 * ```
 */

import { secureStorage } from './secureStorage';
import { logInfo, logWarn } from './logger';

/**
 * Storage keys for authentication data
 * @constant
 */
const AUTH_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

/**
 * Default token expiration time (1 hour)
 * @constant
 */
const DEFAULT_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Authentication tokens interface
 */
export interface AuthTokens {
  /** Access token for API requests */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Token expiration time in milliseconds */
  expiresIn?: number;
  /** When the token expires (timestamp) */
  expiresAt?: number;
}

/**
 * User data interface
 */
export interface UserData {
  /** User ID */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** Additional user properties */
  [key: string]: any;
}

/**
 * Save authentication tokens securely
 * 
 * @remarks
 * Tokens are encrypted using AES-GCM and stored with automatic expiration.
 * Access tokens expire based on the provided expiresIn value.
 * 
 * @param tokens - Authentication tokens to store
 * @returns Promise that resolves when tokens are saved
 * 
 * @throws {Error} If encryption fails or storage is unavailable
 * 
 * @example
 * ```typescript
 * await saveAuthTokens({
 *   accessToken: 'eyJhbGc...',
 *   refreshToken: 'def50200...',
 *   expiresIn: 3600000 // 1 hour
 * });
 * ```
 * 
 * @public
 */
export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  try {
    const expiresIn = tokens.expiresIn || DEFAULT_TOKEN_EXPIRY;
    
    // Store access token with encryption and expiration
    await secureStorage.set(AUTH_KEYS.ACCESS_TOKEN, tokens.accessToken, {
      encrypt: true,
      expiresIn,
    });
    
    // Store refresh token if provided (usually has longer expiration)
    if (tokens.refreshToken) {
      await secureStorage.set(AUTH_KEYS.REFRESH_TOKEN, tokens.refreshToken, {
        encrypt: true,
        expiresIn: expiresIn * 24, // Refresh token lasts 24x longer
      });
    }
    
    // Store token expiry timestamp
    const expiresAt = Date.now() + expiresIn;
    await secureStorage.set(AUTH_KEYS.TOKEN_EXPIRY, expiresAt, {
      expiresIn,
    });
    
    logInfo('Auth tokens saved securely');
  } catch (error) {
    logWarn('Failed to save auth tokens', error);
    throw new Error('Failed to save authentication tokens');
  }
}

/**
 * Get the current access token
 * 
 * @remarks
 * Returns null if token is expired or not found.
 * Token is automatically decrypted.
 * 
 * @returns Promise resolving to access token or null
 * 
 * @example
 * ```typescript
 * const token = await getAuthToken();
 * if (token) {
 *   // Use token for API request
 *   headers['Authorization'] = `Bearer ${token}`;
 * }
 * ```
 * 
 * @public
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await secureStorage.get<string>(AUTH_KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    logWarn('Failed to get auth token', error);
    return null;
  }
}

/**
 * Get the refresh token
 * 
 * @remarks
 * Returns null if refresh token is not found or expired.
 * Token is automatically decrypted.
 * 
 * @returns Promise resolving to refresh token or null
 * 
 * @example
 * ```typescript
 * const refreshToken = await getRefreshToken();
 * if (refreshToken) {
 *   // Use to obtain new access token
 * }
 * ```
 * 
 * @public
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    const token = await secureStorage.get<string>(AUTH_KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    logWarn('Failed to get refresh token', error);
    return null;
  }
}

/**
 * Get both auth tokens
 * 
 * @returns Promise resolving to auth tokens or null if not authenticated
 * 
 * @example
 * ```typescript
 * const tokens = await getAuthTokens();
 * if (tokens) {
 *   console.log('Access token:', tokens.accessToken);
 *   console.log('Refresh token:', tokens.refreshToken);
 * }
 * ```
 * 
 * @public
 */
export async function getAuthTokens(): Promise<AuthTokens | null> {
  try {
    const accessToken = await getAuthToken();
    if (!accessToken) return null;
    
    const refreshToken = await getRefreshToken();
    const expiresAt = await secureStorage.get<number>(AUTH_KEYS.TOKEN_EXPIRY);
    
    return {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: expiresAt || undefined,
    };
  } catch (error) {
    logWarn('Failed to get auth tokens', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * 
 * @remarks
 * Returns true if a valid, non-expired access token exists.
 * 
 * @returns Promise resolving to authentication status
 * 
 * @example
 * ```typescript
 * if (await isAuthenticated()) {
 *   // User is logged in
 *   showDashboard();
 * } else {
 *   // User needs to log in
 *   redirectToLogin();
 * }
 * ```
 * 
 * @public
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}

/**
 * Save user data securely
 * 
 * @remarks
 * User data is encrypted if it contains sensitive information.
 * Consider encrypting data that includes PII.
 * 
 * @param userData - User data to store
 * @param encrypt - Whether to encrypt user data (default: true)
 * @returns Promise that resolves when user data is saved
 * 
 * @example
 * ```typescript
 * await saveUserData({
 *   id: 'user123',
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * ```
 * 
 * @public
 */
export async function saveUserData(userData: UserData, encrypt: boolean = true): Promise<void> {
  try {
    await secureStorage.set(AUTH_KEYS.USER_DATA, userData, {
      encrypt,
    });
    logInfo('User data saved securely');
  } catch (error) {
    logWarn('Failed to save user data', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Get stored user data
 * 
 * @remarks
 * Returns null if user data is not found.
 * Data is automatically decrypted if it was encrypted.
 * 
 * @returns Promise resolving to user data or null
 * 
 * @example
 * ```typescript
 * const user = await getUserData();
 * if (user) {
 *   console.log('Logged in as:', user.name);
 * }
 * ```
 * 
 * @public
 */
export async function getUserData(): Promise<UserData | null> {
  try {
    const userData = await secureStorage.get<UserData>(AUTH_KEYS.USER_DATA);
    return userData;
  } catch (error) {
    logWarn('Failed to get user data', error);
    return null;
  }
}

/**
 * Clear all authentication data
 * 
 * @remarks
 * Removes all auth tokens and user data from storage.
 * Call this on logout.
 * 
 * @example
 * ```typescript
 * // On logout
 * clearAuth();
 * redirectToLogin();
 * ```
 * 
 * @public
 */
export function clearAuth(): void {
  try {
    secureStorage.remove(AUTH_KEYS.ACCESS_TOKEN);
    secureStorage.remove(AUTH_KEYS.REFRESH_TOKEN);
    secureStorage.remove(AUTH_KEYS.USER_DATA);
    secureStorage.remove(AUTH_KEYS.TOKEN_EXPIRY);
    logInfo('Auth data cleared');
  } catch (error) {
    logWarn('Failed to clear auth data', error);
  }
}

/**
 * Check if token is expired
 * 
 * @returns Promise resolving to true if token is expired
 * 
 * @example
 * ```typescript
 * if (await isTokenExpired()) {
 *   // Refresh token or redirect to login
 *   const refreshToken = await getRefreshToken();
 *   if (refreshToken) {
 *     await refreshAccessToken(refreshToken);
 *   }
 * }
 * ```
 * 
 * @public
 */
export async function isTokenExpired(): Promise<boolean> {
  try {
    const expiresAt = await secureStorage.get<number>(AUTH_KEYS.TOKEN_EXPIRY);
    if (!expiresAt) return true;
    
    return Date.now() >= expiresAt;
  } catch (error) {
    logWarn('Failed to check token expiration', error);
    return true;
  }
}

/**
 * Get time until token expires (in milliseconds)
 * 
 * @returns Promise resolving to milliseconds until expiration, or 0 if expired/not found
 * 
 * @example
 * ```typescript
 * const timeLeft = await getTokenTimeLeft();
 * console.log(`Token expires in ${Math.floor(timeLeft / 60000)} minutes`);
 * ```
 * 
 * @public
 */
export async function getTokenTimeLeft(): Promise<number> {
  try {
    const expiresAt = await secureStorage.get<number>(AUTH_KEYS.TOKEN_EXPIRY);
    if (!expiresAt) return 0;
    
    const timeLeft = expiresAt - Date.now();
    return Math.max(0, timeLeft);
  } catch (error) {
    logWarn('Failed to get token time left', error);
    return 0;
  }
}
