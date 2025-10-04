import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TEST_PRESETS = [
  { id: "light", label: "Light", iterations: 10_000 },
  { id: "moderate", label: "Moderate", iterations: 50_000 },
  { id: "heavy", label: "Heavy", iterations: 100_000 },
];

function runSimulation(iterations) {
  const start = performance.now();
  let value = 0;
  for (let i = 0; i < iterations; i += 1) {
    value += Math.sin(i) * Math.cos(i / 2);
  }
  const duration = performance.now() - start;
  return { duration, value };
}

export default function StressTester() {
  const [iterations, setIterations] = React.useState(TEST_PRESETS[1].iterations);
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [history, setHistory] = React.useState([]);

  const handleRun = React.useCallback(() => {
    setRunning(true);
    requestAnimationFrame(() => {
      const outcome = runSimulation(iterations);
      setResult(outcome);
      setHistory((prev) => [
        {
          timestamp: Date.now(),
          duration: outcome.duration,
          iterations,
        },
        ...prev.slice(0, 4),
      ]);
      setRunning(false);
    });
  }, [iterations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stress tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Iterations per run</p>
          <Slider
            value={[Math.log10(iterations)]}
            min={4}
            max={6}
            step={0.1}
            onValueChange={(value) => {
              const exponent = value[0] ?? 4;
              setIterations(Math.round(10 ** exponent));
            }}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>10k</span>
            <span>1m</span>
          </div>
          <div className="mt-3 flex gap-2">
            {TEST_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={preset.iterations === iterations ? "default" : "outline"}
                size="sm"
                onClick={() => setIterations(preset.iterations)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleRun} disabled={running} className="w-full">
          {running ? "Running..." : "Execute stress test"}
        </Button>

        <Progress value={running ? 45 : 100} className={cn("h-2", running ? "animate-pulse" : "")} />

        {result && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Execution time</span>
              <span className="font-medium">{result.duration.toFixed(2)} ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Iterations</span>
              <span className="font-medium">{iterations.toLocaleString()}</span>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Recent runs</p>
            <ul className="space-y-1 text-xs">
              {history.map((item) => (
                <li key={item.timestamp} className="flex items-center justify-between">
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span>{item.iterations.toLocaleString()} iterations · {item.duration.toFixed(1)} ms</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
