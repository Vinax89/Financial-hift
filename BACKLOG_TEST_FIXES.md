# Post-Deployment Test Fixes - Backlog

**Priority**: MEDIUM  
**Estimated Effort**: 5-7 days  
**Assigned To**: TBD  
**Status**: Pending (Post-Production Deployment)

---

## Overview

This document tracks test failures that need to be addressed after Phase 3 production deployment. These failures do not block deployment as they are either:
1. **Mock environment artifacts** (Phase 3 migration tests)
2. **Pre-existing failures** unrelated to Phase 3 (Form/Hook/Validation tests)

---

## Task 1: Fix Phase 3 Migration Test Mocks

**Priority**: MEDIUM  
**Estimated Effort**: 1-2 days  
**Impact**: Improves automated test reliability, no production impact

### Problem

16 out of 36 Phase 3 migration tests fail due to test environment mock storage limitations:

```
❌ secureStorage.get(key) returns null after successful secureStorage.set(key, value)
✅ localStorage mock operations work correctly
✅ Production code executes successfully (confirmed by debug logs)
❌ Test verification step fails due to state desynchronization
```

### Root Cause

```javascript
// Current Test Setup
const localStorageMock = {
  store: {},
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; }
};

// Problem:
// - SecureStorage maintains internal encrypted state
// - Mock localStorage maintains separate plaintext state
// - After secureStorage.set(), internal state != mock state
// - secureStorage.get() reads internal state (finds nothing)
```

### Solution Options

#### Option A: Reset SecureStorage Singleton in beforeEach()

```typescript
beforeEach(() => {
  // Clear mock localStorage
  localStorageMock.clear();
  
  // Reset SecureStorage internal state
  // (requires exposing reset method or creating new instance)
  secureStorage._resetForTesting?.(); // NEW
  
  // Clear all mocks
  vi.clearAllMocks();
});
```

**Pros**: Minimal changes, addresses root cause  
**Cons**: Requires modifying `SecureStorage` class  
**Effort**: 4-6 hours

#### Option B: Use jsdom Instead of happy-dom

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom', // Change from happy-dom
    setupFiles: ['./tests/setup.js'],
  },
});
```

**Pros**: Better localStorage simulation, more production-like  
**Cons**: Slower test execution, larger dependency  
**Effort**: 2-3 hours + regression testing

#### Option C: Mock SecureStorage Directly

```typescript
// Instead of mocking localStorage, mock SecureStorage
vi.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    // ... track state in mock
  },
}));
```

**Pros**: Full control over mock behavior  
**Cons**: Doesn't test real SecureStorage logic  
**Effort**: 6-8 hours

### Recommended Approach

**Combination of A + B**:
1. Add `_resetForTesting()` method to `SecureStorage` class (dev-only)
2. Call in `beforeEach()` to clear internal state
3. If issues persist, switch to `jsdom` environment
4. Re-run all 36 migration tests
5. Target: 100% pass rate (36/36)

### Acceptance Criteria

- [ ] All 36 Phase 3 migration tests pass (100%)
- [ ] No regressions in existing 461 tests
- [ ] Test execution time increase <10%
- [ ] Documentation updated with new mock setup

---

## Task 2: Fix Pre-Existing Form/Hook Test Failures

**Priority**: LOW  
**Estimated Effort**: 3-5 days  
**Impact**: Improves overall test suite health

### Problem Categories

#### 2.1 Form Flow Integration (9 failures)

**Error Pattern**: `TypeError: handleSubmit is not a function`

**Affected Tests**:
- Transaction Form Flow: creates new transaction (FAIL)
- Transaction Form Flow: validates transaction before submission (FAIL)
- Transaction Form Flow: saves draft to localStorage (FAIL)
- Transaction Form Flow: restores draft from localStorage (FAIL)
- Transaction Form Flow: clears draft after submission (FAIL)
- Budget Form Flow: creates budget with validation (FAIL)
- Budget Form Flow: validates endDate > startDate (FAIL)
- Goal Form Flow: creates goal with validation (FAIL)
- Goal Form Flow: validates currentAmount ≤ targetAmount (FAIL)

**Root Cause**: Missing `handleSubmit` from `useForm()` hook context

**Solution**:
```typescript
// Current (BROKEN)
const { handleSubmit } = useFormContext(); // Returns undefined

