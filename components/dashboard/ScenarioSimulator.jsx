import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/utils/calculations";

const DEFAULT_EXTRA_PAYMENT = 150;

function estimateMonths(balance, payment, rate) {
  const monthlyRate = Number(rate ?? 0) / 100 / 12;
  const monthlyPayment = Math.max(payment, 0.01);
  if (monthlyRate <= 0) {
    return balance / monthlyPayment;
  }

  const numerator = Math.log(monthlyPayment) - Math.log(monthlyPayment - monthlyRate * balance);
  const denominator = Math.log(1 + monthlyRate);
  if (!Number.isFinite(numerator / denominator)) return Infinity;
  return Math.max(0, numerator / denominator);
}

export default function ScenarioSimulator({ debts = [] }) {
  const [extraPayment, setExtraPayment] = useState(DEFAULT_EXTRA_PAYMENT);

  const simulation = useMemo(() => {
    if (!debts.length) {
      return {
        totalBalance: 0,
        currentMonths: 0,
        acceleratedMonths: 0,
        savings: 0,
        highestPriority: null,
      };
    }

    const balances = debts.map((debt) => ({
      name: debt.name || debt.creditor || "Account",
      balance: Number(debt.current_balance ?? debt.balance ?? 0),
      rate: Number(debt.interest_rate ?? 0),
      payment: Number(debt.minimum_payment ?? 0),
    }));

    const totalBalance = balances.reduce((sum, debt) => sum + debt.balance, 0);

    let currentMonths = 0;
    let acceleratedMonths = 0;
    let savings = 0;
    let highestPriority = null;

    balances.forEach((debt) => {
      const baseline = estimateMonths(debt.balance, debt.payment, debt.rate);
      const accelerated = estimateMonths(debt.balance, debt.payment + extraPayment, debt.rate);
      if (Number.isFinite(baseline) && Number.isFinite(accelerated)) {
        currentMonths = Math.max(currentMonths, baseline);
        acceleratedMonths = Math.max(acceleratedMonths, accelerated);
        const monthlyRate = debt.rate / 100 / 12;
        const baselineInterest = baseline * debt.payment - debt.balance;
        const acceleratedInterest = accelerated * (debt.payment + extraPayment) - debt.balance;
        if (Number.isFinite(baselineInterest) && Number.isFinite(acceleratedInterest)) {
          savings += Math.max(0, baselineInterest - acceleratedInterest);
        }
      }

      if (!highestPriority || debt.rate > highestPriority.rate) {
        highestPriority = debt;
      }
    });

    return {
      totalBalance,
      currentMonths,
      acceleratedMonths,
      savings,
      highestPriority,
    };
  }, [debts, extraPayment]);

  if (!debts.length) {
    return (
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Scenario Simulator</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Link a debt or goal to explore payoff scenarios and savings opportunities.
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Number(formData.get("extra"));
    if (Number.isFinite(raw)) {
      setExtraPayment(Math.max(0, raw));
    }
  };

  const monthsSaved = Math.max(0, simulation.currentMonths - simulation.acceleratedMonths);
  const completionProgress = simulation.currentMonths
    ? Math.min(100, Math.max(0, (monthsSaved / simulation.currentMonths) * 100))
    : 0;

  return (
    <Card className="border-muted/40">
      <CardHeader>
        <CardTitle className="text-lg">Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="extra">Extra monthly payment</Label>
            <Input
              id="extra"
              name="extra"
              type="number"
              min="0"
              step="10"
              defaultValue={extraPayment}
            />
            <p className="text-xs text-muted-foreground">
              Apply an additional payment across high-interest accounts to accelerate payoff.
            </p>
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button type="submit" className="mt-auto">
              Update scenario
            </Button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Total balance</div>
            <div className="text-2xl font-semibold text-foreground">
              {formatCurrency(simulation.totalBalance)}
            </div>
          </div>
          <div className="rounded-lg border border-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Interest savings</div>
            <div className="text-2xl font-semibold text-foreground">
              {formatCurrency(simulation.savings)}
            </div>
            <div className="text-xs text-muted-foreground">vs. minimum payments only</div>
          </div>
          <div className="rounded-lg border border-muted/40 p-4">
            <div className="text-sm text-muted-foreground">Months saved</div>
            <div className="text-2xl font-semibold text-foreground">{monthsSaved.toFixed(1)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion acceleration</span>
            <span className="font-medium text-foreground">{completionProgress.toFixed(0)}%</span>
          </div>
          <Progress value={completionProgress} className="h-2" />
        </div>

        {simulation.highestPriority && (
          <div className="rounded-lg border border-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Focus account</div>
                <div className="text-xs text-muted-foreground">
                  Highest APR at {simulation.highestPriority.rate.toFixed(2)}%
                </div>
              </div>
              <Badge variant="outline">Avalanche</Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Direct extra payments to {simulation.highestPriority.name} for the greatest interest reduction.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
