/**
 * @fileoverview Monthly cashflow calendar view
 * @description Displays income and expenses on a calendar grid with
 * theme-aware styling and today highlighting
 */

import React, { memo } from 'react';
import { Card, CardContent } from '@/ui/card.jsx';
import { CardSkeleton } from '@/shared/SkeletonLoaders';
import { format, isToday, getDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '../theme/ThemeProvider';

/** @constant {string[]} Week day abbreviations */
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format currency value for calendar display
 * @param {number} amount - Amount to format
 * @returns {string|null} Formatted currency or null if zero
 */
const formatCurrency = (amount) => {
    if (amount === 0) return null;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Cashflow Calendar Component
 * @component
 * @param {Object} props
 * @param {Array} props.calendarData - Calendar data with daily income/expense totals
 * @param {Date} props.currentDate - Current month being displayed
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
function CashflowCalendar({ calendarData, currentDate, isLoading }) {
    const { theme } = useTheme();
    
    // Handle cases where calendarData might be empty or not yet loaded
    if (isLoading) {
        return <CardSkeleton />;
    }
    
    const firstDayOfMonth = (calendarData && calendarData.length > 0)
        ? getDay(calendarData[0].date)
        : 0;

    return (
        <Card className="border bg-card">
            <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-transparent rounded-lg" />
                    ))}
                    {(calendarData || []).map(dayData => (
                        <div
                            key={dayData.date.toString()}
                            className={cn(
                                'p-2 border rounded-lg h-24 md:h-28 flex flex-col justify-between transition-all duration-300',
                                'bg-card border-border/30',
                                dayData.hasItems && [
                                  'hover:bg-accent/80 hover:border-primary/30',
                                  'shadow-sm hover:shadow-md'
                                ],
                                !dayData.hasItems && 'opacity-60',
                                isToday(dayData.date) && 'bg-primary/10 border-primary/50'
                            )}
                        >
                            <div className={cn(
                                'font-semibold text-sm',
                                isToday(dayData.date) ? 'text-primary' : 'text-foreground'
                            )}>
                                {format(dayData.date, 'd')}
                            </div>
                            {dayData.hasItems && (
                                 <div className="text-right text-xs space-y-0.5">
                                    {dayData.totalIncome > 0 && (
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                            +{formatCurrency(dayData.totalIncome)}
                                        </p>
                                    )}
                                    {dayData.totalExpenses > 0 && (
                                        <p className="font-bold text-rose-600 dark:text-rose-400 truncate">
                                            -{formatCurrency(dayData.totalExpenses)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(CashflowCalendar);