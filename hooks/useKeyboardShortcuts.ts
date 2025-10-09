/**
 * @fileoverview React Hook for Keyboard Shortcuts
 * @description Provides keyboard shortcuts integration with the KeyboardShortcuts utility
 *
 * Features:
 * - Auto cleanup on unmount
 * - Help panel integration
 * - Easy shortcut registration
 * - Type-safe shortcuts configuration
 *
 * @example
 * ```tsx
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
 * ```
 */

import { useEffect, useRef } from 'react';
import { KeyboardShortcuts } from '@/utils/accessibility';

/**
 * Keyboard shortcut configuration
 */
export interface ShortcutConfig {
  /** Function to execute when shortcut is triggered */
  action: () => void;
  /** Description shown in help panel */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Map of keyboard combinations to configurations
 */
export type ShortcutsMap = Record<string, ShortcutConfig | (() => void)>;

/**
 * Callbacks for preset shortcuts
 */
export interface ShortcutCallbacks {
  save?: () => void;
  cancel?: () => void;
  create?: () => void;
  search?: () => void;
  refresh?: () => void;
  navigate?: (path: string) => void;
  close?: () => void;
  submit?: () => void;
  commandPalette?: () => void;
  help?: () => void;
}

/**
 * Hook to register keyboard shortcuts for a component
 *
 * @param shortcuts - Map of keyboard combos to actions
 * @param enabled - Whether shortcuts are enabled
 * @returns The KeyboardShortcuts instance or null
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutsMap = {},
  enabled: boolean = true
): KeyboardShortcuts | null {
  const shortcutsRef = useRef<KeyboardShortcuts | null>(null);

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

      instance.register(combo, action, { description, preventDefault });
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
export function useKeyboardShortcutsHelp(): () => void {
  const shortcutsRef = useRef<KeyboardShortcuts | null>(null);

  useEffect(() => {
    if (!shortcutsRef.current) {
      shortcutsRef.current = new KeyboardShortcuts();
    }
  }, []);

import { logDebug } from '@/utils/logger';

  return () => {
    if (shortcutsRef.current) {
      // Get all shortcuts and display them
      const shortcuts = shortcutsRef.current.getAll();
      logDebug('Available keyboard shortcuts', shortcuts);
      // TODO: Implement help panel UI
    }
  };
}

/**
 * Preset shortcuts for common actions
 */
export const ShortcutPresets = {
  /**
   * Form shortcuts (save, cancel)
   */
  form: (callbacks: ShortcutCallbacks): ShortcutsMap => ({
    'ctrl+s': {
      action: callbacks.save!,
      description: 'Save form',
      preventDefault: true,
    },
    escape: {
      action: callbacks.cancel!,
      description: 'Cancel/Close',
    },
  }),

  /**
   * List/table shortcuts (create, search, refresh)
   */
  list: (callbacks: ShortcutCallbacks): ShortcutsMap => ({
    'ctrl+n': {
      action: callbacks.create!,
      description: 'Create new item',
    },
    'ctrl+f': {
      action: callbacks.search!,
      description: 'Search/Filter',
      preventDefault: true,
    },
    'ctrl+r': {
      action: callbacks.refresh!,
      description: 'Refresh data',
      preventDefault: true,
    },
  }),

  /**
   * Navigation shortcuts (home, dashboard, pages)
   */
  navigation: (callbacks: ShortcutCallbacks): ShortcutsMap => ({
    'ctrl+h': {
      action: () => callbacks.navigate!('/'),
      description: 'Go to home',
    },
    'ctrl+d': {
      action: () => callbacks.navigate!('/dashboard'),
      description: 'Go to dashboard',
    },
    'ctrl+t': {
      action: () => callbacks.navigate!('/transactions'),
      description: 'Go to transactions',
    },
    'ctrl+shift+s': {
      action: () => callbacks.navigate!('/shifts'),
      description: 'Go to shifts',
    },
  }),

  /**
   * Modal shortcuts (close, submit)
   */
  modal: (callbacks: ShortcutCallbacks): ShortcutsMap => ({
    escape: {
      action: callbacks.close!,
      description: 'Close modal',
    },
    'ctrl+enter': {
      action: callbacks.submit!,
      description: 'Submit',
      preventDefault: true,
    },
  }),

  /**
   * Dashboard shortcuts (command palette, help)
   */
  dashboard: (callbacks: ShortcutCallbacks): ShortcutsMap => ({
    'ctrl+k': {
      action: callbacks.commandPalette!,
      description: 'Open command palette',
      preventDefault: true,
    },
    '?': {
      action: callbacks.help!,
      description: 'Show keyboard shortcuts',
    },
  }),
};

/**
 * Options for page shortcuts hook
 */
export interface PageShortcutsOptions {
  onCreate?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}

/**
 * Hook for common page shortcuts (create, search, refresh, help)
 */
export function usePageShortcuts({
  onCreate,
  onSearch,
  onRefresh,
  onHelp,
  enabled = true,
}: PageShortcutsOptions): void {
  const shortcuts: ShortcutsMap = {};

  if (onCreate) {
    shortcuts['ctrl+n'] = {
      action: onCreate,
      description: 'Create new item',
    };
  }

  if (onSearch) {
    shortcuts['ctrl+k'] = {
      action: onSearch,
      description: 'Search',
      preventDefault: true,
    };
  }

  if (onRefresh) {
    shortcuts['ctrl+r'] = {
      action: onRefresh,
      description: 'Refresh',
      preventDefault: true,
    };
  }

  if (onHelp) {
    shortcuts['?'] = {
      action: onHelp,
      description: 'Show keyboard shortcuts help',
    };
  }

  useKeyboardShortcuts(shortcuts, enabled);
}

/**
 * Options for form shortcuts hook
 */
export interface FormShortcutsOptions {
  onSave?: () => void;
  onCancel?: () => void;
  enabled?: boolean;
}

/**
 * Hook for form shortcuts (save, cancel)
 */
export function useFormShortcuts({
  onSave,
  onCancel,
  enabled = true,
}: FormShortcutsOptions): void {
  const shortcuts: ShortcutsMap = {};

  if (onSave) {
    shortcuts['ctrl+s'] = {
      action: onSave,
      description: 'Save form',
      preventDefault: true,
    };
  }

  if (onCancel) {
    shortcuts['escape'] = {
      action: onCancel,
      description: 'Cancel',
    };
  }

  useKeyboardShortcuts(shortcuts, enabled);
}

export default useKeyboardShortcuts;

