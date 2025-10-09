/**
 * @fileoverview TypeScript type definitions for Base44 entities
 * @description Common type definitions for financial data models
 */

/**
 * Transaction type
 */
export type TransactionType = 'income' | 'expense';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Transaction entity
 */
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string | Date;
  status: TransactionStatus;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Shift entity for work schedules
 */
export interface Shift {
  id: string;
  title: string;
  start_datetime: string | Date;
  end_datetime: string | Date;
  hourly_rate: number;
  hours_worked?: number;
  gross_pay?: number;
  net_pay?: number;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Financial goal entity
 */
export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | Date;
  category?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Debt account entity
 */
export interface Debt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: number; // Day of month
  type?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Bill entity
 */
export interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: number; // Day of month
  is_recurring: boolean;
  category?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Budget category entity
 */
export interface BudgetCategory {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  month: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * BNPL (Buy Now Pay Later) plan
 */
export interface BNPLPlan {
  id: string;
  merchant: string;
  total_amount: number;
  installment_amount: number;
  remaining_installments: number;
  total_installments: number;
  next_due_date: string | Date;
  provider: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Financial metrics/summary
 */
export interface FinancialMetrics {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  debtToIncomeRatio: number;
}

/**
 * Dashboard data aggregation
 */
export interface DashboardData {
  metrics: FinancialMetrics;
  transactions: Transaction[];
  shifts: Shift[];
  goals: Goal[];
  debts: Debt[];
  bills: Bill[];
  budgets: BudgetCategory[];
  bnplPlans: BNPLPlan[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
