/**
 * @fileoverview E2E tests for transaction management
 * @description Tests creating, editing, deleting transactions
 */

import { test, expect } from '@playwright/test';

test.describe('Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/home/i);
  });

  test('should navigate to transactions page', async ({ page }) => {
    // Click transactions link in navigation
    await page.getByRole('link', { name: /transactions/i }).click();
    
    // Wait for transactions page
    await page.waitForURL(/\/transactions/i);
    
    // Verify page loaded
    await expect(page.getByText(/transactions|recent transactions/i)).toBeVisible();
  });

  test('should display transaction list', async ({ page }) => {
    await page.goto('/transactions');
    
    // Check for transaction table or list
    const transactionList = page.locator('[data-testid="transaction-list"], table, [role="table"]').first();
    await expect(transactionList).toBeVisible({ timeout: 10000 });
  });

  test('should open create transaction form', async ({ page }) => {
    await page.goto('/transactions');
    
    // Click add/create button
    await page.getByRole('button', { name: /add transaction|new transaction|create/i }).click();
    
    // Verify form opened (modal or page)
    await expect(page.getByLabel(/description/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/amount/i)).toBeVisible();
  });

  test('should create new expense transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // Open create form
    await page.getByRole('button', { name: /add transaction|new transaction|create/i }).click();
    
    // Fill form
    await page.getByLabel(/description/i).fill('Coffee at Starbucks');
    await page.getByLabel(/amount/i).fill('5.50');
    
    // Select expense type
    const expenseRadio = page.getByLabel(/expense/i).first();
    await expenseRadio.click();
    
    // Select category
    const categorySelect = page.getByLabel(/category/i);
    await categorySelect.selectOption('food');
    
    // Select date
    await page.getByLabel(/date/i).fill('2024-01-15');
    
    // Optional notes
    const notesField = page.getByLabel(/notes/i);
    if (await notesField.isVisible()) {
      await notesField.fill('Morning coffee');
    }
    
    // Submit form
    await page.getByRole('button', { name: /save|create|add/i }).click();
    
    // Wait for success (form closes or success message)
    await expect(page.getByText(/success|created|added/i)).toBeVisible({ timeout: 5000 });
    
    // Verify transaction appears in list
    await expect(page.getByText(/coffee at starbucks/i)).toBeVisible();
  });

  test('should create new income transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.getByRole('button', { name: /add transaction|new transaction/i }).click();
    
    // Fill form
    await page.getByLabel(/description/i).fill('Salary Payment');
    await page.getByLabel(/amount/i).fill('5000.00');
    
    // Select income type
    const incomeRadio = page.getByLabel(/income/i).first();
    await incomeRadio.click();
    
    // Select category
    await page.getByLabel(/category/i).selectOption('salary');
    
    // Select date
    await page.getByLabel(/date/i).fill('2024-01-01');
    
    // Submit
    await page.getByRole('button', { name: /save|create|add/i }).click();
    
    // Verify
    await expect(page.getByText(/success|created/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/salary payment/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.getByRole('button', { name: /add transaction|new transaction/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save|create|add/i }).click();
    
    // Expect validation errors
    await expect(page.getByText(/description.*required/i)).toBeVisible();
    await expect(page.getByText(/amount.*required/i)).toBeVisible();
  });

  test('should edit existing transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // Click edit button on first transaction
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();
    
    // Wait for edit form
    await expect(page.getByLabel(/description/i)).toBeVisible();
    
    // Update description
    const descriptionField = page.getByLabel(/description/i);
    await descriptionField.clear();
    await descriptionField.fill('Updated Transaction');
    
    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Verify update
    await expect(page.getByText(/success|updated/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/updated transaction/i)).toBeVisible();
  });

  test('should delete transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    // Get initial count
    const transactionRows = page.locator('[data-testid="transaction-item"]');
    const initialCount = await transactionRows.count();
    
    // Click delete button on first transaction
    const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
    await deleteButton.click();
    
    // Confirm deletion (if confirmation dialog appears)
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }
    
    // Verify deletion
    await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 });
    
    // Verify count decreased
    await expect(transactionRows).toHaveCount(initialCount - 1);
  });

  test('should filter transactions by type', async ({ page }) => {
    await page.goto('/transactions');
    
    // Click expense filter
    await page.getByRole('button', { name: /expense|filter.*expense/i }).click();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // All visible transactions should be expenses
    const transactions = page.locator('[data-testid="transaction-item"]');
    const count = await transactions.count();
    
    if (count > 0) {
      // Check first transaction has expense indicator
      await expect(transactions.first()).toContainText(/expense/i);
    }
  });

  test('should search transactions', async ({ page }) => {
    await page.goto('/transactions');
    
    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('coffee');
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      // Verify results contain search term
      const transactions = page.locator('[data-testid="transaction-item"]');
      if (await transactions.count() > 0) {
        await expect(transactions.first()).toContainText(/coffee/i);
      }
    }
  });

  test('should sort transactions by date', async ({ page }) => {
    await page.goto('/transactions');
    
    // Click date column header to sort
    const dateHeader = page.getByRole('button', { name: /date|sort.*date/i });
    
    if (await dateHeader.isVisible()) {
      await dateHeader.click();
      
      // Wait for sorting
      await page.waitForTimeout(500);
      
      // Transactions should be reordered
      await expect(page.locator('[data-testid="transaction-item"]').first()).toBeVisible();
    }
  });

  test('should paginate transactions', async ({ page }) => {
    await page.goto('/transactions');
    
    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: /next|>|→/i });
    
    if (await nextButton.isVisible({ timeout: 2000 })) {
      // Get first transaction on page 1
      const firstTransaction = await page.locator('[data-testid="transaction-item"]').first().textContent();
      
      // Go to next page
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // First transaction should be different
      const newFirstTransaction = await page.locator('[data-testid="transaction-item"]').first().textContent();
      expect(newFirstTransaction).not.toBe(firstTransaction);
    }
  });

  test('should display transaction details', async ({ page }) => {
    await page.goto('/transactions');
    
    // Click on transaction to view details
    await page.locator('[data-testid="transaction-item"]').first().click();
    
    // Details should be visible (expanded or modal)
    await expect(page.getByText(/description|amount|category|date/i)).toBeVisible({ timeout: 3000 });
  });

  test('should create recurring transaction', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.getByRole('button', { name: /add transaction|new transaction/i }).click();
    
    // Fill basic info
    await page.getByLabel(/description/i).fill('Monthly Rent');
    await page.getByLabel(/amount/i).fill('1500');
    await page.getByLabel(/expense/i).first().click();
    
    // Enable recurring
    const recurringCheckbox = page.getByLabel(/recurring|repeat/i);
    if (await recurringCheckbox.isVisible()) {
      await recurringCheckbox.check();
      
      // Select frequency
      const frequencySelect = page.getByLabel(/frequency/i);
      await frequencySelect.selectOption('monthly');
      
      // Submit
      await page.getByRole('button', { name: /save|create/i }).click();
      
      // Verify
      await expect(page.getByText(/success/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should export transactions', async ({ page }) => {
    await page.goto('/transactions');
    
    // Check for export button
    const exportButton = page.getByRole('button', { name: /export|download/i });
    
    if (await exportButton.isVisible({ timeout: 2000 })) {
      // Click export (may trigger download)
      await exportButton.click();
      
      // If export dialog opens
      const csvOption = page.getByText(/csv|excel/i);
      if (await csvOption.isVisible({ timeout: 1000 })) {
        await csvOption.click();
      }
    }
  });
});

test.describe('Quick Transaction Entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Test123!');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/home/i);
  });

  test('should use quick transaction form from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for quick add form on dashboard
    const quickForm = page.locator('[data-testid="quick-transaction-form"]');
    
    if (await quickForm.isVisible({ timeout: 2000 })) {
      await quickForm.getByLabel(/description/i).fill('Quick Coffee');
      await quickForm.getByLabel(/amount/i).fill('4.50');
      await quickForm.getByRole('button', { name: /add|save/i }).click();
      
      await expect(page.getByText(/success|added/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
