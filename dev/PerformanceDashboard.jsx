import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { getRateLimiterStats } from '@/api/optimizedEntities.js';
import {
  Activity,
  Clock,
  Database,
  AlertCircle,
  TrendingUp,
  Zap,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

/**
 * Performance Monitoring Dashboard
 * Real-time monitoring of app performance metrics
 * @component
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    rateLimiter: null,
    memory: null,
    performance: null,
    components: [],
  });
  const [isCollecting, setIsCollecting] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  /**
   * Collect performance metrics
   */
  const collectMetrics = useCallback(() => {
    // Rate Limiter Stats
    const rateLimiterStats = getRateLimiterStats();

    // Memory Stats (if available)
    const memory = performance.memory
      ? {
          used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
        }
      : null;

    // Performance Stats
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    const perfStats = navigationTiming
      ? {
          domContentLoaded: navigationTiming.domContentLoadedEventEnd.toFixed(0),
          loadComplete: navigationTiming.loadEventEnd.toFixed(0),
          domInteractive: navigationTiming.domInteractive.toFixed(0),
        }
      : null;

    // Component Render Times
    const componentMeasures = performance
      .getEntriesByType('measure')
      .filter(entry => entry.name.includes('âš›'))
      .slice(-10)
      .map(entry => ({
        name: entry.name,
        duration: entry.duration.toFixed(2),
      }));

    setMetrics({
      rateLimiter: rateLimiterStats,
      memory,
      performance: perfStats,
      components: componentMeasures,
    });

    setLastUpdate(Date.now());
  }, []);

  /**
   * Auto-refresh metrics
   */
  useEffect(() => {
    if (!isCollecting) return;

    const interval = setInterval(collectMetrics, 2000);
    collectMetrics(); // Initial collection

    return () => clearInterval(interval);
  }, [isCollecting, collectMetrics]);

  /**
   * Clear performance marks
   */
  const clearMarks = () => {
    performance.clearMarks();
    performance.clearMeasures();
    collectMetrics();
  };

  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Performance Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time application performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isCollecting ? 'destructive' : 'default'}
            onClick={() => setIsCollecting(!isCollecting)}
          >
            {isCollecting ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" onClick={collectMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={clearMarks}>
            Clear Marks
          </Button>
        </div>
      </div>

      {/* Update Status */}
      <div className="text-sm text-muted-foreground">
        {isCollecting ? (
          <span className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live â€¢ Updated {timeSinceUpdate}s ago
          </span>
        ) : (
          'Paused'
        )}
      </div>

      {/* Rate Limiter Stats */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Rate Limiter Status
        </h2>

        {metrics.rateLimiter ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Available Tokens"
              value={metrics.rateLimiter.rateLimiter.availableTokens}
              max={metrics.rateLimiter.rateLimiter.maxTokens}
              subtitle={`Max: ${metrics.rateLimiter.rateLimiter.maxTokens}`}
              color={
                metrics.rateLimiter.rateLimiter.availableTokens < 5
                  ? 'text-red-500'
                  : 'text-green-500'
              }
            />
            <MetricCard
              label="Queue Length"
              value={metrics.rateLimiter.rateLimiter.queueLength}
              subtitle="Pending requests"
              color={
                metrics.rateLimiter.rateLimiter.queueLength > 10
                  ? 'text-orange-500'
                  : 'text-blue-500'
              }
            />
            <MetricCard
              label="Utilization"
              value={metrics.rateLimiter.rateLimiter.utilization}
              subtitle="Current load"
              color="text-purple-500"
            />
          </div>
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}

        {metrics.rateLimiter?.rateLimiter?.queueLength > 10 && (
          <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                High Queue Load
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Request queue is building up. Consider reducing API calls.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Deduplicator Stats */}
      {metrics.rateLimiter?.deduplicator && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Request Deduplicator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              label="Cache Size"
              value={metrics.rateLimiter.deduplicator.cacheSize}
              subtitle="Cached responses"
              color="text-cyan-500"
            />
            <MetricCard
              label="Pending Requests"
              value={metrics.rateLimiter.deduplicator.pendingRequests}
              subtitle="In-flight"
              color="text-indigo-500"
            />
          </div>
        </Card>
      )}

      {/* Memory Usage */}
      {metrics.memory && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Memory Usage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="Used"
              value={`${metrics.memory.used} MB`}
              subtitle={`of ${metrics.memory.total} MB`}
              color="text-blue-500"
            />
            <MetricCard
              label="Heap Limit"
              value={`${metrics.memory.limit} MB`}
              subtitle="Maximum available"
              color="text-purple-500"
            />
            <MetricCard
              label="Utilization"
              value={`${((metrics.memory.used / metrics.memory.limit) * 100).toFixed(1)}%`}
              subtitle="of limit"
              color={
                (metrics.memory.used / metrics.memory.limit) * 100 > 80
                  ? 'text-red-500'
                  : 'text-green-500'
              }
            />
          </div>

          {(metrics.memory.used / metrics.memory.limit) * 100 > 80 && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  High Memory Usage
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Memory usage is high. Consider reloading the page.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Performance Timing */}
      {metrics.performance && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Page Load Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="DOM Interactive"
              value={`${metrics.performance.domInteractive} ms`}
              subtitle="Time to interactive"
              color="text-green-500"
            />
            <MetricCard
              label="DOM Content Loaded"
              value={`${metrics.performance.domContentLoaded} ms`}
              subtitle="DOMContentLoaded"
              color="text-blue-500"
            />
            <MetricCard
              label="Page Load Complete"
              value={`${metrics.performance.loadComplete} ms`}
              subtitle="Full load time"
              color="text-purple-500"
            />
          </div>
        </Card>
      )}

      {/* Component Render Times */}
      {metrics.components.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Component Render Times
          </h2>

          <div className="space-y-2">
            {metrics.components.map((component, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-sm font-mono truncate flex-1">
                  {component.name}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    parseFloat(component.duration) > 16
                      ? 'text-red-500'
                      : parseFloat(component.duration) > 8
                      ? 'text-orange-500'
                      : 'text-green-500'
                  }`}
                >
                  {component.duration} ms
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              âš¡ Good: &lt;8ms â€¢ âš ï¸ Warning: 8-16ms â€¢ ðŸ”´ Slow: &gt;16ms
            </p>
          </div>
        </Card>
      )}

      {/* Performance Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h2 className="text-xl font-semibold mb-4">ðŸ’¡ Performance Tips</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">âœ“</span>
            <span>
              Rate limiter keeps API calls under control (~120 req/min)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">âœ“</span>
            <span>Request deduplication eliminates duplicate API calls</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">âœ“</span>
            <span>Components taking &gt;16ms to render should be optimized</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">âœ“</span>
            <span>Keep memory usage below 80% to prevent slowdowns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">âœ“</span>
            <span>Monitor queue length - high values indicate bottlenecks</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, subtitle, color = 'text-gray-700' }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default PerformanceDashboard;
