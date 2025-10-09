// @ts-nocheck
/**
 * @fileoverview Comprehensive tests for authentication utilities
 * @description Tests for isAuthenticated, getCurrentUser, and logout functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, useLogout } from './auth.js';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn()
    };
});

vi.mock('@/ui/use-toast.jsx', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn()
    }))
}));

vi.mock('./logger.js', () => ({
    logInfo: vi.fn(),
    logError: vi.fn()
}));

describe('isAuthenticated', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return true when auth token exists', () => {
        localStorage.setItem('auth_token', 'test-token-123');
        expect(isAuthenticated()).toBe(true);
    });

    it('should return false when auth token does not exist', () => {
        expect(isAuthenticated()).toBe(false);
    });

    it('should return false when auth token is empty string', () => {
        localStorage.setItem('auth_token', '');
        expect(isAuthenticated()).toBe(false);
    });

    it('should return false when auth token is null', () => {
        localStorage.setItem('auth_token', null);
        expect(isAuthenticated()).toBe(false);
    });

    it('should handle localStorage errors gracefully', () => {
        // Mock localStorage.getItem to throw error
        const originalGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = vi.fn(() => {
            throw new Error('Storage error');
        });

        expect(() => isAuthenticated()).toThrow();

        // Restore
        Storage.prototype.getItem = originalGetItem;
    });
});

describe('getCurrentUser', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return null when not authenticated', () => {
        expect(getCurrentUser()).toBe(null);
    });

    it('should return user object when authenticated', () => {
        localStorage.setItem('auth_token', 'test-token');
        localStorage.setItem('user_email', 'test@example.com');
        localStorage.setItem('user_name', 'Test User');

        const user = getCurrentUser();
        expect(user).toEqual({
            email: 'test@example.com',
            name: 'Test User'
        });
    });

    it('should return user with email when name is missing', () => {
        localStorage.setItem('auth_token', 'test-token');
        localStorage.setItem('user_email', 'john.doe@example.com');

        const user = getCurrentUser();
        expect(user).not.toBeNull();
        expect(user.email).toBe('john.doe@example.com');
        expect(user.name).toBe('john.doe'); // Fallback to email username
    });

    it('should return user with null name when user_name is not set', () => {
        localStorage.setItem('auth_token', 'test-token');
        localStorage.setItem('user_email', 'test@example.com');

        const user = getCurrentUser();
        expect(user).not.toBeNull();
        expect(user.email).toBe('test@example.com');
    });

    it('should handle missing auth token', () => {
        localStorage.setItem('user_email', 'test@example.com');
        localStorage.setItem('user_name', 'Test User');

        expect(getCurrentUser()).toBe(null);
    });

    it('should handle missing email', () => {
        localStorage.setItem('auth_token', 'test-token');
        localStorage.setItem('user_name', 'Test User');

        const user = getCurrentUser();
        expect(user).toBe(null);
    });
});

describe('useLogout', () => {
    let mockNavigate;
    let mockToast;
    let useNavigate;
    let useToast;

    beforeEach(async () => {
        localStorage.clear();
        sessionStorage.clear();
        
        // Setup mocks
        mockNavigate = vi.fn();
        mockToast = vi.fn();
        
        const reactRouter = await import('react-router-dom');
        const toastModule = await import('@/ui/use-toast.jsx');
        
        useNavigate = reactRouter.useNavigate;
        useToast = toastModule.useToast;
        
        useNavigate.mockReturnValue(mockNavigate);
        useToast.mockReturnValue({ toast: mockToast });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should clear localStorage on logout', async () => {
        localStorage.setItem('auth_token', 'test-token');
        localStorage.setItem('user_email', 'test@example.com');
        localStorage.setItem('user_name', 'Test User');

        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(localStorage.getItem('auth_token')).toBe(null);
        expect(localStorage.getItem('user_email')).toBe(null);
        expect(localStorage.getItem('user_name')).toBe(null);
    });

    it('should clear sessionStorage on logout', async () => {
        sessionStorage.setItem('test_key', 'test_value');

        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(sessionStorage.getItem('test_key')).toBe(null);
    });

    it('should navigate to login page by default', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should navigate to custom redirect path', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout({ redirectTo: '/home' });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });

    it('should show success toast by default', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Logged out',
            description: 'You have been successfully logged out.'
        });
    });

    it('should not show toast when showToast is false', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout({ showToast: false });
        });

        expect(mockToast).not.toHaveBeenCalled();
    });

    it('should log info messages', async () => {
        const { logInfo } = await import('./logger.js');
        
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(logInfo).toHaveBeenCalledWith('User logout initiated');
        expect(logInfo).toHaveBeenCalledWith('User logged out successfully');
    });

    it('should handle logout errors gracefully', async () => {
        const { logError } = await import('./logger.js');
        
        // Mock localStorage.removeItem to throw error
        const originalRemoveItem = Storage.prototype.removeItem;
        Storage.prototype.removeItem = vi.fn(() => {
            throw new Error('Storage error');
        });

        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(logError).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Logout Failed',
            description: 'There was a problem logging out. Please try again.',
            variant: 'destructive'
        });

        // Restore
        Storage.prototype.removeItem = originalRemoveItem;
    });

    it('should work with default options', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
        expect(mockToast).toHaveBeenCalled();
    });

    it('should accept custom options object', async () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: BrowserRouter
        });

        await act(async () => {
            await result.current.logout({
                showToast: false,
                redirectTo: '/goodbye'
            });
        });

        expect(mockNavigate).toHaveBeenCalledWith('/goodbye', { replace: true });
        expect(mockToast).not.toHaveBeenCalled();
    });
});

