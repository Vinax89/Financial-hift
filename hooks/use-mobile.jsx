/**
 * @fileoverview Mobile device detection hook
 * @description Detects if user is on mobile device based on screen width
 * with responsive updates on window resize
 */

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Detect if user is on mobile device (< 768px)
 * @returns {boolean} True if on mobile device
 * @example
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   return <MobileView />;
 * }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}
