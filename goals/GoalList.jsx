import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/calculations";

function goalProgress(goal) {
  const target = Number(goal.target_amount ?? goal.target ?? 0);
  const current = Number(goal.current_amount ?? goal.saved ?? 0);
  if (!target) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

function goalStatus(goal) {
  if (goal.completed || goal.status === "completed") return { label: "Completed", variant: "secondary" };
  const progress = goalProgress(goal);
  if (progress >= 80) return { label: "On track", variant: "default" };
  if (progress >= 40) return { label: "In progress", variant: "outline" };
  return { label: "Just started", variant: "secondary" };
}

export default function GoalList({ goals = [], onEdit, onDelete }) {
  if (!goals.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">No goals yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Start planning by capturing a savings target, due date, and amount you have saved so far.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const progress = goalProgress(goal);
        const status = goalStatus(goal);
        const target = Number(goal.target_amount ?? goal.target ?? 0);
        const current = Number(goal.current_amount ?? goal.saved ?? 0);
        return (
          <Card key={goal.id ?? `goal-${JSON.stringify(goal)}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{goal.title ?? "Untitled goal"}</CardTitle>
                {goal.due_date && (
                  <p className="text-xs text-muted-foreground">Due {format(new Date(goal.due_date), "PPP")}</p>
                )}
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal.description && (
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{formatCurrency(current)} saved</span>
                <span className="font-medium">Target {formatCurrency(target)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-end gap-2">
                {typeof onEdit === "function" && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
                    Edit
                  </Button>
                )}
                {typeof onDelete === "function" && (
                  <Button size="sm" variant="destructive" onClick={() => onDelete(goal.id ?? goal)}>
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
