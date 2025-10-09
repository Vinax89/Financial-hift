/**
 * @fileoverview HoverCard component using Radix UI primitives
 * @description Popover content shown on hover with animations and positioning
 */

"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

/**
 * HoverCard root component
 * @type {React.ComponentType}
 * @example
 * <HoverCard>
 *   <HoverCardTrigger>Hover me</HoverCardTrigger>
 *   <HoverCardContent>Additional info</HoverCardContent>
 * </HoverCard>
 */
const HoverCard = HoverCardPrimitive.Root

/** @type {React.ComponentType} Element that triggers hover card on hover */
const HoverCardTrigger = HoverCardPrimitive.Trigger

/**
 * HoverCard content popover
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'start'|'center'|'end'} [props.align='center'] - Content alignment
 * @param {number} [props.sideOffset=4] - Distance from trigger
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Animated popover content
 */
const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props} />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }

