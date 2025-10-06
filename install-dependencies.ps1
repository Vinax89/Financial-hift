# ============================================================================
# Financial-hift - PowerShell Installation Script
# This script installs testing and React Query dependencies
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Financial-hift - Installing Dependencies" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "[INFO] npm detected: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Testing Dependencies
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Step 1: Installing Testing Dependencies" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installing: vitest, @testing-library/react, @testing-library/jest-dom, @vitest/ui, happy-dom" -ForegroundColor Yellow
Write-Host ""

$testingPackages = "vitest", "@testing-library/react", "@testing-library/jest-dom", "@vitest/ui", "happy-dom"
$testingArgs = @("install", "-D") + $testingPackages

try {
    & npm $testingArgs
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Testing dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to install testing dependencies" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install React Query
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Step 2: Installing React Query" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installing: @tanstack/react-query, @tanstack/react-query-devtools" -ForegroundColor Yellow
Write-Host ""

$queryPackages = "@tanstack/react-query", "@tanstack/react-query-devtools"
$queryArgs = @("install") + $queryPackages

try {
    & npm $queryArgs
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] React Query installed successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to install React Query" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify installations
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Step 3: Verifying Installations" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$allInstalled = $true

Write-Host "Checking vitest..." -ForegroundColor Yellow
try {
    $vitestCheck = npm list vitest 2>&1 | Select-String "vitest@"
    if ($vitestCheck) {
        Write-Host "[OK] vitest installed" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] vitest not found in package list" -ForegroundColor Yellow
        $allInstalled = $false
    }
} catch {
    Write-Host "[WARNING] Could not verify vitest" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking @tanstack/react-query..." -ForegroundColor Yellow
try {
    $queryCheck = npm list @tanstack/react-query 2>&1 | Select-String "@tanstack/react-query@"
    if ($queryCheck) {
        Write-Host "[OK] @tanstack/react-query installed" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] @tanstack/react-query not found in package list" -ForegroundColor Yellow
        $allInstalled = $false
    }
} catch {
    Write-Host "[WARNING] Could not verify @tanstack/react-query" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host " Installation Complete!" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

if ($allInstalled) {
    Write-Host "✓ All packages installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠ Some packages may need verification" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run tests:           npm test" -ForegroundColor White
Write-Host "  2. Test UI:             npm run test:ui" -ForegroundColor White
Write-Host "  3. Coverage:            npm run test:coverage" -ForegroundColor White
Write-Host "  4. Start app:           npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "See INSTALLATION_NEXT_STEPS.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
