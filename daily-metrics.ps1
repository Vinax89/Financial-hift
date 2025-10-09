# Daily Progress Metrics for Financial-hift
# Run this script each morning to track improvement progress

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "         DAILY PROGRESS REPORT - Financial-hift" -ForegroundColor Green
Write-Host "         $(Get-Date -Format 'MMMM dd, yyyy - HH:mm')" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ============================================================================
# File Counts
# ============================================================================

Write-Host "📁 CODE BASE METRICS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

$totalFiles = (Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.jsx","*.js" -Exclude "node_modules","dist","docs",".migration-backup" | Measure-Object).Count
$tsFiles = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules","dist","docs",".migration-backup" | Measure-Object).Count

Write-Host "Total Source Files:     $totalFiles"
Write-Host "TypeScript Files:       $tsFiles"

# ============================================================================
# Documentation Coverage
# ============================================================================

Write-Host "`n📚 DOCUMENTATION PROGRESS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

$documented = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules","dist","docs",".migration-backup" | 
               Select-String -Pattern "@packageDocumentation" -List | 
               Measure-Object).Count

$docsPercent = if ($tsFiles -gt 0) { [math]::Round(($documented / $tsFiles) * 100, 2) } else { 0 }

Write-Host "Documented Files:       $documented / $tsFiles"
Write-Host "Coverage:               $docsPercent%"

if ($docsPercent -lt 10) {
    Write-Host "Status:                 🔴 Critical" -ForegroundColor Red
} elseif ($docsPercent -lt 50) {
    Write-Host "Status:                 ⚠️  Needs Work" -ForegroundColor Yellow
} elseif ($docsPercent -lt 80) {
    Write-Host "Status:                 🟡 Good Progress" -ForegroundColor Yellow
} else {
    Write-Host "Status:                 ✅ Excellent" -ForegroundColor Green
}

# ============================================================================
# Type Safety Metrics
# ============================================================================

Write-Host "`n🔍 TYPE SAFETY METRICS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

$anyCount = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules","dist","docs",".migration-backup" | 
             Select-String -Pattern ": any\b" | 
             Measure-Object).Count

Write-Host "'any' Usage:            $anyCount occurrences"

if ($anyCount -lt 100) {
    Write-Host "Status:                 ✅ Excellent" -ForegroundColor Green
} elseif ($anyCount -lt 500) {
    Write-Host "Status:                 🟡 Good" -ForegroundColor Yellow
} elseif ($anyCount -lt 2000) {
    Write-Host "Status:                 ⚠️  Needs Work" -ForegroundColor Yellow
} else {
    Write-Host "Status:                 🔴 Critical" -ForegroundColor Red
}

$nocheckCount = (Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Exclude "node_modules","dist","docs",".migration-backup" | 
                Select-String -Pattern "@ts-nocheck" -List | 
                Measure-Object).Count

Write-Host "`n@ts-nocheck Files:      $nocheckCount"

if ($nocheckCount -eq 0) {
    Write-Host "Status:                 ✅ Perfect!" -ForegroundColor Green
} elseif ($nocheckCount -lt 50) {
    Write-Host "Status:                 🟡 Almost There" -ForegroundColor Yellow
} elseif ($nocheckCount -lt 150) {
    Write-Host "Status:                 ⚠️  Needs Work" -ForegroundColor Yellow
} else {
    Write-Host "Status:                 🔴 Needs Attention" -ForegroundColor Red
}

# ============================================================================
# Code Quality Metrics
# ============================================================================

Write-Host "`n🧹 CODE QUALITY METRICS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

$consoleCount = (Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.jsx","*.js" -Exclude "node_modules","dist","docs",".migration-backup","*.test.*","*.spec.*" | 
                Select-String -Pattern "console\.log" | 
                Measure-Object).Count

Write-Host "console.log:            $consoleCount statements"

if ($consoleCount -eq 0) {
    Write-Host "Status:                 ✅ Clean" -ForegroundColor Green
} elseif ($consoleCount -lt 100) {
    Write-Host "Status:                 🟡 Almost Clean" -ForegroundColor Yellow
} else {
    Write-Host "Status:                 🔴 Needs Cleanup" -ForegroundColor Red
}

$todoCount = (Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.jsx","*.js" -Exclude "node_modules","dist","docs",".migration-backup" | 
             Select-String -Pattern "// TODO|// FIXME" | 
             Measure-Object).Count

Write-Host "`nTODO/FIXME Comments:    $todoCount"

if ($todoCount -eq 0) {
    Write-Host "Status:                 ✅ All Tracked" -ForegroundColor Green
} elseif ($todoCount -lt 50) {
    Write-Host "Status:                 🟡 Manageable" -ForegroundColor Yellow
} else {
    Write-Host "Status:                 ⚠️  Should Track in Issues" -ForegroundColor Yellow
}

# ============================================================================
# TypeScript Compilation Check
# ============================================================================

Write-Host "`n⚙️  TYPESCRIPT COMPILATION" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

Write-Host "Running type check... " -NoNewline
$tscOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 0 errors" -ForegroundColor Green
} else {
    $errorCount = ($tscOutput | Select-String -Pattern "error TS" | Measure-Object).Count
    Write-Host "⚠️  $errorCount errors" -ForegroundColor Red
}

