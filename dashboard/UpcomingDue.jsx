import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table.jsx";
import { Badge } from "@/ui/badge.jsx";
import { format } from "date-fns";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function normalizeEntries(entries = []) {
  return entries
    .filter(Boolean)
    .map((entry) => ({
      id: entry.id ?? entry.name,
      name: entry.name || entry.title || "Untitled",
      amount: entry.amount ?? entry.balance ?? 0,
      dueDate: entry.due_date || entry.dueDate || entry.date,
      type: entry.type || "bill",
      status: entry.status,
    }))
    .sort((a, b) => new Date(a.dueDate || Infinity) - new Date(b.dueDate || Infinity));
}

export default function UpcomingDue({ bills = [], debts = [] }) {
  const items = React.useMemo(() => normalizeEntries([...(bills || []), ...(debts || [])]), [bills, debts]);

  if (items.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No scheduled bills or debts in the near term.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.slice(0, 6).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell>{formatCurrency(item.amount)}</TableCell>
                <TableCell>
                  {item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
