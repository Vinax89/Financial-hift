# TSDoc Quick Reference Card

## 🎯 The Golden Rule
**Let TypeScript handle types, use TSDoc for descriptions!**

---

## Basic Template

```typescript
/**
 * One-line summary of what this does
 * 
 * @remarks
 * Extended description with context, behavior notes,
 * and important considerations.
 * 
 * @param paramName - What the parameter represents (not its type!)
 * @returns What the function returns
 * 
 * @example
 * ```typescript
 * const result = myFunction('example');
 * ```
 * 
 * @public
 */
```

---

## Common Tags at a Glance

| Tag | Use Case |
|-----|----------|
| `@remarks` | Extended description |
| `@param` | Parameter description (NO types!) |
| `@returns` | What is returned |
| `@throws` | Exceptions that can be thrown |
| `@example` | Code examples |
| `@see` | Link to related code |
| `@public` | Public API (stable) |
| `@internal` | Internal use only |
| `@alpha` | Experimental API |
| `@beta` | Beta API (mostly stable) |
| `@deprecated` | Mark as deprecated |

---

## Do's and Don'ts

### ❌ DON'T (JSDoc way)
```typescript
/**
 * @param {string} name - User name
 * @param {number} age - User age  
 * @returns {boolean} Is adult
 */
function isAdult(name: string, age: number): boolean {
  return age >= 18;
}
```

### ✅ DO (TSDoc way)
```typescript
/**
 * Checks if a person is an adult (18+)
 * 
 * @param name - Person's full name
 * @param age - Person's age in years
 * @returns True if 18 or older
 * 
 * @public
 */
function isAdult(name: string, age: number): boolean {
  return age >= 18;
}
```

---

## Interface Documentation

```typescript
/**
 * Brief description of interface
 * 
 * @remarks
 * Extended context about when and how to use this.
 * 
 * @example
 * ```typescript
 * const obj: MyInterface = { ... };
 * ```
 * 
 * @public
 */
export interface MyInterface {
  /** What this property represents */
  propName: string;
  
  /** Another property description */
  anotherProp: number;
}
```

---

## React Component

```typescript
/**
 * Component brief description
 * 
 * @remarks
 * What the component does, features it provides.
 * 
 * @param props - Component properties
 * @returns Rendered component
 * 
 * @example
 * ```tsx
 * <MyComponent prop1="value" />
 * ```
 * 
 * @public
 */
export function MyComponent({ prop1 }: Props) {
  // ...
}
```

---

## File Header

```typescript
/**
 * Module description
 * 
 * @remarks
 * What this module provides, its purpose.
 * 
 * @packageDocumentation
 */
```

---

## Linking to Other Code

```typescript
/**
 * Does something related to User
 * 
 * @see {@link User} - The user interface
 * @see {@link UserService} - Related service
 */
```

---

## Examples with Code Blocks

````typescript
/**
 * @example
 * Basic usage:
 * ```typescript
 * const x = doThing();
 * ```
 * 
 * @example
 * Advanced usage:
 * ```typescript
 * const y = doThing({ option: true });
 * ```
 */
````

---

## API Visibility

```typescript
/** @public - Stable public API */
/** @beta - Mostly stable, may change */
/** @alpha - Experimental, likely to change */
/** @internal - Internal use only, not public API */
/** @deprecated Use newFunction() instead */
```

---

## Generate Documentation

```bash
npm run docs          # Generate
npm run docs:watch    # Watch mode
npm run docs:serve    # Serve locally
```

---

## Remember

1. **TypeScript has the types** - don't repeat them!
2. **Focus on WHAT and WHY** - code shows HOW
3. **Add examples** - they're worth 1000 words
4. **Use @remarks** - for extended explanations
5. **Mark visibility** - @public, @internal, etc.

---

## Full Example

```typescript
/**
 * Calculates the safe-to-spend amount
 * 
 * @remarks
 * Takes into account bills, subscriptions, and savings goals
 * to determine spendable amount without impacting obligations.
 * 
 * Uses the formula:
 * Safe = Income - Bills - Subscriptions - Savings
 * 
 * @param income - Total monthly income
 * @param bills - Array of bill payments
 * @param savings - Savings goal amount
 * @returns Safe amount to spend
 * 
 * @throws {Error} If income is negative
 * 
 * @example
 * ```typescript
 * const safe = calculateSafe(5000, [200, 300], 500);
 * // Returns: 4000
 * ```
 * 
 * @see {@link Bill} - Bill interface
 * 
 * @public
 */
export function calculateSafe(
  income: number,
  bills: number[],
  savings: number
): number {
  if (income < 0) throw new Error('Negative income');
  return income - bills.reduce((a, b) => a + b, 0) - savings;
}
```

---

**📖 Full Guide:** See `TSDOC_GUIDE.md`  
**📝 Migration Info:** See `TSDOC_MIGRATION.md`
