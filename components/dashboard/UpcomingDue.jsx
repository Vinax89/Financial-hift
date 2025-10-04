import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UpcomingDue = ({ items = [] }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Upcoming Due Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.length === 0 ? (
          <p className="text-muted-foreground">You're all caught up. New reminders will appear here.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id ?? item.title ?? Math.random()}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div>
                <p className="font-medium text-foreground">{item.title ?? "Reminder"}</p>
                {item.dueDate && (
                  <p className="text-xs text-muted-foreground">Due {new Date(item.dueDate).toLocaleString()}</p>
                )}
              </div>
              <Badge variant={item.status === "urgent" ? "destructive" : "secondary"}>
                {item.status ?? "scheduled"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDue;
