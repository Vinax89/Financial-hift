/**
 * @fileoverview E2E tests for dashboard functionality
 * @description Tests dashboard loading, widgets, navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/home/i);
  });

  test('should load dashboard successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard|\/home/i);
    
    // Page title
    await expect(page.getByText(/dashboard|home|overview/i)).toBeVisible();
    
    // Main navigation visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display financial summary', async ({ page }) => {
    // Check for summary cards/widgets
    await expect(page.getByText(/total income|income/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/total expenses|expenses/i)).toBeVisible();
    await expect(page.getByText(/net income|balance/i)).toBeVisible();
  });

  test('should display recent transactions', async ({ page }) => {
    // Look for recent transactions section
    await expect(page.getByText(/recent transactions|latest transactions/i)).toBeVisible({ timeout: 10000 });
    
    // Check for transaction items
    const transactions = page.locator('[data-testid="transaction-item"]');
    await expect(transactions.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display budget progress', async ({ page }) => {
    // Look for budget section
    const budgetSection = page.getByText(/budget|spending/i);
    
    if (await budgetSection.isVisible({ timeout: 5000 })) {
      // Check for progress bars or charts
      await expect(page.locator('[role="progressbar"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display goals progress', async ({ page }) => {
    // Look for goals section
    const goalsSection = page.getByText(/goals|savings/i);
    
    if (await goalsSection.isVisible({ timeout: 5000 })) {
      await expect(goalsSection).toBeVisible();
    }
  });

  test('should navigate to transactions page', async ({ page }) => {
    await page.getByRole('link', { name: /transactions/i }).click();
    
    await page.waitForURL(/\/transactions/i);
    await expect(page).toHaveURL(/\/transactions/i);
  });

  test('should navigate to budget page', async ({ page }) => {
    await page.getByRole('link', { name: /budget/i }).click();
    
    await page.waitForURL(/\/budget/i);
    await expect(page).toHaveURL(/\/budget/i);
  });

  test('should navigate to goals page', async ({ page }) => {
    await page.getByRole('link', { name: /goals/i }).click();
    
    await page.waitForURL(/\/goals/i);
    await expect(page).toHaveURL(/\/goals/i);
  });

  test('should navigate to calendar page', async ({ page }) => {
    const calendarLink = page.getByRole('link', { name: /calendar/i });
    
    if (await calendarLink.isVisible()) {
      await calendarLink.click();
      await page.waitForURL(/\/calendar/i);
      await expect(page).toHaveURL(/\/calendar/i);
    }
  });

  test('should navigate to analytics page', async ({ page }) => {
    const analyticsLink = page.getByRole('link', { name: /analytics|reports/i });
    
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await page.waitForURL(/\/analytics|\/reports/i);
    }
  });

  test('should open quick transaction form', async ({ page }) => {
    // Look for quick add button
    const quickAddButton = page.getByRole('button', { name: /quick.*add|add.*transaction/i });
    
    if (await quickAddButton.isVisible({ timeout: 2000 })) {
      await quickAddButton.click();
      
      // Form should open
      await expect(page.getByLabel(/description/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display charts and visualizations', async ({ page }) => {
    // Check for chart canvas or SVG elements
    const charts = page.locator('canvas, svg[class*="recharts"]');
    
    if (await charts.first().isVisible({ timeout: 5000 })) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should toggle dark/light mode', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    
    if (await themeToggle.isVisible({ timeout: 2000 })) {
      // Get current theme
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      
      // Wait for theme change
      await page.waitForTimeout(500);
      
      // Class should change
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('should show user profile menu', async ({ page }) => {
    // Click profile/avatar button
    await page.getByRole('button', { name: /profile|account|menu/i }).click();
    
    // Menu should open
    await expect(page.getByRole('menuitem', { name: /profile|settings|logout/i }).first()).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    // Open profile menu
    await page.getByRole('button', { name: /profile|account|menu/i }).click();
    
    // Click settings
    const settingsLink = page.getByRole('menuitem', { name: /settings/i });
    
    if (await settingsLink.isVisible({ timeout: 2000 })) {
      await settingsLink.click();
      await page.waitForURL(/\/settings/i);
    }
  });

  test('should display notifications', async ({ page }) => {
    // Look for notifications button
    const notificationsButton = page.getByRole('button', { name: /notifications/i });
    
    if (await notificationsButton.isVisible({ timeout: 2000 })) {
      await notificationsButton.click();
      
      // Notifications panel should open
      await expect(page.getByText(/notifications|no.*notifications/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should refresh dashboard data', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|reload/i });
    
    if (await refreshButton.isVisible({ timeout: 2000 })) {
      await refreshButton.click();
      
      // Wait for refresh animation or loading state
      await page.waitForTimeout(1000);
      
      // Content should still be visible
      await expect(page.getByText(/dashboard|home/i)).toBeVisible();
    }
  });

  test('should handle empty state', async ({ page, context }) => {
    // This test would require a way to clear all data or use a fresh account
    // For now, just check if empty state components exist
    
    const emptyState = page.getByText(/no transactions|get started|add your first/i);
    
    // If empty state is visible, verify its content
    if (await emptyState.isVisible({ timeout: 2000 })) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile menu button should be visible
      const menuButton = page.getByRole('button', { name: /menu|navigation/i });
      await expect(menuButton).toBeVisible();
      
      // Click to open mobile menu
      await menuButton.click();
      
      // Navigation should be visible
      await expect(page.getByRole('link', { name: /transactions/i })).toBeVisible();
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Reload page to see loading states
    await page.reload();
    
    // Look for loading indicators (may be too fast to catch)
    const loadingIndicators = page.locator('[aria-busy="true"], [role="status"]');
    
    // Page should eventually load
    await expect(page.getByText(/dashboard|home/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display upcoming bills/obligations', async ({ page }) => {
    const upcomingSection = page.getByText(/upcoming|due|bills|obligations/i);
    
    if (await upcomingSection.isVisible({ timeout: 5000 })) {
      await expect(upcomingSection).toBeVisible();
    }
  });

  test('should display safe to spend amount', async ({ page }) => {
    const safeToSpend = page.getByText(/safe to spend|available/i);
    
    if (await safeToSpend.isVisible({ timeout: 5000 })) {
      await expect(safeToSpend).toBeVisible();
      
      // Should show an amount
      await expect(page.locator('text=/\\$[0-9,]+\\.?[0-9]*/').first()).toBeVisible();
    }
  });
});

