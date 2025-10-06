# Quick Fixes Guide
## Immediate Actions to Improve Code Quality

This guide provides copy-paste solutions for the most common issues found in the codebase.

---

## 🚀 Automated Fixes (Run These First)

### 1. Auto-fix ESLint Issues (5 minutes)
```bash
# Remove unused imports and fix formatting
npm run lint -- --fix

# Review the changes
git diff

# Commit if looks good
git add .
git commit -m "chore: auto-fix ESLint issues"
```

**Expected:** Fixes ~150 issues automatically

---

### 2. Install Git Hooks (5 minutes)
```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Add lint-staged config to package.json
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

---

## 🔧 Critical Bug Fixes

### Fix 1: Consecutive Days Calculation (15 minutes)

**File:** `dashboard/BurnoutAnalyzer.jsx`

**Replace lines 22-36 with:**
```javascript
const calculateConsecutiveDays = (weekShifts) => {
    if (weekShifts.length === 0) return 0;
    
    // Use full date comparison, not just day of month
    const shiftDates = [...new Set(
        weekShifts.map(shift => {
            const date = new Date(shift.start_datetime);
            // Normalize to midnight UTC for date comparison
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        })
    )].sort((a, b) => a - b);
    
    if (shiftDates.length === 0) return 0;
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < shiftDates.length; i++) {
        const dayDiff = Math.floor((shiftDates[i] - shiftDates[i-1]) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            currentConsecutive++;
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        } else {
            currentConsecutive = 1;
        }
    }
    
    return maxConsecutive;
};
```

**Test with:**
```javascript
// Example: Shifts on Jan 30, Jan 31, Feb 1, Feb 2 should return 4
const testShifts = [
    { start_datetime: '2024-01-30T09:00:00Z' },
    { start_datetime: '2024-01-31T09:00:00Z' },
    { start_datetime: '2024-02-01T09:00:00Z' },
    { start_datetime: '2024-02-02T09:00:00Z' }
];
console.log(calculateConsecutiveDays(testShifts)); // Should output: 4
```

---

### Fix 2: Vite Config __dirname (5 minutes)

**File:** `vite.config.js`

**Add at the top:**
```javascript
import { fileURLToPath, URL } from 'node:url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
```

**Update resolve.alias:**
```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

### Fix 3: Add Error Boundary (20 minutes)

**Create:** `ui/ErrorBoundary.jsx`
```javascript
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're sorry, but something unexpected happened. The error has been logged.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded-md overflow-auto">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Update:** `App.jsx` or `main.jsx`
```javascript
import ErrorBoundary from '@/ui/ErrorBoundary.jsx';

// Wrap your app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 🛡️ Security Quick Fixes

### Fix 4: Add Input Validation (30 minutes)

**Create:** `utils/validation.js`
```javascript
import { z } from 'zod';

// Currency validation schema
export const currencySchema = z.number()
  .min(0, 'Amount cannot be negative')
  .max(1000000000, 'Amount too large')
  .finite('Amount must be a finite number');

// Budget allocation schema
export const budgetAllocationSchema = z.object({
  category: z.string().min(1, 'Category required'),
  amount: currencySchema,
});

// Validate currency input
export const validateCurrency = (value) => {
  const parsed = parseFloat(value);
  
  if (isNaN(parsed)) {
    return { valid: false, error: 'Invalid number' };
  }
  
  try {
    currencySchema.parse(parsed);
    return { valid: true, value: parsed };
  } catch (error) {
    return { valid: false, error: error.errors[0].message };
  }
};

// Sanitize string input
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};
```

**Update:** `dashboard/EnvelopeBudgeting.jsx`
```javascript
import { validateCurrency, sanitizeString } from '@/utils/validation.js';

const handleAllocate = useCallback((category, value) => {
  const validation = validateCurrency(value);
  
  if (!validation.valid) {
    toast({
      title: 'Invalid Amount',
      description: validation.error,
      variant: 'destructive'
    });
    return;
  }
  
  setEnvelopes(prev => ({
    ...prev,
    [category]: validation.value
  }));
}, [setEnvelopes, toast]);
```

