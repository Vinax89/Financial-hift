import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StressTester = ({ onRun, isRunning }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Stress Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Trigger synthetic workloads to verify that realtime dashboards remain responsive under load.
        </p>
        <Button type="button" onClick={() => onRun?.()} disabled={isRunning}>
          {isRunning ? "Running benchmarks..." : "Run stress test"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StressTester;
