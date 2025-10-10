import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateEmail,
  validateCurrency,
  validateDate,
  validateTransaction,
  validateShift,
  validateBudget,
  validateDebt,
  validateGoal
} from '@/utils/validation';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    expect(sanitizeInput(malicious)).toBe('alert("xss")Hello');
  });

  it('should remove javascript protocol', () => {
    const malicious = 'javascript:alert("xss")';
    expect(sanitizeInput(malicious)).toBe('alert("xss")');
  });

  it('should remove event handlers', () => {
    const malicious = 'onclick=alert("xss")';
    expect(sanitizeInput(malicious)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should handle non-string input', () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
  });
});

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });
});

describe('validateCurrency', () => {
  it('should validate positive amounts', () => {
    expect(validateCurrency(10)).toBe(true);
    expect(validateCurrency(1000.50)).toBe(true);
    expect(validateCurrency('100')).toBe(true);
  });

  it('should validate zero', () => {
    expect(validateCurrency(0)).toBe(true);
  });

  it('should reject negative amounts', () => {
    expect(validateCurrency(-10)).toBe(false);
  });

  it('should reject amounts over $1M', () => {
    expect(validateCurrency(1000001)).toBe(false);
  });

  it('should reject invalid numbers', () => {
    expect(validateCurrency('not a number')).toBe(false);
    expect(validateCurrency(NaN)).toBe(false);
  });
});

describe('validateDate', () => {
  it('should validate valid dates', () => {
    expect(validateDate('2024-01-15')).toBe(true);
    expect(validateDate('2025-10-06')).toBe(true);
  });

  it('should reject dates before 2020', () => {
    expect(validateDate('2019-12-31')).toBe(false);
  });

  it('should reject dates too far in future (>10 years)', () => {
    expect(validateDate('2040-01-01')).toBe(false);
  });

  it('should reject invalid date strings', () => {
    expect(validateDate('not a date')).toBe(false);
    expect(validateDate('2024-13-01')).toBe(false);
  });
});

