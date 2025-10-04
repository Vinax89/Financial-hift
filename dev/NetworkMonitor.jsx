import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Button } from "@/ui/button.jsx";

export default function NetworkMonitor() {
  const [online, setOnline] = React.useState(() => navigator.onLine);
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setLogs((prev) => [...prev.slice(-9), { type: "online", ts: Date.now() }]);
    };
    const handleOffline = () => {
      setOnline(false);
      setLogs((prev) => [...prev.slice(-9), { type: "offline", ts: Date.now() }]);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Network Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={online ? "default" : "outline"}>{online ? "Online" : "Offline"}</Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setLogs((prev) => [...prev.slice(-9), { type: online ? "ping" : "offline", ts: Date.now() }])}
        >
          Log connection check
        </Button>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Recent events</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {logs.length === 0 ? (
              <li>No events recorded.</li>
            ) : (
              logs
                .slice()
                .reverse()
                .map((log, index) => (
                  <li key={index}>
                    {log.type.toUpperCase()} at {new Date(log.ts).toLocaleTimeString()}
                  </li>
                ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
