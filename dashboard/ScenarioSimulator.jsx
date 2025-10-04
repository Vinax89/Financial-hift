import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/calculations";
import { addMonths, format } from "date-fns";

function summarizeDebts(debts) {
  return debts.reduce(
    (acc, debt) => {
      const balance = Number(debt.balance ?? debt.principal ?? 0);
      const payment = Number(debt.minimum_payment ?? debt.min_payment ?? 0);
      const rate = Number(debt.interest_rate ?? debt.apr ?? 0);
      acc.balance += balance;
      acc.payment += payment;
      acc.weightedRate += balance * rate;
      return acc;
    },
    { balance: 0, payment: 0, weightedRate: 0 }
  );
}

function estimateMonths({ balance, payment, rate, extra = 0, overrideRate }) {
  if (!balance) return 0;
  const monthlyRate = (overrideRate ?? rate) / 100 / 12;
  const totalPayment = payment + extra;
  if (!totalPayment) return Infinity;

  if (monthlyRate <= 0) {
    return Math.ceil(balance / totalPayment);
  }

  const interestThreshold = totalPayment / balance;
  if (interestThreshold <= monthlyRate) {
    return Infinity;
  }

  const months = Math.log(totalPayment / (totalPayment - balance * monthlyRate)) / Math.log(1 + monthlyRate);
  return Number.isFinite(months) ? months : Infinity;
}

function describe(months) {
  if (!Number.isFinite(months)) return { label: "Needs attention", variant: "destructive" };
  if (months <= 12) return { label: "Aggressive", variant: "default" };
  if (months <= 36) return { label: "On track", variant: "outline" };
  return { label: "Long term", variant: "secondary" };
}

export default function ScenarioSimulator({ debts = [] }) {
  const summary = React.useMemo(() => summarizeDebts(debts), [debts]);
  const weightedRate = summary.balance ? summary.weightedRate / summary.balance : 0;

  const baselineMonths = estimateMonths({
    balance: summary.balance,
    payment: summary.payment,
    rate: weightedRate,
  });

  const baselineInterest = Number.isFinite(baselineMonths)
    ? (summary.payment * baselineMonths) - summary.balance
    : null;

  const scenarios = [
    {
      id: "extra-50",
      label: "Add $50/mo",
      extra: 50,
    },
    {
      id: "extra-100",
      label: "Add $100/mo",
      extra: 100,
    },
    {
      id: "refinance",
      label: "Refinance to 6% APR",
      extra: 0,
      overrideRate: 6,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3">
          <p className="text-sm text-muted-foreground">Current trajectory</p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold">
                {Number.isFinite(baselineMonths)
                  ? `${Math.round(baselineMonths)} months`
                  : "Not feasible"}
              </p>
              <p className="text-xs text-muted-foreground">
                {Number.isFinite(baselineMonths)
                  ? `Projected payoff ${format(addMonths(new Date(), Math.round(baselineMonths)), "MMM yyyy")}`
                  : "Increase payments to cover monthly interest."}
              </p>
            </div>
            <Badge variant={describe(baselineMonths).variant}>{describe(baselineMonths).label}</Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {baselineInterest != null && baselineInterest > 0
              ? `Estimated interest cost ${formatCurrency(baselineInterest)}`
              : "Minimum payments may not cover accruing interest."}
          </div>
        </div>

        <div className="space-y-3">
          {scenarios.map((scenario) => {
            const months = estimateMonths({
              balance: summary.balance,
              payment: summary.payment,
              rate: weightedRate,
              extra: scenario.extra,
              overrideRate: scenario.overrideRate,
            });
            const status = describe(months);
            const monthlyPayment = summary.payment + (scenario.extra || 0);
            const interestCost = Number.isFinite(months)
              ? (monthlyPayment * months) - summary.balance
              : null;
            const savings = baselineInterest != null && interestCost != null
              ? baselineInterest - interestCost
              : null;

            return (
              <div key={scenario.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{scenario.label}</h4>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payoff timeline</span>
                    <span className="font-medium">
                      {Number.isFinite(months) ? `${Math.round(months)} months` : "Not feasible"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly payment</span>
                    <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Interest cost</span>
                    <span className="font-medium">
                      {interestCost != null ? formatCurrency(Math.max(interestCost, 0)) : "--"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Savings vs baseline</span>
                    <span className="font-medium">
                      {savings != null ? formatCurrency(Math.max(savings, 0)) : "--"}
                    </span>
                  </div>
                </div>
                {Number.isFinite(months) && Number.isFinite(baselineMonths) && baselineMonths > 0 && (
                  <Progress
                    className="mt-3 h-2"
                    value={Math.max(0, Math.min(100, (baselineMonths - months) / baselineMonths * 100))}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
