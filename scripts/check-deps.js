#!/usr/bin/env node

/**
 * @fileoverview Dependency Checker Script
 * @description Checks for outdated packages, security vulnerabilities, and unused dependencies
 * Usage: npm run check:deps
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Check for outdated packages
 */
function checkOutdated() {
  console.log('\n📦 CHECKING FOR OUTDATED PACKAGES\n');

  try {
    const output = execSync('npm outdated --json', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });

    if (output) {
      const outdated = JSON.parse(output);
      const packages = Object.keys(outdated);

      if (packages.length === 0) {
        console.log('✅ All packages are up to date!');
        return;
      }

      console.log(`Found ${packages.length} outdated packages:\n`);

      packages.forEach(pkg => {
        const info = outdated[pkg];
        const current = info.current || 'N/A';
        const wanted = info.wanted || 'N/A';
        const latest = info.latest || 'N/A';

        const isMajor = wanted !== latest;
        const symbol = isMajor ? '⚠️ ' : '📌';

        console.log(`${symbol} ${pkg}`);
        console.log(`   Current: ${current}`);
        console.log(`   Wanted:  ${wanted}`);
        console.log(`   Latest:  ${latest}`);
        console.log('');
      });

      console.log('💡 Run: npm update (for minor/patch)');
      console.log('💡 Run: npm install <package>@latest (for major)');
    } else {
      console.log('✅ All packages are up to date!');
    }
  } catch (error) {
    // npm outdated exits with code 1 if there are outdated packages
    if (error.stdout) {
      const outdated = JSON.parse(error.stdout);
      const packages = Object.keys(outdated);

      if (packages.length > 0) {
        console.log(`Found ${packages.length} outdated packages:\n`);

        packages.forEach(pkg => {
          const info = outdated[pkg];
          console.log(`📌 ${pkg}: ${info.current} → ${info.latest}`);
        });
      }
    }
  }
}

/**
 * Check for security vulnerabilities
 */
function checkSecurity() {
  console.log('\n🔒 CHECKING FOR SECURITY VULNERABILITIES\n');

  try {
    execSync('npm audit --json', {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });
    console.log('✅ No security vulnerabilities found!');
  } catch (error) {
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        const vulnerabilities = audit.metadata?.vulnerabilities || {};
        const total =
          (vulnerabilities.critical || 0) +
          (vulnerabilities.high || 0) +
          (vulnerabilities.moderate || 0) +
          (vulnerabilities.low || 0);

        if (total > 0) {
          console.log('⚠️  Security vulnerabilities detected:\n');
          if (vulnerabilities.critical)
            console.log(`   🔴 Critical: ${vulnerabilities.critical}`);
          if (vulnerabilities.high)
            console.log(`   🟠 High:     ${vulnerabilities.high}`);
          if (vulnerabilities.moderate)
            console.log(`   🟡 Moderate: ${vulnerabilities.moderate}`);
          if (vulnerabilities.low)
            console.log(`   🔵 Low:      ${vulnerabilities.low}`);

          console.log('\n💡 Run: npm audit fix');
          console.log('💡 Run: npm audit fix --force (if needed)');
        }
      } catch (parseError) {
        console.log('⚠️  Could not parse audit results');
      }
    }
  }
}

/**
 * Check for unused dependencies
 */
function checkUnused() {
  console.log('\n🗑️  CHECKING FOR UNUSED DEPENDENCIES\n');

  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {});

  const sourceFiles = getAllFiles(ROOT_DIR, '.js', '.jsx', '.ts', '.tsx');
  const importedPackages = new Set();

  // Parse imports from source files
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const importMatches = content.matchAll(
        /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g
      );

      for (const match of importMatches) {
        const importPath = match[1];
        // Extract package name (handle scoped packages)
        const pkgName = importPath.startsWith('@')
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];

        if (deps.includes(pkgName)) {
          importedPackages.add(pkgName);
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });

  const unused = deps.filter(dep => !importedPackages.has(dep));

  if (unused.length > 0) {
    console.log('⚠️  Potentially unused dependencies:\n');
    unused.forEach(dep => {
      console.log(`   - ${dep}`);
    });
    console.log('\n💡 Verify these are truly unused before removing');
    console.log('💡 Run: npm uninstall <package>');
  } else {
    console.log('✅ All dependencies appear to be in use');
  }
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, ...extensions) {
  const files = [];

  function traverse(currentDir) {
    // Skip node_modules and dist
    if (
      currentDir.includes('node_modules') ||
      currentDir.includes('dist') ||
      currentDir.includes('.git')
    ) {
      return;
    }

    try {
      const items = fs.readdirSync(currentDir);

      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Skip directories we can't read
    }
  }

  if (fs.existsSync(dir)) {
    traverse(dir);
  }

  return files;
}

/**
 * Check package versions consistency
 */
function checkVersionConsistency() {
  console.log('\n📋 CHECKING VERSION CONSISTENCY\n');

  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };

  const inconsistencies = [];

  // Check for ^ vs ~ vs exact versions
  Object.entries(allDeps).forEach(([name, version]) => {
    if (version.startsWith('^') || version.startsWith('~')) {
      // This is fine
    } else if (version.match(/^\d/)) {
      inconsistencies.push(`${name}: ${version} (exact version)`);
    }
  });

  if (inconsistencies.length > 0) {
    console.log('ℹ️  Packages with exact versions:\n');
    inconsistencies.forEach(pkg => {
      console.log(`   ${pkg}`);
    });
  } else {
    console.log('✅ Version ranges are consistent');
  }
}

/**
 * Provide recommendations
 */
function provideRecommendations() {
  console.log('\n💡 RECOMMENDATIONS\n');

  const tips = [
    '1. Run npm audit regularly to catch security issues',
    '2. Keep dependencies up to date (at least monthly)',
    '3. Review major version updates before upgrading',
    '4. Remove unused dependencies to reduce bundle size',
    '5. Pin critical dependencies to specific versions',
    '6. Use package-lock.json for reproducible builds',
    '7. Consider using npm ci in CI/CD pipelines',
    '8. Document why specific versions are pinned',
  ];

  tips.forEach(tip => {
    console.log(`   ${tip}`);
  });
}

/**
 * Main check function
 */
function check() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   🔍 DEPENDENCY CHECKER');
  console.log('═══════════════════════════════════════════════════════');

  checkOutdated();
  checkSecurity();
  checkUnused();
  checkVersionConsistency();
  provideRecommendations();

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run checks
check();
