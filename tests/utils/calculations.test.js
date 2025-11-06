/**
 * Calculation Utilities Tests
 * Tests for financial calculations and formatting
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculatePercentage,
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetIncome,
} from '@/utils/calculations';

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 200)).toBe(25);
  });

  it('should handle zero total', () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it('should handle 100%', () => {
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it('should handle over 100%', () => {
    expect(calculatePercentage(150, 100)).toBe(150);
  });
});

describe('calculateTotalIncome', () => {
  it('should sum income transactions', () => {
    const transactions = [
      { type: 'income', amount: 1000 },
      { type: 'income', amount: 500 },
      { type: 'expense', amount: 200 },
    ];
    
    expect(calculateTotalIncome(transactions)).toBe(1500);
  });

  it('should handle empty array', () => {
    expect(calculateTotalIncome([])).toBe(0);
  });
});

describe('calculateTotalExpenses', () => {
  it('should sum expense transactions', () => {
    const transactions = [
      { type: 'expense', amount: 200 },
      { type: 'expense', amount: 150 },
      { type: 'income', amount: 1000 },
    ];
    
    expect(calculateTotalExpenses(transactions)).toBe(350);
  });

  it('should handle empty array', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });
});

describe('calculateNetIncome', () => {
  it('should calculate net income', () => {
    const transactions = [
      { type: 'income', amount: 1000 },
      { type: 'expense', amount: 300 },
      { type: 'expense', amount: 200 },
    ];
    
    expect(calculateNetIncome(transactions)).toBe(500);
  });

  it('should handle negative net income', () => {
    const transactions = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 200 },
    ];
    
    expect(calculateNetIncome(transactions)).toBe(-100);
  });
});
