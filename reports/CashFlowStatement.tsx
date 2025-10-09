/**
 * @fileoverview Cash Flow Statement component
 * @description Displays cash flow from operating, investing, and financing activities
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/ui/table';
import type { CashFlowData, CashFlowItem, CashFlowSection } from '@/types/financial.types';

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Cash Flow Statement Props
 */
interface CashFlowStatementProps {
  data: CashFlowData | null;
  period: string;
}

/**
 * Cash Flow Statement Component
 * @component
 * @param {CashFlowStatementProps} props - Component props
 * @returns {JSX.Element | null} Cash flow statement display
 */
export default function CashFlowStatement({ data, period }: CashFlowStatementProps): JSX.Element | null {
    if (!data) return null;

    const { operating, investing, financing, netCashFlow } = data;

    /**
     * Render a cash flow section
     * @param {string} title - Section title
     * @param {CashFlowItem[]} items - Section items
     * @param {number} total - Section total
     * @returns {JSX.Element[]} Table rows for the section
     */
    const renderSection = (title: string, items: CashFlowItem[], total: number): JSX.Element[] => [
        <TableRow key={`${title}-header`} className="font-semibold hover:bg-transparent">
            <TableCell className="text-foreground pt-4">{title}</TableCell>
            <TableCell></TableCell>
        </TableRow>,
        ...items.map(item => (
            <TableRow key={item.description} className="hover:bg-muted/50">
                <TableCell className="pl-8 text-muted-foreground">{item.description}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.amount)}</TableCell>
            </TableRow>
        )),
        <TableRow key={`${title}-total`} className="font-medium hover:bg-transparent border-t border-border">
            <TableCell className="text-foreground">Net Cash from {title}</TableCell>
            <TableCell className="text-right text-foreground">{formatCurrency(total)}</TableCell>
        </TableRow>
    ];

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
                <p className="text-muted-foreground">{period}</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderSection("Operating Activities", operating.items, operating.total)}
                        {renderSection("Investing Activities", investing.items, investing.total)}
                        {renderSection("Financing Activities", financing.items, financing.total)}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="text-lg font-bold hover:bg-transparent bg-muted/50">
                            <TableCell className="text-foreground">Net Cash Flow</TableCell>
                            <TableCell className={`text-right ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                {formatCurrency(netCashFlow)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
