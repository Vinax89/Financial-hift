#!/usr/bin/env node

/**
 * @fileoverview Design System Consistency Audit
 * @description Scans the codebase for inconsistent patterns and suggests improvements
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRS = [
  'dashboard',
  'analytics',
  'budget',
  'calendar',
  'debt',
  'goals',
  'transactions',
  'ui',
  'components',
  'shared',
];

// Patterns to detect
const INCONSISTENCIES = {
  hardcodedSpacing: {
    pattern: /className=["'][^"']*(?:p-\d+|m-\d+|px-\d+|py-\d+|mx-\d+|my-\d+|gap-\d+|space-[xy]-\d+)[^"']*["']/g,
    message: 'Hardcoded spacing values - should use SPACING tokens',
    suggestion: 'Import SPACING from @/design-system/DesignTokens',
  },
  hardcodedColors: {
    pattern: /className=["'][^"']*(?:bg-(?:red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d+|text-(?:red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|indigo|violet|fuchsia|rose)-\d+)[^"']*["']/g,
    message: 'Hardcoded color values - should use semantic color variables',
    suggestion: 'Use bg-background, text-foreground, bg-primary, etc.',
  },
  inconsistentButtons: {
    pattern: /<button[^>]*className=["'][^"']*(?:bg-|border-|text-)[^"']*["'][^>]*>/g,
    message: 'Raw button with custom styling - should use Button component',
    suggestion: 'Import Button from @/ui/button',
  },
  inconsistentTransitions: {
    pattern: /className=["'][^"']*transition-(?:all|colors|opacity|transform|shadow)\s+duration-\d+[^"']*["']/g,
    message: 'Custom transition timing - should use transitionStyles utility',
    suggestion: 'Import transitionStyles from @/design-system/ComponentUtils',
  },
  missingFocusRing: {
    pattern: /<(?:button|a)[^>]*onClick[^>]*(?!focus-visible)[^>]*>/g,
    message: 'Interactive element missing focus-visible styles',
    suggestion: 'Add focusRing() utility or focus-visible:ring-2',
  },
  inconsistentCards: {
    pattern: /<div[^>]*className=["'][^"']*(?:bg-card|bg-white|bg-background).*border.*rounded[^"']*["'][^>]*>/g,
    message: 'Custom card styling - should use cardStyles utility',
    suggestion: 'Import cardStyles from @/design-system/ComponentUtils',
  },
  hardcodedShadows: {
    pattern: /className=["'][^"']*shadow-(?:sm|md|lg|xl|2xl)[^"']*["']/g,
    message: 'Direct shadow classes - consider using cardStyles for consistency',
    suggestion: 'Use cardStyles({ variant: "elevated" })',
  },
  inconsistentLoading: {
    pattern: /<div[^>]*className=["'][^"']*animate-pulse.*bg-[^"']*["'][^>]*>/g,
    message: 'Custom loading skeleton - should use skeletonStyles utility',
    suggestion: 'Import skeletonStyles from @/design-system/ComponentUtils',
  },
  smallTouchTargets: {
    pattern: /className=["'][^"']*h-(?:2|3|4|5|6|7|8)[^"']*["'][^>]*(?:onClick|href)/g,
    message: 'Touch target may be too small (< 44px)',
    suggestion: 'Ensure minimum h-11 (44px) for interactive elements',
  },
};

/**
 * Scan a single file for inconsistencies
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  for (const [key, config] of Object.entries(INCONSISTENCIES)) {
    const matches = content.match(config.pattern);
    if (matches && matches.length > 0) {
      results.push({
        file: filePath,
        type: key,
        count: matches.length,
        message: config.message,
        suggestion: config.suggestion,
      });
    }
  }

  return results;
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (entry.isFile() && /\.(jsx|tsx|js|ts)$/.test(entry.name)) {
      const fileResults = scanFile(fullPath);
      results.push(...fileResults);
    }
  }

  return results;
}

/**
 * Generate audit report
 */
function generateReport() {
  console.log('\n🎨 Design System Consistency Audit\n');
  console.log('Scanning directories:', SCAN_DIRS.join(', '));
  console.log('─'.repeat(80));

  const allResults = [];

  for (const dir of SCAN_DIRS) {
    if (fs.existsSync(dir)) {
      const results = scanDirectory(dir);
      allResults.push(...results);
    }
  }

  if (allResults.length === 0) {
    console.log('\n✅ No inconsistencies found! Codebase is using design system properly.\n');
    return;
  }

  // Group by type
  const grouped = allResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return {};
  }, {});

  // Print summary
  console.log(`\n📊 Found ${allResults.length} potential inconsistencies:\n`);

  for (const [type, items] of Object.entries(grouped)) {
    const count = items.reduce((sum, item) => sum + item.count, 0);
    console.log(`\n🔍 ${type} (${count} occurrences in ${items.length} files)`);
    console.log(`   Message: ${items[0].message}`);
    console.log(`   Suggestion: ${items[0].suggestion}`);
    
    // Show top 5 affected files
    const topFiles = items
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    console.log('   Top affected files:');
    topFiles.forEach((item, idx) => {
      console.log(`     ${idx + 1}. ${item.file} (${item.count} occurrences)`);
    });
  }

  // Print action items
  console.log('\n\n📋 Action Items:\n');
  console.log('1. Review the files with most occurrences first');
  console.log('2. Gradually replace custom patterns with design system utilities');
  console.log('3. Update components to use design tokens (SPACING, TYPOGRAPHY, etc.)');
  console.log('4. Add utility imports: ComponentUtils, DesignTokens');
  console.log('5. Test theme switching after each update');
  console.log('6. Run accessibility audit for touch targets');

  console.log('\n\n📚 Resources:\n');
  console.log('- Design System Docs: design-system/DESIGN_SYSTEM.md');
  console.log('- Design Tokens: design-system/DesignTokens.ts');
  console.log('- Component Utils: design-system/ComponentUtils.ts');

  console.log('\n' + '─'.repeat(80) + '\n');
}

// Run audit
try {
  generateReport();
} catch (error) {
  console.error('❌ Audit failed:', error.message);
  process.exit(1);
}
