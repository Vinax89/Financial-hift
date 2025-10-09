/**
 * @fileoverview Optimized API wrapper with rate limiting and request optimization
 * @description Wraps Base44 API calls with automatic rate limiting, deduplication, and retries
 */

import { base44 } from './base44Client.js';
import {
  globalRateLimiter,
  globalDeduplicator,
  globalBatcher,
  retryWithBackoff
} from '@/utils/rateLimiter.js';

/**
 * Wrap entity methods with rate limiting and optimization
 * @param {Object} entity - Base44 entity
 * @returns {Object} Wrapped entity
 */
function wrapEntity(entity) {
  const wrapped = {};

  // Wrap common CRUD methods
  const methods = ['list', 'get', 'create', 'update', 'delete', 'query'];

  methods.forEach(method => {
    if (typeof entity[method] === 'function') {
      wrapped[method] = async (...args) => {
        const url = `${entity.name}/${method}/${JSON.stringify(args)}`;
        
        // Use deduplicator for GET operations (list, get, query)
        if (['list', 'get', 'query'].includes(method)) {
          return globalDeduplicator.execute(
            url,
            async () => {
              return globalRateLimiter.execute(
                async () => {
                  return retryWithBackoff(
                    () => entity[method](...args),
                    {
                      maxRetries: 3,
                      baseDelay: 1000,
                      shouldRetry: (error) => {
                        // Retry on rate limits and server errors
                        return error.status === 429 || error.status >= 500;
                      }
                    }
                  );
                },
                { priority: method === 'get' ? 10 : 5 } // Higher priority for single item fetches
              );
            },
            { method: 'GET' }
          );
        }

        // Mutations (create, update, delete) - no deduplication but rate limited
        return globalRateLimiter.execute(
          async () => {
            return retryWithBackoff(
              () => entity[method](...args),
              {
                maxRetries: 2,
                baseDelay: 2000,
                shouldRetry: (error) => {
                  // Only retry rate limits for mutations
                  return error.status === 429;
                }
              }
            );
          },
          { priority: 15 } // Higher priority for mutations
        );
      };
    }
  });

  // Pass through other properties
  Object.keys(entity).forEach(key => {
    if (!wrapped[key]) {
      wrapped[key] = entity[key];
    }
  });

  return wrapped;
}

/**
 * Batch create multiple items
 * @param {Object} entity - Entity to create items for
 * @param {Array} items - Items to create
 * @returns {Promise<Array>} Created items
 */
export async function batchCreate(entity, items) {
  return globalBatcher.add(
    `${entity.name}/create`,
    items,
    async (batch) => {
      // Process in chunks to avoid overwhelming the API
      const results = [];
      const chunkSize = 5;

      for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(
          chunk.map(item => 
            globalRateLimiter.execute(
              () => retryWithBackoff(() => entity.create(item))
            )
          )
        );
        results.push(...chunkResults);
      }

      return results;
    }
  );
}

/**
 * Batch update multiple items
 * @param {Object} entity - Entity to update items for
 * @param {Array} updates - Array of {id, data} objects
 * @returns {Promise<Array>} Updated items
 */
export async function batchUpdate(entity, updates) {
  return globalBatcher.add(
    `${entity.name}/update`,
    updates,
    async (batch) => {
      const results = [];
      const chunkSize = 5;

      for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(
          chunk.map(({ id, data }) =>
            globalRateLimiter.execute(
              () => retryWithBackoff(() => entity.update(id, data))
            )
          )
        );
        results.push(...chunkResults);
      }

      return results;
    }
  );
}

/**
 * Batch delete multiple items
 * @param {Object} entity - Entity to delete items from
 * @param {Array} ids - IDs to delete
 * @returns {Promise<Array>} Deletion results
 */
export async function batchDelete(entity, ids) {
  return globalBatcher.add(
    `${entity.name}/delete`,
    ids,
    async (batch) => {
      const results = [];
      const chunkSize = 5;

      for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(
          chunk.map(id =>
            globalRateLimiter.execute(
              () => retryWithBackoff(() => entity.delete(id))
            )
          )
        );
        results.push(...chunkResults);
      }

      return results;
    }
  );
}

/**
 * Invalidate cache for entity
 * @param {string} entityName - Name of entity
 */
export function invalidateCache(entityName) {
  const pattern = new RegExp(`^GET:${entityName}/`);
  globalDeduplicator.invalidate(pattern);
}

/**
 * Flush all pending batched requests
 */
export async function flushBatches() {
  await globalBatcher.flush();
}

// ============================================================================
// Optimized Entity Exports
// ============================================================================

// Financial Entities
export const Transaction = wrapEntity(base44.entities.Transaction);
export const Budget = wrapEntity(base44.entities.Budget);
export const Goal = wrapEntity(base44.entities.Goal);
export const BNPLPlan = wrapEntity(base44.entities.BNPLPlan);
export const Bill = wrapEntity(base44.entities.Bill);
export const DebtAccount = wrapEntity(base44.entities.DebtAccount);
export const Investment = wrapEntity(base44.entities.Investment);

// Shift Worker Entities
export const PaycheckSettings = wrapEntity(base44.entities.PaycheckSettings);
export const ShiftRule = wrapEntity(base44.entities.ShiftRule);
export const Shift = wrapEntity(base44.entities.Shift);
export const ForecastSnapshot = wrapEntity(base44.entities.ForecastSnapshot);

// Gamification & AI Entities
export const Gamification = wrapEntity(base44.entities.Gamification);
export const AgentTask = wrapEntity(base44.entities.AgentTask);
export const Notification = wrapEntity(base44.entities.Notification);
export const AutomationRule = wrapEntity(base44.entities.AutomationRule);

// Tax & Location Entities
export const FederalTaxConfig = wrapEntity(base44.entities.FederalTaxConfig);
export const StateTaxConfig = wrapEntity(base44.entities.StateTaxConfig);
export const ZipJurisdiction = wrapEntity(base44.entities.ZipJurisdiction);
export const CostOfLiving = wrapEntity(base44.entities.CostOfLiving);

// Subscription Entities
export const Plan = wrapEntity(base44.entities.Plan);
export const Subscription = wrapEntity(base44.entities.Subscription);

// Authentication (no wrapping needed)
export const User = base44.auth;

// Export unwrapped base44 for special cases
export { base44 };

/**
 * Get rate limiter statistics
 */
export function getRateLimiterStats() {
  return {
    rateLimiter: globalRateLimiter.getStatus(),
    deduplicator: globalDeduplicator.getStats(),
    timestamp: new Date().toISOString()
  };
}

// Log stats in development
if (import.meta.env.DEV) {
  import('@/utils/logger').then(({ logDebug }) => {
    setInterval(() => {
      const stats = getRateLimiterStats();
      if (stats.rateLimiter.queueLength > 0 || stats.deduplicator.pendingRequests > 0) {
        logDebug('📊 API Stats', stats);
      }
    }, 10000); // Every 10 seconds
  });
}
