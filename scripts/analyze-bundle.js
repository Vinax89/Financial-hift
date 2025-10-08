#!/usr/bin/env node

/**
 * @fileoverview Bundle Analyzer Script
 * @description Analyzes bundle size, dependencies, and provides optimization suggestions
 * Usage: npm run analyze
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Analyze package.json dependencies
 */
function analyzeDependencies() {
  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};

  console.log('\n📦 DEPENDENCY ANALYSIS\n');
  console.log(`Production Dependencies: ${Object.keys(deps).length}`);
  console.log(`Dev Dependencies: ${Object.keys(devDeps).length}`);

  // Check for large packages
  const largePackages = [
    'moment',
    'lodash',
    'axios',
    'chart.js',
    'd3',
  ];

  const foundLarge = Object.keys(deps).filter(dep =>
    largePackages.some(large => dep.includes(large))
  );

  if (foundLarge.length > 0) {
    console.log('\n⚠️  Large packages detected:');
    foundLarge.forEach(pkg => {
      console.log(`   - ${pkg}`);
    });
    console.log('\n💡 Suggestions:');
    if (foundLarge.includes('moment')) {
      console.log('   • Replace moment with date-fns or dayjs');
    }
    if (foundLarge.includes('lodash')) {
      console.log('   • Use lodash-es for tree-shaking');
    }
  }

  return { deps, devDeps };
}

/**
 * Analyze bundle size from dist folder
 */
function analyzeBundleSize() {
  const distPath = path.join(ROOT_DIR, 'dist', 'assets');

  if (!fs.existsSync(distPath)) {
    console.log('\n⚠️  No build found. Run "npm run build" first.');
    return;
  }

  console.log('\n📊 BUNDLE SIZE ANALYSIS\n');

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  let totalSize = 0;
  const fileSizes = [];

  jsFiles.concat(cssFiles).forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;

    fileSizes.push({
      name: file,
      size: parseFloat(sizeKB),
      type: file.endsWith('.js') ? 'JS' : 'CSS',
    });
  });

  // Sort by size
  fileSizes.sort((a, b) => b.size - a.size);

  // Display results
  fileSizes.forEach(({ name, size, type }) => {
    const sizeStr = size.toFixed(2).padStart(8);
    const warning = size > 500 ? ' ⚠️' : '';
    console.log(`   ${type.padEnd(4)} ${sizeStr} KB  ${name}${warning}`);
  });

  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n   Total: ${totalMB} MB`);

  // Warnings
  if (totalSize > 2 * 1024 * 1024) {
    console.log('\n⚠️  Bundle size exceeds 2MB');
    console.log('💡 Consider:');
    console.log('   • Code splitting');
    console.log('   • Lazy loading routes');
    console.log('   • Tree-shaking unused code');
    console.log('   • Compressing assets');
  }

  return { totalSize, files: fileSizes };
}

/**
 * Check for duplicate dependencies
 */
function checkDuplicates() {
  const nodeModulesPath = path.join(ROOT_DIR, 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    return;
  }

  console.log('\n🔍 CHECKING FOR DUPLICATES\n');

  // Common packages that might be duplicated
  const checkPackages = [
    'react',
    'react-dom',
    'lodash',
    'axios',
    'moment',
  ];

  const duplicates = [];

  checkPackages.forEach(pkg => {
    const versions = [];
    const pkgPath = path.join(nodeModulesPath, pkg);

    if (fs.existsSync(pkgPath)) {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8')
      );
      versions.push(packageJson.version);
    }

    // Check in nested node_modules
    const nestedPath = path.join(nodeModulesPath, '@*', 'node_modules', pkg);
    // This is simplified - real implementation would need recursive search

    if (versions.length > 1) {
      duplicates.push({ pkg, versions });
    }
  });

  if (duplicates.length > 0) {
    console.log('⚠️  Potential duplicate packages:');
    duplicates.forEach(({ pkg, versions }) => {
      console.log(`   - ${pkg}: ${versions.join(', ')}`);
    });
    console.log('\n💡 Run: npm dedupe');
  } else {
    console.log('✅ No duplicate packages detected');
  }
}

/**
 * Analyze code complexity
 */
function analyzeCodeComplexity() {
  console.log('\n📈 CODE COMPLEXITY\n');

  const dirs = ['components', 'pages', 'hooks', 'utils'];
  let totalFiles = 0;
  let totalLines = 0;

  dirs.forEach(dir => {
    const dirPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = getAllFiles(dirPath, '.jsx', '.js');
    const lines = files.reduce((acc, file) => {
      const content = fs.readFileSync(file, 'utf8');
      return acc + content.split('\n').length;
    }, 0);

    totalFiles += files.length;
    totalLines += lines;

    console.log(`   ${dir.padEnd(15)} ${files.length.toString().padStart(3)} files  ${lines.toString().padStart(6)} lines`);
  });

  console.log(`\n   Total:          ${totalFiles.toString().padStart(3)} files  ${totalLines.toString().padStart(6)} lines`);
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, ...extensions) {
  const files = [];

  function traverse(currentDir) {
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
  }

  if (fs.existsSync(dir)) {
    traverse(dir);
  }

  return files;
}

/**
 * Provide optimization recommendations
 */
function provideRecommendations() {
  console.log('\n💡 OPTIMIZATION RECOMMENDATIONS\n');

  const recommendations = [
    '1. Enable Gzip/Brotli compression in production',
    '2. Implement code splitting for routes',
    '3. Lazy load heavy components',
    '4. Optimize images (WebP, lazy loading)',
    '5. Use React.memo() for expensive components',
    '6. Implement virtual scrolling for large lists',
    '7. Enable tree-shaking in build config',
    '8. Minimize third-party dependencies',
    '9. Use dynamic imports for conditional features',
    '10. Monitor bundle size in CI/CD pipeline',
  ];

  recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });
}

/**
 * Main analysis function
 */
function analyze() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   📊 BUNDLE & DEPENDENCY ANALYZER');
  console.log('═══════════════════════════════════════════════════════');

  analyzeDependencies();
  analyzeBundleSize();
  checkDuplicates();
  analyzeCodeComplexity();
  provideRecommendations();

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run analysis
analyze();
