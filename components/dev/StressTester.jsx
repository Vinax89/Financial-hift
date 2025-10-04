import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const DEFAULT_CONFIG = {
  operations: 5000,
  concurrency: 4,
  payload: 64,
};

function performWork(payload) {
  let acc = 0;
  const iterations = payload * 75;
  for (let i = 0; i < iterations; i += 1) {
    acc += Math.sin(i) * Math.cos(i / 3);
  }
  return acc;
}

export default function StressTester() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const derivedStats = useMemo(() => {
    if (!results) return null;
    const opsPerSecond = results.durationMs > 0 ? Math.round((results.operations / results.durationMs) * 1000) : 0;
    const level = opsPerSecond >= 200000 ? "Enterprise" : opsPerSecond >= 120000 ? "Healthy" : "Constrained";
    return { opsPerSecond, level };
  }, [results]);

  const handleChange = (field) => (event) => {
    const value = Number(event.target.value);
    setConfig((prev) => ({ ...prev, [field]: Number.isFinite(value) ? value : prev[field] }));
  };

  const runTest = async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);

    const start = performance.now();
    let completed = 0;

    const worker = async () => {
      const chunk = Math.ceil(config.operations / config.concurrency);
      let local = 0;
      for (let i = 0; i < chunk; i += 1) {
        performWork(config.payload);
        local += 1;
        completed += 1;
        if (completed % 250 === 0) {
          setProgress(Math.min(100, Math.round((completed / config.operations) * 100)));
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      return local;
    };

    await Promise.all(Array.from({ length: config.concurrency }, worker));

    const durationMs = performance.now() - start;
    setResults({
      durationMs,
      operations: config.operations,
      concurrency: config.concurrency,
    });
    setProgress(100);
    setRunning(false);
  };

  return (
    <Card className="border-muted/40">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Stress &amp; Chaos Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Generate synthetic CPU pressure to validate responsiveness. Increase payload and concurrency to simulate heavier traffic.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="operations">Operations</Label>
            <Input
              id="operations"
              type="number"
              min="1000"
              step="1000"
              value={config.operations}
              onChange={handleChange("operations")}
            />
            <p className="text-xs text-muted-foreground">Total work units distributed across workers.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="concurrency">Workers</Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              max="16"
              value={config.concurrency}
              onChange={handleChange("concurrency")}
            />
            <p className="text-xs text-muted-foreground">Higher values add parallel load.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payload">Payload</Label>
            <Input
              id="payload"
              type="number"
              min="8"
              max="256"
              value={config.payload}
              onChange={handleChange("payload")}
            />
            <p className="text-xs text-muted-foreground">Iterations inside each operation.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <Button onClick={runTest} disabled={running}>
            {running ? "Running…" : "Run stress test"}
          </Button>
        </div>

        {results && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Duration" value={`${results.durationMs.toFixed(0)} ms`} />
            <Metric label="Operations" value={results.operations.toLocaleString()} />
            <Metric label="Workers" value={results.concurrency} />
          </div>
        )}

        {derivedStats && (
          <div className="rounded-md border border-muted/40 p-4 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-foreground">Throughput</div>
              <div className="text-xs text-muted-foreground">{derivedStats.opsPerSecond.toLocaleString()} ops / second</div>
            </div>
            <Badge variant="secondary">{derivedStats.level}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-muted/40 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
