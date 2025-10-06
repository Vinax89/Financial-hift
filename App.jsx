import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/ui/toaster.jsx"
import { ReactQueryProvider } from "@/providers/ReactQueryProvider.jsx"
import { ErrorBoundary } from "@/shared/ErrorBoundary.jsx"
import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/utils/monitoring'

function App() {
  // Initialize performance monitoring on app mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializePerformanceMonitoring();
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
