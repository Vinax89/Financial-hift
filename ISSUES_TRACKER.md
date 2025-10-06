# Issues Tracker
## Categorized Action Items from Code Review

This document tracks specific issues found during code review, categorized for easy prioritization.

---

## 🔴 CRITICAL - Fix Immediately

### BUG-001: Consecutive Days Calculation Error
**File:** `dashboard/BurnoutAnalyzer.jsx:22-36`
**Severity:** HIGH
**Impact:** Incorrect burnout risk calculations

**Problem:**
```javascript
const shiftDates = [...new Set(weekShifts.map(shift => 
    new Date(shift.start_datetime).getDate()  // Only gets day of month (1-31)
))].sort((a, b) => a - b);
```

Uses `.getDate()` which returns day of month, not accounting for month boundaries.

**Example:**
- Shifts on Jan 30, 31, Feb 1, 2 → Compares [30, 31, 1, 2] → Incorrect result

**Fix:** Use full date comparison, not just day of month

**Assigned:** [ ]
**Priority:** P0
**Effort:** 1 hour

---

### BUG-002: __dirname undefined in Vite Config
**File:** `vite.config.js:13`
**Severity:** HIGH
**Impact:** Build may fail

**Problem:**
```javascript
'__dirname' is not defined  no-undef
```
Using CommonJS variable in ES module context

**Fix:**
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

**Assigned:** [ ]
**Priority:** P0
**Effort:** 15 minutes

---

### SEC-001: Unvalidated Input in Budget Allocation
**File:** `dashboard/EnvelopeBudgeting.jsx:260-267`
**Severity:** HIGH
**Impact:** Could allow negative values, very large numbers, or invalid input

**Problem:**
```javascript
<Input
    type="number"
    onChange={(e) => handleAllocate(envelope.category, e.target.value)}
/>
```

No validation before processing user input

**Fix:** Add Zod schema validation and min/max constraints

**Assigned:** [ ]
**Priority:** P0
**Effort:** 2 hours

---

### SEC-002: Error Information Leakage
**File:** Multiple files (`dashboard/AIAdvisorPanel.jsx`, `ai/AIAssistantContent.jsx`)
**Severity:** MEDIUM-HIGH
**Impact:** Sensitive error details could be exposed

**Problem:**
```javascript
catch (error) {
    console.error('AI Advisor error:', error);  // Full error in console
    setResults(prev => ({ 
        ...prev, 
        [serviceId]: 'Sorry, there was an error...'  // Generic to user
    }));
}
```

**Fix:**
- Implement proper error logging service
- Sanitize error messages for users
- Don't expose sensitive error details

**Assigned:** [ ]
**Priority:** P1
**Effort:** 4 hours

---

## 🟡 HIGH PRIORITY - Fix This Sprint

### TECH-001: No Error Boundaries
**Severity:** HIGH
**Impact:** Single component error crashes entire app

**Problem:** No Error Boundary components found in codebase

**Fix:**
1. Create ErrorBoundary component
2. Wrap major sections
3. Add fallback UI
4. Log errors properly

**Assigned:** [ ]
**Priority:** P1
**Effort:** 3 hours

---

### TECH-002: Missing PropTypes Validation (800+ instances)
**Severity:** MEDIUM-HIGH
**Impact:** Runtime errors, poor DX, harder debugging

**Problem:** No prop validation across entire codebase

**Options:**
- **Option A:** Add PropTypes to all components (4-8 hours)
- **Option B:** Migrate to TypeScript (40+ hours, better long-term)

**Files affected:** All component files

**Assigned:** [ ]
**Priority:** P1
**Effort:** 4-40 hours (depending on approach)

---

### TECH-003: Unused React Imports (150+ instances)
**Severity:** LOW-MEDIUM
**Impact:** Unnecessary bundle size, code clutter

**Problem:**
```javascript
import React, { useState } from 'react';  // React unused with JSX transform
```

**Fix:** Run `eslint . --fix` to auto-remove

**Assigned:** [ ]
**Priority:** P1
**Effort:** 30 minutes (automated)

---

### SEC-003: No Rate Limiting on AI Calls
**Files:** `dashboard/AIAdvisorPanel.jsx`, `ai/AIAssistantContent.jsx`
**Severity:** MEDIUM
**Impact:** Potential API abuse, cost overruns

**Problem:** Users can trigger unlimited AI requests

**Fix:**
- Add rate limiting per user/session
- Implement request queue
- Add loading states to prevent spam
- Consider cost tracking

