
import React, { useState, useRef } from 'react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useEntityQueries';
import TransactionList from '@/transactions/TransactionList';
import TransactionForm from '@/transactions/TransactionForm';
import TransactionFilters from '@/transactions/TransactionFilters';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { LoadingWrapper, TableLoading } from '@/ui/loading';
import { ShimmerEffect } from '@/loading/LoadingStates';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { CreditCard, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { usePageShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FocusTrapWrapper } from '@/ui/FocusTrapWrapper';
import { useToast } from '@/ui/use-toast';

export default function TransactionsPage() {
    // React Query hooks - automatic caching and background refetching
    const { data: transactions = [], isLoading: loading } = useTransactions();
    
    // Mutation hooks with optimistic updates
    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const deleteTransaction = useDeleteTransaction();
    
    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filters, setFilters] = useState({});
    const { toast } = useToast();

    const handleFormSubmit = async (data) => {
        try {
            if (editingTransaction) {
                await updateTransaction.mutateAsync({ id: editingTransaction.id, data });
                toast({
                    title: 'Transaction updated',
                    description: 'Your transaction has been updated successfully.',
                });
            } else {
                await createTransaction.mutateAsync(data);
                toast({
                    title: 'Transaction created',
                    description: 'Your new transaction has been recorded successfully.',
                });
            }
            setShowForm(false);
            setEditingTransaction(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save transaction. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteTransaction.mutateAsync(id);
            toast({
                title: 'Transaction deleted',
                description: 'Your transaction has been deleted successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete transaction. Please try again.',
                variant: 'destructive',
            });
        }
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
        onRefresh: () => {
            // React Query will handle refetching automatically
            // No manual refresh needed - data is always fresh
        },
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

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[600px]">
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TransactionFilters onFilterChange={setFilters} />
                            <LoadingWrapper
                                isLoading={loading}
                                fallback={<ShimmerEffect variant="table" className="min-h-[400px]" />}
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
