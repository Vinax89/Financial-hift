/**
 * @fileoverview Comprehensive input validation and security utilities
 * @description Validation functions for transactions, shifts, goals, budgets with TypeScript type safety
 */

import { z, ZodSchema } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Validation result with field-level errors
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

/**
 * Generic validation result from Zod
 */
export interface ZodValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Transaction validation input
 */
export interface TransactionInput {
  title?: string;
  amount: number;
  category?: string;
  type?: string;
  date: string | Date;
  notes?: string;
}

/**
 * Shift validation input
 */
export interface ShiftInput {
  id?: string;
  title?: string;
  start_datetime: string | Date;
  end_datetime: string | Date;
  scheduled_hours?: number;
}

/**
 * Existing shift for overlap checking
 */
export interface ExistingShift {
  id: string;
  title: string;
  start_datetime: string | Date;
  end_datetime: string | Date;
}

/**
 * Goal validation input
 */
export interface GoalInput {
  title?: string;
  target_amount: number;
  current_amount: number;
  target_date: string | Date;
}

/**
 * Budget validation input
 */
export interface BudgetInput {
  category?: string;
  monthly_limit: number;
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags, javascript: protocols, and event handlers
 * 
 * @param input - Input to sanitize
 * @returns Sanitized string or original input if not string
 */
export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input !== 'string') return input;
  
  let sanitized = input.replace(/[<>]/g, ''); // Remove potential HTML tags

  // Remove javascript: protocols (repeat for full sanitization)
  let prev: string;
  do {
    prev = sanitized;
    sanitized = sanitized.replace(/javascript:/gi, '');
  } while (sanitized !== prev);

  // Remove event handlers (repeat for full sanitization)
  do {
    prev = sanitized;
    sanitized = sanitized.replace(/on\w+=/gi, '');
  } while (sanitized !== prev);

  return sanitized.trim();
};

// ============================================================================
// Basic Validators
// ============================================================================

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @returns True if valid amount between 0 and 1M
 */
export const validateCurrency = (amount: number | string): boolean => {
  const num = parseFloat(amount.toString());
  return !isNaN(num) && num >= 0 && num <= 1000000; // Max $1M
};

/**
 * Validate date string or object
 * @param dateString - Date to validate
 * @returns True if valid date between 2020 and 10 years in future
 */
export const validateDate = (dateString: string | Date): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const maxFutureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000 * 10)); // 10 years
  
  return !isNaN(date.getTime()) && 
         date >= new Date('2020-01-01') && 
         date <= maxFutureDate;
};

// ============================================================================
// Transaction Validation
// ============================================================================

/**
 * Validate transaction data
 * @param transaction - Transaction data to validate
 * @returns Validation result with errors
 */
