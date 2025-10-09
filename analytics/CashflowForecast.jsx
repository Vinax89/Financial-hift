/**
 * @fileoverview 30-day cashflow forecast component
 * @description Displays projected balance over next 30 days based on scheduled transactions and bills
 */

import React, { useMemo } from "react";
import { ThemedCard } from "@/ui/enhanced-components";
import { CardHeader, CardTitle, CardContent } from "@/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, addDays } from "date-fns";

/**
 * Cashflow forecast chart component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.transactions=[]] - Transaction data
 * @param {Array<Object>} [props.bills=[]] - Upcoming bills
 * @returns {JSX.Element} Forecast chart
 */
function CashflowForecast({ transactions = [], bills = [] }) {
  /**
   * Calculate daily balance projections for next 30 days
   */
  const data = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 30 }).map((_, i) => addDays(today, i));
    let balance = 0;
    return days.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const income = transactions.filter(t => t.type === "income" && t.date === ds).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const expense = transactions.filter(t => t.type === "expense" && t.date === ds).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const billsDue = bills.filter(b => Number(b.due_date) === d.getDate()).reduce((s, b) => s + (Number(b.amount) || 0), 0);
      balance = balance + income - expense - billsDue;
      return { date: format(d, "MMM d"), balance, income, expenses: expense + billsDue };
    });
  }, [transactions, bills]);

  return (
    <ThemedCard>
      <CardHeader><CardTitle>30-Day Cashflow Forecast</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cf-a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4}/>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
            <Tooltip />
            <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#cf-a)" name="Balance"/>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </ThemedCard>
  );
}

export default React.memo(CashflowForecast);