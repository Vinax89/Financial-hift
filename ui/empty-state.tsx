/**
 * @fileoverview Empty state component for no data scenarios
 * @description Placeholder UI for empty lists, search results, or missing content
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state placeholder component
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "No Data Found",
  description = "There is no data to display here yet.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-lg bg-muted/50 border border-dashed border-border",
        className
      )}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
