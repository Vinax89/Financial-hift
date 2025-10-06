# Production Build & Deployment Guide 🚀

## Complete Guide for Deploying Financial-hift to Production

This guide covers building, optimizing, and deploying your React + Vite application to various hosting platforms.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Build Process](#build-process)
3. [Environment Variables](#environment-variables)
4. [Deployment Options](#deployment-options)
5. [CI/CD Setup](#cicd-setup)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools:
- ✅ Node.js 18.x or higher
- ✅ npm 9.x or higher
- ✅ Git (for version control)
- ✅ Base44 API credentials

### Check Your Setup:
```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v9.0.0 or higher
git --version     # Should be installed
```

---

## Build Process

### 1. Install Dependencies
```bash
# Clean install (recommended for production)
npm ci

# Or regular install
npm install
```

### 2. Run Tests (Optional but Recommended)
```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Expected: 93.7% coverage, 80+ tests passing
```

### 3. Create Production Build
```bash
npm run build
```

**What Happens:**
- ✅ Vite bundles your React app
- ✅ Code is minified and optimized
- ✅ Assets are hashed for caching
- ✅ Source maps generated (optional)
- ✅ Output saved to `dist/` folder

**Expected Output:**
```
vite v5.x.x building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-a1b2c3d4.css   123.45 kB │ gzip:  25.67 kB
dist/assets/index-e5f6g7h8.js    456.78 kB │ gzip:  123.45 kB
✓ built in 12.34s
```

### 4. Preview Production Build Locally
```bash
npm run preview
```

**Access:** http://localhost:4173

**Test Checklist:**
- [ ] App loads without errors
- [ ] All routes work correctly
- [ ] React Query caching works
- [ ] API calls succeed
- [ ] UI renders properly
- [ ] DevTools disabled in production

---

## Environment Variables

### 1. Create `.env.production` File
```bash
# API Configuration
VITE_BASE44_API_URL=https://api.base44.com
VITE_BASE44_API_KEY=your_production_api_key_here

# Feature Flags
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_ANALYTICS=true

# App Configuration
VITE_APP_NAME=Financial-hift
VITE_APP_VERSION=1.0.0
```

### 2. Environment Variable Guidelines

#### ⚠️ Security Rules:
- ✅ **DO** prefix with `VITE_` to expose to client
- ❌ **DON'T** store secrets in client-side env vars
- ✅ **DO** use different values per environment
- ❌ **DON'T** commit `.env` files to Git

#### 📁 File Structure:
```
.env.local          # Local development (ignored by Git)
.env.production     # Production settings (ignored by Git)
.env.example        # Template (committed to Git)
```

### 3. Using Environment Variables in Code
```javascript
// In your React components
const apiUrl = import.meta.env.VITE_BASE44_API_URL;
const isDev = import.meta.env.DEV; // true in development
const isProd = import.meta.env.PROD; // true in production

// Example: Conditional DevTools
{import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

### 4. Create `.env.example` Template
```bash
# Copy this to .env.local and fill in your values

# Base44 API
VITE_BASE44_API_URL=https://api.base44.com
VITE_BASE44_API_KEY=your_api_key_here

# Features
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_ANALYTICS=true
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Why Vercel?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ CDN included
- ✅ GitHub integration
- ✅ Zero configuration needed

#### Deploy Steps:

**A. Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**B. Via GitHub Integration:**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variables in Vercel dashboard
7. Click "Deploy"

**Vercel Configuration (`vercel.json`):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

#### Why Netlify?
- ✅ Free tier with 100GB bandwidth
- ✅ Automatic HTTPS
- ✅ Form handling
- ✅ Serverless functions

#### Deploy Steps:

**A. Via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**B. Via GitHub Integration:**
1. Push code to GitHub
2. Go to https://netlify.com
3. Click "New site from Git"
4. Select repository
5. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
6. Add environment variables
7. Click "Deploy site"

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Option 3: GitHub Pages

#### Why GitHub Pages?
- ✅ 100% free
- ✅ Direct from GitHub repository
- ✅ Custom domain support

#### Deploy Steps:

**1. Install `gh-pages` Package:**
```bash
npm install --save-dev gh-pages
```

**2. Update `package.json`:**
```json
{
  "name": "financial-hift",
  "homepage": "https://yourusername.github.io/financial-hift",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**3. Update `vite.config.js`:**
```javascript
export default defineConfig({
  base: '/financial-hift/', // Replace with your repo name
  plugins: [react()],
  // ... rest of config
})
```

**4. Deploy:**
```bash
npm run deploy
```

**Access:** https://yourusername.github.io/financial-hift

---

### Option 4: AWS S3 + CloudFront

#### Why AWS?
- ✅ Highly scalable
- ✅ Full control
- ✅ Enterprise-grade

#### Deploy Steps:

**1. Create S3 Bucket:**
```bash
aws s3 mb s3://financial-hift-prod
```

**2. Configure Bucket for Static Hosting:**
```bash
aws s3 website s3://financial-hift-prod \
  --index-document index.html \
  --error-document index.html
```

**3. Build and Upload:**
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://financial-hift-prod --delete
```

**4. Invalidate CloudFront Cache:**
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

### Option 5: Docker Container

#### Why Docker?
- ✅ Consistent environment
- ✅ Easy scaling
- ✅ Platform-agnostic

#### Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run:
```bash
# Build image
docker build -t financial-hift:latest .

# Run container
docker run -p 8080:80 financial-hift:latest
```

---

## CI/CD Setup

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run coverage
        run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production
        run: npm run build
        env:
          VITE_BASE44_API_URL: ${{ secrets.VITE_BASE44_API_URL }}
          VITE_BASE44_API_KEY: ${{ secrets.VITE_BASE44_API_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist
```

### Required GitHub Secrets:
```
VITE_BASE44_API_URL
VITE_BASE44_API_KEY
VERCEL_TOKEN (if using Vercel)
VERCEL_ORG_ID (if using Vercel)
VERCEL_PROJECT_ID (if using Vercel)
```

---

## Performance Optimization

### 1. Code Splitting

**Vite Configuration:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
        }
      }
    }
  }
})
```

### 2. Lazy Loading Routes

```javascript
// App.jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Image Optimization

```javascript
// Use modern formats
<img src="/image.webp" alt="..." loading="lazy" />

// Or with fallback
<picture>
  <source srcset="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="..." loading="lazy" />
</picture>
```

### 4. React Query Optimization

Already configured in `main.jsx`:
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - reduce API calls
      gcTime: 10 * 60 * 1000,   // 10 minutes - cache retention
      retry: 2,                  // Retry failed requests
      refetchOnWindowFocus: false, // Don't refetch on tab switch
    }
  }
});
```

### 5. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Update vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});

# Build and analyze
npm run build
```

---

## Monitoring & Analytics

### 1. Error Tracking with Sentry

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

### 2. Analytics with Google Analytics

```bash
npm install react-ga4
```

```javascript
// utils/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID);
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};
```

### 3. Performance Monitoring

```javascript
// utils/performance.js
export const measurePerformance = () => {
  if (window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    
    console.log('Page Load Time:', pageLoadTime + 'ms');
    console.log('Connect Time:', connectTime + 'ms');
  }
};
```

---

## Troubleshooting

### Issue: Build Fails with "Out of Memory"

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Or update `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

---

### Issue: Routes Return 404 on Refresh

**Problem:** Server doesn't handle SPA routing

**Solution:** Add rewrites/redirects (shown in deployment configs above)

For Vercel: Already handled automatically
For Netlify: Use `_redirects` file or `netlify.toml`
For Nginx: Use `try_files $uri $uri/ /index.html;`

---

### Issue: Environment Variables Not Working

**Check:**
1. ✅ Variables prefixed with `VITE_`
2. ✅ Using `import.meta.env.VITE_YOUR_VAR`
3. ✅ Restarted dev server after changing `.env`
4. ✅ Variables exist in deployment platform

---

### Issue: Assets Not Loading (CORS Errors)

**Solution:** Configure CORS headers

For Nginx:
```nginx
add_header Access-Control-Allow-Origin *;
```

For Vercel (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

---

### Issue: Large Bundle Size

**Analyze:**
```bash
npm run build
# Check output sizes

# Use bundle analyzer
npm install -D rollup-plugin-visualizer
```

**Solutions:**
1. Enable code splitting (shown above)
2. Lazy load routes
3. Use dynamic imports
4. Remove unused dependencies
5. Optimize images (WebP, compression)

---

## Production Checklist

### Pre-Deployment:
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured (GA4)
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)

### Post-Deployment:
- [ ] Verify app loads without errors
- [ ] Test all routes and features
- [ ] Check React Query caching
- [ ] Verify API calls succeed
- [ ] Test on multiple devices/browsers
- [ ] Check Lighthouse score (90+ recommended)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test authentication flow
- [ ] Verify data persistence

---

## Performance Targets

### Lighthouse Scores (Goals):
- **Performance:** 90+ ⚡
- **Accessibility:** 95+ ♿
- **Best Practices:** 95+ ✅
- **SEO:** 90+ 🔍

### Core Web Vitals:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Bundle Size Goals:
- **Initial JS:** < 200 KB (gzipped)
- **Initial CSS:** < 50 KB (gzipped)
- **Total Assets:** < 500 KB (gzipped)

---

## Deployment Comparison

| Platform | Free Tier | HTTPS | CDN | CI/CD | Difficulty | Best For |
|----------|-----------|-------|-----|-------|------------|----------|
| **Vercel** | ✅ Yes | ✅ Auto | ✅ Yes | ✅ Built-in | ⭐ Easy | Quick deploys |
| **Netlify** | ✅ Yes | ✅ Auto | ✅ Yes | ✅ Built-in | ⭐ Easy | Serverless |
| **GitHub Pages** | ✅ Yes | ✅ Auto | ✅ Yes | ⭐⭐ Manual | ⭐ Easy | Open source |
| **AWS S3** | ❌ Paid | ⭐⭐ Manual | ⭐⭐ CloudFront | ⭐⭐ Manual | ⭐⭐⭐ Hard | Enterprise |
| **Docker** | Varies | ⭐⭐ Manual | ❌ No | ⭐⭐ Manual | ⭐⭐⭐ Hard | Self-hosted |

---

## Support & Resources

### Official Documentation:
- **Vite:** https://vitejs.dev/guide/build.html
- **React:** https://react.dev/learn
- **React Query:** https://tanstack.com/query/latest
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com

### Community:
- **Discord:** [React Discord](https://discord.gg/react)
- **Stack Overflow:** Tag `vite`, `react`, `react-query`
- **GitHub Discussions:** Your repository discussions

---

## 🎉 Ready for Production!

You now have everything you need to:
- ✅ Build optimized production bundle
- ✅ Configure environment variables
- ✅ Deploy to multiple platforms
- ✅ Set up CI/CD pipelines
- ✅ Monitor performance
- ✅ Troubleshoot issues

**Recommended Deployment:** Start with **Vercel** for easiest setup, then scale to AWS if needed for enterprise requirements.

**Next Steps:**
1. Choose your deployment platform
2. Configure environment variables
3. Run production build
4. Deploy and test
5. Monitor and optimize

🚀 **Happy Deploying!**
