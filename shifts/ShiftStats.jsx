
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Skeleton } from '@/ui/skeleton.jsx';
import { DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns'; // Added isWithinInterval
import { formatCurrency } from '../utils/calculations'; // Moved formatCurrency to a utility file

// StatCard component now only responsible for rendering the actual card content
// It no longer handles its own loading state, that is managed by the parent ShiftStats
const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card className="border-border/30 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold text-foreground`}>
                {value}
            </div>
        </CardContent>
    </Card>
);

// New StatCardSkeleton component to show loading state and prevent layout shifts
function StatCardSkeleton() {
    return (
        <Card className="border-border/30 bg-card/50"> {/* Wrap in Card to maintain consistent layout */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-2/3" /> {/* Skeleton for title */}
                <div className="p-2 rounded-lg bg-muted"> {/* Placeholder for icon background */}
                    <Skeleton className="h-4 w-4" /> {/* Skeleton for icon */}
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/2" /> {/* Skeleton for value */}
            </CardContent>
        </Card>
    );
}

export default function ShiftStats({ shifts, isLoading }) {
    const stats = useMemo(() => {
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

                // Check if shift is within the current week
                // We keep the explicit date comparison as it's functionally equivalent
                if (shiftDate >= weekStart && shiftDate <= weekEnd) {
                    weeklyHours += hours;
                    weeklyPay += pay;
                }
                // Check if shift is within the current month
                // We keep the explicit date comparison as it's functionally equivalent
                if (shiftDate >= monthStart && shiftDate <= monthEnd) {
                    monthlyHours += hours;
                    monthlyPay += pay;
                }
            } catch (e) {
                console.error("Could not parse shift date:", shift.start_datetime);
            }
        });

        return { weeklyHours, weeklyPay, monthlyHours, monthlyPay };
    }, [shifts]);

    const statCards = [
        { title: "Hours This Week", value: `${stats.weeklyHours.toFixed(1)} hrs`, icon: Clock, color: "text-primary", bgColor: "bg-blue-100 dark:bg-blue-900/20" },
        { title: "Pay This Week (Net)", value: formatCurrency(stats.weeklyPay), icon: DollarSign, color: "text-success", bgColor: "bg-emerald-100 dark:bg-emerald-900/20" },
        { title: `Hours in ${format(new Date(), 'MMMM')}`, value: `${stats.monthlyHours.toFixed(1)} hrs`, icon: Calendar, color: "text-primary", bgColor: "bg-purple-100 dark:bg-purple-900/20" },
        { title: `Pay in ${format(new Date(), 'MMMM')} (Net)`, value: formatCurrency(stats.monthlyPay), icon: TrendingUp, color: "text-success", bgColor: "bg-orange-100 dark:bg-orange-900/20" }
    ];

    if (isLoading) {
        return (
            // Render skeletons wrapped in CardContent to maintain consistent layout
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </CardContent>
        );
    }

    return (
        // Render actual cards wrapped in CardContent
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </CardContent>
    );
}