# ============================================================================
# Progress vs. Targets
# ============================================================================

Write-Host "`n🎯 PROGRESS VS TARGETS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

# Documentation Target: 80%
$docsTarget = 80
$docsProgress = [math]::Min(100, [math]::Round(($docsPercent / $docsTarget) * 100, 1))
Write-Host "Documentation:          $docsPercent% / $docsTarget% target ($docsProgress% progress)"

# 'any' Target: <100
$anyTarget = 100
if ($anyCount -le $anyTarget) {
    Write-Host "'any' Reduction:        ✅ Target Achieved!" -ForegroundColor Green
} else {
    $anyProgress = [math]::Round((1 - ($anyCount / 5341)) * 100, 1)
    Write-Host "'any' Reduction:        $anyCount / $anyTarget target ($anyProgress% reduced from baseline)"
}

# @ts-nocheck Target: 0
if ($nocheckCount -eq 0) {
    Write-Host "@ts-nocheck:            ✅ Target Achieved!" -ForegroundColor Green
} else {
    $nocheckProgress = [math]::Round((1 - ($nocheckCount / 335)) * 100, 1)
    Write-Host "@ts-nocheck:            $nocheckCount remaining ($nocheckProgress% completed)"
}

# console.log Target: 0
if ($consoleCount -eq 0) {
    Write-Host "console.log:            ✅ Target Achieved!" -ForegroundColor Green
} else {
    $consoleProgress = [math]::Round((1 - ($consoleCount / 1646)) * 100, 1)
    Write-Host "console.log:            $consoleCount remaining ($consoleProgress% cleaned)"
}

# ============================================================================
# Overall Score
# ============================================================================

Write-Host "`n📊 OVERALL HEALTH SCORE" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

# Calculate weighted score
$tsScore = if ($LASTEXITCODE -eq 0) { 100 } else { 0 }
$docsScore = $docsPercent / 80 * 100 # Target is 80%
$anyScore = [math]::Max(0, (1 - ($anyCount / 5341)) * 100)
$nocheckScore = [math]::Max(0, (1 - ($nocheckCount / 335)) * 100)
$consoleScore = [math]::Max(0, (1 - ($consoleCount / 1646)) * 100)

$overallScore = [math]::Round((
    $tsScore * 0.3 +       # 30% weight - most important
    $docsScore * 0.25 +    # 25% weight
    $anyScore * 0.20 +     # 20% weight
    $nocheckScore * 0.15 + # 15% weight
    $consoleScore * 0.10   # 10% weight
), 1)

Write-Host "Overall Health Score:   $overallScore / 100"

if ($overallScore -ge 90) {
    Write-Host "Grade:                  A (Excellent)" -ForegroundColor Green
} elseif ($overallScore -ge 80) {
    Write-Host "Grade:                  B (Good)" -ForegroundColor Green
} elseif ($overallScore -ge 70) {
    Write-Host "Grade:                  C (Fair)" -ForegroundColor Yellow
} elseif ($overallScore -ge 60) {
    Write-Host "Grade:                  D (Needs Work)" -ForegroundColor Yellow
} else {
    Write-Host "Grade:                  F (Critical)" -ForegroundColor Red
}

# ============================================================================
# Today's Recommendations
# ============================================================================

Write-Host "`n💡 TODAY'S FOCUS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────`n" -ForegroundColor Gray

if ($docsPercent -lt 10) {
    Write-Host "🔴 PRIORITY: Start documenting API files (api/, hooks/, utils/)"
}

if ($consoleCount -gt 1000) {
    Write-Host "🔴 PRIORITY: Remove console.log statements (create logger.ts)"
}

if ($anyCount -gt 5000) {
    Write-Host "⚠️  Focus: Start replacing 'any' types in API responses"
}

if ($nocheckCount -gt 300) {
    Write-Host "⚠️  Focus: Fix @ts-nocheck in critical files (api, hooks)"
}

if ($overallScore -lt 50) {
    Write-Host "`n🎯 Suggested Action: Focus on Phase 1 Critical Issues"
} elseif ($overallScore -lt 70) {
    Write-Host "`n🎯 Suggested Action: Continue with Phase 2 Type Safety"
} elseif ($overallScore -lt 85) {
    Write-Host "`n🎯 Suggested Action: Push forward with Phase 3 Documentation"
} else {
    Write-Host "`n🎯 Suggested Action: Polish with Phase 4 Quality Improvements"
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Keep up the great work! Every improvement counts! 💪" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ============================================================================
# Historical Tracking (Optional)
# ============================================================================

# Save today's metrics to history file
$historyFile = "metrics-history.csv"
$today = Get-Date -Format "yyyy-MM-dd"
$metricsLine = "$today,$docsPercent,$anyCount,$nocheckCount,$consoleCount,$overallScore"

if (-not (Test-Path $historyFile)) {
    "Date,DocsPercent,AnyCount,NocheckCount,ConsoleCount,OverallScore" | Out-File $historyFile
}

$metricsLine | Add-Content $historyFile

Write-Host "📈 Metrics saved to $historyFile" -ForegroundColor Gray
Write-Host "`n"
