import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function IncomeStatement({ data, period }) {
    if (!data) return null;

    const { income, expenses, netIncome } = data;

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle>Income Statement</CardTitle>
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
                        <TableRow className="font-semibold hover:bg-transparent">
                            <TableCell className="text-foreground">Revenue</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        {income.map(item => (
                            <TableRow key={item.category} className="hover:bg-muted/50">
                                <TableCell className="pl-8 text-muted-foreground">{item.category}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold hover:bg-transparent border-t border-border">
                            <TableCell className="text-foreground">Total Revenue</TableCell>
                            <TableCell className="text-right text-foreground">{formatCurrency(income.reduce((a, b) => a + b.amount, 0))}</TableCell>
                        </TableRow>

                        <TableRow className="font-semibold hover:bg-transparent">
                            <TableCell className="text-foreground pt-6">Expenses</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                         {expenses.map(item => (
                            <TableRow key={item.category} className="hover:bg-muted/50">
                                <TableCell className="pl-8 text-muted-foreground">{item.category}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-semibold hover:bg-transparent border-t border-border">
                            <TableCell className="text-foreground">Total Expenses</TableCell>
                            <TableCell className="text-right text-foreground">{formatCurrency(expenses.reduce((a, b) => a + b.amount, 0))}</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow className="text-lg font-bold hover:bg-transparent bg-muted/50">
                            <TableCell className="text-foreground">Net Income</TableCell>
                            <TableCell className={`text-right ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                {formatCurrency(netIncome)}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}