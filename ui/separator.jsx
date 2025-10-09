/**
 * @fileoverview Separator component using Radix UI primitives
 * @description Visual divider line (horizontal or vertical) with accessibility support
 */

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Separator divider line
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal'] - Line direction
 * @param {boolean} [props.decorative=true] - If true, separator is visual only (not semantic)
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Horizontal or vertical divider line
 */
const Separator = React.forwardRef((
  { className, orientation = "horizontal", decorative = true, ...props },
  ref
) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
