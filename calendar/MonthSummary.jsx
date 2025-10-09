/**
 * @fileoverview Month summary component displaying financial totals by category
 * @description Shows aggregated totals for bills, subscriptions, debts, BNPL, payments, and shifts
 */

import React from "react";
import { Card } from "@/ui/card";
import { format } from "date-fns";

/**
 * Sum amounts for events of a specific type
 * @param {Array<Object>} events - Calendar events
 * @param {string} type - Event type to sum
 * @returns {number} Total amount
 */
function sumByType(events, type) {
  return (events || [])
    .filter((e) => e.type === type && typeof e.amount === "number")
    .reduce((s, e) => s + e.amount, 0);
}

/**
 * Month summary component
 * @param {Object} props - Component props
 * @param {Date} props.monthDate - Month to display
 * @param {Array<Object>} props.events - Calendar events
 * @returns {JSX.Element} Month summary card
 */
function MonthSummary({ monthDate, events }) {
  /**
   * Calculate totals by event type
   */
  const totals = React.useMemo(() => {
    return {
      bills: sumByType(events, "bill"),
      subscriptions: sumByType(events, "subscription"),
      debts: sumByType(events, "debt"),
      bnpl: sumByType(events, "bnpl"),
      payments: sumByType(events, "payment"),
      shifts: sumByType(events, "shift"),
    };
  }, [events]);

  /**
   * Format number as USD currency
   * @param {number} n - Number to format
   * @returns {string} Formatted currency string
   */
  const currency = (n) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);
    } catch {
      return `$${Number(n || 0).toFixed(2)}`;
    }
  };

  return (
    <Card className="p-3 md:p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted-foreground font-medium">
          Summary for {format(monthDate, "MMMM yyyy")}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="px-2 py-1 rounded bg-expense/15 border border-expense/30">
            Bills: <span className="font-semibold text-expense">{currency(totals.bills)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-primary/10 border border-primary/30">
            Subs: <span className="font-semibold text-primary">{currency(totals.subscriptions)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-warning/20 border border-warning">
            Debts: <span className="font-semibold text-warning">{currency(totals.debts)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-warning/20 border border-warning">
            BNPL: <span className="font-semibold text-warning">{currency(totals.bnpl)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-success/15 border border-success/40">
            Payments: <span className="font-semibold text-success">{currency(totals.payments)}</span>
          </div>
          <div className="px-2 py-1 rounded bg-income/15 border border-income/40">
            Shift Net: <span className="font-semibold text-income">{currency(totals.shifts)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(MonthSummary);