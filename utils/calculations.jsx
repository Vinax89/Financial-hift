// Core financial calculation utilities with optimized algorithms
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';

// Memoization for expensive calculations
const calculationCache = new Map();
const getCacheKey = (data) => JSON.stringify(data);

export const formatCurrency = (amount, options = {}) => {
    const defaultOptions = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options
    };
    
    return new Intl.NumberFormat('en-US', defaultOptions).format(amount || 0);
};

export const formatPercentage = (value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
};

export const calculateShiftPay = (shift, rules) => {
    if (!shift || !rules || rules.length === 0) return { gross_pay: 0, net_pay: 0 };
    
    const cacheKey = getCacheKey({ shift, rules: rules[0]?.id });
    if (calculationCache.has(cacheKey)) {
        return calculationCache.get(cacheKey);
    }

    const activeRule = rules.find(r => r.active) || rules[0];
    const hours = shift.actual_hours || shift.scheduled_hours || 0;
    const baseRate = activeRule.base_hourly_rate;
    
    let grossPay = 0;
    let overtimePay = 0;
    let differentialPay = 0;
    const differentialsApplied = [];

    // Base pay calculation
    const regularHours = Math.min(hours, activeRule.overtime_threshold || 40);
    const overtimeHours = Math.max(0, hours - (activeRule.overtime_threshold || 40));
    
    grossPay = regularHours * baseRate;
    
    // Overtime calculation
    if (overtimeHours > 0) {
        overtimePay = overtimeHours * baseRate * (activeRule.overtime_multiplier || 1.5);
        grossPay += overtimePay;
    }

    // Apply differentials
    if (activeRule.differentials && shift.tags) {
        activeRule.differentials.forEach(diff => {
            if (shift.tags.includes(diff.type)) {
                let diffAmount = 0;
                
                if (diff.is_percentage) {
                    diffAmount = grossPay * (diff.amount / 100);
                } else {
                    diffAmount = hours * diff.amount;
                }
                
                differentialPay += diffAmount;
                differentialsApplied.push({
                    name: diff.name,
                    amount: diffAmount,
                    hours: hours,
                    rate: diff.amount
                });
            }
        });
    }

    grossPay += differentialPay;

    // Simplified tax calculation (could be enhanced)
    const taxRate = 0.25; // Federal + State + FICA estimated
    const netPay = grossPay * (1 - taxRate);

    const result = {
        gross_pay: Math.round(grossPay * 100) / 100,
        net_pay: Math.round(netPay * 100) / 100,
        base_pay: regularHours * baseRate,
        overtime_pay: overtimePay,
        differential_pay: differentialPay,
        differentials_applied: differentialsApplied,
        tax_withholding: grossPay - netPay
    };

    calculationCache.set(cacheKey, result);
    return result;
};

export const calculateDebtPayoff = (debts, strategy = 'avalanche', extraPayment = 0) => {
    if (!debts || debts.length === 0) return null;

    const cacheKey = getCacheKey({ debts: debts.map(d => ({ id: d.id, balance: d.balance, apr: d.apr, minimum_payment: d.minimum_payment })), strategy, extraPayment });
    if (calculationCache.has(cacheKey)) {
        return calculationCache.get(cacheKey);
    }

    const sortedDebts = [...debts].sort((a, b) => {
        return strategy === 'avalanche' 
            ? b.apr - a.apr  // Highest interest first
            : a.balance - b.balance;  // Lowest balance first
    });

    let totalInterest = 0;
    let maxMonths = 0;
    let snowball = extraPayment;
    
    const schedule = sortedDebts.map((debt, index) => {
        let balance = debt.balance;
        let payment = debt.minimum_payment + (index === 0 ? snowball : 0);
        let months = 0;
        let interestPaid = 0;

        while (balance > 0.01 && months < 600) {
            const monthlyInterest = balance * (debt.apr / 100 / 12);
            const principalPayment = Math.min(Math.max(payment - monthlyInterest, 0), balance);
            
            balance -= principalPayment;
            interestPaid += monthlyInterest;
            months++;
        }

        snowball += debt.minimum_payment;
        totalInterest += interestPaid;
        maxMonths = Math.max(maxMonths, months);

        return {
            ...debt,
            months_to_payoff: months,
            total_interest: interestPaid,
            payoff_date: addMonths(new Date(), months)
        };
    });

    const result = {
        schedule,
        total_months: maxMonths,
        total_interest: totalInterest,
        debt_free_date: addMonths(new Date(), maxMonths),
        strategy_savings: 0 // Could calculate vs other strategy
    };

    calculationCache.set(cacheKey, result);
    return result;
};

