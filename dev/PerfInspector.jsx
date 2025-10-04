import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerfInspector() {
  const [entries, setEntries] = React.useState([]);
  const [navigation, setNavigation] = React.useState(null);

  React.useEffect(() => {
    if (typeof performance === "undefined") return undefined;

    const navTiming = performance.getEntriesByType("navigation")[0];
    if (navTiming) {
      setNavigation({
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.startTime,
        firstByte: navTiming.responseStart - navTiming.requestStart,
        total: navTiming.duration,
      });
    }

    const observer = new PerformanceObserver((list) => {
      const newEntries = list.getEntries().map((entry) => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
        type: entry.entryType,
      }));
      setEntries((prev) => [...newEntries, ...prev].slice(0, 6));
    });

    try {
      observer.observe({ entryTypes: ["longtask", "resource"] });
    } catch {
      // some browsers do not support longtask observer
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {navigation ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Time to first byte</p>
              <p className="font-semibold">{navigation.firstByte.toFixed(0)} ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">DOM ready</p>
              <p className="font-semibold">{navigation.domContentLoaded.toFixed(0)} ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total load</p>
              <p className="font-semibold">{navigation.total.toFixed(0)} ms</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Navigation timings unavailable in this environment.</p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-foreground">Recent performance entries</p>
            <Badge variant="outline">{entries.length}</Badge>
          </div>
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">No long tasks or resource loads recorded yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {entries.map((entry, index) => (
                <li key={`${entry.name}-${index}`} className="flex items-center justify-between rounded border px-2 py-1">
                  <span className="truncate pr-4">{entry.name}</span>
                  <span className="text-muted-foreground">{entry.duration.toFixed(1)} ms</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
