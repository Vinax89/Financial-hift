# Authentication Integration Guide

## 📋 Overview

Financial $hift now includes a complete authentication system with:
- ✅ **Login Page** (`/login`)
- ✅ **Signup Page** (`/signup`)
- ✅ **Forgot Password** (`/forgot-password`)
- ✅ **Protected Routes** with `AuthGuard`
- ✅ **Social Login Ready** (Google, GitHub - UI implemented)

## 🚀 Current Setup

### Development Mode (Default)
Authentication is **disabled by default** for development:
- Set `VITE_ENABLE_AUTH=false` (or omit) in `.env`
- Users bypass login and access all pages directly
- Mock user data is used for development

### Production Mode
To enable authentication:
1. Set `VITE_ENABLE_AUTH=true` in `.env`
2. Users must authenticate to access protected routes
3. Redirects to `/login` when not authenticated

---

## 🔧 Integration Options

### Option 1: Base44 SDK (Recommended)

**Status**: Placeholder implemented, ready for SDK configuration

**Steps to Enable**:

1. **Uncomment Base44 imports** in these files:
   - `pages/Login.jsx` (line 12)
   - `pages/Signup.jsx` (line 14)
   - `AuthGuard.jsx` (line 10)

2. **Update Login.jsx** (around line 59):
```javascript
// Replace mock login with:
const user = await User.login(email, password);

// Store session
localStorage.setItem('auth_token', user.token);
localStorage.setItem('user_email', user.email);
```

3. **Update Signup.jsx** (around line 128):
```javascript
// Replace mock signup with:
const user = await User.create({
    name: formData.name,
    email: formData.email,
    password: formData.password
});

// Store session
localStorage.setItem('auth_token', user.token);
```

4. **Update AuthGuard.jsx** (around line 51):
```javascript
// Replace mock check with:
const user = await User.me();
setAuthState({
    isLoading: false,
    isAuthenticated: true,
    user,
    error: null
});
```

---

### Option 2: Auth0 Integration

**Great for**: Enterprise apps, multi-tenant systems, advanced security

**Installation**:
```bash
npm install @auth0/auth0-react
```

**Setup**:

1. **Wrap app in Auth0Provider** (`main.jsx`):
```javascript
import { Auth0Provider } from '@auth0/auth0-react';

<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
  <App />
</Auth0Provider>
```

2. **Update Login.jsx**:
```javascript
import { useAuth0 } from '@auth0/auth0-react';

const { loginWithRedirect } = useAuth0();

// Replace handleEmailLogin:
const handleEmailLogin = () => {
    loginWithRedirect({
        screen_hint: 'login',
        login_hint: email
    });
};

// Social login:
const handleSocialLogin = (provider) => {
    loginWithRedirect({
        connection: provider.toLowerCase() // 'google', 'github'
    });
};
```

3. **Update AuthGuard.jsx**:
```javascript
import { useAuth0 } from '@auth0/auth0-react';

const { isAuthenticated, isLoading, user } = useAuth0();

if (isLoading) return <LoadingState />;
if (!isAuthenticated) navigate('/login');
```

**Environment Variables**:
```env
VITE_ENABLE_AUTH=true
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

---

### Option 3: Clerk Integration

**Great for**: Rapid development, beautiful pre-built UI, easy setup

**Installation**:
```bash
npm install @clerk/clerk-react
```

**Setup**:

1. **Wrap app in ClerkProvider** (`main.jsx`):
```javascript
import { ClerkProvider } from '@clerk/clerk-react';

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

2. **Replace custom auth pages with Clerk components**:
```javascript
// pages/Login.jsx
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <SignIn routing="path" path="/login" />
        </div>
    );
}

// pages/Signup.jsx
import { SignUp } from '@clerk/clerk-react';

export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <SignUp routing="path" path="/signup" />
        </div>
    );
}
```

3. **Update AuthGuard.jsx**:
```javascript
import { useUser } from '@clerk/clerk-react';

const { isSignedIn, isLoaded, user } = useUser();

if (!isLoaded) return <LoadingState />;
if (!isSignedIn) navigate('/login');
```

**Environment Variables**:
```env
VITE_ENABLE_AUTH=true
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Social Login**: Configured in Clerk Dashboard (no code changes needed!)

---

### Option 4: Supabase Auth

**Great for**: Open-source preference, PostgreSQL database integration

**Installation**:
```bash
npm install @supabase/supabase-js
```

**Setup**:

1. **Create Supabase client** (`api/supabase.js`):
```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

