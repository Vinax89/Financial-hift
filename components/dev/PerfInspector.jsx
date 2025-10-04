import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_SAMPLE_WINDOW = 1000;

function formatMemory(bytes) {
  if (!bytes) return "–";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PerfInspector() {
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const [longTasks, setLongTasks] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [memory, setMemory] = useState(null);
  const rafRef = useRef(null);
  const lastFrameRef = useRef(performance.now());
  const sampleCountRef = useRef(0);
  const sampleStartRef = useRef(performance.now());
  const observerRef = useRef(null);

  const reset = () => {
    sampleCountRef.current = 0;
    sampleStartRef.current = performance.now();
    setFps(0);
    setFrameTime(0);
    setLongTasks([]);
    setLastUpdated(null);
  };

  useEffect(() => {
    const loop = (now) => {
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;
      sampleCountRef.current += 1;

      if (delta > 0) {
        setFrameTime((prev) => Math.round(delta));
      }

      const elapsed = now - sampleStartRef.current;
      if (elapsed >= DEFAULT_SAMPLE_WINDOW) {
        const fpsValue = Math.round((sampleCountRef.current / elapsed) * 1000);
        setFps(fpsValue);
        setLastUpdated(new Date());
        sampleCountRef.current = 0;
        sampleStartRef.current = now;

        if (performance.memory) {
          setMemory(performance.memory.usedJSHeapSize);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return undefined;

    observerRef.current = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries().filter((entry) => entry.duration >= 40);
      if (entries.length) {
        setLongTasks((prev) => {
          const combined = [...entries, ...prev];
          return combined.slice(0, 20);
        });
      }
    });

    try {
      observerRef.current.observe({ entryTypes: ["longtask"] });
    } catch {
      // Some browsers do not support longtask entries.
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const performanceGrade = (() => {
    if (fps >= 50 && frameTime <= 20) return { label: "Excellent", variant: "success" };
    if (fps >= 30) return { label: "Good", variant: "secondary" };
    return { label: "Needs attention", variant: "destructive" };
  })();

  return (
    <Card className="border-muted/40">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Performance Inspector</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor runtime health, long tasks, and rendering cadence. Toggle performance mode to minimize visual overhead.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={performanceGrade.variant}>{performanceGrade.label}</Badge>
          <Button variant="outline" size="sm" onClick={reset}>
            Reset metrics
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Frames per second" value={`${fps} fps`} description="Target 60 fps" />
          <Metric label="Frame time" value={`${frameTime} ms`} description="Time between animation frames" />
          <Metric label="JavaScript heap" value={formatMemory(memory)} description="Used JS heap from performance.memory" />
          <Metric
            label="Long tasks"
            value={longTasks.length}
            description="Tasks over 40ms (rolling window)"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent long tasks</h3>
          {longTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">
              No blocking tasks detected in the past few seconds.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              {longTasks.map((entry, index) => (
                <li
                  key={`${entry.startTime}-${index}`}
                  className="flex items-center justify-between rounded-md border border-muted/40 p-2"
                >
                  <span>
                    {entry.name || "longtask"} – {entry.duration.toFixed(1)} ms
                  </span>
                  <span>{entry.startTime.toFixed(0)} ms</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Last sampled: {lastUpdated ? lastUpdated.toLocaleTimeString() : "Collecting samples…"}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, description }) {
  return (
    <div className="rounded-lg border border-muted/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}
