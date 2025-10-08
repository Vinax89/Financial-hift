/**
 * @fileoverview Core financial calculation utilities with optimized algorithms
 * @description Comprehensive financial calculations including shift pay, debt payoff,
 * tax calculations, budget variance, and goal projectionexport const formatCurrency = (amount: number, options: CurrencyOptions = {}): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency' as const,
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat('en-US', defaultOptions).format(amount);
};ization
 */

import { format, addMonths, differenceInDays, parseISO } from 'date-fns';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Currency formatting options
 */
export interface CurrencyOptions {
  style?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Shift differential configuration
 */
export interface ShiftDifferential {
  name: string;
  type: string;
  amount: number;
  is_percentage: boolean;
}

/**
 * Pay rule configuration
 */
export interface PayRule {
  id: string;
  active: boolean;
  base_hourly_rate: number;
  overtime_threshold?: number;
  overtime_multiplier?: number;
  differentials?: ShiftDifferential[];
}

/**
 * Work shift data
 */
export interface Shift {
  id: string;
  actual_hours?: number;
  scheduled_hours?: number;
  tags?: string[];
}

/**
 * Applied differential result
 */
export interface AppliedDifferential {
  name: string;
  amount: number;
  hours: number;
  rate: number;
}

/**
 * Shift pay calculation result
 */
export interface ShiftPayResult {
  gross_pay: number;
  net_pay: number;
  base_pay: number;
  overtime_pay: number;
  differential_pay: number;
  differentials_applied: AppliedDifferential[];
  tax_withholding: number;
}

/**
 * Debt entity for payoff calculations
 */
export interface Debt {
  id: string;
  balance: number;
  apr: number;
  minimum_payment: number;
  name?: string;
}

/**
 * Debt with payoff schedule
 */
export interface DebtSchedule extends Debt {
  months_to_payoff: number;
  total_interest: number;
  payoff_date: Date;
}

/**
 * Debt payoff strategy type
 */
export type DebtStrategy = 'avalanche' | 'snowball';

/**
 * Debt payoff calculation result
 */
export interface DebtPayoffResult {
  schedule: DebtSchedule[];
  total_months: number;
  total_interest: number;
  debt_free_date: Date;
  strategy_savings: number;
}

/**
 * Tax filing status
 */
export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';

/**
 * Tax bracket definition
 */
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

/**
 * Tax calculation result
 */
export interface TaxResult {
  federal: number;
  state: number;
  socialSecurity: number;
  medicare: number;
  total: number;
  effective_rate: number;
}

/**
 * Budget entity
 */
export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
}

/**
 * Transaction for budget calculations
 */
export interface Transaction {
  id: string;
  date: string | Date;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

/**
 * Budget status type
 */
export type BudgetStatus = 'good' | 'warning' | 'over';

/**
 * Budget variance result
 */
export interface BudgetVariance extends Budget {
  spent: number;
  remaining: number;
  variance: number;
  percentage_used: number;
  status: BudgetStatus;
}

/**
 * Goal entity
 */
export interface Goal {
  id: string;
  target_amount: number;
  current_amount: number;
  target_date: string | Date;
}

/**
 * Goal projection result
 */
export interface GoalProjection {
  months_to_completion: number;
  projected_completion_date: Date;
  on_track: boolean;
  required_monthly_contribution: number;
  completion_percentage: number;
}

// ============================================================================
// Memoization Cache
// ============================================================================

const calculationCache = new Map<string, unknown>();

/**
 * Generate cache key from data
 */
const getCacheKey = (data: unknown): string => JSON.stringify(data);

/**
 * Clear calculation cache
 */
export const clearCalculationCache = (): void => {
  calculationCache.clear();
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  if (calculationCache.size > 100) {
    calculationCache.clear();
  }
}, 300000); // Clear every 5 minutes if cache gets large

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format a number as currency
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options: CurrencyOptions = {}): string => {
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat('en-US', defaultOptions as Intl.NumberFormatOptions).format(amount || 0);
};

/**
 * Format a number as percentage
 * @param value - Value to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value || 0).toFixed(decimals)}%`;
};

// ============================================================================
// Shift Pay Calculations
// ============================================================================

/**
 * Calculate pay for a work shift including overtime and differentials
 * @param shift - Shift data
 * @param rules - Pay rules to apply
 * @returns Detailed pay breakdown
 */
