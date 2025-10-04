
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../utils/calculations';
import { Skeleton } from '@/components/ui/skeleton';

// Note: Lucide icons (CreditCard, Calendar, DollarSign, AlertTriangle) and date-fns 'format'
// have been removed from imports as per the provided outline's import section.
// This means the summary cards will no longer display icons, and date formatting
// will use native JavaScript Date methods. The 'Due This Week' card has been removed
// due to the corresponding icon import being omitted.

export default function BNPLSummary({ plans, isLoading }) {
    const summary = useMemo(() => {
        const activePlans = plans.filter(p => p.status === 'active');
        const totalOwed = activePlans.reduce((sum, p) => sum + (p.installment_amount * p.remaining_installments), 0);
        const nextPayments = activePlans
            .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date))
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

    // To stabilize layout and eliminate "bobbing", the loading state renders
    // a structure identical to the non-loading state, but with skeleton components.
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        );
    }

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

// StatCardSkeleton now renders a full Card component to maintain layout stability
// and match the structure of the actual summary cards.
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

// The placeholder function StatCard has been removed as it was not provided with an implementation.
