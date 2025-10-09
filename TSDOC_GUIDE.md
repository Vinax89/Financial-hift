# TSDoc Style Guide for Financial-hift

## Overview

This project uses **TSDoc** (TypeScript documentation) syntax for documenting code. TSDoc comments are processed by **TypeDoc** to generate HTML documentation.

**Key Principle:** Let TypeScript provide the types, use TSDoc for descriptions and context.

---

## Quick Reference

### Basic Structure

```typescript
/**
 * Brief one-line summary
 * 
 * @remarks
 * Extended description with more details about behavior,
 * use cases, and important considerations.
 * 
 * @param paramName - Description of the parameter
 * @returns Description of what is returned
 * 
 * @example
 * ```typescript
 * // Usage example
 * const result = myFunction('value');
 * ```
 * 
 * @public
 */
export function myFunction(paramName: string): ReturnType {
  // implementation
}
```

---

## TSDoc vs JSDoc

### ❌ Old JSDoc Way (Don't Use)

```typescript
/**
 * @param {string} name - User's name
 * @param {number} age - User's age
 * @returns {boolean} Whether user is adult
 */
function isAdult(name: string, age: number): boolean {
  return age >= 18;
}
```

### ✅ New TSDoc Way (Use This)

```typescript
/**
 * Checks if a user is considered an adult
 * 
 * @remarks
 * Uses the standard age threshold of 18 years to determine
 * adult status. Age is expected to be in years.
 * 
 * @param name - User's full name for logging purposes
 * @param age - User's age in years
 * @returns True if user is 18 or older, false otherwise
 * 
 * @public
 */
function isAdult(name: string, age: number): boolean {
  return age >= 18;
}
```

**Key Differences:**
- ❌ Don't repeat type information (`{string}`, `{number}`) - TypeScript already has it!
- ✅ Focus on **what** the parameter represents, not its type
- ✅ Use `@remarks` for extended explanations
- ✅ Add `@example` blocks with actual code

---

## Essential TSDoc Tags

### Module/File Documentation

```typescript
/**
 * User authentication and authorization utilities
 * 
 * @remarks
 * This module provides functions for user login, token validation,
 * and permission checking across the application.
 * 
 * @packageDocumentation
 */
```

### Interfaces and Types

```typescript
/**
 * Represents a user account in the system
 * 
 * @remarks
 * User accounts contain authentication credentials and profile information.
 * All fields except `id` can be updated after creation.
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   role: 'member'
 * };
 * ```
 * 
 * @public
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Email address (must be unique) */
  email: string;
  
  /** Display name */
  name: string;
  
  /** User role for permissions */
  role: 'admin' | 'member' | 'guest';
}
```

### Functions

```typescript
/**
 * Calculates the safe-to-spend amount for the current month
 * 
 * @remarks
 * Takes into account upcoming bills, subscriptions, and savings goals
 * to determine how much can be safely spent without impacting obligations.
 * 
 * Algorithm:
 * 1. Sum all income for the month
 * 2. Subtract committed expenses (bills, subscriptions)
 * 3. Subtract savings goal allocations
 * 4. Return remaining amount
 * 
 * @param income - Total monthly income
 * @param bills - Array of upcoming bill payments
 * @param savingsGoals - Active savings goal contributions
 * @returns Amount safe to spend without impacting financial obligations
 * 
 * @throws {Error} If income is negative
 * 
 * @example
 * ```typescript
 * const safeAmount = calculateSafeToSpend(
 *   5000,
 *   [{ amount: 1500 }, { amount: 200 }],
 *   [{ amount: 500 }]
 * );
 * // Returns: 2800 (5000 - 1700 bills - 500 savings)
 * ```
 * 
 * @public
 */
