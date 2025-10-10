/**
 * @fileoverview Enhanced Link Component with Prefetching
 * @description Drop-in replacement for react-router Link with intelligent prefetching
 */

import { Link as RouterLink } from 'react-router-dom';
import { usePrefetchOnHover } from '@/hooks/usePrefetch';

/**
 * Enhanced Link component with hover prefetching
 * @param {Object} props - Link props
 * @param {string} props.to - Route to navigate to
 * @param {boolean} props.prefetch - Enable/disable prefetching (default: true)
 * @param {ReactNode} props.children - Link content
 * @returns {JSX.Element} Enhanced link with prefetching
 */
export function PrefetchLink({ to, prefetch = true, children, ...props }) {
  const prefetchHandlers = usePrefetchOnHover(to);

  return (
    <RouterLink
      to={to}
      {...(prefetch ? prefetchHandlers : {})}
      {...props}
    >
      {children}
    </RouterLink>
  );
}

/**
 * Button with prefetch on hover
 * @param {Object} props - Button props
 * @param {string} props.href - Route to prefetch
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.children - Button content
 * @returns {JSX.Element} Button with prefetching
 */
export function PrefetchButton({ href, onClick, children, ...props }) {
  const prefetchHandlers = usePrefetchOnHover(href);

  return (
    <button
      {...prefetchHandlers}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default PrefetchLink;
