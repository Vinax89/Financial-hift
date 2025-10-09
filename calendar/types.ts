/**
 * @fileoverview TypeScript type definitions for Calendar components
 */

export interface CalendarEvent {
  id: string | number;
  title: string;
  amount: number;
  date: string | Date;
  type: 'income' | 'expense' | 'bill' | 'goal' | 'shift';
  category?: string;
  status?: string;
  [key: string]: any; // Allow additional properties
}

export interface CalendarSettings {
  showWeekends: boolean;
  showIncome: boolean;
  showExpenses: boolean;
  showBills: boolean;
  showGoals: boolean;
  showShifts: boolean;
  [key: string]: boolean;
}

export interface CalendarSettingsProps {
  settings: CalendarSettings;
  onSettingChange: (key: keyof CalendarSettings, value: boolean) => void;
}

export interface CashflowCalendarProps {
  events: CalendarEvent[];
  settings: CalendarSettings;
}

export interface ExportMenuProps {
  events: CalendarEvent[];
}

export interface FiltersToolbarProps {
  filters: Record<string, boolean>;
  onFilterChange: (filter: string, value: boolean) => void;
}

export interface QuickFiltersProps {
  onFilterApply: (filter: string) => void;
}

export interface UnifiedMonthGridProps {
  events: CalendarEvent[];
  settings: CalendarSettings;
}

export interface MonthSummaryProps {
  monthDate: Date;
  events: CalendarEvent[];
}

export interface SafeToSpendProps {
  events: CalendarEvent[];
  monthDate: Date;
}

export interface UpcomingItemsProps {
  events: CalendarEvent[];
  daysAhead?: number;
}
