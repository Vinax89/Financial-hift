import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GoalStats = ({ goals = [] }) => {
  const totals = goals.reduce(
    (acc, goal) => {
      const target = Number(goal.targetAmount) || 0;
      const current = Number(goal.currentAmount) || 0;
      return {
        count: acc.count + 1,
        totalTarget: acc.totalTarget + target,
        totalCurrent: acc.totalCurrent + current
      };
    },
    { count: 0, totalTarget: 0, totalCurrent: 0 }
  );

  const completion = totals.totalTarget > 0 ? Math.min((totals.totalCurrent / totals.totalTarget) * 100, 100) : 0;

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Active Goals</p>
          <p className="text-2xl font-semibold text-foreground">{totals.count}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Saved so far</p>
          <p className="text-2xl font-semibold text-foreground">${totals.totalCurrent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Completion</p>
          <p className="text-2xl font-semibold text-foreground">{completion.toFixed(1)}%</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalStats;
