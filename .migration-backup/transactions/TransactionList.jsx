/**
 * @fileoverview Virtualized transaction list with filtering and actions
 * @description Displays transactions in a performant virtualized list with
 * edit/delete actions, type-based styling, and empty states
 */

import React, { useMemo, memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Badge } from '@/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/ui/dropdown-menu';
import { MoreHorizontal, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from "date-fns";
import { TableLoading } from '@/ui/loading';
import { EmptyState } from '../ui/empty-state';
import { VirtualizedList } from '../optimized/VirtualizedList';

/**
 * Format currency value for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

/**
 * Badge styling by transaction type
 * @constant {Object.<string, string>}
 */
const TYPE_BADGE_CLASS = {
  income: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  expense: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

/**
 * Transaction row component with edit/delete actions
 * @param {Object} props
 * @param {Object} props.transaction - Transaction data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @returns {JSX.Element}
 */
const TransactionRow = ({ transaction, onEdit, onDelete }) => {
    const isIncome = transaction.type === 'income';

    return (
        <TableRow className="hover:bg-muted/50 h-[60px]">
            <TableCell>
                <div className="flex items-center gap-3">
                    {isIncome ? <ArrowUpCircle className="h-5 w-5 text-emerald-500" /> : <ArrowDownCircle className="h-5 w-5 text-rose-500" />}
                    <div>
                        <div className="font-semibold text-foreground">{transaction.title}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(transaction.date), 'MMM d, yyyy')}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge className={TYPE_BADGE_CLASS[isIncome ? 'income' : 'expense']}>
                    {transaction.category?.replace(/_/g, ' ') || 'N/A'}
                </Badge>
            </TableCell>
            <TableCell className={`font-medium ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
};

const MemoizedTransactionRow = React.memo(TransactionRow);

/**
 * Transaction List Component
 * @component
 * @param {Object} props
 * @param {Array} props.transactions - List of transactions to display
 * @param {Function} props.onEdit - Edit transaction handler
 * @param {Function} props.onDelete - Delete transaction handler
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
function TransactionList({ transactions, onEdit, onDelete, isLoading }) {
    
    if (isLoading) {
        return <TableLoading rows={10} columns={4} />;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <EmptyState
                title="No Transactions Found"
                description="Add a new transaction or adjust your filters."
            />
        );
    }
    
    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-border/60">
                        <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs">Transaction</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs">Category</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-muted-foreground/80 text-xs">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
             <VirtualizedList
                items={transactions}
                renderItem={(transaction) => (
                    <Table>
                        <TableBody>
                           <MemoizedTransactionRow transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
                        </TableBody>
                    </Table>
                )}
                itemHeight={60}
                containerHeight="60vh"
            />
        </div>
    );
}

export default memo(TransactionList);