---

### Fix 5: Improve Error Handling (20 minutes)

**Create:** `utils/errorHandler.js`
```javascript
/**
 * Centralized error handling utility
 */

// User-friendly error messages
const ERROR_MESSAGES = {
  NETWORK: 'Network connection failed. Please check your internet and try again.',
  AUTH: 'Authentication failed. Please log in again.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
};

/**
 * Get user-friendly error message
 */
export const getUserMessage = (error) => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;
  
  // Network errors
  if (error.message === 'Failed to fetch' || error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK;
  }
  
  // HTTP status codes
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ERROR_MESSAGES.AUTH;
  }
  
  if (error.response?.status === 429) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }
  
  if (error.response?.status >= 500) {
    return ERROR_MESSAGES.SERVER;
  }
  
  // Timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  // Return custom message if available
  if (error.message && !error.message.includes('fetch')) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN;
};

/**
 * Log error to service (implement based on your error tracking solution)
 */
export const logError = (error, context = {}) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    console.error('Context:', context);
  }
  
  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // Example:
  // Sentry.captureException(error, { extra: context });
};

/**
 * Handle error with toast notification
 */
export const handleError = (error, toast, context = {}) => {
  const message = getUserMessage(error);
  logError(error, context);
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });
};
```

**Update error handling in components:**
```javascript
import { handleError } from '@/utils/errorHandler.js';

try {
  // ... your code
} catch (error) {
  handleError(error, toast, {
    component: 'AIAdvisorPanel',
    action: 'fetchAdvice',
    serviceId
  });
}
```

---

## 📝 PropTypes Quick Add (Manual)

### Template for Adding PropTypes

**Install if not already:**
```bash
npm install --save prop-types
```

**Add to any component:**
```javascript
import PropTypes from 'prop-types';

function MyComponent({ name, age, onAction, items, config }) {
  // ... component code
}

MyComponent.propTypes = {
  // Required props
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  
  // Optional props
  onAction: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.object),
  
  // Complex shapes
  config: PropTypes.shape({
    enabled: PropTypes.bool,
    value: PropTypes.number,
  }),
};

MyComponent.defaultProps = {
  onAction: () => {},
  items: [],
  config: {
    enabled: false,
    value: 0,
  },
};

export default MyComponent;
```

---

## 🧪 Quick Test Setup (30 minutes)

### Add Testing Infrastructure

**Install dependencies:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

**Create:** `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**Create:** `tests/setup.js`
```javascript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

**Update:** `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Example test:** `utils/__tests__/calculations.test.js`
```javascript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../calculations';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});
```

---

## 📊 Quick Wins Checklist

Complete these in order for maximum impact with minimum effort:

- [ ] **5 min:** Run `npm run lint -- --fix`
- [ ] **5 min:** Fix vite.config.js __dirname issue
- [ ] **5 min:** Install git hooks (husky + lint-staged)
- [ ] **15 min:** Fix consecutive days calculation bug
- [ ] **20 min:** Add ErrorBoundary component
- [ ] **20 min:** Improve error handling utility
- [ ] **30 min:** Add input validation
- [ ] **30 min:** Set up testing infrastructure

**Total time:** ~2 hours
**Issues fixed:** 2 critical bugs + foundation for future improvements

---

## 🔍 Before/After Verification

### After applying fixes, verify:

```bash
# 1. Linting should show fewer errors
npm run lint

# 2. Build should succeed
npm run build

# 3. Tests should run (after test setup)
npm test

# 4. App should start without errors
npm run dev
```

---

## 📚 Additional Resources

### For PropTypes:
- [PropTypes Documentation](https://reactjs.org/docs/typechecking-with-proptypes.html)
- [Migrating to TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

### For Testing:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)

### For Error Handling:
- [Sentry for React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundary Pattern](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**Last Updated:** 2024
**Maintained by:** Development Team
