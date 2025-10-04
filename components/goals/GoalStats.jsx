import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/utils/calculations";

function getUpcomingGoal(goals) {
  const withDates = goals
    .map((goal) => ({ ...goal, date: goal.target_date || goal.deadline }))
    .filter((goal) => goal.date);

  if (!withDates.length) return null;

  return withDates.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )[0];
}

export default function GoalStats({ goals = [], isLoading }) {
  const stats = useMemo(() => {
    if (!goals.length) {
      return {
        totalTarget: 0,
        totalSaved: 0,
        completionRate: 0,
        activeGoals: 0,
        completedGoals: 0,
        upcoming: null,
      };
    }

    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount ?? goal.target ?? 0), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.current_amount ?? goal.saved ?? 0), 0);
    const completedGoals = goals.filter((goal) => (goal.status ?? "") === "completed").length;
    const activeGoals = goals.length - completedGoals;
    const completionRate = totalTarget > 0 ? Math.min(100, Math.max(0, (totalSaved / totalTarget) * 100)) : 0;
    const upcoming = getUpcomingGoal(goals);

    return {
      totalTarget,
      totalSaved,
      completionRate,
      activeGoals,
      completedGoals,
      upcoming,
    };
  }, [goals]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!goals.length) {
    return (
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Goal Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Create your first goal to unlock milestone tracking, savings momentum, and celebration nudges.
        </CardContent>
      </Card>
    );
  }

  const { totalTarget, totalSaved, completionRate, activeGoals, completedGoals, upcoming } = stats;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Savings momentum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Saved so far</div>
            <div className="text-2xl font-semibold text-foreground">{formatCurrency(totalSaved)}</div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress toward {formatCurrency(totalTarget)}</span>
              <span className="font-medium text-foreground">{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="mt-1 h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Goal status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active goals</span>
            <span className="font-medium text-foreground">{activeGoals}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium text-foreground">{completedGoals}</span>
          </div>
          <div className="rounded-md border border-muted/40 p-3 text-xs text-muted-foreground">
            Keep momentum by contributing weekly. Every small deposit accelerates your wins.
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Upcoming milestone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{upcoming.title || upcoming.name || "Goal"}</span>
                  <span className="text-xs text-muted-foreground">
                    Due {new Date(upcoming.target_date || upcoming.deadline).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="secondary">Priority</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(Number(upcoming.current_amount ?? upcoming.saved ?? 0))} saved of {" "}
                {formatCurrency(Number(upcoming.target_amount ?? upcoming.target ?? 0))}
              </div>
              <Progress
                value={Math.min(
                  100,
                  Math.max(
                    0,
                    ((Number(upcoming.current_amount ?? upcoming.saved ?? 0) || 0) /
                      (Number(upcoming.target_amount ?? upcoming.target ?? 0) || 1)) *
                      100,
                  ),
                )}
                className="h-2"
              />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No deadlines set. Add target dates to unlock timeline nudges and reminders.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
