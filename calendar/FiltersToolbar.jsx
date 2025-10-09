/**
 * @fileoverview Filters toolbar component for calendar event visibility
 * @description Switch controls for toggling different calendar event types
 */

import React from "react";
import { Switch } from "@/ui/switch";
import { Label } from "@/ui/label";
import { Card } from "@/ui/card";

/**
 * Filters toolbar component
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onChange - Filter change handler
 * @returns {JSX.Element} Filter switches grid
 */
interface FiltersToolbarInnerProps { [key: string]: any; }`n`nfunction FiltersToolbarInner({ filters, onChange }: FiltersToolbarInnerProps) {
  /**
   * Toggle a specific filter
   * @param {string} key - Filter key to toggle
   */
  const toggle = React.useCallback((key) => {
    onChange({ ...filters, [key]: !filters[key] });
  }, [filters, onChange]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="flex items-center gap-2">
          <Switch id="f-shifts" checked={!!filters.shifts} onCheckedChange={() => toggle("shifts")} />
          <Label htmlFor="f-shifts" className="text-sm">Shifts</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="f-bills" checked={!!filters.bills} onCheckedChange={() => toggle("bills")} />
          <Label htmlFor="f-bills" className="text-sm">Bills</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="f-debts" checked={!!filters.debts} onCheckedChange={() => toggle("debts")} />
          <Label htmlFor="f-debts" className="text-sm">Debts</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="f-bnpl" checked={!!filters.bnpl} onCheckedChange={() => toggle("bnpl")} />
          <Label htmlFor="f-bnpl" className="text-sm">BNPL</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="f-sub" checked={!!filters.subscriptions} onCheckedChange={() => toggle("subscriptions")} />
          <Label htmlFor="f-sub" className="text-sm">Subscriptions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="f-payments" checked={!!filters.payments} onCheckedChange={() => toggle("payments")} />
          <Label htmlFor="f-payments" className="text-sm">Payments</Label>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(FiltersToolbarInner);