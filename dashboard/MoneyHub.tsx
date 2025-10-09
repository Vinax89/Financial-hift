/**
 * @fileoverview Main financial dashboard hub component (TypeScript)
 * @description Displays comprehensive overview of user's financial status including
 * income, expenses, goals, bills, and upcoming shifts with real-time calculations
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Progress } from '@/ui/progress.jsx';
import { Badge } from '@/ui/badge.jsx';
import { 
    TrendingUp, TrendingDown, DollarSign, Target, CreditCard,
    PiggyBank, Calendar, AlertTriangle, Clock, CheckCircle
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import { format, isThisMonth, startOfMonth, endOfMonth } from 'date-fns';
import type { Transaction, Shift, Goal, Debt, Bill, FinancialMetrics } from '@/types/entities';

/**
 * Extended goal interface with progress calculation
 */
interface GoalWithProgress extends Goal {
    progress: number;
}

/**
 * Monthly financial data summary
 */
interface MonthlyData {
    income: number;
    expenses: number;
    net: number;
    transactions: number;
}

/**
 * Props for MoneyHub component
 */
interface MoneyHubProps {
    /** Financial metrics (net worth, ratios, etc.) */
    metrics: FinancialMetrics;
    /** List of transactions */
    transactions: Transaction[];
    /** List of work shifts */
    shifts: Shift[];
    /** List of financial goals */
    goals: Goal[];
    /** List of debt accounts */
    debts: Debt[];
    /** List of bills */
    bills: Bill[];
    /** Callback to refresh data */
    refreshData: () => void;
}

/**
 * Money Hub Dashboard Component
 * 
 * Provides comprehensive financial overview with:
 * - Monthly income/expense summary
 * - Net worth and debt-to-income ratio
 * - Upcoming shifts and bills
 * - Goal progress tracking
 * - Quick action cards with color-coded insights
 * 
 * @component
 * @param {MoneyHubProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function MoneyHub({ 
    metrics, 
    transactions, 
    shifts, 
    goals, 
    debts, 
    bills, 
    refreshData 
}: MoneyHubProps): JSX.Element {
    const monthlyData = useMemo<MonthlyData>(() => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        
        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd;
        });

        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return { 
            income, 
            expenses, 
            net: income - expenses, 
            transactions: monthlyTransactions.length 
        };
    }, [transactions]);

    const upcomingBills = useMemo(() => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return bills.filter(bill => {
            const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.due_date);
            return dueDate <= nextWeek && dueDate >= today;
        }).slice(0, 3);
    }, [bills]);

    const upcomingShifts = useMemo(() => {
        const now = new Date();
        return shifts
            .filter(shift => new Date(shift.start_datetime) > now)
            .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
            .slice(0, 3);
    }, [shifts]);

    const goalProgress = useMemo<GoalWithProgress[]>(() => {
        return goals.map(goal => ({
            ...goal,
            progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
        })).slice(0, 3);
    }, [goals]);

    return (
        <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Monthly Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{formatCurrency(monthlyData.income)}</div>
                        <p className="text-xs text-slate-600 mt-1">{monthlyData.transactions} transactions</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-rose-50 to-rose-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Monthly Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700">{formatCurrency(monthlyData.expenses)}</div>
                        <p className="text-xs text-slate-600 mt-1">
                            {monthlyData.net >= 0 ? '+' : ''}{formatCurrency(monthlyData.net)} left
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Net Worth</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.netWorth >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                            {formatCurrency(metrics.netWorth)}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Total assets - liabilities</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Debt-to-Income</CardTitle>
                        <CreditCard className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.debtToIncomeRatio < 30 ? 'text-green-700' : 'text-amber-700'}`}>
                            {formatPercentage(metrics.debtToIncomeRatio)}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                            {metrics.debtToIncomeRatio < 30 ? 'Healthy ratio' : 'Room for improvement'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Sections */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upcoming Items */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Coming Up
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Next Shifts
                            </h4>
                            {upcomingShifts.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingShifts.map((shift) => (
                                        <div key={shift.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{shift.title}</p>
                                                <p className="text-xs text-slate-600">
                                                    {format(new Date(shift.start_datetime), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">{shift.hours_worked || 0}h</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming shifts scheduled</p>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Bills Due Soon
                            </h4>
                            {upcomingBills.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingBills.map((bill) => (
                                        <div key={bill.id} className="flex justify-between items-center p-2 bg-rose-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{bill.name}</p>
                                                <p className="text-xs text-slate-600">Due: {bill.due_date}th</p>
                                            </div>
                                            <Badge variant="destructive">{formatCurrency(bill.amount)}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No bills due in the next week</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Goals Progress */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Goal Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {goalProgress.length > 0 ? (
                            goalProgress.map((goal) => (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm">{goal.name}</p>
                                            <p className="text-xs text-slate-600">
                                                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={goal.progress >= 100 ? "default" : goal.progress >= 50 ? "secondary" : "outline"}
                                        >
                                            {Math.round(goal.progress)}%
                                        </Badge>
                                    </div>
                                    <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <PiggyBank className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No financial goals set yet</p>
                                <Button variant="outline" size="sm" className="mt-2">Add Goal</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default memo(MoneyHub);
