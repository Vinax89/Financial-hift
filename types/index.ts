/**
 * @fileoverview Core TypeScript type definitions for Financial $hift
 * @description Centralized type definitions for API entities, component props,
 * and shared interfaces used throughout the application
 */

import { ReactNode } from 'react';

// ============================================================================
// API Entity Types
// ============================================================================

/**
 * Transaction entity from Base44 SDK
 */
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string | Date;
  type: 'income' | 'expense';
  tags?: string[];
  recurring?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Budget entity
 */
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  alertThreshold?: number;
  rollover?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Financial Goal entity
 */
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'completed' | 'paused';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Debt entity
 */
export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  creditor?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Bill/Obligation entity
 */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  autopay?: boolean;
  status?: 'pending' | 'paid' | 'overdue';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * BNPL (Buy Now Pay Later) Plan entity
 */
export interface BNPLPlan {
  id: string;
  merchant: string;
  totalAmount: number;
  remainingAmount: number;
  installments: number;
  remainingInstallments: number;
  installmentAmount: number;
  nextPaymentDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: 'active' | 'completed' | 'defaulted';
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Subscription entity
 */
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDate: string;
  frequency: 'monthly' | 'yearly' | 'weekly';
  category: string;
  active: boolean;
  provider?: string;
  renewalDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Shift Rule entity (income/expense scheduling)
 */
export interface ShiftRule {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  category: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Calculated/Derived Types
// ============================================================================

/**
 * Financial metrics calculated from transactions and budgets
 */
export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  budgetUtilization: number;
  categoryBreakdown: Record<string, number>;
}

/**
 * Cashflow forecast data point
 */
export interface CashflowDataPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  projected?: boolean;
}

/**
 * Category spending trend
 */
export interface CategoryTrend {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Base props for all components
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination props
 */
export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Form field error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Card component props
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Filter/Query Types
// ============================================================================

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string | Date;
  endDate: string | Date;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  dateRange?: DateRange;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional
 */
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * Omit multiple keys from type
 */
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;

/**
 * Pick multiple keys from type
 */
export type PickMultiple<T, K extends keyof T> = Pick<T, K>;

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * useLocalStorage hook return type
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

/**
 * useDebounce hook return type
 */
export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
}

/**
 * useFinancialData hook return type
 */
export interface UseFinancialDataReturn {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Gamification Types
// ============================================================================

/**
 * Achievement/Badge
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

/**
 * User level/XP
 */
export interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
}

// ============================================================================
// Chart/Visualization Types
// ============================================================================

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Pie chart data
 */
export interface PieChartData extends ChartDataPoint {
  percentage: number;
}

/**
 * Line chart data
 */
export interface LineChartData {
  date: string;
  value: number;
  label?: string;
}

// ============================================================================
// Export All Types
// ============================================================================

export type {
  ReactNode,
};
