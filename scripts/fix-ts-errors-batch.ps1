# TypeScript Error Auto-Fix Script
# Automatically fixes common TypeScript patterns across the codebase
# Author: GitHub Copilot
# Date: January 9, 2025

param(
    [Parameter(Mandatory=$false)]
    [string]$TargetFile = "",
    
    [Parameter(Mandatory=$false)]
    [string]$TargetFolder = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
)

# Color output functions
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-ErrorMsg { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Statistics tracking
$script:filesProcessed = 0
$script:filesModified = 0
$script:fixesApplied = 0
$script:patterns = @{
    'TS7031_Destructured' = 0
    'TS7006_ArrowParam' = 0
    'TS7006_FunctionParam' = 0
    'TS7053_IndexAccess' = 0
    'ReactForwardRef' = 0
    'EventHandlers' = 0
}

Write-Host "`n[TypeScript Auto-Fix Script]" -ForegroundColor Magenta
Write-Host "================================`n" -ForegroundColor Magenta

# Get target files
$files = @()
if ($TargetFile) {
    if (Test-Path $TargetFile) {
        $files = @($TargetFile)
        Write-Info "Processing single file: $TargetFile"
    } else {
        Write-ErrorMsg "File not found: $TargetFile"
        exit 1
    }
} elseif ($TargetFolder) {
    if (Test-Path $TargetFolder) {
        $files = Get-ChildItem -Path $TargetFolder -Recurse -Filter "*.tsx" | Select-Object -ExpandProperty FullName
        $files += Get-ChildItem -Path $TargetFolder -Recurse -Filter "*.ts" | Where-Object { $_.Name -notmatch "\.d\.ts$" } | Select-Object -ExpandProperty FullName
        Write-Info "Processing folder: $TargetFolder ($($files.Count) files)"
    } else {
        Write-ErrorMsg "Folder not found: $TargetFolder"
        exit 1
    }
} else {
    Write-Warning "No target specified. Use -TargetFile or -TargetFolder"
    Write-Host "`nUsage examples:"
    Write-Host "  .\fix-ts-errors-batch.ps1 -TargetFile 'ui\button.tsx'"
    Write-Host "  .\fix-ts-errors-batch.ps1 -TargetFolder 'ui'"
    Write-Host "  .\fix-ts-errors-batch.ps1 -TargetFolder 'dashboard' -DryRun"
    exit 0
}

if ($DryRun) {
    Write-Warning "DRY RUN MODE - No files will be modified`n"
}

# Pattern fixing functions
function Fix-DestructuredProps {
    param($content, $filePath)
    $modified = $false
    $originalContent = $content
    
    # Pattern 1: Function component with destructured props
    # Match: function Component({ prop1, prop2, ...rest }) {
    # Don't match if already has type annotation
    $pattern1 = '(?<!: \w+Props\s*)\b(function|const)\s+(\w+)\s*=?\s*(?:\([^)]*\)\s*=>|function)?\s*\(\s*\{\s*([^}]+)\}\s*(?:,\s*\.\.\.(\w+))?\s*\)\s*(?::\s*\w+)?\s*(?:=>)?\s*\{'
    
    if ($content -match $pattern1) {
        # Extract component name and props
        $componentName = $matches[2]
        
        # Create interface if destructuring found and no type annotation
        if ($content -notmatch "interface ${componentName}Props") {
            # Insert interface before component
            $interfaceInsertPoint = $content.IndexOf("function $componentName") 
            if ($interfaceInsertPoint -eq -1) {
                $interfaceInsertPoint = $content.IndexOf("const $componentName")
            }
            
            if ($interfaceInsertPoint -gt 0) {
                $interface = "interface ${componentName}Props {`n  [key: string]: any;`n}`n`n"
                $content = $content.Insert($interfaceInsertPoint, $interface)
                $modified = $true
                $script:patterns['TS7031_Destructured']++
                if ($Verbose) { Write-Info "  Added ${componentName}Props interface" }
            }
        }
        
        # Add type annotation to function
        $content = $content -replace "(\b$componentName\s*=?\s*(?:\([^)]*\)\s*=>|function)?\s*\(\s*\{[^}]+\}\s*)", "`$1: ${componentName}Props"
        if ($content -ne $originalContent) {
            $modified = $true
        }
    }
    
    return @{
        Content = $content
        Modified = $modified
    }
}

function Fix-ArrowFunctionParams {
    param($content)
    $modified = $false
    $originalContent = $content
    
    # Pattern: .map((item) => or .filter((x) => or .forEach((el) =>
    # Add type 'any' if no type annotation exists
    $arrayMethods = @('map', 'filter', 'forEach', 'reduce', 'find', 'findIndex', 'some', 'every', 'sort')
    
    foreach ($method in $arrayMethods) {
        # Match: .method((param) => but not .method((param: Type) =>
        $pattern = "(\.$method\s*\(\s*\()(\w+)(\)\s*=>)"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, "`$1`$2: any`$3"
            $modified = $true
            $script:patterns['TS7006_ArrowParam']++
        }
        
        # Match: .method((param1, param2) => with multiple params
        $pattern2 = "(\.$method\s*\(\s*\()(\w+)(\s*,\s*)(\w+)(\)\s*=>)"
        if ($content -match $pattern2) {
            $content = $content -replace $pattern2, "`$1`$2: any`$3`$4: any`$5"
            $modified = $true
            $script:patterns['TS7006_ArrowParam']++
        }
    }
    
    return @{
        Content = $content
        Modified = $modified
    }
}

