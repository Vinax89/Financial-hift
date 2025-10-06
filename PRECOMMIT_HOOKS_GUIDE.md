# Pre-commit Hooks Setup Guide

## Overview
This guide helps you set up pre-commit hooks using Husky and lint-staged to automatically format and lint code before commits.

## Installation

### 1. Install Dependencies

```bash
npm install --save-dev husky lint-staged prettier
```

### 2. Initialize Husky

```bash
npx husky init
```

This creates a `.husky` directory with pre-commit hooks.

### 3. Configure lint-staged

Add to your `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### 4. Add Scripts to package.json

```json
{
  "scripts": {
    "prepare": "husky",
    "format": "prettier --write .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 5. Create Pre-commit Hook

Create `.husky/pre-commit` file:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

## Prettier Configuration

Create `.prettierrc` in root:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
node_modules
dist
build
.vite
coverage
*.min.js
package-lock.json
```

## Usage

Once set up, the hooks run automatically:

1. **On commit:** Runs ESLint and Prettier on staged files
2. **Manual format:** Run `npm run format`
3. **Manual lint:** Run `npm run lint:fix`

## What Gets Checked

- ✅ JavaScript/JSX syntax errors
- ✅ Code style consistency
- ✅ Unused variables
- ✅ Missing imports
- ✅ Formatting issues

## Bypassing Hooks (Not Recommended)

If you need to bypass hooks (emergency only):

```bash
git commit --no-verify -m "Emergency commit"
```

## Troubleshooting

### Hooks not running
```bash
npx husky install
```

### Permission denied
```bash
chmod +x .husky/pre-commit
```

### ESLint errors
```bash
npm run lint:fix
```

## Benefits

✅ **Consistent code style** across team  
✅ **Catch errors before commit**  
✅ **Automated formatting**  
✅ **Faster code reviews**  
✅ **Better code quality**

---

**Note:** This is optional but highly recommended for team projects!
