/**
 * @fileoverview Zod validation schemas for all forms
 * @description Centralized validation schemas with custom error messages
 * and field-level validation rules
 */

import { z } from 'zod';

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Common reusable schema parts
 */
export const commonSchemas = {
  // Positive number (amounts, prices, etc.)
  positiveNumber: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).positive('Amount must be positive'),

  // Non-negative number (quantities, balances)
  nonNegativeNumber: z.number({
    required_error: 'Value is required',
    invalid_type_error: 'Value must be a number',
  }).min(0, 'Value cannot be negative'),

  // Email
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  // Date string (ISO format)
  dateString: z.string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),

  // Description/notes (1-500 chars)
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),

  // Name field (1-100 chars)
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),

  // Category
  category: z.string()
    .min(1, 'Category is required'),

  // Notes (optional, max 1000 chars)
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
};

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

/**
 * Transaction validation schema
 * Used for creating/editing transactions
 */
export const transactionSchema = z.object({
  description: commonSchemas.description,
  
  amount: commonSchemas.positiveNumber,
  
  type: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
    invalid_type_error: 'Type must be either income or expense',
  }),
  
  category: commonSchemas.category,
  
  date: commonSchemas.dateString,
  
  notes: commonSchemas.notes,
  
  tags: z.array(z.string()).optional(),
  
  // Optional recurring transaction settings
  isRecurring: z.boolean().optional(),
  
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
}).refine(
  (data) => {
    // If recurring, frequency must be provided
    if (data.isRecurring && !data.recurringFrequency) {
      return false;
    }
    return true;
  },
  {
    message: 'Recurring frequency is required for recurring transactions',
    path: ['recurringFrequency'],
  }
);

/**
 * Quick transaction schema (minimal fields)
 * For fast entry
 */
export const quickTransactionSchema = z.object({
  description: commonSchemas.description,
  amount: commonSchemas.positiveNumber,
  type: z.enum(['income', 'expense']),
  category: commonSchemas.category,
});

// ============================================================================
// BUDGET SCHEMAS
// ============================================================================

/**
 * Budget validation schema
 */
