# 🔐 Form Encryption Migration Guide

## Overview

**Date**: October 9, 2025  
**Phase**: Phase 2, Task 2 - Secure Storage Integration (45% complete)  
**Status**: Infrastructure ready - forms ready to enable encryption

---

## ✅ What's Been Completed

### Core Infrastructure (100% Complete)

1. **`hooks/useFormWithAutoSave.ts`** - Migrated to secure storage
   - ✅ All 4 `localStorage` calls replaced with `secureStorage`
   - ✅ Added `encryptDrafts` option (default: false, backward compatible)
   - ✅ Added `draftExpiresIn` option (default: 24 hours)
   - ✅ Async draft operations (`saveDraft`, `loadDraft`, `clearDraft`)
   - ✅ Automatic draft loading on mount
   - ✅ Full TypeScript type safety
   - ✅ Comprehensive JSDoc documentation

2. **Security Features Available**:
   - AES-GCM 256-bit encryption for form drafts
   - Automatic expiration (default: 24h, configurable)
   - Cross-tab synchronization support
   - Backward compatible (encryption opt-in)

---

## 📋 Forms Ready for Encryption

### 🔴 HIGH PRIORITY (Enable Encryption Immediately)

#### 1. Transaction Forms
**Files to Check**: 
- `transactions/` directory
- Any form with `amount`, `description`, `category`, `account` fields

**Sensitivity**: 🔴 HIGH (financial data, spending habits)

**Recommended Config**:
```typescript
const { methods } = useFormWithAutoSave({
  schema: transactionSchema,
  onSave: saveTransactionDraft,
  storageKey: 'transaction-draft',
  encryptDrafts: true, // 🔒 ENABLE
  draftExpiresIn: 43200000, // 12 hours (shorter for financial data)
});
```

**Why Encrypt**: 
- Contains financial amounts
- Reveals spending patterns
- May include sensitive merchant names
- PII in description field

---

#### 2. Budget Forms
**File**: `budget/BudgetForm.tsx`

**Sensitivity**: 🔴 HIGH (financial planning data)

**Recommended Config**:
```typescript
const { methods } = useFormWithAutoSave({
  schema: budgetSchema,
  onSave: saveBudgetDraft,
  storageKey: 'budget-draft',
  encryptDrafts: true, // 🔒 ENABLE
  draftExpiresIn: 86400000, // 24 hours
});
```

**Why Encrypt**:
- Contains budget amounts
- Reveals financial priorities
- May include income information
- Planning data is sensitive

---

#### 3. Debt Forms  
**File**: `debt/DebtForm.tsx`

**Sensitivity**: 🔴 HIGH (financial obligations)

**Recommended Config**:
```typescript
const { methods } = useFormWithAutoSave({
  schema: debtSchema,
  onSave: saveDebtDraft,
  storageKey: 'debt-draft',
  encryptDrafts: true, // 🔒 ENABLE
  draftExpiresIn: 86400000, // 24 hours
});
```

**Why Encrypt**:
- Contains debt amounts
- Interest rates (financial terms)
- Lender information
- Highly sensitive financial data

---

#### 4. Goal Forms
**File**: `goals/GoalForm.tsx`

**Sensitivity**: 🟡 MEDIUM (financial aspirations, less sensitive than debt)

**Recommended Config**:
```typescript
const { methods } = useFormWithAutoSave({
  schema: goalSchema,
  onSave: saveGoalDraft,
  storageKey: 'goal-draft',
  encryptDrafts: true, // 🔒 ENABLE (recommended)
  draftExpiresIn: 86400000, // 24 hours
});
```

**Why Encrypt**:
- Contains target amounts
- May reveal financial goals
- Less critical than debt/budget but still sensitive

---

### 🟢 LOW PRIORITY (Encryption Optional)

#### 5. Settings/Preferences Forms
**Sensitivity**: 🟢 LOW (unless contains PII)

**Recommended Config**:
```typescript
const { methods } = useFormWithAutoSave({
  schema: settingsSchema,
  onSave: saveSettingsDraft,
  storageKey: 'settings-draft',
  encryptDrafts: false, // Only enable if form has email/phone
});
```

**When to Encrypt**: Only if form contains:
- Email addresses
- Phone numbers
- Full names
- Addresses

---

## 🚀 Migration Steps

### Step 1: Identify Form Usage

Search for forms currently using the old hook pattern:

```bash
# PowerShell
Select-String -Path "budget/BudgetForm.tsx","debt/DebtForm.tsx","goals/GoalForm.tsx" -Pattern "useFormWithAutoSave"
```

---

### Step 2: Update Form Imports (No Change Required)

The hook signature is backward compatible. Existing imports work as-is:

```typescript
import { useFormWithAutoSave } from '@/hooks/useFormWithAutoSave';
```

---

### Step 3: Add Encryption Option

**BEFORE** (Current - plaintext drafts):
```typescript
const { methods, isSaving, lastSaved } = useFormWithAutoSave({
  schema: transactionSchema,
  onSave: saveTransactionDraft,
  storageKey: 'transaction-draft',
  autoSaveDelay: 1000,
});
```

**AFTER** (Encrypted drafts):
```typescript
const { methods, isSaving, lastSaved } = useFormWithAutoSave({
  schema: transactionSchema,
  onSave: saveTransactionDraft,
  storageKey: 'transaction-draft',
  autoSaveDelay: 1000,
  encryptDrafts: true, // 🔒 ADD THIS LINE
  draftExpiresIn: 43200000, // 🔒 ADD THIS LINE (12 hours for financial data)
});
```

---

### Step 4: Update Async Operations (If Called Directly)

If your form manually calls `saveDraft`, `loadDraft`, or `clearDraft`, add `await`:

