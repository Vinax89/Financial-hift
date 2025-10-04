import Layout from "./Layout.jsx";

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

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
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
                
                
                <Route path="/transactions" element={<Transactions />} />

                <Route path="/fileupload" element={<FileUpload />} />

                <Route path="/bnpl" element={<BNPL />} />

                <Route path="/shifts" element={<Shifts />} />

                <Route path="/calendar" element={<Calendar />} />

                <Route path="/debtplanner" element={<DebtPlanner />} />

                <Route path="/aiadvisor" element={<AIAdvisor />} />

                <Route path="/budget" element={<Budget />} />

                <Route path="/goals" element={<Goals />} />

                <Route path="/paycheck" element={<Paycheck />} />

                <Route path="/analytics" element={<Analytics />} />

                <Route path="/reports" element={<Reports />} />

                <Route path="/shiftrules" element={<ShiftRules />} />

                <Route path="/agents" element={<Agents />} />

                <Route path="/scanner" element={<Scanner />} />

                <Route path="/workhub" element={<WorkHub />} />

                <Route path="/debtcontrol" element={<DebtControl />} />

                <Route path="/financialplanning" element={<FinancialPlanning />} />

                <Route path="/aiassistant" element={<AIAssistant />} />

                <Route path="/settings" element={<Settings />} />

                <Route path="/moneymanager" element={<MoneyManager />} />

                <Route path="/unifiedcalendar" element={<UnifiedCalendar />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/diagnostics" element={<Diagnostics />} />

                <Route path="/pricing" element={<Pricing />} />
                
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