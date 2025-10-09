/**
 * @fileoverview KPI bar component displaying key financial metrics
 * @description Shows net worth, monthly income, and debt-to-income ratio in a compact grid
 */

import React from "react";
import { ThemedCard } from "@/ui/enhanced-components";

/**
 * KPI metrics data structure
 */
export interface KPIMetrics {
  netWorth?: number;
  monthlyIncome?: number;
  debtToIncomeRatio?: number;
}

/**
 * KPI Bar Component Props
 */
interface KPIBarProps {
  metrics: KPIMetrics;
}

/**
 * KPI item configuration
 */
interface KPIItem {
  label: string;
  value: number | string;
  cls: string;
}

/**
 * Format number as USD currency
 * @param {number} n - Number to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (n: number): string => {
  try { 
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0); 
  } catch { 
    return `$${Number(n || 0).toFixed(2)}`; 
  }
};

/**
 * KPI bar component with three key metrics
 * @param {KPIBarProps} props - Component props
 * @returns {JSX.Element} KPI metrics display
 */
function KPIBar({ metrics }: KPIBarProps): JSX.Element {
  /**
   * KPI items configuration
   */
  const items: KPIItem[] = [
    { label: "Net Worth", value: metrics?.netWorth || 0, cls: "text-success" },
    { label: "Monthly Income", value: metrics?.monthlyIncome || 0, cls: "text-income" },
    { label: "Debt/Income %", value: (metrics?.debtToIncomeRatio || 0).toFixed(1) + "%", cls: "text-warning" },
  ];
  
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
