import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/utils/calculations";

function normalizeItem(item, type) {
  const dueDate = item.due_date || item.next_due_date || item.expected_date || item.target_date;
  return {
    id: item.id ?? `${type}-${item.name}`,
    name: item.name || item.title || item.creditor || "Payment",
    amount: Number(item.amount ?? item.minimum_payment ?? item.installment_amount ?? 0),
    type,
    dueDate: dueDate ? new Date(dueDate) : null,
    status: item.status,
  };
}

const TYPE_BADGE = {
  bill: "bg-primary/10 text-primary",
  debt: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
};

export default function UpcomingDue({ bills = [], debts = [] }) {
  const items = useMemo(() => {
    const normalized = [];
    bills.slice(0, 20).forEach((bill) => normalized.push(normalizeItem(bill, "bill")));
    debts.slice(0, 20).forEach((debt) => normalized.push(normalizeItem(debt, "debt")));
    return normalized
      .filter((item) => item.dueDate)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 6);
  }, [bills, debts]);

  return (
    <Card className="border-muted/40">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming payments</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming bills or debt payments in the next two weeks. Schedule reminders to stay ahead of due dates.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-muted/40 p-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Due {item.dueDate?.toLocaleDateString()} • {formatCurrency(item.amount)}
                  </span>
                </div>
                <Badge variant="secondary" className={TYPE_BADGE[item.type] || ""}>
                  {item.type === "bill" ? "Bill" : "Debt"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
