
import React, { useState } from 'react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/useEntityQueries.jsx';
import GoalList from '@/goals/GoalList.jsx';
import GoalForm from '@/goals/GoalForm.jsx';
import GoalStats from '@/goals/GoalStats.jsx';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components.jsx';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations.jsx';
import { LoadingWrapper, CardLoading } from '@/ui/loading.jsx';
import { CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { ErrorBoundary } from '@/shared/ErrorBoundary';
import { Plus, Target } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/ui/use-toast.jsx';

export default function GoalsPage() {
    // React Query hooks - automatic caching and background refetching
    const { data: goals = [], isLoading: loading } = useGoals();
    
    // Mutation hooks with optimistic updates
    const createGoal = useCreateGoal();
    const updateGoal = useUpdateGoal();
    const deleteGoal = useDeleteGoal();
    
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const handleFormSubmit = async (data) => {
        try {
            if (editingGoal) {
                await updateGoal.mutateAsync({ id: editingGoal.id, data });
                toast({
                    title: 'Goal updated',
                    description: 'Your goal has been updated successfully.',
                });
            } else {
                await createGoal.mutateAsync(data);
                toast({
                    title: 'Goal created',
                    description: 'Your new goal has been created successfully.',
                });
            }
            setShowForm(false);
            setEditingGoal(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save goal. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteGoal.mutateAsync(id);
            toast({
                title: 'Goal deleted',
                description: 'Your goal has been deleted successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete goal. Please try again.',
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
                                        <Target className="h-8 w-8" />
                                        Financial Goals
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Set, track, and achieve your financial targets.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingGoal(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Add New Goal'}
                        </ThemedButton>
                    </header>
                </GlassContainer>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[100px]">
                        <GoalStats goals={goals} isLoading={loading} />
                    </ThemedCard>
                </FloatingElement>

                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <ThemedCard elevated>
                            <CardHeader>
                                <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ErrorBoundary>
                                    <GoalForm
                                        goal={editingGoal}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setShowForm(false)}
                                    />
                                </ErrorBoundary>
                            </CardContent>
                        </ThemedCard>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[300px]">
                        <CardHeader>
                            <CardTitle>Your Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <LoadingWrapper isLoading={loading} fallback={<CardLoading />}>
                            <GoalList goals={goals} onEdit={handleEdit} onDelete={handleDelete} />
                        </LoadingWrapper>
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
