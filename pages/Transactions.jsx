
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction } from                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <FocusTrapWrapper onEscape={() => setShowForm(false)}>
                            <ThemedCard elevated>
                                <CardHeader>
                                    <CardTitle className="text-xl">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TransactionForm
                                        transaction={editingTransaction}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setShowForm(false)}
                                    />
                                </CardContent>
                            </ThemedCard>
                        </FocusTrapWrapper>
                    </FloatingElement>
                )}
                </AnimatePresence>
import TransactionList from '@/transactions/TransactionList.jsx';
import TransactionForm from '@/transactions/TransactionForm.jsx';
import TransactionFilters from '@/transactions/TransactionFilters.jsx';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components.jsx';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations.jsx';
import { LoadingWrapper, TableLoading } from '@/ui/loading.jsx';
import { CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { CreditCard, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { usePageShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FocusTrapWrapper } from '@/ui/FocusTrapWrapper';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filters, setFilters] = useState({});

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        const data = await Transaction.list('-date', 1000);
        setTransactions(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const handleFormSubmit = async (data) => {
        if (editingTransaction) {
            await Transaction.update(editingTransaction.id, data);
        } else {
            await Transaction.create(data);
        }
        await loadTransactions();
        setShowForm(false);
        setEditingTransaction(null);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await Transaction.delete(id);
        await loadTransactions();
    };

    // Keyboard shortcuts
    const filterRef = useRef(null);
    usePageShortcuts({
        onCreate: () => {
            setEditingTransaction(null);
            setShowForm(true);
        },
        onSearch: () => {
            // Focus on filter/search input if available
            filterRef.current?.focus();
        },
        onRefresh: loadTransactions,
    });

    const filteredTransactions = transactions.filter(t => {
        if (!t) return false;
        return (
            (!filters.type || filters.type === 'all' || t.type === filters.type) &&
            (!filters.category || filters.category === 'all' || t.category === filters.category) &&
            (!filters.dateRange?.from || new Date(t.date) >= filters.dateRange.from) &&
            (!filters.dateRange?.to || new Date(t.date) <= filters.dateRange.to)
        );
    });

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <GlassContainer className="mb-8 p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <CreditCard className="h-8 w-8" />
                                        Transactions
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Track your income and expenses with precision.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingTransaction(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Add Transaction'}
                        </ThemedButton>
                    </header>
                </GlassContainer>
                
                <AnimatePresence>
                {showForm && (
                    <FloatingElement className="mb-8">
                        <ThemedCard elevated>
                            <CardHeader>
                                <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Create New Transaction'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionForm
                                    transaction={editingTransaction}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            </CardContent>
                        </ThemedCard>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[600px]">
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TransactionFilters onFilterChange={setFilters} />
                            <LoadingWrapper
                                isLoading={loading}
                                fallback={<TableLoading rows={10} />}
                            >
                                <TransactionList transactions={filteredTransactions} onEdit={handleEdit} onDelete={handleDelete} />
                            </LoadingWrapper>
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
