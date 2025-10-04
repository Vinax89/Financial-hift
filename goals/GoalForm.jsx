import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EMPTY_GOAL = {
  title: "",
  description: "",
  target_amount: "",
  current_amount: "",
  due_date: "",
};

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [formState, setFormState] = React.useState(EMPTY_GOAL);

  React.useEffect(() => {
    if (goal) {
      setFormState({
        title: goal.title ?? "",
        description: goal.description ?? "",
        target_amount: goal.target_amount ?? goal.target ?? "",
        current_amount: goal.current_amount ?? goal.saved ?? "",
        due_date: goal.due_date ? String(goal.due_date).slice(0, 10) : "",
      });
    } else {
      setFormState(EMPTY_GOAL);
    }
  }, [goal]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof onSubmit !== "function") return;

    onSubmit({
      title: formState.title,
      description: formState.description,
      target_amount: Number.parseFloat(formState.target_amount) || 0,
      current_amount: Number.parseFloat(formState.current_amount) || 0,
      due_date: formState.due_date || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal title</Label>
        <Input
          id="goal-title"
          placeholder="e.g. Emergency fund"
          value={formState.title}
          onChange={handleChange("title")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-description">Why is this important?</Label>
        <Textarea
          id="goal-description"
          placeholder="Describe the motivation, timeline, or steps"
          value={formState.description}
          onChange={handleChange("description")}
          rows={4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target amount</Label>
          <Input
            id="goal-target"
            type="number"
            min="0"
            step="0.01"
            value={formState.target_amount}
            onChange={handleChange("target_amount")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-current">Current progress</Label>
          <Input
            id="goal-current"
            type="number"
            min="0"
            step="0.01"
            value={formState.current_amount}
            onChange={handleChange("current_amount")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-due">Target date</Label>
        <Input
          id="goal-due"
          type="date"
          value={formState.due_date}
          onChange={handleChange("due_date")}
        />
      </div>

      <div className="flex justify-end gap-2">
        {typeof onCancel === "function" && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{goal ? "Save goal" : "Create goal"}</Button>
      </div>
    </form>
  );
}
