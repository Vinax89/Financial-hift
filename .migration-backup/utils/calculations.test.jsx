/**
 * @fileoverview Tests for financial calculations
 * @description Test coverage for income calculations, savings rate, burn rate, etc.
 */

import { describe, it, expect } from 'vitest';

/**
 * Calculate total income from transactions
 */
function calculateTotalIncome(transactions = []) {
  return transactions
    .filter(t => t.amount > 0 && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses from transactions
 */
function calculateTotalExpenses(transactions = []) {
  return transactions
    .filter(t => t.amount < 0 || t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

/**
 * Calculate net savings (income - expenses)
 */
function calculateNetSavings(transactions = []) {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculate savings rate as percentage
 */
function calculateSavingsRate(transactions = []) {
  const income = calculateTotalIncome(transactions);
  const savings = calculateNetSavings(transactions);
  
  if (income === 0) return 0;
  return (savings / income) * 100;
}

/**
 * Calculate monthly burn rate (average daily expenses * 30)
 */
function calculateBurnRate(transactions = [], days = 30) {
  const expenses = calculateTotalExpenses(transactions);
  if (days === 0) return 0;
  
  const dailyBurn = expenses / days;
  return dailyBurn * 30; // Monthly burn rate
}

/**
 * Calculate runway (months until money runs out)
 */
function calculateRunway(currentBalance, burnRate) {
  if (burnRate === 0) return Infinity;
  return currentBalance / burnRate;
}

/**
 * Calculate debt-to-income ratio
 */
function calculateDebtToIncomeRatio(monthlyDebtPayments, monthlyIncome) {
  if (monthlyIncome === 0) return 0;
  return (monthlyDebtPayments / monthlyIncome) * 100;
}

/**
 * Calculate emergency fund coverage (months)
 */
function calculateEmergencyFundCoverage(emergencyFund, monthlyExpenses) {
  if (monthlyExpenses === 0) return 0;
  return emergencyFund / monthlyExpenses;
}

describe('Financial Calculations - Income & Expenses', () => {
  it('should calculate total income correctly', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' },
      { id: '2', amount: 1000, type: 'income' },
      { id: '3', amount: -500, type: 'expense' }
    ];

    expect(calculateTotalIncome(transactions)).toBe(6000);
  });

  it('should calculate total expenses correctly', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' },
      { id: '2', amount: -500, type: 'expense' },
      { id: '3', amount: -300, type: 'expense' }
    ];

    expect(calculateTotalExpenses(transactions)).toBe(800);
  });

  it('should handle empty transactions', () => {
    expect(calculateTotalIncome([])).toBe(0);
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('should handle null/undefined input', () => {
    expect(calculateTotalIncome()).toBe(0);
    expect(calculateTotalExpenses()).toBe(0);
  });
});

describe('Financial Calculations - Savings', () => {
  it('should calculate net savings correctly', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' },
      { id: '2', amount: -3000, type: 'expense' }
    ];

    expect(calculateNetSavings(transactions)).toBe(2000);
  });

  it('should calculate negative savings (deficit)', () => {
    const transactions = [
      { id: '1', amount: 2000, type: 'income' },
      { id: '2', amount: -3000, type: 'expense' }
    ];

    expect(calculateNetSavings(transactions)).toBe(-1000);
  });

  it('should calculate savings rate as percentage', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' },
      { id: '2', amount: -2500, type: 'expense' }
    ];

    expect(calculateSavingsRate(transactions)).toBe(50); // 50% savings rate
  });

  it('should handle zero income for savings rate', () => {
    const transactions = [
      { id: '1', amount: -100, type: 'expense' }
    ];

    expect(calculateSavingsRate(transactions)).toBe(0);
  });

  it('should handle 100% savings rate', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' }
    ];

    expect(calculateSavingsRate(transactions)).toBe(100);
  });
});

describe('Financial Calculations - Burn Rate', () => {
  it('should calculate monthly burn rate correctly', () => {
    const transactions = [
      { id: '1', amount: -3000, type: 'expense' }
    ];

    const burnRate = calculateBurnRate(transactions, 30);
    expect(burnRate).toBe(3000); // $3000/month
  });

  it('should calculate burn rate for partial month', () => {
    const transactions = [
      { id: '1', amount: -1500, type: 'expense' }
    ];

    const burnRate = calculateBurnRate(transactions, 15);
    expect(burnRate).toBe(3000); // $1500/15 days * 30 = $3000/month
  });

  it('should handle zero days', () => {
    const transactions = [
      { id: '1', amount: -1000, type: 'expense' }
    ];

    expect(calculateBurnRate(transactions, 0)).toBe(0);
  });

  it('should calculate runway correctly', () => {
    const currentBalance = 15000;
    const monthlyBurnRate = 3000;

    expect(calculateRunway(currentBalance, monthlyBurnRate)).toBe(5); // 5 months
  });

  it('should handle infinite runway', () => {
    expect(calculateRunway(10000, 0)).toBe(Infinity);
  });
});

describe('Financial Calculations - Debt & Ratios', () => {
  it('should calculate debt-to-income ratio correctly', () => {
    const monthlyDebtPayments = 1500;
    const monthlyIncome = 5000;

    expect(calculateDebtToIncomeRatio(monthlyDebtPayments, monthlyIncome)).toBe(30); // 30%
  });

  it('should handle zero income for DTI', () => {
    expect(calculateDebtToIncomeRatio(1000, 0)).toBe(0);
  });

  it('should calculate emergency fund coverage', () => {
    const emergencyFund = 15000;
    const monthlyExpenses = 3000;

    expect(calculateEmergencyFundCoverage(emergencyFund, monthlyExpenses)).toBe(5); // 5 months
  });

  it('should handle zero monthly expenses', () => {
    expect(calculateEmergencyFundCoverage(10000, 0)).toBe(0);
  });

  it('should identify healthy DTI ratio', () => {
    const dti = calculateDebtToIncomeRatio(1000, 5000);
    expect(dti).toBeLessThan(36); // Healthy DTI < 36%
  });

  it('should identify risky DTI ratio', () => {
    const dti = calculateDebtToIncomeRatio(2500, 5000);
    expect(dti).toBeGreaterThanOrEqual(43); // Risky DTI >= 43%
  });
});

describe('Financial Calculations - Edge Cases', () => {
  it('should handle very large numbers', () => {
    const transactions = [
      { id: '1', amount: 1000000, type: 'income' },
      { id: '2', amount: -500000, type: 'expense' }
    ];

    expect(calculateNetSavings(transactions)).toBe(500000);
    expect(calculateSavingsRate(transactions)).toBe(50);
  });

  it('should handle decimal amounts', () => {
    const transactions = [
      { id: '1', amount: 123.45, type: 'income' },
      { id: '2', amount: -67.89, type: 'expense' }
    ];

    const savings = calculateNetSavings(transactions);
    expect(savings).toBeCloseTo(55.56, 2);
  });

  it('should handle negative income (refunds)', () => {
    const transactions = [
      { id: '1', amount: 5000, type: 'income' },
      { id: '2', amount: -100, type: 'income' } // Refund/correction
    ];

    expect(calculateTotalIncome(transactions)).toBe(5000);
  });
});

// Export functions for use in app
export {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateBurnRate,
  calculateRunway,
  calculateDebtToIncomeRatio,
  calculateEmergencyFundCoverage
};
