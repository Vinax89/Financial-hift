
import React, { useEffect, useMemo, Suspense, useCallback } from 'react';
import { useFinancialData } from '@/components/hooks/useFinancialData';
import { Loading, ShimmerBox, CardLoading, ChartLoading } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, LayoutGrid, FileText, Landmark, Wallet, BrainCircuit, Bot, Bug, Download, BellRing, Mail } from 'lucide-react';
import { ThemedButton, GlassContainer } from '@/components/ui/enhanced-components';
import { FloatingElement, GlowEffect } from '@/components/ui/theme-aware-animations';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useToast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useLocalStorage } from '@/components/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import DataExport from "@/components/shared/DataExport";
import { generateFinancialReport } from "@/api/functions";
import { User } from "@/api/entities";
import UpcomingDue from "@/components/dashboard/UpcomingDue";
import { generateReminders } from "@/api/functions";
import { emailUpcomingBills } from "@/api/functions";
import PrivacyToggle from "@/components/shared/PrivacyToggle.js";
import { useIdlePrefetch } from "@/components/hooks/useIdlePrefetch";
// Replace the OnboardingModal import to avoid extension-specific path issues
import OnboardingModal from "@/components/onboarding/OnboardingModal";

// Lazy load heavy components
const OptimizedMoneyHub = React.lazy(() => import('@/components/dashboard/OptimizedMoneyHub'));
const DebtVisualizer = React.lazy(() => import('@/components/dashboard/DebtVisualizer'));
const ScenarioSimulator = React.lazy(() => import('@/components/dashboard/ScenarioSimulator'));
const EnvelopeBudgeting = React.lazy(() => import('@/components/dashboard/EnvelopeBudgeting'));
const BurnoutAnalyzer = React.lazy(() => import('@/components/dashboard/BurnoutAnalyzer'));
const BillNegotiator = React.lazy(() => import('@/components/dashboard/BillNegotiator'));
const GamificationCenter = React.lazy(() => import('@/components/dashboard/GamificationCenter'));
const IncomeViabilityCalculator = React.lazy(() => import('@/components/tools/IncomeViabilityCalculator'));
const AutomationCenter = React.lazy(() => import('@/components/dashboard/AutomationCenter'));
const DataImporter = React.lazy(() => import('@/components/tools/DataImporter'));
const AutomationRulesCenter = React.lazy(() => import('@/components/automation/AutomationRulesCenter'));
const KPIBar = React.lazy(() => import('@/components/analytics/KPIBar'));
const CashflowForecast = React.lazy(() => import('@/components/analytics/CashflowForecast'));
const CategoryTrends = React.lazy(() => import('@/components/analytics/CategoryTrends'));
const ReceiptScanner = React.lazy(() => import('@/components/scanning/ReceiptScanner'));
// Add lazy import for the new Sankey card
const CashflowSankey = React.lazy(() => import('@/components/analytics/CashflowSankey'));

const ComponentFallback = ({ name, type = 'card' }) => {
    if (type === 'chart') {
        return <ChartLoading />;
    }
    return <CardLoading />;
};

