/**
 * @fileoverview Weekly income chart displaying gross and net pay from shifts
 * @description Bar chart showing last 8 weeks of income with gradient fills
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/ui/skeleton.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { format, startOfISOWeek, parseISO } from 'date-fns';
import { getChartTheme } from './ChartTheme';

/**
 * Format amount as USD currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * Weekly income chart component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.shifts - Shift data with income
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Income bar chart
 */
function IncomeChart({ shifts, isLoading }) {
    const { theme } = useTheme();
    
    /**
     * Calculate weekly income totals from shifts (last 8 weeks)
     */
    const weeklyIncomeData = useMemo(() => {
        if (!shifts || shifts.length === 0) return [];

        const weeklyTotals = shifts.reduce((acc, shift) => {
            if (!shift.start_datetime) return acc;
            try {
                const weekStart = format(startOfISOWeek(parseISO(shift.start_datetime)), 'yyyy-MM-dd');
                if (!acc[weekStart]) {
                    acc[weekStart] = { gross_pay: 0, net_pay: 0 };
                }
                acc[weekStart].gross_pay += shift.gross_pay || 0;
                acc[weekStart].net_pay += shift.net_pay || 0;
            } catch (e) {
                if (import.meta.env.DEV) {
                    console.error("Invalid date for shift:", shift);
                }
            }
            return acc;
        }, {});

        return Object.entries(weeklyTotals)
            .map(([week, totals]) => ({
                name: `Week of ${format(parseISO(week), 'MMM d')}`,
                Gross: totals.gross_pay,
                Net: totals.net_pay,
            }))
            .sort((a, b) => new Date(a.name.replace('Week of ', '')) - new Date(b.name.replace('Week of ', '')))
            .slice(-8);
    }, [shifts]);

    if (isLoading) {
        return <Skeleton className="h-[300px] w-full rounded-xl" />;
    }

    const palette = getChartTheme(theme);

    return (
        <div className="w-full h-[320px] rounded-xl">
            {weeklyIncomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyIncomeData} margin={{ top: 16, right: 16, left: -10, bottom: 8 }}>
                        <defs>
                            <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={palette.barColors.gross} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={palette.barColors.gross} stopOpacity={0.55} />
                            </linearGradient>
                            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={palette.barColors.net} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={palette.barColors.net} stopOpacity={0.55} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                        <XAxis 
                            dataKey="name" 
                            stroke={palette.text}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            stroke={palette.text}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                            contentStyle={{
                                background: palette.tooltipBg,
                                border: `1px solid ${palette.tooltipBorder}`,
                                borderRadius: 12,
                                color: 'hsl(var(--foreground))',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                            }}
                            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Gross" name="Gross Pay" fill="url(#grossGradient)" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700} />
                        <Bar dataKey="Net" name="Net Pay" fill="url(#netGradient)" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>No shift data to display for income trends.</p>
                </div>
            )}
        </div>
    );
}

export default React.memo(IncomeChart);