describe('validateTransaction', () => {
  it('should validate complete transaction', () => {
    const transaction = {
      title: 'Grocery Shopping',
      amount: 125.50,
      category: 'Food',
      type: 'expense',
      date: '2025-10-06',
      notes: 'Weekly groceries'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should require title', () => {
    const transaction = {
      title: '',
      amount: 100,
      category: 'Food',
      type: 'expense',
      date: '2025-10-06'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('should reject title over 200 characters', () => {
    const transaction = {
      title: 'a'.repeat(201),
      amount: 100,
      category: 'Food',
      type: 'expense',
      date: '2025-10-06'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('200 characters');
  });

  it('should require valid amount', () => {
    const transaction = {
      title: 'Test',
      amount: -50,
      category: 'Food',
      type: 'expense',
      date: '2025-10-06'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  it('should require category', () => {
    const transaction = {
      title: 'Test',
      amount: 100,
      type: 'expense',
      date: '2025-10-06'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  it('should require valid type', () => {
    const transaction = {
      title: 'Test',
      amount: 100,
      category: 'Food',
      type: 'invalid',
      date: '2025-10-06'
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.type).toBeDefined();
  });

  it('should limit notes length', () => {
    const transaction = {
      title: 'Test',
      amount: 100,
      category: 'Food',
      type: 'expense',
      date: '2025-10-06',
      notes: 'a'.repeat(501)
    };

    const result = validateTransaction(transaction);
    expect(result.isValid).toBe(false);
    expect(result.errors.notes).toContain('500 characters');
  });
});

describe('validateShift', () => {
  it('should validate complete shift', () => {
    const shift = {
      title: 'Morning Shift',
      start_datetime: '2025-10-06T09:00:00',
      end_datetime: '2025-10-06T17:00:00',
      scheduled_hours: 8,
      location: 'Store A'
    };

    const result = validateShift(shift);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should require title', () => {
    const shift = {
      title: '',
      start_datetime: '2025-10-06T09:00:00',
      end_datetime: '2025-10-06T17:00:00',
      scheduled_hours: 8
    };

    const result = validateShift(shift);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('should reject end time before start time', () => {
    const shift = {
      title: 'Invalid Shift',
      start_datetime: '2025-10-06T17:00:00',
      end_datetime: '2025-10-06T09:00:00',
      scheduled_hours: 8
    };

    const result = validateShift(shift);
    expect(result.isValid).toBe(false);
    expect(result.errors.end_datetime).toContain('after start time');
  });

  it('should reject hours over 24', () => {
    const shift = {
      title: 'Long Shift',
      start_datetime: '2025-10-06T09:00:00',
      end_datetime: '2025-10-06T17:00:00',
      scheduled_hours: 25
    };

    const result = validateShift(shift);
    expect(result.isValid).toBe(false);
    expect(result.errors.scheduled_hours).toContain('between 0 and 24');
  });

  it('should detect overlapping shifts', () => {
    const newShift = {
      title: 'Afternoon Shift',
      start_datetime: '2025-10-06T15:00:00',
      end_datetime: '2025-10-06T23:00:00',
      scheduled_hours: 8
    };

    const existingShifts = [
      {
        id: '1',
        title: 'Morning Shift',
        start_datetime: '2025-10-06T09:00:00',
        end_datetime: '2025-10-06T17:00:00'
      }
    ];

    const result = validateShift(newShift, existingShifts);
    expect(result.isValid).toBe(false);
    expect(result.errors.overlap).toBeDefined();
    expect(result.errors.overlap).toContain('overlaps');
  });

  it('should allow non-overlapping shifts', () => {
    const newShift = {
      title: 'Evening Shift',
      start_datetime: '2025-10-06T18:00:00',
      end_datetime: '2025-10-06T23:00:00',
      scheduled_hours: 5
    };

    const existingShifts = [
      {
        id: '1',
        title: 'Morning Shift',
        start_datetime: '2025-10-06T09:00:00',
        end_datetime: '2025-10-06T17:00:00'
      }
    ];

    const result = validateShift(newShift, existingShifts);
    expect(result.isValid).toBe(true);
  });

  it('should allow editing the same shift', () => {
    const shift = {
      id: '1',
      title: 'Morning Shift',
      start_datetime: '2025-10-06T09:00:00',
      end_datetime: '2025-10-06T17:00:00',
      scheduled_hours: 8
    };

    const existingShifts = [shift];

    const result = validateShift(shift, existingShifts);
    expect(result.isValid).toBe(true);
  });
});

describe('validateBudget', () => {
  it('should validate complete budget', () => {
    const budget = {
      category: 'Food',
      planned_amount: 500,
      period: 'monthly',
      start_date: '2025-10-01'
    };

    const result = validateBudget(budget);
    expect(result.isValid).toBe(true);
  });

  it('should require category', () => {
    const budget = {
      planned_amount: 500,
      period: 'monthly'
    };

    const result = validateBudget(budget);
    expect(result.isValid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  it('should require valid amount', () => {
    const budget = {
      category: 'Food',
      planned_amount: -100,
      period: 'monthly'
    };

    const result = validateBudget(budget);
    expect(result.isValid).toBe(false);
    expect(result.errors.planned_amount).toBeDefined();
  });
});

describe('validateDebt', () => {
  it('should validate complete debt', () => {
    const debt = {
      name: 'Credit Card',
      total_amount: 5000,
      current_balance: 4500,
      interest_rate: 18.5,
      minimum_payment: 100,
      due_day: 15
    };

    const result = validateDebt(debt);
    expect(result.isValid).toBe(true);
  });

  it('should require name', () => {
    const debt = {
      total_amount: 5000,
      current_balance: 4500
    };

    const result = validateDebt(debt);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('should reject negative interest rate', () => {
    const debt = {
      name: 'Loan',
      total_amount: 5000,
      current_balance: 4500,
      interest_rate: -5
    };

    const result = validateDebt(debt);
    expect(result.isValid).toBe(false);
    expect(result.errors.interest_rate).toBeDefined();
  });
});

describe('validateGoal', () => {
  it('should validate complete goal', () => {
    const goal = {
      title: 'Emergency Fund',
      target_amount: 10000,
      current_amount: 2500,
      target_date: '2026-12-31',
      category: 'Savings'
    };

    const result = validateGoal(goal);
    expect(result.isValid).toBe(true);
  });

  it('should require title', () => {
    const goal = {
      target_amount: 10000,
      target_date: '2026-12-31'
    };

    const result = validateGoal(goal);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('should reject current amount > target amount', () => {
    const goal = {
      title: 'Savings',
      target_amount: 5000,
      current_amount: 6000,
      target_date: '2026-12-31'
    };

    const result = validateGoal(goal);
    expect(result.isValid).toBe(false);
    expect(result.errors.current_amount).toBeDefined();
  });
});
