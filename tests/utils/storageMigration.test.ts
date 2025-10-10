/**
 * @fileoverview Tests for storage migration utility
 * @description Validates migration logic for plaintext → encrypted storage
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  migrateKey,
  migrateToSecureStorage,
  migrateAllKeys,
  isMigrated,
  rollbackMigration,
  getMigrationRecommendations,
  createBackup,
  restoreBackup,
} from '../../utils/storageMigration';
import { secureStorage } from '../../utils/secureStorage';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Setup
beforeEach(() => {
  // Reset localStorage
  localStorageMock.clear();
  
  // Mock window.localStorage
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  // Clear any mocks
  vi.clearAllMocks();
});

// ============================================================================
// SINGLE KEY MIGRATION TESTS
// ============================================================================

describe('migrateKey', () => {
  test('migrates plaintext key to encrypted storage', async () => {
    // Setup: Add plaintext data
    localStorage.setItem('test_key', 'test_value');
    
    // Migrate
    const result = await migrateKey('test_key', { 
      encrypt: true,
      clearPlaintext: true 
    });
    
    // Verify
    expect(result.success).toBe(true);
    expect(result.preserved).toBe(false);
    
    // Plaintext should be removed
    expect(localStorage.getItem('test_key')).toBeNull();
    
    // Encrypted data should exist
    const decrypted = await secureStorage.get('test_key');
    expect(decrypted).toBe('test_value');
  });

  test('migrates JSON data correctly', async () => {
    // Setup: Add JSON data
    const userData = { id: 1, name: 'John', email: 'john@example.com' };
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Migrate
    const result = await migrateKey('user_data', { encrypt: true });
    
    // Verify
    expect(result.success).toBe(true);
    
    const decrypted = await secureStorage.get('user_data');
    expect(decrypted).toEqual(userData);
  });

  test('preserves original data on migration failure', async () => {
    // Setup
    localStorage.setItem('test_key', 'test_value');
    
    // Mock secureStorage.set to fail
    vi.spyOn(secureStorage, 'set').mockRejectedValueOnce(new Error('Write failed'));
    
    // Migrate
    const result = await migrateKey('test_key', { 
      encrypt: true,
      preserveOnError: true 
    });
    
    // Verify
    expect(result.success).toBe(false);
    expect(result.error).toContain('Write failed');
    expect(result.preserved).toBe(true);
    
    // Original plaintext should still exist
    expect(localStorage.getItem('test_key')).toBe('test_value');
  });

  test('skips migration for non-existent keys', async () => {
    const result = await migrateKey('nonexistent_key', { encrypt: true });
    
    expect(result.success).toBe(true);
    expect(result.error).toBe('Key does not exist');
  });

  test('applies expiration during migration', async () => {
    localStorage.setItem('temp_data', 'temporary');
    
    const result = await migrateKey('temp_data', {
      encrypt: true,
      expiresIn: 1000, // 1 second
    });
    
    expect(result.success).toBe(true);
    
    // Data should exist immediately
    const immediate = await secureStorage.get('temp_data');
    expect(immediate).toBe('temporary');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Data should be expired
    const expired = await secureStorage.get('temp_data');
    expect(expired).toBeNull();
  });

  test('uses namespace during migration', async () => {
    localStorage.setItem('data', 'user1_data');
    
    const result = await migrateKey('data', {
      encrypt: true,
      namespace: 'user:123',
    });
    
    expect(result.success).toBe(true);
    
    // Data should be in namespace
    const namespaced = secureStorage.namespace('user:123');
    const value = await namespaced.get('data');
    expect(value).toBe('user1_data');
  });

  test('preserves plaintext when clearPlaintext is false', async () => {
    localStorage.setItem('keep_plaintext', 'value');
    
    const result = await migrateKey('keep_plaintext', {
      encrypt: true,
      clearPlaintext: false,
    });
    
    expect(result.success).toBe(true);
    
    // Both should exist
    expect(localStorage.getItem('keep_plaintext')).toBe('value');
    const encrypted = await secureStorage.get('keep_plaintext');
    expect(encrypted).toBe('value');
  });
});

// ============================================================================
// BATCH MIGRATION TESTS
// ============================================================================

describe('migrateToSecureStorage', () => {
  test('migrates multiple keys successfully', async () => {
    // Setup
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    localStorage.setItem('key3', 'value3');
    
    // Migrate
    const summary = await migrateToSecureStorage(
      ['key1', 'key2', 'key3'],
      { encrypt: true }
    );
    
    // Verify
    expect(summary.total).toBe(3);
    expect(summary.succeeded).toBe(3);
    expect(summary.failed).toBe(0);
    expect(summary.success).toBe(true);
    
    // All keys should be encrypted
    expect(await secureStorage.get('key1')).toBe('value1');
    expect(await secureStorage.get('key2')).toBe('value2');
    expect(await secureStorage.get('key3')).toBe('value3');
  });

  test('handles partial migration failures', async () => {
    // Setup
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    
    // Mock failure for key2
    let callCount = 0;
    vi.spyOn(secureStorage, 'set').mockImplementation(async (key, value) => {
      callCount++;
      if (key === 'key2') {
        throw new Error('Failed to write key2');
      }
      return; // Success for other keys
    });
    
    // Migrate
    const summary = await migrateToSecureStorage(
      ['key1', 'key2', 'key3'],
      { encrypt: true }
    );
    
    // Verify
    expect(summary.succeeded).toBeLessThan(3);
    expect(summary.failed).toBeGreaterThan(0);
    expect(summary.success).toBe(false);
    
    // Check individual results
    const key2Result = summary.results.find(r => r.key === 'key2');
    expect(key2Result?.success).toBe(false);
    expect(key2Result?.error).toContain('Failed to write key2');
  });

  test('migrates empty array without errors', async () => {
    const summary = await migrateToSecureStorage([], { encrypt: true });
    
    expect(summary.total).toBe(0);
    expect(summary.succeeded).toBe(0);
    expect(summary.failed).toBe(0);
    expect(summary.success).toBe(true);
  });
});

// ============================================================================
// PATTERN-BASED MIGRATION TESTS
// ============================================================================

describe('migrateAllKeys', () => {
  test('migrates keys matching prefix', async () => {
    // Setup
    localStorage.setItem('apex-finance:token', 'token123');
    localStorage.setItem('apex-finance:user', 'user_data');
    localStorage.setItem('other:data', 'other_data');
    
    // Migrate only apex-finance keys
    const summary = await migrateAllKeys('apex-finance:', { encrypt: true });
    
    // Verify
    expect(summary.total).toBe(2);
    expect(summary.succeeded).toBe(2);
    
    // apex-finance keys should be encrypted
    expect(await secureStorage.get('apex-finance:token')).toBe('token123');
    expect(await secureStorage.get('apex-finance:user')).toBe('user_data');
    
    // other:data should remain plaintext
    expect(localStorage.getItem('other:data')).toBe('other_data');
  });

  test('migrates all keys when prefix is empty', async () => {
    // Setup
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    localStorage.setItem('key3', 'value3');
    
    // Migrate all
    const summary = await migrateAllKeys('', { encrypt: true });
    
    // Verify - all keys migrated
    expect(summary.total).toBe(3);
    expect(summary.succeeded).toBe(3);
  });

  test('handles empty localStorage gracefully', async () => {
    const summary = await migrateAllKeys('prefix:', { encrypt: true });
    
    expect(summary.total).toBe(0);
    expect(summary.succeeded).toBe(0);
    expect(summary.success).toBe(true);
  });
});

// ============================================================================
// VERIFICATION TESTS
// ============================================================================

describe('isMigrated', () => {
  test('returns true for migrated keys', async () => {
    await secureStorage.set('migrated_key', 'value', { encrypt: true });
    
    const result = await isMigrated('migrated_key');
    expect(result).toBe(true);
  });

  test('returns false for non-migrated keys', async () => {
    const result = await isMigrated('non_existent_key');
    expect(result).toBe(false);
  });

  test('checks namespace correctly', async () => {
    const namespaced = secureStorage.namespace('test:ns');
    await namespaced.set('key', 'value');
    
    const inNamespace = await isMigrated('key', 'test:ns');
    const notInNamespace = await isMigrated('key');
    
    expect(inNamespace).toBe(true);
    expect(notInNamespace).toBe(false);
  });
});

// ============================================================================
// ROLLBACK TESTS
// ============================================================================

describe('rollbackMigration', () => {
  test('restores encrypted data to plaintext', async () => {
    // Setup: Encrypted data
    await secureStorage.set('encrypted_key', 'secret_value', { encrypt: true });
    
    // Rollback
    const success = await rollbackMigration('encrypted_key');
    
    // Verify
    expect(success).toBe(true);
    
    // Should be in plaintext localStorage
    expect(localStorage.getItem('encrypted_key')).toBe('secret_value');
    
    // Should be removed from secureStorage
    const encrypted = await secureStorage.get('encrypted_key');
    expect(encrypted).toBeNull();
  });

  test('handles JSON data during rollback', async () => {
    const userData = { id: 1, name: 'John' };
    await secureStorage.set('user', userData, { encrypt: true });
    
    const success = await rollbackMigration('user');
    
    expect(success).toBe(true);
    const plaintext = localStorage.getItem('user');
    expect(JSON.parse(plaintext!)).toEqual(userData);
  });

  test('returns false for non-existent keys', async () => {
    const success = await rollbackMigration('nonexistent');
    expect(success).toBe(false);
  });

  test('handles namespace in rollback', async () => {
    const namespaced = secureStorage.namespace('user:123');
    await namespaced.set('data', 'user_data', { encrypt: true });
    
    const success = await rollbackMigration('data', 'user:123');
    
    expect(success).toBe(true);
    expect(localStorage.getItem('data')).toBe('user_data');
  });
});

// ============================================================================
// RECOMMENDATION TESTS
// ============================================================================

describe('getMigrationRecommendations', () => {
  test('identifies critical auth tokens', () => {
    localStorage.setItem('auth_token', 'token123');
    localStorage.setItem('apikey', 'key456');
    localStorage.setItem('password', 'pass789');
    
    const recommendations = getMigrationRecommendations();
    
    const critical = recommendations.filter(r => r.priority === 'critical');
    expect(critical.length).toBeGreaterThanOrEqual(3);
    
    // All critical should have encryption enabled
    critical.forEach(rec => {
      expect(rec.options.encrypt).toBe(true);
      expect(rec.options.expiresIn).toBeDefined();
    });
  });

  test('identifies important user data', () => {
    localStorage.setItem('user_profile', '{}');
    localStorage.setItem('financial_data', '{}');
    localStorage.setItem('budget_allocations', '{}');
    
    const recommendations = getMigrationRecommendations();
    
    const important = recommendations.filter(r => r.priority === 'important');
    expect(important.length).toBeGreaterThanOrEqual(3);
    
    // All important should have encryption
    important.forEach(rec => {
      expect(rec.options.encrypt).toBe(true);
    });
  });

  test('identifies low priority UI state', () => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('ui-sidebar-collapsed', 'true');
    localStorage.setItem('cache-timestamp', '12345');
    
    const recommendations = getMigrationRecommendations();
    
    const low = recommendations.filter(r => r.priority === 'low');
    expect(low.length).toBeGreaterThanOrEqual(3);
    
    // Low priority might not need encryption
    low.forEach(rec => {
      expect(rec.options.encrypt).toBe(false);
    });
  });

  test('sorts by priority (critical > important > low)', () => {
    localStorage.setItem('auth_token', 'critical');
    localStorage.setItem('user_data', 'important');
    localStorage.setItem('theme', 'low');
    
    const recommendations = getMigrationRecommendations();
    
    // Verify order
    let lastPriority = 0;
    const priorityMap = { critical: 0, important: 1, low: 2 };
    
    recommendations.forEach(rec => {
      const currentPriority = priorityMap[rec.priority];
      expect(currentPriority).toBeGreaterThanOrEqual(lastPriority);
      lastPriority = currentPriority;
    });
  });

  test('returns empty array for empty localStorage', () => {
    const recommendations = getMigrationRecommendations();
    expect(recommendations).toEqual([]);
  });
});

// ============================================================================
// BACKUP/RESTORE TESTS
// ============================================================================

describe('createBackup', () => {
  test('creates backup of all localStorage data', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    localStorage.setItem('key3', JSON.stringify({ nested: 'object' }));
    
    const backup = createBackup();
    const parsed = JSON.parse(backup);
    
    expect(parsed.key1).toBe('value1');
    expect(parsed.key2).toBe('value2');
    expect(parsed.key3).toBe(JSON.stringify({ nested: 'object' }));
  });

  test('returns empty object for empty localStorage', () => {
    const backup = createBackup();
    expect(backup).toBe('{}');
  });
});

describe('restoreBackup', () => {
  test('restores all data from backup', async () => {
    const backup = JSON.stringify({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
    
    const success = await restoreBackup(backup);
    
    expect(success).toBe(true);
    expect(localStorage.getItem('key1')).toBe('value1');
    expect(localStorage.getItem('key2')).toBe('value2');
    expect(localStorage.getItem('key3')).toBe('value3');
  });

  test('clears existing data before restore', async () => {
    localStorage.setItem('old_key', 'old_value');
    
    const backup = JSON.stringify({ new_key: 'new_value' });
    await restoreBackup(backup);
    
    expect(localStorage.getItem('old_key')).toBeNull();
    expect(localStorage.getItem('new_key')).toBe('new_value');
  });

  test('handles invalid JSON gracefully', async () => {
    const success = await restoreBackup('invalid json');
    expect(success).toBe(false);
  });

  test('handles empty backup', async () => {
    const success = await restoreBackup('{}');
    
    expect(success).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  test('handles corrupted localStorage data', async () => {
    localStorage.setItem('corrupted', '{invalid json}');
    
    const result = await migrateKey('corrupted', { encrypt: true });
    
    // Should treat as string if JSON parsing fails
    expect(result.success).toBe(true);
    const value = await secureStorage.get('corrupted');
    expect(value).toBe('{invalid json}');
  });

  test('handles very large data', async () => {
    const largeData = 'x'.repeat(1024 * 1024); // 1MB
    localStorage.setItem('large_data', largeData);
    
    const result = await migrateKey('large_data', { encrypt: true });
    
    expect(result.success).toBe(true);
    const decrypted = await secureStorage.get('large_data');
    expect(decrypted).toBe(largeData);
  });

  test('handles special characters in keys', async () => {
    const specialKey = 'key:with:colons';
    localStorage.setItem(specialKey, 'value');
    
    const result = await migrateKey(specialKey, { encrypt: true });
    
    expect(result.success).toBe(true);
    const value = await secureStorage.get(specialKey);
    expect(value).toBe('value');
  });

  test('handles null and undefined values', async () => {
    localStorage.setItem('null_value', 'null');
    localStorage.setItem('undefined_value', 'undefined');
    
    const result1 = await migrateKey('null_value', { encrypt: true });
    const result2 = await migrateKey('undefined_value', { encrypt: true });
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });

  test('concurrent migrations don\'t interfere', async () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    localStorage.setItem('key3', 'value3');
    
    // Run migrations concurrently
    const results = await Promise.all([
      migrateKey('key1', { encrypt: true }),
      migrateKey('key2', { encrypt: true }),
      migrateKey('key3', { encrypt: true }),
    ]);
    
    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});