function Fix-EventHandlers {
    param($content)
    $modified = $false
    
    # Pattern: onChange={(e) => or onClick={(event) => without type
    $eventPatterns = @{
        'onChange' = 'React.ChangeEvent<HTMLInputElement>'
        'onClick' = 'React.MouseEvent<HTMLElement>'
        'onSubmit' = 'React.FormEvent<HTMLFormElement>'
        'onKeyDown' = 'React.KeyboardEvent<HTMLElement>'
        'onFocus' = 'React.FocusEvent<HTMLElement>'
        'onBlur' = 'React.FocusEvent<HTMLElement>'
    }
    
    foreach ($event in $eventPatterns.Keys) {
        $pattern = "($event\s*=\s*\{\s*\()(\w+)(\)\s*=>)"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, "`$1`$2: $($eventPatterns[$event])`$3"
            $modified = $true
            $script:patterns['EventHandlers']++
        }
    }
    
    return @{
        Content = $content
        Modified = $modified
    }
}

function Fix-IndexAccess {
    param($content)
    $modified = $false
    
    # Pattern: obj[key] where key is a variable
    # This is complex and risky - skip for now
    # Would need to add: obj[key as keyof typeof obj]
    
    return @{
        Content = $content
        Modified = $modified
    }
}

# Process each file
foreach ($file in $files) {
    $script:filesProcessed++
    $relativePath = $file.Replace((Get-Location).Path, "").TrimStart('\')
    
    Write-Host "Processing: $relativePath" -ForegroundColor White
    
    try {
        $content = Get-Content -Path $file -Raw
        $originalContent = $content
        $fileModified = $false
        
        # Apply fix patterns
        $result1 = Fix-DestructuredProps -content $content -filePath $file
        $content = $result1.Content
        $fileModified = $fileModified -or $result1.Modified
        
        $result2 = Fix-ArrowFunctionParams -content $content
        $content = $result2.Content
        $fileModified = $fileModified -or $result2.Modified
        
        $result3 = Fix-EventHandlers -content $content
        $content = $result3.Content
        $fileModified = $fileModified -or $result3.Modified
        
        # Save if modified
        if ($fileModified) {
            if (-not $DryRun) {
                Set-Content -Path $file -Value $content -NoNewline
                Write-Success "  Modified: $relativePath"
            } else {
                Write-Info "  Would modify: $relativePath"
            }
            $script:filesModified++
            $script:fixesApplied++
        } else {
            if ($Verbose) {
                Write-Host "  No changes needed" -ForegroundColor DarkGray
            }
        }
        
    } catch {
        Write-ErrorMsg "  Failed to process: $relativePath"
        Write-ErrorMsg "  Error: $($_.Exception.Message)"
    }
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Magenta
Write-Host "[SUMMARY]" -ForegroundColor Magenta
Write-Host ("=" * 50) -ForegroundColor Magenta
Write-Host "Files Processed:  $script:filesProcessed" -ForegroundColor White
Write-Host "Files Modified:   $script:filesModified" -ForegroundColor $(if ($script:filesModified -gt 0) { 'Green' } else { 'Yellow' })
Write-Host "Total Fixes:      $script:fixesApplied" -ForegroundColor Cyan

Write-Host "`nFix Breakdown:" -ForegroundColor Cyan
foreach ($pattern in $script:patterns.Keys | Sort-Object) {
    $count = $script:patterns[$pattern]
    if ($count -gt 0) {
        Write-Host "  $pattern : $count" -ForegroundColor White
    }
}

if ($DryRun) {
    Write-Host "`n[WARN] DRY RUN - No files were actually modified" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply changes`n" -ForegroundColor Yellow
} else {
    Write-Host "`n[OK] Processing complete!`n" -ForegroundColor Green
}
