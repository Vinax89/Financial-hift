/**
 * @fileoverview Spending trends pie chart with category breakdown
 * @description Displays current month's spending by category using a pie chart
 * with theme-aware colors and percentage breakdown legend
 */

import React, { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartSkeleton } from '@/shared/SkeletonLoaders';
import { useTheme } from '../theme/ThemeProvider';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getChartTheme } from './ChartTheme';

/**
 * Format currency value for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * User-friendly category labels
 * @constant {Object.<string, string>}
 */
const categoryLabels = {
    food_dining: "Food & Dining",
    groceries: "Groceries", 
    transportation: "Transportation",
    shopping: "Shopping",
    entertainment: "Entertainment",
    bills_utilities: "Bills & Utilities",
    healthcare: "Healthcare",
    education: "Education",
    travel: "Travel",
    housing: "Housing",
    insurance: "Insurance",
    other_expense: "Other"
};

/**
 * Spending Trends Component
 * @component
 * @param {Object} props
 * @param {Array} props.transactions - Transaction history
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
function SpendingTrends({ transactions, isLoading }) {
    const { theme } = useTheme();
    // Memoize the chart theme palette based on the current theme
    const palette = useMemo(() => getChartTheme(theme), [theme]);

    // PIE_COLORS useMemo has been removed as colors are now sourced from getChartTheme

    const spendingData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const currentMonth = new Date();
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const monthlyExpenses = transactions.filter(t => {
            if (!t.date || t.type !== 'expense') return false;
            try {
                const tDate = new Date(t.date);
                return tDate >= monthStart && tDate <= monthEnd;
            } catch (e) {
                return false;
            }
        });

        const categoryTotals = monthlyExpenses.reduce((acc, transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount || 0);
            return acc;
        }, {});

        const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({ // Removed `index` parameter and `color` property assignment from here
                name: categoryLabels[category] || category,
                value: amount,
                percentage: total > 0 ? (amount / total * 100) : 0,
            }))
            .sort((a, b) => b.value - a.value);
            
    }, [transactions]); // Updated dependency array as PIE_COLORS and theme are no longer used for data calculation
    
    if (isLoading) {
        return <ChartSkeleton />;
    }

    return (
        <div className="w-full h-auto">
            {spendingData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    <ResponsiveContainer width="100%" height={260}> {/* Updated height */}
                        <PieChart>
                            <Pie
                                // Map colors from palette to data for rendering
                                data={spendingData.map((d, idx) => ({ ...d, color: palette.pieColors[idx % palette.pieColors.length] }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={88} // Updated outerRadius
                                paddingAngle={2}
                                dataKey="value"
                                isAnimationActive // Added animation prop
                            >
                                {spendingData.map((entry, index) => (
                                    // Use palette colors for cells
                                    <Cell key={`cell-${index}`} fill={palette.pieColors[index % palette.pieColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 12, // Updated borderRadius
                                    color: 'hsl(var(--foreground))',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)' // Added boxShadow
                                }}
                                formatter={(value) => [formatCurrency(value), "Amount"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-2 text-sm">
                        {spendingData.slice(0, 6).map((item, idx) => ( // Changed slice from 5 to 6, added idx
                            <div key={item.name} className="flex items-center justify-between py-1.5"> {/* Updated padding */}
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full" 
                                        // Use palette colors for legend items
                                        style={{ backgroundColor: palette.pieColors[idx % palette.pieColors.length] }}
                                    />
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <div className="font-medium text-foreground">
                                    {item.percentage.toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <p>No spending data for this month.</p>
                </div>
            )}
        </div>
    );
}

export default memo(SpendingTrends);
