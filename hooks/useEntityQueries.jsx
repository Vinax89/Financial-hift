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
import { Transaction, Shift, Budget, DebtAccount, Goal, Bill, ShiftRule, Investment } from '@/api/entities';
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
  INVESTMENTS: 'investments',
};

/**
 * Standardized cache configuration for React Query
 * - staleTime: How long data is considered fresh (no refetch needed)
 * - gcTime: How long unused data stays in cache before garbage collection
 */
export const CACHE_CONFIG = {
  // Financial data - Refresh frequently (user-driven data)
  FINANCIAL: {
    staleTime: 5 * 60 * 1000,   // 5 minutes
    gcTime: 10 * 60 * 1000,      // 10 minutes
  },
  // Settings/Config - Less frequent changes
  SETTINGS: {
    staleTime: 15 * 60 * 1000,   // 15 minutes
    gcTime: 30 * 60 * 1000,      // 30 minutes
  },
  // Rarely changing data (shift rules, etc.)
  STATIC: {
    staleTime: 30 * 60 * 1000,   // 30 minutes
    gcTime: 60 * 60 * 1000,      // 1 hour
  },
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
// SHIFT RULE HOOKS
// ============================================================================

export const useShiftRules = () => {
  return useQuery({
    queryKey: [QueryKeys.SHIFT_RULES],
    queryFn: () => ShiftRule.list('-updated_date'),
    staleTime: CACHE_CONFIG.STATIC.staleTime,
    gcTime: CACHE_CONFIG.STATIC.gcTime,
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

// ============================================================================
// BUDGET HOOKS
// ============================================================================

/**
 * Fetch all budgets with caching
 */
export const useBudgets = (sortBy = '-created_date', limit = 100) => {
  return useQuery({
    queryKey: [QueryKeys.BUDGETS, sortBy, limit],
    queryFn: () => Budget.list(sortBy, limit),
    staleTime: CACHE_CONFIG.FINANCIAL.staleTime,
    gcTime: CACHE_CONFIG.FINANCIAL.gcTime,
  });
};

/**
 * Fetch single budget
 */
export const useBudget = (id) => {
  return useQuery({
    queryKey: [QueryKeys.BUDGETS, id],
    queryFn: () => Budget.get(id),
    enabled: !!id,
  });
};

/**
 * Create budget with optimistic update
 */
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Budget.create(data),
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BUDGETS] });
      const previousBudgets = queryClient.getQueryData([QueryKeys.BUDGETS]);
      
      queryClient.setQueryData([QueryKeys.BUDGETS], (old) => {
        return old ? [...old, { ...newBudget, id: 'temp-' + Date.now() }] : [newBudget];
      });
      
      return { previousBudgets };
    },
    onError: (err, newBudget, context) => {
      queryClient.setQueryData([QueryKeys.BUDGETS], context.previousBudgets);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

/**
 * Update budget with optimistic update
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Budget.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BUDGETS] });
      const previousBudgets = queryClient.getQueryData([QueryKeys.BUDGETS]);
      
      queryClient.setQueryData([QueryKeys.BUDGETS], (old) => {
        return old?.map((b) => (b.id === id ? { ...b, ...data } : b));
      });
      
      return { previousBudgets };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.BUDGETS], context.previousBudgets);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

/**
 * Delete budget with optimistic update
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Budget.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BUDGETS] });
      const previousBudgets = queryClient.getQueryData([QueryKeys.BUDGETS]);
      
      queryClient.setQueryData([QueryKeys.BUDGETS], (old) => {
        return old?.filter((b) => b.id !== id);
      });
      
      return { previousBudgets };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.BUDGETS], context.previousBudgets);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

// ============================================================================
// DEBT HOOKS
// ============================================================================

/**
 * Fetch all debts with caching
 */
export const useDebts = (sortBy = '-created_date', limit = 100) => {
  return useQuery({
    queryKey: [QueryKeys.DEBTS, sortBy, limit],
    queryFn: () => DebtAccount.list(sortBy, limit),
    staleTime: CACHE_CONFIG.FINANCIAL.staleTime,
    gcTime: CACHE_CONFIG.FINANCIAL.gcTime,
  });
};

/**
 * Fetch single debt
 */
export const useDebt = (id) => {
  return useQuery({
    queryKey: [QueryKeys.DEBTS, id],
    queryFn: () => DebtAccount.get(id),
    enabled: !!id,
  });
};

/**
 * Create debt with optimistic update
 */
export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => DebtAccount.create(data),
    onMutate: async (newDebt) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.DEBTS] });
      const previousDebts = queryClient.getQueryData([QueryKeys.DEBTS]);
      
      queryClient.setQueryData([QueryKeys.DEBTS], (old) => {
        return old ? [...old, { ...newDebt, id: 'temp-' + Date.now() }] : [newDebt];
      });
      
      return { previousDebts };
    },
    onError: (err, newDebt, context) => {
      queryClient.setQueryData([QueryKeys.DEBTS], context.previousDebts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

/**
 * Update debt with optimistic update
 */
export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => DebtAccount.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.DEBTS] });
      const previousDebts = queryClient.getQueryData([QueryKeys.DEBTS]);
      
      queryClient.setQueryData([QueryKeys.DEBTS], (old) => {
        return old?.map((d) => (d.id === id ? { ...d, ...data } : d));
      });
      
      return { previousDebts };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.DEBTS], context.previousDebts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

