
import React, { useState, useEffect, useCallback } from 'react';
import { Shift } from '@/api/entities';
import ShiftForm from '@/components/shifts/ShiftForm';
import ShiftList from '@/components/shifts/ShiftList';
import ShiftStats from '@/components/shifts/ShiftStats';
import { ThemedCard, ThemedButton, GlassContainer } from '@/components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/components/ui/theme-aware-animations';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LoadingWrapper, TableLoading } from '@/components/ui/loading';

export default function ShiftsPage() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    const loadShifts = useCallback(async () => {
        setLoading(true);
        const data = await Shift.list('-start_datetime', 500);
        setShifts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadShifts();
    }, [loadShifts]);

    const handleFormSubmit = async (data) => {
        if (editingShift) {
            await Shift.update(editingShift.id, data);
        } else {
            await Shift.create(data);
        }
        await loadShifts();
        setShowForm(false);
        setEditingShift(null);
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await Shift.delete(id);
        await loadShifts();
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                <GlassContainer className="p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                                        <Clock className="h-7 w-7" />
                                        Work Shifts
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Manage your work schedule and track earnings.</p>
                            </div>
                        </FloatingElement>
                        <ThemedButton onClick={() => { setEditingShift(null); setShowForm(!showForm); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {showForm ? 'Close Form' : 'Add Shift'}
                        </ThemedButton>
                    </header>
                </GlassContainer>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[160px]">
                        <ShiftStats shifts={shifts} isLoading={loading} />
                    </ThemedCard>
                </FloatingElement>
                
                <AnimatePresence>
                {showForm && (
                    <FloatingElement>
                        <ThemedCard elevated>
                             <CardHeader>
                                <CardTitle className="text-xl">{editingShift ? 'Edit Shift' : 'Log New Shift'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ShiftForm
                                    shift={editingShift}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            </CardContent>
                        </ThemedCard>
                    </FloatingElement>
                )}
                </AnimatePresence>

                <FloatingElement disabled={loading}>
                    <ThemedCard elevated className="min-h-[500px]">
                        <CardHeader>
                            <CardTitle className="text-xl">Shift History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LoadingWrapper
                                isLoading={loading}
                                fallback={<TableLoading rows={8} />}
                            >
                                <ShiftList shifts={shifts} onEdit={handleEdit} onDelete={handleDelete} />
                            </LoadingWrapper>
                        </CardContent>
                    </ThemedCard>
                </FloatingElement>
            </div>
        </div>
    );
}
