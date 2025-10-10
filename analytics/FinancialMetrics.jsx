/**
 * @fileoverview Financial metrics dashboard cards
 * @description Displays key financial health indicators including income, spending,
 * savings rate, debt-to-income ratio, goals progress, and emergency fund status
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { DollarSign, Percent, TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';

/**
 * Format currency value for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * Financial Metrics Component
 * @component
 * @param {Object} props
 * @param {Object} [props.data={}] - Financial data (transactions, shifts, debts, goals)
 * @param {boolean} [props.isLoading=false] - Loading state
 * @returns {JSX.Element}
 */
function FinancialMetrics({ data = {}, isLoading = false }) {
    // Ensure we have safe defaults for all data properties
    const {
        transactions = [],
        shifts = [],
        debts = [],
        goals = []
    } = data;

    const metrics = useMemo(() => {
        // Prevent calculations if we're still loading or have no data
        if (isLoading || (transactions.length === 0 && shifts.length === 0 && debts.length === 0 && goals.length === 0)) {
            return { 
                totalIncome: 0, 
                totalSpending: 0, 
                savingsRate: 0, 
                debtToIncome: 0,
                goalProgress: 0,
                emergencyFund: 0
            };
        }

        try {
            // Calculate income from shifts and transactions
            const shiftIncome = shifts.reduce((sum, shift) => sum + (shift.net_pay || 0), 0);
            const transactionIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalIncome = shiftIncome + transactionIncome;

            // Calculate spending
            const totalSpending = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

            // Savings rate
            const netIncome = totalIncome - totalSpending;
            const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

            // Debt-to-income ratio
            const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
            const monthlyDebtPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
            const monthlyIncome = totalIncome / 12; // Rough estimate
            const debtToIncome = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

            // Goal progress
            const activeGoals = goals.filter(g => g.status === 'active');
            const totalGoalTarget = activeGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
            const totalGoalCurrent = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
            const goalProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

            // Emergency fund estimate (3-6 months of expenses)
            const monthlyExpenses = totalSpending / 12;
            const emergencyFund = totalGoalCurrent; // Simplification
            const emergencyFundPercentage = monthlyExpenses > 0 
                ? (emergencyFund / (monthlyExpenses * 3)) * 100 
                : 0;

            return { 
                totalIncome, 
                totalSpending, 
                savingsRate, 
                debtToIncome,
                goalProgress,
                emergencyFund: Math.min(emergencyFundPercentage, 100)
            };
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error calculating financial metrics:', error);
            return { 
                totalIncome: 0, 
                totalSpending: 0, 
                savingsRate: 0, 
                debtToIncome: 0,
                goalProgress: 0,
                emergencyFund: 0
            };
        }
    }, [transactions, shifts, debts, goals, isLoading]);

    const metricCards = [
        { 
            title: "Total Income (YTD)", 
            value: formatCurrency(metrics.totalIncome), 
            icon: TrendingUp, 
            // Use semantic class
            color: "text-income",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        { 
            title: "Total Spending (YTD)", 
            value: formatCurrency(metrics.totalSpending), 
            icon: TrendingDown, 
            color: "text-expense",
            bgColor: "bg-rose-50 dark:bg-rose-900/20"
        },
        { 
            title: "Savings Rate", 
            value: `${metrics.savingsRate.toFixed(1)}%`, 
            icon: PiggyBank, 
            color: metrics.savingsRate >= 20 
                ? "text-success" 
                : metrics.savingsRate >= 10 
                ? "text-warning" 
                : "text-expense",
            bgColor: metrics.savingsRate >= 20 
                ? "bg-emerald-50 dark:bg-emerald-900/20" 
                : metrics.savingsRate >= 10 
                ? "bg-yellow-50 dark:bg-yellow-900/20" 
                : "bg-red-50 dark:bg-red-900/20"
        },
        { 
            title: "Debt-to-Income Ratio", 
            value: `${metrics.debtToIncome.toFixed(1)}%`, 
            icon: CreditCard, 
            color: metrics.debtToIncome <= 20 
                ? "text-success" 
                : metrics.debtToIncome <= 36 
                ? "text-warning" 
                : "text-expense",
            bgColor: metrics.debtToIncome <= 20 
                ? "bg-emerald-50 dark:bg-emerald-900/20" 
                : metrics.debtToIncome <= 36 
                ? "bg-yellow-50 dark:bg-yellow-900/20" 
                : "bg-red-50 dark:bg-red-900/20"
        },
        { 
            title: "Goals Progress", 
            value: `${metrics.goalProgress.toFixed(1)}%`, 
            icon: Percent, 
            color: "text-primary",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        },
        { 
            title: "Emergency Fund", 
            value: `${Math.min(metrics.emergencyFund, 100).toFixed(1)}%`, 
            icon: DollarSign, 
            color: metrics.emergencyFund >= 100 ? "text-success" : "text-warning",
            bgColor: metrics.emergencyFund >= 100 
                ? "bg-emerald-50 dark:bg-emerald-900/20" 
                : "bg-orange-50 dark:bg-orange-900/20"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricCards.map((card, index) => (
                <Card key={index} className="border border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <div className={`text-2xl font-bold ${card.color}`}>
                                {card.value}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default memo(FinancialMetrics);