export const calculateShiftPay = (shift: Shift, rules: PayRule[]): ShiftPayResult => {
  if (!shift || !rules || rules.length === 0) {
    return {
      gross_pay: 0,
      net_pay: 0,
      base_pay: 0,
      overtime_pay: 0,
      differential_pay: 0,
      differentials_applied: [],
      tax_withholding: 0
    };
  }
  
  const cacheKey = getCacheKey({ shift, rules: rules[0]?.id });
  const cached = calculationCache.get(cacheKey) as ShiftPayResult | undefined;
  if (cached) {
    return cached;
  }

  const activeRule = rules.find(r => r.active) || rules[0];
  const hours = shift.actual_hours || shift.scheduled_hours || 0;
  const baseRate = activeRule.base_hourly_rate;
  
  let grossPay = 0;
  let overtimePay = 0;
  let differentialPay = 0;
  const differentialsApplied: AppliedDifferential[] = [];

  // Base pay calculation
  const regularHours = Math.min(hours, activeRule.overtime_threshold || 40);
  const overtimeHours = Math.max(0, hours - (activeRule.overtime_threshold || 40));
  
  grossPay = regularHours * baseRate;
  
  // Overtime calculation
  if (overtimeHours > 0) {
    overtimePay = overtimeHours * baseRate * (activeRule.overtime_multiplier || 1.5);
    grossPay += overtimePay;
  }

  // Apply differentials
  if (activeRule.differentials && shift.tags) {
    activeRule.differentials.forEach(diff => {
      if (shift.tags!.includes(diff.type)) {
        let diffAmount = 0;
        
        if (diff.is_percentage) {
          diffAmount = grossPay * (diff.amount / 100);
        } else {
          diffAmount = hours * diff.amount;
        }
        
        differentialPay += diffAmount;
        differentialsApplied.push({
          name: diff.name,
          amount: diffAmount,
          hours: hours,
          rate: diff.amount
        });
      }
    });
  }

  grossPay += differentialPay;

  // Simplified tax calculation (could be enhanced)
  const taxRate = 0.25; // Federal + State + FICA estimated
  const netPay = grossPay * (1 - taxRate);

  const result: ShiftPayResult = {
    gross_pay: Math.round(grossPay * 100) / 100,
    net_pay: Math.round(netPay * 100) / 100,
    base_pay: regularHours * baseRate,
    overtime_pay: overtimePay,
    differential_pay: differentialPay,
    differentials_applied: differentialsApplied,
    tax_withholding: grossPay - netPay
  };

  calculationCache.set(cacheKey, result);
  return result;
};

// ============================================================================
// Debt Payoff Calculations
// ============================================================================

/**
 * Calculate debt payoff schedule using avalanche or snowball method
 * @param debts - List of debts
 * @param strategy - Payoff strategy (avalanche = highest interest first, snowball = lowest balance first)
 * @param extraPayment - Additional monthly payment to apply
 * @returns Debt payoff schedule and totals
 */
export const calculateDebtPayoff = (
  debts: Debt[],
  strategy: DebtStrategy = 'avalanche',
  extraPayment: number = 0
): DebtPayoffResult | null => {
  if (!debts || debts.length === 0) return null;

  const cacheKey = getCacheKey({
    debts: debts.map(d => ({
      id: d.id,
      balance: d.balance,
      apr: d.apr,
      minimum_payment: d.minimum_payment
    })),
    strategy,
    extraPayment
  });
  
  const cached = calculationCache.get(cacheKey) as DebtPayoffResult | undefined;
  if (cached) {
    return cached;
  }

  const sortedDebts = [...debts].sort((a, b) => {
    return strategy === 'avalanche' 
      ? b.apr - a.apr  // Highest interest first
      : a.balance - b.balance;  // Lowest balance first
  });

  let totalInterest = 0;
  let maxMonths = 0;
  let snowball = extraPayment;
  
  const schedule: DebtSchedule[] = sortedDebts.map((debt, index) => {
    let balance = debt.balance;
    let payment = debt.minimum_payment + (index === 0 ? snowball : 0);
    let months = 0;
    let interestPaid = 0;

    while (balance > 0.01 && months < 600) {
      const monthlyInterest = balance * (debt.apr / 100 / 12);
      const principalPayment = Math.min(Math.max(payment - monthlyInterest, 0), balance);
      
      balance -= principalPayment;
      interestPaid += monthlyInterest;
      months++;
    }

    snowball += debt.minimum_payment;
    totalInterest += interestPaid;
    maxMonths = Math.max(maxMonths, months);

    return {
      ...debt,
      months_to_payoff: months,
      total_interest: interestPaid,
      payoff_date: addMonths(new Date(), months)
    };
  });

  const result: DebtPayoffResult = {
    schedule,
    total_months: maxMonths,
    total_interest: totalInterest,
    debt_free_date: addMonths(new Date(), maxMonths),
    strategy_savings: 0 // Could calculate vs other strategy
  };

  calculationCache.set(cacheKey, result);
  return result;
};

// ============================================================================
// Tax Calculations
// ============================================================================

