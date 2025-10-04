import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { ThemedProgress } from '../ui/enhanced-components';
import { DollarSign, TrendingDown, PiggyBank } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function BudgetOverview({ budgets, transactions }) {
    const { totalBudget, totalSpent, remaining, progress } = useMemo(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const currentMonthTransactions = transactions.filter(t => {
            if (!t.date || t.type !== 'expense') return false;
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });

        const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

        const totalBudget = budgets.filter(b => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
                                   .reduce((sum, b) => sum + b.monthly_limit, 0);
        
        const remaining = totalBudget - totalSpent;
        const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return { totalBudget, totalSpent, remaining, progress };
    }, [budgets, transactions]);
    
    return (
        <Card className="bg-card border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-foreground">
                    {format(new Date(), 'MMMM yyyy')} Budget Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</span>
                        <span className="text-muted-foreground">spent of {formatCurrency(totalBudget)}</span>
                    </div>
                    <ThemedProgress value={progress > 100 ? 100 : progress} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center pt-4">
                        <div>
                            <TrendingDown className="mx-auto h-6 w-6 text-rose-500 mb-2" />
                            <p className="text-sm text-muted-foreground">Total Spent</p>
                            <p className="font-semibold text-foreground">{formatCurrency(totalSpent)}</p>
                        </div>
                        <div>
                            <PiggyBank className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className={`font-semibold ${remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {formatCurrency(remaining)}
                            </p>
                        </div>
                        <div>
                            <DollarSign className="mx-auto h-6 w-6 text-amber-500 mb-2" />
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="font-semibold text-foreground">{formatCurrency(totalBudget)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}