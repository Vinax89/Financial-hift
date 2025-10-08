# 🛠️ Developer Tools & Scripts Guide

## Overview

Financial $hift includes a comprehensive suite of developer tools and scripts to streamline development, improve code quality, and maintain project health.

---

## Quick Reference

```bash
# Code Generation
npm run generate:component MyComponent  # Create new component
npm run generate:page MyPage           # Create new page
npm run generate:hook useMyHook        # Create new hook

# Analysis & Monitoring
npm run analyze                        # Bundle size analysis
npm run check:deps                     # Dependency health check

# Development
npm run dev                            # Start dev server
npm run build                          # Production build
npm run preview                        # Preview production build

# Testing
npm test                               # Run all tests
npm run test:watch                     # Watch mode
npm run test:coverage                  # Coverage report
npm run test:ui                        # Visual test UI
npm run test:e2e                       # E2E tests (Playwright)

# Code Quality
npm run lint                           # ESLint check
```

---

## Code Generation

### Component Generator

Automatically generates a complete component with:
- Component file (`MyComponent.jsx`)
- Test file (`MyComponent.test.jsx`)
- Story file (`MyComponent.stories.jsx`)
- Proper boilerplate and imports

**Usage:**

```bash
# Generate a component
npm run generate:component Button

# Generate a page component
npm run generate:page Settings

# Generate a custom hook
npm run generate:hook useFormValidation
```

**Output Structure:**

```
components/
  Button.jsx          # Component implementation
  Button.test.jsx     # Vitest unit tests
  Button.stories.jsx  # Storybook stories

pages/
  Settings.jsx        # Page component
  Settings.test.jsx   # Page tests

hooks/
  useFormValidation.jsx       # Hook implementation
  useFormValidation.test.jsx  # Hook tests
```

**Generated Component Template:**

```javascript
import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * MyComponent component
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} MyComponent component
 */
export function MyComponent({ className = '' }) {
  const [state, setState] = useState(null);

  return (
    <div className={`mycomponent ${className}`}>
      <h2>MyComponent</h2>
      <p>Component content goes here</p>
    </div>
  );
}

MyComponent.propTypes = {
  className: PropTypes.string,
};

export default MyComponent;
```

**Customization:**

Edit `scripts/generate-component.js` to customize templates.

---

## Bundle Analyzer

Comprehensive bundle size and dependency analysis tool.

**Usage:**

```bash
npm run analyze
```

**Analysis Includes:**

### 1. Dependency Analysis
- Count of production vs dev dependencies
- Detection of large packages (moment, lodash, etc.)
- Suggestions for alternatives

### 2. Bundle Size Analysis
- Individual file sizes (JS and CSS)
- Total bundle size
- Warnings for oversized bundles (>2MB)
- Optimization suggestions

### 3. Duplicate Detection
- Identifies duplicate package versions
- Suggests using `npm dedupe`

### 4. Code Complexity
- Line counts per directory
- File counts per directory
- Total project metrics

### 5. Optimization Recommendations
- Gzip/Brotli compression
- Code splitting strategies
- Lazy loading opportunities
- Tree-shaking tips

**Example Output:**

```
═══════════════════════════════════════════════════════
   📊 BUNDLE & DEPENDENCY ANALYZER
═══════════════════════════════════════════════════════

📦 DEPENDENCY ANALYSIS

Production Dependencies: 45
Dev Dependencies: 28

⚠️  Large packages detected:
   - lodash

💡 Suggestions:
   • Use lodash-es for tree-shaking

📊 BUNDLE SIZE ANALYSIS

   JS     245.32 KB  index-abc123.js
   JS     128.45 KB  vendor-xyz789.js
   CSS     45.67 KB  index-def456.css

   Total: 0.41 MB

✅ Bundle size is within acceptable range

📈 CODE COMPLEXITY

   components       45 files   3240 lines
   pages           18 files   2156 lines
   hooks           12 files    890 lines
   utils            8 files    654 lines

   Total:          83 files   6940 lines

💡 OPTIMIZATION RECOMMENDATIONS

   1. Enable Gzip/Brotli compression in production
   2. Implement code splitting for routes
   3. Lazy load heavy components
   4. Optimize images (WebP, lazy loading)
   5. Use React.memo() for expensive components
   ...
```