/**
 * Delete debt with optimistic update
 */
export const useDeleteDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => DebtAccount.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.DEBTS] });
      const previousDebts = queryClient.getQueryData([QueryKeys.DEBTS]);
      
      queryClient.setQueryData([QueryKeys.DEBTS], (old) => {
        return old?.filter((d) => d.id !== id);
      });
      
      return { previousDebts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.DEBTS], context.previousDebts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

// ============================================================================
// GOAL HOOKS
// ============================================================================

/**
 * Fetch all goals with caching
 */
export const useGoals = (sortBy = '-created_date', limit = 100) => {
  return useQuery({
    queryKey: [QueryKeys.GOALS, sortBy, limit],
    queryFn: () => Goal.list(sortBy, limit),
    staleTime: CACHE_CONFIG.FINANCIAL.staleTime,
    gcTime: CACHE_CONFIG.FINANCIAL.gcTime,
  });
};

/**
 * Fetch single goal
 */
export const useGoal = (id) => {
  return useQuery({
    queryKey: [QueryKeys.GOALS, id],
    queryFn: () => Goal.get(id),
    enabled: !!id,
  });
};

/**
 * Create goal with optimistic update
 */
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Goal.create(data),
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.GOALS] });
      const previousGoals = queryClient.getQueryData([QueryKeys.GOALS]);
      
      queryClient.setQueryData([QueryKeys.GOALS], (old) => {
        return old ? [...old, { ...newGoal, id: 'temp-' + Date.now() }] : [newGoal];
      });
      
      return { previousGoals };
    },
    onError: (err, newGoal, context) => {
      queryClient.setQueryData([QueryKeys.GOALS], context.previousGoals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

/**
 * Update goal with optimistic update
 */
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Goal.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.GOALS] });
      const previousGoals = queryClient.getQueryData([QueryKeys.GOALS]);
      
      queryClient.setQueryData([QueryKeys.GOALS], (old) => {
        return old?.map((g) => (g.id === id ? { ...g, ...data } : g));
      });
      
      return { previousGoals };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.GOALS], context.previousGoals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

/**
 * Delete goal with optimistic update
 */
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Goal.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.GOALS] });
      const previousGoals = queryClient.getQueryData([QueryKeys.GOALS]);
      
      queryClient.setQueryData([QueryKeys.GOALS], (old) => {
        return old?.filter((g) => g.id !== id);
      });
      
      return { previousGoals };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.GOALS], context.previousGoals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

// ============================================================================
// BILL HOOKS
// ============================================================================

