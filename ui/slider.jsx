/**
 * @fileoverview Slider component using Radix UI primitives
 * @description Accessible range slider with track, range indicator, and draggable thumb
 */

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * Slider component with track and thumb
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {number[]} [props.defaultValue] - Default slider value(s)
 * @param {number[]} [props.value] - Controlled slider value(s)
 * @param {Function} [props.onValueChange] - Callback when value changes
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {React.Ref} ref - Forwarded ref for form integration
 * @returns {JSX.Element} Range slider
 * @example
 * <Slider
 *   defaultValue={[50]}
 *   max={100}
 *   step={1}
 *   onValueChange={(value) => console.log(value)}
 * />
 */
const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
