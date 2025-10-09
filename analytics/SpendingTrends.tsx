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
 * Transaction data structure
 */
interface Transaction {
  date?: string;
  type: 'income' | 'expense';
  category?: string;
  amount: number;
  [key: string]: any;
}

/**
 * Spending data point for pie chart
 */
interface SpendingData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

/**
 * Spending Trends Props
 */
interface SpendingTrendsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

/**
 * Format currency value for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * User-friendly category labels
 */
const categoryLabels: Record<string, string> = {
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
 * @param {SpendingTrendsProps} props - Component props
 * @returns {JSX.Element} Spending trends pie chart
 */
function SpendingTrends({ transactions, isLoading }: SpendingTrendsProps): JSX.Element {
  const { theme } = useTheme();
  const palette = useMemo(() => getChartTheme(theme), [theme]);

  const spendingData = useMemo<SpendingData[]>(() => {
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

    const categoryTotals: Record<string, number> = monthlyExpenses.reduce((acc, transaction) => {
      const category = transaction.category || 'other_expense';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(transaction.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: categoryLabels[category] || category,
        value: amount,
        percentage: total > 0 ? (amount / total * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
      
  }, [transactions]);
  
  if (isLoading) {
    return <ChartSkeleton className="h-[300px]" />;
  }

  return (
    <div className="w-full h-auto">
      {spendingData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={spendingData.map((d, idx) => ({ ...d, color: palette.pieColors[idx % palette.pieColors.length] }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={palette.pieColors[index % palette.pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                }}
                formatter={(value: number) => [formatCurrency(value), "Amount"]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-2 text-sm">
            {spendingData.slice(0, 6).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
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
