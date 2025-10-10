/**
 * @fileoverview Integration tests for hooks
 * @description Tests custom hooks with realistic scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';
import { useFormWithAutoSave } from '@/hooks/useFormWithAutoSave';
import { useOptimizedCalculations } from '@/hooks/useOptimizedCalculations';
import { z } from 'zod';

describe('useDebounce Hook Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now should be updated
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Rapid changes
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'fourth', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still be first (no timeout completed)
    expect(result.current).toBe('first');

    // Complete the final timeout
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should jump to final value
    expect(result.current).toBe('fourth');
  });

  it('updates immediately when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 });
    expect(result.current).toBe('updated'); // Immediate
  });

  it('handles different delay times', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } }
    );

    // Update with different delay
    rerender({ value: 'second', delay: 1000 });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('first'); // Old delay doesn't apply

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toBe('second'); // New delay completed
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } }
    );

    const timeoutCount = vi.getTimerCount();
    unmount();

    // Timer should be cleared
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useFormWithAutoSave Hook Integration', () => {
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().positive(),
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('auto-saves after debounce delay', async () => {
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave,
        autoSaveDelay: 500,
        defaultValues: { name: '', email: '', age: 0 },
      })
    );

    // Update form value
    act(() => {
      result.current.methods.setValue('name', 'John Doe');
    });

    // Should not save immediately
    expect(onSave).not.toHaveBeenCalled();

    // Advance timers
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Should save after delay
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'John Doe' })
      );
    });
  });

  it('saves draft to localStorage', async () => {
    const storageKey = 'test-draft';

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave: vi.fn(),
        storageKey,
        autoSaveDelay: 300,
        defaultValues: { name: '', email: '', age: 0 },
      })
    );

    // Update values
    act(() => {
      result.current.methods.setValue('name', 'Jane Smith');
      result.current.methods.setValue('email', 'jane@example.com');
      result.current.methods.setValue('age', 30);
    });

    // Advance timers
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Check localStorage
    await waitFor(() => {
      const draft = localStorage.getItem(storageKey);
      expect(draft).toBeTruthy();

      const parsed = JSON.parse(draft);
      expect(parsed.name).toBe('Jane Smith');
      expect(parsed.email).toBe('jane@example.com');
      expect(parsed.age).toBe(30);
    });
  });

  it('restores draft from localStorage on mount', () => {
    const storageKey = 'test-draft';
    const draftData = {
      name: 'Restored Name',
      email: 'restored@example.com',
      age: 25,
    };

    localStorage.setItem(storageKey, JSON.stringify(draftData));

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave: vi.fn(),
        storageKey,
        defaultValues: { name: '', email: '', age: 0 },
      })
    );

    // Values should be restored
    const values = result.current.methods.getValues();
    expect(values.name).toBe('Restored Name');
    expect(values.email).toBe('restored@example.com');
    expect(values.age).toBe(25);
  });

  it('clears draft after successful save', async () => {
    const storageKey = 'test-draft';
    const onSave = vi.fn(() => Promise.resolve());

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave,
        storageKey,
        defaultValues: { name: 'Test', email: 'test@example.com', age: 20 },
      })
    );

    // Manually submit
    await act(async () => {
      await result.current.handleSubmit(onSave)();
    });

    // Draft should be cleared
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('sets isSaving state during save', async () => {
    const onSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave,
        defaultValues: { name: 'Test', email: 'test@example.com', age: 20 },
      })
    );

    expect(result.current.isSaving).toBe(false);

    // Trigger save
    await act(async () => {
      result.current.handleSubmit(onSave)();
    });

    // Should be saving
    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    // Wait for save to complete
    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });

  it('prevents save when validation fails', async () => {
    const onSave = vi.fn();

    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave,
        defaultValues: { name: '', email: 'invalid', age: -5 },
      })
    );

    // Try to submit invalid data
    await act(async () => {
      await result.current.handleSubmit(onSave)();
    });

    // Should not save
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows unsaved changes warning', async () => {
    const { result } = renderHook(() =>
      useFormWithAutoSave({
        schema,
        onSave: vi.fn(),
        defaultValues: { name: '', email: '', age: 0 },
      })
    );

    expect(result.current.hasUnsavedChanges).toBe(false);

    // Make changes
    act(() => {
      result.current.methods.setValue('name', 'Changed');
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });
});

describe('useOptimizedCalculations Hook Integration', () => {
  const mockTransactions = [
    { id: '1', amount: 100, type: 'income', category: 'salary', date: '2024-01-01' },
    { id: '2', amount: 50, type: 'expense', category: 'food', date: '2024-01-05' },
    { id: '3', amount: 30, type: 'expense', category: 'food', date: '2024-01-10' },
    { id: '4', amount: 200, type: 'income', category: 'salary', date: '2024-01-15' },
    { id: '5', amount: 75, type: 'expense', category: 'transport', date: '2024-01-20' },
  ];

  const mockBudgets = [
    { id: '1', category: 'food', amount: 200, period: 'monthly' },
    { id: '2', category: 'transport', amount: 150, period: 'monthly' },
  ];

  it('calculates totals correctly', () => {
    const { result } = renderHook(() =>
      useOptimizedCalculations({ transactions: mockTransactions, budgets: mockBudgets })
    );

    expect(result.current.totalIncome).toBe(300); // 100 + 200
    expect(result.current.totalExpenses).toBe(155); // 50 + 30 + 75
    expect(result.current.netIncome).toBe(145); // 300 - 155
  });

  it('calculates category spending', () => {
    const { result } = renderHook(() =>
      useOptimizedCalculations({ transactions: mockTransactions, budgets: mockBudgets })
    );

    expect(result.current.categorySpending.food).toBe(80); // 50 + 30
    expect(result.current.categorySpending.transport).toBe(75);
  });

  it('calculates budget progress', () => {
    const { result } = renderHook(() =>
      useOptimizedCalculations({ transactions: mockTransactions, budgets: mockBudgets })
    );

    expect(result.current.budgetProgress.food).toBe(40); // 80 / 200 * 100
    expect(result.current.budgetProgress.transport).toBe(50); // 75 / 150 * 100
  });

  it('memoizes calculations', () => {
    const { result, rerender } = renderHook(
      ({ transactions, budgets }) =>
        useOptimizedCalculations({ transactions, budgets }),
      { initialProps: { transactions: mockTransactions, budgets: mockBudgets } }
    );

    const firstResult = result.current;

    // Rerender with same data
    rerender({ transactions: mockTransactions, budgets: mockBudgets });

    // Should return same object (memoized)
    expect(result.current).toBe(firstResult);
  });

  it('recalculates when data changes', () => {
    const { result, rerender } = renderHook(
      ({ transactions, budgets }) =>
        useOptimizedCalculations({ transactions, budgets }),
      { initialProps: { transactions: mockTransactions, budgets: mockBudgets } }
    );

    const firstResult = result.current;
    expect(firstResult.totalIncome).toBe(300);

    // Add new transaction
    const updatedTransactions = [
      ...mockTransactions,
      { id: '6', amount: 500, type: 'income', category: 'bonus', date: '2024-01-25' },
    ];

    rerender({ transactions: updatedTransactions, budgets: mockBudgets });

    // Should recalculate
    expect(result.current).not.toBe(firstResult);
    expect(result.current.totalIncome).toBe(800); // 300 + 500
  });

  it('handles empty data', () => {
    const { result } = renderHook(() =>
      useOptimizedCalculations({ transactions: [], budgets: [] })
    );

    expect(result.current.totalIncome).toBe(0);
    expect(result.current.totalExpenses).toBe(0);
    expect(result.current.netIncome).toBe(0);
    expect(result.current.categorySpending).toEqual({});
    expect(result.current.budgetProgress).toEqual({});
  });

  it('identifies overspending categories', () => {
    const overspentTransactions = [
      { id: '1', amount: 250, type: 'expense', category: 'food', date: '2024-01-01' },
    ];

    const { result } = renderHook(() =>
      useOptimizedCalculations({ transactions: overspentTransactions, budgets: mockBudgets })
    );

    expect(result.current.budgetProgress.food).toBe(125); // 250 / 200 * 100
    expect(result.current.budgetProgress.food).toBeGreaterThan(100);
  });
});

describe('Hook Integration with Real Scenarios', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('combines useDebounce with useFormWithAutoSave', async () => {
    const schema = z.object({
      search: z.string(),
    });

    const onSave = vi.fn();

    const { result } = renderHook(() => {
      const form = useFormWithAutoSave({
        schema,
        onSave,
        autoSaveDelay: 500,
        defaultValues: { search: '' },
      });

      const searchValue = form.methods.watch('search');
      const debouncedSearch = useDebounce(searchValue, 300);

      return { form, debouncedSearch };
    });

    // Update search
    act(() => {
      result.current.form.methods.setValue('search', 'test query');
    });

    // Debounced value should not update immediately
    expect(result.current.debouncedSearch).toBe('');

    // Advance debounce timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Debounced value updated
    expect(result.current.debouncedSearch).toBe('test query');

    // Advance auto-save timer
    await act(async () => {
      vi.advanceTimersByTime(200); // 500 total
    });

    // Auto-save triggered
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test query' })
      );
    });
  });
});
