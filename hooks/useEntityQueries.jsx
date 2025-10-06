/**
 * React Query Hooks for Financial-hift Entities
 * 
 * Provides optimized data fetching with:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, Shift, Budget, Debt, Goal, Bill, ShiftRule } from '@/api/entities';
import { CacheStrategies } from '@/api/base44Client-enhanced';

// Query Keys
export const QueryKeys = {
  TRANSACTIONS: 'transactions',
  SHIFTS: 'shifts',
  BUDGETS: 'budgets',
  DEBTS: 'debts',
  GOALS: 'goals',
  BILLS: 'bills',
  SHIFT_RULES: 'shiftRules',
};

// ============================================================================
// TRANSACTION HOOKS
// ============================================================================

/**
 * Fetch all transactions with caching
 */
export const useTransactions = (sortBy = '-date', limit = 1000) => {
  return useQuery({
    queryKey: [QueryKeys.TRANSACTIONS, sortBy, limit],
    queryFn: () => Transaction.list(sortBy, limit),
    staleTime: CacheStrategies.TRANSACTIONS.ttl,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes after unused
  });
};

/**
 * Fetch single transaction
 */
export const useTransaction = (id) => {
  return useQuery({
    queryKey: [QueryKeys.TRANSACTIONS, id],
    queryFn: () => Transaction.get(id),
    enabled: !!id,
    staleTime: CacheStrategies.TRANSACTIONS.ttl,
  });
};

/**
 * Create transaction with optimistic update
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Transaction.create(data),
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);
      
      // Optimistically update
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old) => {
        return old ? [...old, { ...newTransaction, id: 'temp-' + Date.now() }] : [newTransaction];
      });
      
      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      // Rollback on error
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    },
  });
};

/**
 * Update transaction with optimistic update
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Transaction.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
      
      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);
      
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old) => {
        return old?.map((t) => (t.id === id ? { ...t, ...data } : t));
      });
      
      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    },
  });
};

/**
 * Delete transaction with optimistic update
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Transaction.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
      
      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);
      
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old) => {
        return old?.filter((t) => t.id !== id);
      });
      
      return { previousTransactions };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    },
  });
};

// ============================================================================
// SHIFT HOOKS
// ============================================================================

export const useShifts = (sortBy = '-start_datetime', limit = 500) => {
  return useQuery({
    queryKey: [QueryKeys.SHIFTS, sortBy, limit],
    queryFn: () => Shift.list(sortBy, limit),
    staleTime: CacheStrategies.SHIFTS.ttl,
    gcTime: 15 * 60 * 1000,
  });
};

export const useShift = (id) => {
  return useQuery({
    queryKey: [QueryKeys.SHIFTS, id],
    queryFn: () => Shift.get(id),
    enabled: !!id,
    staleTime: CacheStrategies.SHIFTS.ttl,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Shift.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Shift.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Shift.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

// ============================================================================
// BUDGET HOOKS
// ============================================================================

export const useBudgets = () => {
  return useQuery({
    queryKey: [QueryKeys.BUDGETS],
    queryFn: () => Budget.list('-created_date', 100),
    staleTime: CacheStrategies.SETTINGS.ttl,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Budget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

// ============================================================================
// DEBT HOOKS
// ============================================================================

export const useDebts = () => {
  return useQuery({
    queryKey: [QueryKeys.DEBTS],
    queryFn: () => Debt.list('-created_date', 100),
    staleTime: CacheStrategies.SETTINGS.ttl,
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Debt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Debt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Debt.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

// ============================================================================
// GOAL HOOKS
// ============================================================================

export const useGoals = () => {
  return useQuery({
    queryKey: [QueryKeys.GOALS],
    queryFn: () => Goal.list('-created_date', 100),
    staleTime: CacheStrategies.SETTINGS.ttl,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

// ============================================================================
// BILL HOOKS
// ============================================================================

export const useBills = () => {
  return useQuery({
    queryKey: [QueryKeys.BILLS],
    queryFn: () => Bill.list('-created_date', 100),
    staleTime: CacheStrategies.SETTINGS.ttl,
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Bill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Bill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Bill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

// ============================================================================
// SHIFT RULE HOOKS
// ============================================================================

export const useShiftRules = () => {
  return useQuery({
    queryKey: [QueryKeys.SHIFT_RULES],
    queryFn: () => ShiftRule.list('-updated_date'),
    staleTime: CacheStrategies.SHIFT_RULES.ttl,
    gcTime: 60 * 60 * 1000, // Keep for 1 hour
  });
};

export const useCreateShiftRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ShiftRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

export const useUpdateShiftRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => ShiftRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

export const useDeleteShiftRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ShiftRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Prefetch data for better UX
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchTransactions: () => {
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.TRANSACTIONS],
        queryFn: () => Transaction.list('-date', 1000),
      });
    },
    prefetchShifts: () => {
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.SHIFTS],
        queryFn: () => Shift.list('-start_datetime', 500),
      });
    },
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.TRANSACTIONS],
        queryFn: () => Transaction.list('-date', 1000),
      });
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.SHIFTS],
        queryFn: () => Shift.list('-start_datetime', 500),
      });
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.BUDGETS],
        queryFn: () => Budget.list('-created_date', 100),
      });
    },
  };
};

/**
 * Invalidate all caches
 */
export const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
};
