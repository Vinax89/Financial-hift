/**
 * @fileoverview Tests for Form Components
 * @description Unit tests for FormInput, FormTextarea, FormSelect, etc.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { renderWithForm } from '../setup';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormDatePicker,
  FormNumberInput,
  FormCurrencyInput,
} from '@/forms/FormComponents';

// Test schemas
const testSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  terms: z.boolean().refine((val) => val === true, { message: 'You must accept terms' }),
  type: z.enum(['option1', 'option2']),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().positive('Price must be positive'),
});

describe('FormInput', () => {
  it('renders input field with label', () => {
    renderWithForm(<FormInput name="username" label="Username" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    renderWithForm(<FormInput name="username" label="Username" required />, {
      schema: testSchema,
    });

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message on validation failure', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormInput name="username" label="Username" required />, {
      schema: testSchema,
      defaultValues: { username: '' },
    });

    const input = screen.getByLabelText('Username');
    
    // Type less than minimum length
    await user.type(input, 'ab');
    await user.tab(); // Blur to trigger validation

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('accepts valid input', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormInput name="username" label="Username" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Username');
    await user.type(input, 'validuser');

    expect(input).toHaveValue('validuser');
  });

  it('supports different input types', () => {
    const { rerender } = renderWithForm(<FormInput name="email" type="email" label="Email" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

    rerender(<FormInput name="password" type="password" label="Password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('displays description text when provided', () => {
    renderWithForm(
      <FormInput name="username" label="Username" description="Choose a unique username" />,
      { schema: testSchema }
    );

    expect(screen.getByText('Choose a unique username')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    renderWithForm(<FormInput name="username" label="Username" disabled />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Username')).toBeDisabled();
  });
});

describe('FormTextarea', () => {
  it('renders textarea with label', () => {
    renderWithForm(<FormTextarea name="bio" label="Bio" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA');
  });

  it('accepts multi-line text input', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormTextarea name="bio" label="Bio" />, {
      schema: testSchema,
    });

    const textarea = screen.getByLabelText('Bio');
    await user.type(textarea, 'Line 1{Enter}Line 2');

    expect(textarea).toHaveValue('Line 1\nLine 2');
  });

  it('validates max length', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormTextarea name="bio" label="Bio" />, {
      schema: testSchema,
    });

    const textarea = screen.getByLabelText('Bio');
    const longText = 'a'.repeat(501);
    
    await user.type(textarea, longText);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Bio cannot exceed 500 characters')).toBeInTheDocument();
    });
  });
});

describe('FormSelect', () => {
  const options = [
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  it('renders select with options', () => {
    renderWithForm(
      <FormSelect name="category" label="Category" options={options} />,
      { schema: testSchema }
    );

    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    renderWithForm(
      <FormSelect name="category" label="Category" options={options} placeholder="Choose category" />,
      { schema: testSchema }
    );

    expect(screen.getByText('Choose category')).toBeInTheDocument();
  });

  it('can select an option', async () => {
    const user = userEvent.setup();
    
    renderWithForm(
      <FormSelect name="category" label="Category" options={options} required />,
      { schema: testSchema }
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    const foodOption = screen.getByText('Food');
    await user.click(foodOption);

    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('displays error when required but not selected', async () => {
    const user = userEvent.setup();
    
    renderWithForm(
      <FormSelect name="category" label="Category" options={options} required />,
      { schema: testSchema, defaultValues: { category: '' } }
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.keyboard('{Escape}'); // Close without selecting
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });
  });
});

describe('FormCheckbox', () => {
  it('renders checkbox with label', () => {
    renderWithForm(<FormCheckbox name="terms" label="Accept terms" />, {
      schema: testSchema,
    });

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('can be checked and unchecked', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormCheckbox name="terms" label="Accept terms" />, {
      schema: testSchema,
    });

    const checkbox = screen.getByRole('checkbox');
    
    expect(checkbox).not.toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('validates required checkbox', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormCheckbox name="terms" label="Accept terms" required />, {
      schema: testSchema,
      defaultValues: { terms: false },
    });

    const checkbox = screen.getByRole('checkbox');
    await user.tab(); // Focus
    await user.tab(); // Blur to trigger validation

    await waitFor(() => {
      expect(screen.getByText('You must accept terms')).toBeInTheDocument();
    });
  });
});

describe('FormRadioGroup', () => {
  const options = [
    { value: 'option1', label: 'Option 1', description: 'First option' },
    { value: 'option2', label: 'Option 2', description: 'Second option' },
  ];

  it('renders radio group with options', () => {
    renderWithForm(
      <FormRadioGroup name="type" label="Select Type" options={options} />,
      { schema: testSchema }
    );

    expect(screen.getByText('Select Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
  });

  it('can select an option', async () => {
    const user = userEvent.setup();
    
    renderWithForm(
      <FormRadioGroup name="type" label="Select Type" options={options} />,
      { schema: testSchema }
    );

    const option1 = screen.getByLabelText('Option 1');
    await user.click(option1);

    expect(option1).toBeChecked();
  });

  it('shows option descriptions when provided', () => {
    renderWithForm(
      <FormRadioGroup name="type" label="Select Type" options={options} />,
      { schema: testSchema }
    );

    expect(screen.getByText('First option')).toBeInTheDocument();
    expect(screen.getByText('Second option')).toBeInTheDocument();
  });

  it('supports horizontal layout', () => {
    const { container } = renderWithForm(
      <FormRadioGroup name="type" label="Select Type" options={options} layout="horizontal" />,
      { schema: testSchema }
    );

    const radioGroup = container.querySelector('[role="radiogroup"]');
    expect(radioGroup).toHaveClass('flex-row');
  });
});

describe('FormDatePicker', () => {
  it('renders date input with label', () => {
    renderWithForm(<FormDatePicker name="date" label="Date" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toHaveAttribute('type', 'date');
  });

  it('accepts date input', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormDatePicker name="date" label="Date" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Date');
    await user.type(input, '2024-01-15');

    expect(input).toHaveValue('2024-01-15');
  });

  it('respects min and max constraints', () => {
    renderWithForm(
      <FormDatePicker name="date" label="Date" min="2024-01-01" max="2024-12-31" />,
      { schema: testSchema }
    );

    const input = screen.getByLabelText('Date');
    expect(input).toHaveAttribute('min', '2024-01-01');
    expect(input).toHaveAttribute('max', '2024-12-31');
  });
});

describe('FormNumberInput', () => {
  it('renders number input with label', () => {
    renderWithForm(<FormNumberInput name="amount" label="Amount" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toHaveAttribute('type', 'number');
  });

  it('accepts numeric input', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormNumberInput name="amount" label="Amount" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Amount');
    await user.type(input, '100');

    expect(input).toHaveValue(100);
  });

  it('validates positive numbers', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormNumberInput name="amount" label="Amount" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Amount');
    await user.type(input, '-50');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    });
  });

  it('respects min, max, and step attributes', () => {
    renderWithForm(
      <FormNumberInput name="amount" label="Amount" min={0} max={1000} step={10} />,
      { schema: testSchema }
    );

    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '1000');
    expect(input).toHaveAttribute('step', '10');
  });
});

describe('FormCurrencyInput', () => {
  it('renders currency input with dollar sign', () => {
    renderWithForm(<FormCurrencyInput name="price" label="Price" />, {
      schema: testSchema,
    });

    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('accepts numeric input and formats as currency', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormCurrencyInput name="price" label="Price" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Price');
    await user.type(input, '99.99');

    expect(input).toHaveValue('99.99');
  });

  it('supports custom currency symbols', () => {
    renderWithForm(<FormCurrencyInput name="price" label="Price" currency="€" />, {
      schema: testSchema,
    });

    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('validates positive amounts', async () => {
    const user = userEvent.setup();
    
    renderWithForm(<FormCurrencyInput name="price" label="Price" required />, {
      schema: testSchema,
    });

    const input = screen.getByLabelText('Price');
    await user.type(input, '-100');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Price must be positive')).toBeInTheDocument();
    });
  });
});
