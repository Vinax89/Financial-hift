import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Skeleton } from '@/ui/skeleton.jsx';

const formatCurrency = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
};

export default function GoalStats({ goals = [], isLoading }) {
    const stats = useMemo(() => {
        const safeGoals = Array.isArray(goals) ? goals : [];
        const totals = safeGoals.reduce(
            (acc, goal) => {
                const target = typeof goal.target_amount === 'number' ? goal.target_amount : parseFloat(goal.target_amount) || 0;
                const current = typeof goal.current_amount === 'number' ? goal.current_amount : parseFloat(goal.current_amount) || 0;
                acc.target += target;
                acc.current += current;
                if ((goal.status || 'active').toLowerCase() === 'completed') {
                    acc.completed += 1;
                }
                if ((goal.status || 'active').toLowerCase() === 'active') {
                    acc.active += 1;
                }
                return acc;
            },
            { target: 0, current: 0, completed: 0, active: 0 }
        );

        const progress = totals.target > 0 ? Math.min(100, Math.round((totals.current / totals.target) * 100)) : 0;

        return {
            count: safeGoals.length,
            active: totals.active,
            completed: totals.completed,
            progress,
            remaining: Math.max(0, totals.target - totals.current),
            invested: totals.current
        };
    }, [goals]);

    if (isLoading) {
        return (
            <div className="grid md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="border-dashed">
                        <CardHeader>
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Active Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-3xl font-semibold">{stats.active}</div>
                    <p className="text-sm text-muted-foreground">{stats.count} total goals</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Capital In Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-3xl font-semibold">{formatCurrency(stats.invested)}</div>
                    <p className="text-sm text-muted-foreground">{stats.progress}% progress toward targets</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Remaining to Fund</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-3xl font-semibold">{formatCurrency(stats.remaining)}</div>
                    <p className="text-sm text-muted-foreground">{stats.completed} completed goals</p>
                </CardContent>
            </Card>
        </div>
    );
}
