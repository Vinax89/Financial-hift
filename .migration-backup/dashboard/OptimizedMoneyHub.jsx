/**
 * @fileoverview Performance-optimized main dashboard hub
 * @description Enhanced MoneyHub with React.memo optimizations, memoized calculations,
 * and themed components for better performance with large datasets
 */

import React, { useMemo } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { useFinancialMetrics } from '../hooks/useOptimizedCalculations';
import { ThemedCard, ThemedProgress } from '../ui/enhanced-components';
import { format, addDays, startOfToday } from 'date-fns';
import { EmptyState } from '../ui/empty-state';

/**
 * Memoized metric card component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.value - Formatted value to display
 * @param {string} props.subtitle - Subtitle text
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.colorClass - Tailwind color class
 * @returns {JSX.Element}
 */
const MetricCard = React.memo(({ title, value, subtitle, icon: Icon, colorClass }) => (
    <ThemedCard>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${colorClass}`}>
                <span className="sensitive">{value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
    </ThemedCard>
));
MetricCard.displayName = 'MetricCard';

/**
 * Memoized upcoming item component (shift or bill)
 * @param {Object} props
 * @param {Object} props.item - Item data (shift or bill)
 * @param {string} props.type - Item type ('shift' or 'bill')
 * @returns {JSX.Element}
 */
const UpcomingItem = React.memo(({ item, type }) => {
    const isShift = type === 'shift';
    const dueDate = isShift ? new Date(item.start_datetime) : new Date(new Date().getFullYear(), new Date().getMonth(), item.due_date);

    return (
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
            <div>
                <p className="font-medium text-sm">{item.title || item.name}</p>
                <p className="text-xs text-muted-foreground">
                    {isShift ? format(dueDate, 'eee, MMM d') : `Due: ${format(dueDate, 'MMM d')}`}
                </p>
            </div>
            <Badge variant={isShift ? 'secondary' : 'destructive'}>
                {isShift ? `${item.scheduled_hours}h` : <span className="sensitive">{formatCurrency(item.amount)}</span>}
            </Badge>
        </div>
    );
});
UpcomingItem.displayName = 'UpcomingItem';

/**
 * Memoized goal progress component
 * @param {Object} props
 * @param {Object} props.goal - Goal object with current and target amounts
 * @returns {JSX.Element}
 */
const GoalProgress = React.memo(({ goal }) => {
    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    const isCompleted = progress >= 100;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-medium text-sm">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                        <span className="sensitive">{formatCurrency(goal.current_amount)}</span> / <span className="sensitive">{formatCurrency(goal.target_amount)}</span>
                    </p>
                </div>
                <Badge variant={isCompleted ? "success" : "default"}>
                    {Math.round(progress)}%
                </Badge>
            </div>
            <ThemedProgress value={Math.min(progress, 100)} />
        </div>
    );
});
GoalProgress.displayName = 'GoalProgress';

/**
 * Optimized Money Hub Component
 * @component
 * @description Performance-optimized dashboard with memoized sub-components
 * @param {Object} props
 * @param {Array} props.transactions - Transaction history
 * @param {Array} props.shifts - Work shifts with pay data
 * @param {Array} props.goals - Financial goals
 * @param {Array} props.bills - Bill obligations
 * @param {Object} props.metrics - Optional pre-calculated metrics
 * @returns {JSX.Element}
 */
const OptimizedMoneyHub = ({ transactions, shifts, goals, bills, metrics: externalMetrics }) => {
    const internalMetrics = useFinancialMetrics(transactions || [], shifts || [], [], [], goals || []);
    const metrics = externalMetrics || internalMetrics;
    
    // Ensure all required metrics have fallback values
    const safeMetrics = {
        netWorth: metrics.netWorth || 0,
        debtToIncomeRatio: metrics.debtToIncomeRatio || 0,
        ...metrics
    };
    
    const upcomingItems = useMemo(() => {
        const today = startOfToday();
        const nextWeek = addDays(today, 7);
        
        const upcomingShifts = (shifts || [])
            .filter(shift => {
                try {
                    const shiftDate = new Date(shift.start_datetime);
                    return shiftDate >= today && shiftDate <= nextWeek;
                } catch { return false; }
            })
            .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
            .slice(0, 3);
            
        const upcomingBills = (bills || [])
            .filter(bill => {
                const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.due_date);
                return dueDate >= today && dueDate <= nextWeek;
            })
            .sort((a, b) => a.due_date - b.due_date)
            .slice(0, 3);
            
        return { shifts: upcomingShifts, bills: upcomingBills };
    }, [shifts, bills]);

    const topGoals = useMemo(() => (goals || []).slice(0, 3), [goals]);

    const monthlyData = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthlyTransactions = (transactions || [])
            .filter(t => {
                const tDate = new Date(t.date);
                return tDate >= monthStart && tDate <= monthEnd;
            });
        const transactionIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const monthlyShiftIncome = (shifts || [])
            .filter(shift => {
                try {
                    const shiftDate = new Date(shift.start_datetime || shift.date);
                    return shiftDate >= monthStart && shiftDate <= monthEnd;
                } catch {
                    return false;
                }
            })
            .reduce((sum, shift) => {
                const netPay = Number(shift?.net_pay);
                const grossPay = Number(shift?.gross_pay);
                if (!Number.isFinite(netPay) && !Number.isFinite(grossPay)) {
                    return sum;
                }
                return sum + (Number.isFinite(netPay) ? netPay : grossPay);
            }, 0);
        // We assume shift income is not already represented within transactions to avoid double counting.
        const income = transactionIncome + monthlyShiftIncome;
        const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
        return { income, expenses, net: income - expenses, transactionCount: monthlyTransactions.length, shiftIncome: monthlyShiftIncome };
    }, [transactions, shifts]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Use semantic color classes for consistency */}
                <MetricCard title="Monthly Income" value={formatCurrency(monthlyData.income)} subtitle={`${monthlyData.transactionCount} transactions`} icon={TrendingUp} colorClass="text-income" />
                <MetricCard title="Monthly Expenses" value={formatCurrency(monthlyData.expenses)} subtitle={`${monthlyData.net >= 0 ? '+' : ''}${formatCurrency(monthlyData.net)} net flow`} icon={TrendingDown} colorClass="text-expense" />
                <MetricCard title="Net Worth" value={formatCurrency(safeMetrics.netWorth)} subtitle="Assets - Liabilities" icon={DollarSign} colorClass={safeMetrics.netWorth >= 0 ? 'text-success' : 'text-expense'} />
                <MetricCard title="Debt-to-Income" value={`${safeMetrics.debtToIncomeRatio.toFixed(1)}%`} subtitle={safeMetrics.debtToIncomeRatio < 30 ? 'Healthy' : 'Needs attention'} icon={Target} colorClass={safeMetrics.debtToIncomeRatio < 30 ? 'text-success' : 'text-warning'} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <ThemedCard>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />Coming Up Next 7 Days</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Next Shifts</h4>
                            <div className="space-y-2">
                                {upcomingItems.shifts.length > 0 ? (
                                    upcomingItems.shifts.map((s) => <UpcomingItem key={s.id} item={s} type="shift" />)
                                ) : <p className="text-sm text-muted-foreground italic">No upcoming shifts scheduled.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-muted-foreground" />Bills Due Soon</h4>
                            <div className="space-y-2">
                                {upcomingItems.bills.length > 0 ? (
                                    upcomingItems.bills.map((b) => <UpcomingItem key={b.id} item={b} type="bill" />)
                                ) : <p className="text-sm text-muted-foreground italic">No bills due in the next week.</p>}
                            </div>
                        </div>
                    </CardContent>
                </ThemedCard>

                <ThemedCard>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />Goal Progress</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {topGoals.length > 0 ? (
                            topGoals.map((goal) => <GoalProgress key={goal.id} goal={goal} />)
                        ) : (
                            <EmptyState
                                icon={Target}
                                title="No Goals Set"
                                description="Set a financial goal to start tracking your progress."
                                className="p-4 bg-transparent border-none"
                            />
                        )}
                    </CardContent>
                </ThemedCard>
            </div>
        </div>
    );
};

export default React.memo(OptimizedMoneyHub);
