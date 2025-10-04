import { format, parseISO, isValid, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

// Enhanced date formatting utilities
export const formatCurrency = (amount, options = {}) => {
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

export const formatDate = (date, formatString = 'PPP') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString);
};

export const formatDateTime = (date, formatString = 'PPp') => {
    return formatDate(date, formatString);
};

export const formatTime = (date, formatString = 'p') => {
    return formatDate(date, formatString);
};

export const formatRelativeTime = (date) => {
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

export const calculateShiftDuration = (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) return { hours: 0, minutes: 0 };
    
    const start = typeof startDateTime === 'string' ? parseISO(startDateTime) : startDateTime;
    const end = typeof endDateTime === 'string' ? parseISO(endDateTime) : endDateTime;
    
    if (!isValid(start) || !isValid(end)) return { hours: 0, minutes: 0 };
    
    const totalMinutes = differenceInMinutes(end, start);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, totalHours: totalMinutes / 60 };
};

export const isShiftToday = (shiftDate) => {
    if (!shiftDate) return false;
    
    const shift = typeof shiftDate === 'string' ? parseISO(shiftDate) : shiftDate;
    const today = startOfDay(new Date());
    const shiftDay = startOfDay(shift);
    
    return shiftDay.getTime() === today.getTime();
};

export const isShiftThisWeek = (shiftDate) => {
    if (!shiftDate) return false;
    
    const shift = typeof shiftDate === 'string' ? parseISO(shiftDate) : shiftDate;
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    return shift >= weekStart && shift <= weekEnd;
};

export const getPayPeriodDates = (date, payFrequency = 'biweekly') => {
    const baseDate = typeof date === 'string' ? parseISO(date) : date;
    
    switch (payFrequency) {
        case 'weekly':
            return {
                start: startOfWeek(baseDate),
                end: endOfWeek(baseDate)
            };
        case 'biweekly':
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
        case 'semimonthly':
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

export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return isValid(start) && isValid(end) && start < end;
};

export const getShiftStatus = (shift) => {
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