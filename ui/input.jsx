/**
 * @fileoverview Styled input component with form integration support
 * @description Accessible input field with consistent styling, ref forwarding for form libraries
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Styled input component with ref forwarding
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='text'] - Input type attribute
 * @param {React.Ref} ref - Forwarded ref for form integration
 * @returns {JSX.Element} Rendered input
 * @example
 * <Input type="email" placeholder="Enter email" />
 * <Input type="password" className="w-full" />
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
