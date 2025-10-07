/**
 * @fileoverview Optimized hook for Dashboard data fetching
 * @description Implements staggered loading and query deduplication for better performance
 */

import { useQueries } from '@tanstack/react-query';
import { 
  useTransactions, 
  useShifts, 
  useGoals, 
  useDebts, 
  useBudgets, 
  useBills, 
  useInvestments 
} from '@/hooks/useEntityQueries.jsx';

/**
 * Optimized Dashboard data hook with staggered loading
 * @returns {Object} Dashboard data with loading states
 */
export function useDashboardData() {
  // Load critical data first (transactions, shifts)
  const transactionsQuery = useTransactions();
  const shiftsQuery = useShifts();

  // Load secondary data (only if critical data loaded)
  const shouldLoadSecondary = !transactionsQuery.isLoading && !shiftsQuery.isLoading;
  
  const goalsQuery = useGoals({ enabled: shouldLoadSecondary });
  const debtsQuery = useDebts({ enabled: shouldLoadSecondary });
  const budgetsQuery = useBudgets({ enabled: shouldLoadSecondary });
  const billsQuery = useBills({ enabled: shouldLoadSecondary });
  const investmentsQuery = useInvestments({ enabled: shouldLoadSecondary });

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
    isLoadingSecondary: goalsQuery.isLoading || debtsQuery.isLoading || 
                        budgetsQuery.isLoading || billsQuery.isLoading || 
                        investmentsQuery.isLoading,
    isLoading: transactionsQuery.isLoading || shiftsQuery.isLoading || 
               goalsQuery.isLoading || debtsQuery.isLoading || 
               budgetsQuery.isLoading || billsQuery.isLoading || 
               investmentsQuery.isLoading,
    
    // Error states
    errors: {
      ...(transactionsQuery.error && { transactions: transactionsQuery.error.message }),
      ...(shiftsQuery.error && { shifts: shiftsQuery.error.message }),
      ...(goalsQuery.error && { goals: goalsQuery.error.message }),
      ...(debtsQuery.error && { debts: debtsQuery.error.message }),
      ...(budgetsQuery.error && { budgets: budgetsQuery.error.message }),
      ...(billsQuery.error && { bills: billsQuery.error.message }),
      ...(investmentsQuery.error && { investments: investmentsQuery.error.message }),
    },
    hasErrors: !!(transactionsQuery.error || shiftsQuery.error || goalsQuery.error || 
                  debtsQuery.error || budgetsQuery.error || billsQuery.error || 
                  investmentsQuery.error),
    
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
      }
    }
  };
}

/**
 * Simple parallel loading (original behavior, but optimized)
 * @returns {Object} Dashboard data with loading states
 */
export function useDashboardDataParallel() {
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
    
    loading: transactionsQuery.isLoading || shiftsQuery.isLoading || 
             goalsQuery.isLoading || debtsQuery.isLoading || 
             budgetsQuery.isLoading || billsQuery.isLoading || 
             investmentsQuery.isLoading,
    
    dataLoaded: !transactionsQuery.isLoading && !shiftsQuery.isLoading && 
                !goalsQuery.isLoading && !debtsQuery.isLoading && 
                !budgetsQuery.isLoading && !billsQuery.isLoading && 
                !investmentsQuery.isLoading,
    
    errors: {
      ...(transactionsQuery.error && { transactions: transactionsQuery.error.message }),
      ...(shiftsQuery.error && { shifts: shiftsQuery.error.message }),
      ...(goalsQuery.error && { goals: goalsQuery.error.message }),
      ...(debtsQuery.error && { debts: debtsQuery.error.message }),
      ...(budgetsQuery.error && { budgets: budgetsQuery.error.message }),
      ...(billsQuery.error && { bills: billsQuery.error.message }),
      ...(investmentsQuery.error && { investments: investmentsQuery.error.message }),
    },
    hasErrors: !!(transactionsQuery.error || shiftsQuery.error || goalsQuery.error || 
                  debtsQuery.error || budgetsQuery.error || billsQuery.error || 
                  investmentsQuery.error),
    
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
      }
    }
  };
}
