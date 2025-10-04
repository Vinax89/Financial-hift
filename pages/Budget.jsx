
import React, { useState, useEffect } from 'react';
import { Budget } from '@/api/entities';
import { Transaction } from '@/api/entities';
import BudgetOverview from '../components/budget/BudgetOverview';
import CategoryBreakdown from '../components/budget/CategoryBreakdown';
import BudgetForm from '../components/budget/BudgetForm';
import { ThemedCard, ThemedButton, GlassContainer } from '../components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '../components/ui/theme-aware-animations';
import { LoadingWrapper, CardLoading } from '../components/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Wallet } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function BudgetPage() {
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const loadData = async () => {
        setLoading(true);
        const [budgetData, transactionData] = await Promise.all([
            Budget.list(),
            Transaction.list('-date', 500)
        ]);
        setBudgets(budgetData);
        setTransactions(transactionData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormSubmit = async (data) => {
        if (editingBudget) {
            await Budget.update(editingBudget.id, data);
        } else {
            await Budget.create(data);
        }
        await loadData();
        setShowForm(false);
        setEditingBudget(null);
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await Budget.delete(id);
        await loadData();
    };

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
                        <ThemedCard elevated>
                            <CardHeader>
                                <CardTitle>{editingBudget ? 'Edit Budget' : 'Set New Budget Limit'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BudgetForm
                                    budget={editingBudget}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            </CardContent>
                        </ThemedCard>
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
