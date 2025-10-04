
import React, { useState, useEffect } from 'react';
import { DebtAccount } from '@/api/entities';
import DebtList from '../components/debt/DebtList';
import DebtForm from '../components/debt/DebtForm';
import DebtSimulator from '../components/debt/DebtSimulator';
import { ThemedCard, ThemedButton, GlassContainer } from '../components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '../components/ui/theme-aware-animations';
import { LoadingWrapper, TableLoading, CardLoading } from '../components/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Landmark } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function DebtPlannerPage() {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);

    const loadDebts = async () => {
        setLoading(true);
        const data = await DebtAccount.list();
        setDebts(data);
        setLoading(false);
    };

    useEffect(() => {
        loadDebts();
    }, []);

    const handleFormSubmit = async (data) => {
        if (editingDebt) {
            await DebtAccount.update(editingDebt.id, data);
        } else {
            await DebtAccount.create(data);
        }
        await loadDebts();
        setShowForm(false);
        setEditingDebt(null);
    };

    const handleEdit = (debt) => {
        setEditingDebt(debt);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await DebtAccount.delete(id);
        await loadDebts();
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
                                        <Landmark className="h-8 w-8" />
                                        Debt Planner
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Manage and strategize your debt payoff.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingDebt(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Add Debt Account'}
                        </ThemedButton>
                    </header>
                </GlassContainer>

                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <ThemedCard elevated>
                            <CardHeader>
                                <CardTitle>{editingDebt ? 'Edit Debt Account' : 'Add New Debt Account'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DebtForm
                                    debt={editingDebt}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            </CardContent>
                        </ThemedCard>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <FloatingElement disabled={loading}>
                            <ThemedCard elevated className="min-h-[400px]">
                                <CardHeader><CardTitle>Your Debts</CardTitle></CardHeader>
                                <CardContent>
                                    <LoadingWrapper isLoading={loading} fallback={<TableLoading />}>
                                        <DebtList debts={debts} onEdit={handleEdit} onDelete={handleDelete} />
                                    </LoadingWrapper>
                                </CardContent>
                            </ThemedCard>
                        </FloatingElement>
                    </div>
                    <div className="lg:col-span-1">
                        <FloatingElement disabled={loading}>
                            <ThemedCard elevated className="min-h-[400px]">
                                <LoadingWrapper isLoading={loading} fallback={<CardLoading />}>
                                    <DebtSimulator debts={debts} />
                                </LoadingWrapper>
                            </ThemedCard>
                        </FloatingElement>
                    </div>
                </div>
            </div>
        </div>
    );
}