2. **Update Login.jsx**:
```javascript
import { supabase } from '@/api/supabase.js';

const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } else {
        navigate(from);
    }
    
    setIsLoading(false);
};

const handleSocialLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase() // 'google', 'github'
    });
};
```

3. **Update Signup.jsx**:
```javascript
const handleEmailSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                name: formData.name
            }
        }
    });
    
    if (error) {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Check your email', description: 'Confirmation link sent!' });
    }
    
    setIsLoading(false);
};
```

4. **Update AuthGuard.jsx**:
```javascript
import { supabase } from '@/api/supabase.js';

useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setAuthState({
            isLoading: false,
            isAuthenticated: !!session,
            user: session?.user || null,
            error: null
        });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthState({
            isLoading: false,
            isAuthenticated: !!session,
            user: session?.user || null,
            error: null
        });
    });

    return () => subscription.unsubscribe();
}, []);
```

**Environment Variables**:
```env
VITE_ENABLE_AUTH=true
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Environment Configuration

Update your `.env` file:

```env
# Authentication
VITE_ENABLE_AUTH=false  # Set to 'true' for production

# Base44 SDK (if using)
VITE_BASE44_API_KEY=your-api-key
VITE_BASE44_WORKSPACE_ID=your-workspace-id

# Auth0 (if using)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id

# Clerk (if using)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase (if using)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎨 Customization

### Styling
Auth pages use your existing design system:
- shadcn/ui components
- Tailwind CSS classes
- Dark mode support
- Responsive design

### Branding
Update these in `Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`:
- Logo/icon (currently `<DollarSign />`)
- Colors (primary, background, etc.)
- Copy/text content
- Legal links (Terms, Privacy)

### Social Providers
To add more providers:

1. **Add button in Login.jsx/Signup.jsx**:
```javascript
<Button variant="outline" onClick={() => handleSocialLogin('Facebook')}>
    {/* Facebook SVG icon */}
    Facebook
</Button>
```

2. **Configure in your auth provider**:
   - Auth0: Enable connection in dashboard
   - Clerk: Enable provider in dashboard
   - Supabase: Configure OAuth app

---

## 📁 File Structure

```
pages/
├── Login.jsx           # Email/password + social login
├── Signup.jsx          # Registration with validation
├── ForgotPassword.jsx  # Password reset flow
└── index.jsx           # Routes configuration

AuthGuard.jsx           # Protected route wrapper
```

---

## ✅ Testing

### Manual Testing

1. **Development mode** (auth disabled):
```bash
# .env
VITE_ENABLE_AUTH=false

npm run dev
# ✓ Access all pages directly
# ✓ No login required
```

2. **Mock authentication** (testing UI):
```bash
# .env
VITE_ENABLE_AUTH=true

npm run dev
# ✓ Visit /login
# ✓ Enter any email/password
# ✓ Mock token stored in localStorage
# ✓ Redirects to dashboard
```

3. **Real authentication** (production):
```bash
# .env
VITE_ENABLE_AUTH=true
# + Your auth provider credentials

npm run build
npm run preview
# ✓ Real auth checks
# ✓ Actual user sessions
# ✓ Protected routes enforced
```

### Automated Tests

Create tests for auth flows:

```javascript
// __tests__/auth.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login.jsx';

test('login form submits correctly', async () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
});
```

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] Set `VITE_ENABLE_AUTH=true` in production
- [ ] Configure auth provider credentials
- [ ] Test login/signup flows
- [ ] Test social login (if enabled)
- [ ] Test password reset flow
- [ ] Verify protected routes redirect to login
- [ ] Test session persistence
- [ ] Configure logout functionality
- [ ] Set up user profile management
- [ ] Add email verification (if needed)
- [ ] Configure MFA/2FA (if needed)

---

## 📚 Next Steps

1. **Choose your auth provider** (Base44, Auth0, Clerk, or Supabase)
2. **Follow integration steps** above
3. **Test thoroughly** in development
4. **Deploy** with `VITE_ENABLE_AUTH=true`
5. **Monitor** login success rates in analytics

---

## 🆘 Support

**Common Issues**:

1. **"User not authenticated" loop**: Check if auth token is being stored correctly
2. **Social login not working**: Verify OAuth redirect URIs in provider dashboard
3. **Session not persisting**: Check localStorage/cookie settings
4. **Redirect loops**: Ensure public routes are excluded from AuthGuard

**Need Help?**
- Check provider documentation
- Review console logs for errors
- Test with mock auth first
- Ensure environment variables are set correctly

---

## 📄 License

Same as Financial $hift main project (see LICENSE file)