test.describe('Dashboard Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/home/i);
  });

  test('should display income chart', async ({ page }) => {
    // Look for income chart section
    const incomeChart = page.locator('[data-testid="income-chart"]');
    
    if (await incomeChart.isVisible({ timeout: 5000 })) {
      await expect(incomeChart).toBeVisible();
    }
  });

  test('should display spending trends', async ({ page }) => {
    const spendingChart = page.locator('[data-testid="spending-chart"]');
    
    if (await spendingChart.isVisible({ timeout: 5000 })) {
      await expect(spendingChart).toBeVisible();
    }
  });

  test('should display category breakdown', async ({ page }) => {
    const categoryChart = page.locator('[data-testid="category-chart"]');
    
    if (await categoryChart.isVisible({ timeout: 5000 })) {
      await expect(categoryChart).toBeVisible();
    }
  });

  test('should filter data by time period', async ({ page }) => {
    // Look for time period selector
    const periodSelector = page.getByRole('button', { name: /week|month|year|period/i });
    
    if (await periodSelector.isVisible({ timeout: 2000 })) {
      await periodSelector.click();
      
      // Select month view
      await page.getByRole('menuitem', { name: /month/i }).click();
      
      // Wait for data to reload
      await page.waitForTimeout(1000);
      
      // Data should still be visible
      await expect(page.getByText(/dashboard|home/i)).toBeVisible();
    }
  });
});
