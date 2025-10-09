/**
 * @fileoverview Financial summary cards component (TypeScript version)
 * @description Displays key financial metrics in a grid of cards with
 * icons, colors, and loading states
 */

import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, LucideIcon } from "lucide-react";
import { Skeleton } from "@/ui/skeleton";

/**
 * Financial Summary Component Props
 */
interface FinancialSummaryProps {
  /** Total income for current month */
  monthlyIncome: number;
  /** Total expenses for current month */
  monthlyExpenses: number;
  /** Net income (income - expenses) */
  netIncome: number;
  /** Number of active financial goals */
  totalGoals: number;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Summary card configuration
 */
interface SummaryCard {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconBg: string;
}

/**
 * Format amount as USD currency
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
};

/**
 * Financial Summary Cards Component
 * @component
 * @param props - Component props
 * @returns Financial summary grid
 */
function FinancialSummary({ 
  monthlyIncome, 
  monthlyExpenses, 
  netIncome, 
  totalGoals, 
  isLoading = false 
}: FinancialSummaryProps): JSX.Element {
  const summaryCards: SummaryCard[] = [
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses),
      icon: TrendingDown,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-100"
    },
    {
      title: "Net Income",
      value: netIncome >= 0 
        ? `+${formatCurrency(netIncome)}` 
        : `-${formatCurrency(netIncome)}`,
      icon: DollarSign,
      color: netIncome >= 0 ? "text-emerald-600" : "text-rose-600",
      bgColor: netIncome >= 0 ? "bg-emerald-50" : "bg-rose-50",
      iconBg: netIncome >= 0 ? "bg-emerald-100" : "bg-rose-100"
    },
    {
      title: "Active Goals",
      value: totalGoals.toString(),
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card 
            key={index} 
            className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default memo(FinancialSummary);
