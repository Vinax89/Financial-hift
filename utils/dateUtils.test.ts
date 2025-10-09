/**
 * @fileoverview Comprehensive tests for date utility functions
 * @description Tests for all date formatting, shift calculations, and date validation utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
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
} from './dateUtils';

describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
        expect(formatCurrency(1000)).toBe('$1,000');
        expect(formatCurrency(1234.56, { maximumFractionDigits: 2 })).toBe('$1,234.56');
    });

    it('should format negative amounts correctly', () => {
        expect(formatCurrency(-1000)).toBe('$1,000');
        expect(formatCurrency(-1234.56, { maximumFractionDigits: 2 })).toBe('$1,234.56');
    });

    it('should show sign when requested', () => {
        expect(formatCurrency(1000, { showSign: true })).toBe('+$1,000');
        expect(formatCurrency(-1000, { showSign: true })).toBe('-$1,000');
        expect(formatCurrency(0, { showSign: true })).toBe('$0');
    });

    it('should handle zero amounts', () => {
        expect(formatCurrency(0)).toBe('$0');
        expect(formatCurrency(null)).toBe('$0');
        expect(formatCurrency(undefined)).toBe('$0');
    });

    it('should support different currencies', () => {
        const result = formatCurrency(1000, { currency: 'EUR', locale: 'de-DE' });
        expect(result).toContain('1');
        expect(result).toContain('000');
    });

    it('should handle decimal precision', () => {
        expect(formatCurrency(1234.567, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })).toBe('$1,234.57');
    });
});

describe('formatDate', () => {
    it('should format Date objects', () => {
        const date = new Date('2025-01-15');
        const formatted = formatDate(date, 'yyyy-MM-dd');
        expect(formatted).toBe('2025-01-15');
    });

    it('should format ISO strings', () => {
        const formatted = formatDate('2025-01-15', 'yyyy-MM-dd');
        expect(formatted).toBe('2025-01-15');
    });

    it('should return empty string for invalid dates', () => {
        expect(formatDate('invalid')).toBe('');
        expect(formatDate(null)).toBe('');
        expect(formatDate(undefined)).toBe('');
    });

    it('should use default format when not specified', () => {
        const date = new Date('2025-01-15');
        const formatted = formatDate(date);
        expect(formatted).toBeTruthy();
        expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle different format strings', () => {
        const date = new Date('2025-01-15');
        expect(formatDate(date, 'MM/dd/yyyy')).toBe('01/15/2025');
        expect(formatDate(date, 'dd-MM-yyyy')).toBe('15-01-2025');
    });
});

describe('formatRelativeTime', () => {
    beforeEach(() => {
        // Mock current date to 2025-01-15
        vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    it('should return "Today" for same day', () => {
        const today = new Date('2025-01-15T10:00:00');
        expect(formatRelativeTime(today)).toBe('Today');
    });

    it('should return "Yesterday" for previous day', () => {
        const yesterday = new Date('2025-01-14T12:00:00');
        expect(formatRelativeTime(yesterday)).toBe('Yesterday');
    });

    it('should return "Tomorrow" for next day', () => {
        const tomorrow = new Date('2025-01-16T12:00:00');
        expect(formatRelativeTime(tomorrow)).toBe('Tomorrow');
    });

    it('should return days ago for past dates within week', () => {
        const threeDaysAgo = new Date('2025-01-12T12:00:00');
        expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return "In X days" for future dates within week', () => {
        const threeDaysAhead = new Date('2025-01-18T12:00:00');
        expect(formatRelativeTime(threeDaysAhead)).toBe('In 3 days');
    });

    it('should return formatted date for dates beyond a week', () => {
        const longAgo = new Date('2024-12-01T12:00:00');
        const formatted = formatRelativeTime(longAgo);
        expect(formatted).toContain('Dec');
        expect(formatted).toContain('2024');
    });

    it('should handle invalid dates', () => {
        expect(formatRelativeTime('invalid')).toBe('');
        expect(formatRelativeTime(null)).toBe('');
    });
});

describe('calculateShiftDuration', () => {
    it('should calculate hours and minutes correctly', () => {
        const start = new Date('2025-01-15T09:00:00');
        const end = new Date('2025-01-15T17:30:00');
        const duration = calculateShiftDuration(start, end);
        
        expect(duration.hours).toBe(8);
        expect(duration.minutes).toBe(30);
        expect(duration.totalHours).toBe(8.5);
    });

    it('should handle ISO string inputs', () => {
        const duration = calculateShiftDuration(
            '2025-01-15T09:00:00',
            '2025-01-15T17:00:00'
        );
        
        expect(duration.hours).toBe(8);
        expect(duration.minutes).toBe(0);
        expect(duration.totalHours).toBe(8);
    });

    it('should handle overnight shifts', () => {
        const start = new Date('2025-01-15T22:00:00');
        const end = new Date('2025-01-16T06:00:00');
        const duration = calculateShiftDuration(start, end);
        
        expect(duration.hours).toBe(8);
        expect(duration.minutes).toBe(0);
    });

    it('should return zero for invalid dates', () => {
        expect(calculateShiftDuration('invalid', '2025-01-15')).toEqual({
            hours: 0,
            minutes: 0
        });
        expect(calculateShiftDuration(null, null)).toEqual({
            hours: 0,
            minutes: 0
        });
    });

    it('should handle shifts less than an hour', () => {
        const start = new Date('2025-01-15T09:00:00');
        const end = new Date('2025-01-15T09:45:00');
        const duration = calculateShiftDuration(start, end);
        
        expect(duration.hours).toBe(0);
        expect(duration.minutes).toBe(45);
        expect(duration.totalHours).toBe(0.75);
    });
});

describe('isShiftToday', () => {
    beforeEach(() => {
        vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    it('should return true for today\'s date', () => {
        const today = new Date('2025-01-15T09:00:00');
        expect(isShiftToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
        const yesterday = new Date('2025-01-14T09:00:00');
        expect(isShiftToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
        const tomorrow = new Date('2025-01-16T09:00:00');
        expect(isShiftToday(tomorrow)).toBe(false);
    });

    it('should handle ISO strings', () => {
        expect(isShiftToday('2025-01-15T18:00:00')).toBe(true);
        expect(isShiftToday('2025-01-16T09:00:00')).toBe(false);
    });

    it('should return false for invalid dates', () => {
        expect(isShiftToday('invalid')).toBe(false);
        expect(isShiftToday(null)).toBe(false);
    });
});

describe('isShiftThisWeek', () => {
    beforeEach(() => {
        // Wednesday, January 15, 2025
        vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    it('should return true for dates in current week', () => {
        // Sunday to Saturday of the week
        expect(isShiftThisWeek('2025-01-12T09:00:00')).toBe(true); // Sunday
        expect(isShiftThisWeek('2025-01-15T09:00:00')).toBe(true); // Wednesday
        expect(isShiftThisWeek('2025-01-18T09:00:00')).toBe(true); // Saturday
    });

    it('should return false for dates outside current week', () => {
        expect(isShiftThisWeek('2025-01-11T09:00:00')).toBe(false); // Previous Saturday
        expect(isShiftThisWeek('2025-01-19T09:00:00')).toBe(false); // Next Sunday
    });

    it('should handle Date objects', () => {
        const thisWeek = new Date('2025-01-15T09:00:00');
        expect(isShiftThisWeek(thisWeek)).toBe(true);
    });

    it('should return false for invalid dates', () => {
        expect(isShiftThisWeek('invalid')).toBe(false);
        expect(isShiftThisWeek(null)).toBe(false);
    });
});

describe('getPayPeriodDates', () => {
    const testDate = new Date('2025-01-15'); // Wednesday

    it('should calculate weekly pay period', () => {
        const period = getPayPeriodDates(testDate, 'weekly');
        expect(period.start).toBeTruthy();
        expect(period.end).toBeTruthy();
        expect(period.start < period.end).toBe(true);
    });

    it('should calculate biweekly pay period', () => {
        const period = getPayPeriodDates(testDate, 'biweekly');
        expect(period.start).toBeTruthy();
        expect(period.end).toBeTruthy();
        expect(period.start < period.end).toBe(true);
    });

    it('should calculate semimonthly pay period for first half', () => {
        const firstHalf = new Date('2025-01-10');
        const period = getPayPeriodDates(firstHalf, 'semimonthly');
        expect(period.start.getDate()).toBe(1);
        expect(period.end.getDate()).toBe(15);
    });

    it('should calculate semimonthly pay period for second half', () => {
        const secondHalf = new Date('2025-01-20');
        const period = getPayPeriodDates(secondHalf, 'semimonthly');
        expect(period.start.getDate()).toBe(16);
        expect(period.end.getDate()).toBeGreaterThan(27);
    });

    it('should calculate monthly pay period', () => {
        const period = getPayPeriodDates(testDate, 'monthly');
        expect(period.start.getDate()).toBe(1);
        expect(period.end.getDate()).toBeGreaterThan(27);
    });

    it('should default to weekly if frequency is unknown', () => {
        const period = getPayPeriodDates(testDate, 'unknown');
        expect(period.start).toBeTruthy();
        expect(period.end).toBeTruthy();
    });

    it('should handle ISO string dates', () => {
        const period = getPayPeriodDates('2025-01-15', 'weekly');
        expect(period.start).toBeTruthy();
        expect(period.end).toBeTruthy();
    });
});

describe('validateDateRange', () => {
    it('should return true for valid date ranges', () => {
        const start = new Date('2025-01-01');
        const end = new Date('2025-01-31');
        expect(validateDateRange(start, end)).toBe(true);
    });

    it('should return false when start is after end', () => {
        const start = new Date('2025-01-31');
        const end = new Date('2025-01-01');
        expect(validateDateRange(start, end)).toBe(false);
    });

    it('should return false for equal dates', () => {
        const date = new Date('2025-01-15');
        expect(validateDateRange(date, date)).toBe(false);
    });

    it('should handle ISO string inputs', () => {
        expect(validateDateRange('2025-01-01', '2025-01-31')).toBe(true);
        expect(validateDateRange('2025-01-31', '2025-01-01')).toBe(false);
    });

    it('should return false for invalid dates', () => {
        expect(validateDateRange('invalid', '2025-01-31')).toBe(false);
        expect(validateDateRange('2025-01-01', 'invalid')).toBe(false);
        expect(validateDateRange(null, null)).toBe(false);
    });
});

describe('getShiftStatus', () => {
    beforeEach(() => {
        vi.setSystemTime(new Date('2025-01-15T12:00:00'));
    });

    it('should return "cancelled" for cancelled shifts', () => {
        const shift = {
            status: 'cancelled',
            start_datetime: '2025-01-15T09:00:00',
            end_datetime: '2025-01-15T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('cancelled');
    });

    it('should return "no_show" for no-show shifts', () => {
        const shift = {
            status: 'no_show',
            start_datetime: '2025-01-15T09:00:00',
            end_datetime: '2025-01-15T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('no_show');
    });

    it('should return "upcoming" for future shifts', () => {
        const shift = {
            start_datetime: '2025-01-16T09:00:00',
            end_datetime: '2025-01-16T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('upcoming');
    });

    it('should return "completed" for past shifts', () => {
        const shift = {
            start_datetime: '2025-01-14T09:00:00',
            end_datetime: '2025-01-14T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('completed');
    });

    it('should return "in_progress" for ongoing shifts', () => {
        const shift = {
            start_datetime: '2025-01-15T09:00:00',
            end_datetime: '2025-01-15T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('in_progress');
    });

    it('should preserve existing status for scheduled shifts', () => {
        const shift = {
            status: 'confirmed',
            start_datetime: '2025-01-16T09:00:00',
            end_datetime: '2025-01-16T17:00:00'
        };
        expect(getShiftStatus(shift)).toBe('upcoming');
    });
});
