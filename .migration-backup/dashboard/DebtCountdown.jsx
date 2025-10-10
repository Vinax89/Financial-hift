/**
 * @fileoverview Debt payoff countdown and scenario planner
 * @description Shows debt freedom timeline with different payment scenarios
 * using avalanche method (highest APR first) and calculates interest savings
 */

import React, { useMemo, memo } from 'react';
import { Progress } from '@/ui/progress';
import { Badge } from '@/ui/badge';
import { Calendar, Target, Zap } from 'lucide-react';
import { formatCurrency, calculateDebtPayoff } from '../utils/calculations';
import { format, addMonths } from 'date-fns';

/**
 * Debt Countdown Component
 * @component
 * @param {Object} props
 * @param {Array} props.debts - List of debt accounts with balances and APR
 * @returns {JSX.Element}
 */
function DebtCountdown({ debts }) {
    const debtAnalysis = useMemo(() => {
        if (!debts || debts.length === 0) return null;
        
        const activeDebts = debts.filter(d => d.balance > 0);
        if (activeDebts.length === 0) return null;

        const totalBalance = activeDebts.reduce((sum, debt) => sum + debt.balance, 0);
        const totalMinPayments = activeDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
        
        // Calculate payoff scenarios
        const minimumOnlyPayoff = calculateDebtPayoff(activeDebts, 'avalanche', 0);
        const extraHundredPayoff = calculateDebtPayoff(activeDebts, 'avalanche', 100);
        const extraFiveHundredPayoff = calculateDebtPayoff(activeDebts, 'avalanche', 500);

        // Find the highest APR debt (focus debt)
        const focusDebt = activeDebts.reduce((highest, debt) => 
            debt.apr > highest.apr ? debt : highest
        );

        return {
            totalBalance,
            totalMinPayments,
            focusDebt,
            minimumOnlyPayoff,
            extraHundredPayoff,
            extraFiveHundredPayoff,
            activeDebtCount: activeDebts.length
        };
    }, [debts]);

    if (!debtAnalysis) {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">Debt Free!</span>
                </div>
                <p className="text-sm text-green-600">You have no outstanding debt balances.</p>
            </div>
        );
    }

    const scenarios = [
        {
            label: 'Minimum Payments',
            payoff: debtAnalysis.minimumOnlyPayoff,
            color: 'bg-slate-200',
            textColor: 'text-slate-700'
        },
        {
            label: '+$100/month',
            payoff: debtAnalysis.extraHundredPayoff,
            color: 'bg-blue-200',
            textColor: 'text-blue-700'
        },
        {
            label: '+$500/month',
            payoff: debtAnalysis.extraFiveHundredPayoff,
            color: 'bg-emerald-200',
            textColor: 'text-emerald-700'
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-slate-900">Debt Freedom Timeline</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                    {debtAnalysis.activeDebtCount} accounts
                </Badge>
            </div>

            <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-900">Focus Debt</span>
                    </div>
                    <div className="text-sm">
                        <div className="flex justify-between">
                            <span className="text-orange-700">{debtAnalysis.focusDebt.name}</span>
                            <span className="font-semibold">{debtAnalysis.focusDebt.apr}% APR</span>
                        </div>
                        <div className="mt-1 text-orange-800">
                            Balance: {formatCurrency(debtAnalysis.focusDebt.balance)}
                        </div>
                    </div>
                </div>

                {scenarios.map((scenario, index) => {
                    const monthsSaved = debtAnalysis.minimumOnlyPayoff.total_months - scenario.payoff.total_months;
                    const interestSaved = debtAnalysis.minimumOnlyPayoff.total_interest - scenario.payoff.total_interest;
                    const debtFreeDate = addMonths(new Date(), scenario.payoff.total_months);

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">{scenario.label}</span>
                                <span className={`text-sm font-semibold ${scenario.textColor}`}>
                                    {format(debtFreeDate, 'MMM yyyy')}
                                </span>
                            </div>
                            <div className="relative">
                                <Progress 
                                    value={Math.min(((120 - scenario.payoff.total_months) / 120) * 100, 100)} 
                                    className="h-2"
                                />
                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                    <span className="text-xs font-medium text-slate-600">
                                        {scenario.payoff.total_months} months
                                    </span>
                                </div>
                            </div>
                            {index > 0 && (
                                <div className="text-xs text-slate-600 flex justify-between">
                                    <span>Save {monthsSaved} months</span>
                                    <span>Save {formatCurrency(interestSaved)} interest</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-xs text-slate-500 mt-3 p-2 bg-slate-50 rounded">
                <strong>Tip:</strong> Using the avalanche method (highest APR first) for calculations. 
                Your focus debt has the highest interest rate at {debtAnalysis.focusDebt.apr}%.
            </div>
        </div>
    );
}

export default memo(DebtCountdown);