export default function Dashboard() {
    const {
        transactions, shifts, goals, debts, budgets, bills, investments,
        loading, loadAllData, dataLoaded, hasErrors, errors, refreshData
    } = useFinancialData();
    
    const { isOled } = useTheme();
    const { toast } = useToast();
    const [chaosMode, setChaosMode] = useLocalStorage('apex-finance:chaos-mode', false);
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    // Determine initial tab: URL param > saved > default fallback
    const allowedTabs = useMemo(() => ["overview", "debts", "budget", "tools", "automations", "progress"], []);
    const initialTab = useMemo(() => {
        const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const urlTab = sp.get("tab");
        const saved = typeof window !== "undefined" ? window.localStorage.getItem("apex-finance:dashboard-tab") : null;
        if (urlTab && allowedTabs.includes(urlTab)) return urlTab;
        if (saved && allowedTabs.includes(saved)) return saved;
        return "overview";
    }, [allowedTabs]);

    const [activeTab, setActiveTab] = React.useState(initialTab);

    // If neither URL nor saved, prefer user's default_dashboard_tab
    useEffect(() => {
        if (typeof window === "undefined") return;
        const sp = new URLSearchParams(window.location.search);
        const urlTab = sp.get("tab");
        const saved = window.localStorage.getItem("apex-finance:dashboard-tab");
        if (!urlTab && !saved) {
            (async () => {
                try {
                    const me = await User.me();
                    const pref = me?.default_dashboard_tab;
                    if (pref && allowedTabs.includes(pref) && pref !== activeTab) {
                        setActiveTab(pref);
                        const sp2 = new URLSearchParams(window.location.search);
                        sp2.set("tab", pref);
                        window.history.replaceState({}, "", `${window.location.pathname}?${sp2.toString()}`);
                        window.localStorage.setItem("apex-finance:dashboard-tab", pref);
                    }
                } catch {
                    // ignore if unauthenticated or error fetching user
                }
            })();
        }
    }, [allowedTabs, activeTab]);

    // After we load, prompt onboarding if not completed
    useEffect(() => {
        (async () => {
            try {
                const me = await User.me();
                if (!me?.onboarding_completed) {
                    setShowOnboarding(true);
                }
            } catch {
                // unauthenticated or error; ignore
            }
        })();
    }, []);

    const handleTabChange = useCallback((val) => {
        setActiveTab(val);
        try {
            window.localStorage.setItem("apex-finance:dashboard-tab", val);
            const sp = new URLSearchParams(window.location.search);
            sp.set("tab", val);
            window.history.replaceState({}, "", `${window.location.pathname}?${sp.toString()}`);
        } catch {
            // noop
        }
    }, []);

    useEffect(() => {
        if (!dataLoaded) {
            loadAllData();
        }
    }, [dataLoaded, loadAllData]);

    useEffect(() => {
        if (hasErrors) {
            const errorMessages = Object.entries(errors).map(([entity, message]) => 
                `${entity}: ${message}`
            ).join(', ');
            
            toast({
                title: "Data Loading Issues",
                description: `Some data couldn't be loaded: ${errorMessages}`,
                variant: "destructive",
            });
        }
    }, [hasErrors, errors, toast]);

    // Auto-scan reminders once per day
    useEffect(() => {
        const key = "apex-finance:last-reminder-scan";
        const last = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
        const shouldScan = !last || (Date.now() - Number(last)) > 20 * 60 * 60 * 1000; // 20h
        if (shouldScan) {
            (async () => {
                try {
                    await generateReminders();
                    if (typeof window !== "undefined") window.localStorage.setItem(key, String(Date.now()));
                } catch {
                    // ignore
                }
            })();
        }
    }, []);
    
    const metrics = useMemo(() => {
        const safeInvestments = Array.isArray(investments) ? investments : [];
        const safeDebts = Array.isArray(debts) ? debts : [];
        const safeShifts = Array.isArray(shifts) ? shifts : [];

        const netWorth = safeInvestments.reduce((sum, i) => sum + (i.current_value || 0), 0) - 
                        safeDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
        
        const monthlyIncome = safeShifts
            .filter(s => {
                try {
                    const shiftDate = new Date(s.start_datetime);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return shiftDate > thirtyDaysAgo;
                } catch { 
                    return false; 
                }
            })
            .reduce((sum, s) => sum + (s.net_pay || 0), 0);
        
        const monthlyDebtPayments = safeDebts.reduce((sum, d) => sum + (d.minimum_payment || 0), 0);
        const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
        
        return { 
            netWorth: Number(netWorth) || 0, 
            monthlyIncome: Number(monthlyIncome) || 0, 
            debtToIncomeRatio: Number(debtToIncomeRatio) || 0 
        };
    }, [investments, debts, shifts]);

    const handleRefresh = useCallback(async () => {
        try {
            await loadAllData(false);
            toast({
                title: "Data Refreshed",
                description: "All financial data has been updated",
            });
        } catch (error) {
            toast({
                title: "Refresh Failed",
                description: "Failed to refresh data. Please try again.",
                variant: "destructive",
            });
        }
    }, [loadAllData, toast]);

    const handleExportPdf = useCallback(async () => {
        try {
            toast({
                title: "Generating PDF Report",
                description: "Please wait while your financial report is being prepared.",
            });
            const { data } = await generateFinancialReport();
            const blob = new Blob([data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "financial_report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast({
                title: "PDF Report Downloaded",
                description: "Your financial report has been successfully downloaded.",
            });
        } catch (error) {
            console.error("Failed to generate PDF report:", error);
            toast({
                title: "PDF Export Failed",
                description: "There was an error generating your financial report. Please try again.",
                variant: "destructive",
            });
        }
    }, [toast]);
    
    const handleScanReminders = useCallback(async () => {
        await generateReminders();
        toast({ title: "Reminders scanned", description: "Upcoming payments have been checked." });
    }, [toast]);

    const handleEmailUpcoming = useCallback(async () => {
        const { data } = await emailUpcomingBills();
        toast({ title: "Email sent", description: `Upcoming payments summary sent (${data?.count ?? 0} items).` });
    }, [toast]);

    const toggleChaosMode = () => {
        const newMode = !chaosMode;
        setChaosMode(newMode);
        toast({
            title: `Chaos Mode ${newMode ? 'Enabled' : 'Disabled'}`,
            description: newMode ? 'Data fetching will now be intentionally unstable.' : 'Data fetching restored to normal operation.',
            variant: newMode ? 'destructive' : 'default'
        });
        handleRefresh();
    };

    // Keyboard shortcut: 'r' to refresh (Shift+R = forced)
    React.useEffect(() => {
        const onKeyDown = (e) => {
            const key = (e && typeof e.key === 'string') ? e.key.toLowerCase() : '';
            if (key === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault?.();
                if (e.shiftKey) {
                    loadAllData(true);
                    toast({
                        title: "Forced Data Refresh",
                        description: "All financial data is being reloaded from source.",
                    });
                } else {
                    handleRefresh();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleRefresh, loadAllData, toast]);

    // Listen for global refresh events from Command Palette
    React.useEffect(() => {
        const handler = (e) => {
            const forced = !!(e && e.detail && e.detail.forced);
            if (forced) {
                loadAllData(true);
                toast({
                    title: "Forced Data Refresh (Global)",
                    description: "All financial data is being reloaded from source via global command.",
                });
            } else {
                handleRefresh();
            }
        };
        window.addEventListener("dashboard:refresh", handler);
        return () => window.removeEventListener("dashboard:refresh", handler);
    }, [handleRefresh, loadAllData, toast]);

    // Warm up heavy lazy components when idle after initial data load
    useIdlePrefetch([
        // Debts tab
        () => import("@/components/dashboard/DebtVisualizer"),
        () => import("@/components/dashboard/ScenarioSimulator"),
        // Budget tab (already used, but ensure warmed)
        () => import("@/components/dashboard/EnvelopeBudgeting"),
        // Tools tab
        () => import("@/components/dashboard/BillNegotiator"),
        () => import("@/components/tools/IncomeViabilityCalculator"),
        () => import("@/components/scanning/ReceiptScanner"),
        () => import("@/components/tools/DataImporter"),
        () => import("@/components/automation/AutomationRulesCenter"),
        // Automations
        () => import("@/components/dashboard/AutomationCenter"), // Corrected path to match lazy import
        // Progress
        () => import("@/components/dashboard/GamificationCenter"),
        // Analytics / cards
        () => import("@/components/analytics/KPIBar"),
        () => import("@/components/analytics/CashflowForecast"),
        () => import("@/components/analytics/CategoryTrends"),
        () => import("@/components/analytics/CashflowSankey"),
    ], [dataLoaded]);

    if (loading.all && !dataLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8" aria-busy="true">
                <Loading text="Analyzing your financial universe..." variant="pulse" size="xl" />
            </div>
        );
    }

    return (
        <div id="main-content" role="main" aria-busy={loading.all && !dataLoaded} className="min-h-screen bg-background relative">
            {/* Onboarding modal */}
            <OnboardingModal
                open={showOnboarding}
                onClose={(completed) => {
                    if (completed) {
                        setShowOnboarding(false);
                        // Refresh data to reflect potential new settings
                        handleRefresh();
                    } else {
                        // Keep showing until completed; do not close permanently
                        setShowOnboarding(false);
                        // Soft-remind next visit
                        setTimeout(() => setShowOnboarding(true), 500);
                    }
                }}
            />
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                <GlassContainer intensity="light" className="p-6">
                    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <FloatingElement>
                            <div>
                                <GlowEffect color="emerald" intensity="medium">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                                        Financial Dashboard
                                    </h1>
                                </GlowEffect>
                                <p className="text-muted-foreground mt-2 text-base">
                                    Your complete financial picture, optimized.
                                </p>
                            </div>
                        </FloatingElement>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <DataExport 
                                datasets={{
                                    transactions,
                                    shifts,
                                    goals,
                                    debts,
                                    budgets,
                                    bills,
                                    investments
                                }}
                                fileBase="financial_shift_export"
                            />
                            <Button 
                                variant="outline"
                                onClick={handleExportPdf}
                                className="gap-2 min-w-[140px]"
                                title="Download PDF report"
                            >
                                <Download className="h-4 w-4" />
                                Export PDF
                            </Button>
                            <ThemedButton 
                                onClick={handleRefresh} 
                                variant="outline" 
                                disabled={loading.all}
                                glowing={isOled}
                                className="min-w-[140px]"
                            >
                                {loading.all ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Refresh Data
                            </ThemedButton>
                            <Button variant="outline" onClick={handleScanReminders} className="gap-2 min-w-[140px]" title="Scan upcoming payments">
                                <BellRing className="h-4 w-4" />
                                Scan Reminders
                            </Button>
                            <Button variant="outline" onClick={handleEmailUpcoming} className="gap-2 min-w-[160px]" title="Email upcoming payments">
                                <Mail className="h-4 w-4" />
                                Email Upcoming
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={toggleChaosMode} 
                                title={chaosMode ? "Disable Chaos Mode" : "Enable Chaos Mode"}
                                className="h-10 w-10"
                            >
                                <Bug className={`h-4 w-4 transition-all ${chaosMode ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
                            </Button>
                            <PrivacyToggle />
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </header>
                </GlassContainer>

                <Suspense fallback={<ShimmerBox height="80px" className="mb-8" />}>
                    <KPIBar metrics={metrics} />
                </Suspense>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
                    <GlassContainer className="sticky top-4 z-20 bg-card/95 backdrop-blur-xl">
                        <div className="p-4">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-transparent gap-3 lg:gap-4 h-auto p-0">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="debts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <Landmark className="h-4 w-4 mr-2" />
                                    Debts
                                </TabsTrigger>
                                <TabsTrigger value="budget" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Budget
                                </TabsTrigger>
                                <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Tools
                                </TabsTrigger>
                                <TabsTrigger value="automations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <Bot className="h-4 w-4 mr-2" />
                                    Automations
                                </TabsTrigger>
                                <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] px-4 lg:px-6">
                                    <BrainCircuit className="h-4 w-4 mr-2" />
                                    Progress
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </GlassContainer>

                    <div className="space-y-8">
                        <TabsContent value="overview" className="space-y-8 mt-0">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2 space-y-8">
                                    <ErrorBoundary fallback={<ComponentFallback name="Money Hub" type="card" />}>
                                        <Suspense fallback={<ComponentFallback name="Money Hub" type="card" />}>
                                            <OptimizedMoneyHub 
                                                transactions={transactions} 
                                                shifts={shifts} 
                                                goals={goals} 
                                                bills={bills} 
                                                metrics={metrics} 
                                            />
                                        </Suspense>
                                    </ErrorBoundary>
                                    
                                    <ErrorBoundary fallback={<ComponentFallback name="Burnout Analyzer" type="chart" />}>
                                        <Suspense fallback={<ComponentFallback name="Burnout Analyzer" type="chart" />}>
                                            <BurnoutAnalyzer shifts={shifts} />
                                        </Suspense>
                                    </ErrorBoundary>

                                    <ErrorBoundary fallback={<ComponentFallback name="Cashflow Forecast" type="chart" />}>
                                        <Suspense fallback={<ComponentFallback name="Cashflow Forecast" type="chart" />}>
                                            <CashflowForecast transactions={transactions} bills={bills} />
                                        </Suspense>
                                    </ErrorBoundary>

                                    {/* Insert Cashflow Sankey below Cashflow Forecast */}
                                    <ErrorBoundary fallback={<ComponentFallback name="Cashflow Map" type="chart" />}>
                                        <Suspense fallback={<ComponentFallback name="Cashflow Map" type="chart" />}>
                                            <CashflowSankey transactions={transactions} />
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                                
                                <div className="xl:col-span-1 space-y-8">
                                    <ErrorBoundary fallback={<ComponentFallback name="Envelope Budgeting" type="card" />}>
                                        <Suspense fallback={<ComponentFallback name="Envelope Budgeting" type="card" />}>
                                            <EnvelopeBudgeting 
                                                transactions={transactions} 
                                                budgets={budgets} 
                                                income={metrics.monthlyIncome || 0}
                                                refreshData={refreshData}
                                            />
                                        </Suspense>
                                    </ErrorBoundary>

                                    <ErrorBoundary fallback={<ComponentFallback name="Category Trends" type="chart" />}>
                                        <Suspense fallback={<ComponentFallback name="Category Trends" type="chart" />}>
                                            <CategoryTrends transactions={transactions} />
                                        </Suspense>
                                    </ErrorBoundary>
                                    <ErrorBoundary fallback={<ComponentFallback name="Upcoming Due" type="card" />}>
                                        <Suspense fallback={<ComponentFallback name="Upcoming Due" type="card" />}>
                                            <UpcomingDue bills={bills} debts={debts} />
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                            </div>

                            <GlassContainer className="p-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold">Paycheck / Income Viability</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Income Viability = Gross Income − (Debt Burden + Tax Burden + Cost of Living)
                                    </p>
                                </div>
                                <Suspense fallback={<CardLoading />}>
                                    <IncomeViabilityCalculator debts={debts} />
                                </Suspense>
                            </GlassContainer>
                        </TabsContent>

                        <TabsContent value="debts" className="space-y-8 mt-0">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2">
                                    <ErrorBoundary fallback={<ComponentFallback name="Debt Visualizer" type="chart" />}>
                                        <Suspense fallback={<ComponentFallback name="Debt Visualizer" type="chart" />}>
                                            <DebtVisualizer debts={debts} />
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                                <div className="xl:col-span-1">
                                    <ErrorBoundary fallback={<ComponentFallback name="Scenario Simulator" type="card" />}>
                                        <Suspense fallback={<ComponentFallback name="Scenario Simulator" type="card" />}>
                                            <ScenarioSimulator debts={debts} />
                                        </Suspense>
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="budget" className="mt-0">
                            <ErrorBoundary fallback={<ComponentFallback name="Envelope Budgeting" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Envelope Budgeting" type="card" />}>
                                    <EnvelopeBudgeting 
                                        transactions={transactions} 
                                        budgets={budgets} 
                                        income={metrics.monthlyIncome || 0}
                                        refreshData={refreshData}
                                    />
                                </Suspense>
                            </ErrorBoundary>
                        </TabsContent>

                        <TabsContent value="tools" className="space-y-8 mt-0">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <ErrorBoundary fallback={<ComponentFallback name="Bill Negotiator" type="card" />}>
                                    <Suspense fallback={<ComponentFallback name="Bill Negotiator" type="card" />}>
                                        <BillNegotiator bills={bills} />
                                    </Suspense>
                                </ErrorBoundary>
                                
                                <ErrorBoundary fallback={<ComponentFallback name="Income Calculator" type="card" />}>
                                    <Suspense fallback={<ComponentFallback name="Income Calculator" type="card" />}>
                                        <IncomeViabilityCalculator debts={debts} />
                                    </Suspense>
                                </ErrorBoundary>
                            </div>

                            <ErrorBoundary fallback={<ComponentFallback name="Receipt Scanner" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Receipt Scanner" type="card" />}>
                                    <ReceiptScanner />
                                </Suspense>
                            </ErrorBoundary>

                            <ErrorBoundary fallback={<ComponentFallback name="Data Importer" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Data Importer" type="card" />}>
                                    <DataImporter />
                                </Suspense>
                            </ErrorBoundary>

                            <ErrorBoundary fallback={<ComponentFallback name="Automation Rules Center" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Automation Rules Center" type="card" />}>
                                    <AutomationRulesCenter transactions={transactions} />
                                </Suspense>
                            </ErrorBoundary>
                        </TabsContent>
                        
                        <TabsContent value="automations" className="mt-0">
                            <ErrorBoundary fallback={<ComponentFallback name="Automation Center" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Automation Center" type="card" />}>
                                    <AutomationCenter />
                                </Suspense>
                            </ErrorBoundary>
                        </TabsContent>

                        <TabsContent value="progress" className="mt-0">
                            <ErrorBoundary fallback={<ComponentFallback name="Gamification Center" type="card" />}>
                                <Suspense fallback={<ComponentFallback name="Gamification Center" type="card" />}>
                                    <GamificationCenter />
                                </Suspense>
                            </ErrorBoundary>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
