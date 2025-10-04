import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68ad259cad06f653d7d2b9ee", 
  requiresAuth: true // Ensure authentication is required for all operations
});
