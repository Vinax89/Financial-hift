# Component Testing Guide

> **Comprehensive guide to testing React components with Vitest and React Testing Library**

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Testing Philosophy](#testing-philosophy)
- [Writing Component Tests](#writing-component-tests)
- [Mocking Strategies](#mocking-strategies)
- [User Interaction Testing](#user-interaction-testing)
- [Async Testing](#async-testing)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)
- [Example Tests](#example-tests)

## Overview

This project uses **Vitest** as the test runner and **React Testing Library** (RTL) for component testing. This combination provides:

- ✅ Fast test execution with Vitest
- ✅ User-centric testing approach with RTL
- ✅ Full TypeScript support
- ✅ Modern ESM module support
- ✅ Built-in code coverage

### Testing Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 3.2.4 | Test runner and assertion library |
| **React Testing Library** | 16.3.0 | Component testing utilities |
| **@testing-library/jest-dom** | 6.9.1 | Custom DOM matchers |
| **@testing-library/user-event** | 14.6.1 | User interaction simulation |
| **happy-dom** | 15.11.7 | Lightweight DOM environment |

## Setup

Test setup is configured in `tests/setup.jsx`:

```jsx
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers with jest-dom
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

Vitest configuration (`vitest.config.ts`):

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.jsx'],
    css: true,
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
```

## Testing Philosophy

### What to Test

✅ **DO test**:
- Component renders correctly with props
- User interactions (clicks, hovers, form inputs)
- Conditional rendering based on state/props
- Accessibility (ARIA attributes, keyboard navigation)
- Error boundaries and error states
- Integration with React Router, contexts, etc.

❌ **DON'T test**:
- Implementation details (internal state management)
- Third-party library internals
- CSS styles (unless critical to functionality)
- Exact DOM structure (too brittle)

### Testing Pyramid

```
        /\
       /  \    E2E Tests (few, critical user flows)
      /____\
     /      \   Integration Tests (moderate, feature-level)
    /________\
   /          \ Unit Tests (many, component-level)
  /__________\
```

## Writing Component Tests

### Basic Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<MyComponent title="Test" />);
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<MyComponent onClick={handleClick} />);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Query Priority

Use queries in this order (best to worst):

1. **getByRole**: Accessibility-focused
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText**: Form elements
   ```typescript
   screen.getByLabelText('Email')
   ```

3. **getByPlaceholderText**: Input placeholders
   ```typescript
   screen.getByPlaceholderText('Enter email...')
   ```

4. **getByText**: Non-interactive text content
   ```typescript
   screen.getByText(/welcome/i)
   ```

5. **getByTestId**: Last resort only
   ```typescript
   screen.getByTestId('custom-element')
   ```

### Assertion Matchers

Common jest-dom matchers:

```typescript
// Presence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();

// Content
expect(element).toHaveTextContent('Hello');
expect(element).toContainHTML('<span>Hi</span>');

// Attributes
expect(element).toHaveAttribute('href', '/home');
expect(element).toHaveClass('active');

// Forms
expect(input).toHaveValue('test');
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();

// Accessibility
expect(element).toHaveAccessibleName('Close');
expect(element).toHaveAccessibleDescription('Close dialog');
```

## Mocking Strategies

### Mocking Modules

```typescript
// Mock entire module
vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

// Mock specific exports
vi.mock('@/hooks/usePrefetch', () => ({
  usePrefetchOnHover: vi.fn(() => ({
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onTouchStart: vi.fn(),
  })),
}));
```

### Mocking Browser APIs

```typescript
// IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Image
global.Image = class {
  onload: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  src = '';
  
  constructor() {
    setTimeout(() => this.onload?.(), 0);
  }
} as any;

// localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

### Mocking Contexts

```typescript
const MockProvider = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true }}>
    {children}
  </AuthContext.Provider>
);

render(
  <MockProvider>
    <MyComponent />
  </MockProvider>
);
```

## User Interaction Testing

### Setup User Event

Always setup userEvent per test:

```typescript
const user = userEvent.setup();
```

### Common Interactions

```typescript
// Click
await user.click(button);
await user.dblClick(button);

// Type
await user.type(input, 'Hello World');
await user.clear(input);

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}{Tab}{/Shift}');

// Hover
await user.hover(element);
await user.unhover(element);

// Tab navigation
await user.tab();
await user.tab({ shift: true }); // Shift+Tab

// Select
await user.selectOptions(select, 'option1');

// Upload
await user.upload(fileInput, file);
```

### Accessibility Testing

```typescript
describe('Accessibility', () => {
  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    
    render(<MyComponent />);
    
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(<Dialog open />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
```

## Async Testing

### WaitFor

Use `waitFor` for async state updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// With options
await waitFor(
  () => {
    expect(screen.getByRole('alert')).toBeVisible();
  },
  { timeout: 3000, interval: 100 }
);
```

### FindBy Queries

Combines `getBy` + `waitFor`:

```typescript
const element = await screen.findByText('Async Content');
expect(element).toBeInTheDocument();
```

### Act Warnings

If you see "act(...)" warnings:

```typescript
import { act } from '@testing-library/react';

act(() => {
  result.current.doSomething();
});
```

### Testing Loading States

```typescript
it('should show loading state', async () => {
  render(<AsyncComponent />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

## Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Bad**:
```typescript
expect(component.state.count).toBe(5);
```

✅ **Good**:
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Semantic Queries

❌ **Bad**:
```typescript
container.querySelector('.submit-button')
```

✅ **Good**:
```typescript
screen.getByRole('button', { name: /submit/i })
```

### 3. Avoid Testing Implementation Details

❌ **Bad**:
```typescript
expect(mockApi).toHaveBeenCalled(); // Testing HOW it works
```

✅ **Good**:
```typescript
expect(screen.getByText('Data loaded')).toBeInTheDocument(); // Testing WHAT it does
```

### 4. Use Data-Testid Sparingly

Only when no better query exists:

```typescript
// Only if no role, label, or text is suitable
<div data-testid="custom-widget">...</div>

screen.getByTestId('custom-widget')
```

### 5. Group Related Tests

```typescript
describe('MyComponent', () => {
  describe('Rendering', () => {
    // Rendering tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });

  describe('Error Handling', () => {
    // Error tests
  });
});
```

### 6. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup(); // Unmount components
  vi.clearAllMocks(); // Reset mocks
});
```

### 7. Test Edge Cases

```typescript
describe('Input validation', () => {
  it('should handle empty input', async () => {
    // Test empty state
  });

  it('should handle very long input', async () => {
    // Test max length
  });

  it('should handle special characters', async () => {
    // Test edge cases
  });
});
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- PrefetchLink.test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run with UI
npm test -- --ui

# Run only changed files
npm test -- --changed
```

### Coverage Thresholds

Aim for these coverage targets:

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report:

```bash
npm test -- --coverage
open coverage/index.html
```

## Example Tests

### Example 1: PrefetchLink Component

```typescript
describe('PrefetchLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render link with children', () => {
    render(
      <BrowserRouter>
        <PrefetchLink to="/dashboard">Go to Dashboard</PrefetchLink>
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: /go to dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('should trigger prefetch on hover', async () => {
    const mockHandlers = {
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
      onTouchStart: vi.fn(),
    };
    
    vi.spyOn(usePrefetchModule, 'usePrefetchOnHover')
      .mockReturnValue(mockHandlers);

    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <PrefetchLink to="/test">Test Link</PrefetchLink>
      </BrowserRouter>
    );

    const link = screen.getByRole('link');
    await user.hover(link);

    expect(mockHandlers.onMouseEnter).toHaveBeenCalled();
  });
});
```

### Example 2: Form Component

```typescript
describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    // Submit without filling fields
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });
});
```

### Example 3: Async Data Loading

```typescript
describe('UserProfile', () => {
  it('should load and display user data', async () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    
    vi.mocked(fetchUser).mockResolvedValue(mockUser);

    render(<UserProfile userId="123" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle loading errors', async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error('Failed to load'));

    render(<UserProfile userId="123" />);

    expect(await screen.findByText('Failed to load user')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

**Issue**: "Unable to find element"
- **Solution**: Use `screen.debug()` to see current DOM
- Check if element is rendered asynchronously (use `findBy` or `waitFor`)

**Issue**: "Act warning"
- **Solution**: Wrap state updates in `act()` or use `waitFor`

**Issue**: "Test timeout"
- **Solution**: Increase timeout or check for infinite loops
  ```typescript
  await waitFor(() => {...}, { timeout: 5000 });
  ```

**Issue**: "Cannot find module"
- **Solution**: Check path aliases in `vitest.config.ts`

### Debug Tools

```typescript
// Print DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Get all roles
screen.logTestingPlaygroundURL();
```

## Additional Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Playground](https://testing-playground.com/)

---

## Test Files in This Project

### Utility Tests
- ✅ `tests/utils/logger.test.ts` (37 tests)
- ✅ `tests/utils/performance.test.ts` (34 tests)

### Component Tests
- ✅ `components/PrefetchLink.test.tsx` (27 tests)
- ⚠️  `components/ui/OptimizedImage.test.tsx` (23/42 passing)

**Note**: OptimizedImage tests have known limitations with IntersectionObserver mocking in happy-dom. Some tests are intentionally simplified to focus on critical functionality.

---

**Total Test Coverage**: 121+ tests passing
**Last Updated**: January 2025