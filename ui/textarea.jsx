/**
 * @fileoverview Textarea component for multi-line text input
 * @description Accessible textarea with consistent styling and ref forwarding for form integration
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea component with ref forwarding
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref for form integration
 * @returns {JSX.Element} Textarea element
 * @example
 * <Textarea placeholder="Enter description..." rows={4} />
 */
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
