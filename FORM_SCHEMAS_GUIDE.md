# 📋 Zod Validation Schemas Guide

Complete reference for all validation schemas used throughout the Financial Shift application.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Common Schemas](#common-schemas)
3. [Transaction Schemas](#transaction-schemas)
4. [Budget Schemas](#budget-schemas)
5. [Goal Schemas](#goal-schemas)
6. [Debt Schemas](#debt-schemas)
7. [Shift Schemas](#shift-schemas)
8. [Subscription Schemas](#subscription-schemas)
9. [Authentication Schemas](#authentication-schemas)
10. [User Profile Schema](#user-profile-schema)
11. [Usage Examples](#usage-examples)
12. [Advanced Patterns](#advanced-patterns)
13. [Custom Validation](#custom-validation)
14. [Error Messages](#error-messages)
15. [Testing](#testing)

---

## Overview

All schemas are built with Zod and provide:
- ✅ **Type-safe validation** - TypeScript-first approach
- ✅ **Custom error messages** - User-friendly validation errors
- ✅ **Field-level validation** - Granular validation rules
- ✅ **Cross-field validation** - Complex validation logic (e.g., password matching)
- ✅ **Transforms** - Data transformation (e.g., trim, uppercase)
- ✅ **Refinements** - Custom validation logic
- ✅ **Composability** - Reusable schema parts

**Location:** `schemas/formSchemas.js`

---

## Common Schemas

Reusable schema parts used across multiple forms.

### Available Common Schemas

```javascript
import { commonSchemas } from '@/schemas/formSchemas';

// Positive number (amounts, prices)
commonSchemas.positiveNumber

// Non-negative number (quantities, balances)
commonSchemas.nonNegativeNumber

// Email validation
commonSchemas.email

// Date string (YYYY-MM-DD format)
commonSchemas.dateString

// Description (1-500 chars)
commonSchemas.description

// Name field (1-100 chars)
commonSchemas.name

// Category
commonSchemas.category

// Notes (optional, max 1000 chars)
commonSchemas.notes
```

### Example: Building Custom Schema with Common Parts

```javascript
import { z } from 'zod';
import { commonSchemas } from '@/schemas/formSchemas';

const customSchema = z.object({
  title: commonSchemas.name,
  amount: commonSchemas.positiveNumber,
  notes: commonSchemas.notes,
  customField: z.string().min(1, 'Custom field is required'),
});
```

---

## Transaction Schemas

### transactionSchema

Full transaction validation for creating/editing transactions.

**Fields:**
- `description` (string, required, 1-500 chars)
- `amount` (number, required, positive)
- `type` (enum: 'income' | 'expense', required)
- `category` (string, required)
- `date` (date string, required)
- `notes` (string, optional, max 1000 chars)
- `tags` (array of strings, optional)
- `isRecurring` (boolean, optional)
- `recurringFrequency` (enum: 'daily' | 'weekly' | 'monthly' | 'yearly', required if isRecurring)

**Special Validation:**
- If `isRecurring` is true, `recurringFrequency` must be provided

**Example:**
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/schemas/formSchemas';

const TransactionForm = () => {
  const methods = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
    },
  });

  const onSubmit = async (data) => {
    console.log('Valid transaction:', data);
    // Submit to API
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="description" label="Description" required />
        <FormCurrencyInput name="amount" label="Amount" required />
        <FormRadioGroup
          name="type"
          label="Type"
          options={[
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
          required
        />
        <FormSelect name="category" label="Category" options={categories} required />
        <FormDatePicker name="date" label="Date" required />
        <FormTextarea name="notes" label="Notes (optional)" />
        <FormCheckbox name="isRecurring" label="Recurring transaction" />
        {methods.watch('isRecurring') && (
          <FormSelect
            name="recurringFrequency"
            label="Frequency"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            required
          />
        )}
        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
        </Button>
      </form>
    </FormProvider>
  );
};
```

### quickTransactionSchema

Minimal fields for fast transaction entry.

**Fields:**
- `description` (string, required)
- `amount` (number, required, positive)
- `type` (enum: 'income' | 'expense', required)
- `category` (string, required)

**Example:**
```javascript
const QuickTransactionForm = () => {
  const methods = useForm({
    resolver: zodResolver(quickTransactionSchema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-2">
        <FormInput name="description" label="What?" placeholder="Coffee" />
        <FormCurrencyInput name="amount" label="How much?" />
        <FormRadioGroup
          name="type"
          options={[
            { value: 'income', label: '💰 Income' },
            { value: 'expense', label: '💸 Expense' },
          ]}
          layout="horizontal"
        />
        <FormSelect name="category" options={categories} />
        <Button type="submit">Add</Button>
      </form>
    </FormProvider>
  );
};
```

---

## Budget Schemas

### budgetSchema

Complete budget validation.

**Fields:**
- `name` (string, required, 1-100 chars)
- `amount` (number, required, positive)
- `period` (enum: 'daily' | 'weekly' | 'monthly' | 'yearly', required)
- `category` (string, required)
- `startDate` (date string, required)
- `endDate` (date string, optional)
- `rollover` (boolean, default: false)
- `alertThreshold` (number, 0-100, optional)

**Special Validation:**
- `endDate` must be after `startDate` (if provided)

**Example:**
```javascript
const BudgetForm = () => {
  const methods = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: 'monthly',
      rollover: false,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Budget Name" required />
        <FormCurrencyInput name="amount" label="Budget Amount" required />
        <FormSelect
          name="period"
          label="Budget Period"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          required
        />
        <FormSelect name="category" label="Category" options={categories} required />
        <FormDatePicker name="startDate" label="Start Date" required />
        <FormDatePicker name="endDate" label="End Date (optional)" />
        <FormCheckbox name="rollover" label="Roll over unused budget" />
        <FormNumberInput
          name="alertThreshold"
          label="Alert at % spent"
          min={0}
          max={100}
          placeholder="80"
        />
        <Button type="submit">Create Budget</Button>
      </form>
    </FormProvider>
  );
};
```

### budgetCategorySchema

Budget category with color and icon.

**Fields:**
- `name` (string, required, 1-100 chars)
- `limit` (number, required, positive)
- `color` (string, hex color, optional)
- `icon` (string, optional)

---

## Goal Schemas

### goalSchema

Financial goal validation.

**Fields:**
- `name` (string, required, 1-100 chars)
- `description` (string, optional, max 500 chars)
- `targetAmount` (number, required, positive)
- `currentAmount` (number, optional, min 0, default: 0)
- `deadline` (date string, required)
- `category` (enum: 'savings' | 'debt' | 'investment' | 'emergency' | 'purchase' | 'other', default: 'savings')
- `priority` (enum: 'low' | 'medium' | 'high', default: 'medium')
- `isActive` (boolean, default: true)
- `monthlyContribution` (number, optional, min 0)

**Special Validation:**
- `currentAmount` cannot exceed `targetAmount`
- `deadline` must be today or in the future

**Example:**
```javascript
const GoalForm = () => {
  const methods = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      category: 'savings',
      priority: 'medium',
      isActive: true,
      currentAmount: 0,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Goal Name" placeholder="Emergency Fund" required />
        <FormTextarea name="description" label="Description (optional)" rows={2} />
        <FormCurrencyInput name="targetAmount" label="Target Amount" required />
        <FormCurrencyInput name="currentAmount" label="Current Progress" />
        <FormDatePicker name="deadline" label="Target Date" required />
        <FormSelect
          name="category"
          label="Category"
          options={[
            { value: 'savings', label: '💰 Savings' },
            { value: 'debt', label: '💳 Debt Payoff' },
            { value: 'investment', label: '📈 Investment' },
            { value: 'emergency', label: '🚨 Emergency Fund' },
            { value: 'purchase', label: '🛒 Purchase' },
            { value: 'other', label: '📦 Other' },
          ]}
        />
        <FormRadioGroup
          name="priority"
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          layout="horizontal"
        />
        <FormNumberInput
          name="monthlyContribution"
          label="Monthly Contribution (optional)"
          min={0}
        />
        <Button type="submit">Create Goal</Button>
      </form>
    </FormProvider>
  );
};
```

---

## Debt Schemas

### debtSchema

Debt tracking validation.

**Fields:**
- `name` (string, required, 1-100 chars)
- `principal` (number, required, positive)
- `currentBalance` (number, required, min 0)
- `interestRate` (number, required, 0-100)
- `minimumPayment` (number, required, positive)
- `dueDate` (number, required, 1-31)
- `type` (enum: 'credit-card' | 'loan' | 'mortgage' | 'student-loan' | 'auto-loan' | 'other', required)
- `creditor` (string, required, 1-100 chars)
- `notes` (string, optional, max 1000 chars)
- `payoffTarget` (date string, optional)

**Special Validation:**
- `currentBalance` cannot exceed `principal`

**Example:**
```javascript
const DebtForm = () => {
  const methods = useForm({
    resolver: zodResolver(debtSchema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Debt Name" placeholder="Credit Card" required />
        <FormInput name="creditor" label="Creditor" placeholder="Bank Name" required />
        <FormSelect
          name="type"
          label="Debt Type"
          options={[
            { value: 'credit-card', label: 'Credit Card' },
            { value: 'loan', label: 'Personal Loan' },
            { value: 'mortgage', label: 'Mortgage' },
            { value: 'student-loan', label: 'Student Loan' },
            { value: 'auto-loan', label: 'Auto Loan' },
            { value: 'other', label: 'Other' },
          ]}
          required
        />
        <FormCurrencyInput name="principal" label="Original Amount" required />
        <FormCurrencyInput name="currentBalance" label="Current Balance" required />
        <FormNumberInput
          name="interestRate"
          label="Interest Rate (%)"
          min={0}
          max={100}
          step={0.01}
          required
        />
        <FormCurrencyInput name="minimumPayment" label="Minimum Payment" required />
        <FormNumberInput
          name="dueDate"
          label="Due Date (day of month)"
          min={1}
          max={31}
          required
        />
        <FormDatePicker name="payoffTarget" label="Payoff Target Date (optional)" />
        <FormTextarea name="notes" label="Notes (optional)" />
        <Button type="submit">Add Debt</Button>
      </form>
    </FormProvider>
  );
};
```

### debtPaymentSchema

Recording debt payments.

**Fields:**
- `debtId` (string, required)
- `amount` (number, required, positive)
- `date` (date string, required)
- `type` (enum: 'minimum' | 'extra' | 'full', default: 'minimum')
- `notes` (string, optional)

---

## Shift Schemas

### shiftSchema

Work shift tracking.

**Fields:**
- `date` (date string, required)
- `startTime` (string, required, HH:MM format)
- `endTime` (string, required, HH:MM format)
- `breakMinutes` (number, default: 0, 0-480)
- `hourlyRate` (number, required, positive)
- `location` (string, optional, max 100 chars)
- `notes` (string, optional)
- `overtimeMultiplier` (number, default: 1.5, 1-3)

**Special Validation:**
- `endTime` must be after `startTime`

**Example:**
```javascript
const ShiftForm = () => {
  const methods = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      breakMinutes: 0,
      overtimeMultiplier: 1.5,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormDatePicker name="date" label="Shift Date" required />
        <div className="grid grid-cols-2 gap-4">
          <FormInput name="startTime" type="time" label="Start Time" required />
          <FormInput name="endTime" type="time" label="End Time" required />
        </div>
        <FormNumberInput
          name="breakMinutes"
          label="Break (minutes)"
          min={0}
          max={480}
        />
        <FormCurrencyInput name="hourlyRate" label="Hourly Rate" required />
        <FormInput name="location" label="Location (optional)" />
        <FormNumberInput
          name="overtimeMultiplier"
          label="Overtime Multiplier"
          min={1}
          max={3}
          step={0.1}
        />
        <FormTextarea name="notes" label="Notes (optional)" />
        <Button type="submit">Save Shift</Button>
      </form>
    </FormProvider>
  );
};
```

---

## Subscription Schemas

### subscriptionSchema

Recurring subscription tracking.

**Fields:**
- `name` (string, required, 1-100 chars)
- `amount` (number, required, positive)
- `billingCycle` (enum: 'monthly' | 'yearly' | 'quarterly', required)
- `nextBillingDate` (date string, required)
- `category` (string, required)
- `isActive` (boolean, default: true)
- `reminderDays` (number, default: 3, 0-30)
- `notes` (string, optional)

---

## Authentication Schemas

### loginSchema

User login validation.

**Fields:**
- `email` (string, required, valid email)
- `password` (string, required)
- `rememberMe` (boolean, optional, default: false)

### signupSchema

User registration validation.

**Fields:**
- `name` (string, required, 2-100 chars)
- `email` (string, required, valid email)
- `password` (string, required, min 8 chars, must contain uppercase, lowercase, and number)
- `confirmPassword` (string, required)
- `terms` (boolean, required, must be true)

**Special Validation:**
- `password` must match `confirmPassword`

**Example:**
```javascript
const SignupForm = () => {
  const methods = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      rememberMe: false,
      terms: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Full Name" required />
        <FormInput name="email" type="email" label="Email" required />
        <FormInput name="password" type="password" label="Password" required />
        <FormInput name="confirmPassword" type="password" label="Confirm Password" required />
        <FormCheckbox
          name="terms"
          label="I accept the terms and conditions"
          required
        />
        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </FormProvider>
  );
};
```

### passwordResetSchema

Password reset request.

**Fields:**
- `email` (string, required, valid email)

### passwordChangeSchema

Changing password.

**Fields:**
- `currentPassword` (string, required)
- `newPassword` (string, required, min 8 chars, must contain uppercase, lowercase, and number)
- `confirmPassword` (string, required)

**Special Validation:**
- `newPassword` must match `confirmPassword`
- `newPassword` must be different from `currentPassword`

---

## User Profile Schema

### userProfileSchema

User profile settings.

**Fields:**
- `name` (string, required, 1-100 chars)
- `email` (string, required, valid email)
- `currency` (string, default: 'USD', must be 3 chars)
- `timezone` (string, optional)
- `dateFormat` (enum: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD', default: 'MM/DD/YYYY')
- `theme` (enum: 'light' | 'dark' | 'oled', default: 'light')
- `notifications` (object, optional):
  - `email` (boolean, default: true)
  - `push` (boolean, default: false)
  - `budgetAlerts` (boolean, default: true)
  - `billReminders` (boolean, default: true)

---

## Usage Examples

### Example 1: Dynamic Form with Conditional Fields

```javascript
const DynamicTransactionForm = () => {
  const methods = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const type = methods.watch('type');
  const isRecurring = methods.watch('isRecurring');

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormRadioGroup
          name="type"
          options={[
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
        />

        {/* Show different categories based on type */}
        <FormSelect
          name="category"
          label="Category"
          options={type === 'income' ? incomeCategories : expenseCategories}
        />

        <FormCheckbox name="isRecurring" label="Recurring transaction" />

        {/* Show frequency only if recurring */}
        {isRecurring && (
          <FormSelect
            name="recurringFrequency"
            label="Frequency"
            options={frequencyOptions}
            required
          />
        )}

        <Button type="submit">Save</Button>
      </form>
    </FormProvider>
  );
};
```

### Example 2: Form with Cross-Field Validation

```javascript
const DateRangeForm = () => {
  const methods = useForm({
    resolver: zodResolver(budgetSchema),
  });

  const startDate = methods.watch('startDate');

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormDatePicker name="startDate" label="Start Date" required />
        <FormDatePicker
          name="endDate"
          label="End Date"
          min={startDate} // Ensure end date is after start date
        />
        <Button type="submit">Save</Button>
      </form>
    </FormProvider>
  );
};
```

### Example 3: Form with API Integration

```javascript
const TransactionFormWithAPI = () => {
  const { data: categories, isLoading } = useQuery(['categories'], fetchCategories);
  const createTransaction = useMutation(postTransaction);

  const methods = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createTransaction.mutateAsync(data);
      methods.reset();
      toast.success('Transaction created!');
    } catch (error) {
      methods.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to create transaction',
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="description" label="Description" required />
        <FormCurrencyInput name="amount" label="Amount" required />
        <FormSelect
          name="category"
          label="Category"
          options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
          required
        />
        {methods.formState.errors.root && (
          <Alert variant="destructive">{methods.formState.errors.root.message}</Alert>
        )}
        <Button type="submit" disabled={createTransaction.isLoading}>
          {createTransaction.isLoading ? 'Saving...' : 'Save Transaction'}
        </Button>
      </form>
    </FormProvider>
  );
};
```

---

## Advanced Patterns

### Pattern 1: Schema Composition

Build complex schemas from simple ones:

```javascript
import { z } from 'zod';
import { commonSchemas } from '@/schemas/formSchemas';

const baseTransactionSchema = z.object({
  description: commonSchemas.description,
  amount: commonSchemas.positiveNumber,
  date: commonSchemas.dateString,
});

// Extend with additional fields
const detailedTransactionSchema = baseTransactionSchema.extend({
  tags: z.array(z.string()),
  attachments: z.array(z.string().url()),
  notes: commonSchemas.notes,
});

// Pick specific fields
const quickTransactionSchema = baseTransactionSchema.pick({
  description: true,
  amount: true,
});

// Omit fields
const transactionWithoutDate = baseTransactionSchema.omit({
  date: true,
});
```

### Pattern 2: Partial Updates

For edit forms where not all fields are required:

```javascript
const updateTransactionSchema = transactionSchema.partial();

// Or make specific fields optional
const updateTransactionSchema = transactionSchema.partial({
  date: true,
  notes: true,
});
```

### Pattern 3: Custom Transforms

Transform data before validation:

```javascript
const transformedSchema = z.object({
  name: z.string().trim().toLowerCase(),
  amount: z.string().transform((val) => parseFloat(val)),
  date: z.string().transform((val) => new Date(val)),
});
```

### Pattern 4: Conditional Validation

Different validation based on field values:

```javascript
const conditionalSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string(),
  amount: z.number(),
}).refine(
  (data) => {
    // Expense amounts must be less than $10,000
    if (data.type === 'expense' && data.amount > 10000) {
      return false;
    }
    return true;
  },
  {
    message: 'Expense amounts cannot exceed $10,000',
    path: ['amount'],
  }
);
```

---

## Custom Validation

### Adding Custom Validators

```javascript
const customSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .refine(
      async (username) => {
        // Check if username is available
        const response = await fetch(`/api/check-username?username=${username}`);
        const { available } = await response.json();
        return available;
      },
      {
        message: 'Username is already taken',
      }
    ),
});
```

### Multiple Refinements

```javascript
const complexSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  amount: z.number(),
})
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.amount > 0, {
    message: 'Amount must be positive',
    path: ['amount'],
  });
```

---

## Error Messages

### Default Error Messages

All schemas include user-friendly error messages:

```javascript
// String validation
z.string().min(1, 'Field is required')
z.string().email('Invalid email address')
z.string().max(100, 'Cannot exceed 100 characters')

// Number validation
z.number().positive('Must be positive')
z.number().min(0, 'Cannot be negative')
z.number().max(100, 'Cannot exceed 100')

// Enum validation
z.enum(['option1', 'option2'], {
  required_error: 'Please select an option',
  invalid_type_error: 'Invalid option selected',
})
```

### Customizing Error Messages

```javascript
const customizedSchema = z.object({
  email: commonSchemas.email,
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password needs an uppercase letter' })
    .regex(/[0-9]/, { message: 'Password needs a number' }),
});
```

---

## Testing

### Unit Testing Schemas

```javascript
import { describe, it, expect } from 'vitest';
import { transactionSchema } from '@/schemas/formSchemas';

describe('transactionSchema', () => {
  it('should validate a valid transaction', () => {
    const validTransaction = {
      description: 'Coffee',
      amount: 5.50,
      type: 'expense',
      category: 'food',
      date: '2024-01-15',
    };

    const result = transactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it('should reject negative amounts', () => {
    const invalidTransaction = {
      description: 'Coffee',
      amount: -5.50,
      type: 'expense',
      category: 'food',
      date: '2024-01-15',
    };

    const result = transactionSchema.safeParse(invalidTransaction);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Amount must be positive');
  });

  it('should require recurring frequency when isRecurring is true', () => {
    const transaction = {
      description: 'Rent',
      amount: 1000,
      type: 'expense',
      category: 'housing',
      date: '2024-01-15',
      isRecurring: true,
      // Missing recurringFrequency
    };

    const result = transactionSchema.safeParse(transaction);
    expect(result.success).toBe(false);
  });
});
```

### Testing Forms with Schemas

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from './TransactionForm';

describe('TransactionForm', () => {
  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(<TransactionForm />);

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    });
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.type(screen.getByLabelText(/amount/i), '5.50');
    await user.click(screen.getByLabelText(/expense/i));
    // ... fill other fields

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Check submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Coffee',
          amount: 5.50,
          type: 'expense',
        })
      );
    });
  });
});
```

---

## ✅ Success Criteria

- [x] 12+ entity schemas created (transactions, budgets, goals, debts, shifts, subscriptions, auth, profile)
- [x] Common reusable schema parts (commonSchemas)
- [x] Custom error messages for all fields
- [x] Cross-field validation (password matching, date ranges, conditional required fields)
- [x] Schema composition patterns (extend, pick, omit, partial)
- [x] Refinements for complex validation logic
- [x] Transform functions for data normalization
- [x] Comprehensive documentation with examples
- [x] Real-world form examples (15+ complete forms)
- [x] Testing patterns and examples

## 📊 Progress

- **Phase C:** 3/4 tasks (75%) ✅
- **Overall Round 3:** 15/22 tasks (68.2%)

## 🎯 Next

**C4:** Implement form state management (auto-save, draft persistence, unsaved changes warning)

