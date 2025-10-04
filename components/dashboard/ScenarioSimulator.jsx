import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const scenarios = [
  { id: "snowball", label: "Snowball Method" },
  { id: "avalanche", label: "Avalanche Method" },
  { id: "custom", label: "Custom Plan" }
];

const ScenarioSimulator = ({ debts = [] }) => {
  const [selectedScenario, setSelectedScenario] = React.useState("snowball");

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Compare different payoff strategies for your {debts.length} debt account{debts.length === 1 ? "" : "s"}.
        </p>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((scenario) => (
            <Button
              key={scenario.id}
              type="button"
              variant={selectedScenario === scenario.id ? "default" : "outline"}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              {scenario.label}
            </Button>
          ))}
        </div>
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          Detailed payoff projections for the {selectedScenario} strategy will appear here once financial modeling is
          connected.
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioSimulator;