**Assigned:** [ ]
**Priority:** P1
**Effort:** 4 hours

---

### DATA-001: Transaction Type Confusion
**File:** `dashboard/EnvelopeBudgeting.jsx:38-45`
**Severity:** MEDIUM
**Impact:** Data integrity concerns

**Problem:**
```javascript
// FIX: Use transaction type === 'expense' instead of negative amounts 
// (schema enforces non-negative amounts)
const amt = typeof t.amount === 'number' ? Math.abs(t.amount) : 0;
```

Comment indicates schema should enforce non-negative, but code uses `Math.abs()` defensively

**Fix:**
1. Verify schema enforcement
2. Remove Math.abs() if truly enforced
3. Add validation at API boundary
4. Document schema expectations

**Assigned:** [ ]
**Priority:** P2
**Effort:** 2 hours

---

## 🟢 MEDIUM PRIORITY - Fix This Month

### MAINT-001: Unused Variables
**Severity:** LOW-MEDIUM
**Impact:** Code bloat, confusion

**Instances:**
- `analytics/FinancialMetrics.jsx:49` - `totalDebt` declared but unused
- `utils/calculations.jsx` - `format`, `parseISO` imported but unused
- `analytics/IncomeChart.jsx:9` - `formatCurrency` declared but unused
- 200+ other instances

**Fix:** Remove all unused variables (ESLint autofix where possible)

**Assigned:** [ ]
**Priority:** P2
**Effort:** 2 hours

---

### MAINT-002: Code Duplication - Color Utilities
**Severity:** LOW-MEDIUM
**Impact:** Maintainability, consistency

**Problem:** Color mapping duplicated across files:
- `dashboard/AIAdvisorPanel.jsx:179-188`
- Other components with similar patterns

**Fix:**
1. Create `utils/colorClasses.js`
2. Export reusable color mapping functions
3. Update all components to use shared utility

**Assigned:** [ ]
**Priority:** P2
**Effort:** 2 hours

---

### MAINT-003: Currency Formatting Inconsistency
**Severity:** LOW-MEDIUM
**Impact:** UX consistency

**Problem:** Multiple currency formatting implementations

**Fix:**
1. Centralize in `utils/calculations.jsx`
2. Support internationalization
3. Make currency symbol configurable
4. Update all usages

**Assigned:** [ ]
**Priority:** P2
**Effort:** 3 hours

---

### PERF-001: Unnecessary Re-renders
**Severity:** MEDIUM
**Impact:** Performance degradation with large datasets

**Problem:** 
- Callbacks created on every render
- Inconsistent use of `useCallback`/`useMemo`
- Child components re-render unnecessarily

**Fix:**
1. Profile with React DevTools
2. Add consistent memoization
3. Use React.memo where appropriate

**Assigned:** [ ]
**Priority:** P2
**Effort:** 6 hours

---

### DOC-001: Missing Component Documentation
**Severity:** LOW
**Impact:** Developer onboarding, maintainability

**Problem:** No JSDoc comments on components

**Fix:** Add JSDoc to all components, starting with:
1. Public API components
2. Complex business logic
3. Utility functions

**Assigned:** [ ]
**Priority:** P2
**Effort:** 8 hours

---

### DOC-002: Algorithm Documentation Missing
**Severity:** MEDIUM
**Impact:** Cannot verify correctness of financial calculations

**Problem:** No documentation for:
- Burnout risk calculation rationale
- Debt payoff strategies
- Budget optimization algorithms

**Fix:**
1. Document all financial calculations
2. Add references to sources
3. Include example calculations
4. Add unit tests to verify

**Assigned:** [ ]
**Priority:** P2
**Effort:** 6 hours

---

## 🔵 LOW PRIORITY - Future Improvements

### QUALITY-001: No Test Infrastructure
**Severity:** LOW-MEDIUM (but growing)
**Impact:** Cannot verify correctness, risky refactoring

**Problem:** No test files found

**Fix:**
1. Add Jest + React Testing Library
2. Start with critical calculations
3. Add integration tests
4. Set up CI/CD with test coverage

**Assigned:** [ ]
**Priority:** P3
**Effort:** 24-40 hours

---

### ACCESS-001: Missing ARIA Labels
**Severity:** LOW
**Impact:** Accessibility for screen reader users

**Problem:**
- Buttons without aria-labels
- Icon-only buttons without text alternatives
- Form inputs without proper labeling

**Fix:**
1. Audit all interactive elements
2. Add proper ARIA labels
3. Test with screen readers
4. Add to component checklist

