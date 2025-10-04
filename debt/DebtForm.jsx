import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription } from "@/components/ui/card";

const DEFAULT_FORM = {
  name: "",
  balance: "",
  interest_rate: "",
  minimum_payment: "",
  due_day: "",
};

export default function DebtForm({ debt, onSubmit, onCancel }) {
  const [formState, setFormState] = React.useState(DEFAULT_FORM);

  React.useEffect(() => {
    if (debt) {
      setFormState({
        name: debt.name ?? "",
        balance: debt.balance ?? debt.principal ?? "",
        interest_rate: debt.interest_rate ?? debt.apr ?? "",
        minimum_payment: debt.minimum_payment ?? debt.min_payment ?? "",
        due_day: debt.due_day ?? debt.due_date ?? "",
      });
    } else {
      setFormState(DEFAULT_FORM);
    }
  }, [debt]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof onSubmit !== "function") return;

    const payload = {
      name: formState.name,
      balance: Number.parseFloat(formState.balance) || 0,
      interest_rate: Number.parseFloat(formState.interest_rate) || 0,
      minimum_payment: Number.parseFloat(formState.minimum_payment) || 0,
      due_day: formState.due_day ? Number.parseInt(formState.due_day, 10) : null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="debt-name">Account name</Label>
        <Input
          id="debt-name"
          placeholder="e.g. Chase Sapphire"
          value={formState.name}
          onChange={handleChange("name")}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-balance">Current balance</Label>
          <Input
            id="debt-balance"
            type="number"
            min="0"
            step="0.01"
            value={formState.balance}
            onChange={handleChange("balance")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-minimum">Minimum payment</Label>
          <Input
            id="debt-minimum"
            type="number"
            min="0"
            step="0.01"
            value={formState.minimum_payment}
            onChange={handleChange("minimum_payment")}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-rate">Interest rate (APR %)</Label>
          <Input
            id="debt-rate"
            type="number"
            min="0"
            step="0.01"
            value={formState.interest_rate}
            onChange={handleChange("interest_rate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-due">Due day of month</Label>
          <Input
            id="debt-due"
            type="number"
            min="1"
            max="31"
            value={formState.due_day ?? ""}
            onChange={handleChange("due_day")}
          />
          <CardDescription>The day of the month your payment is due (optional).</CardDescription>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {typeof onCancel === "function" && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{debt ? "Save changes" : "Create account"}</Button>
      </div>
    </form>
  );
}
