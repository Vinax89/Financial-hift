@echo off
REM ============================================================================
REM Financial-hift - Test Runner Script
REM Provides easy access to different test commands
REM ============================================================================

:MENU
cls
echo.
echo ============================================================================
echo  Financial-hift - Test Runner
echo ============================================================================
echo.
echo  1. Run all tests
echo  2. Run tests in watch mode
echo  3. Run tests with UI dashboard
echo  4. Generate coverage report
echo  5. Run specific test file
echo  6. Exit
echo.
echo ============================================================================
echo.

set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto RUN_TESTS
if "%choice%"=="2" goto WATCH_TESTS
if "%choice%"=="3" goto UI_TESTS
if "%choice%"=="4" goto COVERAGE
if "%choice%"=="5" goto SPECIFIC_TEST
if "%choice%"=="6" goto END

echo Invalid option. Please try again.
timeout /t 2 >nul
goto MENU

:RUN_TESTS
echo.
echo Running all tests...
echo.
call npm test
echo.
pause
goto MENU

:WATCH_TESTS
echo.
echo Starting tests in watch mode...
echo Press Ctrl+C to exit watch mode
echo.
call npm run test:watch
echo.
pause
goto MENU

:UI_TESTS
echo.
echo Starting test UI dashboard...
echo Opening in browser at http://localhost:51204
echo Press Ctrl+C to stop the server
echo.
call npm run test:ui
echo.
pause
goto MENU

:COVERAGE
echo.
echo Generating coverage report...
echo.
call npm run test:coverage
echo.
echo Coverage report generated in coverage/ directory
echo Opening coverage/index.html...
start coverage\index.html
echo.
pause
goto MENU

:SPECIFIC_TEST
echo.
echo Available test files:
echo   1. utils/accessibility.test.js
echo   2. utils/validation.test.js
echo   3. utils/formEnhancement.test.js
echo   4. api/base44Client-enhanced.test.js
echo.
set /p testfile="Enter test file path: "
echo.
echo Running %testfile%...
echo.
call npx vitest run %testfile%
echo.
pause
goto MENU

:END
echo.
echo Goodbye!
echo.
exit /b 0
