// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

/**
 * @fileoverview ESLint configuration for Financial $hift
 * @description Flat config format with React, hooks, refresh plugins, and TypeScript support
 */

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/**
 * ESLint flat configuration
 * @see https://eslint.org/docs/latest/use/configure/
 */
<<<<<<< HEAD
export default [
  // Ignore build output
  { 
    ignores: ['dist', 'coverage', 'node_modules', '*.config.js', '*.config.ts'],
  },
=======
export default [// Ignore build output
{ 
  ignores: ['dist', 'coverage', 'node_modules', '*.config.js'],
}, // Main configuration for JS/JSX files
{
  files: ['**/*.{js,jsx}'],
>>>>>>> 5a48d79609c91f130ac1bd8182eca494c665ca58
  
  languageOptions: {
    ecmaVersion: 'latest',
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
  },
  
  settings: { 
    react: { version: '18.3' },
  },
  
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  
  rules: {
    // Base JavaScript rules
    ...js.configs.recommended.rules,
    
    // React rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    
    // React Hooks rules
    ...reactHooks.configs.recommended.rules,
    
<<<<<<< HEAD
    rules: {
      // Base JavaScript rules
      ...js.configs.recommended.rules,
      
      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom overrides
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off', // Using TypeScript for type checking
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      
      // React Refresh (HMR)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
=======
    // Custom overrides
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off', // Using JSDoc for prop documentation
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // React Refresh (HMR)
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
>>>>>>> 5a48d79609c91f130ac1bd8182eca494c665ca58
  },
<<<<<<< HEAD

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },

    settings: { 
      react: { version: '18.3' },
    },

    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    rules: {
      // Base JavaScript rules
      ...js.configs.recommended.rules,
      
      // TypeScript rules
      ...tseslint.configs.recommended.rules,

      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // TypeScript-specific overrides
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Disable base rule as it conflicts with TypeScript version
      'no-unused-vars': 'off',
      
      // React overrides
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off', // TypeScript provides type checking
      
      // React Refresh (HMR)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
=======
}, ...storybook.configs["flat/recommended"]];
>>>>>>> 5a48d79609c91f130ac1bd8182eca494c665ca58
