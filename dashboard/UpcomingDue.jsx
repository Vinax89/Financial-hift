import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addMonths, setDate, isBefore, differenceInDays, parseISO } from "date-fns";
import { formatCurrency } from "@/utils/calculations";

function resolveDate(entry) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!entry) return null;

  if (typeof entry === "string") {
    try {
      const parsed = parseISO(entry);
      if (!Number.isNaN(parsed.getTime())) {
        const parsedDate = new Date(parsed);
        parsedDate.setHours(0, 0, 0, 0);
        return parsedDate < today ? addMonths(parsed, 1) : parsed;
      }
    } catch {
      // ignore parse errors
    }
  }

  const asNumber = Number(entry);
  if (Number.isFinite(asNumber) && asNumber > 0 && asNumber <= 31) {
    const candidate = setDate(today, asNumber);
    return isBefore(candidate, today) ? addMonths(candidate, 1) : candidate;
  }

  return null;
}

function collectItems({ bills = [], debts = [] }) {
  const items = [];
  bills.forEach((bill) => {
    const due = resolveDate(bill.due_date ?? bill.dueDay);
    if (due) {
      items.push({
        id: bill.id ?? `bill-${bill.name}`,
        name: bill.name ?? "Bill",
        amount: bill.amount ?? bill.value ?? 0,
        due,
        type: "Bill",
      });
    }
  });

  debts.forEach((debt) => {
    const due = resolveDate(debt.due_day ?? debt.due_date);
    if (due) {
      items.push({
        id: debt.id ?? `debt-${debt.name}`,
        name: debt.name ?? "Debt payment",
        amount: debt.minimum_payment ?? debt.min_payment ?? 0,
        due,
        type: "Debt",
      });
    }
  });

  return items
    .filter((item) => item.due)
    .sort((a, b) => a.due - b.due)
    .slice(0, 5);
}

export default function UpcomingDue({ bills = [], debts = [] }) {
  const items = React.useMemo(() => collectItems({ bills, debts }), [bills, debts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming due dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bills or debt payments in the next cycle.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const days = differenceInDays(item.due, new Date());
              return (
                <li key={item.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {format(item.due, "MMM d")} · {days >= 0 ? `${days} day${days === 1 ? "" : "s"}` : "Overdue"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <Badge variant={item.type === "Bill" ? "default" : "outline"}>{item.type}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
