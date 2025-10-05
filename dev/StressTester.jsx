import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Button } from '@/ui/button.jsx';
import { Progress } from '@/ui/progress.jsx';

export default function StressTester() {
    const [iterations, setIterations] = useState(0);
    const [duration, setDuration] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) {
            return undefined;
        }
        let active = true;
        const start = performance.now();
        let loops = 0;

        const pump = () => {
            if (!active) return;
            for (let i = 0; i < 5000; i += 1) {
                // eslint-disable-next-line no-unused-vars
                const value = Math.sqrt(i * Math.random());
                loops += 1 + value / 1000;
            }
            if (!active) {
                return;
            }
            if (performance.now() - start < 2000) {
                requestAnimationFrame(pump);
            } else if (active) {
                const end = performance.now();
                setIterations(Math.round(loops));
                setDuration(Math.round(end - start));
                setRunning(false);
            }
        };

        requestAnimationFrame(pump);
        return () => {
            active = false;
        };
    }, [running]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stress Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Run a CPU-intensive loop to gauge rendering headroom during development.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Iterations</p>
                        <p className="text-lg font-semibold">{iterations.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold">{duration} ms</p>
                    </div>
                </div>
                <Progress value={Math.min(100, running ? 50 : iterations > 0 ? 100 : 0)} className="h-2" />
                <Button onClick={() => setRunning(true)} disabled={running}>
                    {running ? 'Running…' : 'Run Stress Test'}
                </Button>
            </CardContent>
        </Card>
    );
}
