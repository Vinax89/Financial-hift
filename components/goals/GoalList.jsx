import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const GoalList = ({ goals = [], onEdit, onDelete }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create a financial goal to track your progress.</p>
        ) : (
          goals.map((goal) => {
            const target = Number(goal.targetAmount) || 0;
            const current = Number(goal.currentAmount) || 0;
            const value = target > 0 ? Math.min((current / target) * 100, 100) : 0;

            return (
              <div key={goal.id ?? goal.title ?? Math.random()} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{goal.title ?? "Goal"}</p>
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">Due {new Date(goal.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="destructive" size="sm" onClick={() => goal.id != null && onDelete(goal.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>${current.toLocaleString()} saved</span>
                    <span>${target.toLocaleString()} target</span>
                  </div>
                  <Progress value={value} className="mt-1 h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default GoalList;
