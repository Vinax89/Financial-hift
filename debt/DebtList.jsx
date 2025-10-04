import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/calculations";

function getPayoffCategory(months) {
  if (!Number.isFinite(months) || months <= 0) return { label: "Paid", tone: "secondary" };
  if (months <= 12) return { label: "Aggressive", tone: "default" };
  if (months <= 36) return { label: "On Track", tone: "outline" };
  return { label: "Long Term", tone: "secondary" };
}

export default function DebtList({ debts = [], onEdit, onDelete }) {
  if (!debts.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No debt accounts found. Start by adding your first obligation.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">APR</TableHead>
          <TableHead className="text-right">Minimum</TableHead>
          <TableHead className="text-right">Estimated Payoff</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {debts.map((debt) => {
          const apr = debt.interest_rate ?? debt.apr ?? 0;
          const minimum = debt.minimum_payment ?? debt.min_payment ?? 0;
          const balance = debt.balance ?? debt.principal ?? 0;
          const monthlyRate = apr / 100 / 12;
          const payoffMonths = minimum > 0 && monthlyRate > 0
            ? Math.log(minimum / (minimum - balance * monthlyRate)) / Math.log(1 + monthlyRate)
            : Number.POSITIVE_INFINITY;
          const payoffLabel = getPayoffCategory(payoffMonths);

          return (
            <TableRow key={debt.id ?? debt.name}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{debt.name ?? "Unnamed Account"}</span>
                  {debt.institution && (
                    <span className="text-xs text-muted-foreground">{debt.institution}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(balance)}</TableCell>
              <TableCell className="text-right">{apr ? `${apr.toFixed(2)}%` : "-"}</TableCell>
              <TableCell className="text-right">{minimum ? formatCurrency(minimum) : "-"}</TableCell>
              <TableCell className="text-right">
                <Badge variant={payoffLabel.tone}>{payoffLabel.label}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {typeof onEdit === "function" && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(debt)}>
                    Edit
                  </Button>
                )}
                {typeof onDelete === "function" && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(debt.id)}>
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableCaption className="text-left">
        Payment timeline based on current balance, APR, and minimum payment. Adjust payments for faster payoff.
      </TableCaption>
    </Table>
  );
}
