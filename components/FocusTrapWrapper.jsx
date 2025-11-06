/**
 * @fileoverview React wrapper for FocusTrap utility
 * @description Provides a React component that automatically manages focus trapping
 * for modals, dialogs, and other overlay components
 */

import React, { useEffect, useRef } from 'react';
import { createFocusTrap } from '@/utils/accessibility';

/**
 * FocusTrap Wrapper Component
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {boolean} props.active - Whether the focus trap is active
 * @param {Function} props.onEscape - Callback when Escape key is pressed
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 * 
 * @example
 * <FocusTrapWrapper active={isOpen} onEscape={handleClose}>
 *   <div className="modal">
 *     <button>Close</button>
 *   </div>
 * </FocusTrapWrapper>
 */
export function FocusTrapWrapper({ children, active = true, onEscape, className = '' }) {
    const containerRef = useRef(null);
    const focusTrapRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !active) return;

        // Create and activate focus trap
        focusTrapRef.current = createFocusTrap(containerRef.current);
        focusTrapRef.current.activate();

        // Handle Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onEscape) {
                onEscape();
            }
        };

        if (onEscape) {
            document.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup
        return () => {
            if (focusTrapRef.current) {
                focusTrapRef.current.deactivate();
            }
            if (onEscape) {
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [active, onEscape]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
}

export default FocusTrapWrapper;
