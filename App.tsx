/**
 * @fileoverview Root application component for Financial $hift
 * @description Main app wrapper with performance monitoring, accessibility features,
 * error boundaries, optimized code splitting, and React Query provider integration
 */
import './App.css';
import { Suspense, useEffect } from 'react';
import Pages from '@/pages/index';
import { Toaster } from '@/ui/toaster';
import { ErrorBoundary } from "@/shared/ErrorBoundary";
import { FullPageLoader } from '@/components/ui/RouteLoader';
import { initializePerformanceMonitoring } from '@/utils/monitoring';
import { initializeAccessibility } from '@/utils/accessibility';
import { logInfo } from '@/utils/logger';
import { useDNSPrefetch, usePreconnect } from '@/hooks/usePrefetch';

/**
 * Root application component
 * @component
 * @returns The application root with all providers and monitoring
 */
function App(): JSX.Element {
  // Initialize performance monitoring and accessibility on app mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize performance tracking
      initializePerformanceMonitoring();

      // Initialize accessibility features (WCAG 2.1 AA compliance)
      initializeAccessibility();

      // Enable hardware acceleration hints
      document.body.style.transform = 'translateZ(0)';
      document.body.style.backfaceVisibility = 'hidden';

      // Log initialization in development
      logInfo('Performance monitoring and accessibility initialized');
    }
  }, []);

  // DNS prefetch for external domains (doesn't need Router context)
  useDNSPrefetch([
    'https://base44.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]);

  // Preconnect to critical origins (doesn't need Router context)
  usePreconnect([
    'https://base44.com',
  ]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoader appName="Financial $hift" />}>
        <Pages />
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
