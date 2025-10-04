import React from "react";
import { Button } from "@/ui/button.jsx";
import { Input } from "@/ui/input.jsx";
import { Label } from "@/ui/label.jsx";
import { Textarea } from "@/ui/textarea.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select.jsx";
import { Card, CardContent } from "@/ui/card.jsx";

const EMPTY_GOAL = {
  title: "",
  target_amount: "",
  current_amount: "",
  target_date: "",
  status: "active",
  category: "",
  notes: "",
};

function sanitize(goal) {
  return {
    ...goal,
    target_amount: goal.target_amount === "" ? 0 : Number(goal.target_amount),
    current_amount: goal.current_amount === "" ? 0 : Number(goal.current_amount),
  };
}

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [formState, setFormState] = React.useState(() => ({ ...EMPTY_GOAL, ...(goal || {}) }));

  React.useEffect(() => {
    setFormState({ ...EMPTY_GOAL, ...(goal || {}) });
  }, [goal?.id]);

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
            <Label htmlFor="goal-title">Goal title</Label>
            <Input
              id="goal-title"
              value={formState.title}
              placeholder="Build an emergency fund"
              onChange={handleChange("title")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="number"
                min="0"
                value={formState.target_amount}
                onChange={handleChange("target_amount")}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-current">Current amount</Label>
              <Input
                id="goal-current"
                type="number"
                min="0"
                value={formState.current_amount}
                onChange={handleChange("current_amount")}
                placeholder="2500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date</Label>
              <Input
                id="goal-date"
                type="date"
                value={formState.target_date ? String(formState.target_date).slice(0, 10) : ""}
                onChange={handleChange("target_date")}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formState.status || "active"} onValueChange={handleChange("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-category">Category</Label>
            <Input
              id="goal-category"
              value={formState.category || ""}
              placeholder="Savings"
              onChange={handleChange("category")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-notes">Notes</Label>
            <Textarea
              id="goal-notes"
              value={formState.notes || ""}
              placeholder="Add helpful context or milestones"
              onChange={handleChange("notes")}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit">Save goal</Button>
            <Button type="button" variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
