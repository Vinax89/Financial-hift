// @ts-nocheck

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { ThemedCard, GlassContainer } from '@/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/ui/theme-aware-animations';
import { Target, BarChart3, FileText, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';

// Import entities
import { Goal } from '@/api/entities';

// Import components
import GoalList from '@/goals/GoalList';
import GoalForm from '@/goals/GoalForm';
import GoalStats from '@/goals/GoalStats';
import { LoadingWrapper, CardLoading, ChartLoading } from '@/ui/loading';
import { CardContent, CardHeader, CardTitle } from '@/ui/card';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/ui/use-toast';
import { useFinancialData } from '@/hooks/useFinancialData';
import { ErrorBoundary } from '@/shared/ErrorBoundary';

// Lazy load heavy analytics components
const FinancialMetrics = React.lazy(() => import('@/analytics/FinancialMetrics.jsx'));
const IncomeChart = React.lazy(() => import('@/analytics/IncomeChart.jsx'));
const SpendingTrends = React.lazy(() => import('@/analytics/SpendingTrends.jsx'));
const MonthlyComparison = React.lazy(() => import('@/analytics/MonthlyComparison.jsx'));
const IncomeStatement = React.lazy(() => import('@/reports/IncomeStatement.jsx'));
const BalanceSheet = React.lazy(() => import('@/reports/BalanceSheet.jsx'));
const CashFlowStatement = React.lazy(() => import('@/reports/CashFlowStatement.jsx'));

const ChartFallback = () => <ChartLoading />;
const CardFallback = () => <CardLoading />;

export default function FinancialPlanningPage() {
    const [activeTab, setActiveTab] = useState('goals');
    const [reportTab, setReportTab] = useState('income');
    
    // Goals state
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showGoalForm, setShowGoalForm] = useState<boolean>(false);
    const [editingGoal, setEditingGoal] = useState<any>(null);
    
    const { toast } = useToast();

    // Financial data for analytics
    const {
        transactions,
        shifts,
        bills,
        isLoading: dataLoading
    } = useFinancialData();

    // Load goals
    const loadGoals = useCallback(async () => {
        setLoading(true);
        try {
            const data = await Goal.list();
            setGoals(data);
        } catch (error) {
            toast({
                title: 'Failed to load goals',
                description: error.message,
                variant: 'destructive'
            });
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    // Goal handlers
    const handleGoalSubmit = async (data) => {
        try {
            if (editingGoal) {
                await Goal.update(editingGoal.id, data);
                toast({ title: 'Goal updated successfully' });
            } else {
                await Goal.create(data);
                toast({ title: 'Goal created successfully' });
            }
            setShowGoalForm(false);
            setEditingGoal(null);
            await loadGoals();
        } catch (error) {
            toast({
                title: 'Failed to save goal',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    const handleGoalEdit = (goal) => {
        setEditingGoal(goal);
        setShowGoalForm(true);
    };

    const handleGoalDelete = async (id) => {
        try {
            await Goal.delete(id);
            toast({ title: 'Goal deleted successfully' });
            await loadGoals();
        } catch (error) {
            toast({
                title: 'Failed to delete goal',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    // Calculate summary stats
    const stats = {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        totalTargetAmount: goals.reduce((sum, g) => sum + (g.target_amount || 0), 0),
        totalSavedAmount: goals.reduce((sum, g) => sum + (g.current_amount || 0), 0),
        completionRate: goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <GlassContainer className="p-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <TrendingUp className="h-8 w-8" />
                                        Financial Planning
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Set goals, analyze trends, and generate financial reports.</p>
                            </div>
                        </FloatingElement>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">{stats.activeGoals}</div>
                                <div className="text-xs text-muted-foreground">Active Goals</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-success">{stats.completedGoals}</div>
                                <div className="text-xs text-muted-foreground">Completed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-success">{formatCurrency(stats.totalSavedAmount)}</div>
                                <div className="text-xs text-muted-foreground">Total Saved</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-warning">{Math.round(stats.completionRate)}%</div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                            </div>
                        </div>
                    </header>
                </GlassContainer>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <GlassContainer className="sticky top-4 z-20 bg-card/95 backdrop-blur-xl">
                        <div className="p-4">
                            <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2 h-auto p-0">
                                <TabsTrigger value="goals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4">
                                    <Target className="h-4 w-4 mr-2" />
                                    Goals & Targets
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Analytics & Trends
                                </TabsTrigger>
                                <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Financial Reports
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </GlassContainer>

                    <div className="space-y-8">
                        {/* Goals Tab */}
                        <TabsContent value="goals" className="space-y-8 mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[100px]">
                                    <GoalStats goals={goals} isLoading={loading} />
                                </ThemedCard>
                            </FloatingElement>

                            <div className="flex justify-end">
                                <Button onClick={() => { setEditingGoal(null); setShowGoalForm(!showGoalForm); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {showGoalForm ? 'Close Form' : 'Add New Goal'}
                                </Button>
                            </div>

                            <AnimatePresence>
                            {showGoalForm && (
                                <FloatingElement>
                                    <ThemedCard elevated>
                                        <CardHeader>
                                            <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ErrorBoundary>
                                                <GoalForm
                                                    goal={editingGoal}
                                                    onSubmit={handleGoalSubmit}
                                                    onCancel={() => {
                                                        setShowGoalForm(false);
                                                        setEditingGoal(null);
                                                    }}
                                                />
                                            </ErrorBoundary>
                                        </CardContent>
                                    </ThemedCard>
                                </FloatingElement>
                            )}
                            </AnimatePresence>

                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[400px]">
                                    <CardHeader>
                                        <CardTitle>Your Goals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <LoadingWrapper isLoading={loading} fallback={<CardLoading />}>
                                            <GoalList goals={goals} onEdit={handleGoalEdit} onDelete={handleGoalDelete} />
                                        </LoadingWrapper>
                                    </CardContent>
                                </ThemedCard>
                            </FloatingElement>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-8 mt-0">
                            <FloatingElement>
                                <ErrorBoundary fallback={<CardFallback />}>
                                    <Suspense fallback={<CardFallback />}>
                                        <div className="min-h-[150px]">
                                            <FinancialMetrics
                                                data={{
                                                    transactions: transactions,
                                                    shifts: shifts,
                                                    bills: bills,
                                                    goals: goals
                                                }}
                                                isLoading={dataLoading}
                                            />
                                        </div>
                                    </Suspense>
                                </ErrorBoundary>
                            </FloatingElement>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <FloatingElement>
                                    <ErrorBoundary fallback={<ChartFallback />}>
                                        <Suspense fallback={<ChartFallback />}>
                                            <div className="min-h-[400px]">
                                                <IncomeChart
                                                    shifts={shifts}
                                                    transactions={transactions}
                                                    isLoading={dataLoading}
                                                />
                                            </div>
                                        </Suspense>
                                    </ErrorBoundary>
                                </FloatingElement>
                                <FloatingElement>
                                    <ErrorBoundary fallback={<ChartFallback />}>
                                        <Suspense fallback={<ChartFallback />}>
                                            <div className="min-h-[400px]">
                                                <SpendingTrends
                                                    transactions={transactions}
                                                    isLoading={dataLoading}
                                                />
                                            </div>
                                        </Suspense>
                                    </ErrorBoundary>
                                </FloatingElement>
                            </div>

                            <FloatingElement>
                                <ErrorBoundary fallback={<CardFallback />}>
                                    <Suspense fallback={<CardFallback />}>
                                        <div className="min-h-[400px]">
                                            <MonthlyComparison
                                                transactions={transactions}
                                                shifts={shifts}
                                                isLoading={dataLoading}
                                            />
                                        </div>
                                    </Suspense>
                                </ErrorBoundary>
                            </FloatingElement>
                        </TabsContent>

                        {/* Reports Tab */}
                        <TabsContent value="reports" className="mt-0">
                            <FloatingElement>
                                <ThemedCard elevated className="min-h-[600px]">
                                    <CardContent className="p-6">
                                        <Tabs value={reportTab} onValueChange={setReportTab}>
                                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                                <TabsTrigger value="income">Income Statement</TabsTrigger>
                                                <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
                                                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="income" className="mt-6">
                                                <ErrorBoundary fallback={<CardFallback />}>
                                                    <Suspense fallback={<CardFallback />}>
                                                        <IncomeStatement />
                                                    </Suspense>
                                                </ErrorBoundary>
                                            </TabsContent>
                                            
                                            <TabsContent value="balance" className="mt-6">
                                                <ErrorBoundary fallback={<CardFallback />}>
                                                    <Suspense fallback={<CardFallback />}>
                                                        <BalanceSheet />
                                                    </Suspense>
                                                </ErrorBoundary>
                                            </TabsContent>
                                            
                                            <TabsContent value="cashflow" className="mt-6">
                                                <ErrorBoundary fallback={<CardFallback />}>
                                                    <Suspense fallback={<CardFallback />}>
                                                        <CashFlowStatement />
                                                    </Suspense>
                                                </ErrorBoundary>
                                            </TabsContent>
                                        </Tabs>
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