**Assigned:** [ ]
**Priority:** P3
**Effort:** 8 hours

---

### ACCESS-002: Color Contrast Verification
**Severity:** LOW
**Impact:** Accessibility for visually impaired

**Problem:** Need to verify WCAG AA compliance

**Fix:**
1. Run automated accessibility audit
2. Test with color blindness simulators
3. Adjust colors as needed
4. Document accessible color palette

**Assigned:** [ ]
**Priority:** P3
**Effort:** 4 hours

---

### ARCH-001: No Global State Management
**Severity:** LOW
**Impact:** Growing complexity, props drilling

**Problem:** 
- No global state library
- Props drilling in some components
- Direct local storage usage

**Fix:**
1. Evaluate Zustand vs Recoil
2. Implement for shared state
3. Abstract storage layer
4. Migrate gradually

**Assigned:** [ ]
**Priority:** P3
**Effort:** 16 hours

---

### ARCH-002: Inconsistent API Layer
**Severity:** LOW-MEDIUM
**Impact:** Difficult to maintain/test

**Problem:**
- Mix of SDK calls and direct API calls
- Inconsistent error handling
- No retry logic

**Fix:**
1. Standardize on Base44 SDK
2. Create API service layer
3. Add interceptors
4. Implement retry logic

**Assigned:** [ ]
**Priority:** P3
**Effort:** 12 hours

---

### FEATURE-001: Privacy Mode for Sensitive Data
**Severity:** LOW
**Impact:** User privacy

**Problem:** CSS class `sensitive` has no implementation

**Fix:**
1. Implement blur/hide toggle
2. Add privacy mode setting
3. Persist preference
4. Add keyboard shortcut

**Assigned:** [ ]
**Priority:** P3
**Effort:** 6 hours

---

### BUILD-001: Bundle Size Optimization
**Severity:** LOW
**Impact:** Load time, performance

**Problem:** No bundle analysis or optimization

**Fix:**
1. Add bundle analyzer
2. Implement code splitting
3. Lazy load routes
4. Optimize vendor chunks

**Assigned:** [ ]
**Priority:** P3
**Effort:** 8 hours

---

## 📊 Statistics

### Issue Count by Severity
- 🔴 Critical: 4
- 🟡 High: 6
- 🟢 Medium: 7
- 🔵 Low: 8
- **Total:** 25 tracked issues

### Issue Count by Category
- Security: 3
- Bugs: 2
- Technical Debt: 3
- Maintenance: 3
- Performance: 1
- Documentation: 2
- Quality: 1
- Accessibility: 2
- Architecture: 2
- Features: 1
- Build: 1

### ESLint Issues (not individually tracked)
- Missing prop validation: ~800
- Unused variables: ~200
- Unused imports: ~150
- Other: ~175
- **Total:** ~1,325

---

## 🎯 Suggested Sprint Planning

### Sprint 1 (Week 1)
- BUG-001: Fix consecutive days calculation
- BUG-002: Fix vite config __dirname
- SEC-001: Add input validation
- TECH-003: Remove unused imports (automated)

**Estimated effort:** 3.75 hours

---

### Sprint 2 (Week 2)
- SEC-002: Improve error handling
- TECH-001: Add error boundaries
- SEC-003: Add rate limiting

**Estimated effort:** 11 hours

---

### Sprint 3 (Week 3-4)
- TECH-002: Add PropTypes (Option A) OR start TypeScript migration (Option B)
- DATA-001: Resolve transaction type confusion
- MAINT-001: Remove unused variables

**Estimated effort:** 8 hours (Option A) or start of multi-sprint effort (Option B)

---

### Sprint 4 (Month 2)
- MAINT-002: Extract duplicated code
- MAINT-003: Centralize currency formatting
- PERF-001: Optimize re-renders
- DOC-001: Add component documentation

**Estimated effort:** 19 hours

---

### Backlog (Month 3+)
- Everything in LOW PRIORITY section
- QUALITY-001: Build test infrastructure (ongoing)

---

## 📝 Notes

1. **ESLint quick wins:** Run `eslint . --fix` to auto-fix ~150 issues immediately
2. **TypeScript consideration:** If planning long-term maintenance, consider migrating to TypeScript instead of adding PropTypes
3. **Testing:** Should start ASAP even if infrastructure is incomplete
4. **Documentation:** Can be done incrementally alongside other work

---

**Last Updated:** 2024
**Next Review:** After Sprint 1 completion
