import React from "react";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Label } from "@/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Card, CardContent } from "@/ui/card.jsx";

const EMPTY_DEBT = {
  name: "",
  balance: "",
  interest_rate: "",
  minimum_payment: "",
  due_date: "",
  type: "loan",
  account_number: "",
};

const OPTIONS = [
  { label: "Loan", value: "loan" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Mortgage", value: "mortgage" },
  { label: "Other", value: "other" },
];

function sanitize(debt) {
  return {
    ...debt,
    balance: debt.balance === "" ? 0 : Number(debt.balance),
    interest_rate: debt.interest_rate === "" ? null : Number(debt.interest_rate),
    minimum_payment: debt.minimum_payment === "" ? null : Number(debt.minimum_payment),
  };
}

export default function DebtForm({ debt, onSubmit, onCancel }) {
  const [formState, setFormState] = React.useState(() => ({ ...EMPTY_DEBT, ...(debt || {}) }));

  React.useEffect(() => {
    setFormState({ ...EMPTY_DEBT, ...(debt || {}) });
  }, [debt?.id]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(sanitize(formState));
  };

  return (
    <Card className="border-border/60">
      <CardContent className="pt-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="debt-name">Name</Label>
            <Input
              id="debt-name"
              value={formState.name}
              placeholder="Student loan"
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="debt-balance">Balance</Label>
              <Input
                id="debt-balance"
                type="number"
                min="0"
                value={formState.balance}
                onChange={handleChange("balance")}
                placeholder="12000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-rate">Interest rate (%)</Label>
              <Input
                id="debt-rate"
                type="number"
                step="0.01"
                min="0"
                value={formState.interest_rate}
                onChange={handleChange("interest_rate")}
                placeholder="4.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="debt-payment">Minimum payment</Label>
              <Input
                id="debt-payment"
                type="number"
                min="0"
                value={formState.minimum_payment}
                onChange={handleChange("minimum_payment")}
                placeholder="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-date">Due date</Label>
              <Input
                id="debt-date"
                type="date"
                value={formState.due_date ? String(formState.due_date).slice(0, 10) : ""}
                onChange={handleChange("due_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Debt type</Label>
            <Select value={formState.type || "loan"} onValueChange={handleChange("type")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="debt-account">Account number (optional)</Label>
            <Input
              id="debt-account"
              value={formState.account_number || ""}
              onChange={handleChange("account_number")}
              placeholder="1234"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit">Save debt</Button>
            <Button type="button" variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
