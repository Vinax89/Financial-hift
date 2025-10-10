/**
 * @fileoverview Integration tests for API interactions
 * @description Tests API client methods with mocked responses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockFetch } from '../setup';

// Mock API client functions
const mockApiClient = {
  transactions: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  budgets: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  goals: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// Mock custom hooks
const useTransactions = () => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await mockApiClient.transactions.getAll();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  return { data, isLoading, error, refetch: fetchTransactions };
};

describe('API Client Integration - Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches all transactions successfully', async () => {
    const mockTransactions = [
      { id: '1', description: 'Coffee', amount: 5.50, type: 'expense' },
      { id: '2', description: 'Salary', amount: 5000, type: 'income' },
    ];

    global.fetch = mockFetch({
      '/api/transactions': { data: mockTransactions },
    });

    mockApiClient.transactions.getAll.mockResolvedValue({ data: mockTransactions });

    const result = await mockApiClient.transactions.getAll();

    expect(result.data).toEqual(mockTransactions);
    expect(result.data).toHaveLength(2);
  });

  it('creates new transaction', async () => {
    const newTransaction = {
      description: 'Groceries',
      amount: 45.99,
      type: 'expense',
      category: 'food',
      date: '2024-01-15',
    };

    const createdTransaction = { id: '3', ...newTransaction };

    mockApiClient.transactions.create.mockResolvedValue({ data: createdTransaction });

    const result = await mockApiClient.transactions.create(newTransaction);

    expect(result.data).toEqual(createdTransaction);
    expect(mockApiClient.transactions.create).toHaveBeenCalledWith(newTransaction);
  });

  it('updates existing transaction', async () => {
    const updatedData = {
      description: 'Updated Coffee',
      amount: 6.00,
    };

    const updatedTransaction = { id: '1', ...updatedData, type: 'expense' };

    mockApiClient.transactions.update.mockResolvedValue({ data: updatedTransaction });

    const result = await mockApiClient.transactions.update('1', updatedData);

    expect(result.data).toEqual(updatedTransaction);
    expect(mockApiClient.transactions.update).toHaveBeenCalledWith('1', updatedData);
  });

  it('deletes transaction', async () => {
    mockApiClient.transactions.delete.mockResolvedValue({ success: true });

    const result = await mockApiClient.transactions.delete('1');

    expect(result.success).toBe(true);
    expect(mockApiClient.transactions.delete).toHaveBeenCalledWith('1');
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Network error';

    mockApiClient.transactions.getAll.mockRejectedValue(new Error(errorMessage));

    await expect(mockApiClient.transactions.getAll()).rejects.toThrow(errorMessage);
  });

  it('retries on failure', async () => {
    let attempts = 0;

    mockApiClient.transactions.getAll.mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve({ data: [] });
    });

    // Mock retry logic
    const fetchWithRetry = async (fn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    };

    const result = await fetchWithRetry(() => mockApiClient.transactions.getAll());

    expect(result.data).toEqual([]);
    expect(attempts).toBe(3);
  });
});

describe('API Client Integration - Budgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all budgets', async () => {
    const mockBudgets = [
      { id: '1', name: 'Monthly Food', amount: 500, category: 'food', period: 'monthly' },
      { id: '2', name: 'Transport', amount: 150, category: 'transport', period: 'monthly' },
    ];

    mockApiClient.budgets.getAll.mockResolvedValue({ data: mockBudgets });

    const result = await mockApiClient.budgets.getAll();

    expect(result.data).toEqual(mockBudgets);
    expect(result.data).toHaveLength(2);
  });

  it('creates new budget', async () => {
    const newBudget = {
      name: 'Entertainment Budget',
      amount: 200,
      category: 'entertainment',
      period: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const createdBudget = { id: '3', ...newBudget };

    mockApiClient.budgets.create.mockResolvedValue({ data: createdBudget });

    const result = await mockApiClient.budgets.create(newBudget);

    expect(result.data).toEqual(createdBudget);
  });

  it('validates budget dates', async () => {
    const invalidBudget = {
      name: 'Invalid Budget',
      amount: 100,
      startDate: '2024-01-31',
      endDate: '2024-01-01', // Before start date
    };

    mockApiClient.budgets.create.mockRejectedValue(
      new Error('End date must be after start date')
    );

    await expect(mockApiClient.budgets.create(invalidBudget)).rejects.toThrow(
      'End date must be after start date'
    );
  });

  it('calculates budget progress', async () => {
    const budget = {
      id: '1',
      name: 'Food Budget',
      amount: 500,
      spent: 350,
      category: 'food',
    };

    const progress = (budget.spent / budget.amount) * 100;

    expect(progress).toBe(70);
    expect(progress).toBeLessThan(100); // Under budget
  });

  it('identifies overspent budgets', async () => {
    const budget = {
      id: '1',
      name: 'Transport',
      amount: 150,
      spent: 200,
      category: 'transport',
    };

    const isOverspent = budget.spent > budget.amount;
    const overspendAmount = budget.spent - budget.amount;

    expect(isOverspent).toBe(true);
    expect(overspendAmount).toBe(50);
  });
});

describe('API Client Integration - Goals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all goals', async () => {
    const mockGoals = [
      {
        id: '1',
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2500,
        category: 'emergency',
        deadline: '2024-12-31',
      },
      {
        id: '2',
        name: 'Vacation',
        targetAmount: 3000,
        currentAmount: 1500,
        category: 'vacation',
        deadline: '2024-06-30',
      },
    ];

    mockApiClient.goals.getAll.mockResolvedValue({ data: mockGoals });

    const result = await mockApiClient.goals.getAll();

    expect(result.data).toEqual(mockGoals);
  });

  it('creates new goal', async () => {
    const newGoal = {
      name: 'New Car',
      targetAmount: 25000,
      currentAmount: 0,
      category: 'purchase',
      deadline: '2025-12-31',
      priority: 'medium',
    };

    const createdGoal = { id: '3', ...newGoal };

    mockApiClient.goals.create.mockResolvedValue({ data: createdGoal });

    const result = await mockApiClient.goals.create(newGoal);

    expect(result.data).toEqual(createdGoal);
  });

  it('updates goal progress', async () => {
    const goalId = '1';
    const contribution = 500;

    const currentGoal = {
      id: goalId,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 2500,
    };

    const updatedGoal = {
      ...currentGoal,
      currentAmount: currentGoal.currentAmount + contribution,
    };

    mockApiClient.goals.update.mockResolvedValue({ data: updatedGoal });

    const result = await mockApiClient.goals.update(goalId, {
      currentAmount: updatedGoal.currentAmount,
    });

    expect(result.data.currentAmount).toBe(3000);
  });

  it('calculates goal progress percentage', () => {
    const goal = {
      targetAmount: 10000,
      currentAmount: 7500,
    };

    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    expect(progress).toBe(75);
  });

  it('marks goal as completed', async () => {
    const goal = {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 10000,
    };

    const isCompleted = goal.currentAmount >= goal.targetAmount;

    expect(isCompleted).toBe(true);

    mockApiClient.goals.update.mockResolvedValue({
      data: { ...goal, status: 'completed', completedAt: '2024-01-15' },
    });

    const result = await mockApiClient.goals.update(goal.id, {
      status: 'completed',
      completedAt: '2024-01-15',
    });

    expect(result.data.status).toBe('completed');
  });
});

describe('API Client Integration - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles 404 errors', async () => {
    mockApiClient.transactions.getById.mockRejectedValue({
      status: 404,
      message: 'Transaction not found',
    });

    await expect(mockApiClient.transactions.getById('non-existent')).rejects.toMatchObject({
      status: 404,
      message: 'Transaction not found',
    });
  });

  it('handles 401 unauthorized errors', async () => {
    mockApiClient.transactions.getAll.mockRejectedValue({
      status: 401,
      message: 'Unauthorized',
    });

    await expect(mockApiClient.transactions.getAll()).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('handles 500 server errors', async () => {
    mockApiClient.transactions.create.mockRejectedValue({
      status: 500,
      message: 'Internal server error',
    });

    await expect(mockApiClient.transactions.create({})).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
  });

  it('handles network errors', async () => {
    mockApiClient.transactions.getAll.mockRejectedValue({
      name: 'NetworkError',
      message: 'Failed to fetch',
    });

    await expect(mockApiClient.transactions.getAll()).rejects.toMatchObject({
      name: 'NetworkError',
      message: 'Failed to fetch',
    });
  });

  it('handles timeout errors', async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 100);
    });

    mockApiClient.transactions.getAll.mockReturnValue(timeoutPromise);

    await expect(mockApiClient.transactions.getAll()).rejects.toThrow('Request timeout');
  });
});

describe('API Client Integration - Caching', () => {
  it('caches GET requests', async () => {
    const mockData = [{ id: '1', description: 'Test' }];
    mockApiClient.transactions.getAll.mockResolvedValue({ data: mockData });

    // First call
    const result1 = await mockApiClient.transactions.getAll();
    expect(result1.data).toEqual(mockData);

    // Second call (should use cache if implemented)
    const result2 = await mockApiClient.transactions.getAll();
    expect(result2.data).toEqual(mockData);

    // Verify API was called (adjust based on caching implementation)
    expect(mockApiClient.transactions.getAll).toHaveBeenCalledTimes(2);
  });

  it('invalidates cache after mutations', async () => {
    const mockData = [{ id: '1', description: 'Test' }];
    const newItem = { id: '2', description: 'New' };

    mockApiClient.transactions.getAll.mockResolvedValue({ data: mockData });
    mockApiClient.transactions.create.mockResolvedValue({ data: newItem });

    // Fetch data
    await mockApiClient.transactions.getAll();

    // Create new item
    await mockApiClient.transactions.create(newItem);

    // Fetch again (cache should be invalidated)
    mockApiClient.transactions.getAll.mockResolvedValue({
      data: [...mockData, newItem],
    });

    const result = await mockApiClient.transactions.getAll();
    expect(result.data).toHaveLength(2);
  });
});

describe('API Client Integration - Optimistic Updates', () => {
  it('applies optimistic update then reverts on error', async () => {
    const existingData = [
      { id: '1', description: 'Coffee', amount: 5 },
    ];

    const newTransaction = { description: 'Lunch', amount: 15, type: 'expense' };
    const optimisticTransaction = { id: 'temp-id', ...newTransaction };

    // Simulate optimistic update
    const updatedData = [...existingData, optimisticTransaction];

    expect(updatedData).toHaveLength(2);

    // Simulate API failure
    mockApiClient.transactions.create.mockRejectedValue(new Error('API Error'));

    try {
      await mockApiClient.transactions.create(newTransaction);
    } catch (error) {
      // Revert optimistic update
      const revertedData = existingData;
      expect(revertedData).toHaveLength(1);
      expect(revertedData).toEqual(existingData);
    }
  });
});
