/**
 * @fileoverview Tooltip component using Radix UI primitives
 * @description Accessible tooltip with portal rendering and smooth animations
 */

"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * Tooltip provider component for shared tooltip context
 * @type {React.Component}
 */
const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip root component
 * @type {React.Component}
 */
const Tooltip = TooltipPrimitive.Root

/**
 * Tooltip trigger component
 * @type {React.Component}
 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * Tooltip content component with portal
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.sideOffset=4] - Distance from trigger in pixels
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Tooltip content
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Helpful tooltip text</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props} />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
