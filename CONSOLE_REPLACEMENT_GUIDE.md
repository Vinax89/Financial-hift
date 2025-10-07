# Console Statement Replacement Script
# This script documents all console statements that need to be replaced with logger

## Summary of Console Statements Found:
## =====================================
## Total: 50+ instances across 30+ files
## Priority: Replace all before production deployment

## Files Updated in Current Session:
1. ✅ App.jsx - Already using logger
2. ✅ AuthGuard.jsx - Updated to use logWarn, logError
3. ⚠️ Remaining files need updates (listed below)

## HIGH PRIORITY FILES (Core functionality):

### hooks/useFinancialData.jsx (2 instances)
- Line 72: `console.error(\`Error loading ${entityType}:\`, error);`
  Replace with: `logError(\`Error loading ${entityType}\`, error, { component: 'useFinancialData', entityType });`

- Line 159: `console.warn(\`Failed to save ${entityType} to local storage:\`, storageError);`
  Replace with: `logWarn(\`Failed to save ${entityType} to local storage\`, storageError);`

### hooks/useGamification.jsx (3 instances)
- Line 75: `console.error('Failed to fetch game state:', error);`
  Replace with: `logError('Failed to fetch game state', error, { component: 'useGamification' });`

- Line 109: `console.error('Failed to award badge:', error);`
  Replace with: `logError('Failed to award badge', error, { component: 'useGamification' });`

- Line 159: `console.error('Failed to award XP:', error);`
  Replace with: `logError('Failed to award XP', error, { component: 'useGamification' });`

### hooks/useLocalStorage.jsx (3 instances)
- Line 33: `console.warn(\`Error reading localStorage key "${key}":\`, error);`
  Replace with: `logWarn(\`Error reading localStorage key "${key}"\`, error);`

- Line 47: `console.warn(\`Error setting localStorage key "${key}":\`, error);`
  Replace with: `logWarn(\`Error setting localStorage key "${key}"\`, error);`

- Line 65: `console.warn(\`Error parsing localStorage key "${key}":\`, error);`
  Replace with: `logWarn(\`Error parsing localStorage key "${key}"\`, error);`

## MEDIUM PRIORITY FILES (Dashboard components):

### dashboard/AutomationCenter.jsx (2 instances)
- Line 69: `console.error('Failed to load agent tasks:', error);`
- Line 158: `console.error('Health check failed:', error);`

### dashboard/BillNegotiator.jsx (1 instance)
- Line 67: `if (import.meta.env.DEV) console.error(error);`

### dashboard/DataManager.jsx (1 instance)
- Line 60: `if (import.meta.env.DEV) console.error("Export failed:", error);`

### dashboard/EnvelopeBudgeting.jsx (1 instance)
- Line 126: `console.error('AI optimization failed:', error);`

### dashboard/InvestmentTracker.jsx (1 instance)
- Line 141: `console.error(error);`

## MEDIUM PRIORITY FILES (Pages):

### pages/AIAdvisor.jsx (1 instance)
- Line 37: `console.error("Failed to initialize conversation", error);`

### pages/Agents.jsx (3 instances)
- Line 118: `console.error('Failed to load conversations:', error);`
- Line 154: `console.error('Failed to create conversation:', error);`
- Line 184: `console.error('Failed to send message:', error);`

### pages/Dashboard.jsx (1 instance)
- Line 258: `console.error("Failed to generate PDF report:", error);`

### pages/ShiftRules.jsx (1 instance)
- Line 35: `console.error('Failed to load shift rules:', error);`

### onboarding/OnboardingModal.jsx (1 instance)
- Line 46: `console.error("Failed to load user or paycheck settings:", error);`

### optimized/FastShiftForm.jsx (1 instance)
- Line 164: `console.error('Submit error:', error);`

## AUTOMATED REPLACEMENT INSTRUCTIONS:

For each file, add at the top:
```javascript
import { logError, logWarn, logInfo } from '@/utils/logger.js';
```

Then replace:
- `console.error(...)` → `logError(...)`
- `console.warn(...)` → `logWarn(...)`
- `console.log(...)` → `logInfo(...)` (if needed in dev)
- `if (import.meta.env.DEV) console.error(...)` → `logError(...)`

## DELETION CANDIDATES (Duplicate files):

1. hooks/useGamification_clean.jsx - DELETE (duplicate of useGamification.jsx)
2. hooks/useEntityQueries.jsx.new - DELETE (temporary file)
3. pages/index-optimized.jsx - DELETE IF NOT USED

## TESTING AFTER CHANGES:

1. Run dev server: `npm run dev`
2. Test error scenarios to ensure logging works
3. Check browser console (dev) - should see formatted logs
4. In production, errors should go to Sentry (not console)

## PRODUCTION DEPLOYMENT CHECKLIST:

- [ ] All console statements replaced with logger
- [ ] .env file created with actual credentials
- [ ] SKIP_AUTH set to false in .env
- [ ] Sentry DSN configured
- [ ] Test production build: `npm run build && npm run preview`
- [ ] Verify no console statements in production
- [ ] Deploy to staging first
- [ ] Test all features
- [ ] Monitor Sentry for errors
- [ ] Deploy to production

## REMAINING WORK ESTIMATE:

- Replace console statements: 2-3 hours
- Test all changes: 1 hour
- Create test files: 3-4 hours
- Documentation updates: 1 hour
- Total: ~7-9 hours to complete all recommendations

## STATUS:
✅ Logger utility exists and is functional
✅ AuthGuard.jsx updated
✅ App.jsx already using logger
✅ .env.example exists
⚠️ ~45 console statements remain to be replaced
⚠️ Duplicate files need deletion
⚠️ Test coverage needs improvement
