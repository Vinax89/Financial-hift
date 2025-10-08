#!/usr/bin/env node

/**
 * @fileoverview Component Generator Script
 * @description Generates a new React component with test file and story
 * Usage: npm run generate:component MyComponent [--page] [--hook]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const componentName = args[0];
const isPage = args.includes('--page');
const isHook = args.includes('--hook');

if (!componentName) {
  console.error('❌ Error: Component name is required');
  console.log('\nUsage:');
  console.log('  npm run generate:component MyComponent');
  console.log('  npm run generate:component MyPage --page');
  console.log('  npm run generate:component useMyHook --hook');
  process.exit(1);
}

// Validate component name
if (isHook && !componentName.startsWith('use')) {
  console.error('❌ Error: Hook name must start with "use"');
  process.exit(1);
}

if (!isHook && !/^[A-Z]/.test(componentName)) {
  console.error('❌ Error: Component name must start with uppercase letter');
  process.exit(1);
}

/**
 * Generate component template
 */
function generateComponent(name) {
  return `import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ${name} component
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} ${name} component
 */
export function ${name}({ className = '' }) {
  const [state, setState] = useState(null);

  return (
    <div className={\`${name.toLowerCase()} \${className}\`}>
      <h2>${name}</h2>
      <p>Component content goes here</p>
    </div>
  );
}

${name}.propTypes = {
  className: PropTypes.string,
};

export default ${name};
`;
}

/**
 * Generate page template
 */
function generatePage(name) {
  return `import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';

/**
 * ${name} page component
 * @component
 * @returns {JSX.Element} ${name} page
 */
export function ${name}() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load data on mount
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Implement data loading
      console.log('Loading ${name} data...');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">${name}</h1>
        <p className="text-muted-foreground mt-2">
          Page description goes here
        </p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            <p>Page content goes here</p>
            <Button onClick={loadData} className="mt-4">
              Refresh
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ${name};
`;
}

/**
 * Generate hook template
 */
function generateHook(name) {
  return `import { useState, useEffect, useCallback } from 'react';

/**
 * ${name} - Custom React hook
 * @param {Object} options - Hook options
 * @returns {Object} Hook return value
 */
export function ${name}(options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement hook logic
      const result = await fetchData(options);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    // Auto-execute on mount if needed
    if (options.autoExecute) {
      execute();
    }
  }, [execute, options.autoExecute]);

  return {
    data,
    loading,
    error,
    execute,
  };
}

// Helper function
async function fetchData(options) {
  // TODO: Implement data fetching
  return null;
}

export default ${name};
`;
}

/**
 * Generate test file template
 */
function generateTest(name, type) {
  if (type === 'hook') {
    return `import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}.jsx';

describe('${name}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => ${name}());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle execution', async () => {
    const { result } = renderHook(() => ${name}());
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.loading).toBe(false);
  });
});
`;
  }

  return `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}.jsx';

describe('${name}', () => {
  it('should render without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<${name} className="custom-class" />);
    const element = container.querySelector('.${name.toLowerCase()}');
    expect(element).toHaveClass('custom-class');
  });

  it('should match snapshot', () => {
    const { container } = render(<${name} />);
    expect(container).toMatchSnapshot();
  });
});
`;
}

/**
 * Generate story file template
 */
function generateStory(name) {
  return `import { ${name} } from './${name}.jsx';

export default {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export const Default = {
  args: {},
};

export const WithCustomClass = {
  args: {
    className: 'custom-styling',
  },
};
`;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write file with content
 */
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created: ${path.relative(ROOT_DIR, filePath)}`);
}

/**
 * Main generator function
 */
function generate() {
  console.log(`\n🚀 Generating ${isPage ? 'page' : isHook ? 'hook' : 'component'}: ${componentName}\n`);

  let targetDir;
  let template;
  let testType = 'component';

  if (isHook) {
    targetDir = path.join(ROOT_DIR, 'hooks');
    template = generateHook(componentName);
    testType = 'hook';
  } else if (isPage) {
    targetDir = path.join(ROOT_DIR, 'pages');
    template = generatePage(componentName);
  } else {
    targetDir = path.join(ROOT_DIR, 'components');
    template = generateComponent(componentName);
  }

  ensureDir(targetDir);

  // Create main file
  const mainFile = path.join(targetDir, `${componentName}.jsx`);
  if (fs.existsSync(mainFile)) {
    console.error(`❌ Error: ${componentName}.jsx already exists`);
    process.exit(1);
  }
  writeFile(mainFile, template);

  // Create test file
  const testFile = path.join(targetDir, `${componentName}.test.jsx`);
  writeFile(testFile, generateTest(componentName, testType));

  // Create story file (skip for hooks and pages)
  if (!isHook && !isPage) {
    const storyFile = path.join(targetDir, `${componentName}.stories.jsx`);
    writeFile(storyFile, generateStory(componentName));
  }

  console.log(`\n✨ ${componentName} generated successfully!\n`);
  console.log('Next steps:');
  console.log(`  1. Edit ${path.relative(ROOT_DIR, mainFile)}`);
  console.log(`  2. Run tests: npm test ${componentName}`);
  if (!isHook && !isPage) {
    console.log(`  3. View in Storybook: npm run storybook`);
  }
  console.log('');
}

// Run generator
generate();
