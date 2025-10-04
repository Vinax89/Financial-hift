import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table.jsx';
import { Button } from '@/ui/button.jsx';
import { Badge } from '@/ui/badge.jsx';

const formatCurrency = (value) => {
    const amount = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(amount)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatRate = (value) => {
    const rate = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(rate)) {
        return '0%';
    }
    return `${rate.toFixed(2)}%`;
};

export default function DebtList({ debts = [], onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Minimum Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {debts.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                            No debt accounts added yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    debts.map((debt) => (
                        <TableRow key={debt.id || debt.name}>
                            <TableCell className="font-medium">{debt.name || debt.account_name}</TableCell>
                            <TableCell>{formatCurrency(debt.balance)}</TableCell>
                            <TableCell>{formatRate(debt.interest_rate)}</TableCell>
                            <TableCell>{formatCurrency(debt.minimum_payment)}</TableCell>
                            <TableCell>
                                <Badge variant={(debt.status || 'active') === 'active' ? 'default' : 'secondary'} className="capitalize">
                                    {debt.status || 'active'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => onEdit?.(debt)}>
                                    Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => onDelete?.(debt.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}
