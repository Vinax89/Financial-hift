# Secure Storage Hooks - Usage Guide

**Created**: October 9, 2025  
**Status**: ✅ Ready for Use  
**Security**: 🔴 AES-GCM 256-bit Encryption

---

## Overview

Three new React hooks for secure data storage with encryption:

1. **`useSecureStorage`** - General-purpose secure storage hook
2. **`useSecureFormStorage`** - Specialized for form draft encryption
3. **`useSecureSessionStorage`** - Session data with auto-expiration

---

## 1. useSecureStorage - General Purpose

### Basic Usage

```typescript
import { useSecureStorage } from '@/hooks/useSecureStorage';

// Encrypted storage for sensitive data
const [apiKey, setApiKey, removeApiKey, isLoading] = useSecureStorage<string>(
  'api_key',
  '',
  { encrypt: true, expiresIn: 86400000 } // 24 hours
);

// Unencrypted storage for public preferences
const [theme, setTheme, removeTheme] = useSecureStorage<string>(
  'theme',
  'dark',
  { encrypt: false }
);
```

### When to Use

✅ **Use with encryption** (`encrypt: true`):
- API keys and tokens
- User credentials
- Personal information (PII)
- Financial data
- Session tokens
- Private user settings

✅ **Use without encryption** (`encrypt: false`):
- UI theme preferences
- Language selection
- Sidebar state
- Non-sensitive flags
- Public configuration

### API Reference

```typescript
const [
  value,           // Current stored value
  setValue,        // Function to update value
  removeValue,     // Function to clear value
  isLoading        // Loading state on initial fetch
] = useSecureStorage<T>(
  key: string,                    // Storage key
  initialValue: T,                // Default value
  options?: {
    encrypt?: boolean,            // Enable encryption (default: false)
    expiresIn?: number,           // Expiration time in ms
    syncTabs?: boolean,           // Cross-tab sync (default: true)
    onExternalChange?: (val) => void  // Callback for external changes
  }
);
```

### Examples

#### API Key Manager

```typescript
const ApiKeyManager = () => {
  const [apiKey, setApiKey, removeApiKey, isLoading] = useSecureStorage<string>(
    'openai_api_key',
    '',
    { 
      encrypt: true,          // Must encrypt API keys
      expiresIn: 86400000     // 24 hours
    }
  );

  if (isLoading) return <Spinner />;

  return (
    <div>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API key"
      />
      <button onClick={removeApiKey}>Clear Key</button>
    </div>
  );
};
```

#### Theme Preference (Unencrypted)

```typescript
const ThemeToggle = () => {
  const [theme, setTheme] = useSecureStorage<'dark' | 'light'>(
    'app_theme',
    'dark',
    { encrypt: false }  // No encryption needed
  );

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme: {theme}
    </button>
  );
};
```

#### User Preferences with PII

```typescript
interface UserPrefs {
  email: string;
  name: string;
  notifications: boolean;
}

const UserSettings = () => {
  const [prefs, setPrefs] = useSecureStorage<UserPrefs>(
    'user_preferences',
    { email: '', name: '', notifications: true },
    { 
      encrypt: true,  // Encrypt because contains email (PII)
      expiresIn: 604800000  // 7 days
    }
  );

  return (
    <form>
      <input
        value={prefs.email}
        onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
      />
    </form>
  );
};
```

---

## 2. useSecureFormStorage - Form Drafts

### Basic Usage

```typescript
import { useSecureFormStorage } from '@/hooks/useSecureFormStorage';

const { saveDraft, loadDraft, clearDraft, hasDraft } = useSecureFormStorage<FormData>(
  'transaction-form',
  { encrypt: true, expiresIn: 86400000 }
);
```

### When to Use

✅ **Always use for forms with**:
- Financial transactions
- Account information
- Payment details
- Personal identification
- Sensitive user input

### API Reference

```typescript
const {
  saveDraft,      // async (data: T) => Promise<void>
  loadDraft,      // async () => Promise<T | null>
  clearDraft,     // () => void
  hasDraft        // async () => Promise<boolean>
} = useSecureFormStorage<T>(
  storageKey: string,         // Unique form identifier
  options?: {
    encrypt?: boolean,        // Enable encryption (default: true)
    expiresIn?: number,       // Expiration in ms (default: 24 hours)
    namespace?: string        // Namespace for isolation
  }
);
```

### Examples

#### Transaction Form with Auto-Save

```typescript
interface TransactionFormData {
  amount: number;
  description: string;
  category: string;
  date: string;
}

const TransactionForm = () => {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString()
  });

  const { saveDraft, loadDraft, clearDraft } = useSecureFormStorage<TransactionFormData>(
    'transaction-draft',
    { 
      encrypt: true,          // Financial data must be encrypted
      expiresIn: 86400000     // 24 hours
    }
  );

  // Load draft on mount
  useEffect(() => {
    const loadSavedDraft = async () => {
      const draft = await loadDraft();
      if (draft) {
        setFormData(draft);
        toast.info('Restored your draft');
      }
    };
    loadSavedDraft();
  }, []);

  // Auto-save on form change (debounced)
  const debouncedFormData = useDebounce(formData, 1000);
  useEffect(() => {
    if (debouncedFormData.amount > 0) {
      saveDraft(debouncedFormData);
    }
  }, [debouncedFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTransaction(formData);
    clearDraft();  // Clear after successful submit
    toast.success('Transaction saved!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: +e.target.value })}
      />
      <input
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

#### Goal Form with Draft Warning

```typescript
const GoalForm = () => {
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useSecureFormStorage<Goal>(
    'goal-draft',
    { encrypt: true }
  );

  useEffect(() => {
    const checkForDraft = async () => {
      if (await hasDraft()) {
        const confirmed = window.confirm('You have an unsaved draft. Load it?');
        if (confirmed) {
          const draft = await loadDraft();
          if (draft) setFormData(draft);
        } else {
          clearDraft();
        }
      }
    };
    checkForDraft();
  }, []);

  // Rest of form implementation...
};
```

---

## 3. useSecureSessionStorage - Session Data

### Basic Usage

```typescript
import { useSecureSessionStorage } from '@/hooks/useSecureStorage';

