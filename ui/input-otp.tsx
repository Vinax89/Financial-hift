/**
 * @fileoverview OTP (One-Time Password) input component
 * @description Accessible OTP input with individual digit slots and caret animation
 */

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * OTP input root component
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.containerClassName] - Container CSS classes
 * @param {number} props.maxLength - Number of OTP digits
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} OTP input container
 * @example
 * <InputOTP maxLength={6}>
 *   <InputOTPGroup>
 *     {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}
 *   </InputOTPGroup>
 * </InputOTP>
 */
const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props} />
))
InputOTP.displayName = "InputOTP"

/**
 * OTP input group (container for slots)
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Group of OTP slots
 */
const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

/**
 * Individual OTP digit slot
 * @component
 * @param {Object} props - Component props
 * @param {number} props.index - Slot index (0-based)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Single OTP digit box with caret
 */
const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    (<div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>)
  );
})
InputOTPSlot.displayName = "InputOTPSlot"

/**
 * OTP separator (visual divider between groups)
 * @component
 * @param {Object} props - Component props
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Separator dash icon
 */
const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
