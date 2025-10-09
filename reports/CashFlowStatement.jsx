import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/ui/table';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function CashFlowStatement({ data, period }) {
    if (!data) return null;

    const { operating, investing, financing, netCashFlow } = data;

    const renderSection = (title, items, total) => (
        <>
            <TableRow className="font-semibold hover:bg-transparent">
                <TableCell className="text-foreground pt-4">{title}</TableCell>
                <TableCell></TableCell>
            </TableRow>
            {items.map(item => (
                <TableRow key={item.description} className="hover:bg-muted/50">
                    <TableCell className="pl-8 text-muted-foreground">{item.description}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
            ))}
            <TableRow className="font-medium hover:bg-transparent border-t border-border">
                <TableCell className="text-foreground">Net Cash from {title}</TableCell>
                <TableCell className="text-right text-foreground">{formatCurrency(total)}</TableCell>
            </TableRow>
        </>
    );

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