/**
 * Calculate federal and state taxes
 * @param income - Annual income
 * @param filingStatus - Tax filing status
 * @param state - State code (null for no state tax)
 * @returns Detailed tax breakdown
 */
export const calculateTaxes = (
  income: number,
  filingStatus: FilingStatus = 'single',
  state: string | null = null
): TaxResult => {
  // 2024 tax brackets (simplified)
  const federalBrackets: Record<FilingStatus, TaxBracket[]> = {
    single: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 }
    ],
    married_joint: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22000, max: 89050, rate: 0.12 },
      { min: 89050, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: Infinity, rate: 0.37 }
    ],
    married_separate: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44525, rate: 0.12 },
      { min: 44525, max: 95375, rate: 0.22 },
      { min: 95375, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 346875, rate: 0.35 },
      { min: 346875, max: Infinity, rate: 0.37 }
    ],
    head_of_household: [
      { min: 0, max: 15700, rate: 0.10 },
      { min: 15700, max: 59850, rate: 0.12 },
      { min: 59850, max: 95350, rate: 0.22 },
      { min: 95350, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 578100, rate: 0.35 },
      { min: 578100, max: Infinity, rate: 0.37 }
    ]
  };

  const brackets = federalBrackets[filingStatus] || federalBrackets.single;
  let federalTax = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInThisBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
      federalTax += taxableInThisBracket * bracket.rate;
    }
  }

  // FICA taxes
  const socialSecurity = Math.min(income * 0.062, 160200 * 0.062); // 2024 SS wage base
  const medicare = income * 0.0145;
  const additionalMedicare = income > 200000 ? (income - 200000) * 0.009 : 0;

  // State tax (simplified)
  const stateTax = state ? income * 0.05 : 0; // Rough estimate

  return {
    federal: federalTax,
    state: stateTax,
    socialSecurity,
    medicare: medicare + additionalMedicare,
    total: federalTax + stateTax + socialSecurity + medicare + additionalMedicare,
    effective_rate: income > 0 
      ? ((federalTax + stateTax + socialSecurity + medicare + additionalMedicare) / income * 100) 
      : 0
  };
};

// ============================================================================
// Budget Variance Calculations
// ============================================================================

/**
 * Calculate budget variance for current month
 * @param budgets - List of budgets
 * @param transactions - List of transactions
 * @returns Budget variance details with spending status
 */
export const calculateBudgetVariance = (
  budgets: Budget[],
  transactions: Transaction[]
): BudgetVariance[] => {
  const currentMonth = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const monthlyTransactions = transactions.filter(t => {
    const date = typeof t.date === 'string' ? new Date(t.date) : t.date;
    return date >= monthStart && date <= monthEnd && t.type === 'expense';
  });

  const categorySpending = monthlyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return budgets.map(budget => {
    const spent = categorySpending[budget.category] || 0;
    const variance = budget.monthly_limit - spent;
    const percentageUsed = budget.monthly_limit > 0 ? (spent / budget.monthly_limit * 100) : 0;

    return {
      ...budget,
      spent,
      remaining: Math.max(0, variance),
      variance,
      percentage_used: percentageUsed,
      status: percentageUsed >= 100 ? 'over' : percentageUsed >= 80 ? 'warning' : 'good'
    };
  });
};

// ============================================================================
// Goal Projection Calculations
// ============================================================================

/**
 * Calculate goal projection and required contributions
 * @param goal - Goal data
 * @param monthlyContribution - Monthly contribution amount
 * @returns Goal projection details
 */
export const calculateGoalProjection = (
  goal: Goal,
  monthlyContribution: number
): GoalProjection | null => {
  if (!goal || !monthlyContribution) return null;

  const remainingAmount = goal.target_amount - goal.current_amount;
  const monthsToGoal = remainingAmount > 0 ? Math.ceil(remainingAmount / monthlyContribution) : 0;
  const projectedCompletionDate = addMonths(new Date(), monthsToGoal);

  const targetDate = typeof goal.target_date === 'string' 
    ? new Date(goal.target_date) 
    : goal.target_date;
  const monthsUntilTarget = differenceInDays(targetDate, new Date()) / 30;
  const requiredMonthlyContribution = monthsUntilTarget > 0 
    ? remainingAmount / monthsUntilTarget 
    : remainingAmount;

  return {
    months_to_completion: monthsToGoal,
    projected_completion_date: projectedCompletionDate,
    on_track: monthsToGoal <= monthsUntilTarget,
    required_monthly_contribution: Math.max(0, requiredMonthlyContribution),
    completion_percentage: goal.target_amount > 0 
      ? (goal.current_amount / goal.target_amount * 100) 
      : 0
  };
};


