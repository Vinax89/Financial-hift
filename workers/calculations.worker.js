/**
 * @fileoverview Web Worker for heavy financial calculations
 * @description Offloads CPU-intensive operations to background thread
 * Improves main thread performance and prevents UI blocking
 */

// Web Worker code (runs in separate thread)
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;

  try {
    let result;

    switch (type) {
      case 'CALCULATE_TOTALS':
        result = calculateTotals(data);
        break;

      case 'CALCULATE_BUDGET_STATUS':
        result = calculateBudgetStatus(data);
        break;

      case 'CALCULATE_DEBT_PAYOFF':
        result = calculateDebtPayoff(data);
        break;

      case 'CALCULATE_CASHFLOW_FORECAST':
        result = calculateCashflowForecast(data);
        break;

      case 'CALCULATE_ANALYTICS':
        result = calculateAnalytics(data);
        break;

      case 'FILTER_TRANSACTIONS':
        result = filterTransactions(data);
        break;

      case 'SORT_LARGE_DATASET':
        result = sortLargeDataset(data);
        break;

      case 'AGGREGATE_BY_CATEGORY':
        result = aggregateByCategory(data);
        break;

      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }

    // Send result back to main thread
    self.postMessage({
      id,
      type,
      result,
      error: null,
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      type,
      result: null,
      error: error.message,
    });
  }
});

/**
 * Calculate financial totals (income, expenses, net)
 */
function calculateTotals(transactions) {
  const totals = {
    income: 0,
    expenses: 0,
    net: 0,
  };

  for (const transaction of transactions) {
    const amount = parseFloat(transaction.amount) || 0;
    if (amount > 0) {
      totals.income += amount;
    } else {
      totals.expenses += Math.abs(amount);
    }
  }

  totals.net = totals.income - totals.expenses;

  return totals;
}

/**
 * Calculate budget status (spent vs allocated)
 */
function calculateBudgetStatus(data) {
  const { budgets, transactions } = data;
  
  return budgets.map(budget => {
    const categoryTransactions = transactions.filter(
      t => t.category === budget.category
    );
    
    const spent = categoryTransactions.reduce(
      (sum, t) => sum + Math.abs(parseFloat(t.amount) || 0),
      0
    );
    
    const allocated = parseFloat(budget.amount) || 0;
    const remaining = allocated - spent;
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
    
    return {
      ...budget,
      spent,
      remaining,
      percentage,
      status: percentage > 100 ? 'over' : percentage > 90 ? 'warning' : 'ok',
    };
  });
}

/**
 * Calculate debt payoff schedule
 */
function calculateDebtPayoff(data) {
  const { debts, monthlyPayment } = data;
  const schedule = [];
  
  let month = 0;
  let remainingDebts = debts.map(d => ({
    ...d,
    balance: parseFloat(d.balance) || 0,
    interestRate: parseFloat(d.interestRate) || 0,
  }));

  while (remainingDebts.some(d => d.balance > 0) && month < 360) {
    month++;
    let paymentRemaining = monthlyPayment;

    // Apply minimum payments first
    remainingDebts = remainingDebts.map(debt => {
      if (debt.balance <= 0) return debt;

      const monthlyInterest = (debt.balance * (debt.interestRate / 100)) / 12;
      const minPayment = Math.min(debt.minPayment || 0, debt.balance + monthlyInterest);
      
      paymentRemaining -= minPayment;
      
      return {
        ...debt,
        balance: Math.max(0, debt.balance + monthlyInterest - minPayment),
      };
    });

    // Apply extra payment to highest interest rate debt (avalanche method)
    if (paymentRemaining > 0) {
      const highestInterestDebt = remainingDebts
        .filter(d => d.balance > 0)
        .sort((a, b) => b.interestRate - a.interestRate)[0];

      if (highestInterestDebt) {
        const extraPayment = Math.min(paymentRemaining, highestInterestDebt.balance);
        highestInterestDebt.balance -= extraPayment;
      }
    }

    schedule.push({
      month,
      debts: remainingDebts.map(d => ({
        name: d.name,
        balance: d.balance,
      })),
      totalBalance: remainingDebts.reduce((sum, d) => sum + d.balance, 0),
    });
  }

  return {
    schedule,
    monthsToPayoff: month,
    yearsToPayoff: (month / 12).toFixed(1),
    totalInterestPaid: schedule.reduce((sum, s) => {
      return sum + remainingDebts.reduce((dSum, d) => {
        const monthlyInterest = (d.balance * (d.interestRate / 100)) / 12;
        return dSum + monthlyInterest;
      }, 0);
    }, 0),
  };
}

