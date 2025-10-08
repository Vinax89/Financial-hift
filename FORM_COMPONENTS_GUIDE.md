# 📝 Form Components Guide - Complete Reference

**Status**: C2 Complete ✅  
**File**: `forms/FormComponents.jsx`  
**Components**: 8 form components + error handling  
**Lines**: 550+

---

## 🎯 Components Overview

All components integrate seamlessly with **react-hook-form** and must be used inside a `FormProvider`.

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `FormInput` | Text input | Email, password, text, url, tel |
| `FormTextarea` | Multi-line text | Notes, descriptions, comments |
| `FormSelect` | Dropdown | Categories, status, priorities |
| `FormCheckbox` | Single checkbox | Terms acceptance, toggles |
| `FormRadioGroup` | Radio buttons | Single choice from options |
| `FormDatePicker` | Date input | Dates, deadlines, schedules |
| `FormNumberInput` | Number input | Amounts, quantities, ratings |
| `FormCurrencyInput` | Money input | Budgets, prices, salaries |

---

## 🚀 Basic Usage

### Setup Form with FormProvider

```jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormSelect, FormDatePicker } from '@/forms/FormComponents';
import { Button } from '@/components/ui/button';

const schema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string(),
});

function TransactionForm() {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="description"
          label="Description"
          placeholder="Enter description"
          required
        />
        
        <FormNumberInput
          name="amount"
          label="Amount"
          placeholder="0.00"
          min={0}
          step={0.01}
          required
        />
        
        <FormSelect
          name="category"
          label="Category"
          placeholder="Select category"
          options={[
            { value: 'groceries', label: 'Groceries' },
            { value: 'transport', label: 'Transport' },
            { value: 'entertainment', label: 'Entertainment' },
          ]}
          required
        />
        
        <FormDatePicker
          name="date"
          label="Date"
          required
        />
        
        <Button type="submit" disabled={methods.formState.isSubmitting}>
          {methods.formState.isSubmitting ? 'Saving...' : 'Add Transaction'}
        </Button>
      </form>
    </FormProvider>
  );
}
```

---

## 📋 Component Details

### 1. FormInput

**Text input with validation and error handling**

```jsx
<FormInput
  name="email"                    // Required: field name
  label="Email Address"           // Optional: label text
  type="email"                    // Optional: input type (default: 'text')
  placeholder="Enter your email"  // Optional: placeholder
  required                        // Optional: mark as required
  description="We'll never share your email" // Optional: helper text
  disabled={false}                // Optional: disable input
  validation={{                   // Optional: additional validation
    pattern: {
      value: /^[A-Z0-9._%+-]+@/i,
      message: 'Invalid email'
    }
  }}
/>
```

**Available Types**:
- `text` (default)
- `email`
- `password`
- `url`
- `tel`
- `search`

**Example: Login Form**
```jsx
<FormInput
  name="username"
  label="Username"
  placeholder="Enter username"
  required
/>

<FormInput
  name="password"
  label="Password"
  type="password"
  placeholder="Enter password"
  required
  validation={{
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    }
  }}
/>
```

---

### 2. FormTextarea

**Multi-line text input for longer content**

```jsx
<FormTextarea
  name="notes"
  label="Notes"
  placeholder="Add any notes..."
  rows={4}                        // Optional: number of rows (default: 3)
  required
  description="Optional notes about this transaction"
/>
```

**Example: Feedback Form**
```jsx
<FormTextarea
  name="feedback"
  label="Your Feedback"
  placeholder="Tell us what you think..."
  rows={6}
  required
  validation={{
    maxLength: {
      value: 500,
      message: 'Feedback cannot exceed 500 characters'
    }
  }}
/>
```

---

### 3. FormSelect

**Dropdown select field**

```jsx
<FormSelect
  name="category"
  label="Category"
  placeholder="Select a category"
  options={[
    { value: 'groceries', label: 'Groceries' },
    { value: 'transport', label: 'Transport' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
  ]}
  required
  description="Choose the transaction category"
/>
```

**Example: Budget Period**
```jsx
<FormSelect
  name="period"
  label="Budget Period"
  placeholder="Select period"
  options={[
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ]}
  required
/>
```

**Dynamic Options from API**
```jsx
const { data: categories } = useQuery(['categories'], fetchCategories);

<FormSelect
  name="category"
  label="Category"
  options={categories?.map(cat => ({
    value: cat.id,
    label: cat.name
  })) || []}
  required
/>
```

