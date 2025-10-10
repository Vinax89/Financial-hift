# Storage Migration Guide

**Date**: October 9, 2025  
**Version**: 2.0 (Phase 3 - Auto-Migration)

---

## 📋 Overview

This guide explains how to migrate from plaintext `localStorage` to encrypted `secureStorage` in Financial-hift. As of Phase 3, most migrations happen **automatically**, but this guide provides details for manual migrations and troubleshooting.

---

## 🎯 What's Being Migrated?

### Automatically Migrated (Phase 3) ✨

These data types are **automatically encrypted** when you use the app:

| Data Type | Hook/Component | Auto-Migration |
|-----------|----------------|----------------|
| Authentication tokens | `useLocalStorage(..., {encrypt:true})` | ✅ Yes |
| User profile data | `useLocalStorage(..., {encrypt:true})` | ✅ Yes |
| Financial snapshots | `useFinancialData` hook | ✅ Yes |
| Budget allocations | `EnvelopeBudgeting` | ✅ Yes |
| Form drafts | `useSecureFormStorage` | ✅ Yes |

**How it works**: When you first access data with `encrypt: true`, the hook automatically:
1. Checks for existing plaintext data
2. Encrypts it using AES-GCM 256-bit encryption
3. Stores the encrypted version
4. Deletes the plaintext version
5. Logs migration (dev mode only)

### Not Encrypted (By Design)

These remain in plaintext because they're non-sensitive:

| Data Type | Location | Reason |
|-----------|----------|--------|
| Dashboard tab preference | `pages/Dashboard.tsx` | UI state only |
| Theme preference | User settings | Public preference |
| UI layout state | Various components | Non-sensitive |

---

## 🚀 Migration Methods

### Method 1: Automatic Migration (Recommended) ✨

**When to use**: You're already using the app and want to upgrade to encrypted storage

**Steps**:
1. **Update your code** to use encryption options:
   ```typescript
   // Before (plaintext)
   const [userData] = useLocalStorage('user_data', {});
   
   // After (auto-migrates and encrypts)
   const [userData] = useLocalStorage('user_data', {}, { 
     encrypt: true,
     expiresIn: 86400000 // 24 hours
   });
   ```

2. **Refresh the app** - Migration happens automatically on first render
3. **Verify migration** - Check browser console (dev mode) for:
   ```
   🔒 Auto-migrated "user_data" to encrypted storage
   ```

That's it! Your data is now encrypted.

### Method 2: Batch Migration (For Many Keys)

**When to use**: You have multiple keys to migrate at once

**Steps**:

1. **Import migration utility**:
   ```typescript
   import { migrateToSecureStorage } from '@/utils/storageMigration';
   ```

2. **Define keys to migrate**:
   ```typescript
   const keysToMigrate = [
     'auth_token',
     'refresh_token',
     'user_data',
     'financial_snapshot'
   ];
   ```

3. **Run migration**:
   ```typescript
   const summary = await migrateToSecureStorage(keysToMigrate, {
     encrypt: true,
     expiresIn: 3600000, // 1 hour
     clearPlaintext: true
   });
   
   console.log(`✅ Migrated ${summary.succeeded}/${summary.total} keys`);
   ```

### Method 3: Smart Migration (Automatic Recommendations)

**When to use**: Let the system analyze your data and suggest migrations

**Steps**:

1. **Get recommendations**:
   ```typescript
   import { getMigrationRecommendations } from '@/utils/storageMigration';
   
   const recommendations = getMigrationRecommendations();
   ```

2. **Review and apply**:
   ```typescript
   for (const rec of recommendations) {
     console.log(`${rec.priority} - ${rec.key}: ${rec.reason}`);
     
     // Apply migration
     await migrateKey(rec.key, rec.options);
   }
   ```

**Smart analysis** categorizes keys:
- 🔴 **CRITICAL**: `token`, `password`, `apikey`, `secret` → Encrypt with 1hr expiration
- 🟡 **IMPORTANT**: `user`, `financial`, `budget`, `transaction` → Encrypt, no expiration
- 🟢 **LOW**: `theme`, `preference`, `ui`, `cache` → No encryption needed

