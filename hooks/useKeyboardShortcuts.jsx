/**
 * React Hook for Keyboard Shortcuts
 * 
 * Provides keyboard shortcuts integration with the KeyboardShortcuts utility.
 * Use this hook in page components to enable keyboard shortcuts.
 * 
 * Features:
 * - Auto cleanup on unmount
 * - Help panel integration
 * - Easy shortcut registration
 * 
 * @example
 * `jsx
 * function MyPage() {
 *   const [showForm, setShowForm] = useState(false);
 *   
 *   useKeyboardShortcuts({
 *     'ctrl+n': {
 *       action: () => setShowForm(true),
 *       description: 'Create new item'
 *     },
 *     'ctrl+s': {
 *       action: () => saveData(),
 *       description: 'Save changes',
 *       preventDefault: true
 *     }
 *   });
 *   
 *   return <div>...</div>;
 * }
 * `
 */

import { useEffect, useRef } from 'react';
import { KeyboardShortcuts } from '@/utils/accessibility';

/**
 * Hook to register keyboard shortcuts for a component
 * 
 * @param {Object} shortcuts - Map of keyboard combos to actions
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
  const shortcutsRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Create shortcuts instance if not exists
    if (!shortcutsRef.current) {
      shortcutsRef.current = new KeyboardShortcuts();
    }

    const instance = shortcutsRef.current;

    // Enable the shortcuts instance
    instance.enable();

    // Register all shortcuts
    Object.entries(shortcuts).forEach(([combo, config]) => {
      const { action, description = '', preventDefault = false } = 
        typeof config === 'function' ? { action: config } : config;

      instance.register(combo, action, description, preventDefault);
    });

    // Cleanup on unmount
    return () => {
      instance.disable();
    };
  }, [shortcuts, enabled]);

  return shortcutsRef.current;
}

/**
 * Hook to show keyboard shortcuts help panel
 * Returns a function to show the help panel
 */
export function useKeyboardShortcutsHelp() {
  const shortcutsRef = useRef(null);

  useEffect(() => {
    if (!shortcutsRef.current) {
      shortcutsRef.current = new KeyboardShortcuts();
    }
  }, []);

  return () => {
    if (shortcutsRef.current) {
      shortcutsRef.current.showHelp();
    }
  };
}

/**
 * Preset shortcuts for common actions
 */
export const ShortcutPresets = {
  // Form shortcuts
  form: (callbacks) => ({
    'ctrl+s': {
      action: callbacks.save,
      description: 'Save form',
      preventDefault: true,
    },
    'escape': {
      action: callbacks.cancel,
      description: 'Cancel/Close',
    },
  }),

  // List/table shortcuts
  list: (callbacks) => ({
    'ctrl+n': {
      action: callbacks.create,
      description: 'Create new item',
    },
    'ctrl+f': {
      action: callbacks.search,
      description: 'Search/Filter',
      preventDefault: true,
    },
    'ctrl+r': {
      action: callbacks.refresh,
      description: 'Refresh data',
      preventDefault: true,
    },
  }),

  // Navigation shortcuts
  navigation: (callbacks) => ({
    'ctrl+h': {
      action: () => callbacks.navigate('/'),
      description: 'Go to home',
    },
    'ctrl+d': {
      action: () => callbacks.navigate('/dashboard'),
      description: 'Go to dashboard',
    },
    'ctrl+t': {
      action: () => callbacks.navigate('/transactions'),
      description: 'Go to transactions',
    },
    'ctrl+shift+s': {
      action: () => callbacks.navigate('/shifts'),
      description: 'Go to shifts',
    },
  }),
