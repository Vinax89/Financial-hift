import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NetworkMonitor = ({ events = [] }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Network Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {events.length === 0 ? (
          <p>No network anomalies detected.</p>
        ) : (
          <ul className="space-y-1">
            {events.map((event, index) => (
              <li key={event.id ?? index} className="rounded-md border border-border p-2">
                <div className="font-medium text-foreground">{event.label ?? event.type}</div>
                {event.description && <div>{event.description}</div>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkMonitor;
