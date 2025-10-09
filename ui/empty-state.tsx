/**
 * @fileoverview Empty state component for no data scenarios
 * @description Placeholder UI for empty lists, search results, or missing content
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

/**
 * Empty state placeholder component
 * @component
 * @param {Object} props - Component props
 * @param {React.ComponentType} [props.icon=Inbox] - Icon component to display
 * @param {string} [props.title='No Data Found'] - Empty state heading
 * @param {string} [props.description] - Explanation text
 * @param {React.ReactNode} [props.action] - Optional action button/link
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Empty state card
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "No Data Found",
  description = "There is no data to display here yet.",
  action,
  className,
}) {
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