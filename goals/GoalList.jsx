/**
 * @fileoverview Goal list component displaying all financial goals in a table
 * @description Shows goal details including target amount, current progress, deadline,
 * and status with edit/delete actions
 */

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table.jsx';
import { Button } from '@/ui/button.jsx';
import { Badge } from '@/ui/badge.jsx';
import { format } from 'date-fns';

/**
 * Badge variants for goal status
 * @type {Object.<string, string>}
 */
const statusVariant = {
    active: 'default',
    completed: 'secondary',
    paused: 'outline'
};

/**
 * Format value as USD currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
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

/**
 * Format date for display
 * @param {string|Date} value - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (value) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d, yyyy');
    } catch (error) {
        return '—';
    }
};

/**
 * Goal list table component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.goals=[]] - List of financial goals
 * @param {Function} props.onEdit - Edit goal handler
 * @param {Function} props.onDelete - Delete goal handler
 * @returns {JSX.Element} Goals table
 */
function GoalList({ goals = [], onEdit, onDelete }) {
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

export default React.memo(GoalList);
