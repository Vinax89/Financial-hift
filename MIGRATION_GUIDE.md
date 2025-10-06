# Migration Guide - Converting Components to New Patterns

This guide helps you migrate existing components to use the new patterns introduced in the codebase improvements.

---

## Table of Contents
1. [Converting to React Query](#1-converting-to-react-query)
2. [Adding Validation](#2-adding-validation)
3. [Implementing Error Handling](#3-implementing-error-handling)
4. [Adding Tests](#4-adding-tests)
5. [Example: Complete Component Migration](#5-complete-example)

---

## 1. Converting to React Query

### Pattern: List/Read Operations

**Before:**
```javascript
import { useState, useEffect } from 'react';
import { Transaction } from '@/api/entities';

function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            try {
                const data = await Transaction.list('-date');
                setTransactions(data);
                setError(null);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadTransactions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>{/* render transactions */}</div>;
}
```

**After:**
```javascript
import { useTransactions } from '@/hooks/useReactQuery';

function TransactionsPage() {
    const { data: transactions, isLoading, error } = useTransactions('-date');

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading transactions</div>;

    return <div>{/* render transactions */}</div>;
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Less boilerplate code
- ✅ Automatic error handling

---

### Pattern: Create/Update/Delete Operations

**Before:**
```javascript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
        await Transaction.create(data);
        toast({ title: 'Success' });
        await loadTransactions(); // Manual refetch
    } catch (error) {
        toast({ title: 'Error', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
};

const handleDelete = async (id) => {
    try {
        await Transaction.delete(id);
        await loadTransactions(); // Manual refetch
    } catch (error) {
        toast({ title: 'Error', description: error.message });
    }
};
```

**After:**
```javascript
import { useCreateTransaction, useDeleteTransaction } from '@/hooks/useReactQuery';

function TransactionsPage() {
    const createMutation = useCreateTransaction();
    const deleteMutation = useDeleteTransaction();

    const handleCreate = (data) => {
        createMutation.mutate(data); // Auto-refetches and shows toast
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id); // Auto-refetches and shows toast
    };

    return (
        <div>
            <button 
                onClick={() => handleCreate(newData)}
                disabled={createMutation.isLoading}
            >
                {createMutation.isLoading ? 'Creating...' : 'Create'}
            </button>
        </div>
    );
}
```

**Benefits:**
- ✅ Automatic cache invalidation
- ✅ Built-in loading states
- ✅ Automatic error handling with toasts
- ✅ Optimistic updates possible

---

## 2. Adding Validation

### Pattern: Form Validation with Zod

**Before:**
```javascript
const handleSubmit = (data) => {
    // Manual validation
    if (!data.title || data.title.trim() === '') {
        setError('title', { message: 'Title is required' });
        return;
    }
    if (!data.amount || data.amount <= 0) {
        setError('amount', { message: 'Amount must be positive' });
        return;
    }
    
    // Submit
    createTransaction(data);
};
```

**After:**
```javascript
import { TransactionSchema, validateData } from '@/utils/validation';

const handleSubmit = (data) => {
    // Validate with Zod
    const validation = validateData(TransactionSchema, data);
    
    if (!validation.success) {
        // Set multiple errors at once
        Object.entries(validation.errors).forEach(([field, message]) => {
            setError(field, { message });
        });
        return;
    }
    
    // Submit validated data
    createTransaction(validation.data);
};
```

**Benefits:**
- ✅ Type-safe validation
- ✅ Consistent validation rules
- ✅ Better error messages
- ✅ Reusable schemas

---

### Pattern: Input Sanitization

**Before:**
```javascript
const handleInputChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
};
```

**After:**
```javascript
import { sanitizeText, sanitizeCurrency } from '@/utils/validation';

const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let sanitized = value;
    if (name === 'amount') {
        sanitized = sanitizeCurrency(value);
    } else if (name === 'description') {
        sanitized = sanitizeText(value);
    }
    
    setFormData({ ...formData, [name]: sanitized });
};
```

**Benefits:**
- ✅ XSS prevention
- ✅ Data consistency
- ✅ Better user experience

---

## 3. Implementing Error Handling

### Pattern: API Error Handling

**Before:**
```javascript
try {
    await DebtAccount.create(data);
    toast({ title: 'Success' });
} catch (error) {
    console.error(error);
    toast({ 
        title: 'Error', 
        description: error.message || 'Something went wrong' 
    });
}
```

**After:**
```javascript
import { handleApiError } from '@/utils/errorHandler';

try {
    await DebtAccount.create(data);
    toast({ title: 'Debt account created successfully' });
} catch (error) {
    handleApiError(error, toast, 'Failed to create debt account');
}
```

**Benefits:**
- ✅ Consistent error messages
- ✅ Automatic error logging
- ✅ Network error detection
- ✅ Retry logic built-in

---

### Pattern: Async Operation Wrapper

**Before:**
```javascript
const loadData = async () => {
    try {
        const data = await fetchSomeData();
        setData(data);
    } catch (error) {
        console.error(error);
        setError(error);
    }
};
```

**After:**
```javascript
import { withErrorHandling } from '@/utils/errorHandler';

const loadData = async () => {
    const { data, error } = await withErrorHandling(
        () => fetchSomeData(),
        {
            toast,
            errorMessage: 'Failed to load data',
            onError: (err) => setError(err)
        }
    );
    
    if (data) {
        setData(data);
    }
};
```

**Benefits:**
- ✅ Cleaner code
- ✅ Consistent error handling
- ✅ Optional error callbacks

---

## 4. Adding Tests

### Pattern: Component Testing

**Create:** `__tests__/components/MyComponent.test.jsx`

```javascript
import { renderWithProviders, mockEntities } from '@/utils/testUtils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
    it('renders correctly', () => {
        renderWithProviders(<MyComponent />);
        expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('handles user interaction', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MyComponent />);
        
        const button = screen.getByRole('button', { name: /click me/i });
        await user.click(button);
        
        await waitFor(() => {
            expect(screen.getByText('Clicked!')).toBeInTheDocument();
        });
    });

    it('displays data correctly', () => {
        const transactions = [mockEntities.transaction];
        renderWithProviders(<MyComponent transactions={transactions} />);
        
        expect(screen.getByText('Test Transaction')).toBeInTheDocument();
    });
});
```

---

### Pattern: Hook Testing

**Create:** `__tests__/hooks/useMyHook.test.jsx`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/utils/testUtils';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
    it('returns expected data', async () => {
        const { result } = renderHook(() => useMyHook(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        
        expect(result.current.data).toBeDefined();
    });
});
```

---

## 5. Complete Example: Migrating DebtPlanner Page

### Before (Old Pattern)

```javascript
import React, { useState, useEffect } from 'react';
import { DebtAccount } from '@/api/entities';
import DebtList from '@/debt/DebtList.jsx';
import DebtForm from '@/debt/DebtForm.jsx';

export default function DebtPlannerPage() {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);

    useEffect(() => {
        loadDebts();
    }, []);

    const loadDebts = async () => {
        setLoading(true);
        try {
            const data = await DebtAccount.list();
            setDebts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (editingDebt) {
                await DebtAccount.update(editingDebt.id, data);
            } else {
                await DebtAccount.create(data);
            }
            await loadDebts();
            setShowForm(false);
            setEditingDebt(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this debt?')) return;
        try {
            await DebtAccount.delete(id);
            await loadDebts();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <button onClick={() => setShowForm(true)}>Add Debt</button>
            
            {showForm && (
                <DebtForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                    initialData={editingDebt}
                />
            )}
            
            <DebtList
                debts={debts}
                onEdit={(debt) => {
                    setEditingDebt(debt);
                    setShowForm(true);
                }}
                onDelete={handleDelete}
            />
        </div>
    );
}
```

---

### After (New Pattern)

```javascript
import React, { useState } from 'react';
import { useDebts, useCreateDebt, useUpdateDebt, useDeleteDebt } from '@/hooks/useReactQuery';
import { DebtAccountSchema, validateData } from '@/utils/validation';
import { handleApiError } from '@/utils/errorHandler';
import { useToast } from '@/ui/use-toast';
import DebtList from '@/debt/DebtList.jsx';
import DebtForm from '@/debt/DebtForm.jsx';
import { Loading } from '@/ui/loading';

export default function DebtPlannerPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const { toast } = useToast();

    // React Query hooks - automatic caching and refetching
    const { data: debts, isLoading, error } = useDebts();
    const createMutation = useCreateDebt();
    const updateMutation = useUpdateDebt();
    const deleteMutation = useDeleteDebt();

    const handleFormSubmit = async (data) => {
        // Validate with Zod
        const validation = validateData(DebtAccountSchema, data);
        
        if (!validation.success) {
            // Show validation errors
            Object.values(validation.errors).forEach(error => {
                toast({
                    title: 'Validation Error',
                    description: error,
                    variant: 'destructive'
                });
            });
            return;
        }

        try {
            if (editingDebt) {
                await updateMutation.mutateAsync({
                    id: editingDebt.id,
                    data: validation.data
                });
            } else {
                await createMutation.mutateAsync(validation.data);
            }
            
            setShowForm(false);
            setEditingDebt(null);
        } catch (error) {
            // Centralized error handling
            handleApiError(
                error,
                toast,
                editingDebt ? 'Failed to update debt' : 'Failed to create debt'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this debt?')) return;
        
        try {
            await deleteMutation.mutateAsync(id);
        } catch (error) {
            handleApiError(error, toast, 'Failed to delete debt');
        }
    };

    const handleEdit = (debt) => {
        setEditingDebt(debt);
        setShowForm(true);
    };

    // Loading state
    if (isLoading) return <Loading text="Loading debts..." />;

    // Error state
    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive">Failed to load debts</p>
                <button onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <button 
                onClick={() => setShowForm(true)}
                disabled={createMutation.isLoading}
            >
                {createMutation.isLoading ? 'Creating...' : 'Add Debt'}
            </button>
            
            {showForm && (
                <DebtForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingDebt(null);
                    }}
                    initialData={editingDebt}
                    isSubmitting={createMutation.isLoading || updateMutation.isLoading}
                />
            )}
            
            <DebtList
                debts={debts || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isLoading}
            />
        </div>
    );
}
```

---

### Key Improvements in the Migration:

1. **React Query Integration**
   - Automatic caching and background refetching
   - No manual loading state management
   - Automatic cache invalidation on mutations

2. **Validation**
   - Zod schema validation before API calls
   - Better error messages for users
   - Type-safe data

3. **Error Handling**
   - Centralized error handling with `handleApiError`
   - Consistent toast notifications
   - Network error detection

4. **User Experience**
   - Loading indicators on buttons
   - Disabled states during operations
   - Better error messages

5. **Code Quality**
   - Less boilerplate
   - Better separation of concerns
   - Easier to test

---

## Migration Checklist

For each component you migrate:

- [ ] Replace `useState` + `useEffect` with React Query hooks
- [ ] Add Zod validation to form submissions
- [ ] Use `handleApiError` for all API calls
- [ ] Add proper loading states
- [ ] Add error boundaries
- [ ] Write tests
- [ ] Update prop types or add TypeScript types
- [ ] Add ARIA labels for accessibility

---

## Common Pitfalls to Avoid

### ❌ Don't: Mix old and new patterns
```javascript
// Bad - mixing direct API calls with React Query
const { data } = useDebts();
const handleCreate = async () => {
    await DebtAccount.create(data); // Should use mutation
};
```

### ✅ Do: Use consistent patterns
```javascript
// Good - use React Query mutations
const { data } = useDebts();
const createMutation = useCreateDebt();
const handleCreate = () => {
    createMutation.mutate(data);
};
```

---

### ❌ Don't: Skip validation
```javascript
// Bad - no validation
await Transaction.create(formData);
```

### ✅ Do: Always validate
```javascript
// Good - validate first
const validation = validateData(TransactionSchema, formData);
if (validation.success) {
    await Transaction.create(validation.data);
}
```

---

### ❌ Don't: Ignore errors silently
```javascript
// Bad
try {
    await someOperation();
} catch (error) {
    console.error(error); // User doesn't see this!
}
```

### ✅ Do: Show errors to users
```javascript
// Good
try {
    await someOperation();
} catch (error) {
    handleApiError(error, toast, 'Operation failed');
}
```

---

## Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for overview
- Review example tests in `__tests__/` directory
- Look at type definitions in `types/entities.ts`
- Read validation schemas in `utils/validation.js`

---

**Last Updated:** October 5, 2025
