import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/ui/toaster.jsx"
import { ReactQueryProvider } from "@/providers/ReactQueryProvider.jsx"
import ErrorBoundary from "@/ui/ErrorBoundary.jsx"
import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/utils/monitoring'
import { initializeAccessibility } from '@/utils/accessibility'

function App() {
  // Initialize performance monitoring and accessibility on app mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize performance tracking
      initializePerformanceMonitoring();
      
      // Initialize accessibility features (WCAG 2.1 AA compliance)
      initializeAccessibility();
      
      console.log('✅ Performance monitoring and accessibility initialized');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <Pages />
        <Toaster />
      </ReactQueryProvider>
    </ErrorBoundary>
  )
}

export default App 
