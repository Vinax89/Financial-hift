/**
 * @fileoverview Skeleton loading placeholder component
 * @description Animated pulse skeleton for content loading states
 */

import { cn } from "@/lib/utils"

/**
 * Skeleton placeholder component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for size/shape customization
 * @returns {JSX.Element} Skeleton loading element
 * @example
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-12 w-12 rounded-full" />
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props} />)
  );
}

export { Skeleton }
