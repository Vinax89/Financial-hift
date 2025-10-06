/**
 * @fileoverview Calendar legend component displaying event type colors
 * @description Shows color-coded legend for calendar event types
 */

import React from "react";

/**
 * Calendar legend component
 * @returns {JSX.Element} Color legend display
 */
function CalendarLegend() {
  /**
   * Legend items with colors
   * @type {Array<{label: string, className: string}>}
   */
  const items = [
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
}

export default React.memo(CalendarLegend);