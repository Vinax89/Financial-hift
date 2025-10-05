
import React, { useMemo, useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardFooter } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Badge } from '@/ui/badge.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingDown, Calculator, Zap } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import { ThemedCard } from '../ui/enhanced-components';
import { useTheme } from '../theme/ThemeProvider';
import { ChartLoading } from '../ui/loading';

const DEBT_COLORS_LIGHT = ['#ef4444', '#f97316', '#eab308', '#22c588', '#3b82f6', '#8b5cf6', '#ec4899'];
const DEBT_COLORS_DARK = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground p-4 border border-border rounded-lg shadow-lg">
                <p className="font-semibold">{data.name}</p>
                <p className="text-primary">
                    Balance: {formatCurrency(data.value)}
                </p>
                <p className="text-muted-foreground">
                    {data.percentage.toFixed(1)}% of total debt
                </p>
                <p className="text-muted-foreground">
                    APR: {data.apr}%
                </p>
                <p className="text-muted-foreground">
                    Min Payment: {formatCurrency(data.payment)}
                </p>
            </div>
        );
    }
    return null;
};

function DebtVisualizer({ debts }) {
    const { isDark } = useTheme();
    const [viewMode, setViewMode] = useState('pie');
    const DEBT_COLORS = isDark ? DEBT_COLORS_DARK : DEBT_COLORS_LIGHT;

    // Define explicit styles instead of dynamic Tailwind class strings
    const COLOR_STYLES = {
        blue: {
            icon: 'text-blue-600 dark:text-blue-400',
            rowBg: 'bg-blue-500/10',
            title: 'text-blue-700 dark:text-blue-400'
        },
        emerald: {
            icon: 'text-emerald-600 dark:text-emerald-400',
            rowBg: 'bg-emerald-500/10',
            title: 'text-emerald-700 dark:text-emerald-400'
        }
    };

    const debtAnalysis = useMemo(() => {
        if (!debts || debts.length === 0) return null; // This check now handles the loading state as well.

        const validDebts = debts.filter(d => d.balance > 0);
        if (validDebts.length === 0) return null;

        const totalBalance = validDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const totalMinPayments = validDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
        
        const avalanche = [...validDebts].sort((a, b) => b.apr - a.apr);
        const snowball = [...validDebts].sort((a, b) => a.balance - b.balance);

        const pieData = validDebts.map((debt, index) => ({
            name: debt.name,
            value: debt.balance,
            percentage: totalBalance > 0 ? (debt.balance / totalBalance) * 100 : 0,
            color: DEBT_COLORS[index % DEBT_COLORS.length],
            apr: debt.apr,
            payment: debt.minimum_payment
        }));

        const monthlyInterest = validDebts.reduce((sum, debt) => 
            sum + (debt.balance * (debt.apr / 100) / 12), 0
        );
        
        const yearlyInterest = monthlyInterest * 12;

        return {
            totalBalance,
            totalMinPayments,
            monthlyInterest,
            yearlyInterest,
            pieData,
            avalanche,
            snowball,
            averageAPR: totalBalance > 0 ? 
                validDebts.reduce((sum, debt) => sum + (debt.balance * debt.apr), 0) / totalBalance : 0
        };
    }, [debts, DEBT_COLORS]);

    // Check for prop availability before analysis
    if (debts === undefined) { 
        return (
            <ThemedCard className="min-h-[480px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-destructive" />
                        Debt Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
                    <ChartLoading className="w-full border-none" />
                </CardContent>
            </ThemedCard>
        );
    }
    
    if (!debtAnalysis) { // No active debt data or all balances are zero
        return (
            <ThemedCard className="min-h-[480px] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-destructive" />
                        Debt Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">No active debt data</p>
                    <p className="text-sm">Add debt accounts to see your breakdown.</p>
                </CardContent>
            </ThemedCard>
        );
    }

    const StrategyCard = ({ title, description, icon: Icon, debts, badgeText, color }) => {
        const styles = COLOR_STYLES[color] || COLOR_STYLES.blue; // Fallback to blue if color not found
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${styles.icon}`} />
                    <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">{badgeText}</Badge>
                </div>
                <div className="space-y-2">
                    {debts.map((debt, index) => (
                        <div key={debt.id} className={`flex justify-between items-center p-3 rounded-lg ${styles.rowBg}`}>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-sm h-6 w-6 flex items-center justify-center bg-background/50 rounded-full">{index + 1}</span>
                                <div>
                                    <span className="font-medium text-foreground">{debt.name}</span>
                                    <span className="text-sm text-muted-foreground ml-2">{debt.apr}% APR</span>
                                </div>
                            </div>
                            <span className="font-semibold text-foreground">{formatCurrency(debt.balance)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <ThemedCard elevated className="min-h-[480px]">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-destructive" />
                            Debt Breakdown
                        </CardTitle>
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                            {/* Use valid variants: default when active, ghost otherwise */}
                            <Button size="sm" variant={viewMode === 'pie' ? 'default' : 'ghost'} onClick={() => setViewMode('pie')}>Chart</Button>
                            <Button size="sm" variant={viewMode === 'strategies' ? 'default' : 'ghost'} onClick={() => setViewMode('strategies')}>Strategies</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === 'pie' ? (
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            {/* Add generous inner padding and height to prevent collisions */}
                            <div className="w-full px-4 sm:px-6 py-4">
                                <ResponsiveContainer width="100%" height={360}>
                                    <PieChart margin={{ top: 16, right: 24, bottom: 84, left: 24 }}>
                                        <Pie 
                                            data={debtAnalysis.pieData} 
                                            cx="50%" 
                                            cy="48%" 
                                            innerRadius={60} 
                                            outerRadius={90} 
                                            paddingAngle={2} 
                                            dataKey="value" 
                                            nameKey="name"
                                        >
                                            {debtAnalysis.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            layout="horizontal"
                                            iconSize={10}
                                            wrapperStyle={{ paddingTop: 12, fontSize: 12, lineHeight: '16px' }}
                                            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Total Debt Balance</p>
                                    <p className="text-3xl font-bold text-destructive"><span className="sensitive">{formatCurrency(debtAnalysis.totalBalance)}</span></p>
                                </div>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avg. APR</p>
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{debtAnalysis.averageAPR.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Min. Payments</p>
                                        <p className="text-lg font-semibold text-orange-600 dark:text-orange-400"><span className="sensitive">{formatCurrency(debtAnalysis.totalMinPayments)}</span>/mo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            <StrategyCard title="Avalanche Strategy" description="Pay extra toward highest APR" icon={Zap} debts={debtAnalysis.avalanche} badgeText="Saves Most Interest" color="blue" />
                            <StrategyCard title="Snowball Strategy" description="Pay extra toward smallest balance" icon={Calculator} debts={debtAnalysis.snowball} badgeText="Builds Momentum" color="emerald" />
                        </div>
                    )}
                </CardContent>
                {debtAnalysis.monthlyInterest > 50 && (
                    <CardFooter className="bg-orange-500/10 border-t border-orange-500/20 p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-orange-500 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-orange-700 dark:text-orange-300">High Interest Alert</p>
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    You're paying ~<span className="sensitive">{formatCurrency(debtAnalysis.monthlyInterest)}</span>/month (<span className="sensitive">{formatCurrency(debtAnalysis.yearlyInterest)}</span>/year) in interest. Prioritizing high-APR debts could save you money.
                                </p>
                            </div>
                        </div>
                    </CardFooter>
                )}
            </ThemedCard>
        </div>
    );
}

export default React.memo(DebtVisualizer);
