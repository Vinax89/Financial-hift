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