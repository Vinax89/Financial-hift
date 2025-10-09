/**
 * @fileoverview Budget overview component showing monthly budget summary
 * @description Displays total budget metrics including spent amount, remaining budget,
 * and overall progress with visual indicators
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ThemedProgress } from '@/ui/enhanced-components';
import { TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { Budget, Transaction, BudgetOverviewData, BudgetOverviewProps } from '@/types/financial.types';

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Budget overview component showing monthly summary
 * @component
 * @param {BudgetOverviewProps} props - Component props
 * @returns {JSX.Element} Budget overview display
 */
function BudgetOverview({ budgets, transactions }: BudgetOverviewProps): JSX.Element {
    const now = new Date();

    /**
     * Calculate total budget metrics for current month
     */
    const { totalBudget, totalSpent, remaining, progress } = useMemo<BudgetOverviewData>(() => {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Filter transactions for current month expenses
        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= monthStart && 
                   transactionDate <= monthEnd && 
                   t.type === 'expense';
        });

        // Calculate total spent
        const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Calculate total budget for current month
        const totalBudget = budgets
            .filter(b => b.year === now.getFullYear() && b.month === now.getMonth() + 1)
            .reduce((sum, b) => sum + b.monthly_limit, 0);

        // Calculate remaining and progress
        const remaining = totalBudget - totalSpent;
        const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return {
            totalBudget,
            totalSpent,
            remaining,
            progress
        };
    }, [budgets, transactions, now]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-foreground">
                    {format(now, 'MMMM yyyy')} Budget Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget Progress</span>
                        <span className="font-medium text-foreground">
                            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
                        </span>
                    </div>
                    <ThemedProgress 
                        value={progress > 100 ? 100 : progress} 
                        className="h-3"
                        indicatorColor={progress > 100 ? 'bg-destructive' : 'bg-primary'}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                            <span>Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(totalSpent)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PiggyBank className="h-4 w-4 text-emerald-500" />
                            <span>Remaining</span>
                        </div>
                        <p className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                            {formatCurrency(Math.abs(remaining))}
                        </p>
                        {remaining < 0 && (
                            <p className="text-xs text-destructive">Over budget</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4 text-amber-500" />
                            <span>Total Budget</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(totalBudget)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo<BudgetOverviewProps>(BudgetOverview);
