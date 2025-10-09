
import React, { Suspense } from "react";
import { GlassContainer } from "@/ui/enhanced-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import PerfInspector from "@/dev/PerfInspector";
import NetworkMonitor from "@/dev/NetworkMonitor";
import { Button } from "@/ui/button";

// Lazy import only - no static import to enable proper code splitting
const StressTesterLazy = React.lazy(() => import("@/dev/StressTester.jsx"));

export default function Diagnostics() {
  const [perfLite, setPerfLite] = React.useState(() => {
    // Check if window is defined to ensure this runs only client-side or during hydration.
    // During SSR, localStorage is not available.
    if (typeof window === "undefined") {
      return false; // Default to false during SSR
    }
    return window.localStorage.getItem("apex-finance:perf-lite") === "true";
  });

  const togglePerfLite = () => {
    const next = !perfLite;
    setPerfLite(next);
    // Apply data-perf attribute to the document's root element
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-perf", next ? "lite" : "normal");
    }
    // Store preference in localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem("apex-finance:perf-lite", next ? "true" : "false");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <GlassContainer intensity="light" className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Diagnostics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Run performance and reliability checks. Use Stress &amp; Chaos Tester to simulate load; use Performance tab to analyze runtime behavior.
              </p>
            </div>
            <Button variant="outline" onClick={togglePerfLite} className="shrink-0">
              {perfLite ? "Disable Performance mode" : "Enable Performance mode"}
            </Button>
          </div>
        </GlassContainer>

        <Tabs defaultValue="stress" className="space-y-6">
          <TabsList className="bg-transparent">
            <TabsTrigger value="stress">Stress &amp; Chaos Tester</TabsTrigger>
            <TabsTrigger value="perf">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="stress" className="space-y-6">
            <GlassContainer intensity="light" className="p-0 border-none bg-transparent">
              <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading tester…</div>}>
                <StressTesterLazy />
              </Suspense>
            </GlassContainer>
          </TabsContent>

          <TabsContent value="perf" className="space-y-6">
            <PerfInspector />
            <NetworkMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
