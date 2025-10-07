/**
 * @fileoverview Root application component for Financial $hift
 * @description Main app wrapper with performance monitoring, accessibility features,
 * error boundaries, and React Query provider integration
 */
import './App.css';
import Pages from '@/pages/index.jsx';
import { Toaster } from '@/ui/toaster.jsx';
import { ErrorBoundary } from "@/shared/ErrorBoundary.jsx"
import { useEffect } from 'react';
import { initializePerformanceMonitoring } from '@/utils/monitoring.js';
import { initializeAccessibility } from '@/utils/accessibility.js';
import { useIdlePrefetch, useDNSPrefetch, usePreconnect } from '@/hooks/usePrefetch.jsx';

/**
 * Root application component
 * @component
 * @returns {JSX.Element} The application root with all providers and monitoring
 */
function App() {
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

      // Only log in development
      if (import.meta.env.DEV) {
        console.log('✅ Performance monitoring and accessibility initialized');
        console.log('⚡ Hardware acceleration enabled');
        console.log('🔄 Intelligent prefetching active');
      }
    }
  }, []);

  // Intelligent idle-time prefetching
  useIdlePrefetch();

  // DNS prefetch for external domains
  useDNSPrefetch([
    'https://base44.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]);

  // Preconnect to critical origins
  usePreconnect([
    'https://base44.com',
  ]);

  return (
    <ErrorBoundary>
      <Pages />
      <Toaster />
    </ErrorBoundary>
  );
}export default App;