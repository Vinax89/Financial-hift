/**
 * FocusTrap Wrapper Component
 * 
 * Automatically manages focus within modal/dialog content to improve accessibility.
 * Prevents keyboard focus from leaving the modal while it's open.
 * 
 * Features:
 * - Traps focus within children
 * - Returns focus to trigger element on close
 * - Works with Escape key
 * - Auto-focuses first focusable element
 * 
 * @example
 * ```jsx
 * <AnimatePresence>
 *   {showModal && (
 *     <FloatingElement>
 *       <FocusTrapWrapper>
 *         <ThemedCard>
 *           <form>...</form>
 *         </ThemedCard>
 *       </FocusTrapWrapper>
 *     </FloatingElement>
 *   )}
 * </AnimatePresence>
 * ```
 */

import React, { useRef, useEffect } from 'react';
import { FocusTrap } from '@/utils/accessibility';

export function FocusTrapWrapper({ children, enabled = true, onEscape }) {
  const containerRef = useRef(null);
  const focusTrapRef = useRef(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Create and activate focus trap
    focusTrapRef.current = new FocusTrap(containerRef.current);
    focusTrapRef.current.activate();

    // Handle escape key if callback provided
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    if (onEscape) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup on unmount
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
      if (onEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [enabled, onEscape]);

  return (
    <div ref={containerRef} className="focus-trap-container">
      {children}
    </div>
  );
}

/**
 * Hook to manage focus trap manually
 */
export function useFocusTrap(ref, enabled = true) {
  const focusTrapRef = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    focusTrapRef.current = new FocusTrap(ref.current);
    focusTrapRef.current.activate();

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
    };
  }, [ref, enabled]);

  return focusTrapRef.current;
}

export default FocusTrapWrapper;
