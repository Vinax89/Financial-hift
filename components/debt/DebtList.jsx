import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/components/utils/calculations";

function getStatus(debt) {
  if (!debt) return { label: "Unknown", variant: "secondary" };

  if (debt.status) {
    const status = debt.status.toLowerCase();
    if (status === "paid") return { label: "Paid", variant: "secondary" };
    if (status === "delinquent") return { label: "Delinquent", variant: "destructive" };
  }

  const balance = Number(debt.current_balance ?? debt.balance ?? 0);
  if (balance <= 0) {
    return { label: "Paid", variant: "secondary" };
  }

  return { label: "Active", variant: "default" };
}

export default function DebtList({ debts = [], onEdit, onDelete }) {
  const totalBalance = debts.reduce(
    (sum, debt) => sum + Number(debt.current_balance ?? debt.balance ?? 0),
    0,
  );
  const totalMinimums = debts.reduce(
    (sum, debt) => sum + Number(debt.minimum_payment ?? 0),
    0,
  );

  return (
    <Card className="border-muted/40">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-lg font-semibold">Debt Accounts</CardTitle>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Total Balance:</span>{" "}
            {formatCurrency(totalBalance)}
          </div>
          <div>
            <span className="font-medium text-foreground">Min Payments:</span>{" "}
            {formatCurrency(totalMinimums)} / mo
          </div>
          <div>
            <span className="font-medium text-foreground">Accounts:</span>{" "}
            {debts.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {debts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <p>No debt accounts tracked yet.</p>
            <p>Add your first account to start monitoring payoff progress.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Account</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Balance</TableHead>
                  <TableHead className="min-w-[120px]">Rate</TableHead>
                  <TableHead className="min-w-[140px]">Min Payment</TableHead>
                  <TableHead className="min-w-[140px]">Due Date</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => {
                  const status = getStatus(debt);
                  const dueDate = debt.due_date || debt.next_due_date;

                  return (
                    <TableRow key={debt.id ?? debt.name} className="border-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {debt.name || debt.creditor || "Unnamed Account"}
                          </span>
                          {debt.account_number && (
                            <span className="text-xs text-muted-foreground">
                              •••• {String(debt.account_number).slice(-4)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {debt.type || debt.category || "Other"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatCurrency(debt.current_balance ?? debt.balance ?? 0)}
                      </TableCell>
                      <TableCell>
                        {debt.interest_rate ? `${Number(debt.interest_rate).toFixed(2)}%` : "—"}
                      </TableCell>
                      <TableCell>{formatCurrency(debt.minimum_payment ?? 0)}</TableCell>
                      <TableCell>
                        {dueDate ? new Date(dueDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(debt)}
                            >
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDelete(debt.id ?? debt)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
