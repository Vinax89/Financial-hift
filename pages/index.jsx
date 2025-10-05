import Layout from "@/pages/Layout.jsx";

import Transactions from "@/pages/Transactions.jsx";

import FileUpload from "@/pages/FileUpload.jsx";

import BNPL from "@/pages/BNPL.jsx";

import Shifts from "@/pages/Shifts.jsx";

import Calendar from "@/pages/Calendar.jsx";

import DebtPlanner from "@/pages/DebtPlanner.jsx";

import AIAdvisor from "@/pages/AIAdvisor.jsx";

import Budget from "@/pages/Budget.jsx";

import Goals from "@/pages/Goals.jsx";

import Paycheck from "@/pages/Paycheck.jsx";

import Analytics from "@/pages/Analytics.jsx";

import Reports from "@/pages/Reports.jsx";

import ShiftRules from "@/pages/ShiftRules.jsx";

import Agents from "@/pages/Agents.jsx";

import Scanner from "@/pages/Scanner.jsx";

import WorkHub from "@/pages/WorkHub.jsx";

import DebtControl from "@/pages/DebtControl.jsx";

import FinancialPlanning from "@/pages/FinancialPlanning.jsx";

import AIAssistant from "@/pages/AIAssistant.jsx";

import Settings from "@/pages/Settings.jsx";

import MoneyManager from "@/pages/MoneyManager.jsx";

import UnifiedCalendar from "@/pages/UnifiedCalendar.jsx";

import Dashboard from "@/pages/Dashboard.jsx";

import Diagnostics from "@/pages/Diagnostics.jsx";

import Pricing from "@/pages/Pricing.jsx";

import { createPageUrl } from "@/utils";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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

/**
 * Determine the current page name from a URL path.
 * @param {string} url - The URL pathname or path segment to evaluate (may include a trailing slash or query string).
 * @returns {string} The matching page name from PAGES, or the first page name as the default.
 */
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

/**
 * Render application pages within the layout and route them based on the current URL.
 *
 * @returns {JSX.Element} The layout containing Routes that render the active page component.
 */
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
// At the top of pages/index.jsx, update the import:
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

// …later, inside your JSX…
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
            </Routes>
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