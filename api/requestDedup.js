/**
 * @fileoverview Request deduplication utility to prevent duplicate API calls
 * @description Tracks in-flight requests and reuses promises for identical requests
 */

/**
 * Map to track pending requests
 * Key: request identifier (URL + options hash)
 * Value: Promise for the pending request
 */
const pendingRequests = new Map();

/**
 * Generate a cache key from URL and options
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {string} Cache key
 */
function getCacheKey(url, options = {}) {
  const optionsStr = JSON.stringify({
    method: options.method || 'GET',
    body: options.body,
    headers: options.headers,
  });
  return `${url}-${optionsStr}`;
}

/**
 * Fetch with automatic deduplication
 * If an identical request is already in progress, returns the existing promise
 * 
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise} Response promise
 * 
 * @example
 * // Multiple rapid calls to same endpoint will share one request
 * const data1 = await fetchWithDedup('/api/transactions');
 * const data2 = await fetchWithDedup('/api/transactions'); // Reuses promise from data1
 */
export async function fetchWithDedup(url, options = {}) {
  const key = getCacheKey(url, options);
  
  // If same request is already in flight, return existing promise
  if (pendingRequests.has(key)) {
    console.log(`[DEDUP] Reusing pending request for: ${url}`);
    return pendingRequests.get(key);
  }
  
  // Create new request
  const requestPromise = fetch(url, {
    ...options,
    signal: options.signal // Support abort signals
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(key);
    });
  
  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Clear all pending requests (useful for cleanup)
 */
export function clearPendingRequests() {
  pendingRequests.clear();
}

/**
 * Get number of pending requests (useful for debugging)
 * @returns {number} Count of pending requests
 */
export function getPendingRequestCount() {
  return pendingRequests.size;
}

/**
 * Check if a specific request is pending
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {boolean} True if request is pending
 */
export function isRequestPending(url, options = {}) {
  const key = getCacheKey(url, options);
  return pendingRequests.has(key);
}
