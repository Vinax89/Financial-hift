/**
 * @fileoverview Comprehensive financial type definitions
 * @description Shared type definitions for budgets, transactions, reports, and analytics
 */

/**
 * Transaction types
 */
export type TransactionType = 'income' | 'expense';

/**
 * Budget and transaction categories
 */
export type CategoryType =
  | 'food_dining'
  | 'groceries'
  | 'transportation'
  | 'shopping'
  | 'entertainment'
  | 'bills_utilities'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'housing'
  | 'insurance'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other_income'
  | 'other_expense';

/**
 * Category option for form selects
 */
export interface CategoryOption {
  value: CategoryType;
  label: string;
}

/**
 * Transaction record
 */
export interface Transaction {
  id: string | number;
  amount: number;
  date: string; // ISO date string
  description?: string;
  category: CategoryType;
  type: TransactionType;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Budget record for monthly category limits
 */
export interface Budget {
  id?: string | number;
  category: CategoryType;
  monthly_limit: number;
  year: number;
  month: number; // 1-12
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Budget form data (for creating/editing budgets)
 */
export interface BudgetFormData {
  category: CategoryType | '';
  monthly_limit: number | string;
  year: number;
  month: number;
}

/**
 * Budget with calculated spending data
 */
export interface BudgetWithProgress extends Budget {
  spent: number;
  progress: number; // 0-100+
  remaining: number;
}

/**
 * Budget overview summary data
 */
export interface BudgetOverviewData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  progress: number; // 0-100+
}

/**
 * Financial report types
 */
export type ReportType = 'cash_flow' | 'income_statement' | 'balance_sheet';

/**
 * Report period types
 */
export type ReportPeriod = 'month' | 'quarter' | 'year' | 'custom';

/**
 * Cash flow item
 */
export interface CashFlowItem {
  description: string;
  amount: number;
}

/**
 * Cash flow section (Operating, Investing, Financing)
 */
export interface CashFlowSection {
  items: CashFlowItem[];
  total: number;
}

/**
 * Cash flow report data
 */
export interface CashFlowData {
  period: string;
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  netCashFlow: number;
}

/**
 * Income/Expense category item
 */
export interface CategoryItem {
  category: string;
  amount: number;
}

/**
 * Income statement data
 */
export interface IncomeStatementData {
  period: string;
  income: CategoryItem[];
  expenses: CategoryItem[];
  netIncome: number;
}

/**
 * Asset or liability item
 */
export interface BalanceSheetItem {
  name: string;
  value: number;
}

/**
 * Balance sheet data
 */
export interface BalanceSheetData {
  date: string;
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  netWorth: number;
}

/**
 * Financial metrics for analytics
 */
export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  averageMonthlySpending: number;
  topSpendingCategory: {
    category: CategoryType;
    amount: number;
  };
  budgetUtilization: number; // percentage
}

/**
 * Chart data point for time-series
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Category trend data
 */
export interface CategoryTrendData {
  category: CategoryType;
  label: string;
  data: ChartDataPoint[];
  total: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Monthly comparison data
 */
export interface MonthlyComparisonData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  year: number;
}

/**
 * KPI (Key Performance Indicator) data
 */
export interface KPIData {
  label: string;
  value: number;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
  icon?: string;
  color?: string;
}

/**
 * Spending forecast data
 */
export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

/**
 * Sankey diagram node
 */
export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

/**
 * Sankey diagram link
 */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

/**
 * Sankey diagram data
 */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * Chart theme configuration
 */
export interface ChartTheme {
  colors: {
    primary: string;
    secondary: string;
    income: string;
    expense: string;
    accent: string[];
  };
  grid: {
    color: string;
    strokeDasharray?: string;
  };
  tooltip: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
  axis: {
    color: string;
    fontSize: number;
  };
}

/**
 * Component props types
 */

/**
 * Props for budget form component
 */
export interface BudgetFormProps {
  budget: Budget | null;
  onSubmit: (data: Budget) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Props for category breakdown component
 */
export interface CategoryBreakdownProps {
  budgets: Budget[];
  transactions: Transaction[];
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string | number) => void | Promise<void>;
}

/**
 * Props for budget overview component
 */
export interface BudgetOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
}

/**
 * Props for report components
 */
export interface ReportComponentProps {
  transactions: Transaction[];
  dateRange: DateRange;
  period: ReportPeriod;
}

/**
 * Props for chart components
 */
export interface ChartComponentProps {
  data: ChartDataPoint[] | MonthlyComparisonData[] | any[];
  theme?: ChartTheme;
  height?: number;
  className?: string;
}

/**
 * Props for financial metrics component
 */
export interface FinancialMetricsProps {
  transactions: Transaction[];
  budgets: Budget[];
  dateRange?: DateRange;
}
