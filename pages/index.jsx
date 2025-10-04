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
                
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/FileUpload" element={<FileUpload />} />
                
                <Route path="/BNPL" element={<BNPL />} />
                
                <Route path="/Shifts" element={<Shifts />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/DebtPlanner" element={<DebtPlanner />} />
                
                <Route path="/AIAdvisor" element={<AIAdvisor />} />
                
                <Route path="/Budget" element={<Budget />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/Paycheck" element={<Paycheck />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/ShiftRules" element={<ShiftRules />} />
                
                <Route path="/Agents" element={<Agents />} />
                
                <Route path="/Scanner" element={<Scanner />} />
                
                <Route path="/WorkHub" element={<WorkHub />} />
                
                <Route path="/DebtControl" element={<DebtControl />} />
                
                <Route path="/FinancialPlanning" element={<FinancialPlanning />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/MoneyManager" element={<MoneyManager />} />
                
                <Route path="/UnifiedCalendar" element={<UnifiedCalendar />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Diagnostics" element={<Diagnostics />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
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