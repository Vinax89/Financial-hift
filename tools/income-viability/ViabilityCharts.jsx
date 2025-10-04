
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/ui/card.jsx";
import { useTheme } from "@/theme/ThemeProvider.jsx";
import { formatCurrency } from "@/utils/calculations.jsx";

function themed(colorVar) {
  return `hsl(var(${colorVar}))`;
}

function Section({ children }) {
  return (
    <Card className="bg-card border border-border">
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export default function ViabilityCharts({ results, compareResults = null, monthlyView = false }) {
  const { actualTheme } = useTheme();
  if (!results) return null;

  // Units: monthly when monthlyView, otherwise annual
  const parts = (r) => ({
    tax: monthlyView ? (r.taxBurden || 0) / 12 : (r.taxBurden || 0),
    col: monthlyView ? (r.cost_of_living?.total_annual || 0) / 12 : (r.cost_of_living?.total_annual || 0),
    debt: monthlyView ? (r.monthlyDebtBurden || 0) : (r.debtBurdenAnnual || 0),
    net: monthlyView ? (r.viableIncome || 0) / 12 : (r.viableIncome || 0),
  });

  const a = parts(results);
  const b = compareResults ? parts(compareResults) : null;

  // Distinct, theme-aware colors
  const COLOR_TAX = themed("--destructive");    // red
  const COLOR_COL = themed("--warning");        // amber
  const COLOR_DEBT = themed("--primary");       // blue
  const COLOR_NET = themed("--success");        // green

  const pieDataA = [
    { name: "Tax Burden", value: Math.max(0, a.tax), fill: COLOR_TAX },
    { name: "Cost of Living", value: Math.max(0, a.col), fill: COLOR_COL },
    { name: "Debt Burden", value: Math.max(0, a.debt), fill: COLOR_DEBT },
    { name: "Net (Viable)", value: Math.max(0, a.net), fill: COLOR_NET },
  ];

  const barData = [
    {
      name: monthlyView ? "Monthly" : "Annual",
      "Tax Burden": Math.max(0, a.tax),
      "Cost of Living": Math.max(0, a.col),
      "Debt Burden": Math.max(0, a.debt),
      "Net (Viable)": Math.max(0, a.net),
    },
  ];

  const barCompare = b
    ? [
        {
          name: "A",
          "Tax Burden": Math.max(0, a.tax),
          "Cost of Living": Math.max(0, a.col),
          "Debt Burden": Math.max(0, a.debt),
          "Net (Viable)": Math.max(0, a.net),
        },
        {
          name: "B",
          "Tax Burden": Math.max(0, b.tax),
          "Cost of Living": Math.max(0, b.col),
          "Debt Burden": Math.max(0, b.debt),
          "Net (Viable)": Math.max(0, b.net),
        },
      ]
    : null;

  const axisColor = themed("--muted-foreground");
  const gridColor = "hsl(var(--border))";
  const tooltipStyle = {
    backgroundColor: themed("--popover"),
    color: themed("--popover-foreground"),
    border: `1px solid ${gridColor}`,
    borderRadius: "0.5rem",
  };

  return (
    <div className="grid md:grid-cols-2 gap-6" aria-label="Income viability charts">
      <Section>
        <div className="h-[280px]" aria-label="Breakdown pie chart">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieDataA} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {pieDataA.map((s, i) => (
                  <Cell key={i} fill={s.fill} stroke={gridColor} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
              <Legend formatter={(v) => <span style={{ color: themed("--muted-foreground") }}>{v}</span>} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section>
        <div className="h-[280px]" aria-label="Comparison bar chart">
          <ResponsiveContainer>
            <BarChart data={barCompare || barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
              <Legend formatter={(v) => <span style={{ color: themed("--muted-foreground") }}>{v}</span>} />
              <Bar dataKey="Tax Burden" fill={COLOR_TAX} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Cost of Living" fill={COLOR_COL} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Debt Burden" fill={COLOR_DEBT} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Net (Viable)" fill={COLOR_NET} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
    </div>
  );
}
