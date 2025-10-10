/**
 * @fileoverview Recent transactions display component
 * @description Shows recent transactions with virtualization for performance,
 * category badges, transaction type indicators, and scroll position restoration
 */

import React, { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { TransactionSkeleton } from "@/shared/SkeletonLoaders";
import { VirtualList } from '@/utils/virtualScroll';

/**
 * Category color mappings for transaction badges
 * @constant
 */
const categoryColors = {
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
 * Recent Transactions Component
 * @component
 * @param {Object} props
 * @param {Array} props.transactions - List of recent transactions
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
function RecentTransactions({ transactions = [], isLoading }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.abs(amount));
    };

    // Transaction row component for virtualization
    const TransactionRow = useMemo(() => {
        return ({ transaction }) => (
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
                        <p className="font-medium text-slate-900">{transaction.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge 
                                variant="secondary"
                                className={categoryColors[transaction.category]}
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
                    <TransactionSkeleton count={5} />
                ) : transactions.length > 0 ? (
                    <VirtualList
                        items={transactions}
                        itemHeight={88}
                        height={440}
                        listId="recent-transactions"
                        renderItem={(transaction) => (
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
