/**
 * @fileoverview BNPL (Buy Now Pay Later) summary component
 * @description Displays summary cards for active BNPL plans, total owed, and next payments
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { formatCurrency } from '../utils/calculations';
import { DashboardCardSkeleton } from '@/shared/SkeletonLoaders';

/**
 * BNPL summary component with statistics cards
 * @param {Object} props - Component props
 * @param {Array<Object>} props.plans - BNPL payment plans
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Summary cards grid
 */


function BNPLSummary({ plans, isLoading }: BNPLSummaryProps) {
    /**
     * Calculate BNPL summary statistics
     */
    const summary = useMemo(() => {
        const activePlans = plans.filter(p => p.status === 'active');
        const totalOwed = activePlans.reduce((sum: number, p: BNPLPlan): number => sum + (p.installment_amount * p.remaining_installments), 0);
        const nextPayments = activePlans
            .sort((a: BNPLPlan, b: BNPLPlan) => new Date(a.next_due_date) - new Date(b.next_due_date))
            .slice(0, 3);

        // Define summary cards without icons, colors, or background colors due to import changes
        const summaryCards = [
            {
                title: "Active Plans",
                value: activePlans.length.toString(),
            },
            {
                title: "Total Owed",
                value: formatCurrency(totalOwed),
            },
            {
                title: "Next Payment",
                // Using toLocaleDateString as 'format' from 'date-fns' is no longer imported
                value: nextPayments[0] ? new Date(nextPayments[0].next_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "None",
            },
            // The "Due This Week" card has been removed as AlertTriangle icon is not imported.
            // To add it back, ensure AlertTriangle is imported and its logic is included.
        ];

        return { activePlans, totalOwed, nextPayments, summaryCards };
    }, [plans]);

    const { summaryCards } = summary;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
            </div>
        );
    }

    /**
     * Get color class for value based on card title
     * @param {string} title - Card title
     * @returns {string} Tailwind color class
     */
    const valueColor = (title) => {
        if (title === "Total Owed") return "text-destructive";
        if (title === "Active Plans") return "text-primary";
        if (title === "Next Payment") return "text-foreground";
        return "text-foreground";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
                <Card key={index} className="border-0 shadow-lg bg-card backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        {/* The icon div has been removed as lucide-react icons are no longer imported */}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${valueColor(card.title)}`}>
                            {card.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Skeleton for BNPL summary card during loading
 * @returns {JSX.Element} Card skeleton
 */
function StatCardSkeleton() {
    return (
        <Card className="border-0 shadow-lg bg-card backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                {/* Skeleton for the CardTitle */}
                <Skeleton className="h-4 w-1/2" />
                {/* A small skeleton could be placed here if an icon placeholder is desired */}
            </CardHeader>
            <CardContent>
                {/* Skeleton for the value */}
                <Skeleton className="h-8 w-3/4" />
            </CardContent>
        </Card>
    );
}

export default React.memo(BNPLSummary);
