import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DebtList = ({ debts = [], onEdit, onDelete }) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Debt Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {debts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No debt accounts yet. Add one to get started.</p>
        ) : (
          debts.map((debt) => (
            <div
              key={debt.id ?? debt.name ?? Math.random()}
              className="flex items-center justify-between rounded-md border border-border bg-background p-3"
            >
              <div>
                <p className="font-medium text-foreground">{debt.name ?? "Debt"}</p>
                <p className="text-xs text-muted-foreground">
                  Balance: {debt.balance != null ? `$${Number(debt.balance).toLocaleString()}` : "N/A"}
                </p>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(debt)}>
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => debt.id != null && onDelete(debt.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DebtList;