/**
 * Fetch all bills with caching
 */
export const useBills = (sortBy = '-due_date', limit = 100) => {
  return useQuery({
    queryKey: [QueryKeys.BILLS, sortBy, limit],
    queryFn: () => Bill.list(sortBy, limit),
    staleTime: CACHE_CONFIG.FINANCIAL.staleTime,
    gcTime: CACHE_CONFIG.FINANCIAL.gcTime,
  });
};

/**
 * Fetch single bill
 */
export const useBill = (id) => {
  return useQuery({
    queryKey: [QueryKeys.BILLS, id],
    queryFn: () => Bill.get(id),
    enabled: !!id,
  });
};

/**
 * Create bill with optimistic update
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Bill.create(data),
    onMutate: async (newBill) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BILLS] });
      const previousBills = queryClient.getQueryData([QueryKeys.BILLS]);
      
      queryClient.setQueryData([QueryKeys.BILLS], (old) => {
        return old ? [...old, { ...newBill, id: 'temp-' + Date.now() }] : [newBill];
      });
      
      return { previousBills };
    },
    onError: (err, newBill, context) => {
      queryClient.setQueryData([QueryKeys.BILLS], context.previousBills);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

/**
 * Update bill with optimistic update
 */
export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Bill.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BILLS] });
      const previousBills = queryClient.getQueryData([QueryKeys.BILLS]);
      
      queryClient.setQueryData([QueryKeys.BILLS], (old) => {
        return old?.map((b) => (b.id === id ? { ...b, ...data } : b));
      });
      
      return { previousBills };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.BILLS], context.previousBills);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

/**
 * Delete bill with optimistic update
 */
export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Bill.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.BILLS] });
      const previousBills = queryClient.getQueryData([QueryKeys.BILLS]);
      
      queryClient.setQueryData([QueryKeys.BILLS], (old) => {
        return old?.filter((b) => b.id !== id);
      });
      
      return { previousBills };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.BILLS], context.previousBills);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

// ============================================================================
// INVESTMENT HOOKS
// ============================================================================

/**
 * Fetch all investments with caching
 */
export const useInvestments = (sortBy = '-created_date', limit = 100) => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, sortBy, limit],
    queryFn: () => Investment.list(sortBy, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * Fetch single investment
 */
export const useInvestment = (id) => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, id],
    queryFn: () => Investment.get(id),
    enabled: !!id,
  });
};

/**
 * Create investment with optimistic update
 */
export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => Investment.create(data),
    onMutate: async (newInvestment) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.INVESTMENTS] });
      const previousInvestments = queryClient.getQueryData([QueryKeys.INVESTMENTS]);
      
      queryClient.setQueryData([QueryKeys.INVESTMENTS], (old) => {
        return old ? [...old, { ...newInvestment, id: 'temp-' + Date.now() }] : [newInvestment];
      });
      
      return { previousInvestments };
    },
    onError: (err, newInvestment, context) => {
      queryClient.setQueryData([QueryKeys.INVESTMENTS], context.previousInvestments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

/**
 * Update investment with optimistic update
 */
export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => Investment.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.INVESTMENTS] });
      const previousInvestments = queryClient.getQueryData([QueryKeys.INVESTMENTS]);
      
      queryClient.setQueryData([QueryKeys.INVESTMENTS], (old) => {
        return old?.map((i) => (i.id === id ? { ...i, ...data } : i));
      });
      
      return { previousInvestments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([QueryKeys.INVESTMENTS], context.previousInvestments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

/**
 * Delete investment with optimistic update
 */
export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => Investment.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.INVESTMENTS] });
      const previousInvestments = queryClient.getQueryData([QueryKeys.INVESTMENTS]);
      
      queryClient.setQueryData([QueryKeys.INVESTMENTS], (old) => {
        return old?.filter((i) => i.id !== id);
      });
      
      return { previousInvestments };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([QueryKeys.INVESTMENTS], context.previousInvestments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Invalidate all caches
 */
export const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
};
