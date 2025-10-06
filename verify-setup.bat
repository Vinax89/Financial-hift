@echo off
REM ============================================================================
REM Financial-hift - Setup Verification Script
REM Checks if all dependencies are installed correctly
REM ============================================================================

echo.
echo ============================================================================
echo  Financial-hift - Setup Verification
echo ============================================================================
echo.

set ALL_OK=1

REM Check Node.js
echo [CHECK] Node.js...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node --version
    echo [OK] Node.js installed
) else (
    echo [FAIL] Node.js not found
    set ALL_OK=0
)
echo.

REM Check npm
echo [CHECK] npm...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    npm --version
    echo [OK] npm installed
) else (
    echo [FAIL] npm not found
    set ALL_OK=0
)
echo.

REM Check if node_modules exists
echo [CHECK] node_modules directory...
if exist "node_modules\" (
    echo [OK] node_modules exists
) else (
    echo [FAIL] node_modules not found - run npm install
    set ALL_OK=0
)
echo.

REM Check testing dependencies
echo [CHECK] Testing dependencies...
call npm list vitest >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] vitest installed
) else (
    echo [FAIL] vitest not installed
    set ALL_OK=0
)

call npm list @testing-library/react >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] @testing-library/react installed
) else (
    echo [FAIL] @testing-library/react not installed
    set ALL_OK=0
)

call npm list happy-dom >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] happy-dom installed
) else (
    echo [FAIL] happy-dom not installed
    set ALL_OK=0
)
echo.

REM Check React Query
echo [CHECK] React Query...
call npm list @tanstack/react-query >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] @tanstack/react-query installed
) else (
    echo [FAIL] @tanstack/react-query not installed
    set ALL_OK=0
)

call npm list @tanstack/react-query-devtools >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] @tanstack/react-query-devtools installed
) else (
    echo [FAIL] @tanstack/react-query-devtools not installed
    set ALL_OK=0
)
echo.

REM Check test files
echo [CHECK] Test files...
if exist "utils\accessibility.test.js" (
    echo [OK] accessibility.test.js exists
) else (
    echo [FAIL] accessibility.test.js not found
    set ALL_OK=0
)

if exist "utils\validation.test.js" (
    echo [OK] validation.test.js exists
) else (
    echo [FAIL] validation.test.js not found
    set ALL_OK=0
)

if exist "utils\formEnhancement.test.js" (
    echo [OK] formEnhancement.test.js exists
) else (
    echo [FAIL] formEnhancement.test.js not found
    set ALL_OK=0
)

if exist "api\base44Client-enhanced.test.js" (
    echo [OK] base44Client-enhanced.test.js exists
) else (
    echo [FAIL] base44Client-enhanced.test.js not found
    set ALL_OK=0
)
echo.

REM Check config files
echo [CHECK] Configuration files...
if exist "vitest.config.js" (
    echo [OK] vitest.config.js exists
) else (
    echo [FAIL] vitest.config.js not found
    set ALL_OK=0
)

if exist "src\test\setup.js" (
    echo [OK] src\test\setup.js exists
) else (
    echo [FAIL] src\test\setup.js not found
    set ALL_OK=0
)
echo.

REM Final status
echo ============================================================================
if %ALL_OK% EQU 1 (
    echo  STATUS: ALL CHECKS PASSED
    echo ============================================================================
    echo.
    echo Your setup is complete! Next steps:
    echo   1. Run tests:    npm test
    echo   2. Test UI:      npm run test:ui
    echo   3. Coverage:     npm run test:coverage
    echo   4. Start app:    npm run dev
) else (
    echo  STATUS: SOME CHECKS FAILED
    echo ============================================================================
    echo.
    echo Please fix the issues above and run this script again.
    echo If dependencies are missing, run: install-dependencies.bat
)
echo.

pause
