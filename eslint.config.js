/**
 * @fileoverview ESLint configuration for Financial $hift
 * @description Flat config format with React, hooks, and refresh plugins
 */

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * ESLint flat configuration
 * @see https://eslint.org/docs/latest/use/configure/
 */
export default [
  // Ignore build output
  { 
    ignores: ['dist', 'coverage', 'node_modules', '*.config.js'],
  },
  
  // Main configuration for JS/JSX files
  {
    files: ['**/*.{js,jsx}'],
    
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
    },
  },
];
