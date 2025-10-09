/**
 * @fileoverview Category expense trends bar chart
 * @description Displays expense breakdown by category using a theme-aware
 * bar chart with distinct colors per category
 */

import React, { useMemo } from "react";
import { ThemedCard } from "@/ui/enhanced-components";
import { CardHeader, CardTitle, CardContent } from "@/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

/**
 * Category Trends Component
 * @component
 * @param {Object} props
 * @param {Array} [props.transactions=[]] - Transaction history
 * @returns {JSX.Element}
 */
const CategoryTrends = React.memo(function CategoryTrends({ transactions = [] }) {
  const monthly = useMemo(() => {
    const map = {};
    (transactions || []).filter(t => t.type === "expense").forEach(t => {
      const cat = t.category || "other";
      map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(map).map(([k, v]) => ({ category: k, amount: v }));
  }, [transactions]);

  // Distinct colors per category (theme-aware where possible)
  const colorForCategory = (cat) => {
    switch (cat) {
      case "housing": return "hsl(var(--warning))";         // amber
      case "groceries": return "hsl(var(--success))";       // green
      case "bills_utilities": return "hsl(var(--primary))"; // blue
      case "healthcare": return "hsl(var(--destructive))";  // red
      case "transportation": return "#06b6d4";              // cyan
      case "entertainment": return "#a78bfa";               // purple
      case "shopping": return "#f472b6";                    // pink
      case "insurance": return "#64748b";                   // slate
      case "investments": return "#22d3ee";                 // light-cyan
      case "education": return "#94a3b8";                   // gray
      case "travel": return "#0ea5e9";                      // sky
      default: return "#8b5cf6";                            // violet (or a suitable default hex if no theme var exists)
    }
  };

  return (
    <ThemedCard>
      <CardHeader><CardTitle>Expense by Category</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4}/>
            <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8
              }}
              wrapperStyle={{ outline: "none" }}
              formatter={(value) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(value || 0))}
            />
            <Bar dataKey="amount">
              {monthly.map((row, idx) => (
                <Cell key={`cell-${idx}`} fill={colorForCategory(row.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </ThemedCard>
  );
});

export default CategoryTrends;
