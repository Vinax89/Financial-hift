#!/usr/bin/env node

/**
 * TypeScript Migration Script
 * 
 * Automates the conversion of .jsx/.js files to .tsx/.ts
 * - Renames files with proper extensions
 * - Updates import statements
 * - Adds basic TypeScript annotations
 * - Creates backups before changes
 * 
 * Usage:
 *   node scripts/migrate-to-typescript.js --dry-run           # See what would change
 *   node scripts/migrate-to-typescript.js --dir utils         # Migrate specific directory
 *   node scripts/migrate-to-typescript.js --all               # Migrate all files
 *   node scripts/migrate-to-typescript.js --dir utils --apply # Actually apply changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  backupDir: path.join(__dirname, '..', '.migration-backup'),
  
  // Directories to migrate
  targetDirs: [
    'utils',
    'hooks', 
    'providers',
    'shared',
    'dashboard',
    'transactions',
    'debt',
    'paycheck',
    'shift-rules',
    'ai',
    'components',
    'ui',
    'lib',
  ],
  
  // Files to exclude
  exclude: [
    'node_modules',
    'dist',
    'build',
    '.vite',
    'vite.config.ts',
    'vitest.config.js',
    'eslint.config.js',
    'postcss.config.js',
    'tailwind.config.js',
    'playwright.config.js',
  ],
  
  // Already TypeScript - skip these
  skipIfExists: true,
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run') || !args.includes('--apply'),
    all: args.includes('--all'),
    dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || 
         (args.includes('--dir') ? args[args.indexOf('--dir') + 1] : null),
  };
}

// Create backup directory
function createBackup() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    log(`✓ Created backup directory: ${CONFIG.backupDir}`, 'green');
  }
}

// Get all files to migrate
function getFilesToMigrate(targetDir = null) {
  const files = [];
  const dirs = targetDir ? [targetDir] : CONFIG.targetDirs;
  
  for (const dir of dirs) {
    const fullPath = path.join(CONFIG.rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      log(`⚠ Directory not found: ${dir}`, 'yellow');
      continue;
    }
    
    scanDirectory(fullPath, files);
  }
  
  return files;
}

function scanDirectory(dir, files) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Skip excluded directories
    if (stat.isDirectory()) {
      if (!CONFIG.exclude.some(ex => fullPath.includes(ex))) {
        scanDirectory(fullPath, files);
      }
      continue;
    }
    
    // Check if file should be migrated
    const ext = path.extname(item);
    if (ext === '.jsx' || ext === '.js') {
      // Determine new extension
      const hasJSX = hasJSXContent(fullPath);
      const newExt = hasJSX ? '.tsx' : '.ts';
      const newPath = fullPath.replace(new RegExp(`${ext}$`), newExt);
      
      // Skip if TypeScript version already exists
      if (CONFIG.skipIfExists && fs.existsSync(newPath)) {
        continue;
      }
      
      files.push({
        oldPath: fullPath,
        newPath: newPath,
        oldExt: ext,
        newExt: newExt,
        relativePath: path.relative(CONFIG.rootDir, fullPath),
      });
    }
  }
}

// Check if file contains JSX
function hasJSXContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for JSX patterns
    return (
      content.includes('</') || 
      content.includes('<>') ||
      content.includes('React.createElement') ||
      /<[A-Z][a-zA-Z]*/.test(content) // Component tags
    );
  } catch (error) {
    return false;
  }
}

