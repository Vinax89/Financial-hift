import { useMemo, useCallback } from 'react';
import { calculateShiftPay, calculateDebtPayoff, calculateTaxes, formatCurrency } from '../utils/calculations';

export function useShiftCalculations(shifts, rules) {
    return useMemo(() => {
        if (!Array.isArray(shifts) || !Array.isArray(rules) || rules.length === 0) {
            return { totalGross: 0, totalNet: 0, avgHourly: 0, calculations: [] };
        }
        
        const calculations = shifts.map(shift => calculateShiftPay(shift, rules));
        const totalGross = calculations.reduce((sum, calc) => sum + (calc?.gross_pay || 0), 0);
        const totalNet = calculations.reduce((sum, calc) => sum + (calc?.net_pay || 0), 0);
        const totalHours = shifts.reduce((sum, shift) => sum + (shift.actual_hours || shift.scheduled_hours || 0), 0);
        const avgHourly = totalHours > 0 ? totalGross / totalHours : 0;

        return { totalGross, totalNet, avgHourly, calculations };
    }, [shifts, rules]);
}

export function useDebtCalculations(debts, strategy = 'avalanche', extraPayment = 0) {
    return useMemo(() => {
        if (!Array.isArray(debts) || debts.length === 0) return null;
        return calculateDebtPayoff(debts, strategy, extraPayment);
    }, [debts, strategy, extraPayment]);
}

export function useFinancialMetrics(transactions, shifts, debts, investments, goals) {
    return useMemo(() => {
        // Ensure all inputs are arrays
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        const safeShifts = Array.isArray(shifts) ? shifts : [];
        const safeDebts = Array.isArray(debts) ? debts : [];
        const safeInvestments = Array.isArray(investments) ? investments : [];
        const safeGoals = Array.isArray(goals) ? goals : [];

        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthlyTransactions = safeTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });

        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalDebtBalance = safeDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
        const totalInvestments = safeInvestments.reduce((sum, i) => sum + (i.current_value || 0), 0);
        const totalGoalsProgress = safeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

        const assets = totalInvestments + totalGoalsProgress + Math.max(0, monthlyIncome - monthlyExpenses);
        const liabilities = totalDebtBalance;
        const netWorth = assets - liabilities;

        const monthlyDebtPayments = safeDebts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0);
        const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

        return {
            monthlyIncome,
            monthlyExpenses,
            netIncome: monthlyIncome - monthlyExpenses,
            totalDebtBalance,
            totalInvestments,
            netWorth,
            debtToIncomeRatio,
            savingsRate,
            monthlyDebtPayments,
            totalGoalsProgress
        };
    }, [transactions, shifts, debts, investments, goals]);
}