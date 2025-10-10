import { describe, it, expect } from 'vitest';

/**
 * Formatting utility functions tests
 */

// Mock formatting functions (these should match your actual implementations)
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (date, format = 'short') => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString('en-US');
};

const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should support different currencies', () => {
      const eurValue = formatCurrency(1000, 'EUR');
      expect(eurValue).toContain('1,000');
    });
  });

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2025-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan.*15.*2025/);
    });

    it('should format date strings', () => {
      const formatted = formatDate('2025-01-15');
      expect(formatted).toMatch(/Jan.*15.*2025/);
    });

    it('should handle different formats', () => {
      const date = new Date('2025-01-15');
      const short = formatDate(date, 'short');
      expect(short).toMatch(/Jan.*15.*2025/);
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal values as percentages', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.1234)).toBe('12.3%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle negative values', () => {
      expect(formatPercentage(-0.25)).toBe('-25.0%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(0.1234, 2)).toBe('12.34%');
      expect(formatPercentage(0.1234, 0)).toBe('12%');
    });
  });
});
