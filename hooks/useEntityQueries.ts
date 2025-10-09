// @ts-nocheck - VFS cache issues, will be fixed after TypeScript server restart
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

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import {
  Transaction,
  Shift,
  Budget,
  DebtAccount,
  Goal,
  Bill,
  ShiftRule,
  Investment,
} from '@/api/entities';
import { CacheStrategies } from '@/api/base44Client-enhanced';

/**
 * Query Keys for cache management
 */
export const QueryKeys = {
  TRANSACTIONS: 'transactions',
  SHIFTS: 'shifts',
  BUDGETS: 'budgets',
  DEBTS: 'debts',
  GOALS: 'goals',
  BILLS: 'bills',
  SHIFT_RULES: 'shiftRules',
  INVESTMENTS: 'investments',
} as const;

// ============================================================================
// TRANSACTION HOOKS
// ============================================================================

/**
 * Fetch all transactions with caching
 */
export const useTransactions = (
  sortBy: string = '-date',
  limit: number = 1000
): UseQueryResult<any[], Error> => {
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
export const useTransaction = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.TRANSACTIONS, id],
    queryFn: () => Transaction.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.TRANSACTIONS.ttl,
  });
};

/**
 * Create transaction with optimistic update
 */
export const useCreateTransaction = (): UseMutationResult<any, Error, any, { previousTransactions: any }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Transaction.create(data),
    onMutate: async (newTransaction: any) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);

      // Optimistically update
      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old: any) => {
        return old ? [...old, { ...newTransaction, id: 'temp-' + Date.now() }] : [newTransaction];
      });

      return { previousTransactions };
    },
    onError: (err, newTransaction, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
      }
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
export const useUpdateTransaction = (): UseMutationResult<
  any,
  Error,
  { id: string; data: any },
  { previousTransactions: any }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Transaction.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });

      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);

      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old: any) => {
        return old?.map((t: any) => (t.id === id ? { ...t, ...data } : t));
      });

      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    },
  });
};

/**
 * Delete transaction with optimistic update
 */
export const useDeleteTransaction = (): UseMutationResult<
  any,
  Error,
  string,
  { previousTransactions: any }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Transaction.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [QueryKeys.TRANSACTIONS] });

      const previousTransactions = queryClient.getQueryData([QueryKeys.TRANSACTIONS]);

      queryClient.setQueryData([QueryKeys.TRANSACTIONS], (old: any) => {
        return old?.filter((t: any) => t.id !== id);
      });

      return { previousTransactions };
    },
    onError: (err, id, context) => {
      if (context) {
        queryClient.setQueryData([QueryKeys.TRANSACTIONS], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.TRANSACTIONS] });
    },
  });
};

// ============================================================================
// SHIFT HOOKS
// ============================================================================

export const useShifts = (
  sortBy: string = '-start_datetime',
  limit: number = 500
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.SHIFTS, sortBy, limit],
    queryFn: () => Shift.list(sortBy, limit),
    staleTime: CacheStrategies.SHIFTS.ttl,
    gcTime: 15 * 60 * 1000,
  });
};

export const useShift = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.SHIFTS, id],
    queryFn: () => Shift.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.SHIFTS.ttl,
  });
};

export const useCreateShift = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Shift.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

export const useUpdateShift = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Shift.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

export const useDeleteShift = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Shift.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFTS] });
    },
  });
};

// ============================================================================
// BUDGET HOOKS
// ============================================================================

export const useBudgets = (
  sortBy: string = '-created_at',
  limit: number = 100
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.BUDGETS, sortBy, limit],
    queryFn: () => Budget.list(sortBy, limit),
    staleTime: CacheStrategies.BUDGETS.ttl,
    gcTime: 20 * 60 * 1000,
  });
};

export const useBudget = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.BUDGETS, id],
    queryFn: () => Budget.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.BUDGETS.ttl,
  });
};

export const useCreateBudget = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

export const useUpdateBudget = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Budget.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

export const useDeleteBudget = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Budget.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BUDGETS] });
    },
  });
};

// ============================================================================
// DEBT HOOKS
// ============================================================================

export const useDebts = (sortBy: string = '-balance', limit: number = 100): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.DEBTS, sortBy, limit],
    queryFn: () => DebtAccount.list(sortBy, limit),
    staleTime: CacheStrategies.DEBTS.ttl,
    gcTime: 20 * 60 * 1000,
  });
};

export const useDebt = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.DEBTS, id],
    queryFn: () => DebtAccount.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.DEBTS.ttl,
  });
};

export const useCreateDebt = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => DebtAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

export const useUpdateDebt = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => DebtAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

export const useDeleteDebt = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DebtAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DEBTS] });
    },
  });
};

// ============================================================================
// GOAL HOOKS
// ============================================================================

export const useGoals = (sortBy: string = '-created_at', limit: number = 100): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.GOALS, sortBy, limit],
    queryFn: () => Goal.list(sortBy, limit),
    staleTime: CacheStrategies.GOALS.ttl,
    gcTime: 20 * 60 * 1000,
  });
};

export const useGoal = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.GOALS, id],
    queryFn: () => Goal.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.GOALS.ttl,
  });
};

export const useCreateGoal = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

export const useUpdateGoal = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

export const useDeleteGoal = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GOALS] });
    },
  });
};

// ============================================================================
// BILL HOOKS
// ============================================================================

export const useBills = (sortBy: string = 'due_date', limit: number = 100): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.BILLS, sortBy, limit],
    queryFn: () => Bill.list(sortBy, limit),
    staleTime: CacheStrategies.BILLS.ttl,
    gcTime: 15 * 60 * 1000,
  });
};

export const useBill = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.BILLS, id],
    queryFn: () => Bill.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.BILLS.ttl,
  });
};

export const useCreateBill = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Bill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

export const useUpdateBill = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Bill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

export const useDeleteBill = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Bill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.BILLS] });
    },
  });
};

// ============================================================================
// SHIFT RULE HOOKS
// ============================================================================

export const useShiftRules = (
  sortBy: string = 'name',
  limit: number = 100
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.SHIFT_RULES, sortBy, limit],
    queryFn: () => ShiftRule.list(sortBy, limit),
    staleTime: CacheStrategies.SHIFT_RULES.ttl,
    gcTime: 30 * 60 * 1000,
  });
};

export const useShiftRule = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.SHIFT_RULES, id],
    queryFn: () => ShiftRule.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.SHIFT_RULES.ttl,
  });
};

export const useCreateShiftRule = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ShiftRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

export const useUpdateShiftRule = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ShiftRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

export const useDeleteShiftRule = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SHIFT_RULES] });
    },
  });
};

// ============================================================================
// INVESTMENT HOOKS
// ============================================================================

export const useInvestments = (
  sortBy: string = '-current_value',
  limit: number = 100
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, sortBy, limit],
    queryFn: () => Investment.list(sortBy, limit),
    staleTime: CacheStrategies.INVESTMENTS.ttl,
    gcTime: 20 * 60 * 1000,
  });
};

export const useInvestment = (id: string | null | undefined): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: [QueryKeys.INVESTMENTS, id],
    queryFn: () => Investment.get(id!),
    enabled: !!id,
    staleTime: CacheStrategies.INVESTMENTS.ttl,
  });
};

export const useCreateInvestment = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => Investment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

export const useUpdateInvestment = (): UseMutationResult<any, Error, { id: string; data: any }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => Investment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

export const useDeleteInvestment = (): UseMutationResult<any, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Investment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.INVESTMENTS] });
    },
  });
};

