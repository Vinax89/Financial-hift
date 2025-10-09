
import React, { useState, useEffect, useCallback } from 'react';
import { Shift } from '@/api/entities';
import ShiftForm from '@/shifts/ShiftForm';
import ShiftList from '@/shifts/ShiftList';
import ShiftStats from '@/shifts/ShiftStats';
import { ThemedCard, ThemedButton, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Plus, Clock } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LoadingWrapper, TableLoading } from '@/ui/loading';
import { usePageShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FocusTrapWrapper } from '@/ui/FocusTrapWrapper';
import { useToast } from '@/ui/use-toast';

export default function ShiftsPage() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const { toast } = useToast();

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
        try {
            if (editingShift) {
                await Shift.update(editingShift.id, data);
                toast({
                    title: 'Shift updated',
                    description: 'Your shift has been updated successfully.',
                });
            } else {
                await Shift.create(data);
                toast({
                    title: 'Shift created',
                    description: 'Your new shift has been recorded successfully.',
                });
            }
            await loadShifts();
            setShowForm(false);
            setEditingShift(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to save shift. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await Shift.delete(id);
            toast({
                title: 'Shift deleted',
                description: 'Your shift has been deleted successfully.',
            });
            await loadShifts();
        } catch (error) {
            toast({
                title: 'Error',
                description: error?.message || 'Failed to delete shift. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Keyboard shortcuts
    usePageShortcuts({
        onCreate: () => {
            setEditingShift(null);
            setShowForm(true);
        },
        onRefresh: loadShifts,
        onHelp: () => {
            // Help will be shown automatically by the KeyboardShortcuts class
            const event = new KeyboardEvent('keydown', { key: '?' });
            document.dispatchEvent(event);
        },
    });

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
                        <FocusTrapWrapper onEscape={() => setShowForm(false)}>
                            <ThemedCard elevated>
                                <CardHeader>
                                    <CardTitle className="text-xl">{editingShift ? 'Edit Shift' : 'Log New Shift'}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ShiftForm
                                        shift={editingShift}
                                        allShifts={shifts}
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