export const validateTransaction = (transaction: TransactionInput): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!transaction.title?.trim()) {
    errors.title = 'Transaction description is required';
  } else if (transaction.title.length > 200) {
    errors.title = 'Description must be less than 200 characters';
  }
  
  if (!validateCurrency(transaction.amount)) {
    errors.amount = 'Valid amount between $0 and $1,000,000 is required';
  }
  
  if (!transaction.category) {
    errors.category = 'Category is required';
  }
  
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.type = 'Valid transaction type is required';
  }
  
  if (!validateDate(transaction.date)) {
    errors.date = 'Valid date is required';
  }
  
  if (transaction.notes && transaction.notes.length > 500) {
    errors.notes = 'Notes must be less than 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// Shift Validation
// ============================================================================

/**
 * Validate shift data and check for overlaps
 * @param shift - Shift data to validate
 * @param existingShifts - Array of existing shifts to check for overlaps
 * @returns Validation result with errors
 */
export const validateShift = (
  shift: ShiftInput,
  existingShifts: ExistingShift[] = []
): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!shift.title?.trim()) {
    errors.title = 'Shift title is required';
  }
  
  if (!validateDate(shift.start_datetime)) {
    errors.start_datetime = 'Valid start date/time is required';
  }
  
  if (!validateDate(shift.end_datetime)) {
    errors.end_datetime = 'Valid end date/time is required';
  }
  
  if (new Date(shift.start_datetime) >= new Date(shift.end_datetime)) {
    errors.end_datetime = 'End time must be after start time';
  }
  
  const hours = shift.scheduled_hours || 0;
  if (hours < 0 || hours > 24) {
    errors.scheduled_hours = 'Hours must be between 0 and 24';
  }
  
  // BUG-002 FIX: Check for shift overlaps
  if (existingShifts && existingShifts.length > 0) {
    const startTime = new Date(shift.start_datetime).getTime();
    const endTime = new Date(shift.end_datetime).getTime();
    
    const overlappingShift = existingShifts.find(existingShift => {
      // Skip comparing with itself
      if (shift.id && existingShift.id === shift.id) return false;
      
      const existingStart = new Date(existingShift.start_datetime).getTime();
      const existingEnd = new Date(existingShift.end_datetime).getTime();
      
      // Check if times overlap
      return (
        (startTime >= existingStart && startTime < existingEnd) ||
        (endTime > existingStart && endTime <= existingEnd) ||
        (startTime <= existingStart && endTime >= existingEnd)
      );
    });
    
    if (overlappingShift) {
      errors.overlap = `Shift overlaps with existing shift: ${overlappingShift.title}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// Goal Validation
// ============================================================================

/**
 * Validate goal data
 * @param goal - Goal data to validate
 * @returns Validation result with errors
 */
export const validateGoal = (goal: GoalInput): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!goal.title?.trim()) {
    errors.title = 'Goal title is required';
  }
  
  if (!validateCurrency(goal.target_amount) || goal.target_amount <= 0) {
    errors.target_amount = 'Valid target amount greater than $0 is required';
  }
  
  if (goal.current_amount < 0 || goal.current_amount > goal.target_amount) {
    errors.current_amount = 'Current amount must be between $0 and target amount';
  }
  
  if (!validateDate(goal.target_date)) {
    errors.target_date = 'Valid target date is required';
  }
  
  if (new Date(goal.target_date) <= new Date()) {
    errors.target_date = 'Target date must be in the future';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// Budget Validation
// ============================================================================

/**
 * Validate budget data
 * @param budget - Budget data to validate
 * @returns Validation result with errors
 */
export const validateBudget = (budget: BudgetInput): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!budget.category) {
    errors.category = 'Budget category is required';
  }
  
  if (!validateCurrency(budget.monthly_limit) || budget.monthly_limit <= 0) {
    errors.monthly_limit = 'Valid monthly limit greater than $0 is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// Rate Limiter
// ============================================================================

/**
 * Rate limiter for API calls
 * Prevents abuse by limiting number of requests per time window
 */
export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requests: Map<string, number[]>;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed for identifier
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns True if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Get current request count for identifier
   * @param identifier - Unique identifier
   * @returns Number of recent requests
   */
  getRequestCount(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    return userRequests.filter(time => time > windowStart).length;
  }
}

// ============================================================================
// Generic Zod Validation
// ============================================================================

/**
 * Generic data validation function using Zod schemas
 * Provides type-safe validation with detailed error messages
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag, data, or errors
 * 
 * @example
 * ```typescript
 * import { z } from 'zod';
 * 
 * const schema = z.object({
 *   email: z.string().email(),
 *   age: z.number().min(18)
 * });
 * 
 * const result = validateData(schema, { email: 'test@example.com', age: 25 });
 * if (result.success) {
 *   console.log(result.data); // Type-safe data
 * } else {
 *   console.log(result.errors); // Field-level errors
 * }
 * ```
 */
export const validateData = <T>(
  schema: ZodSchema<T>,
  data: unknown
): ZodValidationResult<T> => {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // Convert Zod errors to field-level error object
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        errors[field] = issue.message;
      });
      
      return {
        success: false,
        errors,
      };
    }
    
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      errors: { _form: (error as Error).message || 'Validation failed' },
    };
  }
};

// ============================================================================
// Common Zod Schemas
// ============================================================================

/**
 * Transaction schema for Zod validation
 */
export const transactionSchema = z.object({
  title: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().min(0).max(1000000, 'Amount must be between $0 and $1M'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Type must be income or expense' }) }),
  date: z.string().or(z.date()),
  notes: z.string().max(500, 'Notes too long').optional(),
});

/**
 * Goal schema for Zod validation
 */
export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  target_amount: z.number().min(0.01, 'Target amount must be greater than $0'),
  current_amount: z.number().min(0, 'Current amount must be positive'),
  target_date: z.string().or(z.date()),
}).refine(
  data => data.current_amount <= data.target_amount,
  { message: 'Current amount cannot exceed target amount', path: ['current_amount'] }
);

/**
 * Budget schema for Zod validation
 */
export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthly_limit: z.number().min(0.01, 'Monthly limit must be greater than $0'),
});
