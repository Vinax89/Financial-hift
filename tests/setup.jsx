/**
 * @fileoverview Test setup utilities
 * @description Reusable test helpers and custom render functions
 */

import { render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Custom render function for components that need FormProvider
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {import('zod').ZodSchema} options.schema - Zod validation schema
 * @param {Object} options.defaultValues - Default form values
 * @param {Object} options.formProps - Additional form props
 * @returns {Object} Render result with form methods
 */
export function renderWithForm(ui, { schema, defaultValues = {}, formProps = {}, ...renderOptions } = {}) {
  function Wrapper({ children }) {
    const methods = useForm({
      resolver: schema ? zodResolver(schema) : undefined,
      defaultValues,
      ...formProps,
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Wait for async updates
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const waitFor = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create mock form methods for testing
 * @returns {Object} Mock form methods
 */
export function createMockFormMethods() {
  return {
    register: vi.fn(() => ({ name: 'test', ref: vi.fn() })),
    handleSubmit: vi.fn((fn) => (e) => {
      e?.preventDefault?.();
      return fn();
    }),
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(() => ({})),
    reset: vi.fn(),
    formState: {
      errors: {},
      isDirty: false,
      isValid: true,
      isSubmitting: false,
      touchedFields: {},
      dirtyFields: {},
    },
    control: {},
    trigger: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
  };
}

/**
 * Create mock user for testing
 * @returns {Object} Mock user object
 */
export function createMockUser() {
  return {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create mock transaction for testing
 * @returns {Object} Mock transaction object
 */
export function createMockTransaction() {
  return {
    id: '1',
    description: 'Test Transaction',
    amount: 100,
    type: 'expense',
    category: 'food',
    date: '2024-01-15',
    notes: 'Test notes',
  };
}

/**
 * Create mock budget for testing
 * @returns {Object} Mock budget object
 */
export function createMockBudget() {
  return {
    id: '1',
    name: 'Monthly Budget',
    amount: 2000,
    period: 'monthly',
    category: 'groceries',
    startDate: '2024-01-01',
    rollover: false,
  };
}

/**
 * Create mock goal for testing
 * @returns {Object} Mock goal object
 */
export function createMockGoal() {
  return {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 5000,
    deadline: '2024-12-31',
    category: 'savings',
    priority: 'high',
    isActive: true,
  };
}

/**
 * Suppress console errors/warnings during a test
 * @param {Function} fn - Test function to run
 * @returns {Promise<void>}
 */
export async function suppressConsole(fn) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = vi.fn();
  console.warn = vi.fn();
  
  try {
    await fn();
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
}

/**
 * Mock localStorage with initial data
 * @param {Object} initialData - Initial localStorage data
 */
export function mockLocalStorage(initialData = {}) {
  const store = { ...initialData };
  
  Storage.prototype.getItem = vi.fn((key) => store[key] || null);
  Storage.prototype.setItem = vi.fn((key, value) => {
    store[key] = value;
  });
  Storage.prototype.removeItem = vi.fn((key) => {
    delete store[key];
  });
  Storage.prototype.clear = vi.fn(() => {
    Object.keys(store).forEach((key) => delete store[key]);
  });
  
  return store;
}

/**
 * Mock fetch with predefined responses
 * @param {Object} responses - Map of URL patterns to responses
 * @returns {Function} Mocked fetch function
 */
export function mockFetch(responses = {}) {
  return vi.fn((url) => {
    const response = responses[url] || responses['*'] || { data: {} };
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => response,
      text: async () => JSON.stringify(response),
      ...response.fetchResponse,
    });
  });
}

// Export all testing library utilities for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
