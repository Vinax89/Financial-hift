import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const DebtSimulator = ({ debts = [] }) => {
  const totals = debts.reduce(
    (acc, debt) => {
      const balance = Number(debt.balance) || 0;
      const rate = Number(debt.rate) || 0;
      return {
        balance: acc.balance + balance,
        payment: acc.payment + (Number(debt.minimum_payment) || 0),
        averageRate: acc.averageRate + rate
      };
    },
    { balance: 0, payment: 0, averageRate: 0 }
  );

  const averageRate = debts.length ? totals.averageRate / debts.length : 0;
  const progress = totals.balance > 0 ? Math.min((totals.payment / Math.max(totals.balance, 1)) * 100, 100) : 0;

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Debt Payoff Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-semibold text-foreground">${totals.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Payments</p>
            <p className="text-2xl font-semibold text-foreground">${totals.payment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Interest Rate</p>
            <p className="text-2xl font-semibold text-foreground">{averageRate.toFixed(2)}%</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Estimated payoff progress</p>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSimulator;
