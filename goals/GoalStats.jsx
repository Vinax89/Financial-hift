import React from "react";
import { Card, CardContent } from "@/ui/card.jsx";
import { Skeleton } from "@/ui/skeleton.jsx";

function computeStats(goals) {
  const list = Array.isArray(goals) ? goals : [];
  const total = list.length;
  const active = list.filter((goal) => goal.status === "active").length;
  const completed = list.filter((goal) => goal.status === "completed").length;
  const totalTarget = list.reduce((sum, goal) => sum + (Number(goal.target_amount) || 0), 0);
  const totalCurrent = list.reduce((sum, goal) => sum + (Number(goal.current_amount) || 0), 0);
  const progress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return {
    total,
    active,
    completed,
    progress: Math.min(100, progress),
  };
}

export default function GoalStats({ goals, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="border-border/60">
            <CardContent className="py-6">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-4 h-8 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = computeStats(goals);

  const cards = [
    { label: "Total goals", value: stats.total },
    { label: "Active goals", value: stats.active },
    { label: "Completed", value: stats.completed },
    { label: "Overall progress", value: `${stats.progress}%` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/60">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
