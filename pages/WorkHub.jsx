
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemedCard, GlassContainer } from '../components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '../components/ui/theme-aware-animations';
import { Clock, Calculator, Settings, Upload, Plus, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import existing components
import { Shift } from '@/api/entities';
import { ShiftRule } from '@/api/entities';
import ShiftForm from '../components/shifts/ShiftForm';
import ShiftList from '../components/shifts/ShiftList';
import ShiftStats from '../components/shifts/ShiftStats';
import PaycheckCalculator from '../components/paycheck/PaycheckCalculator';
import ShiftRuleForm from '../components/shift-rules/ShiftRuleForm';
import ShiftRuleList from '../components/shift-rules/ShiftRuleList';
import ShiftRulePreview from '../components/shift-rules/ShiftRulePreview';
import ShiftImport from '../components/shifts/ShiftImport';
import { LoadingWrapper, TableLoading } from '../components/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function WorkHubPage() {
    const [activeTab, setActiveTab] = useState('schedule');
    const [shifts, setShifts] = useState([]);
    const [shiftRules, setShiftRules] = useState([]);
    const [loading, setLoading] = useState({ shifts: true, rules: true });
    const [showShiftForm, setShowShiftForm] = useState(false);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const { toast } = useToast();

    // Load shifts
    const loadShifts = useCallback(async () => {
        setLoading(prev => ({ ...prev, shifts: true }));
        try {
            const data = await Shift.list('-start_datetime', 500);
            setShifts(data);
        } catch (error) {
            toast({
                title: 'Failed to load shifts',
                description: error.message,
                variant: 'destructive'
            });
        }
        setLoading(prev => ({ ...prev, shifts: false }));
    }, [toast]);

    // Load shift rules
    const loadShiftRules = useCallback(async () => {
        setLoading(prev => ({ ...prev, rules: true }));
        try {
            const rules = await ShiftRule.list('-updated_date');
            setShiftRules(Array.isArray(rules) ? rules : []);
        } catch (error) {
            toast({
                title: 'Failed to load shift rules',
                description: error.message,
                variant: 'destructive'
            });
        }
        setLoading(prev => ({ ...prev, rules: false }));
    }, [toast]);

    useEffect(() => {
        loadShifts();
        loadShiftRules();
    }, [loadShifts, loadShiftRules]);

    // Shift handlers
    const handleShiftSubmit = async (data) => {
        try {
            if (editingShift) {
                await Shift.update(editingShift.id, data);
                toast({ title: 'Shift updated successfully' });
            } else {
                await Shift.create(data);
                toast({ title: 'Shift created successfully' });
            }
            setShowShiftForm(false);
            setEditingShift(null);
            await loadShifts();
        } catch (error) {
            toast({
                title: 'Failed to save shift',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleShiftEdit = (shift) => {
        setEditingShift(shift);
        setShowShiftForm(true);
    };

    const handleShiftDelete = async (id) => {
        try {
            await Shift.delete(id);
            toast({ title: 'Shift deleted successfully' });
            await loadShifts();
        } catch (error) {
            toast({
                title: 'Failed to delete shift',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    // Rule handlers
    const handleRuleSubmit = async (ruleData) => {
        try {
            if (editingRule) {
                await ShiftRule.update(editingRule.id, ruleData);
                toast({ title: 'Shift rule updated successfully' });
            } else {
                await ShiftRule.create(ruleData);
                toast({ title: 'Shift rule created successfully' });
            }
            setShowRuleForm(false);
            setEditingRule(null);
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to save shift rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleRuleEdit = (rule) => {
        setEditingRule(rule);
        setShowRuleForm(true);
        setActiveTab('rules');
    };

    const handleRuleDelete = async (rule) => {
        if (!confirm(`Are you sure you want to delete "${rule.name}"?`)) return;

        try {
            await ShiftRule.delete(rule.id);
            toast({ title: 'Shift rule deleted successfully' });
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to delete shift rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleRuleToggle = async (rule) => {
        try {
            await ShiftRule.update(rule.id, { active: !rule.active });
            toast({
                title: `Rule ${rule.active ? 'deactivated' : 'activated'}`,
                description: `${rule.name} is now ${rule.active ? 'inactive' : 'active'}.`
            });
            await loadShiftRules();
        } catch (error) {
            toast({
                title: 'Failed to update rule',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleRuleClone = (rule) => {
        const clonedData = {
            ...rule,
            name: `${rule.name} (Copy)`,
            active: false
        };
        delete clonedData.id;
        delete clonedData.created_date;
        delete clonedData.updated_date;

        setEditingRule(clonedData);
        setShowRuleForm(true);
        setActiveTab('rules');
    };

    // Stats calculations
    const stats = {
        totalShifts: shifts.length,
        activeRules: shiftRules.filter(r => r.active).length,
        totalRules: shiftRules.length,
        weeklyHours: shifts
            .filter(s => {
                const shiftDate = new Date(s.start_datetime);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return shiftDate > weekAgo;
            })
            .reduce((sum, s) => sum + (s.actual_hours || s.scheduled_hours || 0), 0)
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <GlassContainer className="p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Improved header section with new buttons */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                    Work Hub
                                </CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    Manage shifts, calculate pay, and set work rules
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={() => setActiveTab('schedule')}
                                    className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 min-h-[44px] px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Quick Add
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('import')}
                                    className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 min-h-[44px] px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">{stats.totalShifts}</div>
                                <div className="text-xs text-muted-foreground">Total Shifts</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-success">{stats.weeklyHours.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">Week Hours</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{stats.activeRules}</div>
                                <div className="text-xs text-muted-foreground">Active Rules</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-warning">{stats.totalRules}</div>
                                <div className="text-xs text-muted-foreground">Total Rules</div>
                            </div>
                        </div>
                    </header>
                </GlassContainer>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <GlassContainer className="sticky top-4 z-20 bg-card/95 backdrop-blur-xl">
                        <div className="p-4">
                            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-transparent gap-3 h-auto p-0">
                                <TabsTrigger
                                    value="schedule"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Schedule
                                </TabsTrigger>
                                <TabsTrigger
                                    value="calculator"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Calculator
                                </TabsTrigger>
                                <TabsTrigger
                                    value="rules"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Rules
                                </TabsTrigger>
                                <TabsTrigger
                                    value="import"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </GlassContainer>

                    <div className="space-y-8">
                        {/* Schedule Tab */}
                        <TabsContent value="schedule" className="mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[160px]">
                                    <ShiftStats shifts={shifts} isLoading={loading.shifts} />
                                </ThemedCard>
                            </FloatingElement>

                            <div className="flex justify-end gap-3">
                                {showShiftForm ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => { setShowShiftForm(false); setEditingShift(null); }}
                                        className="min-h-[44px] px-6 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-700 border border-slate-200 hover:border-slate-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => { setEditingShift(null); setShowShiftForm(true); }}
                                        className="min-h-[44px] px-6 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Shift
                                    </Button>
                                )}
                            </div>

                            <AnimatePresence>
                            {showShiftForm && (
                                <FloatingElement>
                                    <ThemedCard elevated>
                                        <CardHeader>
                                            <CardTitle className="text-xl">{editingShift ? 'Edit Shift' : 'Log New Shift'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ShiftForm
                                                shift={editingShift}
                                                onSubmit={handleShiftSubmit}
                                                onCancel={() => {
                                                    setShowShiftForm(false);
                                                    setEditingShift(null);
                                                }}
                                            />
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            )}
                            </AnimatePresence>

                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[500px]">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Shift History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <LoadingWrapper
                                            isLoading={loading.shifts}
                                            fallback={<TableLoading rows={8} />}
                                        >
                                            <ShiftList shifts={shifts} onEdit={handleShiftEdit} onDelete={handleShiftDelete} />
                                        </LoadingWrapper>
                                    </CardContent>
                                </ThemedCard>
                            </FloatingElement>
                        </TabsContent>

                        {/* Pay Calculator Tab */}
                        <TabsContent value="calculator" className="mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[500px]">
                                    <PaycheckCalculator />
                                </ThemedCard>
                            </FloatingElement>
                        </TabsContent>

                        {/* Rules & Settings Tab */}
                        <TabsContent value="rules" className="space-y-8 mt-0">
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => { setEditingRule(null); setShowRuleForm(!showRuleForm); }}
                                    className={showRuleForm
                                        ? "min-h-[48px] px-6 border-2 hover:bg-muted"
                                        : "min-h-[48px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                                    }
                                    variant={showRuleForm ? "outline" : "default"}
                                >
                                    {showRuleForm ? 'Close Form' : <><Plus className="h-4 w-4 mr-2" /> Create Rule</>}
                                </Button>
                            </div>

                            <AnimatePresence>
                            {showRuleForm && (
                                <FloatingElement>
                                    <ThemedCard elevated>
                                        <CardHeader>
                                            <CardTitle>{editingRule ? 'Edit Shift Rule' : 'Create New Shift Rule'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ShiftRuleForm
                                                rule={editingRule}
                                                onSave={handleRuleSubmit}
                                                onCancel={() => {
                                                    setShowRuleForm(false);
                                                    setEditingRule(null);
                                                }}
                                            />
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2">
                                    <FloatingElement>
                                        <ThemedCard elevated className="min-h-[400px]">
                                            <CardHeader>
                                                <CardTitle>Shift Rules</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <LoadingWrapper
                                                    isLoading={loading.rules}
                                                    fallback={<TableLoading rows={5} />}
                                                >
                                                    <ShiftRuleList
                                                        rules={shiftRules}
                                                        onEdit={handleRuleEdit}
                                                        onDelete={handleRuleDelete}
                                                        onClone={handleRuleClone}
                                                        onToggleActive={handleRuleToggle}
                                                    />
                                                </LoadingWrapper>
                                            </CardContent>
                                        </ThemedCard>
                                    </FloatingElement>
                                </div>

                                <div className="xl:col-span-1">
                                    <FloatingElement>
                                        <ThemedCard elevated className="min-h-[400px]">
                                            <ShiftRulePreview
                                                rules={shiftRules.filter(r => r.active)}
                                                onEditRule={handleRuleEdit}
                                            />
                                        </ThemedCard>
                                    </FloatingElement>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Import Data Tab */}
                        <TabsContent value="import" className="mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[400px]">
                                    <CardContent className="p-6">
                                        <ShiftImport />
                                    </CardContent>
                                </ThemedCard>
                            </FloatingElement>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
