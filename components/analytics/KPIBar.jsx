
import React from "react";
import { ThemedCard } from "@/components/ui/enhanced-components";

export default function KPIBar({ metrics }) {
  const items = [
    { label: "Net Worth", value: metrics?.netWorth || 0, cls: "text-success" },
    { label: "Monthly Income", value: metrics?.monthlyIncome || 0, cls: "text-income" },
    { label: "Debt/Income %", value: (metrics?.debtToIncomeRatio || 0).toFixed(1) + "%", cls: "text-warning" },
  ];
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
