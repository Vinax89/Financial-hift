/**
 * @fileoverview Global Keyboard Shortcuts Hook
 * @description Provides global keyboard shortcuts for navigation and actions
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface GlobalShortcutsOptions {
  onCommandPalette?: () => void;
  enabled?: boolean;
}

/**
 * Hook for global keyboard shortcuts
 * Ctrl+1-9 for navigation, Ctrl+H for home, Ctrl+K for command palette
 */
export function useGlobalShortcuts({
  onCommandPalette,
  enabled = true,
}: GlobalShortcutsOptions = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input/textarea (don't trigger shortcuts)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' ||
                     target.isContentEditable;

      // Allow Ctrl+K even in inputs for command palette
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Don't trigger other shortcuts in input fields
      if (isInput) return;

      // Ctrl/Cmd modifier required for all shortcuts
      if (!e.ctrlKey && !e.metaKey) return;

      // Navigation shortcuts
      switch (e.key) {
        case 'h':
        case 'H':
          e.preventDefault();
          navigate('/');
          break;

        case '1':
          e.preventDefault();
          navigate('/dashboard');
          break;

        case '2':
          e.preventDefault();
          navigate('/transactions');
          break;

        case '3':
          e.preventDefault();
          navigate('/calendar');
          break;

        case '4':
          e.preventDefault();
          navigate('/shifts');
          break;

        case '5':
          e.preventDefault();
          navigate('/goals');
          break;

        case '6':
          e.preventDefault();
          navigate('/budget');
          break;

        case '7':
          e.preventDefault();
          navigate('/debt-control');
          break;

        case '8':
          e.preventDefault();
          navigate('/workhub');
          break;

        case '9':
          e.preventDefault();
          navigate('/settings');
          break;

        case ',':
          e.preventDefault();
          navigate('/settings');
          break;

        default:
          // No action for other keys
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, navigate, onCommandPalette]);
}

export default useGlobalShortcuts;
