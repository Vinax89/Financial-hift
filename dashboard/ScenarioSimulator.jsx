import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Label } from "@/ui/label.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs.jsx";

const DEFAULT_SCENARIO = {
  name: "Base",
  income: 5000,
  expenses: 3200,
  savingsRate: 15,
};

function calculateOutcome({ income, expenses, savingsRate }) {
  const monthlySavings = income * (savingsRate / 100);
  const net = income - expenses;
  const runway = expenses > 0 ? Math.round((monthlySavings * 12) / expenses) : Infinity;
  return {
    net,
    monthlySavings,
    runway,
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export default function ScenarioSimulator() {
  const [scenarioA, setScenarioA] = React.useState({ ...DEFAULT_SCENARIO, name: "Scenario A" });
  const [scenarioB, setScenarioB] = React.useState({ ...DEFAULT_SCENARIO, name: "Scenario B", savingsRate: 20 });

  const resultA = calculateOutcome(scenarioA);
  const resultB = calculateOutcome(scenarioB);

  const updateScenario = (setter) => (field) => (event) => {
    const value = Number(event.target.value);
    setter((prev) => ({ ...prev, [field]: Number.isNaN(value) ? 0 : value }));
  };

  const ScenarioForm = ({ scenario, onChange }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Monthly income</Label>
        <Input type="number" min="0" value={scenario.income} onChange={onChange("income")} />
      </div>
      <div className="space-y-2">
        <Label>Monthly expenses</Label>
        <Input type="number" min="0" value={scenario.expenses} onChange={onChange("expenses")} />
      </div>
      <div className="space-y-2">
        <Label>Savings rate (%)</Label>
        <Input type="number" min="0" max="100" value={scenario.savingsRate} onChange={onChange("savingsRate")} />
      </div>
    </div>
  );

  const ScenarioSummary = ({ label, result }) => (
    <div className="space-y-1 rounded-lg border border-border/60 p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">Net: {formatCurrency(result.net)}</p>
      <p className="text-sm text-muted-foreground">Savings: {formatCurrency(result.monthlySavings)} / month</p>
      <p className="text-sm text-muted-foreground">Runway: {result.runway} months</p>
    </div>
  );

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="compare">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
          </TabsList>
          <TabsContent value="compare" className="space-y-4">
            <ScenarioSummary label="Scenario A" result={resultA} />
            <ScenarioSummary label="Scenario B" result={resultB} />
            <Button variant="outline" onClick={() => {
              setScenarioB((prev) => ({ ...prev, income: prev.income + 250 }));
            }}>
              Boost Scenario B income by $250
            </Button>
          </TabsContent>
          <TabsContent value="configure" className="grid gap-6 md:grid-cols-2">
            <ScenarioForm scenario={scenarioA} onChange={updateScenario(setScenarioA)} />
            <ScenarioForm scenario={scenarioB} onChange={updateScenario(setScenarioB)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