export function calculateSafeToSpend(
  income: number,
  bills: Bill[],
  savingsGoals: Goal[]
): number {
  // implementation
}
```

### React Components

```typescript
/**
 * Transaction list component with filtering and sorting
 * 
 * @remarks
 * Displays a paginated list of financial transactions with support for:
 * - Filtering by date range, category, and amount
 * - Sorting by multiple columns
 * - Bulk selection and actions
 * - Export to CSV/PDF
 * 
 * @param props - Component properties
 * @returns Rendered transaction list
 * 
 * @example
 * ```tsx
 * <TransactionList
 *   transactions={userTransactions}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   pageSize={20}
 * />
 * ```
 * 
 * @public
 */
export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  pageSize = 10
}: TransactionListProps): React.ReactElement {
  // implementation
}
```

### Classes

```typescript
/**
 * Service for managing user financial goals
 * 
 * @remarks
 * Provides CRUD operations and progress tracking for financial goals.
 * Integrates with the transaction service to automatically update
 * goal progress based on savings transactions.
 * 
 * @example
 * ```typescript
 * const goalService = new GoalService(apiClient);
 * 
 * const goals = await goalService.getAll();
 * const newGoal = await goalService.create({
 *   name: 'Emergency Fund',
 *   targetAmount: 10000,
 *   deadline: '2026-12-31'
 * });
 * ```
 * 
 * @public
 */
export class GoalService {
  /**
   * Creates a new GoalService instance
   * 
   * @param apiClient - Configured API client for backend communication
   */
  constructor(private apiClient: ApiClient) {}
  
  /**
   * Retrieves all goals for the current user
   * 
   * @returns Promise resolving to array of goals
   * @throws {ApiError} If the request fails
   * 
   * @public
   */
  async getAll(): Promise<Goal[]> {
    // implementation
  }
}
```

---

## Common TSDoc Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@remarks` | Extended description | `@remarks This is a complex algorithm that...` |
| `@param` | Parameter description | `@param userId - Unique user identifier` |
| `@returns` | Return value | `@returns Array of matching transactions` |
| `@throws` | Exceptions thrown | `@throws {ValidationError} If input is invalid` |
| `@example` | Code examples | `@example const x = doThing();` |
| `@see` | Related items | `@see {@link OtherFunction}` |
| `@deprecated` | Mark as deprecated | `@deprecated Use newFunction instead` |
| `@public` | Public API | `@public` |
| `@internal` | Internal use only | `@internal` |
| `@alpha` | Alpha API (unstable) | `@alpha This API may change` |
| `@beta` | Beta API (mostly stable) | `@beta` |
| `@packageDocumentation` | Module-level docs | Use in file header |

---

## API Visibility Tags

Use these to indicate API stability and visibility:

```typescript
/**
 * Stable public API - safe to use
 * @public
 */
export function stableFeature() {}

/**
 * Beta API - mostly stable but may change
 * @beta
 */
export function betaFeature() {}

/**
 * Alpha API - experimental, likely to change
 * @alpha
 */
export function experimentalFeature() {}

/**
 * Internal use only - not part of public API
 * @internal
 */
export function internalHelper() {}

/**
 * Deprecated - will be removed in future version
 * @deprecated Use newFeature() instead
 */
export function oldFeature() {}
```

---

## Property Documentation

For interface/class properties, use inline comments:

```typescript
export interface BNPLPlan {
  /** Unique identifier for the plan */
  id: string;
  
  /** BNPL provider name (e.g., 'Klarna', 'Afterpay') */
  provider: string;
  
  /** 
   * Payment status
   * @remarks
   * Status changes from 'active' → 'paid' on completion
   * or 'active' → 'overdue' → 'cancelled' on payment issues
   */
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
}
```

---

## Code Examples

Always use proper code fencing in examples:

````typescript
/**
 * @example
 * Basic usage:
 * ```typescript
 * const result = myFunction('input');
 * console.log(result);
 * ```
 * 
 * @example
 * Advanced usage with options:
 * ```typescript
 * const result = myFunction('input', {
 *   option1: true,
 *   option2: 'custom'
 * });
 * ```
 */
