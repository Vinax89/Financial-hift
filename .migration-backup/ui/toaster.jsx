/**
 * @fileoverview Toaster component re-export
 * @description Convenience re-export of Sonner toaster
 */

import React from 'react';
import { Toaster as SonnerToaster } from '@/ui/sonner';

/**
 * Toaster component (re-exported from sonner)
 * @component
 * @param {Object} props - Toaster props
 * @returns {JSX.Element} Toast notification container
 */
export function Toaster(props) {
  return <SonnerToaster {...props} />;
}

export default Toaster;
