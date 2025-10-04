import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getConnection = () => {
  if (typeof navigator === "undefined" || !navigator.connection) return null;
  return {
    effectiveType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt,
    saveData: navigator.connection.saveData,
  };
};

export default function NetworkMonitor() {
  const [online, setOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [connection, setConnection] = useState(getConnection);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const updateConnection = () => setConnection(getConnection());
    navigator.connection?.addEventListener("change", updateConnection);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.connection?.removeEventListener("change", updateConnection);
    };
  }, []);

  return (
    <Card className="border-muted/40">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Network monitor</CardTitle>
        <Badge variant={online ? "secondary" : "destructive"}>{online ? "Online" : "Offline"}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <Metric label="Effective network" value={connection?.effectiveType || "Unknown"} />
          <Metric label="Downlink" value={connection?.downlink ? `${connection.downlink} Mbps` : "–"} />
          <Metric label="Round-trip time" value={connection?.rtt ? `${connection.rtt} ms` : "–"} />
          <Metric label="Data saver" value={connection?.saveData ? "Enabled" : "Disabled"} />
        </div>
        <p className="text-xs text-muted-foreground">
          We rely on the Network Information API when available. Use this panel to confirm how aggressive UI should be for low-bandwidth users.
        </p>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-muted/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
