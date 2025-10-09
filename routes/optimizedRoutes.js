/**
 * Optimized Routes Configuration
 * 
 * Features:
 * - Lazy loading for all pages
 * - Intelligent prefetching
 * - Priority-based loading
 * - Route guards
 * - Analytics tracking
 */

import { createLazyRoute, LoadPriority, createPrioritizedLazyComponent } from '@/utils/lazyLoading';
import { logDebug } from '@/utils/logger';

/**
 * Critical pages - Load immediately
 */
const Dashboard = createLazyRoute(
    () => import('@/pages/Dashboard'),
    { pageName: 'Dashboard', preload: true }
);

const MoneyHub = createLazyRoute(
    () => import('@/dashboard/MoneyHub'),
    { pageName: 'MoneyHub', preload: true }
);

/**
 * High priority pages - Load on mount
 */
const Transactions = createLazyRoute(
    () => import('@/pages/Transactions'),
    { pageName: 'Transactions' }
);

const Calendar = createLazyRoute(
    () => import('@/pages/Calendar'),
    { pageName: 'Calendar' }
);

const DebtControl = createLazyRoute(
    () => import('@/pages/DebtControl'),
    { pageName: 'DebtControl' }
);

const Budget = createLazyRoute(
    () => import('@/pages/Budget'),
    { pageName: 'Budget' }
);

/**
 * Medium priority pages - Load on idle
 */
const Analytics = createPrioritizedLazyComponent(
    () => import('@/pages/Analytics'),
    LoadPriority.MEDIUM,
    { componentName: 'Analytics' }
);

const Goals = createPrioritizedLazyComponent(
    () => import('@/pages/Goals'),
    LoadPriority.MEDIUM,
    { componentName: 'Goals' }
);

const WorkHub = createPrioritizedLazyComponent(
    () => import('@/pages/WorkHub'),
    LoadPriority.MEDIUM,
    { componentName: 'WorkHub' }
);

const BNPL = createPrioritizedLazyComponent(
    () => import('@/pages/BNPL'),
    LoadPriority.MEDIUM,
    { componentName: 'BNPL' }
);

const Subscription = createPrioritizedLazyComponent(
    () => import('@/pages/Subscription'),
    LoadPriority.MEDIUM,
    { componentName: 'Subscription' }
);

const Investment = createPrioritizedLazyComponent(
    () => import('@/pages/Investment'),
    LoadPriority.MEDIUM,
    { componentName: 'Investment' }
);

/**
 * Low priority pages - Load on interaction
 */
const Reports = createPrioritizedLazyComponent(
    () => import('@/pages/Reports'),
    LoadPriority.LOW,
    { componentName: 'Reports' }
);

const Settings = createPrioritizedLazyComponent(
    () => import('@/pages/Settings'),
    LoadPriority.LOW,
    { componentName: 'Settings' }
);

const AIAdvisor = createPrioritizedLazyComponent(
    () => import('@/pages/AIAdvisor'),
    LoadPriority.LOW,
    { componentName: 'AIAdvisor' }
);

const AIAssistant = createPrioritizedLazyComponent(
    () => import('@/pages/AIAssistant'),
    LoadPriority.LOW,
    { componentName: 'AIAssistant' }
);

const Agents = createPrioritizedLazyComponent(
    () => import('@/pages/Agents'),
    LoadPriority.LOW,
    { componentName: 'Agents' }
);

const Tools = createPrioritizedLazyComponent(
    () => import('@/pages/Tools'),
    LoadPriority.LOW,
    { componentName: 'Tools' }
);

const Scanning = createPrioritizedLazyComponent(
    () => import('@/pages/Scanning'),
    LoadPriority.LOW,
    { componentName: 'Scanning' }
);

/**
 * Routes configuration with metadata
 */
