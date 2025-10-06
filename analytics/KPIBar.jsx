/**
 * @fileoverview KPI bar component displaying key financial metrics
 * @description Shows net worth, monthly income, and debt-to-income ratio in a compact grid
 */

import React from "react";
import { ThemedCard } from "@/ui/enhanced-components.jsx";

/**
 * KPI bar component with three key metrics
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Financial metrics object
 * @param {number} props.metrics.netWorth - Total net worth
 * @param {number} props.metrics.monthlyIncome - Monthly income amount
 * @param {number} props.metrics.debtToIncomeRatio - Debt to income ratio
 * @returns {JSX.Element} KPI metrics display
 */
function KPIBar({ metrics }) {
  /**
   * KPI items configuration
   * @type {Array<{label: string, value: any, cls: string}>}
   */
  const items = [
    { label: "Net Worth", value: metrics?.netWorth || 0, cls: "text-success" },
    { label: "Monthly Income", value: metrics?.monthlyIncome || 0, cls: "text-income" },
    { label: "Debt/Income %", value: (metrics?.debtToIncomeRatio || 0).toFixed(1) + "%", cls: "text-warning" },
  ];
  
  /**
   * Format number as USD currency
   * @param {number} n - Number to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (n) => {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0); } catch { return `$${Number(n || 0).toFixed(2)}`; }
  };
  return (
    <ThemedCard className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-xs text-muted-foreground">{it.label}</div>
            <div className={`text-xl font-bold sensitive ${it.cls}`}>
              {typeof it.value === "number" && it.label !== "Debt/Income %" ? formatCurrency(it.value) : it.value}
            </div>
          </div>
        ))}
      </div>
    </ThemedCard>
  );
}

export default React.memo(KPIBar);
