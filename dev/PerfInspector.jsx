import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Badge } from "@/ui/badge.jsx";

function readMemory() {
  const memory = performance.memory;
  if (!memory) return null;
  return {
    used: memory.usedJSHeapSize,
    total: memory.jsHeapSizeLimit,
  };
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
}

export default function PerfInspector() {
  const [memory, setMemory] = React.useState(() => readMemory());
  const [fps, setFps] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const update = (timestamp) => {
      frame += 1;
      const diff = timestamp - last;
      if (diff >= 1000) {
        setFps(Math.round((frame * 1000) / diff));
        frame = 0;
        last = timestamp;
      }
      requestAnimationFrame(update);
    };
    const id = requestAnimationFrame(update);
    const interval = setInterval(() => setMemory(readMemory()), 2000);
    return () => {
      cancelAnimationFrame(id);
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Performance Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Frame rate</span>
          <Badge variant="outline">{fps || "—"} FPS</Badge>
        </div>
        {memory ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Heap usage</span>
            <Badge variant="outline">
              {formatBytes(memory.used)} / {formatBytes(memory.total)}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Memory metrics unavailable in this environment.</p>
        )}
      </CardContent>
    </Card>
  );
}
