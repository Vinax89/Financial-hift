import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultGoal = {
  title: "",
  targetAmount: "",
  currentAmount: "",
  deadline: ""
};

const GoalForm = ({ initialData, onSubmit, onCancel }) => {
  const [formState, setFormState] = React.useState(() => ({
    ...defaultGoal,
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
        <CardTitle>{initialData ? "Edit Goal" : "Create Goal"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formState.title} onChange={handleChange} placeholder="Emergency fund" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount</Label>
          <Input
            id="targetAmount"
            name="targetAmount"
            type="number"
            inputMode="decimal"
            value={formState.targetAmount}
            onChange={handleChange}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current Amount</Label>
          <Input
            id="currentAmount"
            name="currentAmount"
            type="number"
            inputMode="decimal"
            value={formState.currentAmount}
            onChange={handleChange}
            placeholder="1500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Target Date</Label>
          <Input id="deadline" name="deadline" type="date" value={formState.deadline} onChange={handleChange} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save Goal</Button>
      </CardFooter>
    </Card>
  );
};

export default GoalForm;
