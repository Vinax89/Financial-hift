import React, { useEffect, useState } from 'react';
import { Input } from '@/ui/input.jsx';
import { Label } from '@/ui/label.jsx';
import { Textarea } from '@/ui/textarea.jsx';
import { Button } from '@/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';
import { format } from 'date-fns';

const defaultGoal = {
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    status: 'active'
};

const coerceNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export default function GoalForm({ goal, onSubmit, onCancel }) {
    const [formState, setFormState] = useState(defaultGoal);

    useEffect(() => {
        if (goal) {
            setFormState({
                title: goal.title || '',
                description: goal.description || '',
                target_amount: goal.target_amount ?? '',
                current_amount: goal.current_amount ?? '',
                deadline: goal.deadline ? format(new Date(goal.deadline), 'yyyy-MM-dd') : '',
                status: goal.status || 'active'
            });
        } else {
            setFormState(defaultGoal);
        }
    }, [goal]);

    const handleChange = (field) => (event) => {
        const value = event?.target ? event.target.value : event;
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.({
            title: formState.title.trim(),
            description: formState.description.trim(),
            target_amount: coerceNumber(formState.target_amount),
            current_amount: coerceNumber(formState.current_amount),
            deadline: formState.deadline ? new Date(formState.deadline).toISOString() : null,
            status: formState.status
        });
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
                <Label htmlFor="goal-title">Title</Label>
                <Input
                    id="goal-title"
                    value={formState.title}
                    onChange={handleChange('title')}
                    placeholder="Build an emergency fund"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                    id="goal-description"
                    value={formState.description}
                    onChange={handleChange('description')}
                    placeholder="Add context or milestones to stay on track"
                    rows={3}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="goal-target">Target Amount</Label>
                    <Input
                        id="goal-target"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.target_amount}
                        onChange={handleChange('target_amount')}
                        placeholder="5000"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="goal-current">Current Amount</Label>
                    <Input
                        id="goal-current"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.current_amount}
                        onChange={handleChange('current_amount')}
                        placeholder="1500"
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="goal-deadline">Target Date</Label>
                    <Input
                        id="goal-deadline"
                        type="date"
                        value={formState.deadline}
                        onChange={handleChange('deadline')}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="goal-status">Status</Label>
                    <Select value={formState.status} onValueChange={handleChange('status')}>
                        <SelectTrigger id="goal-status">
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
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onCancel?.()}>
                    Cancel
                </Button>
                <Button type="submit">{goal ? 'Update Goal' : 'Create Goal'}</Button>
            </div>
        </form>
    );
}
