import React from "react";
import { Card, CardContent } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.jsx";
import { format } from "date-fns";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

const TYPE_LABELS = {
  credit_card: "Credit Card",
  loan: "Loan",
  mortgage: "Mortgage",
};

export default function DebtList({ debts = [], onEdit, onDelete }) {
  const items = Array.isArray(debts) ? debts : [];

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No debts recorded yet.</p>;
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="hidden md:table-cell">Rate</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((debt) => (
              <TableRow key={debt.id ?? debt.name}>
                <TableCell>
                  <div className="font-medium text-foreground">{debt.name || "Unnamed debt"}</div>
                  {debt.account_number && (
                    <div className="text-xs text-muted-foreground">Acct #{debt.account_number}</div>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{TYPE_LABELS[debt.type] || debt.type || "Other"}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(debt.balance)}</TableCell>
                <TableCell className="hidden md:table-cell">{debt.interest_rate ? `${debt.interest_rate}%` : "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {debt.due_date ? format(new Date(debt.due_date), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit?.(debt)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => debt.id && onDelete?.(debt.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
