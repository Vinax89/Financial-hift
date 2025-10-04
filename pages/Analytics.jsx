
import React, { Suspense } from 'react';
import { ThemedCard, GlassContainer } from '../components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '../components/ui/theme-aware-animations';
import { BarChart3 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // This import is now mostly unused but kept as it was in original.
import { useFinancialData } from '../components/hooks/useFinancialData';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { CardLoading, ChartLoading } from '../components/ui/loading';

// Lazy load chart components
const FinancialMetrics = React.lazy(() => import('../components/analytics/FinancialMetrics'));
const IncomeChart = React.lazy(() => import('../components/analytics/IncomeChart'));
const SpendingTrends = React.lazy(() => import('../components/analytics/SpendingTrends'));
const MonthlyComparison = React.lazy(() => import('../components/analytics/MonthlyComparison'));

const ChartFallback = () => <ChartLoading />;
const CardFallback = () => <CardLoading />;

export default function AnalyticsPage() {
    const {
        transactions,
        shifts,
        bills,
        goals,
        isLoading
    } = useFinancialData();

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <GlassContainer className="p-6">
                    <header>
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                                        <BarChart3 className="h-8 w-8" />
                                        Financial Analytics
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-1">Deep dive into your financial data and trends.</p>
                            </div>
                        </FloatingElement>
                    </header>
                </GlassContainer>

                <FloatingElement disabled={isLoading}>
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
                                    isLoading={isLoading}
                                />
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </FloatingElement>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FloatingElement disabled={isLoading}>
                        <ErrorBoundary fallback={<ChartFallback />}>
                            <Suspense fallback={<ChartFallback />}>
                                <div className="min-h-[400px]">
                                    <IncomeChart
                                        shifts={shifts}
                                        transactions={transactions}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </Suspense>
                        </ErrorBoundary>
                    </FloatingElement>
                    <FloatingElement disabled={isLoading}>
                        <ErrorBoundary fallback={<ChartFallback />}>
                            <Suspense fallback={<ChartFallback />}>
                                <div className="min-h-[400px]">
                                    <SpendingTrends
                                        transactions={transactions}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </Suspense>
                        </ErrorBoundary>
                    </FloatingElement>
                </div>

                <FloatingElement disabled={isLoading}>
                    <ErrorBoundary fallback={<CardFallback />}>
                        <Suspense fallback={<CardFallback />}>
                            <div className="min-h-[400px]">
                                <MonthlyComparison
                                    transactions={transactions}
                                    isLoading={isLoading}
                                />
                            </div>
                        </Suspense>
                    </ErrorBoundary>
                </FloatingElement>
            </div>
        </div>
    );
}
