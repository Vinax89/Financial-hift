# 🔒 Sentry Error Tracking Setup Guide

## Overview

Sentry is now integrated into Financial-hift for production error tracking and monitoring. This guide will help you set up and configure Sentry.

## ✅ What's Already Done

- ✅ Sentry SDK installed (`@sentry/react`)
- ✅ Initialization file created (`utils/sentry.js`)
- ✅ Integrated with centralized logger (`utils/logger.js`)
- ✅ ErrorBoundary added to `main.jsx`
- ✅ Automatic error capturing in production
- ✅ Privacy filters for sensitive data (passwords, tokens, API keys)

## 🚀 Setup Steps

### 1. Create a Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up for a free account (includes 5,000 errors/month)
3. Create a new project:
   - Platform: **React**
   - Project Name: **financial-hift**

### 2. Get Your DSN

After creating the project, Sentry will show you a DSN (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Add your Sentry DSN to `.env`:
   ```env
   VITE_SENTRY_DSN=https://your-dsn-here@o123456.ingest.sentry.io/7890123
   VITE_APP_VERSION=1.0.0
   ```

3. **Important**: Add `.env` to `.gitignore` (should already be there)

### 4. Update `.gitignore`

Make sure your `.gitignore` includes:
```
.env
.env.local
.env.production
```

## 📊 Features Enabled

### Automatic Error Tracking
- All uncaught errors are automatically sent to Sentry
- React component errors caught by ErrorBoundary
- Network errors from API calls
- Console errors (only in production)

### Privacy & Security
- Passwords automatically redacted
- API tokens masked
- Sensitive data filtered before sending
- User emails can be tracked (optional)

### Performance Monitoring
- 10% of transactions sampled in production
- React component render times
- API call performance
- Page load metrics

### Session Replay (Optional)
- 10% of normal sessions recorded
- 100% of error sessions recorded
- All text and media masked for privacy

## 🔧 Usage in Code

### Capture Custom Errors
```javascript
import { captureException, captureMessage } from '@/utils/sentry.js';

try {
  // Your code
} catch (error) {
  captureException(error, {
    feature: 'Transactions',
    action: 'create',
  });
}
```

### Add User Context
```javascript
import { setUser, clearUser } from '@/utils/sentry.js';

// After user logs in
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// After user logs out
clearUser();
```

### Add Debugging Breadcrumbs
```javascript
import { addBreadcrumb } from '@/utils/sentry.js';

addBreadcrumb({
  category: 'transaction',
  message: 'User created new transaction',
  data: { amount: 50.00, category: 'groceries' },
  level: 'info',
});
```

### Show Feedback Dialog
```javascript
import { showReportDialog } from '@/utils/sentry.js';

// Let users report issues
showReportDialog();
```

## 🧪 Testing Sentry

### Test in Development
Sentry is disabled in development by default. To test:

1. Build production bundle:
   ```powershell
   npm run build
   ```

2. Preview production build:
   ```powershell
   npm run preview
   ```

3. Trigger an error to verify Sentry captures it

### Test Error Boundary
Add a test button that throws an error:
```javascript
<button onClick={() => { throw new Error('Test error'); }}>
  Test Error
</button>
```

## 📈 Monitoring in Sentry Dashboard

### View Errors
1. Go to https://sentry.io/
2. Select your **financial-hift** project
3. View the **Issues** tab

### Key Metrics
- **Error Rate**: How many errors per session
- **Affected Users**: How many users hit errors
- **Top Issues**: Most common errors
- **Releases**: Track errors by version

### Alerts (Recommended)
Set up alerts in Sentry:
1. **Issue Alerts**: Notify on new errors
2. **Metric Alerts**: Alert on error spikes
3. **Email/Slack**: Get notified immediately

## 🔒 Privacy & Compliance

### Data Collected
- Error messages and stack traces
- User actions leading to errors (breadcrumbs)
- Browser/device information
- Performance metrics

### Data NOT Collected
- Passwords (automatically redacted)
- API tokens (automatically masked)
- Credit card numbers (masked)
- Full page content (only errors)

### User Privacy
- Users are notified via error dialog (production only)
- No PII sent without explicit user identification
- Session replays mask all text/media by default

## 💰 Cost & Limits

### Free Plan
- 5,000 errors/month
- 500 replays/month
- 30-day data retention
- 1 project

### Paid Plans (if needed)
- **Developer**: $26/month (50k errors)
- **Team**: $80/month (100k errors)
- **Business**: $199/month (500k errors)

For most apps, the **free plan is sufficient**.

## ⚙️ Configuration Options

### Disable Session Replay
If you don't need replays, remove from `utils/sentry.js`:
```javascript
// Remove or comment out:
Sentry.replayIntegration({...}),
```

### Adjust Sample Rates
In `utils/sentry.js`:
```javascript
tracesSampleRate: 0.1,  // 10% performance monitoring
sessionSampleRate: 0.1, // 10% session replay
```

### Ignore More Errors
Add to `ignoreErrors` array:
```javascript
ignoreErrors: [
  'Custom error to ignore',
  /regex pattern to ignore/,
],
```

## 🐛 Troubleshooting

### Errors Not Appearing in Sentry
1. Check `.env` has correct `VITE_SENTRY_DSN`
2. Verify running production build: `npm run build && npm run preview`
3. Check browser console for Sentry initialization message
4. Verify DSN is correct in Sentry project settings

### Too Many Errors
1. Increase `ignoreErrors` filters
2. Reduce `tracesSampleRate` (e.g., 0.05 for 5%)
3. Set up error filtering in Sentry dashboard

### Performance Impact
Sentry has minimal impact (<1% performance overhead). If concerned:
1. Reduce `tracesSampleRate` to 0.05
2. Disable session replay
3. Use `beforeSend` to filter more aggressively

## 📚 Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

## 🎯 Next Steps

1. [ ] Create Sentry account
2. [ ] Get DSN and add to `.env`
3. [ ] Test with production build
4. [ ] Set up email alerts
5. [ ] Monitor dashboard for first week
6. [ ] Configure user context after login
7. [ ] Add custom breadcrumbs to critical flows

---

**Sentry Status**: ✅ Integrated & Ready (DSN configuration required)
