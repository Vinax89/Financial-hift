// Enhanced API Client with Caching Layer
import { createClient } from '@base44/sdk';
import { cachedFetch, CacheStrategy, setupOfflineDetection } from '@/utils/caching';

// Create base client
export const base44 = createClient({
  appId: "68ad259cad06f653d7d2b9ee", 
  requiresAuth: false // TEMP: Disabled for development
});

// Initialize offline detection
if (typeof window !== 'undefined') {
  setupOfflineDetection();
}

/**
 * Enhanced fetch wrapper with caching strategies
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {object} cacheOptions - Cache configuration
 * @returns {Promise} Response data
 */
export const cachedApiCall = async (endpoint, options = {}, cacheOptions = {}) => {
  const {
    strategy = CacheStrategy.NETWORK_FIRST,
    ttl = 5 * 60 * 1000, // 5 minutes default
    key = endpoint,
  } = cacheOptions;

  return cachedFetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, {
    strategy,
    ttl,
    key,
  });
};

/**
 * Cache strategies for different data types
 */
export const CacheStrategies = {
  // Frequently changing data - always fetch fresh, cache as backup
  TRANSACTIONS: {
    strategy: CacheStrategy.NETWORK_FIRST,
    ttl: 2 * 60 * 1000, // 2 minutes
  },
  
  // Relatively stable data - use cache first, refresh in background
  SHIFTS: {
    strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
    ttl: 10 * 60 * 1000, // 10 minutes
  },
  
  // Rarely changing data - use cache aggressively
  SHIFT_RULES: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: 60 * 60 * 1000, // 1 hour
  },
  
  // User preferences and settings - cache first
  SETTINGS: {
    strategy: CacheStrategy.CACHE_FIRST,
    ttl: 30 * 60 * 1000, // 30 minutes
  },
  
  // Analytics and reports - can be slightly stale
  ANALYTICS: {
    strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
    ttl: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * Helper to invalidate cache for specific entities
 */
export const invalidateCache = (entityType) => {
  const patterns = {
    transactions: ['/transactions', '/api/transactions'],
    shifts: ['/shifts', '/api/shifts'],
    budgets: ['/budgets', '/api/budgets'],
    debts: ['/debts', '/api/debts'],
    goals: ['/goals', '/api/goals'],
    bills: ['/bills', '/api/bills'],
  };
  
  const pattern = patterns[entityType.toLowerCase()];
  if (pattern) {
    // Invalidation logic would go here
    // For now, this is a placeholder for future implementation
    console.log(`Cache invalidated for: ${entityType}`);
  }
};

export default base44;