export const budgetSchema = z.object({
  name: commonSchemas.name,
  
  amount: commonSchemas.positiveNumber,
  
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    required_error: 'Budget period is required',
  }),
  
  category: commonSchemas.category,
  
  startDate: commonSchemas.dateString,
  
  endDate: commonSchemas.dateString.optional(),
  
  rollover: z.boolean().default(false),
  
  alertThreshold: z.number()
    .min(0, 'Alert threshold cannot be negative')
    .max(100, 'Alert threshold cannot exceed 100%')
    .optional(),
}).refine(
  (data) => {
    // End date must be after start date
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Budget category schema
 */
export const budgetCategorySchema = z.object({
  name: commonSchemas.name,
  limit: commonSchemas.positiveNumber,
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  icon: z.string().optional(),
});

// ============================================================================
// GOAL SCHEMAS
// ============================================================================

/**
 * Financial goal validation schema
 */
export const goalSchema = z.object({
  name: commonSchemas.name,
  
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  
  targetAmount: commonSchemas.positiveNumber,
  
  currentAmount: commonSchemas.nonNegativeNumber.optional().default(0),
  
  deadline: commonSchemas.dateString,
  
  category: z.enum([
    'savings',
    'debt',
    'investment',
    'emergency',
    'purchase',
    'other',
  ]).default('savings'),
  
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  
  isActive: z.boolean().default(true),
  
  monthlyContribution: z.number()
    .min(0, 'Monthly contribution cannot be negative')
    .optional(),
}).refine(
  (data) => {
    // Current amount cannot exceed target amount
    if (data.currentAmount && data.targetAmount) {
      return data.currentAmount <= data.targetAmount;
    }
    return true;
  },
  {
    message: 'Current amount cannot exceed target amount',
    path: ['currentAmount'],
  }
).refine(
  (data) => {
    // Deadline must be in the future
    const deadline = new Date(data.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline >= today;
  },
  {
    message: 'Deadline must be today or in the future',
    path: ['deadline'],
  }
);

// ============================================================================
// DEBT SCHEMAS
// ============================================================================

/**
 * Debt validation schema
 */
export const debtSchema = z.object({
  name: commonSchemas.name,
  
  principal: commonSchemas.positiveNumber,
  
  currentBalance: z.number({
    required_error: 'Current balance is required',
    invalid_type_error: 'Current balance must be a number',
  }).min(0, 'Current balance cannot be negative'),
  
  interestRate: z.number({
    required_error: 'Interest rate is required',
    invalid_type_error: 'Interest rate must be a number',
  })
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
  
  minimumPayment: commonSchemas.positiveNumber,
  
  dueDate: z.number()
    .int('Due date must be a whole number')
    .min(1, 'Due date must be between 1 and 31')
    .max(31, 'Due date must be between 1 and 31'),
  
  type: z.enum([
    'credit-card',
    'loan',
    'mortgage',
    'student-loan',
    'auto-loan',
    'other',
  ]),
  
  creditor: z.string()
    .min(1, 'Creditor name is required')
    .max(100, 'Creditor name cannot exceed 100 characters'),
  
  notes: commonSchemas.notes,
  
  payoffTarget: commonSchemas.dateString.optional(),
}).refine(
  (data) => {
    // Current balance cannot exceed principal
    return data.currentBalance <= data.principal;
  },
  {
    message: 'Current balance cannot exceed original principal',
    path: ['currentBalance'],
  }
);

/**
 * Debt payment schema
 */
export const debtPaymentSchema = z.object({
  debtId: z.string().min(1, 'Debt ID is required'),
  
  amount: commonSchemas.positiveNumber,
  
  date: commonSchemas.dateString,
  
  type: z.enum(['minimum', 'extra', 'full']).default('minimum'),
  
  notes: commonSchemas.notes,
});

// ============================================================================
// SHIFT/PAYCHECK SCHEMAS
// ============================================================================

/**
 * Work shift validation schema
 */
export const shiftSchema = z.object({
  date: commonSchemas.dateString,
  
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  
  breakMinutes: z.number()
    .int('Break minutes must be a whole number')
    .min(0, 'Break minutes cannot be negative')
    .max(480, 'Break cannot exceed 8 hours')
    .default(0),
  
  hourlyRate: commonSchemas.positiveNumber,
  
  location: z.string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  
  notes: commonSchemas.notes,
  
  overtimeMultiplier: z.number()
    .min(1, 'Overtime multiplier must be at least 1x')
    .max(3, 'Overtime multiplier cannot exceed 3x')
    .optional()
    .default(1.5),
}).refine(
  (data) => {
    // End time must be after start time
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

/**
 * Subscription validation schema
 */
export const subscriptionSchema = z.object({
  name: commonSchemas.name,
  
  amount: commonSchemas.positiveNumber,
  
  billingCycle: z.enum(['monthly', 'yearly', 'quarterly']),
  
  nextBillingDate: commonSchemas.dateString,
  
  category: commonSchemas.category,
  
  isActive: z.boolean().default(true),
  
  reminderDays: z.number()
    .int('Reminder days must be a whole number')
    .min(0, 'Reminder days cannot be negative')
    .max(30, 'Reminder days cannot exceed 30')
    .optional()
    .default(3),
  
  notes: commonSchemas.notes,
});

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  
  email: commonSchemas.email,
  
  currency: z.string()
    .length(3, 'Currency code must be 3 characters')
    .default('USD'),
  
  timezone: z.string().optional(),
  
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  
  theme: z.enum(['light', 'dark', 'oled']).default('light'),
  
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    budgetAlerts: z.boolean().default(true),
    billReminders: z.boolean().default(true),
  }).optional(),
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: commonSchemas.email,
  
  password: z.string()
    .min(1, 'Password is required'),
  
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  email: commonSchemas.email,
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  
  terms: z.boolean()
    .refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
);

/**
 * Password reset validation schema
 */
export const passwordResetSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export default {
  // Transactions
  transactionSchema,
  quickTransactionSchema,
  
  // Budgets
  budgetSchema,
  budgetCategorySchema,
  
  // Goals
  goalSchema,
  
  // Debts
  debtSchema,
  debtPaymentSchema,
  
  // Shifts
  shiftSchema,
  
  // Subscriptions
  subscriptionSchema,
  
  // User
  userProfileSchema,
  
  // Auth
  loginSchema,
  signupSchema,
  passwordResetSchema,
  passwordChangeSchema,
  
  // Common
  commonSchemas,
};
