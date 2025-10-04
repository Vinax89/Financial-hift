import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';
import { format } from 'date-fns';

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d');
    } catch (error) {
        return '—';
    }
};

const formatCurrency = (value) => {
    const amount = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(amount)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function UpcomingDue({ bills = [], debts = [] }) {
    const items = useMemo(() => {
        const upcomingBills = (Array.isArray(bills) ? bills : []).map((bill) => ({
            id: `bill-${bill.id || bill.name}`,
            name: bill.name || bill.vendor || 'Bill',
            amount: bill.amount_due || bill.amount || 0,
            dueDate: bill.due_date || bill.next_due_date,
            type: 'Bill'
        }));

        const upcomingDebts = (Array.isArray(debts) ? debts : []).map((debt) => ({
            id: `debt-${debt.id || debt.name}`,
            name: debt.name || debt.account_name || 'Debt',
            amount: debt.minimum_payment || 0,
            dueDate: debt.next_payment_date || debt.due_date,
            type: 'Debt'
        }));

        return [...upcomingBills, ...upcomingDebts]
            .filter((item) => item.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 6);
    }, [bills, debts]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upcoming Due</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6 text-center">
                        Nothing due in the next few weeks.
                    </div>
                ) : (
                    <ScrollArea className="h-60">
                        <div className="space-y-3 py-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                    <div>
                                        <div className="text-sm font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">Due {formatDate(item.dueDate)}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={item.type === 'Bill' ? 'secondary' : 'outline'}>{item.type}</Badge>
                                        <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