````

---

## Linking to Other Code

Use `{@link}` to create links:

```typescript
/**
 * Processes a transaction and updates the related goal
 * 
 * @param transaction - Transaction to process
 * @returns Updated goal with new progress
 * 
 * @see {@link Goal} - The goal interface
 * @see {@link TransactionService} - For transaction operations
 */
function processTransaction(transaction: Transaction): Goal {
  // implementation
}
```

---

## Migration Checklist

When converting JSDoc to TSDoc:

- [ ] Remove type annotations from `@param` tags (`{string}`, `{number}`, etc.)
- [ ] Add `@remarks` for extended descriptions
- [ ] Add `@example` blocks with real code samples
- [ ] Use inline `/** */` comments for properties
- [ ] Add `@public`, `@internal`, `@alpha`, or `@beta` tags
- [ ] Remove redundant `@type` and `@typedef` tags
- [ ] Add `@packageDocumentation` to module headers
- [ ] Replace `@returns {Type}` with just `@returns Description`
- [ ] Use `@throws` instead of `@exception`
- [ ] Add `@see` links to related code

---

## File Header Template

Use this template at the top of each file:

```typescript
/**
 * Brief module description
 * 
 * @remarks
 * Extended description of what this module provides,
 * its purpose, and key concepts.
 * 
 * @packageDocumentation
 */
```

---

## Before/After Example

### ❌ Before (JSDoc Style)

```typescript
/**
 * @fileoverview BNPL plan utilities
 */

/**
 * Creates a new BNPL plan
 * @param {Object} data - Plan data
 * @param {string} data.provider - Provider name
 * @param {number} data.amount - Total amount
 * @returns {Promise<Object>} Created plan
 */
async function createPlan(data) {
  // ...
}
```

### ✅ After (TSDoc Style)

```typescript
/**
 * BNPL Plan Management Utilities
 * 
 * @remarks
 * Provides functions for creating, updating, and managing
 * Buy Now Pay Later payment plans.
 * 
 * @packageDocumentation
 */

/**
 * Creates a new BNPL payment plan
 * 
 * @remarks
 * Validates plan data, calculates payment schedule, and persists
 * to the database. Automatically sets up payment reminders.
 * 
 * @param data - Plan configuration and payment details
 * @returns Promise resolving to the created plan with generated ID
 * 
 * @throws {ValidationError} If plan data is invalid
 * @throws {ApiError} If database operation fails
 * 
 * @example
 * ```typescript
 * const plan = await createPlan({
 *   provider: 'klarna',
 *   amount: 500,
 *   installments: 4
 * });
 * ```
 * 
 * @public
 */
async function createPlan(data: PlanData): Promise<BNPLPlan> {
  // ...
}
```

---

## Generating Documentation

```bash
# Generate documentation
npm run docs

# Watch mode (auto-regenerate on changes)
npm run docs:watch

# Serve documentation locally
npm run docs:serve
```

Documentation will be generated in the `./docs` directory and can be viewed at http://localhost:8080

---

## Best Practices

1. **Be Descriptive**: Focus on *what* and *why*, not *how* (code shows how)
2. **Add Examples**: Real code examples are more valuable than descriptions
3. **Use @remarks**: For detailed explanations beyond the summary
4. **Link Related Code**: Use `@see` and `{@link}` liberally
5. **Mark API Status**: Use `@public`, `@alpha`, `@beta`, `@internal`
6. **Document Throws**: Always document exceptions with `@throws`
7. **Keep It Updated**: Update docs when code changes
8. **Be Concise**: First line should be a clear, brief summary

---

## Resources

- [TSDoc Official Website](https://tsdoc.org/)
- [TypeDoc Documentation](https://typedoc.org/)
- [TSDoc Tag Reference](https://tsdoc.org/pages/tags/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Remember:** Good documentation makes code easier to understand, maintain, and use. Invest time in clear, helpful documentation!
