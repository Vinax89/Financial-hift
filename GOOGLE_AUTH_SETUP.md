# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for Financial $hift.

## Prerequisites

- A Google Cloud Platform account
- Node.js and npm installed
- The application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter your project name (e.g., "Financial-hift")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" (or "Internal" if you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Financial $hift
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users if in development mode
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter a name (e.g., "Financial-hift Web Client")
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com
   ```
7. Click "Create"
8. **Copy your Client ID** - you'll need this next!

## Step 5: Configure Your Application

1. Open your `.env` file in the project root
2. Replace the placeholder with your actual Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   ```
3. Save the file

## Step 6: Restart the Development Server

```bash
npm run dev
```

## Step 7: Test the Integration

1. Navigate to http://localhost:5173/login
2. You should see a "Sign in with Google" button
3. Click the button and sign in with your Google account
4. You should be redirected to the dashboard upon successful login

## Security Best Practices

### Production Deployment

1. **Never commit your `.env` file** to version control
2. Use environment variables in your hosting platform:
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site Settings > Build & Deploy > Environment
   - AWS/Azure: Use their secrets management services

3. **Update Authorized Origins and Redirect URIs**:
   - Add your production domain
   - Remove development URLs from production credentials

4. **Use different OAuth clients** for development and production

### Domain Restrictions (Optional)

If you want to restrict sign-in to a specific Google Workspace organization:

1. Edit `utils/googleAuth.js`
2. Update the `getGoogleConfig` function:
   ```javascript
   return {
       clientId,
       // ... other config
       hosted_domain: 'yourdomain.com', // Only allow this domain
   };
   ```

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the URL in your browser exactly matches an authorized redirect URI
- Include the port number (e.g., `:5173`) if using localhost
- Check for trailing slashes

### "Google Client ID not configured"
- Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Restart the development server after adding the environment variable
- Make sure the variable name starts with `VITE_` (Vite requirement)

### Google Sign-In button not showing
- Check browser console for errors
- Verify `@react-oauth/google` package is installed
- Make sure `GoogleOAuthProvider` is wrapping your app in `main.jsx`

### Authentication not persisting
- Check that `authStorage.js` utilities are working
- Verify browser allows localStorage/sessionStorage
- Check browser privacy/security settings

## Features Implemented

✅ Google OAuth 2.0 authentication  
✅ One-tap sign-in support  
✅ Secure token storage with encryption  
✅ User profile data extraction  
✅ Automatic redirection after login  
✅ Error handling and user feedback  
✅ Development mode bypass option  

## API Documentation

### Google Auth Utilities (`utils/googleAuth.js`)

**`handleGoogleSuccess(credentialResponse)`**
- Processes successful Google authentication
- Decodes JWT token
- Stores user data securely
- Returns user object

**`handleGoogleError(error)`**
- Handles authentication errors
- Logs error details
- Throws formatted error message

**`getGoogleConfig()`**
- Returns Google OAuth configuration
- Validates client ID is set
- Provides default scope settings

**`isGoogleAuthConfigured()`**
- Checks if Google Client ID is configured
- Returns boolean

## Next Steps

1. **Add profile page** to display Google profile picture
2. **Implement logout** to revoke Google access
3. **Add GitHub OAuth** for alternative login method
4. **Set up refresh tokens** for long-lived sessions
5. **Add MFA** for enhanced security

## Support

For issues or questions:
- Check the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
- Review [React OAuth Google docs](https://www.npmjs.com/package/@react-oauth/google)
- Contact your development team

## License

This implementation follows Google's OAuth 2.0 guidelines and best practices.
