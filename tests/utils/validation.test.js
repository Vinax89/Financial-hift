/**
 * Validation Utilities Tests
 * Tests for form validation including shift overlap detection
 */

import { describe, it, expect } from 'vitest';
import { validateShift, validateTransaction, validateBudget } from '@/utils/validation';

describe('validateShift', () => {
  it('should validate a correct shift', () => {
    const shift = {
      title: 'Morning Shift',
      start_datetime: '2025-11-06T08:00',
      end_datetime: '2025-11-06T16:00',
      location: 'Office',
    };
    
    const errors = validateShift(shift);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should detect missing title', () => {
    const shift = {
      title: '',
      start_datetime: '2025-11-06T08:00',
      end_datetime: '2025-11-06T16:00',
    };
    
    const errors = validateShift(shift);
    expect(errors.title).toBeTruthy();
  });

  it('should detect end time before start time', () => {
    const shift = {
      title: 'Test Shift',
      start_datetime: '2025-11-06T16:00',
      end_datetime: '2025-11-06T08:00',
    };
    
    const errors = validateShift(shift);
    expect(errors.end_datetime).toBeTruthy();
  });

  it('should detect overlapping shifts', () => {
    const newShift = {
      title: 'Evening Shift',
      start_datetime: '2025-11-06T14:00',
      end_datetime: '2025-11-06T22:00',
    };
    
    const existingShifts = [
      {
        id: 1,
        start_datetime: '2025-11-06T08:00',
        end_datetime: '2025-11-06T16:00',
      },
    ];
    
    const errors = validateShift(newShift, existingShifts);
    expect(errors.overlap).toBeTruthy();
  });

  it('should allow non-overlapping shifts', () => {
    const newShift = {
      title: 'Evening Shift',
      start_datetime: '2025-11-06T17:00',
      end_datetime: '2025-11-06T22:00',
    };
    
    const existingShifts = [
      {
        id: 1,
        start_datetime: '2025-11-06T08:00',
        end_datetime: '2025-11-06T16:00',
      },
    ];
    
    const errors = validateShift(newShift, existingShifts);
    expect(errors.overlap).toBeFalsy();
  });
});

describe('validateTransaction', () => {
  it('should validate a correct transaction', () => {
    const transaction = {
      title: 'Groceries',
      amount: 50.00,
      date: '2025-11-06',
      type: 'expense',
      category: 'groceries',
    };
    
    const errors = validateTransaction(transaction);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const transaction = {
      title: '',
      amount: '',
    };
    
    const errors = validateTransaction(transaction);
    expect(errors.title).toBeTruthy();
    expect(errors.amount).toBeTruthy();
  });

  it('should detect negative amount', () => {
    const transaction = {
      title: 'Test',
      amount: -10,
      type: 'expense',
    };
    
    const errors = validateTransaction(transaction);
    expect(errors.amount).toBeTruthy();
  });
});

describe('validateBudget', () => {
  it('should validate a correct budget', () => {
    const budget = {
      category: 'groceries',
      monthly_limit: 500,
      year: 2025,
      month: 11,
    };
    
    const errors = validateBudget(budget);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('should detect missing category', () => {
    const budget = {
      category: '',
      monthly_limit: 500,
    };
    
    const errors = validateBudget(budget);
    expect(errors.category).toBeTruthy();
  });

  it('should detect invalid monthly limit', () => {
    const budget = {
      category: 'groceries',
      monthly_limit: -100,
    };
    
    const errors = validateBudget(budget);
    expect(errors.monthly_limit).toBeTruthy();
  });
});
