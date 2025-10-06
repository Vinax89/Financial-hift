# Testing Setup Guide

## PowerShell Execution Policy Fix

You're encountering a PowerShell security restriction. Choose **ONE** of these solutions:

### Option 1: Run in Command Prompt (Easiest)
Open **Command Prompt (cmd.exe)** instead of PowerShell and run:
```cmd
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui happy-dom
```

### Option 2: Temporarily Bypass (One Command)
Run this in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui happy-dom
```

### Option 3: Enable for Current User (Permanent)
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then run the npm install command normally.

### Option 4: Use VS Code Terminal
In VS Code, open a new terminal and select **Command Prompt** from the dropdown, then run:
```cmd
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui happy-dom
```

---

## After Installation Complete

### 1. Verify Installation
```cmd
npm list vitest
```

### 2. Run Tests
```cmd
npm test
```

### 3. Run Tests with UI
```cmd
npm run test:ui
```

### 4. Run Tests in Watch Mode
```cmd
npm run test:watch
```

---

## What's Being Installed

- **vitest**: Fast unit test framework (Vite-native)
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@vitest/ui**: Beautiful test UI dashboard
- **happy-dom**: Fast DOM implementation for tests

---

## Next Steps After Installation

1. ✅ Install dependencies (this step)
2. ✅ Configuration files will be auto-generated
3. ✅ Sample tests will be created
4. ✅ Run `npm test` to verify setup

---

**Estimated Time:** 2-3 minutes for installation
