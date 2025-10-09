/**
 * @fileoverview Upcoming due items display component (TypeScript)
 * @description Shows upcoming bills and debt payments sorted by due date
 */

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';
import { format } from 'date-fns';
import type { Bill, Debt } from '@/types/entities';

/**
 * Type for upcoming payment items (bill or debt)
 */
type ItemType = 'Bill' | 'Debt';

/**
 * Unified upcoming payment item
 */
interface UpcomingItem {
    id: string;
    name: string;
    amount: number;
    dueDate: Date | string;
    type: ItemType;
}

/**
 * Extended Bill with optional fields
 */
interface ExtendedBill extends Bill {
    amount_due?: number;
    vendor?: string;
    next_due_date?: string | Date;
}

/**
 * Extended Debt with optional fields
 */
interface ExtendedDebt extends Debt {
    account_name?: string;
    next_payment_date?: string | Date;
}

/**
 * Props for UpcomingDue component
 */
interface UpcomingDueProps {
    /** List of upcoming bills */
    bills?: ExtendedBill[];
    /** List of debt accounts with payment dates */
    debts?: ExtendedDebt[];
}

/**
 * Format date value for display
 * @param {Date|string} value - Date value to format
 * @returns {string} Formatted date string (MMM d) or fallback
 */
const formatDate = (value: Date | string | undefined): string => {
    if (!value) return '—';
    try {
        return format(new Date(value), 'MMM d');
    } catch (error) {
        return '—';
    }
};

/**
 * Format currency value for display
 * @param {number} value - Numeric value to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value: number): string => {
    if (!Number.isFinite(value)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Upcoming Due Component
 * 
 * Displays upcoming bills and debt payments with:
 * - Due dates sorted chronologically
 * - Type badges (Bill vs Debt)
 * - Amount due for each item
 * - Empty state when no items are due
 * - Limited to 6 most urgent items
 * 
 * @component
 * @param {UpcomingDueProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function UpcomingDue({ bills = [], debts = [] }: UpcomingDueProps): JSX.Element {
    const items = useMemo<UpcomingItem[]>(() => {
        const upcomingBills: UpcomingItem[] = (Array.isArray(bills) ? bills : []).map((bill) => ({
            id: `bill-${bill.id || bill.name}`,
            name: bill.name || bill.vendor || 'Bill',
            amount: bill.amount_due || bill.amount || 0,
            dueDate: bill.due_date || bill.next_due_date || new Date(),
            type: 'Bill' as ItemType
        }));

        const upcomingDebts: UpcomingItem[] = (Array.isArray(debts) ? debts : []).map((debt) => ({
            id: `debt-${debt.id || debt.name}`,
            name: debt.name || debt.account_name || 'Debt',
            amount: debt.minimum_payment || 0,
            dueDate: debt.next_payment_date || debt.due_date || new Date(),
            type: 'Debt' as ItemType
        }));

        return [...upcomingBills, ...upcomingDebts]
            .filter((item) => item.dueDate)
            .filter((item) => !isNaN(new Date(item.dueDate).getTime()))
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
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

export default memo(UpcomingDue);