/**
 * Calculate cashflow forecast
 */
function calculateCashflowForecast(data) {
  const { transactions, shifts, bills, startingBalance } = data;
  const forecast = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    
    // Calculate expected income from shifts
    const monthShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate.getMonth() === monthDate.getMonth() &&
             shiftDate.getFullYear() === monthDate.getFullYear();
    });
    const expectedIncome = monthShifts.reduce(
      (sum, s) => sum + (parseFloat(s.earnings) || 0),
      0
    );
    
    // Calculate expected expenses from bills
    const monthBills = bills.filter(b => {
      const dueDate = new Date(b.dueDate);
      return dueDate.getMonth() === monthDate.getMonth();
    });
    const expectedExpenses = monthBills.reduce(
      (sum, b) => sum + Math.abs(parseFloat(b.amount) || 0),
      0
    );
    
    const previousBalance = i === 0 ? startingBalance : forecast[i - 1].endBalance;
    const endBalance = previousBalance + expectedIncome - expectedExpenses;
    
    forecast.push({
      month: monthDate.toISOString(),
      income: expectedIncome,
      expenses: expectedExpenses,
      net: expectedIncome - expectedExpenses,
      startBalance: previousBalance,
      endBalance,
    });
  }
  
  return forecast;
}

/**
 * Calculate comprehensive analytics
 */
function calculateAnalytics(transactions) {
  // Group by category
  const byCategory = {};
  const byMonth = {};
  
  transactions.forEach(t => {
    const amount = Math.abs(parseFloat(t.amount) || 0);
    const category = t.category || 'Uncategorized';
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // By category
    if (!byCategory[category]) {
      byCategory[category] = { total: 0, count: 0, transactions: [] };
    }
    byCategory[category].total += amount;
    byCategory[category].count++;
    byCategory[category].transactions.push(t);
    
    // By month
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    if (parseFloat(t.amount) > 0) {
      byMonth[monthKey].income += amount;
    } else {
      byMonth[monthKey].expenses += amount;
    }
    byMonth[monthKey].net = byMonth[monthKey].income - byMonth[monthKey].expenses;
  });
  
  return {
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      ...data,
    })),
    byMonth: Object.entries(byMonth).map(([month, data]) => ({
      month,
      ...data,
    })),
    topCategories: Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([category, data]) => ({ category, ...data })),
  };
}

/**
 * Filter transactions with complex criteria
 */
function filterTransactions(data) {
  const { transactions, filters } = data;
  
  return transactions.filter(t => {
    // Date range filter
    if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Amount range filter
    if (filters.minAmount && Math.abs(parseFloat(t.amount)) < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount && Math.abs(parseFloat(t.amount)) > filters.maxAmount) {
      return false;
    }
    
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(t.category)) {
        return false;
      }
    }
    
    // Type filter (income/expense)
    if (filters.type === 'income' && parseFloat(t.amount) <= 0) {
      return false;
    }
    if (filters.type === 'expense' && parseFloat(t.amount) >= 0) {
      return false;
    }
    
    // Search text filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        (t.description || '').toLowerCase().includes(searchLower) ||
        (t.category || '').toLowerCase().includes(searchLower) ||
        (t.merchant || '').toLowerCase().includes(searchLower);
      if (!matches) return false;
    }
    
    return true;
  });
}

/**
 * Sort large datasets efficiently
 */
function sortLargeDataset(data) {
  const { items, sortBy, direction } = data;
  
  return items.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle dates
    if (sortBy === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle numbers
    if (typeof aVal === 'number' || !isNaN(parseFloat(aVal))) {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }
    
    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
}

/**
 * Aggregate transactions by category
 */
function aggregateByCategory(transactions) {
  const aggregated = {};
  
  transactions.forEach(t => {
    const category = t.category || 'Uncategorized';
    const amount = parseFloat(t.amount) || 0;
    
    if (!aggregated[category]) {
      aggregated[category] = {
        category,
        income: 0,
        expenses: 0,
        net: 0,
        count: 0,
        transactions: [],
      };
    }
    
    aggregated[category].count++;
    aggregated[category].transactions.push(t);
    
    if (amount > 0) {
      aggregated[category].income += amount;
    } else {
      aggregated[category].expenses += Math.abs(amount);
    }
    
    aggregated[category].net = aggregated[category].income - aggregated[category].expenses;
  });
  
  return Object.values(aggregated);
}

// Signal that worker is ready
self.postMessage({ type: 'WORKER_READY' });