export const calculateTaxes = (income, filingStatus = 'single', state = null) => {
    // 2024 tax brackets (simplified)
    const federalBrackets = {
        single: [
            { min: 0, max: 11000, rate: 0.10 },
            { min: 11000, max: 44725, rate: 0.12 },
            { min: 44725, max: 95375, rate: 0.22 },
            { min: 95375, max: 182050, rate: 0.24 },
            { min: 182050, max: 231250, rate: 0.32 },
            { min: 231250, max: 578125, rate: 0.35 },
            { min: 578125, max: Infinity, rate: 0.37 }
        ]
    };

    const brackets = federalBrackets[filingStatus] || federalBrackets.single;
    let federalTax = 0;

    for (const bracket of brackets) {
        if (income > bracket.min) {
            const taxableInThisBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
            federalTax += taxableInThisBracket * bracket.rate;
        }
    }

    // FICA taxes
    const socialSecurity = Math.min(income * 0.062, 160200 * 0.062); // 2024 SS wage base
    const medicare = income * 0.0145;
    const additionalMedicare = income > 200000 ? (income - 200000) * 0.009 : 0;

    // State tax (simplified)
    const stateTax = state ? income * 0.05 : 0; // Rough estimate

    return {
        federal: federalTax,
        state: stateTax,
        socialSecurity,
        medicare: medicare + additionalMedicare,
        total: federalTax + stateTax + socialSecurity + medicare + additionalMedicare,
        effective_rate: income > 0 ? ((federalTax + stateTax + socialSecurity + medicare + additionalMedicare) / income * 100) : 0
    };
};

export const calculateBudgetVariance = (budgets, transactions) => {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd && t.type === 'expense';
    });

    const categorySpending = monthlyTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    return budgets.map(budget => {
        const spent = categorySpending[budget.category] || 0;
        const variance = budget.monthly_limit - spent;
        const percentageUsed = budget.monthly_limit > 0 ? (spent / budget.monthly_limit * 100) : 0;

        return {
            ...budget,
            spent,
            remaining: Math.max(0, variance),
            variance,
            percentage_used: percentageUsed,
            status: percentageUsed >= 100 ? 'over' : percentageUsed >= 80 ? 'warning' : 'good'
        };
    });
};

export const calculateGoalProjection = (goal, monthlyContribution) => {
    if (!goal || !monthlyContribution) return null;

    const remainingAmount = goal.target_amount - goal.current_amount;
    const monthsToGoal = remainingAmount > 0 ? Math.ceil(remainingAmount / monthlyContribution) : 0;
    const projectedCompletionDate = addMonths(new Date(), monthsToGoal);

    const targetDate = new Date(goal.target_date);
    const monthsUntilTarget = differenceInDays(targetDate, new Date()) / 30;
    const requiredMonthlyContribution = monthsUntilTarget > 0 ? remainingAmount / monthsUntilTarget : remainingAmount;

    return {
        months_to_completion: monthsToGoal,
        projected_completion_date: projectedCompletionDate,
        on_track: monthsToGoal <= monthsUntilTarget,
        required_monthly_contribution: Math.max(0, requiredMonthlyContribution),
        completion_percentage: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount * 100) : 0
    };
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
    if (calculationCache.size > 100) {
        calculationCache.clear();
    }
}, 300000); // Clear every 5 minutes if cache gets large

export const clearCalculationCache = () => {
    calculationCache.clear();
};