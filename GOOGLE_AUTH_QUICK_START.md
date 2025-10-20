# 🚀 Google OAuth - Quick Start

## ⚡ Get Your Google Client ID (5 minutes)

1. **Go to**: https://console.cloud.google.com/
2. **Create Project** → Name it "Financial-hift"
3. **Enable API**: APIs & Services → Library → Search "Google+ API" → Enable
4. **OAuth Consent**:
   - APIs & Services → OAuth consent screen
   - External → Create
   - Fill: App name, your email
   - Scopes: Add `userinfo.email`, `userinfo.profile`, `openid`
   - Save

5. **Create Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Web application
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173`
   - Create

6. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

## 🔧 Configure Your App

Edit `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here.apps.googleusercontent.com
VITE_ENABLE_AUTH=true
```

## 🏃 Run

```bash
npm run dev
```

Visit: http://localhost:5173/login

## ✅ What's Implemented

- ✅ Full Google OAuth 2.0 authentication
- ✅ One-tap sign-in
- ✅ Secure encrypted token storage
- ✅ User profile data (name, email, picture)
- ✅ Automatic dashboard redirect
- ✅ Error handling with toast notifications
- ✅ Dev mode bypass option

## 📁 Files Created/Modified

**Created:**
- `utils/googleAuth.js` - Google OAuth utilities
- `GOOGLE_AUTH_SETUP.md` - Full setup documentation

**Modified:**
- `main.jsx` - Added GoogleOAuthProvider wrapper
- `pages/Login.jsx` - Added Google Sign-In button
- `.env` - Added VITE_GOOGLE_CLIENT_ID

## 🎨 Features

### Login Flow
1. User clicks "Sign in with Google"
2. Google popup appears for account selection
3. User selects account
4. JWT token decoded and stored securely
5. User redirected to Dashboard

### Security
- ✅ Tokens encrypted in localStorage
- ✅ JWT verification
- ✅ Secure user data storage
- ✅ Environment variable configuration
- ✅ HTTPS recommended for production

## 🐛 Troubleshooting

**"Error 400: redirect_uri_mismatch"**
→ Add `http://localhost:5173` to Authorized redirect URIs in Google Console

**Google button not showing**
→ Make sure VITE_GOOGLE_CLIENT_ID is set in `.env` and server is restarted

**"Google Client ID not configured"**
→ Check `.env` file has the correct variable name with `VITE_` prefix

## 🔥 Test It Now!

1. Make sure VITE_GOOGLE_CLIENT_ID is set in `.env`
2. Server is running: http://localhost:5173
3. Go to: http://localhost:5173/login
4. Click "Sign in with Google"
5. Select your account
6. 🎉 You're logged in!

## 📚 Full Documentation

See `GOOGLE_AUTH_SETUP.md` for complete setup guide with screenshots and advanced configuration.

## 🚨 Important for Production

1. Never commit `.env` to git
2. Use different OAuth clients for dev/prod
3. Add production domain to Authorized origins
4. Use environment variables in hosting platform
5. Enable HTTPS

---

**Need help?** Check `GOOGLE_AUTH_SETUP.md` for detailed troubleshooting.
