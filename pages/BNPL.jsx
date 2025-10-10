
import React, { useState, useEffect } from 'react';
import { BNPLPlan } from '@/api/entities';
import BNPLPlanList from '@/bnpl/BNPLPlanList';
import BNPLPlanForm from '@/bnpl/BNPLPlanForm';
import BNPLSummary from '@/bnpl/BNPLSummary';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { LoadingWrapper, TableLoading } from '@/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Plus, Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/ui/use-toast';

export default function BNPLPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const { toast } = useToast();

    const loadPlans = async () => {
        setLoading(true);
        const data = await BNPLPlan.list();
        setPlans(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const handleFormSubmit = async (data) => {
        try {
            if (editingPlan) {
                await BNPLPlan.update(editingPlan.id, data);
                toast({
                    title: 'BNPL plan updated',
                    description: 'Your installment plan has been updated successfully.',
                });
            } else {
                await BNPLPlan.create(data);
                toast({
                    title: 'BNPL plan created',
                    description: 'Your new installment plan has been created successfully.',
                });
            }
            await loadPlans();
            setShowForm(false);
            setEditingPlan(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save BNPL plan. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await BNPLPlan.delete(id);
            toast({
                title: 'BNPL plan deleted',
                description: 'Your installment plan has been deleted successfully.',
            });
            await loadPlans();
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete BNPL plan. Please try again.',
                variant: 'destructive',
            });
        }
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
                                        <Zap className="h-8 w-8" />
                                        Buy Now, Pay Later
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Track all your installment plans in one place.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingPlan(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Add New Plan'}
                        </ThemedButton>
                    </header>
                </GlassContainer>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[120px]">
                        <BNPLSummary plans={plans} isLoading={loading} />
                    </ThemedCard>
                </FloatingElement>
                
                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <ThemedCard elevated>
                             <CardHeader>
                                <CardTitle>{editingPlan ? 'Edit BNPL Plan' : 'Add New BNPL Plan'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BNPLPlanForm
                                    plan={editingPlan}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            </CardContent>
                        </ThemedCard>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[400px]">
                        <CardHeader>
                            <CardTitle>Your BNPL Plans</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <LoadingWrapper isLoading={loading} fallback={<TableLoading />}>
                            <BNPLPlanList plans={plans} onEdit={handleEdit} onDelete={handleDelete} />
                        </LoadingWrapper>
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
