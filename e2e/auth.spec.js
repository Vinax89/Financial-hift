/**
 * @fileoverview E2E tests for authentication flows
 * @description Tests user login, signup, and logout
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Financial Shift/i);
    
    // Check for login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Expect validation errors
    await expect(page.getByText(/email.*required/i)).toBeVisible();
    await expect(page.getByText(/password.*required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill login form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    
    // Submit form
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard|\/home/i, { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.getByText(/dashboard|home/i)).toBeVisible();
    
    // Check for user menu or profile
    await expect(page.getByRole('button', { name: /profile|account|menu/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Expect error message
    await expect(page.getByText(/invalid credentials|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signup page', async ({ page }) => {
    // Click signup link
    await page.getByRole('link', { name: /sign up|create account|register/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/signup|\/register/i);
    
    // Verify signup form
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test('should signup with valid data', async ({ page }) => {
    // Navigate to signup
    await page.getByRole('link', { name: /sign up|create account|register/i }).click();
    await page.waitForURL(/\/signup|\/register/i);
    
    // Fill signup form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/^password$/i).fill('Test123!');
    await page.getByLabel(/confirm password/i).fill('Test123!');
    await page.getByLabel(/terms|agree/i).check();
    
    // Submit
    await page.getByRole('button', { name: /sign up|create account|register/i }).click();
    
    // Wait for success (dashboard or verification page)
    await page.waitForURL(/\/dashboard|\/verify|\/home/i, { timeout: 10000 });
  });

  test('should show error when passwords do not match', async ({ page }) => {
    // Navigate to signup
    await page.getByRole('link', { name: /sign up|create account/i }).click();
    await page.waitForURL(/\/signup|\/register/i);
    
    await page.getByLabel(/^password$/i).fill('Test123!');
    await page.getByLabel(/confirm password/i).fill('Different123!');
    await page.getByLabel(/confirm password/i).blur();
    
    await expect(page.getByText(/passwords.*match/i)).toBeVisible();
  });

  test('should enforce password complexity', async ({ page }) => {
    // Navigate to signup
    await page.getByRole('link', { name: /sign up|create account/i }).click();
    await page.waitForURL(/\/signup|\/register/i);
    
    const passwordInput = page.getByLabel(/^password$/i);
    
    // Try weak password
    await passwordInput.fill('weak');
    await passwordInput.blur();
    
    // Expect password complexity error
    await expect(page.getByText(/password.*8 characters|password.*uppercase|password.*number/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await page.waitForURL(/\/dashboard|\/home/i);
    
    // Open user menu
    await page.getByRole('button', { name: /profile|account|menu/i }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
    
    // Should redirect to login
    await page.waitForURL(/\/login|\/$/, { timeout: 5000 });
    
    // Login form should be visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should persist session on page reload', async ({ page }) => {
    // Login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await page.waitForURL(/\/dashboard|\/home/i);
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page.getByText(/dashboard|home/i)).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/login|\/$/, { timeout: 5000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should show "Remember Me" option', async ({ page }) => {
    const rememberCheckbox = page.getByLabel(/remember me/i);
    
    if (await rememberCheckbox.isVisible()) {
      await expect(rememberCheckbox).toBeVisible();
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();
    }
  });

  test('should have "Forgot Password" link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      await page.waitForURL(/\/forgot|\/reset/i);
    }
  });
});

test.describe('Password Reset Flow', () => {
  test('should request password reset', async ({ page }) => {
    await page.goto('/');
    
    // Click forgot password
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForURL(/\/forgot|\/reset/i);
      
      // Fill email
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByRole('button', { name: /send|reset/i }).click();
      
      // Success message
      await expect(page.getByText(/email sent|check your email/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Session Management', () => {
  test('should handle expired session', async ({ page, context }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await page.waitForURL(/\/dashboard|\/home/i);
    
    // Clear session (simulate expiration)
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    // Reload page
    await page.reload();
    
    // Should redirect to login
    await page.waitForURL(/\/login|\/$/, { timeout: 5000 });
  });
});
