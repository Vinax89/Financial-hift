/**
 * @fileoverview Collapsible component using Radix UI primitives
 * @description Expandable/collapsible content panel with animation
 */

"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Collapsible root component
 * @type {React.ComponentType}
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *   <CollapsibleContent>Hidden content</CollapsibleContent>
 * </Collapsible>
 */
const Collapsible = CollapsiblePrimitive.Root

/** @type {React.ComponentType} Button to toggle collapsed/expanded state */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

/** @type {React.ComponentType} Content that shows/hides with animation */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
