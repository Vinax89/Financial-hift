
import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';
import { AlertTriangle, Clock, TrendingUp, Battery } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, endOfWeek, eachWeekOfInterval, subWeeks, startOfWeek } from 'date-fns';
import { ThemedCard } from '@/ui/enhanced-components.jsx';
import { ChartLoading } from '@/ui/loading.jsx';

const RiskBadge = ({ level }) => {
    const config = {
        'Low': 'success',
        'Moderate': 'warning',
        'High': 'destructive',
        'Extreme': 'destructive'
    };
    return <Badge variant={config[level] || 'default'}>{level}</Badge>;
}

export default function BurnoutAnalyzer({ shifts }) {
    const calculateConsecutiveDays = (weekShifts) => {
        if (weekShifts.length === 0) return 0;
        const shiftDates = [...new Set(weekShifts.map(shift => new Date(shift.start_datetime).getDate()))].sort((a, b) => a - b);
        if (shiftDates.length === 0) return 0;
        let maxConsecutive = 0, currentConsecutive = 0;
        for (let i = 0; i < shiftDates.length; i++) {
            if (i > 0 && shiftDates[i] === shiftDates[i-1] + 1) {
                currentConsecutive++;
            } else {
                currentConsecutive = 1;
            }
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        }
        return maxConsecutive;
    };

    const burnoutMetrics = useMemo(() => {
        const safeShifts = shifts || []; 
        const now = new Date();
        const last8Weeks = eachWeekOfInterval({
            start: startOfWeek(subWeeks(now, 7)),
            end: endOfWeek(now)
        });

        const weeklyData = last8Weeks.map(weekStart => {
            const weekShifts = safeShifts.filter(shift => {
                const shiftDate = new Date(shift.start_datetime);
                return shiftDate >= weekStart && shiftDate <= endOfWeek(weekStart);
            });
            const totalHours = weekShifts.reduce((sum, shift) => sum + (shift.actual_hours || shift.scheduled_hours || 0), 0);
            const nightShifts = weekShifts.filter(s => s.tags && s.tags.includes('night')).length;
            const consecutiveDays = calculateConsecutiveDays(weekShifts);
            
            let riskScore = 0;
            if (totalHours > 48) riskScore += 30; else if (totalHours > 40) riskScore += 15;
            if (nightShifts > 2) riskScore += 20;
            if (consecutiveDays > 4) riskScore += 25;
            if (weekShifts.length > 5) riskScore += 15;

            let riskLevel = 'Low';
            if (riskScore > 60) riskLevel = 'Extreme'; else if (riskScore > 40) riskLevel = 'High'; else if (riskScore > 25) riskLevel = 'Moderate';

            return { week: format(weekStart, 'MMM d'), hours: totalHours, shifts: weekShifts.length, nightShifts, consecutiveDays, riskScore, riskLevel };
        });

        const currentWeek = weeklyData[weeklyData.length - 1] || {};
        const avgWeeklyHours = weeklyData.length > 0 ? weeklyData.reduce((sum, week) => sum + week.hours, 0) / weeklyData.length : 0;
        const totalNightShifts = weeklyData.reduce((sum, week) => sum + week.nightShifts, 0);

        const recommendations = [];
        if (currentWeek.riskScore > 50) recommendations.push("Consider requesting lighter shifts next week and prioritize recovery.");
        if (totalNightShifts > 8) recommendations.push("Limit night shifts to maintain circadian rhythm.");
        if (avgWeeklyHours > 45) recommendations.push("Monitor for signs of fatigue and stress.");

        return { weeklyData, currentRisk: currentWeek.riskLevel || 'Low', avgWeeklyHours: avgWeeklyHours.toFixed(1), totalNightShifts, recommendations };
    }, [shifts]);

    if (!shifts) {
        return (
            <ThemedCard elevated className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Battery className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Burnout Risk Analyzer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartLoading />
                </CardContent>
            </ThemedCard>
        );
    }
    
    return (
        <ThemedCard elevated className="min-h-[400px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Burnout Risk Analyzer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-amber-500/10 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">Current Burnout Risk</span>
                        <RiskBadge level={burnoutMetrics.currentRisk} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Based on work patterns in the last 8 weeks</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Weekly Hours Trend
                    </h4>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={burnoutMetrics.weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="hours" fill="hsl(var(--primary))" name="Total Hours" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{burnoutMetrics.avgWeeklyHours}</div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Avg Weekly Hours</p>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{burnoutMetrics.totalNightShifts}</div>
                        <p className="text-sm text-purple-600 dark:text-purple-400">Night Shifts (8 wks)</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {Math.max(0, 40 - parseFloat(burnoutMetrics.avgWeeklyHours)).toFixed(1)}
                        </div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Hours to Standard</p>
                    </div>
                </div>

                {burnoutMetrics.recommendations.length > 0 && (
                    <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Wellness Recommendations
                        </h4>
                        <div className="space-y-2">
                            {burnoutMetrics.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                    <span className="text-sm text-muted-foreground">{rec}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </ThemedCard>
    );
}
