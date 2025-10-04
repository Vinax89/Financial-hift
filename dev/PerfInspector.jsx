import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';

const formatMemory = (value) => {
    if (!value) return '—';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
};

export default function PerfInspector() {
    const [metrics, setMetrics] = useState({
        fps: 0,
        memory: null,
        jsHeapSizeLimit: null
    });

    useEffect(() => {
        let animationFrame;
        let lastFrame = performance.now();

        const measure = () => {
            const now = performance.now();
            const fps = Math.round(1000 / (now - lastFrame));
            lastFrame = now;

            const memory = performance?.memory;

            setMetrics({
                fps,
                memory: memory?.usedJSHeapSize ?? null,
                jsHeapSizeLimit: memory?.jsHeapSizeLimit ?? null
            });
            animationFrame = requestAnimationFrame(measure);
        };

        animationFrame = requestAnimationFrame(measure);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Performance Inspector
                    <Badge variant={metrics.fps >= 50 ? 'success' : metrics.fps >= 30 ? 'secondary' : 'destructive'}>
                        {metrics.fps || '—'} FPS
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Heap Usage</span>
                    <span>{formatMemory(metrics.memory)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Heap Limit</span>
                    <span>{formatMemory(metrics.jsHeapSizeLimit)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Values rely on the experimental <code>performance.memory</code> API when available.
                </p>
            </CardContent>
        </Card>
    );
}
