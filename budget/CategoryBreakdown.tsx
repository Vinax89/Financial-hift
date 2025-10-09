/**
 * @fileoverview Category breakdown component showing budget progress per category
 * @description Displays a list of budget categories with their spending progress, including
 * visual progress bars, edit/delete controls, and spending metrics
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ThemedProgress } from '@/ui/enhanced-components';
import { Button } from '@/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { Budget, Transaction, BudgetWithProgress, CategoryBreakdownProps, CategoryType } from '@/types/financial.types';

/**
 * Category display labels mapping
 */
const categoryLabels: Partial<Record<CategoryType, string>> = {
    food_dining: 'Food & Dining',
    groceries: 'Groceries',
    transportation: 'Transportation',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills_utilities: 'Bills & Utilities',
    healthcare: 'Healthcare',
    education: 'Education',
    travel: 'Travel',
    housing: 'Housing',
    insurance: 'Insurance',
    salary: 'Salary',
    freelance: 'Freelance',
    investment: 'Investment',
    other_income: 'Other Income',
    other_expense: 'Other Expenses'
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Category breakdown component showing budget progress
 * @component
 * @param {CategoryBreakdownProps} props - Component props
 * @returns {JSX.Element} Category breakdown display
 */
function CategoryBreakdown({ budgets, transactions, onEdit, onDelete }: CategoryBreakdownProps): JSX.Element {
    const now = new Date();
    
    /**
     * Calculate spending progress for each budget category
     */
    const categoryData = useMemo<BudgetWithProgress[]>(() => {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Filter transactions for current month expenses
        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= monthStart && 
                   transactionDate <= monthEnd && 
                   t.type === 'expense';
        });

        // Calculate spending for each budget
        return budgets
            .filter(b => b.year === now.getFullYear() && b.month === now.getMonth() + 1)
            .map((budget): BudgetWithProgress => {
                const spent = currentMonthTransactions
                    .filter(t => t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const progress = budget.monthly_limit > 0 
                    ? (spent / budget.monthly_limit) * 100 
                    : 0;
                
                const remaining = budget.monthly_limit - spent;

                return {
                    ...budget,
                    spent,
                    progress,
                    remaining
                };
            })
            .sort((a, b) => b.progress - a.progress);
    }, [budgets, transactions, now]);

    if (categoryData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        No budgets set for this month. Create a budget to start tracking your spending.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-foreground">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {categoryData.map(item => (
                    <div key={item.id} className="space-y-2 p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">
                                {categoryLabels[item.category as CategoryType] || item.category}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(item)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => item.id && onDelete(item.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    disabled={!item.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                {formatCurrency(item.spent)} of {formatCurrency(item.monthly_limit)}
                            </span>
                            <span className={item.remaining < 0 ? 'text-destructive' : 'text-green-600'}>
                                {formatCurrency(Math.abs(item.remaining))} {item.remaining < 0 ? 'over' : 'remaining'}
                            </span>
                        </div>
                        <ThemedProgress 
                            value={Math.min(item.progress, 100)} 
                            className="h-2"
                            indicatorColor={item.progress > 100 ? 'bg-destructive' : 'bg-green-500'}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default React.memo(CategoryBreakdown);
