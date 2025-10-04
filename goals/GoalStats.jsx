import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/calculations";

function aggregate(goals) {
  const totals = goals.reduce(
    (acc, goal) => {
      const target = Number(goal.target_amount ?? goal.target ?? 0);
      const current = Number(goal.current_amount ?? goal.saved ?? 0);
      acc.target += target;
      acc.current += current;
      if (goal.completed || current >= target) acc.completed += 1;
      return acc;
    },
    { target: 0, current: 0, completed: 0 }
  );

  const progress = totals.target ? Math.min(100, (totals.current / totals.target) * 100) : 0;
  return { ...totals, progress };
}

export default function GoalStats({ goals = [] }) {
  const { target, current, completed, progress } = React.useMemo(() => aggregate(goals), [goals]);
  const totalGoals = goals.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Goals in progress</p>
            <p className="text-2xl font-semibold">{totalGoals}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-semibold">{completed}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Saved so far</p>
            <p className="text-lg font-medium">{formatCurrency(current)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total target</p>
            <p className="text-lg font-medium">{formatCurrency(target)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Portfolio completion</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
