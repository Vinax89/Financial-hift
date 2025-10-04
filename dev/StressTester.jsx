import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { useToast } from "@/ui/use-toast.jsx";

export default function StressTester() {
  const { toast } = useToast();
  const [running, setRunning] = React.useState(false);

  const runTest = React.useCallback(() => {
    setRunning(true);
    const start = performance.now();
    // Simple CPU stress by performing operations.
    let total = 0;
    for (let i = 0; i < 1_000_000; i += 1) {
      total += Math.sqrt(i) % 7;
    }
    const duration = performance.now() - start;
    setRunning(false);
    toast({
      title: "Stress test completed",
      description: `Executed in ${duration.toFixed(0)}ms (score ${total.toFixed(2)})`,
    });
  }, [toast]);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Stress Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Run a lightweight CPU benchmark to validate performance in the current environment.
        </p>
        <Button onClick={runTest} disabled={running}>
          {running ? "Running…" : "Run stress test"}
        </Button>
      </CardContent>
    </Card>
  );
}
