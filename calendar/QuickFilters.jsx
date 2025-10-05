
import React from "react";
import { Button } from "@/ui/button.jsx";

function QuickFilters({ value, onChange }) {
  const setAll = React.useCallback(() => onChange({ shifts: true, bills: true, debts: true, bnpl: true, subscriptions: true, payments: true }), [onChange]);
  const setNone = React.useCallback(() => onChange({ shifts: false, bills: false, debts: false, bnpl: false, subscriptions: false, payments: false }), [onChange]);
  const workOnly = React.useCallback(() => onChange({ shifts: true, bills: false, debts: false, bnpl: false, subscriptions: false, payments: false }), [onChange]);
  const essentials = React.useCallback(() => onChange({ shifts: false, bills: true, debts: true, bnpl: true, subscriptions: true, payments: true }), [onChange]);
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
