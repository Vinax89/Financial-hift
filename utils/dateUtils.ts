/**
 * @fileoverview Enhanced date and currency formatting utilities
 * @description Comprehensive date manipulation and formatting functions using date-fns
 */

import { 
  format, 
  parseISO, 
  isValid, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  subDays, 
  differenceInDays, 
  differenceInMinutes 
} from 'date-fns';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSign?: boolean;
}

/**
 * Pay frequency types
 */
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

/**
 * Shift status types
 */
export type ShiftStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'scheduled';

/**
 * Shift duration result
 */
export interface ShiftDuration {
  hours: number;
  minutes: number;
  totalHours: number;
}

/**
 * Date range for pay periods
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Shift object structure
 */
export interface Shift {
  start_datetime: string;
  end_datetime: string;
  status?: ShiftStatus;
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, options: CurrencyFormatOptions = {}): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSign = false
  } = options;

  const value = Math.abs(amount || 0);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }
  
  return formatted;
};

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date with the specified format string
 * @param date - Date to format (string or Date object)
 * @param formatString - date-fns format string (default: 'PPP')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: string | Date | null | undefined, formatString: string = 'PPP'): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

/**
 * Format a date with time
 * @param date - Date to format
 * @param formatString - date-fns format string (default: 'PPp')
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date | null | undefined, formatString: string = 'PPp'): string => {
  return formatDate(date, formatString);
};

/**
 * Format time only
 * @param date - Date to format
 * @param formatString - date-fns format string (default: 'p')
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date | null | undefined, formatString: string = 'p'): string => {
  return formatDate(date, formatString);
};

/**
 * Format date relative to now (e.g., "Today", "Yesterday", "2 days ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const now = new Date();
  const diffInDays = differenceInDays(now, dateObj);
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays === -1) return 'Tomorrow';
  if (diffInDays > 0 && diffInDays <= 7) return `${diffInDays} days ago`;
  if (diffInDays < 0 && diffInDays >= -7) return `In ${Math.abs(diffInDays)} days`;
  
  return formatDate(dateObj, 'MMM d, yyyy');
};

// ============================================================================
// Shift/Work Duration Calculations
// ============================================================================

/**
 * Calculate duration between start and end datetime
 * @param startDateTime - Start date/time
 * @param endDateTime - End date/time
 * @returns Object with hours, minutes, and totalHours
 */
export const calculateShiftDuration = (
  startDateTime: string | Date | null | undefined,
  endDateTime: string | Date | null | undefined
): ShiftDuration => {
  if (!startDateTime || !endDateTime) return { hours: 0, minutes: 0, totalHours: 0 };
  
  const start = typeof startDateTime === 'string' ? parseISO(startDateTime) : startDateTime;
  const end = typeof endDateTime === 'string' ? parseISO(endDateTime) : endDateTime;
  
  if (!isValid(start) || !isValid(end)) return { hours: 0, minutes: 0, totalHours: 0 };
  
  const totalMinutes = differenceInMinutes(end, start);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalHours: totalMinutes / 60 };
};

/**
 * Check if a shift is scheduled for today
 * @param shiftDate - The shift date to check
 * @returns True if shift is today
 */
export const isShiftToday = (shiftDate: string | Date | null | undefined): boolean => {
  if (!shiftDate) return false;
  
  const shift = typeof shiftDate === 'string' ? parseISO(shiftDate) : shiftDate;
  const today = startOfDay(new Date());
  const shiftDay = startOfDay(shift);
  
  return shiftDay.getTime() === today.getTime();
};

/**
 * Check if a shift is scheduled for this week
 * @param shiftDate - The shift date to check
 * @returns True if shift is this week
 */
export const isShiftThisWeek = (shiftDate: string | Date | null | undefined): boolean => {
  if (!shiftDate) return false;
  
  const shift = typeof shiftDate === 'string' ? parseISO(shiftDate) : shiftDate;
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  
  return shift >= weekStart && shift <= weekEnd;
};

// ============================================================================
// Pay Period Calculations
// ============================================================================

/**
 * Get the start and end dates for a pay period
 * @param date - Reference date within the pay period
 * @param payFrequency - Pay frequency type
 * @returns Object with start and end dates
 */
export const getPayPeriodDates = (
  date: string | Date,
  payFrequency: PayFrequency = 'biweekly'
): DateRange => {
  const baseDate = typeof date === 'string' ? parseISO(date) : date;
  
  switch (payFrequency) {
    case 'weekly':
      return {
        start: startOfWeek(baseDate),
        end: endOfWeek(baseDate)
      };
      
    case 'biweekly': {
      // Assume pay period starts on Sunday every other week
      const weekStart = startOfWeek(baseDate);
      const weekNumber = Math.floor(differenceInDays(weekStart, new Date(2024, 0, 7)) / 7);
      const isEvenWeek = weekNumber % 2 === 0;
      
      if (isEvenWeek) {
        return {
          start: weekStart,
          end: endOfDay(addDays(weekStart, 13))
        };
      } else {
        return {
          start: subDays(weekStart, 7),
          end: endOfDay(addDays(weekStart, 6))
        };
      }
    }
      
    case 'semimonthly': {
      const day = baseDate.getDate();
      if (day <= 15) {
        return {
          start: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
          end: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15)
        };
      } else {
        return {
          start: new Date(baseDate.getFullYear(), baseDate.getMonth(), 16),
          end: endOfMonth(baseDate)
        };
      }
    }
      
    case 'monthly':
      return {
        start: startOfMonth(baseDate),
        end: endOfMonth(baseDate)
      };
      
    default:
      return {
        start: startOfWeek(baseDate),
        end: endOfWeek(baseDate)
      };
  }
};

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Validate that a date range is valid (start before end)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if range is valid
 */
export const validateDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): boolean => {
  if (!startDate || !endDate) return false;
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return isValid(start) && isValid(end) && start < end;
};

/**
 * Get the current status of a shift based on current time
 * @param shift - Shift object with start/end datetime
 * @returns Current shift status
 */
export const getShiftStatus = (shift: Shift): ShiftStatus => {
  const now = new Date();
  const start = parseISO(shift.start_datetime);
  const end = parseISO(shift.end_datetime);
  
  if (shift.status === 'cancelled' || shift.status === 'no_show') {
    return shift.status;
  }
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'in_progress';
  
  return shift.status || 'scheduled';
};

// ============================================================================
// Default Export
// ============================================================================

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  calculateShiftDuration,
  isShiftToday,
  isShiftThisWeek,
  getPayPeriodDates,
  validateDateRange,
  getShiftStatus
};
