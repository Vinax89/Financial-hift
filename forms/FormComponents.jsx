/**
 * @fileoverview Standardized form components integrated with react-hook-form
 * @description Reusable form components with built-in validation, error handling,
 * and consistent styling. All components work seamlessly with react-hook-form.
 */

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Label } from '@/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Checkbox } from '@/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { cn } from '@/lib/utils';

/**
 * Error message component for form fields
 */
const FieldError = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <p className={cn('text-xs text-destructive mt-1 animate-in fade-in-0', className)}>
      {error.message || error}
    </p>
  );
};

/**
 * FormInput - Text input field with validation
 * 
 * @param {Object} props
 * @param {string} props.name - Field name (required)
 * @param {string} props.label - Field label (optional)
 * @param {string} props.placeholder - Placeholder text (optional)
 * @param {string} props.type - Input type (default: 'text')
 * @param {boolean} props.required - Mark as required (optional)
 * @param {string} props.description - Helper text below input (optional)
 * @param {boolean} props.disabled - Disable input (optional)
 * @param {Object} props.validation - Additional validation rules (optional)
 * 
 * @example
 * <FormInput
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 * />
 */
export const FormInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  description,
  disabled = false,
  validation = {},
  className,
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        {...register(name, {
          required: required ? `${label || name} is required` : false,
          ...validation,
        })}
        {...props}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormTextarea - Multi-line text input with validation
 * 
 * @example
 * <FormTextarea
 *   name="notes"
 *   label="Notes"
 *   placeholder="Add any notes..."
 *   rows={4}
 * />
 */
export const FormTextarea = ({
  name,
  label,
  placeholder,
  required = false,
  description,
  disabled = false,
  validation = {},
  rows = 3,
  className,
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        {...register(name, {
          required: required ? `${label || name} is required` : false,
          ...validation,
        })}
        {...props}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormSelect - Dropdown select field with validation
 * 
 * @param {Object} props
 * @param {string} props.name - Field name (required)
 * @param {string} props.label - Field label (optional)
 * @param {Array} props.options - Array of options [{ value, label }] (required)
 * @param {string} props.placeholder - Placeholder text (optional)
 * @param {boolean} props.required - Mark as required (optional)
 * @param {string} props.description - Helper text (optional)
 * 
 * @example
 * <FormSelect
 *   name="category"
 *   label="Category"
 *   placeholder="Select a category"
 *   options={[
 *     { value: 'groceries', label: 'Groceries' },
 *     { value: 'transport', label: 'Transport' },
 *   ]}
 *   required
 * />
 */
export const FormSelect = ({
  name,
  label,
  options = [],
  placeholder = 'Select an option',
  required = false,
  description,
  disabled = false,
  className,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={cn(
                error && 'border-destructive focus:ring-destructive',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormCheckbox - Single checkbox with validation
 * 
 * @example
 * <FormCheckbox
 *   name="terms"
 *   label="I agree to the terms and conditions"
 *   required
 * />
 */
export const FormCheckbox = ({
  name,
  label,
  required = false,
  description,
  disabled = false,
  className,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field }) => (
          <div className="flex items-start space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                error && 'border-destructive',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {description && !error && (
                <p id={`${name}-description`} className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      />
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormRadioGroup - Radio button group with validation
 * 
 * @param {Object} props
 * @param {string} props.name - Field name (required)
 * @param {string} props.label - Field label (optional)
 * @param {Array} props.options - Array of options [{ value, label, description }] (required)
 * @param {boolean} props.required - Mark as required (optional)
 * @param {string} props.description - Helper text (optional)
 * @param {'vertical'|'horizontal'} props.layout - Layout direction (default: 'vertical')
 * 
 * @example
 * <FormRadioGroup
 *   name="type"
 *   label="Transaction Type"
 *   options={[
 *     { value: 'income', label: 'Income', description: 'Money coming in' },
 *     { value: 'expense', label: 'Expense', description: 'Money going out' },
 *   ]}
 *   required
 * />
 */
export const FormRadioGroup = ({
  name,
  label,
  options = [],
  required = false,
  description,
  disabled = false,
  layout = 'vertical',
  className,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
            className={cn(
              layout === 'horizontal' ? 'flex flex-row gap-4' : 'space-y-2',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  className={error ? 'border-destructive' : ''}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormDatePicker - Date input field with validation
 * 
 * @example
 * <FormDatePicker
 *   name="dueDate"
 *   label="Due Date"
 *   required
 * />
 */
export const FormDatePicker = ({
  name,
  label,
  required = false,
  description,
  disabled = false,
  min,
  max,
  className,
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Input
        id={name}
        type="date"
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        {...register(name, {
          required: required ? `${label || name} is required` : false,
        })}
        {...props}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormNumberInput - Number input field with validation
 * 
 * @example
 * <FormNumberInput
 *   name="amount"
 *   label="Amount"
 *   placeholder="0.00"
 *   min={0}
 *   step={0.01}
 *   required
 * />
 */
export const FormNumberInput = ({
  name,
  label,
  placeholder,
  required = false,
  description,
  disabled = false,
  min,
  max,
  step = 'any',
  validation = {},
  className,
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <Input
        id={name}
        type="number"
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        {...register(name, {
          required: required ? `${label || name} is required` : false,
          valueAsNumber: true,
          ...validation,
        })}
        {...props}
      />
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

/**
 * FormCurrencyInput - Currency input with formatting
 * 
 * @example
 * <FormCurrencyInput
 *   name="budget"
 *   label="Budget Amount"
 *   currency="$"
 *   required
 * />
 */
export const FormCurrencyInput = ({
  name,
  label,
  placeholder = '0.00',
  required = false,
  description,
  disabled = false,
  currency = '$',
  validation = {},
  className,
  ...props
}) => {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const error = errors[name];
  const value = watch(name);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    setValue(name, rawValue, { shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {currency}
        </span>
        <Input
          id={name}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-8',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
          {...register(name, {
            required: required ? `${label || name} is required` : false,
            valueAsNumber: true,
            ...validation,
          })}
          onChange={handleChange}
          {...props}
        />
      </div>
      
      {description && !error && (
        <p id={`${name}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && <FieldError error={error} id={`${name}-error`} />}
    </div>
  );
};

// Export all components
export default {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormDatePicker,
  FormNumberInput,
  FormCurrencyInput,
  FieldError,
};