**Prerequisites:**

Run `npm run build` before analyzing to generate bundle files.

---

## Dependency Checker

Monitors package health and identifies issues.

**Usage:**

```bash
npm run check:deps
```

**Checks Performed:**

### 1. Outdated Packages
- Lists packages with updates available
- Shows current, wanted, and latest versions
- Distinguishes major vs minor updates

### 2. Security Vulnerabilities
- Runs `npm audit`
- Categorizes vulnerabilities (critical, high, moderate, low)
- Provides fix commands

### 3. Unused Dependencies
- Scans source code for imports
- Identifies potentially unused packages
- Suggests packages to remove

### 4. Version Consistency
- Checks for exact vs range versions
- Ensures consistent version strategy

**Example Output:**

```
═══════════════════════════════════════════════════════
   🔍 DEPENDENCY CHECKER
═══════════════════════════════════════════════════════

📦 CHECKING FOR OUTDATED PACKAGES

Found 3 outdated packages:

⚠️  react
   Current: 18.2.0
   Wanted:  18.2.0
   Latest:  18.3.1

📌 lodash
   Current: 4.17.20
   Wanted:  4.17.21
   Latest:  4.17.21

💡 Run: npm update (for minor/patch)
💡 Run: npm install <package>@latest (for major)

🔒 CHECKING FOR SECURITY VULNERABILITIES

✅ No security vulnerabilities found!

🗑️  CHECKING FOR UNUSED DEPENDENCIES

⚠️  Potentially unused dependencies:

   - moment
   - underscore

💡 Verify these are truly unused before removing
💡 Run: npm uninstall <package>

📋 CHECKING VERSION CONSISTENCY

✅ Version ranges are consistent

💡 RECOMMENDATIONS

   1. Run npm audit regularly to catch security issues
   2. Keep dependencies up to date (at least monthly)
   3. Review major version updates before upgrading
   4. Remove unused dependencies to reduce bundle size
   ...
```

---

## Performance Monitoring

Real-time performance dashboard for monitoring app health.

**Access:**

Navigate to `/dev/performance` in development mode.

**Features:**

### 1. Rate Limiter Status
- Available tokens
- Queue length
- Utilization percentage
- High queue warnings

### 2. Request Deduplicator
- Cache size
- Pending requests
- Cache efficiency

### 3. Memory Usage
- Used heap size
- Total heap size
- Heap limit
- Utilization warnings (>80%)

### 4. Performance Timing
- DOM Interactive time
- DOM Content Loaded time
- Page Load Complete time

### 5. Component Render Times
- Individual component durations
- Slow component detection (>16ms)
- Color-coded performance indicators:
  - 🟢 Good: <8ms
  - 🟡 Warning: 8-16ms
  - 🔴 Slow: >16ms

**Auto-Refresh:**

Dashboard updates every 2 seconds automatically. Can be paused/resumed.

**Usage Tips:**

- Monitor during development to catch performance issues early
- Watch for high queue lengths (>10 items)
- Identify slow-rendering components
- Track memory usage trends
- Verify rate limiting is working

---

## Development Workflow

### Daily Development

```bash
# 1. Start dev server
npm run dev

# 2. Make changes to code

# 3. Run tests (in another terminal)
npm run test:watch

# 4. Check performance
# Navigate to http://localhost:5173/dev/performance

# 5. Before committing
npm run lint
npm test
```

### Adding New Features

```bash
# 1. Generate component structure
npm run generate:component FeatureName

# 2. Implement component
# Edit FeatureName.jsx

# 3. Write tests
# Edit FeatureName.test.jsx

# 4. Run tests
npm test FeatureName

# 5. Check bundle impact
npm run build
npm run analyze
```

### Before Release

```bash
# 1. Update dependencies
npm run check:deps
npm update

# 2. Run all tests
npm test
npm run test:e2e

# 3. Build and analyze
npm run build
npm run analyze

# 4. Preview production build
npm run preview

# 5. Final lint check
npm run lint
```

