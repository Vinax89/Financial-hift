/**
 * @fileoverview Recent transactions display component (TypeScript)
 * @description Shows recent transactions with virtualization for performance,
 * category badges, transaction type indicators, and scroll position restoration
 */

import React, { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Badge } from "@/ui/badge.jsx";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { TransactionSkeleton } from "@/shared/SkeletonLoaders";
import { VirtualList } from "@/utils/virtualScroll.js";
import type { Transaction } from "@/types/entities";

/**
 * Category color mappings for transaction badges
 */
const categoryColors: Record<string, string> = {
    food_dining: "bg-red-100 text-red-800",
    transportation: "bg-orange-100 text-orange-800",
    shopping: "bg-yellow-100 text-yellow-800",
    entertainment: "bg-green-100 text-green-800",
    bills_utilities: "bg-cyan-100 text-cyan-800",
    healthcare: "bg-blue-100 text-blue-800",
    education: "bg-purple-100 text-purple-800",
    travel: "bg-pink-100 text-pink-800",
    groceries: "bg-emerald-100 text-emerald-800",
    housing: "bg-amber-100 text-amber-800",
    insurance: "bg-indigo-100 text-indigo-800",
    salary: "bg-emerald-100 text-emerald-800",
    freelance: "bg-blue-100 text-blue-800",
    business: "bg-purple-100 text-purple-800",
    other_income: "bg-green-100 text-green-800",
    other_expense: "bg-gray-100 text-gray-800"
};

/**
 * Props for RecentTransactions component
 */
interface RecentTransactionsProps {
    /** List of recent transactions to display */
    transactions?: Transaction[];
    /** Loading state indicator */
    isLoading?: boolean;
}

/**
 * Props for TransactionRow component
 */
interface TransactionRowProps {
    /** Transaction data to render */
    transaction: Transaction;
}

/**
 * Recent Transactions Component
 * 
 * Displays a virtualized list of recent transactions with:
 * - Category badges with color coding
 * - Transaction type indicators (income/expense)
 * - Formatted dates and currency amounts
 * - Empty state when no transactions exist
 * - Loading skeleton during data fetch
 * 
 * @component
 * @param {RecentTransactionsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function RecentTransactions({ transactions = [], isLoading = false }: RecentTransactionsProps): JSX.Element {
    /**
     * Format amount as currency
     */
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.abs(amount));
    };

    /**
     * Transaction row component for virtualization
     */
    const TransactionRow = useMemo(() => {
        return ({ transaction }: TransactionRowProps) => (
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                            ? 'bg-emerald-100' 
                            : 'bg-rose-100'
                    }`}>
                        {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <ArrowDownCircle className="h-4 w-4 text-rose-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge 
                                variant="secondary"
                                className={categoryColors[transaction.category] || categoryColors.other_expense}
                            >
                                {transaction.category.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-slate-500">
                                {format(new Date(transaction.date), "MMM d")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`font-bold ${
                    transaction.type === 'income' 
                        ? 'text-emerald-600' 
                        : 'text-slate-900'
                }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
            </div>
        );
    }, []);

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TransactionSkeleton count={5} className="" />
                ) : transactions.length > 0 ? (
                    <VirtualList
                        items={transactions}
                        itemHeight={88}
                        height={440}
                        listId="recent-transactions"
                        renderItem={(transaction: Transaction) => (
                            <TransactionRow key={transaction.id} transaction={transaction} />
                        )}
                        className="space-y-3"
                    />
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No transactions yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default memo(RecentTransactions);

