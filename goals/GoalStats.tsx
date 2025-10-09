/**
 * @fileoverview Goal statistics component displaying aggregate goal metrics
 * @description Shows total active goals, invested capital, and remaining funding with progress
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { DashboardCardSkeleton } from '@/shared/SkeletonLoaders';

/**
 * Format value as USD currency (rounded)
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
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

/**
 * Goal statistics component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.goals=[]] - List of goals
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Goal statistics cards
 */
interface GoalStatsProps { [key: string]: any; }


function GoalStats({ goals = [], isLoading }: GoalStatsProps) {
    /**
     * Calculate aggregate statistics from goals
     */
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
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
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

export default React.memo(GoalStats);
