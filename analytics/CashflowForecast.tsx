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
 * Transaction data structure
 */
interface Transaction {
  type: 'income' | 'expense';
  date: string;
  amount: number;
  [key: string]: any;
}

/**
 * Bill data structure
 */
interface Bill {
  due_date: number;
  amount: number;
  [key: string]: any;
}

/**
 * Daily forecast data point
 */
interface ForecastData {
  date: string;
  balance: number;
  income: number;
  expenses: number;
}

/**
 * Cashflow Forecast Props
 */
interface CashflowForecastProps {
  transactions?: Transaction[];
  bills?: Bill[];
}

/**
 * Cashflow forecast chart component
 * @param {CashflowForecastProps} props - Component props
 * @returns {JSX.Element} Forecast chart
 */
function CashflowForecast({ transactions = [], bills = [] }: CashflowForecastProps): JSX.Element {
  /**
   * Calculate daily balance projections for next 30 days
   */
  const data = useMemo<ForecastData[]>(() => {
    const today = new Date();
    const days = Array.from({ length: 30 }).map((_, i) => addDays(today, i));
    let balance = 0;
    
    return days.map((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const income = transactions
        .filter(t => t.type === "income" && t.date === ds)
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const expense = transactions
        .filter(t => t.type === "expense" && t.date === ds)
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const billsDue = bills
        .filter(b => Number(b.due_date) === d.getDate())
        .reduce((s, b) => s + (Number(b.amount) || 0), 0);
      
      balance = balance + income - expense - billsDue;
      
      return { 
        date: format(d, "MMM d"), 
        balance, 
        income, 
        expenses: expense + billsDue 
      };
    });
  }, [transactions, bills]);

  return (
    <ThemedCard className="">
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
            <Tooltip 
              contentStyle={{
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8
              }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              fill="url(#cf-a)" 
              name="Balance"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </ThemedCard>
  );
}

export default React.memo(CashflowForecast);