---

## 🔒 Security Best Practices

### Before Migration

1. **Create a backup**:
   ```typescript
   import { createBackup } from '@/utils/storageMigration';
   
   const backup = createBackup();
   // Store securely (NOT in localStorage!)
   console.log('Backup:', backup);
   ```

2. **Verify data integrity**:
   ```typescript
   // Check critical keys exist
   const token = localStorage.getItem('auth_token');
   if (!token) {
     console.warn('⚠️ No auth token found before migration');
   }
   ```

### During Migration

1. **Monitor console** for migration logs (dev mode):
   ```
   🔒 Auto-migrated "auth_token" to encrypted storage
   🔒 Auto-migrated "user_data" to encrypted storage
   ```

2. **Check migration results**:
   ```typescript
   const summary = await migrateToSecureStorage(keys, options);
   
   if (!summary.success) {
     console.error('Migration failed:', summary.results);
   }
   ```

---

## 🐛 Troubleshooting

### Issue: "Data not found after migration"

**Solution**:
```typescript
// Check if key was migrated
import { isMigrated } from '@/utils/storageMigration';

const migrated = await isMigrated('user_data');
if (!migrated) {
  // Re-run migration
  await migrateKey('user_data', { encrypt: true });
}
```

### Issue: "App crashes after migration"

**Solution**: Restore from backup
```typescript
import { restoreBackup } from '@/utils/storageMigration';

const backup = '...'; // Your backup JSON
await restoreBackup(backup);
```

### Issue: "Need to rollback migration"

⚠️ **WARNING**: This removes encryption!

```typescript
import { rollbackMigration } from '@/utils/storageMigration';

await rollbackMigration('user_data');
// ⚠️ SECURITY WARNING: Rolled back "user_data" to plaintext storage
```

---

## 📚 Code Examples

### Example 1: Migrate Auth Tokens on App Start

```typescript
// App.tsx or main.tsx
import { useEffect } from 'react';
import { migrateToSecureStorage } from '@/utils/storageMigration';

function App() {
  useEffect(() => {
    const migrateAuth = async () => {
      await migrateToSecureStorage(
        ['auth_token', 'refresh_token', 'user_data'],
        {
          encrypt: true,
          expiresIn: 3600000,
          clearPlaintext: true
        }
      );
    };
    
    migrateAuth().catch(console.error);
  }, []);
  
  return <YourApp />;
}
```

### Example 2: Progressive Migration

```typescript
// Migrate in batches to avoid blocking UI
import { migrateKey } from '@/utils/storageMigration';

async function progressiveMigration(keys: string[], options: MigrationOptions) {
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(key => migrateKey(key, options))
    );
    
    // Allow UI to update between batches
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

---

## 🎓 FAQ

**Q: Will migration delete my data?**  
A: No. Migration creates encrypted copies. Original plaintext is only deleted after successful verification.

**Q: What happens if migration fails?**  
A: Original plaintext data is preserved. You can retry migration.

**Q: Can I migrate back to plaintext?**  
A: Yes, but not recommended. Use `rollbackMigration()` for debugging only.

**Q: Does migration work in SSR?**  
A: No. Migration is skipped in SSR environments and runs client-side on first render.

**Q: How long does migration take?**  
A: Instant for auto-migration. Batch migrations take ~1-10ms per key.

---

## ✅ Migration Checklist

Before deploying to production:

- [ ] **Backup Strategy**: Implement user-facing backup/export feature
- [ ] **Migration Testing**: Test migration with real user data in staging
- [ ] **Rollback Plan**: Document rollback procedure for emergencies
- [ ] **Error Monitoring**: Add logging for migration failures
- [ ] **Performance Testing**: Verify migration doesn't block UI
- [ ] **Browser Compatibility**: Test in all supported browsers

---

**Last Updated**: October 9, 2025  
**Phase**: 3 (Auto-Migration Complete)

**See Also**:
- `SECURE_STORAGE_IMPLEMENTATION.md` - Technical details
- `SECURE_STORAGE_HOOKS_GUIDE.md` - Hook usage examples
- `utils/storageMigration.ts` - Migration source code
