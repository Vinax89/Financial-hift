/**
 * @fileoverview Optimized hook for Dashboard data fetching
 * @description Implements staggered loading and query deduplication for better performance
 */

import { UseQueryResult } from '@tanstack/react-query';
import {
  useTransactions,
  useShifts,
  useGoals,
  useDebts,
  useBudgets,
  useBills,
  useInvestments,
} from '@/hooks/useEntityQueries';
import type {
  Transaction,
  Shift,
  Goal,
  DebtAccount,
  Budget,
  Bill,
  Investment,
} from '@/api/optimizedEntities';

/**
 * Dashboard data return type with staggered loading
 */
export interface DashboardData {
  // Entity data
  transactions: Transaction[];
  shifts: Shift[];
  goals: Goal[];
  debts: DebtAccount[];
  budgets: Budget[];
  bills: Bill[];
  investments: Investment[];

  // Loading states
  isLoadingCritical: boolean;
  isLoadingSecondary: boolean;
  isLoading: boolean;

  // Error states
  errors: {
    transactions?: string;
    shifts?: string;
    goals?: string;
    debts?: string;
    budgets?: string;
    bills?: string;
    investments?: string;
  };
  hasErrors: boolean;

  // Refetch functions
  refetch: {
    transactions: () => void;
    shifts: () => void;
    goals: () => void;
    debts: () => void;
    budgets: () => void;
    bills: () => void;
    investments: () => void;
    all: () => void;
  };
}

/**
 * Parallel loading dashboard data return type
 */
export interface DashboardDataParallel {
  // Entity data
  transactions: Transaction[];
  shifts: Shift[];
  goals: Goal[];
  debts: DebtAccount[];
  budgets: Budget[];
  bills: Bill[];
  investments: Investment[];

  // Loading states
  loading: boolean;
  dataLoaded: boolean;

  // Error states
  errors: {
    transactions?: string;
    shifts?: string;
    goals?: string;
    debts?: string;
    budgets?: string;
    bills?: string;
    investments?: string;
  };
  hasErrors: boolean;

  // Refetch functions
  refetch: {
    transactions: () => void;
    shifts: () => void;
    goals: () => void;
    debts: () => void;
    budgets: () => void;
    bills: () => void;
    investments: () => void;
    all: () => void;
  };
}

/**
 * Optimized Dashboard data hook with staggered loading
 * Loads critical data (transactions, shifts) first, then secondary data
 * This improves perceived performance for users
 * @returns Dashboard data with loading states
 */
export function useDashboardData(): DashboardData {
  // Load critical data first (transactions, shifts)
  const transactionsQuery = useTransactions();
  const shiftsQuery = useShifts();

  // Load secondary data (only if critical data loaded)
  const shouldLoadSecondary = !transactionsQuery.isLoading && !shiftsQuery.isLoading;

  const goalsQuery = useGoals({ enabled: shouldLoadSecondary } as any);
  const debtsQuery = useDebts({ enabled: shouldLoadSecondary } as any);
  const budgetsQuery = useBudgets({ enabled: shouldLoadSecondary } as any);
  const billsQuery = useBills({ enabled: shouldLoadSecondary } as any);
  const investmentsQuery = useInvestments({ enabled: shouldLoadSecondary } as any);

  // Aggregate data
  return {
    transactions: transactionsQuery.data || [],
    shifts: shiftsQuery.data || [],
    goals: goalsQuery.data || [],
    debts: debtsQuery.data || [],
    budgets: budgetsQuery.data || [],
    bills: billsQuery.data || [],
    investments: investmentsQuery.data || [],

    // Loading states
    isLoadingCritical: transactionsQuery.isLoading || shiftsQuery.isLoading,
    isLoadingSecondary:
      goalsQuery.isLoading ||
      debtsQuery.isLoading ||
      budgetsQuery.isLoading ||
      billsQuery.isLoading ||
      investmentsQuery.isLoading,
    isLoading:
      transactionsQuery.isLoading ||
      shiftsQuery.isLoading ||
      goalsQuery.isLoading ||
      debtsQuery.isLoading ||
      budgetsQuery.isLoading ||
      billsQuery.isLoading ||
      investmentsQuery.isLoading,

    // Error states
    errors: {
      ...(transactionsQuery.error && { transactions: (transactionsQuery.error as Error).message }),
      ...(shiftsQuery.error && { shifts: (shiftsQuery.error as Error).message }),
      ...(goalsQuery.error && { goals: (goalsQuery.error as Error).message }),
      ...(debtsQuery.error && { debts: (debtsQuery.error as Error).message }),
      ...(budgetsQuery.error && { budgets: (budgetsQuery.error as Error).message }),
      ...(billsQuery.error && { bills: (billsQuery.error as Error).message }),
      ...(investmentsQuery.error && { investments: (investmentsQuery.error as Error).message }),
    },
    hasErrors: !!(
      transactionsQuery.error ||
      shiftsQuery.error ||
      goalsQuery.error ||
      debtsQuery.error ||
      budgetsQuery.error ||
      billsQuery.error ||
      investmentsQuery.error
    ),

    // Refetch functions
    refetch: {
      transactions: transactionsQuery.refetch,
      shifts: shiftsQuery.refetch,
      goals: goalsQuery.refetch,
      debts: debtsQuery.refetch,
      budgets: budgetsQuery.refetch,
      bills: billsQuery.refetch,
      investments: investmentsQuery.refetch,
      all: () => {
        transactionsQuery.refetch();
        shiftsQuery.refetch();
        goalsQuery.refetch();
        debtsQuery.refetch();
        budgetsQuery.refetch();
        billsQuery.refetch();
        investmentsQuery.refetch();
      },
    },
  };
}

