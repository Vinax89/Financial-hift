import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function measureLatency() {
  const start = performance.now();
  await fetch("https://www.cloudflare.com/cdn-cgi/trace", { mode: "no-cors" }).catch(() => null);
  return performance.now() - start;
}

export default function NetworkMonitor() {
  const [status, setStatus] = React.useState(navigator.onLine ? "online" : "offline");
  const [latency, setLatency] = React.useState(null);
  const [testing, setTesting] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setStatus("online");
    const handleOffline = () => setStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const runTest = React.useCallback(async () => {
    setTesting(true);
    const value = await measureLatency();
    setLatency(value);
    setTesting(false);
  }, []);

  const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={status === "online" ? "default" : "destructive"}>{status}</Badge>
        </div>

        {connection && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Effective type</p>
              <p className="font-medium">{connection.effectiveType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Downlink</p>
              <p className="font-medium">{connection.downlink ?? "–"} Mbps</p>
            </div>
          </div>
        )}

        <div className="rounded border p-3">
          <p className="text-muted-foreground">Latency check</p>
          <p className="text-xs text-muted-foreground">Performs a lightweight fetch to estimate round-trip time.</p>
          <Button size="sm" className="mt-3" onClick={runTest} disabled={testing}>
            {testing ? "Testing..." : "Run latency test"}
          </Button>
          {latency != null && (
            <p className="mt-2 text-sm font-medium">{latency.toFixed(0)} ms</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
