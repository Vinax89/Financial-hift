@echo off
REM ============================================================================
REM Financial-hift - Dependency Installation Script
REM This script installs testing and React Query dependencies
REM ============================================================================

echo.
echo ============================================================================
echo  Financial-hift - Installing Dependencies
echo ============================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detected: 
node --version
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] npm detected:
npm --version
echo.

REM Install Testing Dependencies
echo ============================================================================
echo  Step 1: Installing Testing Dependencies
echo ============================================================================
echo.
echo Installing: vitest, @testing-library/react, @testing-library/jest-dom, @vitest/ui, happy-dom
echo.

call npm install -D vitest @testing-library/react @testing-library/jest-dom @vitest/ui happy-dom

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install testing dependencies
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Testing dependencies installed successfully!
echo.

REM Install React Query
echo ============================================================================
echo  Step 2: Installing React Query
echo ============================================================================
echo.
echo Installing: @tanstack/react-query, @tanstack/react-query-devtools
echo.

call npm install @tanstack/react-query @tanstack/react-query-devtools

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install React Query
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo [SUCCESS] React Query installed successfully!
echo.

REM Verify installations
echo ============================================================================
echo  Step 3: Verifying Installations
echo ============================================================================
echo.

echo Checking vitest...
call npm list vitest 2>nul | findstr /C:"vitest@"
if %ERRORLEVEL% EQU 0 (
    echo [OK] vitest installed
) else (
    echo [WARNING] vitest not found in package list
)

echo.
echo Checking @tanstack/react-query...
call npm list @tanstack/react-query 2>nul | findstr /C:"@tanstack/react-query@"
if %ERRORLEVEL% EQU 0 (
    echo [OK] @tanstack/react-query installed
) else (
    echo [WARNING] @tanstack/react-query not found in package list
)

echo.
echo ============================================================================
echo  Installation Complete!
echo ============================================================================
echo.
echo Next steps:
echo   1. Run tests:           npm test
echo   2. Test UI:             npm run test:ui
echo   3. Coverage:            npm run test:coverage
echo   4. Start app:           npm run dev
echo.
echo See INSTALLATION_NEXT_STEPS.md for detailed instructions
echo.

pause
