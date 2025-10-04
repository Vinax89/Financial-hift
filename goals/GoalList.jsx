import React from "react";
import { Card, CardContent } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Progress } from "@/ui/progress.jsx";
import { format } from "date-fns";

const STATUS_VARIANTS = {
  active: "bg-primary/10 text-primary border border-primary/20",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function renderBadge(status) {
  if (!status) return null;
  const variant = STATUS_VARIANTS[status] || "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  return <Badge className={variant}>{status}</Badge>;
}

export default function GoalList({ goals = [], onEdit, onDelete }) {
  const safeGoals = Array.isArray(goals) ? goals : [];

  if (safeGoals.length === 0) {
    return <p className="text-sm text-muted-foreground">No goals yet. Use the form above to add your first goal.</p>;
  }

  return (
    <div className="space-y-3">
      {safeGoals.map((goal) => {
        const target = Number(goal.target_amount) || 0;
        const current = Number(goal.current_amount) || 0;
        const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return (
          <Card key={goal.id ?? goal.title} className="border-border/60">
            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{goal.title || "Untitled goal"}</h3>
                  {renderBadge(goal.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Target {formatCurrency(target)} by {goal.target_date ? format(new Date(goal.target_date), "MMM d, yyyy") : "TBD"}
                </p>
                {goal.category && <p className="text-xs uppercase tracking-wide text-muted-foreground">{goal.category}</p>}
                {progress > 0 && (
                  <div className="space-y-1 pt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(current)} saved • {progress}% to target
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button variant="outline" size="sm" onClick={() => onEdit?.(goal)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => goal.id && onDelete?.(goal.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