---

## Best Practices

### Code Generation

✅ **DO:**
- Use generators for consistency
- Follow naming conventions
- Include JSDoc comments
- Write tests immediately

❌ **DON'T:**
- Manually create boilerplate
- Skip test files
- Forget to export components
- Use inconsistent naming

### Dependency Management

✅ **DO:**
- Run `check:deps` monthly
- Fix security vulnerabilities immediately
- Remove unused dependencies
- Use exact versions for critical packages

❌ **DON'T:**
- Install packages without reviewing
- Ignore security warnings
- Let dependencies get severely outdated
- Install both lodash and lodash-es

### Performance Monitoring

✅ **DO:**
- Monitor during development
- Investigate slow components (>16ms)
- Watch memory usage trends
- Verify rate limiting works

❌ **DON'T:**
- Ignore high queue warnings
- Let memory usage exceed 80%
- Skip performance checks
- Deploy without testing

---

## Troubleshooting

### Generator Issues

**Error: Component already exists**
```bash
# Solution: Use a different name or delete existing
rm components/MyComponent.*
npm run generate:component MyComponent
```

**Error: Cannot find module**
```bash
# Solution: Run from project root
cd /path/to/Financial-hift
npm run generate:component MyComponent
```

### Analyzer Issues

**Error: No build found**
```bash
# Solution: Build first
npm run build
npm run analyze
```

**Error: Module not found (ESM)**
```bash
# Solution: Ensure package.json has "type": "module"
# (Already configured in this project)
```

### Dependency Checker Issues

**Error: npm audit fails**
```bash
# Solution: Fix vulnerabilities
npm audit fix
# Or force fix (careful!)
npm audit fix --force
```

**Error: False positive unused dependency**
```bash
# Solution: Verify manually before removing
# Some dependencies are used indirectly (peer deps, webpack loaders, etc.)
```

---

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `generate:component` | Create new component | Starting new feature |
| `generate:page` | Create new page | Adding new route |
| `generate:hook` | Create custom hook | Reusable logic |
| `analyze` | Bundle analysis | Before release, debugging size |
| `check:deps` | Dependency health | Monthly maintenance |
| `dev` | Start dev server | Daily development |
| `build` | Production build | Before deployment |
| `test` | Run tests | Continuous |
| `test:watch` | Watch mode tests | During development |
| `test:coverage` | Coverage report | Pre-release quality check |
| `test:e2e` | E2E tests | Before deployment |
| `lint` | Code quality check | Before commit |

---

## Advanced Configuration

### Customize Component Templates

Edit `scripts/generate-component.js`:

```javascript
function generateComponent(name) {
  return `
    // Your custom template here
  `;
}
```

### Add New Scripts

Edit `package.json`:

```json
{
  "scripts": {
    "my-script": "node scripts/my-script.js"
  }
}
```

### Configure Analyzers

Scripts are self-contained in `scripts/` directory. Modify as needed:

- `scripts/analyze-bundle.js` - Bundle analyzer
- `scripts/check-deps.js` - Dependency checker
- `scripts/generate-component.js` - Code generator

---

## Additional Resources

- **Performance Dashboard:** `/dev/performance` (dev mode)
- **Component Library:** `COMPONENT_LIBRARY.md`
- **Rate Limiting Guide:** `RATE_LIMIT_OPTIMIZATION.md`
- **Testing Guide:** See test files in `__tests__/`

---

## Getting Help

**Common Questions:**

Q: How do I create a new component?
```bash
npm run generate:component MyComponent
```

Q: How do I check bundle size?
```bash
npm run build && npm run analyze
```

Q: How do I update dependencies?
```bash
npm run check:deps
npm update
```

Q: How do I monitor performance?
```bash
# Navigate to http://localhost:5173/dev/performance
```

Q: Where are the scripts located?
```bash
# All scripts are in scripts/ directory
ls scripts/
```

---

## Contributing

When adding new developer tools:

1. Create script in `scripts/` directory
2. Add script to `package.json`
3. Document in this guide
4. Add examples and troubleshooting
5. Test thoroughly

---

**Happy coding! 🚀**
