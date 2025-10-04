import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/components/utils/calculations";

function getProgress(goal) {
  const target = Number(goal.target_amount ?? goal.target ?? 0);
  const current = Number(goal.current_amount ?? goal.saved ?? 0);
  if (!target) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

function getStatus(goal) {
  const progress = getProgress(goal);
  if (goal.status) {
    const status = goal.status.toLowerCase();
    if (status === "completed") return { label: "Completed", variant: "secondary" };
    if (status === "at_risk") return { label: "At Risk", variant: "destructive" };
  }

  if (progress >= 100) return { label: "Completed", variant: "secondary" };
  if (progress >= 70) return { label: "On track", variant: "default" };
  return { label: "In progress", variant: "outline" };
}

export default function GoalList({ goals = [], onEdit, onDelete }) {
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount ?? goal.target ?? 0), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.current_amount ?? goal.saved ?? 0), 0);

  return (
    <Card className="border-muted/40">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Savings & Achievement Goals</CardTitle>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">Saved:</span> {formatCurrency(totalSaved)}
          </span>
          <span>
            <span className="font-medium text-foreground">Target:</span> {formatCurrency(totalTarget)}
          </span>
          <span>
            <span className="font-medium text-foreground">Goals:</span> {goals.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <p>No goals tracked yet.</p>
            <p>Create a goal to track progress toward your next milestone.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Goal</TableHead>
                  <TableHead className="min-w-[140px]">Category</TableHead>
                  <TableHead className="min-w-[140px]">Saved</TableHead>
                  <TableHead className="min-w-[140px]">Target</TableHead>
                  <TableHead className="min-w-[160px]">Timeline</TableHead>
                  <TableHead className="min-w-[140px]">Progress</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => {
                  const progress = getProgress(goal);
                  const status = getStatus(goal);
                  const dueDate = goal.target_date || goal.deadline;

                  return (
                    <TableRow key={goal.id ?? goal.title} className="border-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{goal.title || goal.name || "Goal"}</span>
                          {goal.description && (
                            <span className="text-xs text-muted-foreground line-clamp-2">{goal.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {goal.category || goal.type || "General"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatCurrency(goal.current_amount ?? goal.saved ?? 0)}
                      </TableCell>
                      <TableCell>{formatCurrency(goal.target_amount ?? goal.target ?? 0)}</TableCell>
                      <TableCell>
                        {dueDate ? new Date(dueDate).toLocaleDateString() : "No deadline"}
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-muted-foreground">{progress.toFixed(0)}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(goal)}
                            >
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDelete(goal.id ?? goal)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
