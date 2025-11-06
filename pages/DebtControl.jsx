
import React, { useState, useEffect, useCallback } from 'react';
import { usePageShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { Landmark, CreditCard, Calculator, Plus, TrendingDown } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { ErrorBoundary } from '@/shared/ErrorBoundary';

// Import entities
import { DebtAccount } from '@/api/entities';
import { BNPLPlan } from '@/api/entities';

// Import components
import DebtList from '@/debt/DebtList';
import DebtForm from '@/debt/DebtForm';
import DebtSimulator from '@/debt/DebtSimulator';
import BNPLPlanList from '@/bnpl/BNPLPlanList';
import BNPLPlanForm from '@/bnpl/BNPLPlanForm';
import BNPLSummary from '@/bnpl/BNPLSummary';
import { LoadingWrapper, TableLoading, CardLoading } from '@/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/ui/use-toast';
import { formatCurrency } from "@/utils/calculations";


export default function DebtControlPage() {
    const [activeTab, setActiveTab] = useState('debts');
    
    // Data state
    const [debts, setDebts] = useState([]);
    const [bnplPlans, setBnplPlans] = useState([]);
    const [loading, setLoading] = useState({ debts: true, bnpl: true });
    
    // Form state
    const [showDebtForm, setShowDebtForm] = useState(false);
    const [showBNPLForm, setShowBNPLForm] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [editingBNPL, setEditingBNPL] = useState(null);
    
    const { toast } = useToast();

    // Load debt accounts
    const loadDebts = useCallback(async () => {
        setLoading(prev => ({ ...prev, debts: true }));
        try {
            const data = await DebtAccount.list('-updated_date');
            setDebts(data);
        } catch (error) {
            toast({
                title: 'Failed to load debt accounts',
                description: error.message,
                variant: 'destructive'
            });
        }
        setLoading(prev => ({ ...prev, debts: false }));
    }, [toast]);

    // Load BNPL plans
    const loadBNPLPlans = useCallback(async () => {
        setLoading(prev => ({ ...prev, bnpl: true }));
        try {
            const data = await BNPLPlan.list('-updated_date');
            setBnplPlans(data);
        } catch (error) {
            toast({
                title: 'Failed to load BNPL plans',
                description: error.message,
                variant: 'destructive'
            });
        }
        setLoading(prev => ({ ...prev, bnpl: false }));
    }, [toast]);

    useEffect(() => {
        loadDebts();
        loadBNPLPlans();
    }, [loadDebts, loadBNPLPlans]);

    // Keyboard shortcuts
    usePageShortcuts({
        onCreate: () => {
            if (activeTab === 'debts') {
                setEditingDebt(null);
                setShowDebtForm(true);
            } else {
                setEditingBNPL(null);
                setShowBNPLForm(true);
            }
        },
        onRefresh: () => {
            if (activeTab === 'debts') {
                loadDebts();
            } else {
                loadBNPLPlans();
            }
        },
    });

    // Debt handlers
    const handleDebtSubmit = async (data) => {
        try {
            if (editingDebt) {
                await DebtAccount.update(editingDebt.id, data);
                toast({ title: 'Debt account updated successfully' });
            } else {
                await DebtAccount.create(data);
                toast({ title: 'Debt account created successfully' });
            }
            setShowDebtForm(false);
            setEditingDebt(null);
            await loadDebts();
        } catch (error) {
            toast({
                title: 'Failed to save debt account',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleDebtEdit = (debt) => {
        setEditingDebt(debt);
        setShowDebtForm(true);
    };

    const handleDebtDelete = async (id) => {
        try {
            await DebtAccount.delete(id);
            toast({ title: 'Debt account deleted successfully' });
            await loadDebts();
        } catch (error) {
            toast({
                title: 'Failed to delete debt account',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    // BNPL handlers
    const handleBNPLSubmit = async (data) => {
        try {
            if (editingBNPL) {
                await BNPLPlan.update(editingBNPL.id, data);
                toast({ title: 'BNPL plan updated successfully' });
            } else {
                await BNPLPlan.create(data);
                toast({ title: 'BNPL plan created successfully' });
            }
            setShowBNPLForm(false);
            setEditingBNPL(null);
            await loadBNPLPlans();
        } catch (error) {
            toast({
                title: 'Failed to save BNPL plan',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleBNPLEdit = (plan) => {
        setEditingBNPL(plan);
        setShowBNPLForm(true);
        setActiveTab('bnpl');
    };

    const handleBNPLDelete = async (id) => {
        try {
            await BNPLPlan.delete(id);
            toast({ title: 'BNPL plan deleted successfully' });
            await loadBNPLPlans();
        } catch (error) {
            toast({
                title: 'Failed to delete BNPL plan',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    // Calculate summary stats
    const stats = {
        totalDebt: debts.reduce((sum, debt) => sum + (debt.balance || 0), 0),
        totalBNPL: bnplPlans
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + (p.installment_amount * p.remaining_installments), 0),
        activeDebts: debts.filter(d => d.status === 'active').length,
        activeBNPL: bnplPlans.filter(p => p.status === 'active').length,
        monthlyPayments: debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0) +
                        bnplPlans.filter(p => p.status === 'active' && p.payment_frequency === 'monthly')
                                  .reduce((sum, p) => sum + (p.installment_amount || 0), 0)
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <GlassContainer className="p-6">
                    <header>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                    Debt Control
                                </CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    Manage debts, BNPL plans, and payoff strategies
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button 
                                    onClick={() => {
                                        setShowDebtForm(true);
                                        setActiveTab('debts');
                                    }}
                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 min-h-[44px] px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Debt
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => setActiveTab('simulator')}
                                    className="flex-1 sm:flex-none bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 min-h-[44px] px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Simulate
                                </Button>
                            </div>
                        </div>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-expense sensitive">{formatCurrency(stats.totalDebt)}</div>
                                <div className="text-xs text-muted-foreground">Total Debt</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-expense sensitive">{formatCurrency(stats.totalBNPL)}</div>
                                <div className="text-xs text-muted-foreground">BNPL Owed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{stats.activeDebts}</div>
                                <div className="text-xs text-muted-foreground">Active Debts</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{stats.activeBNPL}</div>
                                <div className="text-xs text-muted-foreground">Active BNPL</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-warning sensitive">{formatCurrency(stats.monthlyPayments)}</div>
                                <div className="text-xs text-muted-foreground">Monthly Min.</div>
                            </div>
                        </div>
                    </header>
                </GlassContainer>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <GlassContainer className="sticky top-4 z-20 bg-card/95 backdrop-blur-xl">
                        <div className="p-4">
                            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-transparent gap-3 h-auto p-0">
                                <TabsTrigger 
                                    value="debts" 
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Landmark className="h-4 w-4 mr-2" />
                                    Debt Accounts
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="bnpl" 
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    BNPL Plans
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="simulator" 
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 data-[state=inactive]:border data-[state=inactive]:border-slate-200 hover:bg-slate-50 hover:border-slate-300 min-h-[44px] font-medium rounded-lg shadow-sm transition-all duration-200"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Simulator
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </GlassContainer>

                    <div className="space-y-8">
                        {/* Debt Accounts Tab */}
                        <TabsContent value="debts" className="space-y-8 mt-0">
                            <div className="flex justify-end">
                                <Button onClick={() => { setEditingDebt(null); setShowDebtForm(!showDebtForm); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {showDebtForm ? 'Close Form' : 'Add Debt Account'}
                                </Button>
                            </div>

                            <AnimatePresence>
                            {showDebtForm && (
                                <FloatingElement>
                                    <ThemedCard elevated>
                                        <CardHeader>
                                            <CardTitle>{editingDebt ? 'Edit Debt Account' : 'Add New Debt Account'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ErrorBoundary>
                                                <DebtForm
                                                    debt={editingDebt}
                                                    onSubmit={handleDebtSubmit}
                                                    onCancel={() => {
                                                        setShowDebtForm(false);
                                                        setEditingDebt(null);
                                                    }}
                                                />
                                            </ErrorBoundary>
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            )}
                            </AnimatePresence>

                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <FloatingElement>
                                        <ThemedCard elevated className="min-h-[400px]">
                                            <CardHeader><CardTitle>Your Debt Accounts</CardTitle></CardHeader>
                                            <CardContent>
                                                <LoadingWrapper isLoading={loading.debts} fallback={<TableLoading />}>
                                                    <DebtList debts={debts} onEdit={handleDebtEdit} onDelete={handleDebtDelete} />
                                                </LoadingWrapper>
                                            </CardContent>
                                        </ThemedCard>
                                    </FloatingElement>
                                </div>
                                <div className="lg:col-span-1">
                                    <FloatingElement>
                                        <ThemedCard elevated className="min-h-[400px]">
                                            {/* Fix: Added CardHeader and wrapped LoadingWrapper in CardContent */}
                                            <CardHeader>
                                                <CardTitle>Debt Simulator</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <LoadingWrapper isLoading={loading.debts} fallback={<CardLoading />}>
                                                    <DebtSimulator debts={debts} />
                                                </LoadingWrapper>
                                            </CardContent>
                                        </ThemedCard>
                                    </FloatingElement>
                                </div>
                            </div>
                        </TabsContent>

                        {/* BNPL Tracking Tab */}
                        <TabsContent value="bnpl" className="space-y-8 mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[120px]">
                                    <BNPLSummary plans={bnplPlans} isLoading={loading.bnpl} />
                                </ThemedCard>
                            </FloatingElement>

                            <div className="flex justify-end">
                                <Button onClick={() => { setEditingBNPL(null); setShowBNPLForm(!showBNPLForm); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {showBNPLForm ? 'Close Form' : 'Add BNPL Plan'}
                                </Button>
                            </div>
                            
                            <AnimatePresence>
                            {showBNPLForm && (
                                <FloatingElement>
                                    <ThemedCard elevated>
                                         <CardHeader>
                                            <CardTitle>{editingBNPL ? 'Edit BNPL Plan' : 'Add New BNPL Plan'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <BNPLPlanForm
                                                plan={editingBNPL}
                                                onSubmit={handleBNPLSubmit}
                                                onCancel={() => setShowBNPLForm(false)}
                                            />
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            )}
                            </AnimatePresence>

                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[400px]">
                                    <CardHeader>
                                        <CardTitle>Your BNPL Plans</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                    <LoadingWrapper isLoading={loading.bnpl} fallback={<TableLoading />}>
                                        <BNPLPlanList plans={bnplPlans} onEdit={handleBNPLEdit} onDelete={handleBNPLDelete} />
                                    </LoadingWrapper>
                                    </CardContent>
                                </ThemedCard>
                            </FloatingElement>
                        </TabsContent>

                        {/* Payoff Simulator Tab */}
                        <TabsContent value="simulator" className="mt-0">
                            <div className="grid lg:grid-cols-2 gap-8">
                                <FloatingElement>
                                    <ThemedCard elevated className="min-h-[500px]">
                                        <CardHeader>
                                            <CardTitle>Debt Payoff Simulator</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <LoadingWrapper isLoading={loading.debts} fallback={<CardLoading />}>
                                                <DebtSimulator debts={debts} />
                                            </LoadingWrapper>
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                                
                                <FloatingElement>
                                    <ThemedCard elevated className="min-h-[500px]">
                                        <CardHeader>
                                            <CardTitle>Quick Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <div className="text-2xl font-bold text-red-600 sensitive">{formatCurrency(stats.totalDebt + stats.totalBNPL)}</div>
                                                    <div className="text-sm text-muted-foreground">Total Owed</div>
                                                </div>
                                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                    <div className="text-2xl font-bold text-orange-600 sensitive">{formatCurrency(stats.monthlyPayments)}</div>
                                                    <div className="text-sm text-muted-foreground">Monthly Min.</div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Debt Breakdown</h4>
                                                {debts.map((debt, index) => (
                                                    <div key={debt.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                        <div>
                                                            <div className="font-medium">{debt.name}</div>
                                                            <div className="text-sm text-muted-foreground">{debt.type.replace('_', ' ')}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-red-600 sensitive">{formatCurrency(debt.balance)}</div>
                                                            <div className="text-xs text-muted-foreground">{debt.apr}% APR</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
