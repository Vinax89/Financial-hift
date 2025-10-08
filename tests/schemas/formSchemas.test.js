/**
 * @fileoverview Tests for Zod Validation Schemas
 * @description Unit tests for form validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  transactionSchema,
  quickTransactionSchema,
  budgetSchema,
  goalSchema,
  debtSchema,
  shiftSchema,
  subscriptionSchema,
  loginSchema,
  signupSchema,
  passwordChangeSchema,
  commonSchemas,
} from '@/schemas/formSchemas';

describe('commonSchemas', () => {
  describe('positiveNumber', () => {
    it('validates positive numbers', () => {
      expect(commonSchemas.positiveNumber.safeParse(100).success).toBe(true);
      expect(commonSchemas.positiveNumber.safeParse(0.01).success).toBe(true);
    });

    it('rejects zero and negative numbers', () => {
      expect(commonSchemas.positiveNumber.safeParse(0).success).toBe(false);
      expect(commonSchemas.positiveNumber.safeParse(-10).success).toBe(false);
    });

    it('rejects non-numbers', () => {
      expect(commonSchemas.positiveNumber.safeParse('100').success).toBe(false);
      expect(commonSchemas.positiveNumber.safeParse(null).success).toBe(false);
    });
  });

  describe('email', () => {
    it('validates correct email addresses', () => {
      expect(commonSchemas.email.safeParse('test@example.com').success).toBe(true);
      expect(commonSchemas.email.safeParse('user+tag@domain.co.uk').success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(commonSchemas.email.safeParse('notanemail').success).toBe(false);
      expect(commonSchemas.email.safeParse('@example.com').success).toBe(false);
      expect(commonSchemas.email.safeParse('test@').success).toBe(false);
    });
  });

  describe('dateString', () => {
    it('validates ISO date format', () => {
      expect(commonSchemas.dateString.safeParse('2024-01-15').success).toBe(true);
      expect(commonSchemas.dateString.safeParse('2024-12-31').success).toBe(true);
    });

    it('rejects invalid date formats', () => {
      expect(commonSchemas.dateString.safeParse('01/15/2024').success).toBe(false);
      expect(commonSchemas.dateString.safeParse('2024-1-5').success).toBe(false);
      expect(commonSchemas.dateString.safeParse('').success).toBe(false);
    });
  });
});

describe('transactionSchema', () => {
  const validTransaction = {
    description: 'Coffee',
    amount: 5.50,
    type: 'expense',
    category: 'food',
    date: '2024-01-15',
  };

  it('validates a complete valid transaction', () => {
    const result = transactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it('requires description', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, description: '' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path[0]).toBe('description');
  });

  it('requires positive amount', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, amount: -10 });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('positive');
  });

  it('validates transaction type enum', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, type: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts optional notes field', () => {
    const withNotes = { ...validTransaction, notes: 'Test notes' };
    expect(transactionSchema.safeParse(withNotes).success).toBe(true);

    const withoutNotes = validTransaction;
    expect(transactionSchema.safeParse(withoutNotes).success).toBe(true);
  });

  it('validates recurring transaction fields', () => {
    const recurring = {
      ...validTransaction,
      isRecurring: true,
      recurringFrequency: 'monthly',
    };
    expect(transactionSchema.safeParse(recurring).success).toBe(true);
  });

  it('requires recurringFrequency when isRecurring is true', () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      isRecurring: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('quickTransactionSchema', () => {
  it('validates minimal transaction data', () => {
    const quickTransaction = {
      description: 'Lunch',
      amount: 12.50,
      type: 'expense',
      category: 'food',
    };
    expect(quickTransactionSchema.safeParse(quickTransaction).success).toBe(true);
  });

  it('has fewer required fields than full schema', () => {
    const minimal = {
      description: 'Test',
      amount: 10,
      type: 'expense',
      category: 'other',
    };
    expect(quickTransactionSchema.safeParse(minimal).success).toBe(true);
  });
});

describe('budgetSchema', () => {
  const validBudget = {
    name: 'Monthly Groceries',
    amount: 500,
    period: 'monthly',
    category: 'groceries',
    startDate: '2024-01-01',
  };

  it('validates a complete valid budget', () => {
    expect(budgetSchema.safeParse(validBudget).success).toBe(true);
  });

  it('validates period enum', () => {
    expect(budgetSchema.safeParse({ ...validBudget, period: 'daily' }).success).toBe(true);
    expect(budgetSchema.safeParse({ ...validBudget, period: 'weekly' }).success).toBe(true);
    expect(budgetSchema.safeParse({ ...validBudget, period: 'yearly' }).success).toBe(true);
    expect(budgetSchema.safeParse({ ...validBudget, period: 'invalid' }).success).toBe(false);
  });

  it('validates endDate is after startDate', () => {
    const withEndDate = {
      ...validBudget,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };
    expect(budgetSchema.safeParse(withEndDate).success).toBe(true);

    const invalidEndDate = {
      ...validBudget,
      startDate: '2024-12-31',
      endDate: '2024-01-01',
    };
    expect(budgetSchema.safeParse(invalidEndDate).success).toBe(false);
  });

  it('validates rollover as boolean', () => {
    expect(budgetSchema.safeParse({ ...validBudget, rollover: true }).success).toBe(true);
    expect(budgetSchema.safeParse({ ...validBudget, rollover: false }).success).toBe(true);
  });

  it('validates alertThreshold range', () => {
    expect(budgetSchema.safeParse({ ...validBudget, alertThreshold: 80 }).success).toBe(true);
    expect(budgetSchema.safeParse({ ...validBudget, alertThreshold: -10 }).success).toBe(false);
    expect(budgetSchema.safeParse({ ...validBudget, alertThreshold: 150 }).success).toBe(false);
  });
});

describe('goalSchema', () => {
  const validGoal = {
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 5000,
    deadline: '2025-12-31',
    category: 'savings',
  };

  it('validates a complete valid goal', () => {
    expect(goalSchema.safeParse(validGoal).success).toBe(true);
  });

  it('validates currentAmount cannot exceed targetAmount', () => {
    const result = goalSchema.safeParse({
      ...validGoal,
      currentAmount: 15000,
      targetAmount: 10000,
    });
    expect(result.success).toBe(false);
  });

  it('validates deadline is in the future', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const validFuture = {
      ...validGoal,
      deadline: futureDate.toISOString().split('T')[0],
    };
    expect(goalSchema.safeParse(validFuture).success).toBe(true);

    const pastDate = {
      ...validGoal,
      deadline: '2020-01-01',
    };
    expect(goalSchema.safeParse(pastDate).success).toBe(false);
  });

  it('validates category enum', () => {
    const categories = ['savings', 'debt', 'investment', 'emergency', 'purchase', 'other'];
    categories.forEach((category) => {
      expect(goalSchema.safeParse({ ...validGoal, category }).success).toBe(true);
    });
  });

  it('validates priority enum', () => {
    expect(goalSchema.safeParse({ ...validGoal, priority: 'low' }).success).toBe(true);
    expect(goalSchema.safeParse({ ...validGoal, priority: 'medium' }).success).toBe(true);
    expect(goalSchema.safeParse({ ...validGoal, priority: 'high' }).success).toBe(true);
    expect(goalSchema.safeParse({ ...validGoal, priority: 'urgent' }).success).toBe(false);
  });
});

describe('debtSchema', () => {
  const validDebt = {
    name: 'Credit Card',
    principal: 5000,
    currentBalance: 3000,
    interestRate: 18.5,
    minimumPayment: 150,
    dueDate: 15,
    type: 'credit-card',
    creditor: 'Bank Name',
  };

  it('validates a complete valid debt', () => {
    expect(debtSchema.safeParse(validDebt).success).toBe(true);
  });

  it('validates currentBalance cannot exceed principal', () => {
    const result = debtSchema.safeParse({
      ...validDebt,
      principal: 5000,
      currentBalance: 6000,
    });
    expect(result.success).toBe(false);
  });

  it('validates interest rate range', () => {
    expect(debtSchema.safeParse({ ...validDebt, interestRate: 0 }).success).toBe(true);
    expect(debtSchema.safeParse({ ...validDebt, interestRate: 50 }).success).toBe(true);
    expect(debtSchema.safeParse({ ...validDebt, interestRate: -5 }).success).toBe(false);
    expect(debtSchema.safeParse({ ...validDebt, interestRate: 150 }).success).toBe(false);
  });

  it('validates due date range (1-31)', () => {
    expect(debtSchema.safeParse({ ...validDebt, dueDate: 1 }).success).toBe(true);
    expect(debtSchema.safeParse({ ...validDebt, dueDate: 31 }).success).toBe(true);
    expect(debtSchema.safeParse({ ...validDebt, dueDate: 0 }).success).toBe(false);
    expect(debtSchema.safeParse({ ...validDebt, dueDate: 32 }).success).toBe(false);
  });

  it('validates debt type enum', () => {
    const types = ['credit-card', 'loan', 'mortgage', 'student-loan', 'auto-loan', 'other'];
    types.forEach((type) => {
      expect(debtSchema.safeParse({ ...validDebt, type }).success).toBe(true);
    });
  });
});

describe('shiftSchema', () => {
  const validShift = {
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 30,
    hourlyRate: 25,
  };

  it('validates a complete valid shift', () => {
    expect(shiftSchema.safeParse(validShift).success).toBe(true);
  });

  it('validates time format (HH:MM)', () => {
    expect(shiftSchema.safeParse({ ...validShift, startTime: '09:00' }).success).toBe(true);
    expect(shiftSchema.safeParse({ ...validShift, startTime: '9:00' }).success).toBe(false);
    expect(shiftSchema.safeParse({ ...validShift, startTime: '25:00' }).success).toBe(false);
  });

  it('validates endTime is after startTime', () => {
    const result = shiftSchema.safeParse({
      ...validShift,
      startTime: '17:00',
      endTime: '09:00',
    });
    expect(result.success).toBe(false);
  });

  it('validates break minutes range', () => {
    expect(shiftSchema.safeParse({ ...validShift, breakMinutes: 0 }).success).toBe(true);
    expect(shiftSchema.safeParse({ ...validShift, breakMinutes: 60 }).success).toBe(true);
    expect(shiftSchema.safeParse({ ...validShift, breakMinutes: -10 }).success).toBe(false);
    expect(shiftSchema.safeParse({ ...validShift, breakMinutes: 500 }).success).toBe(false);
  });

  it('validates overtime multiplier range', () => {
    expect(shiftSchema.safeParse({ ...validShift, overtimeMultiplier: 1.5 }).success).toBe(true);
    expect(shiftSchema.safeParse({ ...validShift, overtimeMultiplier: 2.0 }).success).toBe(true);
    expect(shiftSchema.safeParse({ ...validShift, overtimeMultiplier: 0.5 }).success).toBe(false);
    expect(shiftSchema.safeParse({ ...validShift, overtimeMultiplier: 4.0 }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('validates login credentials', () => {
    const credentials = {
      email: 'user@example.com',
      password: 'password123',
    };
    expect(loginSchema.safeParse(credentials).success).toBe(true);
  });

  it('requires valid email', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('requires password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const validSignup = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    terms: true,
  };

  it('validates complete signup data', () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('requires password to match confirmPassword', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      password: 'Password123',
      confirmPassword: 'DifferentPassword123',
    });
    expect(result.success).toBe(false);
  });

  it('validates password complexity', () => {
    // Must have uppercase
    expect(signupSchema.safeParse({ ...validSignup, password: 'password123', confirmPassword: 'password123' }).success).toBe(false);
    
    // Must have lowercase
    expect(signupSchema.safeParse({ ...validSignup, password: 'PASSWORD123', confirmPassword: 'PASSWORD123' }).success).toBe(false);
    
    // Must have number
    expect(signupSchema.safeParse({ ...validSignup, password: 'Password', confirmPassword: 'Password' }).success).toBe(false);
    
    // Must be at least 8 characters
    expect(signupSchema.safeParse({ ...validSignup, password: 'Pass12', confirmPassword: 'Pass12' }).success).toBe(false);
  });

  it('requires terms acceptance', () => {
    const result = signupSchema.safeParse({ ...validSignup, terms: false });
    expect(result.success).toBe(false);
  });

  it('validates name length', () => {
    expect(signupSchema.safeParse({ ...validSignup, name: 'A' }).success).toBe(false);
    expect(signupSchema.safeParse({ ...validSignup, name: 'Ab' }).success).toBe(true);
  });
});

describe('passwordChangeSchema', () => {
  const validChange = {
    currentPassword: 'OldPassword123',
    newPassword: 'NewPassword456',
    confirmPassword: 'NewPassword456',
  };

  it('validates password change data', () => {
    expect(passwordChangeSchema.safeParse(validChange).success).toBe(true);
  });

  it('requires newPassword to match confirmPassword', () => {
    const result = passwordChangeSchema.safeParse({
      ...validChange,
      newPassword: 'NewPassword456',
      confirmPassword: 'DifferentPassword789',
    });
    expect(result.success).toBe(false);
  });

  it('requires newPassword to be different from currentPassword', () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: 'SamePassword123',
      newPassword: 'SamePassword123',
      confirmPassword: 'SamePassword123',
    });
    expect(result.success).toBe(false);
  });

  it('validates new password complexity', () => {
    const weak = {
      currentPassword: 'OldPassword123',
      newPassword: 'weak',
      confirmPassword: 'weak',
    };
    expect(passwordChangeSchema.safeParse(weak).success).toBe(false);
  });
});