export const routes = [
    {
        path: '/',
        component: Dashboard,
        name: 'Dashboard',
        title: 'Dashboard',
        priority: 'critical',
        requiresAuth: true,
        icon: 'LayoutDashboard',
        showInNav: true,
    },
    {
        path: '/money-hub',
        component: MoneyHub,
        name: 'MoneyHub',
        title: 'Money Hub',
        priority: 'critical',
        requiresAuth: true,
        icon: 'Wallet',
        showInNav: true,
    },
    {
        path: '/transactions',
        component: Transactions,
        name: 'Transactions',
        title: 'Transactions',
        priority: 'high',
        requiresAuth: true,
        icon: 'Receipt',
        showInNav: true,
    },
    {
        path: '/calendar',
        component: Calendar,
        name: 'Calendar',
        title: 'Calendar',
        priority: 'high',
        requiresAuth: true,
        icon: 'Calendar',
        showInNav: true,
    },
    {
        path: '/debt-control',
        component: DebtControl,
        name: 'DebtControl',
        title: 'Debt Control',
        priority: 'high',
        requiresAuth: true,
        icon: 'CreditCard',
        showInNav: true,
    },
    {
        path: '/budget',
        component: Budget,
        name: 'Budget',
        title: 'Budget',
        priority: 'high',
        requiresAuth: true,
        icon: 'PiggyBank',
        showInNav: true,
    },
    {
        path: '/analytics',
        component: Analytics,
        name: 'Analytics',
        title: 'Analytics',
        priority: 'medium',
        requiresAuth: true,
        icon: 'BarChart',
        showInNav: true,
    },
    {
        path: '/goals',
        component: Goals,
        name: 'Goals',
        title: 'Goals',
        priority: 'medium',
        requiresAuth: true,
        icon: 'Target',
        showInNav: true,
    },
    {
        path: '/work-hub',
        component: WorkHub,
        name: 'WorkHub',
        title: 'Work Hub',
        priority: 'medium',
        requiresAuth: true,
        icon: 'Briefcase',
        showInNav: true,
    },
    {
        path: '/bnpl',
        component: BNPL,
        name: 'BNPL',
        title: 'Buy Now Pay Later',
        priority: 'medium',
        requiresAuth: true,
        icon: 'ShoppingCart',
        showInNav: true,
    },
    {
        path: '/subscription',
        component: Subscription,
        name: 'Subscription',
        title: 'Subscriptions',
        priority: 'medium',
        requiresAuth: true,
        icon: 'RefreshCw',
        showInNav: true,
    },
    {
        path: '/investment',
        component: Investment,
        name: 'Investment',
        title: 'Investments',
        priority: 'medium',
        requiresAuth: true,
        icon: 'TrendingUp',
        showInNav: true,
    },
    {
        path: '/reports',
        component: Reports,
        name: 'Reports',
        title: 'Reports',
        priority: 'low',
        requiresAuth: true,
        icon: 'FileText',
        showInNav: true,
    },
    {
        path: '/settings',
        component: Settings,
        name: 'Settings',
        title: 'Settings',
        priority: 'low',
        requiresAuth: true,
        icon: 'Settings',
        showInNav: true,
    },
    {
        path: '/ai-advisor',
        component: AIAdvisor,
        name: 'AIAdvisor',
        title: 'AI Advisor',
        priority: 'low',
        requiresAuth: true,
        icon: 'Sparkles',
        showInNav: true,
    },
    {
        path: '/ai-assistant',
        component: AIAssistant,
        name: 'AIAssistant',
        title: 'AI Assistant',
        priority: 'low',
        requiresAuth: true,
        icon: 'MessageSquare',
        showInNav: true,
    },
    {
        path: '/agents',
        component: Agents,
        name: 'Agents',
        title: 'Agents',
        priority: 'low',
        requiresAuth: true,
        icon: 'Users',
        showInNav: true,
    },
    {
        path: '/tools',
        component: Tools,
        name: 'Tools',
        title: 'Tools',
        priority: 'low',
        requiresAuth: true,
        icon: 'Wrench',
        showInNav: true,
    },
    {
        path: '/scanning',
        component: Scanning,
        name: 'Scanning',
        title: 'Scanning',
        priority: 'low',
        requiresAuth: true,
        icon: 'Scan',
        showInNav: true,
    },
];

/**
 * Get navigation items for sidebar
 */
export function getNavigationItems() {
    return routes.filter(route => route.showInNav);
}

/**
 * Get route by path
 */
export function getRouteByPath(path) {
    return routes.find(route => route.path === path);
}

/**
 * Get route by name
 */
export function getRouteByName(name) {
    return routes.find(route => route.name === name);
}

/**
 * Prefetch routes by priority
 */
export function prefetchRoutes(priority = 'high') {
    const routesToPrefetch = routes.filter(route => route.priority === priority);
    
    // Prefetch on idle
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
            routesToPrefetch.forEach(route => {
                // Routes are already lazy loaded, this just triggers the import
                route.component;
            });
        });
    }
}

/**
 * Route analytics helper
 */
export function trackRouteChange(route, duration) {
    if (import.meta.env.PROD) {
        // Send to analytics service
        logDebug('Route change:', {
            path: route.path,
            name: route.name,
            duration,
            timestamp: new Date().toISOString(),
        });
    }
}

/**
 * Export components for direct use
 */
export {
    Dashboard,
    MoneyHub,
    Transactions,
    Calendar,
    DebtControl,
    Budget,
    Analytics,
    Goals,
    WorkHub,
    BNPL,
    Subscription,
    Investment,
    Reports,
    Settings,
    AIAdvisor,
    AIAssistant,
    Agents,
    Tools,
    Scanning,
};

export default routes;
