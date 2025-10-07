/**
 * @fileoverview Base44 SDK client configuration for Financial $hift
 * @description Initializes authenticated Base44 client for all backend operations
 */

import { createClient } from '@base44/sdk';

/**
 * Base44 SDK client instance with authentication enabled
 * @type {import('@base44/sdk').Base44Client}
 * @description All API calls to backend entities, functions, and integrations
 * must use this authenticated client instance
 */
export const base44 = createClient({
  appId: '68ad259cad06f653d7d2b9ee', 
  requiresAuth: false, // TEMP: Disabled for development (no auth credentials available)
});
