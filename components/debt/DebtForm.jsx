import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultFormState = {
  name: "",
  balance: "",
  rate: "",
  minimum_payment: ""
};

const DebtForm = ({ initialData, onSubmit, onCancel }) => {
  const [formState, setFormState] = React.useState(() => ({
    ...defaultFormState,
    ...initialData
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(formState);
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="bg-card">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Debt" : "Add Debt"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formState.name} onChange={handleChange} placeholder="Personal Loan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="balance">Balance</Label>
          <Input
            id="balance"
            name="balance"
            type="number"
            inputMode="decimal"
            value={formState.balance}
            onChange={handleChange}
            placeholder="2500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Interest Rate (%)</Label>
          <Input
            id="rate"
            name="rate"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={formState.rate}
            onChange={handleChange}
            placeholder="7.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_payment">Minimum Payment</Label>
          <Input
            id="minimum_payment"
            name="minimum_payment"
            type="number"
            inputMode="decimal"
            value={formState.minimum_payment}
            onChange={handleChange}
            placeholder="150"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save</Button>
      </CardFooter>
    </Card>
  );
};

export default DebtForm;
