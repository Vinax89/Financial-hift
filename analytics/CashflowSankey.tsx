/**
 * @fileoverview Cashflow Sankey diagram component
 * @description Visualizes money flow from income through spending categories using a Sankey diagram
 */

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Transaction data structure
 */
interface Transaction {
  date?: string;
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  [key: string]: any;
}

/**
 * Sankey node
 */
interface SankeyNode {
  name: string;
}

/**
 * Sankey link
 */
interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

/**
 * Sankey data structure
 */
interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Sankey result with empty flag
 */
interface SankeyResult {
  data: SankeyData;
  empty: boolean;
}

/**
 * Cashflow Sankey Props
 */
interface CashflowSankeyProps {
  transactions?: Transaction[];
}

/**
 * Get month key from date string
 * @param {string | undefined} d - Date string
 * @returns {string} Month key in YYYY-MM format
 */
function monthKey(d: string | undefined): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, "0")}`;
  } catch {
    return "";
  }
}

/**
 * Group category into spending type
 * @param {string} cat - Category name
 * @returns {string} Spending group
 */
function groupCategory(cat: string): string {
  if (["housing", "groceries", "bills_utilities", "insurance", "healthcare", "transportation"].includes(cat)) {
    return "Needs";
  }
  if (["entertainment", "shopping", "travel"].includes(cat)) {
    return "Wants";
  }
  if (["investments", "education", "salary"].includes(cat)) {
    return "Financial";
  }
  return "Other";
}

/**
 * Clamp value to minimum of 1
 * @param {number} v - Value to clamp
 * @returns {number} Clamped value
 */
function clamp(v: number): number {
  return Math.max(1, Math.round(v || 0));
}

/**
 * Cashflow Sankey diagram component
 * @param {CashflowSankeyProps} props - Component props
 * @returns {JSX.Element} Sankey diagram
 */
export default function CashflowSankey({ transactions = [] }: CashflowSankeyProps): JSX.Element {
  const { actualTheme } = useTheme();

  const colors = useMemo(() => ({
    text: actualTheme === "light" ? "#334155" : "#e2e8f0",
    node: actualTheme === "light" ? "#0ea5e9" : "#7dd3fc",
    link: actualTheme === "light" ? "#10b981" : "#34d399",
  }), [actualTheme]);

  const { data, empty } = useMemo<SankeyResult>(() => {
    const nowKey = monthKey(new Date().toISOString());
    const tx = (Array.isArray(transactions) ? transactions : []).filter(t => monthKey(t?.date) === nowKey);
    
    const income = tx.filter(t => t?.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
    const expensesByCategory: Record<string, number> = {};
    
    tx.filter(t => t?.type === "expense").forEach(t => {
      const cat = t.category || "other_expense";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
    });

    const nodes: SankeyNode[] = [];
    const idx = new Map<string, number>();
    const add = (name: string): number => { 
      if (!idx.has(name)) { 
        idx.set(name, nodes.length); 
        nodes.push({ name }); 
      } 
      return idx.get(name)!; 
    };

    const links: SankeyLink[] = [];
    const incomeIdx = add("Income");

    let totalExpenses = 0;
    Object.values(expensesByCategory).forEach(v => totalExpenses += v);
    const savings = Math.max(0, income - totalExpenses);
    
    const groups = ["Needs", "Wants", "Financial", "Other"];
    const gIdx: Record<string, number> = {};
    groups.forEach(g => gIdx[g] = add(g));

    // Calculate group totals
    const groupTotals: Record<string, number> = { Needs: 0, Wants: 0, Financial: 0, Other: 0 };
    Object.entries(expensesByCategory).forEach(([cat, v]) => { 
      groupTotals[groupCategory(cat)] += v; 
    });
    if (savings > 0) groupTotals["Financial"] += savings;

    // Income to groups
    groups.forEach(g => {
      if (groupTotals[g] > 0) {
        links.push({ source: incomeIdx, target: gIdx[g], value: clamp(groupTotals[g]) });
      }
    });

    // Groups to categories
    Object.entries(expensesByCategory).forEach(([cat, v]) => {
      const cIdx = add(cat.replace(/_/g, " "));
      links.push({ source: gIdx[groupCategory(cat)], target: cIdx, value: clamp(v) });
    });
    
    if (savings > 0) {
      const sIdx = add("Savings");
      links.push({ source: gIdx["Financial"], target: sIdx, value: clamp(savings) });
    }

    return { data: { nodes, links }, empty: nodes.length <= 2 };
  }, [transactions]);

  return (
    <Card className="bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader>
        <CardTitle>Cashflow Sankey (This Month)</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[360px]">
        {empty ? (
          <div className="h-[360px] flex items-center justify-center text-muted-foreground">
            <p>Not enough data for Sankey diagram this month.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <Sankey 
              data={data} 
              node={{ fill: colors.node, fillOpacity: 0.8 }}
              link={{ stroke: colors.link, strokeOpacity: 0.3 }}
              nodePadding={50}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Tooltip 
                contentStyle={{
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
