# Installation Commands

## 🚨 PowerShell Execution Policy Issue Detected

If you see the error: "running scripts is disabled on this system", run this command first:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then proceed with installations below.

## Production Dependencies

```bash
npm install @tanstack/react-query@^5.0.0 dompurify@^3.0.0
```

## Development Dependencies

```bash
npm install --save-dev vitest@^1.0.0 @testing-library/react@^14.0.0 @testing-library/jest-dom@^6.0.0 jsdom@^23.0.0
```

## Verify Installation

```bash
npm list @tanstack/react-query dompurify vitest
```

## Alternative: Use CMD Instead

If PowerShell continues to have issues, open Command Prompt (cmd.exe) and run:

```cmd
npm install @tanstack/react-query@^5.0.0 dompurify@^3.0.0
npm install --save-dev vitest@^1.0.0 @testing-library/react@^14.0.0 @testing-library/jest-dom@^6.0.0 jsdom@^23.0.0
```

## After Installation

Run these commands to verify everything works:

```bash
npm run dev
```

Open your browser to verify React Query DevTools appear (they'll show in development mode automatically once installed).
