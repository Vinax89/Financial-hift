/**
 * @fileoverview Button component with multiple variants and sizes
 * @description Flexible button component using Radix UI Slot for composition and CVA for variant styling.
 * Supports both button and custom component rendering via asChild prop.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Button style variants using class-variance-authority
 * @constant
 * @type {Function}
 * @property {Object} variants - Available button variants
 * @property {string} variants.default - Primary button style
 * @property {string} variants.destructive - Destructive/danger action style
 * @property {string} variants.outline - Outlined button style
 * @property {string} variants.secondary - Secondary button style
 * @property {string} variants.ghost - Ghost/minimal button style
 * @property {string} variants.link - Link-styled button
 * @property {Object} size - Available button sizes
 * @property {string} size.default - Default button size (h-9)
 * @property {string} size.sm - Small button size (h-8)
 * @property {string} size.lg - Large button size (h-10)
 * @property {string} size.icon - Icon-only button size (h-9 w-9)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button component with flexible styling and composition
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {('default'|'destructive'|'outline'|'secondary'|'ghost'|'link')} [props.variant='default'] - Button variant
 * @param {('default'|'sm'|'lg'|'icon')} [props.size='default'] - Button size
 * @param {boolean} [props.asChild=false] - Render as Slot component for composition
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Rendered button
 * @example
 * <Button variant="destructive" size="lg">Delete</Button>
 * <Button asChild><Link to="/home">Go Home</Link></Button>
 */
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
