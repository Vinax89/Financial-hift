/**
 * @fileoverview Weekly income chart displaying gross and net pay from shifts
 * @description Bar chart showing last 8 weeks of income with gradient fills
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '@/shared/SkeletonLoaders';
import { useTheme } from '../theme/ThemeProvider';
import { format, startOfISOWeek, parseISO } from 'date-fns';
import { getChartTheme } from './ChartTheme';
import { logError } from '@/utils/logger';

/**
 * Shift data structure
 */
interface Shift {
  start_datetime?: string;
  gross_pay?: number;
  net_pay?: number;
  [key: string]: any;
}

/**
 * Weekly income data point
 */
interface WeeklyIncomeData {
  name: string;
  Gross: number;
  Net: number;
}

/**
 * Income Chart Props
 */
interface IncomeChartProps {
  shifts: Shift[];
  isLoading?: boolean;
}

/**
 * Format amount as USD currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Weekly income chart component
 * @param {IncomeChartProps} props - Component props
 * @returns {JSX.Element} Income bar chart
 */
function IncomeChart({ shifts, isLoading }: IncomeChartProps): JSX.Element {
    const { theme } = useTheme();
    
    /**
     * Calculate weekly income totals from shifts (last 8 weeks)
     */
    const weeklyIncomeData = useMemo<WeeklyIncomeData[]>(() => {
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
                    logError("Invalid date for shift", e);
                }
            }
            return acc;
        }, {} as Record<string, { gross_pay: number; net_pay: number }>);

        return Object.entries(weeklyTotals)
            .map(([week, totals]) => ({
                name: `Week of ${format(parseISO(week), 'MMM d')}`,
                Gross: totals.gross_pay,
                Net: totals.net_pay,
            }))
            .sort((a, b) => new Date(a.name.replace('Week of ', '')).getTime() - new Date(b.name.replace('Week of ', '')).getTime())
            .slice(-8);
    }, [shifts]);

    if (isLoading) {
        return <ChartSkeleton className="h-[320px]" />;
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
                            tickFormatter={(value: number) => `$${(value/1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: palette.tooltipBg,
                                border: `1px solid ${palette.tooltipBorder}`,
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            }}
                            wrapperStyle={{ outline: 'none' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                            labelStyle={{ color: palette.text, fontWeight: 500 }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '16px' }}
                            iconType="circle"
                        />
                        <Bar dataKey="Gross" fill="url(#grossGradient)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Net" fill="url(#netGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    No income data available
                </div>
            )}
        </div>
    );
}

export default React.memo(IncomeChart);
