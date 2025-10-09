// @ts-nocheck
/**
 * @fileoverview Quick filters component for calendar event types
 * @description Preset filter buttons for common calendar view configurations
 */

import React from "react";
import type * as CalendarTypes from "./types";
import { Button } from "@/ui/button";

/**
 * Quick filter buttons for calendar events
 * @param {Object} props - Component props
 * @param {Object} props.value - Current filter values (unused)
 * @param {Function} props.onChange - Filter change handler
 * @returns {JSX.Element} Filter buttons
 */
function QuickFilters({ value, onChange }: QuickFiltersProps) {
  /** Show all event types */
  const setAll = React.useCallback(() => onChange({ shifts: true, bills: true, debts: true, bnpl: true, subscriptions: true, payments: true }), [onChange]);
  /** Hide all event types */
  const setNone = React.useCallback(() => onChange({ shifts: false, bills: false, debts: false, bnpl: false, subscriptions: false, payments: false }), [onChange]);
  /** Show only work shifts */
  const workOnly = React.useCallback(() => onChange({ shifts: true, bills: false, debts: false, bnpl: false, subscriptions: false, payments: false }), [onChange]);
  /** Show essential bills and obligations */
  const essentials = React.useCallback(() => onChange({ shifts: false, bills: true, debts: true, bnpl: true, subscriptions: true, payments: true }), [onChange]);
  /** Show only payments */
  const paymentsOnly = React.useCallback(() => onChange({ shifts: false, bills: false, debts: false, bnpl: false, subscriptions: false, payments: true }), [onChange]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={setAll}>All</Button>
      <Button size="sm" variant="outline" onClick={setNone}>None</Button>
      <Button size="sm" variant="outline" onClick={workOnly}>Work</Button>
      <Button size="sm" variant="outline" onClick={essentials}>Essentials</Button>
      <Button size="sm" variant="outline" onClick={paymentsOnly}>Payments</Button>
    </div>
  );
}

export default React.memo(QuickFilters);
