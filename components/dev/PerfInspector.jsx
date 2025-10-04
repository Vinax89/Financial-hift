import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PerfInspector = ({ metrics = [] }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Performance Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {metrics.length === 0 ? (
          <p>No profiling data captured yet.</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {metrics.map((metric) => (
              <li key={metric.label ?? metric.name}>{metric.label ?? metric.name}: {metric.value}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PerfInspector;
