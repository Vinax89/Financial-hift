import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/ui/table.jsx';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function BalanceSheet({ data, date }) {
    if (!data) return null;

    const { assets, liabilities, netWorth } = data;

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <p className="text-muted-foreground">As of {date}</p>
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
                        <TableRow className="font-semibold hover:bg-transparent">
                            <TableCell className="text-foreground">Assets</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {assets.map(item => (
                            <TableRow key={item.name} className="hover:bg-muted/50">
                                <TableCell className="pl-8 text-muted-foreground">{item.name}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold hover:bg-transparent border-t border-border">
                            <TableCell className="text-foreground">Total Assets</TableCell>
                            <TableCell className="text-right text-foreground">{formatCurrency(assets.reduce((a, b) => a + b.value, 0))}</TableCell>
                        </TableRow>

                        <TableRow className="font-semibold hover:bg-transparent">
                            <TableCell className="text-foreground pt-6">Liabilities</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                         {liabilities.map(item => (
                            <TableRow key={item.name} className="hover:bg-muted/50">
                                <TableCell className="pl-8 text-muted-foreground">{item.name}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold hover:bg-transparent border-t border-border">
                            <TableCell className="text-foreground">Total Liabilities</TableCell>
                            <TableCell className="text-right text-foreground">{formatCurrency(liabilities.reduce((a, b) => a + b.value, 0))}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="text-lg font-bold hover:bg-transparent bg-muted/50">
                            <TableCell className="text-foreground">Net Worth</TableCell>
                            <TableCell className={`text-right ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                {formatCurrency(netWorth)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}