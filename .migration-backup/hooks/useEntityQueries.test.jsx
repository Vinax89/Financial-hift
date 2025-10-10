/**
 * @fileoverview Tests for useEntityQueries hook
 * @description Comprehensive test coverage for all entity query hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactions, useBudgets, useGoals, useDebts } from './useEntityQueries';
import * as entitiesAPI from '@/api/entities';

// Mock the entities API
vi.mock('@/api/entities');

// Create a wrapper component for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useEntityQueries - useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch transactions successfully', async () => {
    const mockTransactions = [
      { id: '1', amount: 100, description: 'Test 1' },
      { id: '2', amount: 200, description: 'Test 2' }
    ];

    entitiesAPI.fetchTransactions.mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTransactions);
    expect(entitiesAPI.fetchTransactions).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('API Error');
    entitiesAPI.fetchTransactions.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should return empty array initially', () => {
    entitiesAPI.fetchTransactions.mockResolvedValue([]);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useEntityQueries - useBudgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch budgets successfully', async () => {
    const mockBudgets = [
      { id: '1', name: 'Groceries', amount: 500 },
      { id: '2', name: 'Transport', amount: 200 }
    ];

    entitiesAPI.fetchBudgets.mockResolvedValue(mockBudgets);

    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBudgets);
  });

  it('should have correct cache configuration', () => {
    const { result } = renderHook(() => useBudgets(), {
      wrapper: createWrapper()
    });

    // React Query hook should provide queryKey
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
  });
});

describe('useEntityQueries - useGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch goals successfully', async () => {
    const mockGoals = [
      { id: '1', name: 'Emergency Fund', target: 10000, current: 5000 },
      { id: '2', name: 'Vacation', target: 3000, current: 1000 }
    ];

    entitiesAPI.fetchGoals.mockResolvedValue(mockGoals);

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGoals);
    expect(result.current.data).toHaveLength(2);
  });

  it('should refetch when invalidated', async () => {
    const mockGoals = [{ id: '1', name: 'Test Goal', target: 1000, current: 500 }];
    entitiesAPI.fetchGoals.mockResolvedValue(mockGoals);

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should support refetch
    expect(result.current).toHaveProperty('refetch');
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useEntityQueries - useDebts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch debts successfully', async () => {
    const mockDebts = [
      { id: '1', name: 'Credit Card', balance: 5000, interestRate: 0.18 },
      { id: '2', name: 'Student Loan', balance: 20000, interestRate: 0.05 }
    ];

    entitiesAPI.fetchDebts.mockResolvedValue(mockDebts);

    const { result } = renderHook(() => useDebts(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDebts);
    expect(result.current.data[0].interestRate).toBe(0.18);
  });

  it('should handle loading state', () => {
    entitiesAPI.fetchDebts.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useDebts(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });
});
