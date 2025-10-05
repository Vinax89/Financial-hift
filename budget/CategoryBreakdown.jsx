import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { ThemedProgress } from '../ui/enhanced-components';
import { Button } from '@/ui/button.jsx';
import { Edit, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

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

export default function CategoryBreakdown({ budgets, transactions, onEdit, onDelete }) {
    const categoryData = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const currentMonthTransactions = transactions.filter(t => {
            if (!t.date || t.type !== 'expense') return false;
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });

        return budgets
            .filter(b => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
            .map(budget => {
                const spent = currentMonthTransactions
                    .filter(t => t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);
                const progress = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;
                return {
                    ...budget,
                    spent,
                    progress,
                    remaining: budget.monthly_limit - spent,
                };
            })
            .sort((a, b) => b.progress - a.progress);
    }, [budgets, transactions]);

    return (
        <Card className="bg-card border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-foreground">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {categoryData.length > 0 ? categoryData.map(cat => (
                        <div key={cat.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-foreground">{categoryLabels[cat.category] || cat.category}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">{formatCurrency(cat.spent)} / {formatCurrency(cat.monthly_limit)}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(cat)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(cat.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                            <ThemedProgress value={cat.progress > 100 ? 100 : cat.progress} />
                            <p className={`text-xs mt-1 text-right ${cat.remaining >= 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                                {formatCurrency(cat.remaining)} {cat.remaining >= 0 ? 'left' : 'over'}
                            </p>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground py-8">No budget categories set for this month. Add a budget to start tracking.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}