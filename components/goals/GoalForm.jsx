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
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/components/utils/calculations";

const categories = [
  { value: "emergency", label: "Emergency Fund" },
  { value: "travel", label: "Travel" },
  { value: "education", label: "Education" },
  { value: "home", label: "Home" },
  { value: "investment", label: "Investment" },
  { value: "wellness", label: "Health & Wellness" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const defaultState = {
  title: "",
  category: "emergency",
  target_amount: "",
  current_amount: "",
  start_date: "",
  target_date: "",
  status: "active",
  notes: "",
};

function coerceNumber(value) {
  if (value === "" || value === null || typeof value === "undefined") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function GoalForm({ goal, onSubmit, onCancel }) {
  const [formState, setFormState] = useState(defaultState);

  useEffect(() => {
    if (!goal) {
      setFormState(defaultState);
      return;
    }

    setFormState({
      title: goal.title ?? goal.name ?? "",
      category: goal.category ?? goal.type ?? "emergency",
      target_amount: goal.target_amount ?? goal.target ?? "",
      current_amount: goal.current_amount ?? goal.saved ?? "",
      start_date: goal.start_date ? goal.start_date.slice(0, 10) : "",
      target_date: goal.target_date ? goal.target_date.slice(0, 10) : goal.deadline ? goal.deadline.slice(0, 10) : "",
      status: goal.status ?? "active",
      notes: goal.notes ?? goal.description ?? "",
    });
  }, [goal]);

  const progress = useMemo(() => {
    const target = Number(formState.target_amount) || 0;
    const current = Number(formState.current_amount) || 0;
    if (!target) return 0;
    return Math.min(100, Math.max(0, (current / target) * 100));
  }, [formState.target_amount, formState.current_amount]);

  const handleChange = (field) => (event) => {
    const value = event?.target ? event.target.value : event;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!onSubmit) return;

    onSubmit({
      ...goal,
      title: formState.title.trim() || undefined,
      name: formState.title.trim() || goal?.name,
      category: formState.category,
      status: formState.status,
      target_amount: coerceNumber(formState.target_amount),
      current_amount: coerceNumber(formState.current_amount),
      start_date: formState.start_date || undefined,
      target_date: formState.target_date || undefined,
      deadline: formState.target_date || undefined,
      notes: formState.notes.trim() || undefined,
      description: formState.notes.trim() || goal?.description,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Goal name</Label>
          <Input
            id="title"
            placeholder="Build an emergency fund"
            value={formState.title}
            onChange={handleChange("title")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formState.category} onValueChange={handleChange("category")}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_amount">Target amount</Label>
          <Input
            id="target_amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.target_amount}
            onChange={handleChange("target_amount")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_amount">Current saved</Label>
          <Input
            id="current_amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.current_amount}
            onChange={handleChange("current_amount")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            type="date"
            value={formState.start_date}
            onChange={handleChange("start_date")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_date">Target date</Label>
          <Input
            id="target_date"
            type="date"
            value={formState.target_date}
            onChange={handleChange("target_date")}
          />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Why this goal matters and how you'll achieve it"
          value={formState.notes}
          onChange={handleChange("notes")}
        />
      </div>

      <div className="rounded-md border border-dashed border-muted p-4 text-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress preview</span>
          <span className="font-medium text-foreground">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
        <div className="mt-2 text-xs text-muted-foreground">
          Saved so far: {formatCurrency(Number(formState.current_amount) || 0)} of {formatCurrency(Number(formState.target_amount) || 0)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="min-w-[140px]">
          {goal ? "Save changes" : "Create goal"}
        </Button>
      </div>
    </form>
  );
}