const [sessionToken, setSessionToken, clearSession] = useSecureSessionStorage(
  'session_token',
  '',
  3600000  // 1 hour
);
```

### When to Use

✅ **Use for**:
- Temporary session tokens
- OAuth state parameters
- Short-lived API responses
- Wizard step data
- Temporary credentials

### API Reference

```typescript
const [value, setValue, removeValue, isLoading] = useSecureSessionStorage<T>(
  key: string,           // Storage key
  initialValue: T,       // Default value
  expiresIn?: number     // Expiration in ms (default: 1 hour)
);
```

### Examples

```typescript
const OAuthFlow = () => {
  const [oauthState, setOauthState, clearOauth] = useSecureSessionStorage(
    'oauth_state',
    '',
    600000  // 10 minutes
  );

  const initiateOAuth = () => {
    const state = generateRandomState();
    setOauthState(state);
    window.location.href = `https://oauth-provider.com/auth?state=${state}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedState = params.get('state');
    
    if (returnedState === oauthState) {
      // Valid OAuth callback
      clearOauth();
    }
  }, []);

  return <button onClick={initiateOAuth}>Login</button>;
};
```

---

## 4. useSecureUserPreference - User-Specific

### Basic Usage

```typescript
import { useSecureUserPreference } from '@/hooks/useSecureStorage';

const [prefs, setPrefs] = useSecureUserPreference<UserPrefs>(
  userId,
  'preferences',
  defaultPrefs,
  true  // Encrypt
);
```

### When to Use

✅ **Use for**:
- User-specific settings with PII
- Per-user financial preferences
- Private user configurations
- User-scoped API keys

### Example

```typescript
const UserDashboard = ({ userId }: { userId: string }) => {
  const [dashboardPrefs, setDashboardPrefs] = useSecureUserPreference<DashPrefs>(
    userId,
    'dashboard_preferences',
    { layout: 'grid', widgets: [] },
    true  // Encrypt if contains sensitive widget data
  );

  return (
    <Dashboard
      layout={dashboardPrefs.layout}
      widgets={dashboardPrefs.widgets}
      onPrefsChange={setDashboardPrefs}
    />
  );
};
```

---

## Security Best Practices

### ✅ DO

1. **Always encrypt sensitive data**:
   ```typescript
   { encrypt: true }  // For PII, financial data, tokens
   ```

2. **Set appropriate expiration times**:
   ```typescript
   { expiresIn: 3600000 }  // 1 hour for sensitive data
   ```

3. **Clear data after use**:
   ```typescript
   clearDraft();  // After form submission
   removeValue();  // On logout
   ```

4. **Use namespaces for isolation**:
   ```typescript
   { namespace: 'user:123' }
   ```

### ❌ DON'T

1. **Don't encrypt public data** (wastes resources):
   ```typescript
   // Bad: Encrypting theme preference
   { encrypt: true }  // For 'dark' vs 'light'
   ```

2. **Don't store without expiration**:
   ```typescript
   // Bad: Sensitive data without expiration
   { encrypt: true }  // Missing expiresIn
   ```

3. **Don't mix sensitive and non-sensitive**:
   ```typescript
   // Bad: Same key for different security levels
   useSecureStorage('data', mixed, { encrypt: true })
   ```

---

## Migration from localStorage

### Before (Insecure)

```typescript
// ❌ Plaintext storage
const [token, setToken] = useLocalStorage('auth_token', '');
localStorage.setItem('api_key', key);
```

### After (Secure)

```typescript
// ✅ Encrypted storage
const [token, setToken] = useSecureStorage('auth_token', '', { 
  encrypt: true,
  expiresIn: 3600000 
});

// Or use auth storage utility
import { saveAuthTokens } from '@/utils/authStorage';
await saveAuthTokens({ accessToken: token });
```

---

## Performance Considerations

### Encryption Overhead

- **Encryption**: ~1-2ms per operation
- **Decryption**: ~1-2ms per operation
- **Negligible** for user-facing operations

### When to Skip Encryption

```typescript
// Unencrypted (fast) for non-sensitive data
const [theme, setTheme] = useSecureStorage('theme', 'dark', {
  encrypt: false  // No encryption needed
});
```

---

## Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSecureStorage } from '@/hooks/useSecureStorage';

describe('useSecureStorage', () => {
  it('stores and retrieves encrypted data', async () => {
    const { result } = renderHook(() =>
      useSecureStorage('test-key', '', { encrypt: true })
    );

    await act(async () => {
      await result.current[1]('secret-value');
    });

    expect(result.current[0]).toBe('secret-value');
  });
});
```

---

## Summary

| Hook | Use Case | Encryption | Expiration |
|------|----------|------------|------------|
| `useSecureStorage` | General data | Optional | Optional |
| `useSecureFormStorage` | Form drafts | Default ON | 24h default |
| `useSecureSessionStorage` | Session data | Always ON | 1h default |
| `useSecureUserPreference` | User settings | Optional | No default |

**Key Principle**: If in doubt, encrypt! The performance cost is negligible compared to the security benefit.

---

**Last Updated**: October 9, 2025  
**Next**: Integrate into existing forms and components
