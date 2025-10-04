
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/ui/skeleton.jsx';
import { useTheme } from '../theme/ThemeProvider';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { getChartTheme } from './ChartTheme';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function MonthlyComparison({ transactions, shifts, isLoading }) {
    const { theme } = useTheme();

    // The lineColors useMemo is removed as its functionality is now handled by getChartTheme
    
    const monthlyData = useMemo(() => {
        if (!transactions || !shifts) return [];

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(new Date(), i);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            
            const monthShifts = shifts.filter(shift => {
                if (!shift.start_datetime) return false;
                try {
                    const shiftDate = parseISO(shift.start_datetime);
                    return shiftDate >= monthStart && shiftDate <= monthEnd;
                } catch(e) { return false; }
            });
            const shiftIncome = monthShifts.reduce((sum, shift) => sum + (shift.net_pay || 0), 0);
            
            const monthTransactions = transactions.filter(t => {
                if (!t.date) return false;
                try {
                    const tDate = new Date(t.date);
                    return tDate >= monthStart && tDate <= monthEnd;
                } catch(e) { return false; }
            });
            
            const transactionIncome = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            
            const totalIncome = shiftIncome + transactionIncome;
            const netIncome = totalIncome - expenses;
            
            months.push({
                name: format(monthDate, 'MMM yy'),
                Income: totalIncome,
                Expenses: expenses,
                Net: netIncome,
            });
        }
        
        return months;
    }, [transactions, shifts]);

    if (isLoading) {
        return <Skeleton className="h-[350px] w-full rounded-xl" />;
    }

    const palette = getChartTheme(theme);

    return (
        <div className="h-[360px]">
            {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 16, right: 16, left: -10, bottom: 8 }}>
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
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                            contentStyle={{
                                background: palette.tooltipBg,
                                border: `1px solid ${palette.tooltipBorder}`,
                                borderRadius: 12,
                                color: 'hsl(var(--foreground))',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                            }}
                            formatter={(value) => [formatCurrency(value), '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Line type="monotone" dataKey="Income" stroke={palette.lineColors.income} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} isAnimationActive animationDuration={700}/>
                        <Line type="monotone" dataKey="Expenses" stroke={palette.lineColors.expenses} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} isAnimationActive animationDuration={700}/>
                        <Line type="monotone" dataKey="Net" stroke={palette.lineColors.net} strokeWidth={2.5} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} isAnimationActive animationDuration={700}/>
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Insufficient data for monthly comparison.</p>
                </div>
            )}
        </div>
    );
}