// Update import statements in a file
function updateImports(content) {
  // Update .jsx imports to .tsx
  content = content.replace(/from ['"](.+?)\.jsx['"]/g, "from '$1'");
  
  // Update .js imports to .ts (be careful with node_modules)
  content = content.replace(/from ['"](@\/[^'"]+?)\.js['"]/g, "from '$1'");
  
  return content;
}

// Add basic TypeScript annotations
function addBasicTypes(content, hasJSX) {
  // Skip if already has TypeScript syntax
  if (content.includes(': React.FC') || content.includes('interface ') || content.includes(': JSX.Element')) {
    return content;
  }
  
  // Add React.FC type to functional components
  if (hasJSX) {
    // Match: function ComponentName() {
    content = content.replace(
      /^(export\s+(?:default\s+)?function\s+([A-Z][a-zA-Z0-9]*)\s*\(\s*\)\s*\{)/gm,
      '$1'
    );
    
    // Match: const ComponentName = () => {
    content = content.replace(
      /^(export\s+(?:default\s+)?const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(\s*\)\s*=>)/gm,
      '$1'
    );
  }
  
  return content;
}

// Migrate a single file
function migrateFile(file, dryRun = true) {
  try {
    // Read original content
    const content = fs.readFileSync(file.oldPath, 'utf8');
    
    // Transform content
    let newContent = content;
    newContent = updateImports(newContent);
    newContent = addBasicTypes(newContent, file.newExt === '.tsx');
    
    if (!dryRun) {
      // Backup original file
      const backupPath = path.join(CONFIG.backupDir, file.relativePath);
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.copyFileSync(file.oldPath, backupPath);
      
      // Write new content
      fs.writeFileSync(file.newPath, newContent, 'utf8');
      
      // Remove old file if name changed
      if (file.oldPath !== file.newPath) {
        fs.unlinkSync(file.oldPath);
      }
    }
    
    return { success: true, file };
  } catch (error) {
    return { success: false, file, error: error.message };
  }
}

// Update imports in all remaining files
function updateAllImports(dryRun = true) {
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  const files = [];
  
  for (const dir of CONFIG.targetDirs) {
    const fullPath = path.join(CONFIG.rootDir, dir);
    if (fs.existsSync(fullPath)) {
      scanAllFiles(fullPath, files, extensions);
    }
  }
  
  let updatedCount = 0;
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      content = updateImports(content);
      
      if (content !== original) {
        if (!dryRun) {
          fs.writeFileSync(file, content, 'utf8');
        }
        updatedCount++;
      }
    } catch (error) {
      log(`⚠ Error updating imports in ${file}: ${error.message}`, 'yellow');
    }
  }
  
  return updatedCount;
}

function scanAllFiles(dir, files, extensions) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!CONFIG.exclude.some(ex => fullPath.includes(ex))) {
        scanAllFiles(fullPath, files, extensions);
      }
    } else {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
}

// Main execution
function main() {
  const args = parseArgs();
  
  logSection('🚀 TypeScript Migration Tool');
  
  log(`Mode: ${args.dryRun ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`, args.dryRun ? 'yellow' : 'green');
  log(`Target: ${args.dir || (args.all ? 'All directories' : 'Use --dir or --all')}`, 'cyan');
  
  if (!args.dir && !args.all) {
    log('\n❌ Please specify --dir=<directory> or --all', 'red');
    log('\nExamples:', 'cyan');
    log('  node scripts/migrate-to-typescript.js --dir=utils --dry-run');
    log('  node scripts/migrate-to-typescript.js --dir=utils --apply');
    log('  node scripts/migrate-to-typescript.js --all --apply');
    process.exit(1);
  }
  
  // Get files to migrate
  const files = getFilesToMigrate(args.dir);
  
  logSection(`📁 Found ${files.length} files to migrate`);
  
  if (files.length === 0) {
    log('✓ No files need migration!', 'green');
    return;
  }
  
  // Show preview
  log('\nFiles to migrate:', 'cyan');
  files.slice(0, 10).forEach(f => {
    log(`  ${f.relativePath} → ${path.basename(f.newPath)}`, 'blue');
  });
  
  if (files.length > 10) {
    log(`  ... and ${files.length - 10} more`, 'blue');
  }
  
  if (args.dryRun) {
    log('\n💡 This is a dry run. Use --apply to make actual changes.', 'yellow');
    log('💡 Backup will be created in .migration-backup/', 'yellow');
    return;
  }
  
  // Create backup
  createBackup();
  
  // Migrate files
  logSection('🔄 Migrating files...');
  
  const results = files.map(file => migrateFile(file, false));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success);
  
  log(`\n✓ Successfully migrated: ${successful} files`, 'green');
  
  if (failed.length > 0) {
    log(`✗ Failed: ${failed.length} files`, 'red');
    failed.forEach(f => {
      log(`  ${f.file.relativePath}: ${f.error}`, 'red');
    });
  }
  
  // Update imports
  logSection('🔗 Updating import statements...');
  const updatedImports = updateAllImports(false);
  log(`✓ Updated imports in ${updatedImports} files`, 'green');
  
  // Summary
  logSection('✅ Migration Complete!');
  log(`\n📊 Summary:`, 'bright');
  log(`  • Files migrated: ${successful}`, 'green');
  log(`  • Import statements updated: ${updatedImports}`, 'green');
  log(`  • Backup location: ${CONFIG.backupDir}`, 'cyan');
  
  log(`\n🔍 Next steps:`, 'yellow');
  log(`  1. Run: npm run type-check`);
  log(`  2. Fix any type errors`);
  log(`  3. Test build: npm run build`);
  log(`  4. Commit changes when ready`);
  
  log(`\n💾 To restore from backup if needed:`, 'cyan');
  log(`  cp -r ${CONFIG.backupDir}/* .`);
}

// Run the script
main();
