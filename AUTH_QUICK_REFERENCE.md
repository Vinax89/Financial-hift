# Authentication Quick Reference

## 🔗 Routes

| Route | Component | Public? | Description |
|-------|-----------|---------|-------------|
| `/login` | `Login.jsx` | ✅ Yes | Email/password + social login |
| `/signup` | `Signup.jsx` | ✅ Yes | User registration with validation |
| `/forgot-password` | `ForgotPassword.jsx` | ✅ Yes | Password reset request |
| All others | Protected by `AuthGuard` | ❌ No | Requires authentication |

---

## 🎮 Usage Examples

### Enable/Disable Auth

```env
# Development (auth disabled)
VITE_ENABLE_AUTH=false

# Production (auth enabled)
VITE_ENABLE_AUTH=true
```

### Add Logout Button

```jsx
import { useLogout } from '@/utils/auth.js';

function MyComponent() {
    const { logout } = useLogout();
    
    return (
        <button onClick={() => logout()}>
            Logout
        </button>
    );
}
```

### Check Authentication Status

```jsx
import { isAuthenticated, getCurrentUser } from '@/utils/auth.js';

const isLoggedIn = isAuthenticated(); // boolean
const user = getCurrentUser(); // { email, name } or null
```

### Protect a Component

```jsx
import AuthGuard from '@/AuthGuard.jsx';

function MyPage() {
    return (
        <AuthGuard>
            {/* Protected content */}
        </AuthGuard>
    );
}
```

---

## 🔧 Integration Checklist

### Option 1: Base44 SDK
- [ ] Uncomment `User` imports in `Login.jsx`, `Signup.jsx`, `AuthGuard.jsx`
- [ ] Replace mock authentication calls with `User.login()`, `User.create()`, `User.me()`
- [ ] Set `VITE_BASE44_API_KEY` and `VITE_BASE44_WORKSPACE_ID`
- [ ] Test login/signup flows

### Option 2: Auth0
- [ ] Install: `npm install @auth0/auth0-react`
- [ ] Wrap app in `<Auth0Provider>` in `main.jsx`
- [ ] Update auth pages to use `useAuth0()` hook
- [ ] Configure OAuth apps in Auth0 dashboard
- [ ] Set `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`

### Option 3: Clerk
- [ ] Install: `npm install @clerk/clerk-react`
- [ ] Wrap app in `<ClerkProvider>` in `main.jsx`
- [ ] Replace auth pages with `<SignIn>` and `<SignUp>` components
- [ ] Configure providers in Clerk dashboard
- [ ] Set `VITE_CLERK_PUBLISHABLE_KEY`

### Option 4: Supabase
- [ ] Install: `npm install @supabase/supabase-js`
- [ ] Create Supabase client in `api/supabase.js`
- [ ] Update auth pages to use `supabase.auth` methods
- [ ] Configure OAuth apps in Supabase dashboard
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## 🎨 Customization

### Change Login Page Logo
```jsx
// pages/Login.jsx (line ~129)
<DollarSign className="h-8 w-8 text-primary" />
// Replace with your logo component
```

### Modify Password Requirements
```jsx
// pages/Signup.jsx (line ~55)
const validatePassword = (password) => {
    // Customize validation rules
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    // ... add your rules
};
```

### Update Social Login Providers
```jsx
// pages/Login.jsx (line ~271)
<Button onClick={() => handleSocialLogin('Google')}>
    {/* Google icon */}
    Google
</Button>

// Add more:
<Button onClick={() => handleSocialLogin('Microsoft')}>
    {/* Microsoft icon */}
    Microsoft
</Button>
```

---

## 📱 Screenshots (UI Overview)

### Login Page
- Email/password fields with show/hide password toggle
- "Forgot password?" link
- Social login buttons (Google, GitHub)
- "Sign up" link at bottom
- Fully responsive, dark mode support

### Signup Page
- Full name, email, password, confirm password fields
- Password strength requirements displayed
- Terms of Service checkbox (required)
- Social signup buttons
- "Sign in" link at bottom

### Forgot Password Page
- Email input field
- Success confirmation with instructions
- "Back to login" link

---

## 🐛 Troubleshooting

### "Cannot read property 'me' of undefined"
**Solution**: Uncomment `User` import from `@/api/entities`

### "Maximum update depth exceeded"
**Solution**: Check for infinite loops in `AuthGuard` useEffect

### "Redirect to /login doesn't work"
**Solution**: Ensure `pages/index.jsx` has public route exception for `/login`

### "Social login button does nothing"
**Solution**: Implement provider-specific logic in `handleSocialLogin()`

### "Session not persisting after refresh"
**Solution**: Check if `localStorage.getItem('auth_token')` works correctly

---

## 📚 Documentation

- **Full Guide**: `AUTHENTICATION_GUIDE.md` (detailed integration steps for all providers)
- **This File**: Quick reference for common tasks
- **API Docs**: Base44 SDK documentation (when available)

---

## ✅ Testing Commands

```bash
# Test with auth disabled (development)
VITE_ENABLE_AUTH=false npm run dev

# Test with mock auth (UI testing)
VITE_ENABLE_AUTH=true npm run dev
# Login with any email/password - mock token stored

# Test with real auth (production)
VITE_ENABLE_AUTH=true npm run build
npm run preview
# Use real credentials from auth provider
```

---

## 🎯 Next Steps

1. **Choose auth provider** (Base44, Auth0, Clerk, or Supabase)
2. **Follow integration checklist** (see above)
3. **Customize branding** (logo, colors, copy)
4. **Test all flows** (login, signup, password reset, logout)
5. **Add to settings page** (profile management, change password)
6. **Deploy with auth enabled** (`VITE_ENABLE_AUTH=true`)

---

**Need help?** Check `AUTHENTICATION_GUIDE.md` for detailed examples!
