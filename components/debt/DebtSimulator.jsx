import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/utils/calculations";

function calculateSnowball(debts) {
  const sorted = [...debts].sort(
    (a, b) => (Number(a.current_balance ?? a.balance ?? 0) - Number(b.current_balance ?? b.balance ?? 0)),
  );
  return sorted.slice(0, 3);
}

function calculateAvalanche(debts) {
  const sorted = [...debts].sort((a, b) => (Number(b.interest_rate ?? 0) - Number(a.interest_rate ?? 0)));
  return sorted.slice(0, 3);
}

export default function DebtSimulator({ debts = [] }) {
  const stats = useMemo(() => {
    if (!debts.length) {
      return {
        totalBalance: 0,
        averageRate: 0,
        totalMinimums: 0,
        highestRate: null,
        snowballTargets: [],
        avalancheTargets: [],
      };
    }

    const totalBalance = debts.reduce(
      (sum, debt) => sum + Number(debt.current_balance ?? debt.balance ?? 0),
      0,
    );
    const totalMinimums = debts.reduce((sum, debt) => sum + Number(debt.minimum_payment ?? 0), 0);
    const weightedRate = debts.reduce((sum, debt) => {
      const balance = Number(debt.current_balance ?? debt.balance ?? 0);
      return sum + balance * Number(debt.interest_rate ?? 0);
    }, 0);
    const averageRate = totalBalance > 0 ? weightedRate / totalBalance : 0;
    const highestRate = debts.reduce((max, debt) => {
      const rate = Number(debt.interest_rate ?? 0);
      return rate > (max?.interest_rate ?? 0) ? { ...debt, interest_rate: rate } : max;
    }, null);

    return {
      totalBalance,
      averageRate,
      totalMinimums,
      highestRate,
      snowballTargets: calculateSnowball(debts),
      avalancheTargets: calculateAvalanche(debts),
    };
  }, [debts]);

  if (!debts.length) {
    return (
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Payoff Simulator</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add at least one debt account to view payoff recommendations and acceleration strategies.
        </CardContent>
      </Card>
    );
  }

  const { totalBalance, averageRate, totalMinimums, highestRate, snowballTargets, avalancheTargets } = stats;
  const payoffProgress = Math.min(100, Math.max(0, Number(debts.payoff_progress ?? 0)));

  return (
    <Card className="border-muted/40">
      <CardHeader>
        <CardTitle className="text-lg">Payoff Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Total Balance</div>
            <div className="text-2xl font-semibold text-foreground">{formatCurrency(totalBalance)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Minimum payments due this month: {formatCurrency(totalMinimums)}
            </div>
          </div>
          <div className="rounded-lg border border-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Weighted Average APR</div>
            <div className="text-2xl font-semibold text-foreground">
              {averageRate ? `${averageRate.toFixed(2)}%` : "—"}
            </div>
            {highestRate && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                Highest rate: <span className="font-medium text-foreground">{highestRate.interest_rate.toFixed(2)}%</span>
                <Badge variant="outline">{highestRate.name || highestRate.creditor || "Account"}</Badge>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated payoff progress</span>
            <span className="font-medium text-foreground">{payoffProgress.toFixed(0)}%</span>
          </div>
          <Progress value={payoffProgress} className="h-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Snowball priority</h3>
              <Badge variant="secondary">Smallest balance first</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {snowballTargets.length === 0 ? (
                <p className="text-muted-foreground">All balances are currently paid off.</p>
              ) : (
                snowballTargets.map((debt) => (
                  <div key={`snowball-${debt.id ?? debt.name}`} className="rounded-md border border-muted/40 p-3">
                    <div className="font-medium text-foreground">
                      {debt.name || debt.creditor || "Account"}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Balance: {formatCurrency(debt.current_balance ?? debt.balance ?? 0)}</span>
                      <span>Rate: {debt.interest_rate ? `${Number(debt.interest_rate).toFixed(2)}%` : "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Avalanche priority</h3>
              <Badge variant="secondary">Highest APR first</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {avalancheTargets.length === 0 ? (
                <p className="text-muted-foreground">No accounts require acceleration right now.</p>
              ) : (
                avalancheTargets.map((debt) => (
                  <div key={`avalanche-${debt.id ?? debt.name}`} className="rounded-md border border-muted/40 p-3">
                    <div className="font-medium text-foreground">
                      {debt.name || debt.creditor || "Account"}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Balance: {formatCurrency(debt.current_balance ?? debt.balance ?? 0)}</span>
                      <span>Rate: {debt.interest_rate ? `${Number(debt.interest_rate).toFixed(2)}%` : "—"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
