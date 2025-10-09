/**
 * @fileoverview Form components for React Hook Form integration
 * @description Accessible form components with automatic error handling, validation, and ARIA attributes.
 * Wraps React Hook Form with consistent styling and accessibility patterns.
 */

"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils"
import { Label } from '@/ui/label'

/**
 * Form root component (alias for React Hook Form's FormProvider)
 * @type {React.Component}
 */
const Form = FormProvider

/**
 * Form field context for tracking field names
 * @type {React.Context}
 */
const FormFieldContext = React.createContext({})

/**
 * Form field wrapper component with React Hook Form Controller
 * @param {Object} props - Controller props from React Hook Form
 * @param {string} props.name - Field name for form state
 * @param {Function} props.control - Form control from useForm
 * @param {Function} [props.render] - Render function for field
 * @returns {JSX.Element} Controlled form field
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Email</FormLabel>
 *       <FormControl>
 *         <Input {...field} />
 *       </FormControl>
 *     </FormItem>
 *   )}
 * />
 */
const FormField = (
  {
    ...props
  }
) => {
  return (
    (<FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>)
  );
}

/**
 * Hook to access form field state and metadata
 * @returns {Object} Field state including id, name, error, and ARIA ids
 * @throws {Error} If used outside FormField context
 * @example
 * const { error, formItemId } = useFormField()
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

/**
 * Form item context for tracking unique IDs
 * @type {React.Context}
 */
const FormItemContext = React.createContext({})

/**
 * Form item container component with automatic ID generation
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Form item container
 */
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    (<FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>)
  );
})
FormItem.displayName = "FormItem"

/**
 * Form label component with error state styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Form label with automatic error styling
 */
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    (<Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props} />)
  );
})
FormLabel.displayName = "FormLabel"

/**
 * Form control wrapper with ARIA attributes
 * @component
 * @param {Object} props - Component props
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Slot component with accessibility attributes
 * @description Automatically adds aria-describedby, aria-invalid, and id attributes
 */
const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    (<Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props} />)
  );
})
FormControl.displayName = "FormControl"

/**
 * Form description/help text component
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Help text paragraph
 */
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    (<p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props} />)
  );
})
FormDescription.displayName = "FormDescription"

/**
 * Form error/validation message component
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Custom message (overrides error)
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element|null} Error message or null if no error
 */
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    (<p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}>
      {body}
    </p>)
  );
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
