/**
 * @fileoverview Shift statistics component showing weekly and monthly totals (TypeScript)
 * @description Displays hours and pay statistics for current week and month
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/calculations';
import { logError } from '@/utils/logger';
import type { Shift } from '@/types/entities';
import type { LucideIcon } from 'lucide-react';

/**
 * Component props
 */
interface ShiftStatsProps {
    shifts: Shift[];
    isLoading?: boolean;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
}

interface ShiftStats {
    weeklyHours: number;
    weeklyPay: number;
    monthlyHours: number;
    monthlyPay: number;
}

/**
 * Individual stat card component
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card className="border-border/30 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-foreground">{value}</div>
        </CardContent>
    </Card>
);

/**
 * Stat card skeleton for loading state
 */
function StatCardSkeleton() {
    return (
        <Card className="border-border/30 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-2/3" />
                <div className="p-2 rounded-lg bg-muted">
                    <Skeleton className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/2" />
            </CardContent>
        </Card>
    );
}

/**
 * Shift statistics component
 */
const ShiftStats: React.FC<ShiftStatsProps> = ({ shifts, isLoading = false }) => {
    const stats = useMemo<ShiftStats>(() => {
        if (!shifts || shifts.length === 0) {
            return { weeklyHours: 0, weeklyPay: 0, monthlyHours: 0, monthlyPay: 0 };
        }

        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        let weeklyHours = 0, weeklyPay = 0, monthlyHours = 0, monthlyPay = 0;

        shifts.forEach(shift => {
            if (!shift.start_datetime) return;
            try {
                const shiftDate = parseISO(shift.start_datetime);
                const hours = shift.actual_hours || shift.scheduled_hours || 0;
                const pay = shift.net_pay || shift.gross_pay || 0;

                if (shiftDate >= weekStart && shiftDate <= weekEnd) {
                    weeklyHours += hours;
                    weeklyPay += pay;
                }
                if (shiftDate >= monthStart && shiftDate <= monthEnd) {
                    monthlyHours += hours;
                    monthlyPay += pay;
                }
            } catch (e) {
                if (import.meta.env.DEV) {
                    logError("Could not parse shift date", e);
                }
            }
        });

        return { weeklyHours, weeklyPay, monthlyHours, monthlyPay };
    }, [shifts]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="This Week - Hours"
                value={`${stats.weeklyHours.toFixed(1)} hrs`}
                icon={Clock}
                color="text-blue-600"
                bgColor="bg-blue-50"
            />
            <StatCard
                title="This Week - Pay"
                value={formatCurrency(stats.weeklyPay)}
                icon={DollarSign}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
            />
            <StatCard
                title="This Month - Hours"
                value={`${stats.monthlyHours.toFixed(1)} hrs`}
                icon={Calendar}
                color="text-purple-600"
                bgColor="bg-purple-50"
            />
            <StatCard
                title="This Month - Pay"
                value={formatCurrency(stats.monthlyPay)}
                icon={TrendingUp}
                color="text-indigo-600"
                bgColor="bg-indigo-50"
            />
        </div>
    );
};

export default React.memo(ShiftStats);
