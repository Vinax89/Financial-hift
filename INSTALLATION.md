# Package Installation Script

## New Dependencies to Add

Run this command to install all new dependencies:

```bash
npm install @tanstack/react-query@^5.0.0 @tanstack/react-query-devtools@^5.0.0 dompurify@^3.0.0
```

## Dev Dependencies

```bash
npm install --save-dev @testing-library/react@^14.0.0 @testing-library/jest-dom@^6.0.0 @testing-library/user-event@^14.0.0 vitest@^1.0.0 jsdom@^23.0.0
```

## Dependencies Breakdown

### Production Dependencies:
- `@tanstack/react-query@^5.0.0` - Powerful data fetching and caching
- `@tanstack/react-query-devtools@^5.0.0` - Development tools for React Query
- `dompurify@^3.0.0` - XSS sanitization library

### Development Dependencies:
- `@testing-library/react@^14.0.0` - React component testing
- `@testing-library/jest-dom@^6.0.0` - Custom Jest matchers for DOM
- `@testing-library/user-event@^14.0.0` - User interaction simulation
- `vitest@^1.0.0` - Fast unit test framework
- `jsdom@^23.0.0` - DOM implementation for Node.js

## Note
Zod is already installed (^3.24.2), so no need to add it again.

## After Installation

1. Run tests with: `npm test`
2. Run dev server: `npm run dev`
3. Open React Query Devtools in browser (bottom-right corner in dev mode)

## Optional: Add test script to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```
