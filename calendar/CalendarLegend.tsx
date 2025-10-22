/**
 * @fileoverview Calendar legend component displaying event type colors
 * @description Shows color-coded legend for calendar event types
 */

import React from "react";

/**
 * Legend item structure
 */
interface LegendItem {
  /** Display label for the event type */
  label: string;
  /** Tailwind CSS class for the color indicator */
  className: string;
}

/**
 * Calendar legend component
 * 
 * Displays a color-coded legend showing the different event types
 * that can appear on the calendar (shifts, bills, debts, BNPL, subscriptions, payments).
 * 
 * @component
 * @returns {JSX.Element} Color legend display
 * 
 * @example
 * ```tsx
 * <CalendarLegend />
 * ```
 */
const CalendarLegend: React.FC = () => {
  /**
   * Legend items with colors
   */
  const items: LegendItem[] = [
    { label: "Shift", className: "bg-income" },
    { label: "Bill", className: "bg-expense" },
    { label: "Debt", className: "bg-warning" },
    { label: "BNPL", className: "bg-warning" },
    { label: "Subscription", className: "bg-primary" },
    { label: "Payment", className: "bg-success" },
  ];

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${it.className}`}></span>
          <span className="text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(CalendarLegend);
