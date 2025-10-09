
import React, { useState } from 'react';
import { useBudgets, useTransactions, useCreateBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useEntityQueries';
import BudgetOverview from '@/budget/BudgetOverview';
import CategoryBreakdown from '@/budget/CategoryBreakdown';
import BudgetForm from '@/budget/BudgetForm';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { LoadingWrapper, CardLoading } from '@/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Plus, Wallet } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { usePageShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FocusTrapWrapper } from '@/ui/FocusTrapWrapper';
import { ErrorBoundary } from '@/shared/ErrorBoundary';
import { useToast } from '@/ui/use-toast';

export default function BudgetPage() {
    // React Query hooks - automatic caching and background refetching
    const { data: budgets = [], isLoading: loadingBudgets, refetch: refetchBudgets } = useBudgets();
    const { data: transactions = [], isLoading: loadingTransactions } = useTransactions('-date', 500);
    
    // Mutation hooks with optimistic updates
    const createBudget = useCreateBudget();
    const updateBudget = useUpdateBudget();
    const deleteBudget = useDeleteBudget();
    
    const { toast } = useToast();
    
    // Combined loading state
    const loading = loadingBudgets || loadingTransactions;
    
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingBudget, setEditingBudget] = useState<any>(null);

    const handleFormSubmit = async (data) => {
        try {
            if (editingBudget) {
                await updateBudget.mutateAsync({ id: editingBudget.id, data });
                toast({
                    title: 'Budget updated',
                    description: 'Your budget limit has been updated successfully.',
                });
            } else {
                await createBudget.mutateAsync(data);
                toast({
                    title: 'Budget created',
                    description: 'Your new budget limit has been set successfully.',
                });
            }
            setShowForm(false);
            setEditingBudget(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save budget. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteBudget.mutateAsync(id);
            toast({
                title: 'Budget deleted',
                description: 'Your budget limit has been removed successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete budget. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Keyboard shortcuts
    usePageShortcuts({
        onCreate: () => {
            setEditingBudget(null);
            setShowForm(true);
        },
        onRefresh: refetchBudgets,
    });

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <Wallet className="h-8 w-8" />
                                        Monthly Budget
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Plan and monitor your spending habits.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingBudget(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Set Budget Limit'}
                        </ThemedButton>
                    </header>
                </GlassContainer>

                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <FocusTrapWrapper onEscape={() => setShowForm(false)}>
                            <ThemedCard elevated>
                                <CardHeader>
                                    <CardTitle>{editingBudget ? 'Edit Budget' : 'Set New Budget Limit'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ErrorBoundary>
                                        <BudgetForm
                                            budget={editingBudget}
                                            onSubmit={handleFormSubmit}
                                            onCancel={() => setShowForm(false)}
                                        />
                                    </ErrorBoundary>
                                </CardContent>
                            </ThemedCard>
                        </FocusTrapWrapper>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <div className="min-h-[600px] space-y-8">
                    <LoadingWrapper isLoading={loading} fallback={<CardLoading />}>
                        <FloatingElement disabled={loading}>
                            <ThemedCard elevated>
                               <BudgetOverview budgets={budgets} transactions={transactions} />
                            </ThemedCard>
                        </FloatingElement>
                        <FloatingElement disabled={loading}>
                            <ThemedCard elevated>
                                <CategoryBreakdown budgets={budgets} transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
                            </ThemedCard>
                        </FloatingElement>
                    </LoadingWrapper>
                </div>
            </div>
        </div>
    );
}
