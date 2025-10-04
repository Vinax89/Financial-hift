import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Progress } from '@/ui/progress.jsx';
import { Separator } from '@/ui/separator.jsx';

const formatCurrency = (value) => {
    const amount = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(amount)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
};

const snowballProjection = (debts) => {
    const sorted = [...debts].sort(
        (a, b) => (Number(a.balance) || 0) - (Number(b.balance) || 0)
    );
    let snowballExtra = 0;
    const projections = sorted.map((debt) => {
        const balance = Number(debt.balance) || 0;
        const minimum = Number(debt.minimum_payment) || 0;
        const payment = minimum + snowballExtra;
        const months = payment > 0 ? Math.ceil(balance / payment) : 0;
        snowballExtra += minimum;
        return {
            name: debt.name || debt.account_name,
            months
        };
    });
    return projections;
};

export default function DebtSimulator({ debts = [] }) {
    const summary = useMemo(() => {
        const safeDebts = Array.isArray(debts) ? debts : [];
        const totals = safeDebts.reduce(
            (acc, debt) => {
                const balance = typeof debt.balance === 'number' ? debt.balance : parseFloat(debt.balance) || 0;
                const interest = typeof debt.interest_rate === 'number' ? debt.interest_rate : parseFloat(debt.interest_rate) || 0;
                acc.balance += balance;
                acc.interest += balance * (interest / 100);
                return acc;
            },
            { balance: 0, interest: 0 }
        );

        const snowball = snowballProjection(safeDebts);

        return {
            totalBalance: totals.balance,
            estimatedInterest: totals.interest,
            projections: snowball
        };
    }, [debts]);

    return (
        <div className="space-y-4">
            <div>
                <CardHeader className="px-0 pb-2">
                    <CardTitle>Snowball Projection</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <p className="text-sm text-muted-foreground">
                        Pay the smallest balances first to free up cash flow faster.
                    </p>
                </CardContent>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Debt</span>
                    <span className="text-lg font-semibold">{formatCurrency(summary.totalBalance)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Interest</span>
                    <span className="text-lg font-semibold">{formatCurrency(summary.estimatedInterest)}</span>
                </div>
            </div>
            <Separator />
            <div className="space-y-3">
                {summary.projections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Add a debt to see payoff estimates.</p>
                ) : (
                    summary.projections.map((projection) => {
                        const months = projection.months;
                        const progress = months === 0 ? 100 : Math.max(5, Math.min(100, 100 - months * 4));
                        return (
                            <div key={projection.name} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{projection.name}</span>
                                    <span className="text-muted-foreground">{months} months</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
