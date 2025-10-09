// @ts-nocheck
/**
 * @fileoverview Focus trap wrapper for accessible modal/dialog interactions
 * @description Manages keyboard focus within modal content for improved accessibility
 */

import React, { useRef, useEffect } from 'react';
import { FocusTrap } from '@/utils/accessibility';

/**
 * Focus trap wrapper component for modals and dialogs
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to trap focus within
 * @param {boolean} [props.enabled=true] - Enable/disable focus trap
 * @param {Function} [props.onEscape] - Callback for Escape key press
 * @returns {JSX.Element} Focus trap container
 * @example
 * <AnimatePresence>
 *   {showModal && (
 *     <FloatingElement>
 *       <FocusTrapWrapper onEscape={() => setShowModal(false)}>
 *         <ThemedCard>
 *           <form>...</form>
 *         </ThemedCard>
 *       </FocusTrapWrapper>
 *     </FloatingElement>
 *   )}
 * </AnimatePresence>
 * 
 * @features
 * - Traps focus within children
 * - Returns focus to trigger element on close
 * - Handles Escape key
 * - Auto-focuses first focusable element
 */
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
 * @param {React.RefObject} ref - Reference to container element
 * @param {boolean} [enabled=true] - Enable/disable focus trap
 * @returns {FocusTrap|null} Focus trap instance or null
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