**BEFORE**:
```typescript
const handleClear = () => {
  clearDraft();
  reset();
};
```

**AFTER**:
```typescript
const handleClear = async () => {
  await clearDraft();
  reset();
};
```

**Note**: Most forms don't call these manually - auto-save handles it automatically!

---

### Step 5: Test Encryption

1. **Open form** in browser
2. **Fill in some data** and wait for auto-save
3. **Open DevTools** → Application → Local Storage
4. **Look for your storage key** (e.g., `transaction-draft`)
5. **Verify encrypted**:
   - ✅ Should see: `{"encrypted":"base64string...","iv":"...","expiresAt":...}`
   - ❌ Should NOT see: Plain JSON with your form data

---

## 📊 Migration Checklist

### High Priority Forms (🔴 Enable Encryption)

- [ ] `budget/BudgetForm.tsx`
  - Current status: Unknown (needs investigation)
  - Action: Add `encryptDrafts: true`
  - Expiration: 24h

- [ ] `debt/DebtForm.tsx`
  - Current status: Unknown (needs investigation)
  - Action: Add `encryptDrafts: true`
  - Expiration: 24h

- [ ] `goals/GoalForm.tsx`
  - Current status: Unknown (needs investigation)
  - Action: Add `encryptDrafts: true`
  - Expiration: 24h

- [ ] Transaction forms (search `transactions/` directory)
  - Current status: Unknown (needs discovery)
  - Action: Add `encryptDrafts: true`
  - Expiration: 12h (more sensitive)

---

## 🔍 Discovery Commands

### Find All Forms Using useFormWithAutoSave

```powershell
# PowerShell
Select-String -Path "**/*.tsx","**/*.jsx" -Pattern "useFormWithAutoSave" -Exclude "node_modules","docs","tests"
```

### Find Forms with Financial Data

```powershell
# Search for amount fields
Select-String -Path "**/*Form*.tsx" -Pattern "amount|balance|payment"
```

### Find Forms with PII

```powershell
# Search for personal data
Select-String -Path "**/*Form*.tsx" -Pattern "email|name|phone|address"
```

---

## 🎯 Success Criteria

### Phase 2, Task 2 Complete When:

- ✅ All financial forms use `encryptDrafts: true`
- ✅ All form drafts expire appropriately
- ✅ No plaintext financial data in localStorage
- ✅ All forms tested with encryption enabled
- ✅ Zero TypeScript errors
- ✅ Documentation updated

---

## 📈 Current Progress

**Infrastructure**: 100% ✅  
**Forms Migrated**: 0/4 high-priority forms (0%)  
**Estimated Time**: 30-45 minutes per form (2-3 hours total)

**Next Actions**:
1. Investigate `BudgetForm.tsx` for `useFormWithAutoSave` usage
2. Enable encryption if found
3. Repeat for `DebtForm.tsx`, `GoalForm.tsx`
4. Search for transaction forms
5. Test all migrations

---

## 💡 Best Practices

### 1. Encryption Defaults

```typescript
// 🔴 HIGH: Financial data (debts, budgets, transactions)
encryptDrafts: true
draftExpiresIn: 43200000 // 12 hours

// 🟡 MEDIUM: Goals, preferences with PII
encryptDrafts: true
draftExpiresIn: 86400000 // 24 hours

// 🟢 LOW: UI preferences, theme settings
encryptDrafts: false
draftExpiresIn: 604800000 // 7 days
```

---

### 2. Storage Keys

Use unique, namespaced keys:

```typescript
// ✅ GOOD
storageKey: `transaction-draft-${userId}`
storageKey: `budget-edit-${budgetId}`

// ❌ BAD
storageKey: 'draft'
storageKey: 'form-data'
```

---

### 3. Expiration Times

Shorter expiration = higher security:

```typescript
// Financial forms (12h - balance security vs UX)
draftExpiresIn: 43200000

// General forms (24h - good balance)
draftExpiresIn: 86400000

// Long forms (7d - convenience)
draftExpiresIn: 604800000
```

---

## 🔗 Related Documentation

- **`SECURE_STORAGE_HOOKS_GUIDE.md`** - Complete API reference
- **`SECURE_STORAGE_IMPLEMENTATION.md`** - Migration progress tracking
- **`FORM_STATE_MANAGEMENT_GUIDE.md`** - Form best practices
- **`hooks/useFormWithAutoSave.ts`** - Source code with JSDoc

---

## ❓ FAQ

### Q: Will enabling encryption break existing drafts?

**A**: No! The hook automatically handles both encrypted and unencrypted drafts. When you enable encryption, new drafts will be encrypted, but old plaintext drafts can still be read.

---

### Q: What if I forget to add `encryptDrafts: true`?

**A**: The form will continue working normally with plaintext drafts (current behavior). No breaking changes! However, sensitive data will remain unencrypted in localStorage.

---

### Q: Does encryption slow down the form?

**A**: Minimal impact. Encryption/decryption happens asynchronously and is debounced with auto-save. Users won't notice any performance difference.

---

### Q: Can I test encryption in development?

**A**: Yes! Encryption works identically in development and production. Just enable it and check localStorage in DevTools.

---

### Q: What if I need to change the encryption key?

**A**: The encryption key is automatically managed per-session. Users don't need to manage keys. Each browser session gets a new encryption key.

---

## 🚨 Security Reminders

1. **Always encrypt financial data** (amounts, balances, debts)
2. **Always encrypt PII** (names, emails, phone numbers)
3. **Use shorter expiration** for more sensitive data
4. **Test in DevTools** to verify encryption is working
5. **Document encryption decisions** in code comments

---

**Last Updated**: October 9, 2025  
**Status**: Ready for form migrations 🚀
