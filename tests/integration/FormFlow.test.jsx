/**
 * @fileoverview Integration tests for form flows
 * @description Tests complete user workflows with forms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from 'react-hook-form';
import { useFormWithAutoSave } from '@/hooks/useFormWithAutoSave';
import { transactionSchema, budgetSchema, goalSchema } from '@/schemas/formSchemas';
import { FormInput, FormSelect, FormRadioGroup, FormTextarea } from '@/forms/FormComponents';
import { mockFetch, createMockTransaction, createMockBudget, createMockGoal } from '../setup';

describe('Transaction Form Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('creates new transaction with complete flow', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    // Mock TransactionForm component
    function TransactionForm() {
      const { methods, handleSubmit, isSaving } = useFormWithAutoSave({
        schema: transactionSchema,
        onSave: onSubmit,
        storageKey: 'draft-transaction',
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="description" label="Description" required />
            <FormInput name="amount" label="Amount" type="number" required />
            <FormRadioGroup
              name="type"
              label="Type"
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              required
            />
            <FormSelect
              name="category"
              label="Category"
              options={[
                { value: 'food', label: 'Food' },
                { value: 'transport', label: 'Transport' },
                { value: 'salary', label: 'Salary' },
              ]}
              required
            />
            <FormInput name="date" label="Date" type="date" required />
            <FormTextarea name="notes" label="Notes" />
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        </FormProvider>
      );
    }

    render(<TransactionForm />);

    // Fill form
    await user.type(screen.getByLabelText('Description'), 'Coffee at Starbucks');
    await user.type(screen.getByLabelText('Amount'), '5.50');
    await user.click(screen.getByLabelText('Expense'));
    await user.selectOptions(screen.getByLabelText('Category'), 'food');
    await user.type(screen.getByLabelText('Date'), '2024-01-15');
    await user.type(screen.getByLabelText('Notes'), 'Morning coffee');

    // Submit form
    await user.click(screen.getByRole('button', { name: /save transaction/i }));

    // Wait for submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Coffee at Starbucks',
          amount: '5.50',
          type: 'expense',
          category: 'food',
          date: '2024-01-15',
          notes: 'Morning coffee',
        })
      );
    });
  });

  it('validates transaction before submission', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function TransactionForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: transactionSchema,
        onSave: onSubmit,
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="description" label="Description" required />
            <FormInput name="amount" label="Amount" type="number" required />
            <FormRadioGroup
              name="type"
              label="Type"
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              required
            />
            <button type="submit">Save Transaction</button>
          </form>
        </FormProvider>
      );
    }

    render(<TransactionForm />);

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /save transaction/i }));

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/description.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount.*required/i)).toBeInTheDocument();
    });

    // onSubmit should not be called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('saves draft to localStorage during editing', async () => {
    const user = userEvent.setup();

    function TransactionForm() {
      const { methods } = useFormWithAutoSave({
        schema: transactionSchema,
        onSave: vi.fn(),
        storageKey: 'draft-transaction',
        autoSaveDelay: 300,
      });

      return (
        <FormProvider {...methods}>
          <FormInput name="description" label="Description" />
          <FormInput name="amount" label="Amount" type="number" />
        </FormProvider>
      );
    }

    render(<TransactionForm />);

    // Type in fields
    await user.type(screen.getByLabelText('Description'), 'Groceries');
    await user.type(screen.getByLabelText('Amount'), '45.99');

    // Wait for auto-save debounce
    await waitFor(() => {
      const draft = localStorage.getItem('draft-transaction');
      expect(draft).toBeTruthy();
      
      const parsed = JSON.parse(draft);
      expect(parsed.description).toBe('Groceries');
      expect(parsed.amount).toBe('45.99');
    }, { timeout: 500 });
  });

  it('restores draft from localStorage on mount', async () => {
    // Save draft to localStorage
    const draftData = {
      description: 'Saved Draft',
      amount: '100.00',
      type: 'expense',
    };
    localStorage.setItem('draft-transaction', JSON.stringify(draftData));

    function TransactionForm() {
      const { methods } = useFormWithAutoSave({
        schema: transactionSchema,
        onSave: vi.fn(),
        storageKey: 'draft-transaction',
      });

      return (
        <FormProvider {...methods}>
          <FormInput name="description" label="Description" />
          <FormInput name="amount" label="Amount" type="number" />
        </FormProvider>
      );
    }

    render(<TransactionForm />);

    // Draft should be restored
    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toHaveValue('Saved Draft');
      expect(screen.getByLabelText('Amount')).toHaveValue('100.00');
    });
  });

  it('clears draft after successful submission', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();

    // Pre-populate draft
    localStorage.setItem('draft-transaction', JSON.stringify({
      description: 'Draft',
      amount: '50',
    }));

    function TransactionForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: transactionSchema,
        onSave: onSubmit,
        storageKey: 'draft-transaction',
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="description" label="Description" required />
            <FormInput name="amount" label="Amount" type="number" required />
            <FormRadioGroup
              name="type"
              label="Type"
              options={[
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
              ]}
              required
            />
            <button type="submit">Save</button>
          </form>
        </FormProvider>
      );
    }

    render(<TransactionForm />);

    // Fill required fields
    await user.click(screen.getByLabelText('Expense'));

    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Draft should be cleared
    await waitFor(() => {
      expect(localStorage.getItem('draft-transaction')).toBeNull();
    });
  });
});

describe('Budget Form Flow Integration', () => {
  it('creates budget with validation', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function BudgetForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: budgetSchema,
        onSave: onSubmit,
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="name" label="Budget Name" required />
            <FormInput name="amount" label="Amount" type="number" required />
            <FormSelect
              name="period"
              label="Period"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              required
            />
            <FormSelect
              name="category"
              label="Category"
              options={[
                { value: 'food', label: 'Food' },
                { value: 'transport', label: 'Transport' },
                { value: 'entertainment', label: 'Entertainment' },
              ]}
              required
            />
            <FormInput name="startDate" label="Start Date" type="date" required />
            <FormInput name="endDate" label="End Date" type="date" required />
            <button type="submit">Create Budget</button>
          </form>
        </FormProvider>
      );
    }

    render(<BudgetForm />);

    // Fill form
    await user.type(screen.getByLabelText('Budget Name'), 'Monthly Food Budget');
    await user.type(screen.getByLabelText('Amount'), '500');
    await user.selectOptions(screen.getByLabelText('Period'), 'monthly');
    await user.selectOptions(screen.getByLabelText('Category'), 'food');
    await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
    await user.type(screen.getByLabelText('End Date'), '2024-01-31');

    // Submit
    await user.click(screen.getByRole('button', { name: /create budget/i }));

    // Verify submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Monthly Food Budget',
          amount: '500',
          period: 'monthly',
          category: 'food',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );
    });
  });

  it('validates endDate must be after startDate', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function BudgetForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: budgetSchema,
        onSave: onSubmit,
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="startDate" label="Start Date" type="date" required />
            <FormInput name="endDate" label="End Date" type="date" required />
            <FormInput name="name" label="Budget Name" required />
            <FormInput name="amount" label="Amount" type="number" required />
            <FormSelect
              name="period"
              label="Period"
              options={[{ value: 'monthly', label: 'Monthly' }]}
              required
            />
            <button type="submit">Create Budget</button>
          </form>
        </FormProvider>
      );
    }

    render(<BudgetForm />);

    // Set endDate before startDate
    await user.type(screen.getByLabelText('Start Date'), '2024-01-31');
    await user.type(screen.getByLabelText('End Date'), '2024-01-01');
    await user.type(screen.getByLabelText('Budget Name'), 'Test');
    await user.type(screen.getByLabelText('Amount'), '100');

    // Try to submit
    await user.click(screen.getByRole('button', { name: /create budget/i }));

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('Goal Form Flow Integration', () => {
  it('creates goal with validation', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function GoalForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: goalSchema,
        onSave: onSubmit,
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="name" label="Goal Name" required />
            <FormInput name="targetAmount" label="Target Amount" type="number" required />
            <FormInput name="currentAmount" label="Current Amount" type="number" required />
            <FormInput name="deadline" label="Deadline" type="date" required />
            <FormSelect
              name="category"
              label="Category"
              options={[
                { value: 'emergency', label: 'Emergency Fund' },
                { value: 'vacation', label: 'Vacation' },
                { value: 'purchase', label: 'Purchase' },
              ]}
              required
            />
            <FormSelect
              name="priority"
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              required
            />
            <button type="submit">Create Goal</button>
          </form>
        </FormProvider>
      );
    }

    render(<GoalForm />);

    // Fill form
    await user.type(screen.getByLabelText('Goal Name'), 'Emergency Fund');
    await user.type(screen.getByLabelText('Target Amount'), '10000');
    await user.type(screen.getByLabelText('Current Amount'), '2500');
    await user.type(screen.getByLabelText('Deadline'), '2024-12-31');
    await user.selectOptions(screen.getByLabelText('Category'), 'emergency');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');

    // Submit
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    // Verify
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Emergency Fund',
          targetAmount: '10000',
          currentAmount: '2500',
          deadline: '2024-12-31',
          category: 'emergency',
          priority: 'high',
        })
      );
    });
  });

  it('validates currentAmount <= targetAmount', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    function GoalForm() {
      const { methods, handleSubmit } = useFormWithAutoSave({
        schema: goalSchema,
        onSave: onSubmit,
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput name="targetAmount" label="Target Amount" type="number" required />
            <FormInput name="currentAmount" label="Current Amount" type="number" required />
            <FormInput name="name" label="Goal Name" required />
            <FormInput name="deadline" label="Deadline" type="date" required />
            <button type="submit">Create Goal</button>
          </form>
        </FormProvider>
      );
    }

    render(<GoalForm />);

    // Set currentAmount > targetAmount
    await user.type(screen.getByLabelText('Target Amount'), '5000');
    await user.type(screen.getByLabelText('Current Amount'), '10000');
    await user.type(screen.getByLabelText('Goal Name'), 'Test');
    await user.type(screen.getByLabelText('Deadline'), '2024-12-31');

    // Try to submit
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/current amount cannot exceed target amount/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
