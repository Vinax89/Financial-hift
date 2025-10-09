import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { useTheme } from "@/theme/ThemeProvider";

function monthKey(d) {
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export default function CashflowSankey({ transactions = [] }) {
  const { actualTheme } = useTheme();

  const colors = useMemo(() => ({
    text: actualTheme === "light" ? "#334155" : "#e2e8f0",
    node: actualTheme === "light" ? "#0ea5e9" : "#7dd3fc",
    link: actualTheme === "light" ? "#10b981" : "#34d399",
  }), [actualTheme]);

  const { data, empty } = useMemo(() => {
    const nowKey = monthKey(new Date());
    const tx = (Array.isArray(transactions) ? transactions : []).filter(t => monthKey(t?.date) === nowKey);
    const income = tx.filter(t => t?.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
    const expensesByCategory = {};
    tx.filter(t => t?.type === "expense").forEach(t => {
      const cat = t.category || "other_expense";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
    });

    const nodes = [];
    const idx = new Map();
    const add = (name) => { if (!idx.has(name)) { idx.set(name, nodes.length); nodes.push({ name }); } return idx.get(name); };

    const links = [];
    const incomeIdx = add("Income");

    let totalExpenses = 0;
    Object.values(expensesByCategory).forEach(v => totalExpenses += v);
    const savings = Math.max(0, income - totalExpenses);
    const group = (cat) => ["housing","groceries","bills_utilities","insurance","healthcare","transportation"].includes(cat) ? "Needs"
      : ["entertainment","shopping","travel"].includes(cat) ? "Wants"
      : ["investments","education","salary"].includes(cat) ? "Financial" : "Other";
    const groups = ["Needs","Wants","Financial","Other"];
    const gIdx = {};
    groups.forEach(g => gIdx[g] = add(g));

    const clamp = (v) => Math.max(1, Math.round(v || 0));

    // Income to groups
    const groupTotals = { Needs:0, Wants:0, Financial:0, Other:0 };
    Object.entries(expensesByCategory).forEach(([cat, v]) => { groupTotals[group(cat)] += v; });
    if (savings > 0) groupTotals["Financial"] += savings;

    groups.forEach(g => {
      if (groupTotals[g] > 0) links.push({ source: incomeIdx, target: gIdx[g], value: clamp(groupTotals[g]) });
    });

    // Groups to categories
    Object.entries(expensesByCategory).forEach(([cat, v]) => {
      const cIdx = add(cat.replaceAll("_"," "));
      links.push({ source: gIdx[group(cat)], target: cIdx, value: clamp(v) });
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
          <div className="h-[320px] grid place-items-center text-muted-foreground">Not enough data to display yet.</div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <Sankey
                data={data}
                node={{ fill: colors.node, stroke: "none" }}
                link={{ stroke: colors.link }}
                nodePadding={12}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}