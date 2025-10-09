/**
 * TypeScript type definitions for Calendar components
 * 
 * @remarks
 * This module provides type definitions for the unified calendar system,
 * including event management, calendar settings, and component props for
 * displaying financial events across different time periods.
 * 
 * @packageDocumentation
 */

/**
 * Represents a financial event on the calendar
 * 
 * @remarks
 * A calendar event can represent various types of financial activities including
 * income, expenses, bills, goals, or work shifts. Events are displayed on the
 * calendar view with appropriate visual styling based on their type.
 * 
 * @example
 * ```typescript
 * const event: CalendarEvent = {
 *   id: '123',
 *   title: 'Rent Payment',
 *   amount: 1500.00,
 *   date: new Date('2025-10-01'),
 *   type: 'bill',
 *   category: 'Housing',
 *   status: 'pending'
 * };
 * ```
 * 
 * @public
 */
export interface CalendarEvent {
  /** Unique identifier for the event */
  id: string | number;
  
  /** Display title of the event */
  title: string;
  
  /** Monetary amount associated with the event */
  amount: number;
  
  /** Date when the event occurs */
  date: string | Date;
  
  /** Type of financial event */
  type: 'income' | 'expense' | 'bill' | 'goal' | 'shift';
  
  /** Optional category for grouping similar events */
  category?: string;
  
  /** Current status of the event (e.g., 'pending', 'completed', 'overdue') */
  status?: string;
  
  /** Allow additional custom properties for extensibility */
  [key: string]: any;
}

/**
 * Calendar display settings configuration
 * 
 * @remarks
 * Controls which types of events are visible on the calendar and whether
 * weekends are displayed. Users can toggle these settings to customize
 * their calendar view.
 * 
 * @example
 * ```typescript
 * const settings: CalendarSettings = {
 *   showWeekends: true,
 *   showIncome: true,
 *   showExpenses: true,
 *   showBills: true,
 *   showGoals: false,
 *   showShifts: false
 * };
 * ```
 * 
 * @public
 */
export interface CalendarSettings {
  /** Whether to display weekend days (Saturday and Sunday) */
  showWeekends: boolean;
  
  /** Whether to display income events */
  showIncome: boolean;
  
  /** Whether to display expense events */
  showExpenses: boolean;
  
  /** Whether to display bill payment events */
  showBills: boolean;
  
  /** Whether to display financial goal events */
  showGoals: boolean;
  
  /** Whether to display work shift events */
  showShifts: boolean;
  
  /** Allow additional boolean settings for future extensions */
  [key: string]: boolean;
}

/**
 * Props for the CalendarSettings component
 * 
 * @remarks
 * Defines properties for the calendar settings popover/dialog that allows
 * users to customize their calendar view preferences.
 * 
 * @public
 */
export interface CalendarSettingsProps {
  /** Current calendar settings configuration */
  settings: CalendarSettings;
  
  /** Callback invoked when a setting is toggled */
  onSettingChange: (key: keyof CalendarSettings, value: boolean) => void;
}

/**
 * Props for the CashflowCalendar component
 * 
 * @remarks
 * Main calendar component that displays financial events in a monthly
 * grid view with customizable display settings.
 * 
 * @public
 */
export interface CashflowCalendarProps {
  /** Array of financial events to display on the calendar */
  events: CalendarEvent[];
  
  /** Display settings controlling which event types are visible */
  settings: CalendarSettings;
}

/**
 * Props for the ExportMenu component
 * 
 * @remarks
 * Provides functionality to export calendar events to various formats
 * (CSV, JSON, PDF, etc.) for external use or backup.
 * 
 * @public
 */
export interface ExportMenuProps {
  /** Events to be included in the export */
  events: CalendarEvent[];
}

/**
 * Props for the FiltersToolbar component
 * 
 * @remarks
 * Toolbar component providing quick access to filter controls for
 * showing/hiding different types of calendar events.
 * 
 * @public
 */
export interface FiltersToolbarProps {
  /** Current state of all available filters */
  filters: Record<string, boolean>;
  
  /** Callback invoked when a filter toggle changes */
  onFilterChange: (filter: string, value: boolean) => void;
}

/**
 * Props for the QuickFilters component
 * 
 * @remarks
 * Provides preset filter combinations for common calendar views
 * (e.g., "Bills Only", "Income & Expenses", "Work Schedule").
 * 
 * @public
 */
export interface QuickFiltersProps {
  /** Callback invoked when a quick filter preset is selected */
  onFilterApply: (filter: string) => void;
}

/**
 * Props for the UnifiedMonthGrid component
 * 
 * @remarks
 * Renders the main calendar grid showing all days of the month with
 * financial events placed on their respective dates.
 * 
 * @public
 */
export interface UnifiedMonthGridProps {
  /** Events to display in the month grid */
  events: CalendarEvent[];
  
  /** Settings controlling grid display and visibility */
  settings: CalendarSettings;
}

/**
 * Props for the MonthSummary component
 * 
 * @remarks
 * Displays summary statistics for the selected month including total
 * income, expenses, bills due, and net cashflow.
 * 
 * @public
 */
export interface MonthSummaryProps {
  /** The month being summarized */
  monthDate: Date;
  
  /** Events occurring in the specified month */
  events: CalendarEvent[];
}

/**
 * Props for the SafeToSpend component
 * 
 * @remarks
 * Calculates and displays the "safe to spend" amount based on upcoming
 * bills and obligations for the current month.
 * 
 * @public
 */
export interface SafeToSpendProps {
  /** Events to consider for safe-to-spend calculation */
  events: CalendarEvent[];
  
  /** Current month date for calculation context */
  monthDate: Date;
}

/**
 * Props for the UpcomingItems component
 * 
 * @remarks
 * Lists upcoming financial events within a specified time window,
 * helping users stay aware of near-term obligations and income.
 * 
 * @public
 */
export interface UpcomingItemsProps {
  /** All events to check for upcoming items */
  events: CalendarEvent[];
  
  /** Number of days to look ahead (default: 7) */
  daysAhead?: number;
}
