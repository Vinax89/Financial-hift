import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table.jsx';
import { Button } from '@/ui/button.jsx';
import { Badge } from '@/ui/badge.jsx';
import { format } from 'date-fns';

const statusVariant = {
    active: 'default',
    completed: 'success',
    paused: 'secondary'
};

const formatCurrency = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    }).format(value);
};

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d, yyyy');
    } catch (error) {
        return '—';
    }
};

export default function GoalList({ goals = [], onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {goals.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                            No goals yet. Create your first goal to start tracking progress.
                        </TableCell>
                    </TableRow>
                ) : (
                    goals.map((goal) => {
                        const statusKey = (goal.status || 'active').toLowerCase();
                        return (
                            <TableRow key={goal.id || goal.title}>
                                <TableCell className="font-medium">{goal.title}</TableCell>
                                <TableCell>{formatCurrency(goal.target_amount)}</TableCell>
                                <TableCell>{formatCurrency(goal.current_amount)}</TableCell>
                                <TableCell>{formatDate(goal.deadline)}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[statusKey] || 'outline'} className="capitalize">
                                        {goal.status || 'active'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => onEdit?.(goal)}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onDelete?.(goal.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
