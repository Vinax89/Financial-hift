/**
 * @fileoverview Hook for using Web Worker calculations
 * @description Provides easy interface to offload heavy computations to background thread
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { logError, logWarn } from '@/utils/logger.js';

let workerInstance = null;
let workerCallbacks = new Map();
let callbackId = 0;

/**
 * Initialize shared Web Worker instance
 */
function getWorkerInstance() {
  if (!workerInstance && typeof Worker !== 'undefined') {
    try {
      // Create worker from separate file
      workerInstance = new Worker(
        new URL('../workers/calculations.worker.js', import.meta.url),
        { type: 'module' }
      );

      workerInstance.addEventListener('message', (event) => {
        const { id, result, error } = event.data;
        
        if (id && workerCallbacks.has(id)) {
          const callback = workerCallbacks.get(id);
          workerCallbacks.delete(id);
          
          if (error) {
            callback.reject(new Error(error));
          } else {
            callback.resolve(result);
          }
        }
      });

      workerInstance.addEventListener('error', (error) => {
        logError('Worker error', error);
      });
    } catch (error) {
      logWarn('Web Worker not supported or failed to initialize', { error });
      workerInstance = null;
    }
  }
  
  return workerInstance;
}

/**
 * Send calculation to Web Worker
 * @param {string} type - Calculation type
 * @param {*} data - Data to process
 * @returns {Promise<*>} Calculation result
 */
function calculateInWorker(type, data) {
  const worker = getWorkerInstance();
  
  // Fallback to main thread if worker unavailable
  if (!worker) {
    return Promise.reject(new Error('Web Worker not available'));
  }

  return new Promise((resolve, reject) => {
    const id = ++callbackId;
    
    workerCallbacks.set(id, { resolve, reject });
    
    // Send task to worker
    worker.postMessage({ type, data, id });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (workerCallbacks.has(id)) {
        workerCallbacks.delete(id);
        reject(new Error('Worker calculation timeout'));
      }
    }, 10000);
  });
}

/**
 * Hook for Web Worker calculations
 * @returns {Object} Worker calculation functions
 */
export function useWebWorker() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof Worker !== 'undefined');
  }, []);

  /**
   * Calculate financial totals
   */
  const calculateTotals = useCallback(async (transactions) => {
    try {
      return await calculateInWorker('CALCULATE_TOTALS', transactions);
    } catch (error) {
      // Fallback to main thread
      return fallbackCalculateTotals(transactions);
    }
  }, []);

  /**
   * Calculate budget status
   */
  const calculateBudgetStatus = useCallback(async (budgets, transactions) => {
    try {
      return await calculateInWorker('CALCULATE_BUDGET_STATUS', { budgets, transactions });
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error, type: 'budgetStatus' });
      return fallbackCalculateBudgetStatus(budgets, transactions);
    }
  }, []);

  /**
   * Calculate debt payoff schedule
   */
  const calculateDebtPayoff = useCallback(async (debts, monthlyPayment) => {
    try {
      return await calculateInWorker('CALCULATE_DEBT_PAYOFF', { debts, monthlyPayment });
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error, type: 'payoffSchedule' });
      return { schedule: [], monthsToPayoff: 0 };
    }
  }, []);

  /**
   * Calculate cashflow forecast
   */
  const calculateCashflowForecast = useCallback(async (data) => {
    try {
      return await calculateInWorker('CALCULATE_CASHFLOW_FORECAST', data);
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error });
      return [];
    }
  }, []);

  /**
   * Calculate analytics
   */
  const calculateAnalytics = useCallback(async (transactions) => {
    try {
      return await calculateInWorker('CALCULATE_ANALYTICS', transactions);
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error, type: 'analytics' });
      return fallbackCalculateAnalytics(transactions);
    }
  }, []);

  /**
   * Filter transactions
   */
  const filterTransactions = useCallback(async (transactions, filters) => {
    try {
      return await calculateInWorker('FILTER_TRANSACTIONS', { transactions, filters });
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error });
      return fallbackFilterTransactions(transactions, filters);
    }
  }, []);

  /**
   * Sort large dataset
   */
  const sortLargeDataset = useCallback(async (items, sortBy, direction) => {
    try {
      return await calculateInWorker('SORT_LARGE_DATASET', { items, sortBy, direction });
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error });
      return items.sort((a, b) => {
        return direction === 'asc' 
          ? (a[sortBy] > b[sortBy] ? 1 : -1)
          : (a[sortBy] < b[sortBy] ? 1 : -1);
      });
    }
  }, []);

  /**
   * Aggregate by category
   */
  const aggregateByCategory = useCallback(async (transactions) => {
    try {
      return await calculateInWorker('AGGREGATE_BY_CATEGORY', transactions);
    } catch (error) {
      logWarn('Worker calculation failed, using main thread', { error });
      return [];
    }
  }, []);

  return {
    isSupported,
    calculateTotals,
    calculateBudgetStatus,
    calculateDebtPayoff,
    calculateCashflowForecast,
    calculateAnalytics,
    filterTransactions,
    sortLargeDataset,
    aggregateByCategory,
  };
}

// ============================================
// FALLBACK FUNCTIONS (Main Thread)
// ============================================

function fallbackCalculateTotals(transactions) {
  const totals = { income: 0, expenses: 0, net: 0 };
  
  transactions.forEach(t => {
    const amount = parseFloat(t.amount) || 0;
    if (amount > 0) {
      totals.income += amount;
    } else {
      totals.expenses += Math.abs(amount);
    }
  });
  
  totals.net = totals.income - totals.expenses;
  return totals;
}

function fallbackCalculateBudgetStatus(budgets, transactions) {
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

function fallbackCalculateAnalytics(transactions) {
  const byCategory = {};
  
  transactions.forEach(t => {
    const amount = Math.abs(parseFloat(t.amount) || 0);
    const category = t.category || 'Uncategorized';
    
    if (!byCategory[category]) {
      byCategory[category] = { total: 0, count: 0 };
    }
    byCategory[category].total += amount;
    byCategory[category].count++;
  });
  
  return {
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      ...data,
    })),
    topCategories: Object.entries(byCategory)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([category, data]) => ({ category, ...data })),
  };
}

function fallbackFilterTransactions(transactions, filters) {
  return transactions.filter(t => {
    if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) {
      return false;
    }
    if (filters.categories && !filters.categories.includes(t.category)) {
      return false;
    }
    return true;
  });
}
