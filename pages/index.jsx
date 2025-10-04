import Layout from "./Layout.jsx";
import { createPageUrl } from "@/utils";

import Transactions from "./Transactions";

import FileUpload from "./FileUpload";

import BNPL from "./BNPL";

import Shifts from "./Shifts";

import Calendar from "./Calendar";

import DebtPlanner from "./DebtPlanner";

import AIAdvisor from "./AIAdvisor";

import Budget from "./Budget";

import Goals from "./Goals";

import Paycheck from "./Paycheck";

import Analytics from "./Analytics";

import Reports from "./Reports";

import ShiftRules from "./ShiftRules";

import Agents from "./Agents";

import Scanner from "./Scanner";

import WorkHub from "./WorkHub";

import DebtControl from "./DebtControl";

import FinancialPlanning from "./FinancialPlanning";

import AIAssistant from "./AIAssistant";

import Settings from "./Settings";

import MoneyManager from "./MoneyManager";

import UnifiedCalendar from "./UnifiedCalendar";

import Dashboard from "./Dashboard";

import Diagnostics from "./Diagnostics";

import Pricing from "./Pricing";

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

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const normalizedUrlPart = urlLastPart.toLowerCase();
    const pageName = Object.keys(PAGES).find(
        (page) => createPageUrl(page).slice(1) === normalizedUrlPart
    );
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={<Transactions />} />
                {Object.entries(PAGES).map(([pageName, Component]) => (
                    <Route
                        key={pageName}
                        path={createPageUrl(pageName)}
                        element={<Component />}
                    />
                ))}
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