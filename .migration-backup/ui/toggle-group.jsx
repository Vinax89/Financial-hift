/**
 * @fileoverview ToggleGroup component using Radix UI primitives
 * @description Group of toggle buttons with single or multiple selection (like radio group but with toggle styling)
 */

"use client";
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { toggleVariants } from '@/ui/toggle'

/**
 * @typedef {Object} ToggleGroupContextValue
 * @property {'default'|'outline'} variant - Toggle variant
 * @property {'default'|'sm'|'lg'} size - Toggle size
 */

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

/**
 * ToggleGroup container component
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'default'|'outline'} [props.variant='default'] - Toggle button variant
 * @param {'default'|'sm'|'lg'} [props.size='default'] - Toggle button size
 * @param {'single'|'multiple'} props.type - Selection mode
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Toggle group container
 * @example
 * <ToggleGroup type="single" value={value} onValueChange={setValue}>
 *   <ToggleGroupItem value="left">Left</ToggleGroupItem>
 *   <ToggleGroupItem value="center">Center</ToggleGroupItem>
 *   <ToggleGroupItem value="right">Right</ToggleGroupItem>
 * </ToggleGroup>
 */
const ToggleGroup = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}>
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

/**
 * Individual toggle item within ToggleGroup
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.value - Toggle value
 * @param {'default'|'outline'} [props.variant] - Override group variant
 * @param {'default'|'sm'|'lg'} [props.size] - Override group size
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Toggle button item
 */
const ToggleGroupItem = React.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    (<ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), className)}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>)
  );
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
