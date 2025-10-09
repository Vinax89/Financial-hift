/**
 * @fileoverview Financial summary cards component
 * @description Displays key financial metrics in a grid of cards with
 * icons, colors, and loading states
 */

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { Skeleton } from '@/ui/skeleton';
import { DashboardCardSkeleton } from "@/shared/SkeletonLoaders";

/**
 * Financial Summary Cards Component
 * @component
 * @param {Object} props
 * @param {number} props.monthlyIncome - Total income for current month
 * @param {number} props.monthlyExpenses - Total expenses for current month
 * @param {number} props.netIncome - Net income (income - expenses)
 * @param {number} props.totalGoals - Number of active financial goals
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
interface FinancialSummaryProps { [key: string]: any; }`n`nfunction FinancialSummary({ monthlyIncome, monthlyExpenses, netIncome, totalGoals, isLoading }: FinancialSummaryProps) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.abs(amount));
    };

    const summaryCards = [
        {
            title: "Monthly Income",
            value: formatCurrency(monthlyIncome),
            icon: TrendingUp,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            iconBg: "bg-emerald-100"
        },
        {
            title: "Monthly Expenses",
            value: formatCurrency(monthlyExpenses),
            icon: TrendingDown,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            iconBg: "bg-rose-100"
        },
        {
            title: "Net Income",
            value: netIncome >= 0 ? `+${formatCurrency(netIncome)}` : `-${formatCurrency(netIncome)}`,
            icon: DollarSign,
            color: netIncome >= 0 ? "text-emerald-600" : "text-rose-600",
            bgColor: netIncome >= 0 ? "bg-emerald-50" : "bg-rose-50",
            iconBg: netIncome >= 0 ? "bg-emerald-100" : "bg-rose-100"
        },
        {
            title: "Active Goals",
            value: totalGoals.toString(),
            icon: Target,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            iconBg: "bg-blue-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
                <Card key={index} className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.iconBg}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold text-slate-900">
                                {card.value}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default memo(FinancialSummary);