/**
 * @fileoverview Mobile device detection hook
 * @description Detects if user is on mobile device based on screen width
 * with responsive updates on window resize
 */

import * as React from "react";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Breakpoint for mobile devices (in pixels)
 */
const MOBILE_BREAKPOINT = 768;

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Detect if user is on mobile device (< 768px width)
 * 
 * @returns True if on mobile device
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useIsMobile();
 *   
 *   if (isMobile) {
 *     return <MobileView />;
 *   }
 *   
 *   return <DesktopView />;
 * }
 * ```
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
