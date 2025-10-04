
import React, { useState, useEffect } from 'react';
import { Goal } from '@/api/entities';
import GoalList from '../goals/GoalList';
import GoalForm from '../goals/GoalForm';
import GoalStats from '../goals/GoalStats';
import { ThemedCard, ThemedButton, GlassContainer } from '../ui/enhanced-components';
import { FloatingElement, GlowEffect } from '../ui/theme-aware-animations';
import { LoadingWrapper, CardLoading } from '../ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const loadGoals = async () => {
        setLoading(true);
        const data = await Goal.list();
        setGoals(data);
        setLoading(false);
    };

    useEffect(() => {
        loadGoals();
    }, []);

    const handleFormSubmit = async (data) => {
        if (editingGoal) {
            await Goal.update(editingGoal.id, data);
        } else {
            await Goal.create(data);
        }
        await loadGoals();
        setShowForm(false);
        setEditingGoal(null);
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await Goal.delete(id);
        await loadGoals();
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
                                <GoalForm
                                    goal={editingGoal}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
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