---

### 4. FormCheckbox

**Single checkbox for boolean values**

```jsx
<FormCheckbox
  name="terms"
  label="I agree to the terms and conditions"
  required
  description="You must accept to continue"
/>
```

**Example: Settings Form**
```jsx
<FormCheckbox
  name="notifications"
  label="Enable email notifications"
  description="Receive updates about your account"
/>

<FormCheckbox
  name="newsletter"
  label="Subscribe to newsletter"
  description="Get weekly financial tips"
/>

<FormCheckbox
  name="twoFactor"
  label="Enable two-factor authentication"
  description="Add an extra layer of security"
/>
```

---

### 5. FormRadioGroup

**Radio button group for single selection**

```jsx
<FormRadioGroup
  name="type"
  label="Transaction Type"
  options={[
    {
      value: 'income',
      label: 'Income',
      description: 'Money coming in'
    },
    {
      value: 'expense',
      label: 'Expense',
      description: 'Money going out'
    },
  ]}
  required
  layout="horizontal"  // or 'vertical' (default)
/>
```

**Example: Payment Method**
```jsx
<FormRadioGroup
  name="paymentMethod"
  label="Payment Method"
  options={[
    {
      value: 'card',
      label: 'Credit Card',
      description: 'Pay with credit or debit card'
    },
    {
      value: 'bank',
      label: 'Bank Transfer',
      description: 'Direct bank transfer'
    },
    {
      value: 'paypal',
      label: 'PayPal',
      description: 'Pay with PayPal account'
    },
  ]}
  required
  layout="vertical"
/>
```

---

### 6. FormDatePicker

**Date input field**

```jsx
<FormDatePicker
  name="dueDate"
  label="Due Date"
  required
  min={new Date().toISOString().split('T')[0]}  // Today or later
  description="When is this due?"
/>
```

**Example: Date Range**
```jsx
<FormDatePicker
  name="startDate"
  label="Start Date"
  required
/>

<FormDatePicker
  name="endDate"
  label="End Date"
  required
  min={methods.watch('startDate')}  // End date must be after start
/>
```

---

### 7. FormNumberInput

**Number input with validation**

```jsx
<FormNumberInput
  name="amount"
  label="Amount"
  placeholder="0.00"
  min={0}
  max={10000}
  step={0.01}
  required
/>
```

**Example: Goal Form**
```jsx
<FormNumberInput
  name="targetAmount"
  label="Target Amount"
  placeholder="1000"
  min={1}
  required
  description="How much do you want to save?"
/>

<FormNumberInput
  name="monthlyContribution"
  label="Monthly Contribution"
  placeholder="100"
  min={0}
  step={10}
  description="How much will you save each month?"
/>
```

---

### 8. FormCurrencyInput

**Currency input with $ prefix**

```jsx
<FormCurrencyInput
  name="budget"
  label="Budget Amount"
  currency="$"
  placeholder="0.00"
  required
  description="Enter your monthly budget"
/>
```

**Example: Budget Form**
```jsx
<FormCurrencyInput
  name="income"
  label="Monthly Income"
  currency="$"
  placeholder="5000.00"
  required
/>

<FormCurrencyInput
  name="expenses"
  label="Expected Expenses"
  currency="$"
  placeholder="3000.00"
  required
/>
```

**Custom Currency Symbol**
```jsx
<FormCurrencyInput
  name="amount"
  label="Amount"
  currency="€"  // Euro
  placeholder="0.00"
  required
/>

<FormCurrencyInput
  name="amount"
  label="Amount"
  currency="£"  // Pound
  placeholder="0.00"
  required
/>
```

---

## 🎨 Complete Form Examples

