import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsProgress({ goals, isLoading }) {
    const activeGoals = goals.filter(g => g.status === 'active').slice(0, 4);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Savings Goals
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        ))}
                    </div>
                ) : activeGoals.length > 0 ? (
                    <div className="space-y-6">
                        {activeGoals.map((goal) => {
                            const progress = (goal.current_amount / goal.target_amount) * 100;
                            return (
                                <div key={goal.id} className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{goal.title}</h4>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Due {format(new Date(goal.target_date), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">
                                                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                                            </p>
                                        </div>
                                    </div>
                                    <Progress value={Math.min(progress, 100)} className="h-2" />
                                    <p className="text-xs text-slate-500">
                                        {progress.toFixed(1)}% complete
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No active goals yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}