// Fixed
const methods = useForm();
const { handleSubmit } = methods; // Properly destructure
```

**Effort**: 4-6 hours (fix all 9 tests)

#### 2.2 Hook Integration (16 failures)

**Error Pattern**: Test timeouts (5000ms) or missing functions

**Affected Tests**:
- `useDebounce`: updates immediately when delay is 0 (FAIL)
- `useFormWithAutoSave`: auto-saves after debounce (TIMEOUT)
- `useFormWithAutoSave`: saves draft to localStorage (TIMEOUT)
- `useFormWithAutoSave`: restores draft from localStorage (FAIL)
- `useFormWithAutoSave`: clears draft after save (FAIL)
- `useFormWithAutoSave`: sets isSaving state (FAIL)
- `useFormWithAutoSave`: prevents save when validation fails (FAIL)
- `useFormWithAutoSave`: shows unsaved changes warning (FAIL)
- `useOptimizedCalculations`: All 7 tests fail (not a function)
- Hook Integration: combines useDebounce with useFormWithAutoSave (TIMEOUT)

**Root Cause**: Multiple issues:
1. `useOptimizedCalculations` not exported correctly
2. Async timing issues with `act()` and `waitFor()`
3. Mock timer configuration

**Solution**:
1. Fix exports in `hooks/useOptimizedCalculations.tsx`
2. Increase test timeouts for async operations
3. Use `vi.useFakeTimers()` for debounce tests

**Effort**: 1-2 days

#### 2.3 Date/Formatting Tests (6 failures)

**Error Pattern**: Date off-by-one errors (timezone issues)

**Examples**:
- `formatDate`: expected '2025-01-15' got '2025-01-14'
- `formatDate`: expected 'Jan 15, 2025' got 'Jan 14, 2025'

**Root Cause**: UTC vs local timezone conversion

**Solution**:
```typescript
// Use fixed timezone in tests
beforeAll(() => {
  vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
});
```

**Effort**: 2-3 hours

#### 2.4 Validation Tests (24 failures)

**Error Pattern**: HTML sanitization failures + missing functions

**Examples**:
- `sanitizeInput`: expected 'alert("xss")Hello' got 'scriptalert("xss")/scriptHello'
- `validateDebt`: function not exported

**Root Cause**:
1. HTML sanitization regex too lenient
2. Missing `validateDebt` export from `utils/validation.ts`

**Solution**:
1. Update sanitization to use DOMPurify or stricter regex
2. Export `validateDebt` function

**Effort**: 4-6 hours

#### 2.5 Shift Validation Tests (4 failures)

**Error Pattern**: Overlap detection logic errors

**Solution**: Review shift overlap algorithm in `utils/validation.ts`

**Effort**: 2-3 hours

### Task Breakdown

| Sub-Task | Estimated Time | Priority |
|----------|---------------|----------|
| 2.1 Form Flow fixes | 4-6 hours | HIGH |
| 2.2 Hook Integration | 1-2 days | HIGH |
| 2.3 Date/Formatting | 2-3 hours | MEDIUM |
| 2.4 Validation fixes | 4-6 hours | MEDIUM |
| 2.5 Shift Validation | 2-3 hours | LOW |
| **TOTAL** | **3-5 days** | - |

---

## Success Criteria (Overall)

### Phase 1 (Post-Deployment)
- [ ] **Task 1 Complete**: Phase 3 migration tests 100% passing (36/36)
- [ ] **No Regressions**: Existing 461 tests still passing
- [ ] **Documentation Updated**: Test setup guide reflects new mock strategy

### Phase 2 (Backlog)
- [ ] **Task 2 Complete**: Pre-existing test failures fixed
- [ ] **Total Test Pass Rate**: ≥95% (370+/388 tests)
- [ ] **CI/CD Integration**: All tests pass in continuous integration
- [ ] **Test Execution Time**: <30 seconds for full suite

---

## Timeline

```
Week 1 (Post-Production):
  Day 1-2: Task 1 (Phase 3 mock fixes)
  Day 3: Validation and documentation

Week 2-3 (Backlog):
  Day 1-2: Task 2.1 + 2.2 (Form/Hook fixes)
  Day 3: Task 2.3 + 2.4 (Date/Validation fixes)
  Day 4: Task 2.5 (Shift validation)
  Day 5: Regression testing + documentation
```

---

## Resources

### Documentation
- Vitest Testing Library: https://vitest.dev/
- Testing Library React: https://testing-library.com/react
- Happy-dom vs jsdom: https://github.com/capricorn86/happy-dom/wiki/Comparison

### Key Files
- `tests/utils/storageMigration.test.ts` - Phase 3 migration tests
- `tests/integration/FormFlow.test.jsx` - Form flow tests
- `tests/integration/Hooks.test.jsx` - Hook integration tests
- `utils/validation.test.tsx` - Validation tests
- `vitest.config.js` - Test configuration

### Team Contacts
- **Test Infrastructure**: TBD
- **Phase 3 Lead**: Development Team
- **CI/CD Support**: DevOps Team

---

**Document Version**: 1.0  
**Created**: October 9, 2025  
**Status**: Ready for Assignment