### Transaction Form
```jsx
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormInput,
  FormCurrencyInput,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormTextarea,
} from '@/forms/FormComponents';
import { Button } from '@/components/ui/button';
import { useCreateTransaction } from '@/hooks/useTransactions';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string(),
  notes: z.string().optional(),
});

export function TransactionForm({ onSuccess }) {
  const createTransaction = useCreateTransaction();
  
  const methods = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createTransaction.mutateAsync(data);
      methods.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormRadioGroup
          name="type"
          label="Type"
          options={[
            { value: 'income', label: 'Income', description: 'Money in' },
            { value: 'expense', label: 'Expense', description: 'Money out' },
          ]}
          layout="horizontal"
          required
        />
        
        <FormInput
          name="description"
          label="Description"
          placeholder="e.g., Grocery shopping"
          required
        />
        
        <FormCurrencyInput
          name="amount"
          label="Amount"
          currency="$"
          placeholder="0.00"
          required
        />
        
        <FormSelect
          name="category"
          label="Category"
          placeholder="Select category"
          options={[
            { value: 'groceries', label: 'Groceries' },
            { value: 'transport', label: 'Transport' },
            { value: 'entertainment', label: 'Entertainment' },
            { value: 'utilities', label: 'Utilities' },
          ]}
          required
        />
        
        <FormDatePicker
          name="date"
          label="Date"
          required
        />
        
        <FormTextarea
          name="notes"
          label="Notes"
          placeholder="Add any additional notes..."
          rows={3}
        />
        
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? 'Saving...' : 'Add Transaction'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => methods.reset()}
          >
            Reset
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
```

### Budget Form
```jsx
const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  category: z.string().min(1, 'Category is required'),
  rollover: z.boolean(),
});

export function BudgetForm() {
  const methods = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      amount: 0,
      period: 'monthly',
      category: '',
      rollover: false,
    },
  });

  const onSubmit = (data) => {
    console.log('Budget data:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="name"
          label="Budget Name"
          placeholder="e.g., Monthly Groceries"
          required
        />
        
        <FormCurrencyInput
          name="amount"
          label="Budget Amount"
          currency="$"
          placeholder="500.00"
          required
        />
        
        <FormSelect
          name="period"
          label="Period"
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          required
        />
        
        <FormSelect
          name="category"
          label="Category"
          placeholder="Select category"
          options={[
            { value: 'groceries', label: 'Groceries' },
            { value: 'transport', label: 'Transport' },
            { value: 'entertainment', label: 'Entertainment' },
          ]}
          required
        />
        
        <FormCheckbox
          name="rollover"
          label="Roll over unused budget to next period"
          description="Unused funds will carry over"
        />
        
        <Button type="submit">Create Budget</Button>
      </form>
    </FormProvider>
  );
}
```

---

## 🎯 Advanced Patterns

### Conditional Fields
```jsx
const type = methods.watch('type');

{type === 'expense' && (
  <FormSelect
    name="category"
    label="Expense Category"
    options={expenseCategories}
    required
  />
)}

{type === 'income' && (
  <FormSelect
    name="source"
    label="Income Source"
    options={incomeSources}
    required
  />
)}
```

### Dynamic Validation
```jsx
<FormNumberInput
  name="amount"
  label="Amount"
  required
  validation={{
    validate: (value) => {
      const balance = methods.watch('balance');
      if (value > balance) {
        return 'Amount cannot exceed balance';
      }
      return true;
    }
  }}
/>
```

### Field Dependencies
```jsx
const startDate = methods.watch('startDate');

<FormDatePicker
  name="endDate"
  label="End Date"
  min={startDate}
  required
  description="Must be after start date"
/>
```

---

## ✅ Accessibility Features

All components include:
- ✅ Proper ARIA attributes (`aria-invalid`, `aria-describedby`)
- ✅ Associated labels with `htmlFor`
- ✅ Keyboard navigation support
- ✅ Screen reader friendly error messages
- ✅ Focus management
- ✅ Disabled state handling

---

## 🎨 Styling

All components support className prop for custom styling:

```jsx
<FormInput
  name="email"
  label="Email"
  className="font-mono"  // Custom class
/>
```

Error states are automatically styled with:
- Red border (`border-destructive`)
- Red focus ring (`focus-visible:ring-destructive`)
- Animated error message appearance

---

## ✅ C2 Success Criteria - ALL MET

- ✅ 8 form components created
- ✅ react-hook-form integration complete
- ✅ shadcn/ui components used
- ✅ Full validation support
- ✅ Error handling implemented
- ✅ Accessibility compliant (WCAG AA)
- ✅ TypeScript-ready (JSDoc types)
- ✅ 550+ lines of production code
- ✅ Comprehensive documentation

---

**Status**: C2 Complete ✅  
**Next**: C3 - Create Zod validation schemas  
**Phase C Progress**: 2/4 tasks (50%)  
**Overall Round 3 Progress**: 14/22 tasks (63.6%)
