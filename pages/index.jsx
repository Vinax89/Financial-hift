/**
 * @fileoverview Application routing with optimized code splitting
 * @description Uses lazy loading with retry logic and intelligent prefetching
 */

import React, { Suspense } from 'react';
import { createPageUrl } from "@/utils";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useIdlePrefetch } from '@/hooks/usePrefetch';
import { lazyLoadWithRetry } from '@/utils/lazyLoad';
import { RouteLoader, SkeletonRouteLoader } from '@/components/ui/RouteLoader';

// Eager load Layout and Dashboard (landing page - critical path)
import Layout from "@/pages/Layout";
import Dashboard from "@/pages/Dashboard";

// Eager load auth pages (no auth guard - shown before app loads)
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";

// Lazy load all other pages with retry logic for better reliability
const Transactions = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Transactions.jsx")));
const FileUpload = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/FileUpload.jsx")));
const BNPL = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/BNPL.jsx")));
const Shifts = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Shifts.jsx")));
const Calendar = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Calendar.jsx")));
const DebtPlanner = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/DebtPlanner.jsx")));
const AIAdvisor = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/AIAdvisor.jsx")));
const Budget = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Budget.jsx")));
const Goals = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Goals.jsx")));
const Paycheck = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Paycheck.jsx")));
const Analytics = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Analytics.jsx")));
const Reports = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Reports.jsx")));
const ShiftRules = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/ShiftRules.jsx")));
const Agents = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Agents.jsx")));
const Scanner = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Scanner.jsx")));
const WorkHub = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/WorkHub.jsx")));
const DebtControl = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/DebtControl.jsx")));
const FinancialPlanning = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/FinancialPlanning.jsx")));
const AIAssistant = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/AIAssistant.jsx")));
const Settings = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Settings.jsx")));
const MoneyManager = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/MoneyManager.jsx")));
const UnifiedCalendar = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/UnifiedCalendar.jsx")));
const Diagnostics = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Diagnostics.jsx")));
const Pricing = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/Pricing.jsx")));

// Dev tools (only in development)
const PerformanceDashboard = React.lazy(() => lazyLoadWithRetry(() => import("@/dev/PerformanceDashboard.jsx")));
const AuthDebug = React.lazy(() => lazyLoadWithRetry(() => import("@/pages/AuthDebug.jsx")));

// Loading component for page transitions
const PageLoader = () => <RouteLoader message="Loading page..." />;

const PAGES = {
    Transactions: Transactions,
    FileUpload: FileUpload,
    BNPL: BNPL,
    Shifts: Shifts,
    Calendar: Calendar,
    DebtPlanner: DebtPlanner,
    AIAdvisor: AIAdvisor,
    Budget: Budget,
    Goals: Goals,
    Paycheck: Paycheck,
    Analytics: Analytics,
    Reports: Reports,
    ShiftRules: ShiftRules,
    Agents: Agents,
    Scanner: Scanner,
    WorkHub: WorkHub,
    DebtControl: DebtControl,
    FinancialPlanning: FinancialPlanning,
    AIAssistant: AIAssistant,
    Settings: Settings,
    MoneyManager: MoneyManager,
    UnifiedCalendar: UnifiedCalendar,
    Dashboard: Dashboard,
    Diagnostics: Diagnostics,
    Pricing: Pricing,
}

function _getCurrentPage(url) {
    const pageNames = Object.keys(PAGES);
    const defaultPage = pageNames[0];

    if (!url) {
        return defaultPage;
    }

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop() || '';
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    if (!urlLastPart) {
        return defaultPage;
    }

    const normalizedSegment = urlLastPart.toLowerCase();
    const pageName = pageNames.find(
        (page) => createPageUrl(page).slice(1) === normalizedSegment
    );

    return pageName || defaultPage;
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // ✅ Intelligent idle-time prefetching (now inside Router context)
    useIdlePrefetch();

    // Public routes (no auth required)
    const isPublicRoute = ['/login', '/signup', '/forgot-password', '/auth-debug'].includes(location.pathname);

    // If user visits root and it's not authenticated, show login
    // If authenticated, Layout's AuthGuard will handle showing protected content
    if (isPublicRoute) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth-debug" element={<AuthDebug />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // Protected routes (require auth) - AuthGuard in Layout will redirect to /login if not authenticated
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Default route: Dashboard for authenticated users */}
                    <Route path="/" element={<Dashboard />} />
                    {/* Dev tools route (development only) */}
                    {import.meta.env.DEV && (
                        <Route path="/dev/performance" element={<PerformanceDashboard />} />
                    )}
                    {Object.entries(PAGES).map(([pageName, Component]) => (
                        <Route
                            key={pageName}
                            path={createPageUrl(pageName)}
                            element={<Component />}
                        />
                    ))}
                    {Object.keys(PAGES).map((pageName) => (
                        <Route
                            key={`${pageName}-legacy`}
                            path={`/${pageName}`}
                            element={<Navigate to={createPageUrl(pageName)} replace />}
                        />
                    ))}
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
