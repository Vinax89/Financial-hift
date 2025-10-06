import Layout from "@/pages/Layout.jsx";
import { createPageUrl } from "@/utils";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Suspense, useEffect, lazy } from 'react';
import { Loading } from '@/ui/loading';
import { routes, prefetchRoutes, getRouteByPath } from '@/routes/optimizedRoutes';

/**
 * Determine the current page name from a URL path.
 * @param {string} url - The URL pathname or path segment to evaluate
 * @returns {string} The matching page name
 */
function _getCurrentPage(url) {
    if (!url) return 'Dashboard';

    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    const route = getRouteByPath(url);
    return route ? route.name : 'Dashboard';
}

/**
 * Render application pages within the layout with optimized lazy loading
 */
function PagesContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = _getCurrentPage(location.pathname);

    // Prefetch critical routes on mount
    useEffect(() => {
        console.log('🚀 Prefetching critical routes...');
        prefetchRoutes('CRITICAL');
        
        // Prefetch high priority routes after a short delay
        const timer = setTimeout(() => {
            console.log('⚡ Prefetching high priority routes...');
            prefetchRoutes('HIGH');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Track route changes for analytics
    useEffect(() => {
        const route = getRouteByPath(location.pathname);
        if (route) {
            const startTime = performance.now();
            console.log(`📍 Navigated to: ${route.title} (${route.priority} priority)`);

            return () => {
                const duration = performance.now() - startTime;
                console.log(`⏱️ Time on ${route.title}: ${duration.toFixed(2)}ms`);
            };
        }
    }, [location.pathname]);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                {/* Root redirect to Dashboard */}
                <Route path="/" element={<Navigate to="/page/dashboard" replace />} />
                
                {/* Optimized lazy-loaded routes */}
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            <Suspense 
                                fallback={
                                    <Loading 
                                        text={`Loading ${route.title}...`} 
                                        variant="pulse" 
                                        size="lg" 
                                    />
                                }
                            >
                                <route.component />
                            </Suspense>
                        }
                    />
                ))}
                
                {/* Legacy route redirects for backwards compatibility */}
                {routes.map((route) => {
                    const legacyPath = `/${route.name.toLowerCase()}`;
                    return (
                        <Route
                            key={`legacy-${route.name}`}
                            path={legacyPath}
                            element={<Navigate to={route.path} replace />}
                        />
                    );
                })}

                {/* Catch-all redirect to Dashboard */}
                <Route path="*" element={<Navigate to="/page/dashboard" replace />} />
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
