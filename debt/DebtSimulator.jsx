import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Label } from "@/ui/label.jsx";
import { Progress } from "@/ui/progress.jsx";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function simulatePayoff(debts, monthlyPayment) {
  const totalBalance = debts.reduce((sum, debt) => sum + (Number(debt.balance) || 0), 0);
  if (totalBalance === 0 || monthlyPayment <= 0) {
    return { months: 0, totalInterest: 0, totalBalance };
  }

  // Simple approximation ignoring compounding for quick insights.
  const averageRate = debts.reduce((sum, debt) => sum + (Number(debt.interest_rate) || 0), 0) / (debts.length || 1);
  const monthlyRate = averageRate / 1200; // convert to monthly decimal
  let balance = totalBalance;
  let interestPaid = 0;
  let months = 0;

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    interestPaid += interest;
    balance = balance + interest - monthlyPayment;
    if (balance <= 0) {
      balance = 0;
      break;
    }
    months += 1;
  }

  return {
    months: months + 1,
    totalInterest: Math.max(0, interestPaid),
    totalBalance,
  };
}

export default function DebtSimulator({ debts = [] }) {
  const [payment, setPayment] = React.useState(500);
  const safeDebts = Array.isArray(debts) ? debts : [];
  const totals = simulatePayoff(safeDebts, Number(payment));

  const payoffYears = totals.months / 12;
  const progress = safeDebts.length === 0 ? 0 : Math.min(100, Math.round((Number(payment) || 0) / (totals.totalBalance || 1) * 100));

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Debt Payoff Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Estimate how quickly your debts could be paid off by adjusting a monthly payment amount.
        </p>
        <div className="space-y-2">
          <Label htmlFor="debt-payment-input">Monthly payment</Label>
          <Input
            id="debt-payment-input"
            type="number"
            min="0"
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Total balance</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totals.totalBalance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated payoff time</p>
            <p className="text-lg font-semibold text-foreground">
              {totals.months > 0 ? `${totals.months} months (~${payoffYears.toFixed(1)} yrs)` : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interest paid (est.)</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totals.totalInterest)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Payment aggressiveness</p>
          <Progress value={progress} className="h-2" />
        </div>
        <Button type="button" variant="outline" onClick={() => setPayment((prev) => Number(prev) + 100)}>
          Add $100 to payment
        </Button>
      </CardContent>
    </Card>
  );
}
