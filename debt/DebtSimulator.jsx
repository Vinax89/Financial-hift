import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/calculations";

function buildPriorityList(debts) {
  return [...(debts || [])]
    .filter((item) => (item.balance ?? item.principal ?? 0) > 0)
    .sort((a, b) => (b.interest_rate ?? b.apr ?? 0) - (a.interest_rate ?? a.apr ?? 0))
    .slice(0, 3);
}

function payoffProgress(debts) {
  const totalBalance = debts.reduce((sum, debt) => sum + (debt.balance ?? debt.principal ?? 0), 0);
  const original = debts.reduce((sum, debt) => sum + (debt.original_balance ?? debt.starting_balance ?? (debt.balance ?? 0)), 0);
  if (!original) return 0;
  return Math.min(100, Math.max(0, ((original - totalBalance) / original) * 100));
}

export default function DebtSimulator({ debts = [] }) {
  const totalBalance = debts.reduce((sum, debt) => sum + (debt.balance ?? debt.principal ?? 0), 0);
  const totalMinimum = debts.reduce((sum, debt) => sum + (debt.minimum_payment ?? debt.min_payment ?? 0), 0);
  const weightedRate = totalBalance
    ? debts.reduce((sum, debt) => sum + (debt.balance ?? 0) * (debt.interest_rate ?? debt.apr ?? 0), 0) / totalBalance
    : 0;
  const topPriorities = buildPriorityList(debts);
  const completion = payoffProgress(debts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payoff Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Total outstanding balance</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Minimum payments</p>
            <p className="text-lg font-medium">{formatCurrency(totalMinimum)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weighted APR</p>
            <p className="text-lg font-medium">{weightedRate ? `${weightedRate.toFixed(2)}%` : "-"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completion.toFixed(1)}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">High-priority debts</p>
          {topPriorities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add interest rates to see payoff recommendations.</p>
          ) : (
            <ul className="space-y-2">
              {topPriorities.map((debt) => (
                <li key={debt.id ?? debt.name} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="font-medium text-foreground">{debt.name ?? "Debt"}</p>
                    <p className="text-xs text-muted-foreground">Balance {formatCurrency(debt.balance ?? debt.principal ?? 0)}</p>
                  </div>
                  <Badge variant="outline">APR {(debt.interest_rate ?? debt.apr ?? 0).toFixed(2)}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
