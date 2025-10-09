/**
 * @fileoverview Loading skeleton components for better perceived performance
 * @description Provides animated placeholder components to display while content loads
 */

/**
 * Base skeleton component with animation
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Dashboard loading skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="border rounded-lg p-6">
        <Skeleton className="h-[300px] w-full" />
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
    </div>
  );
}

/**
 * Transaction list loading skeleton
 */
export function TransactionSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Budget overview loading skeleton
 */
export function BudgetSkeleton() {
  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      
      {/* Budget categories */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}

/**
 * Calendar loading skeleton
 */
export function CalendarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Analytics/Chart loading skeleton
 */
export function ChartSkeleton({ height = 'h-[300px]' }) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className={`${height} w-full`} />
      <div className="flex justify-center gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Table loading skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="bg-muted/50 border-b p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b p-4">
          <div className="flex gap-4">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form loading skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Card loading skeleton
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  );
}

/**
 * List item loading skeleton
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}