/**
 * Simple parallel loading (original behavior, but optimized)
 * Loads all data simultaneously - better for fast networks
 * @returns Dashboard data with loading states
 */
export function useDashboardDataParallel(): DashboardDataParallel {
  const transactionsQuery = useTransactions();
  const shiftsQuery = useShifts();
  const goalsQuery = useGoals();
  const debtsQuery = useDebts();
  const budgetsQuery = useBudgets();
  const billsQuery = useBills();
  const investmentsQuery = useInvestments();

  return {
    transactions: transactionsQuery.data || [],
    shifts: shiftsQuery.data || [],
    goals: goalsQuery.data || [],
    debts: debtsQuery.data || [],
    budgets: budgetsQuery.data || [],
    bills: billsQuery.data || [],
    investments: investmentsQuery.data || [],

    loading:
      transactionsQuery.isLoading ||
      shiftsQuery.isLoading ||
      goalsQuery.isLoading ||
      debtsQuery.isLoading ||
      budgetsQuery.isLoading ||
      billsQuery.isLoading ||
      investmentsQuery.isLoading,

    dataLoaded:
      !transactionsQuery.isLoading &&
      !shiftsQuery.isLoading &&
      !goalsQuery.isLoading &&
      !debtsQuery.isLoading &&
      !budgetsQuery.isLoading &&
      !billsQuery.isLoading &&
      !investmentsQuery.isLoading,

    errors: {
      ...(transactionsQuery.error && { transactions: (transactionsQuery.error as Error).message }),
      ...(shiftsQuery.error && { shifts: (shiftsQuery.error as Error).message }),
      ...(goalsQuery.error && { goals: (goalsQuery.error as Error).message }),
      ...(debtsQuery.error && { debts: (debtsQuery.error as Error).message }),
      ...(budgetsQuery.error && { budgets: (budgetsQuery.error as Error).message }),
      ...(billsQuery.error && { bills: (billsQuery.error as Error).message }),
      ...(investmentsQuery.error && { investments: (investmentsQuery.error as Error).message }),
    },
    hasErrors: !!(
      transactionsQuery.error ||
      shiftsQuery.error ||
      goalsQuery.error ||
      debtsQuery.error ||
      budgetsQuery.error ||
      billsQuery.error ||
      investmentsQuery.error
    ),

    refetch: {
      transactions: transactionsQuery.refetch,
      shifts: shiftsQuery.refetch,
      goals: goalsQuery.refetch,
      debts: debtsQuery.refetch,
      budgets: budgetsQuery.refetch,
      bills: billsQuery.refetch,
      investments: investmentsQuery.refetch,
      all: () => {
        transactionsQuery.refetch();
        shiftsQuery.refetch();
        goalsQuery.refetch();
        debtsQuery.refetch();
        budgetsQuery.refetch();
        billsQuery.refetch();
        investmentsQuery.refetch();
      },
    },
  };
}
