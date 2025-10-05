import React from 'react';
import useGamification from '../hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Progress } from '@/ui/progress.jsx';
import { Award, Star } from 'lucide-react';
import { Skeleton } from '@/ui/skeleton.jsx';

export default function GamificationCenter() {
    const { gameState, isLoading, allBadges, xpPerLevel } = useGamification();

    if (isLoading || !gameState) {
        return (
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    const { level, xp, badges } = gameState;
    const currentLevelXp = level * xpPerLevel;
    const progress = (xp / currentLevelXp) * 100;

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Your Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-lg text-indigo-700">Level {level}</span>
                        <span className="text-sm text-slate-500">{xp} / {currentLevelXp} XP</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Badges</h4>
                    {badges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {badges.map(badgeId => {
                                const badge = allBadges[badgeId];
                                return badge ? (
                                    <div key={badgeId} title={badge.description} className="flex items-center gap-2 p-2 bg-yellow-100 text-yellow-800 rounded-lg">
                                        <Award className="h-4 w-4" />
                                        <span className="text-sm font-medium">{badge.name}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No badges earned yet. Keep going!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}