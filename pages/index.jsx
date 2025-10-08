import React, { Suspense } from 'react';
import { createPageUrl } from "@/utils";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useIdlePrefetch } from '@/hooks/usePrefetch.jsx';

// Eager load Layout and Transactions (landing page)
import Layout from "@/pages/Layout.jsx";
import Transactions from "@/pages/Transactions.jsx";

// Eager load auth pages (no auth guard)
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import ForgotPassword from "@/pages/ForgotPassword.jsx";

// Lazy load all other pages for code splitting
const FileUpload = React.lazy(() => import("@/pages/FileUpload.jsx"));
const BNPL = React.lazy(() => import("@/pages/BNPL.jsx"));
const Shifts = React.lazy(() => import("@/pages/Shifts.jsx"));
const Calendar = React.lazy(() => import("@/pages/Calendar.jsx"));
const DebtPlanner = React.lazy(() => import("@/pages/DebtPlanner.jsx"));
const AIAdvisor = React.lazy(() => import("@/pages/AIAdvisor.jsx"));
const Budget = React.lazy(() => import("@/pages/Budget.jsx"));
const Goals = React.lazy(() => import("@/pages/Goals.jsx"));
const Paycheck = React.lazy(() => import("@/pages/Paycheck.jsx"));
const Analytics = React.lazy(() => import("@/pages/Analytics.jsx"));
const Reports = React.lazy(() => import("@/pages/Reports.jsx"));
const ShiftRules = React.lazy(() => import("@/pages/ShiftRules.jsx"));
const Agents = React.lazy(() => import("@/pages/Agents.jsx"));
const Scanner = React.lazy(() => import("@/pages/Scanner.jsx"));
const WorkHub = React.lazy(() => import("@/pages/WorkHub.jsx"));
const DebtControl = React.lazy(() => import("@/pages/DebtControl.jsx"));
const FinancialPlanning = React.lazy(() => import("@/pages/FinancialPlanning.jsx"));
const AIAssistant = React.lazy(() => import("@/pages/AIAssistant.jsx"));
const Settings = React.lazy(() => import("@/pages/Settings.jsx"));
const MoneyManager = React.lazy(() => import("@/pages/MoneyManager.jsx"));
const UnifiedCalendar = React.lazy(() => import("@/pages/UnifiedCalendar.jsx"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard.jsx"));
const Diagnostics = React.lazy(() => import("@/pages/Diagnostics.jsx"));
const Pricing = React.lazy(() => import("@/pages/Pricing.jsx"));

// Loading component for page transitions
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

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
    const isPublicRoute = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

    if (isPublicRoute) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
        );
    }

    // Protected routes (require auth)
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Transactions />} />
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
}export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
