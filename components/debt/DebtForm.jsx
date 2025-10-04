import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/components/utils/calculations";

const debtTypes = [
  { value: "credit_card", label: "Credit Card" },
  { value: "loan", label: "Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "student_loan", label: "Student Loan" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paid", label: "Paid" },
  { value: "delinquent", label: "Delinquent" },
];

const defaultFormState = {
  name: "",
  creditor: "",
  type: "credit_card",
  current_balance: "",
  interest_rate: "",
  minimum_payment: "",
  due_date: "",
  status: "active",
  notes: "",
};

function coerceNumber(value) {
  if (value === "" || value === null || typeof value === "undefined") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function DebtForm({ debt, onSubmit, onCancel }) {
  const [formState, setFormState] = useState(defaultFormState);

  useEffect(() => {
    if (!debt) {
      setFormState(defaultFormState);
      return;
    }

    setFormState({
      name: debt.name ?? debt.creditor ?? "",
      creditor: debt.creditor ?? "",
      type: debt.type ?? debt.category ?? "credit_card",
      current_balance: debt.current_balance ?? debt.balance ?? "",
      interest_rate: debt.interest_rate ?? "",
      minimum_payment: debt.minimum_payment ?? "",
      due_date: debt.due_date ? debt.due_date.slice(0, 10) : debt.next_due_date ? debt.next_due_date.slice(0, 10) : "",
      status: debt.status ?? "active",
      notes: debt.notes ?? "",
    });
  }, [debt]);

  const totalInterest = useMemo(() => {
    const balance = Number(formState.current_balance) || 0;
    const rate = Number(formState.interest_rate) || 0;
    return (balance * rate) / 100;
  }, [formState.current_balance, formState.interest_rate]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onSubmit) return;

    onSubmit({
      ...debt,
      name: formState.name.trim() || undefined,
      creditor: formState.creditor.trim() || undefined,
      type: formState.type,
      status: formState.status,
      current_balance: coerceNumber(formState.current_balance),
      balance: coerceNumber(formState.current_balance),
      interest_rate: coerceNumber(formState.interest_rate),
      minimum_payment: coerceNumber(formState.minimum_payment),
      due_date: formState.due_date || undefined,
      notes: formState.notes.trim() || undefined,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Account name</Label>
          <Input
            id="name"
            placeholder="Chase Sapphire Preferred"
            value={formState.name}
            onChange={handleChange("name")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="creditor">Creditor</Label>
          <Input
            id="creditor"
            placeholder="Bank or lender"
            value={formState.creditor}
            onChange={handleChange("creditor")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formState.type} onValueChange={handleChange("type")}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {debtTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formState.status} onValueChange={handleChange("status")}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_balance">Current balance</Label>
          <Input
            id="current_balance"
            type="number"
            min="0"
            step="0.01"
            value={formState.current_balance}
            onChange={handleChange("current_balance")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest_rate">Interest rate (%)</Label>
          <Input
            id="interest_rate"
            type="number"
            min="0"
            step="0.01"
            value={formState.interest_rate}
            onChange={handleChange("interest_rate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_payment">Minimum payment</Label>
          <Input
            id="minimum_payment"
            type="number"
            min="0"
            step="0.01"
            value={formState.minimum_payment}
            onChange={handleChange("minimum_payment")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Next due date</Label>
          <Input
            id="due_date"
            type="date"
            value={formState.due_date}
            onChange={handleChange("due_date")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Payment plan, lender contact, or other notes"
          value={formState.notes}
          onChange={handleChange("notes")}
        />
      </div>

      <div className="rounded-md border border-dashed border-muted p-4 text-sm">
        <div className="font-medium text-foreground">Monthly interest preview</div>
        <div className="text-muted-foreground">
          {formState.current_balance
            ? `Approx. ${formatCurrency(totalInterest / 12)} in interest each month`
            : "Enter balance and rate to preview interest."}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="min-w-[140px]">
          {debt ? "Save changes" : "Add debt"}
        </Button>
      </div>
    </form>
  );
}
