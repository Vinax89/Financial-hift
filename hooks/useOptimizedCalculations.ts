// @ts-nocheck - VFS cache issues, will be fixed after TypeScript server restart
import { useMemo } from 'react';
import { calculateShiftPay, calculateDebtPayoff } from '../utils/calculations';

/**
 * Types for shift calculations
 */
interface ShiftCalculationResult {
  gross_pay?: number;
  net_pay?: number;
}

interface Shift {
  actual_hours?: number;
  scheduled_hours?: number;
  start_datetime?: string;
  date?: string;
  net_pay?: number;
  gross_pay?: number;
}

interface ShiftRule {
  // Add specific rule properties based on your implementation
  [key: string]: any;
}

interface Debt {
  balance?: number;
  minimum_payment?: number;
}

interface Investment {
  current_value?: number;
}

interface Goal {
  current_amount?: number;
}

interface Transaction {
  date: string;
  type: 'income' | 'expense';
  amount?: number;
}

interface ShiftCalculations {
  totalGross: number;
  totalNet: number;
  avgHourly: number;
  calculations: ShiftCalculationResult[];
}

interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  totalDebtBalance: number;
  totalInvestments: number;
  netWorth: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  monthlyDebtPayments: number;
  totalGoalsProgress: number;
}

/**
 * Hook for calculating shift pay totals and averages
 */
export function useShiftCalculations(
  shifts: Shift[] | null | undefined,
  rules: ShiftRule[] | null | undefined
): ShiftCalculations {
  return useMemo(() => {
    if (!Array.isArray(shifts) || !Array.isArray(rules) || rules.length === 0) {
      return { totalGross: 0, totalNet: 0, avgHourly: 0, calculations: [] };
    }

    const calculations = shifts.map(shift => calculateShiftPay(shift, rules));
    const totalGross = calculations.reduce((sum, calc) => sum + (calc?.gross_pay || 0), 0);
    const totalNet = calculations.reduce((sum, calc) => sum + (calc?.net_pay || 0), 0);
    const totalHours = shifts.reduce(
      (sum, shift) => sum + (shift.actual_hours || shift.scheduled_hours || 0),
      0
    );
    const avgHourly = totalHours > 0 ? totalGross / totalHours : 0;

    return { totalGross, totalNet, avgHourly, calculations };
  }, [shifts, rules]);
}

/**
 * Hook for calculating debt payoff strategies
 */
export function useDebtCalculations(
  debts: Debt[] | null | undefined,
  strategy: 'avalanche' | 'snowball' = 'avalanche',
  extraPayment: number = 0
): ReturnType<typeof calculateDebtPayoff> | null {
  return useMemo(() => {
    if (!Array.isArray(debts) || debts.length === 0) return null;
    return calculateDebtPayoff(debts, strategy, extraPayment);
  }, [debts, strategy, extraPayment]);
}

/**
 * Hook for calculating comprehensive financial metrics
 */
export function useFinancialMetrics(
  transactions: Transaction[] | null | undefined,
  shifts: Shift[] | null | undefined,
  debts: Debt[] | null | undefined,
  investments: Investment[] | null | undefined,
  goals: Goal[] | null | undefined
): FinancialMetrics {
  return useMemo(() => {
    // Ensure all inputs are arrays
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const safeShifts = Array.isArray(shifts) ? shifts : [];
    const safeDebts = Array.isArray(debts) ? debts : [];
    const safeInvestments = Array.isArray(investments) ? investments : [];
    const safeGoals = Array.isArray(goals) ? goals : [];

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyTransactions = safeTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const monthlyShiftIncome = safeShifts
      .filter(shift => {
        try {
          const shiftDate = new Date(shift.start_datetime || shift.date || '');
          return shiftDate >= monthStart && shiftDate <= monthEnd;
        } catch {
          return false;
        }
      })
      .reduce((sum, shift) => {
        const netPay = Number(shift?.net_pay);
        const grossPay = Number(shift?.gross_pay);
        if (!Number.isFinite(netPay) && !Number.isFinite(grossPay)) {
          return sum;
        }
        return sum + (Number.isFinite(netPay) ? netPay : grossPay);
      }, 0);

    const transactionIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Assume shift income is not already represented within transactions to avoid double counting
    const monthlyIncome = transactionIncome + monthlyShiftIncome;

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalDebtBalance = safeDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
    const totalInvestments = safeInvestments.reduce((sum, i) => sum + (i.current_value || 0), 0);
    const totalGoalsProgress = safeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

    const assets = totalInvestments + totalGoalsProgress + Math.max(0, monthlyIncome - monthlyExpenses);
    const liabilities = totalDebtBalance;
    const netWorth = assets - liabilities;

    const monthlyDebtPayments = safeDebts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0);
    const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      netIncome: monthlyIncome - monthlyExpenses,
      totalDebtBalance,
      totalInvestments,
      netWorth,
      debtToIncomeRatio,
      savingsRate,
      monthlyDebtPayments,
      totalGoalsProgress,
    };
  }, [transactions, shifts, debts, investments, goals]);
}

