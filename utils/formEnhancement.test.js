import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutosave, useDebouncedAutosave, useFormPersistence } from '@/utils/formEnhancement.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call save function after delay', async () => {
    const saveFn = vi.fn().mockResolvedValue(true);
    const data = { name: 'Test', amount: 100 };

    const { result } = renderHook(() => 
      useAutosave(data, saveFn, { delay: 3000, enabled: true })
    );

    expect(result.current.isSaving).toBe(false);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(saveFn).toHaveBeenCalledWith(data);
    });
  });

  it('should not save when disabled', () => {
    const saveFn = vi.fn();
    const data = { name: 'Test' };

    renderHook(() => 
      useAutosave(data, saveFn, { delay: 3000, enabled: false })
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(saveFn).not.toHaveBeenCalled();
  });

  it('should show saving status', async () => {
    const saveFn = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 500))
    );
    const data = { name: 'Test' };

    const { result } = renderHook(() => 
      useAutosave(data, saveFn, { delay: 1000, enabled: true })
    );

    expect(result.current.isSaving).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSaved).toBeDefined();
    });
  });

  it('should reset timer on data change', () => {
    const saveFn = vi.fn();
    let data = { name: 'Test' };

    const { rerender } = renderHook(
      ({ data }) => useAutosave(data, saveFn, { delay: 3000, enabled: true }),
      { initialProps: { data } }
    );

    // First change
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Data changes, timer should reset
    data = { name: 'Updated' };
    rerender({ data });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not have saved yet (timer reset)
    expect(saveFn).not.toHaveBeenCalled();

    // Complete the new delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).toHaveBeenCalledWith(data);
  });

  it('should handle save errors gracefully', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('Save failed'));
    const data = { name: 'Test' };

    const { result } = renderHook(() => 
      useAutosave(data, saveFn, { delay: 1000, enabled: true })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error.message).toBe('Save failed');
    });
  });
});

describe('useDebouncedAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce rapid changes', () => {
    const saveFn = vi.fn();
    let data = { name: 'Test' };

    const { rerender } = renderHook(
      ({ data }) => useDebouncedAutosave(data, saveFn, 3000),
      { initialProps: { data } }
    );

    // Rapid changes
    for (let i = 0; i < 10; i++) {
      data = { name: `Test${i}` };
      rerender({ data });
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }

    // Should not have saved during rapid changes
    expect(saveFn).not.toHaveBeenCalled();

    // Wait for debounce delay
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should save only once with latest data
    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ name: 'Test9' });
  });
});

describe('useFormPersistence', () => {
  const STORAGE_KEY = 'test-form';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist form data to localStorage', () => {
    const formData = { name: 'John', email: 'john@example.com' };

    const { result } = renderHook(() => 
      useFormPersistence(STORAGE_KEY, formData)
    );

    act(() => {
      result.current.persist();
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual(formData);
  });

  it('should restore form data from localStorage', () => {
    const formData = { name: 'Jane', email: 'jane@example.com' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    const { result } = renderHook(() => 
      useFormPersistence(STORAGE_KEY, {})
    );

    expect(result.current.data).toEqual(formData);
  });

  it('should clear persisted data', () => {
    const formData = { name: 'Test' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    const { result } = renderHook(() => 
      useFormPersistence(STORAGE_KEY, formData)
    );

    act(() => {
      result.current.clear();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json');

    const defaultData = { name: 'Default' };
    const { result } = renderHook(() => 
      useFormPersistence(STORAGE_KEY, defaultData)
    );

    // Should fall back to default data
    expect(result.current.data).toEqual(defaultData);
  });
});

describe('Form validation helpers', () => {
  it('should validate required fields', () => {
    const data = {
      name: '',
      email: 'test@example.com'
    };

    const requiredFields = ['name', 'email'];
    const errors = {};

    requiredFields.forEach(field => {
      if (!data[field]?.trim()) {
        errors[field] = `${field} is required`;
      }
    });

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeUndefined();
  });

  it('should track form dirty state', () => {
    const initialData = { name: 'John', email: 'john@example.com' };
    const currentData = { name: 'Jane', email: 'john@example.com' };

    const isDirty = JSON.stringify(initialData) !== JSON.stringify(currentData);

    expect(isDirty).toBe(true);
  });
});
