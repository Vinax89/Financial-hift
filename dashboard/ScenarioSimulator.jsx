import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Label } from '@/ui/label.jsx';
import { Input } from '@/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';
import { Progress } from '@/ui/progress.jsx';

const growthPresets = {
    conservative: 0.02,
    moderate: 0.05,
    aggressive: 0.08
};

export default function ScenarioSimulator({ startingBalance = 5000, monthlyContribution = 500, horizon = 5 }) {
    const [preset, setPreset] = useState('moderate');
    const [customRate, setCustomRate] = useState(growthPresets[preset]);

    const projection = useMemo(() => {
        const annualRate = customRate;
        const months = horizon * 12;
        const monthlyRate = annualRate / 12;
        let balance = startingBalance;
        const points = [];

        for (let month = 1; month <= months; month += 1) {
            balance = balance * (1 + monthlyRate) + monthlyContribution;
            if (month % 12 === 0 || month === months) {
                points.push({ year: Math.ceil(month / 12), value: balance });
            }
        }

        return {
            endingBalance: balance,
            points
        };
    }, [customRate, startingBalance, monthlyContribution, horizon]);

    const potentialInvestment = startingBalance + horizon * 12 * monthlyContribution;
    const progressValue = potentialInvestment > 0
        ? Math.min(100, (projection.endingBalance / potentialInvestment) * 100)
        : 0;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Scenario Simulator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <Label htmlFor="scenario-preset">Growth Scenario</Label>
                    <Select
                        value={preset}
                        onValueChange={(value) => {
                            setPreset(value);
                            setCustomRate(growthPresets[value]);
                        }}
                    >
                        <SelectTrigger id="scenario-preset">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="conservative">Conservative (2% APY)</SelectItem>
                            <SelectItem value="moderate">Moderate (5% APY)</SelectItem>
                            <SelectItem value="aggressive">Aggressive (8% APY)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="scenario-rate">Custom Annual Rate (%)</Label>
                    <Input
                        id="scenario-rate"
                        type="number"
                        min="0"
                        max="25"
                        step="0.1"
                        value={(customRate * 100).toFixed(1)}
                        onChange={(event) => setCustomRate(Math.max(0, parseFloat(event.target.value) / 100 || 0))}
                    />
                </div>
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Starting Balance</span>
                        <span className="font-medium">${startingBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Contribution</span>
                        <span className="font-medium">${monthlyContribution.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Horizon</span>
                        <span className="font-medium">{horizon} years</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>Projected Value</span>
                        <span className="font-semibold">${projection.endingBalance.toFixed(0)}</span>
                    </div>
                    <Progress value={progressValue} />
                </div>
                <Button variant="outline" className="w-full" onClick={() => setCustomRate(growthPresets[preset])}>
                    Reset to Preset
                </Button>
            </CardContent>
        </Card>
    );
}
