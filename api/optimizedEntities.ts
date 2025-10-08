/**
 * @fileoverview Optimized API wrapper with rate limiting and request optimization
 * @description Wraps Base44 API calls with automatic rate limiting, deduplication, and retries
 * for all entity operations with comprehensive TypeScript support
 */

import { base44 } from './base44Client.js';
import {
  globalRateLimiter,
  globalDeduplicator,
  globalBatcher,
  retryWithBackoff,
  RateLimiterStatus,
  DeduplicatorStats,
  RetryOptions
} from '@/utils/rateLimiter';

// ============================================================================
// TYPE DEFINITIONS - Base44 Entity Types
// ============================================================================

/**
 * Base interface for all entities with common fields
 */
export interface BaseEntity {
  /** Unique identifier */
  id: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
  /** User ID who owns this entity */
  user_id?: string;
}

/**
 * Transaction entity type
 */
export interface Transaction extends BaseEntity {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  account?: string;
  notes?: string;
  tags?: string[];
  is_recurring?: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Budget entity type
 */
export interface Budget extends BaseEntity {
  category: string;
  monthly_limit: number;
  current_spent?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  rollover_enabled?: boolean;
}

/**
 * Goal entity type
 */
export interface Goal extends BaseEntity {
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  is_completed?: boolean;
  completed_date?: string;
}

/**
 * BNPL (Buy Now Pay Later) Plan entity type
 */
export interface BNPLPlan extends BaseEntity {
  merchant: string;
  total_amount: number;
  remaining_amount: number;
  payment_amount: number;
  payment_frequency: 'weekly' | 'biweekly' | 'monthly';
  next_payment_date: string;
  num_payments_remaining: number;
  is_autopay?: boolean;
}

/**
 * Bill entity type
 */
export interface Bill extends BaseEntity {
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_recurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annually';
  is_autopay?: boolean;
  reminder_days?: number;
  is_paid?: boolean;
}

/**
 * Debt Account entity type
 */
export interface DebtAccount extends BaseEntity {
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  account_number?: string;
  institution?: string;
}

/**
 * Investment entity type
 */
export interface Investment extends BaseEntity {
  name: string;
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other';
  symbol?: string;
  shares?: number;
  purchase_price: number;
  current_price?: number;
  current_value?: number;
  cost_basis?: number;
  return_percentage?: number;
}

/**
 * Paycheck Settings entity type
 */
export interface PaycheckSettings extends BaseEntity {
  base_hourly_rate: number;
  overtime_rate_multiplier: number;
  federal_tax_rate: number;
  state_tax_rate: number;
  fica_rate: number;
  pay_frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  next_payday?: string;
}

/**
 * Shift Rule entity type
 */
export interface ShiftRule extends BaseEntity {
  name: string;
  rate_multiplier: number;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  is_active: boolean;
  priority?: number;
}

/**
 * Shift entity type
 */
export interface Shift extends BaseEntity {
  title: string;
  start_time: string;
  end_time: string;
  hours: number;
  base_pay: number;
  differential_pay?: number;
  total_pay: number;
  notes?: string;
  location?: string;
  is_confirmed?: boolean;
}

/**
 * Forecast Snapshot entity type
 */
export interface ForecastSnapshot extends BaseEntity {
  date: string;
  projected_income: number;
  projected_expenses: number;
  projected_balance: number;
  confidence_score?: number;
}

/**
 * Gamification entity type
 */
export interface Gamification extends BaseEntity {
  points: number;
  level: number;
  streak_days: number;
  achievements: string[];
  badges: string[];
  last_activity?: string;
}

/**
 * Agent Task entity type
 */
export interface AgentTask extends BaseEntity {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assigned_agent?: string;
  result?: string;
  completed_at?: string;
}

/**
 * Notification entity type
 */
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  expires_at?: string;
}

/**
 * Automation Rule entity type
 */
export interface AutomationRule extends BaseEntity {
  name: string;
  trigger_type: 'transaction' | 'date' | 'balance' | 'custom';
  trigger_condition: string;
  action_type: 'categorize' | 'budget' | 'notify' | 'transfer' | 'custom';
  action_data: Record<string, unknown>;
  is_active: boolean;
  last_triggered?: string;
}

/**
 * Federal Tax Config entity type
 */
export interface FederalTaxConfig extends BaseEntity {
  year: number;
  filing_status: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  brackets: Array<{
    min: number;
    max: number | null;
    rate: number;
  }>;
  standard_deduction: number;
}

/**
 * State Tax Config entity type
 */
export interface StateTaxConfig extends BaseEntity {
  state_code: string;
  year: number;
  tax_rate: number;
  has_brackets: boolean;
  brackets?: Array<{
    min: number;
    max: number | null;
    rate: number;
  }>;
}

/**
 * Zip Jurisdiction entity type
 */
export interface ZipJurisdiction extends BaseEntity {
  zip_code: string;
  city: string;
  state: string;
  county?: string;
  tax_rate?: number;
}

/**
 * Cost of Living entity type
 */
export interface CostOfLiving extends BaseEntity {
  location: string;
  housing_cost: number;
  food_cost: number;
  transportation_cost: number;
  healthcare_cost: number;
  utilities_cost: number;
  total_monthly_cost: number;
  index_score?: number;
}

/**
 * Subscription Plan entity type
 */
export interface Plan extends BaseEntity {
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  is_active: boolean;
}

/**
 * User Subscription entity type
 */
export interface Subscription extends BaseEntity {
  plan_id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  trial_end?: string;
}

// ============================================================================
// TYPE DEFINITIONS - API Operation Types
// ============================================================================

/**
 * Generic entity with CRUD operations
 */
export interface EntityCRUD<T extends BaseEntity> {
  /** Entity name */
  name: string;
  
  /** List all items with optional filters */
  list: (filters?: Record<string, unknown>) => Promise<T[]>;
  
  /** Get a single item by ID */
  get: (id: string) => Promise<T | null>;
  
  /** Create a new item */
  create: (data: Omit<T, keyof BaseEntity>) => Promise<T>;
  
  /** Update an existing item */
  update: (id: string, data: Partial<Omit<T, keyof BaseEntity>>) => Promise<T>;
  
  /** Delete an item by ID */
  delete: (id: string) => Promise<void>;
  
  /** Query with advanced filters */
  query?: (query: Record<string, unknown>) => Promise<T[]>;
}

/**
 * Wrapped entity with rate limiting
 */
export type WrappedEntity<T extends BaseEntity> = EntityCRUD<T>;

/**
 * Batch update item
 */
export interface BatchUpdateItem<T extends BaseEntity> {
  id: string;
  data: Partial<Omit<T, keyof BaseEntity>>;
}

/**
 * Execute options for entity operations
 */
export interface EntityExecuteOptions {
  /** Priority level (higher = executed sooner) */
  priority?: number;
  /** HTTP method for caching */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Rate limiter statistics
 */
export interface RateLimiterStatsResponse {
  rateLimiter: RateLimiterStatus;
  deduplicator: DeduplicatorStats;
  timestamp: string;
}

/**
 * Error with status code
 */
export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

// ============================================================================
// ENTITY WRAPPER FUNCTION
// ============================================================================

/**
 * Wrap entity methods with rate limiting and optimization
 * @template T - Entity type extending BaseEntity
 * @param {EntityCRUD<T>} entity - Base44 entity to wrap
 * @returns {WrappedEntity<T>} Wrapped entity with rate limiting
 * 
 * @example
 * const Transaction = wrapEntity(base44.entities.Transaction);
 * const transactions = await Transaction.list();
 */
function wrapEntity<T extends BaseEntity>(entity: EntityCRUD<T>): WrappedEntity<T> {
  const wrapped = {} as WrappedEntity<T>;

  // Wrap common CRUD methods
  const methods: Array<keyof EntityCRUD<T>> = ['list', 'get', 'create', 'update', 'delete', 'query'];

  methods.forEach(method => {
    if (typeof entity[method] === 'function') {
      (wrapped as any)[method] = async (...args: any[]): Promise<any> => {
        const url = `${entity.name}/${String(method)}/${JSON.stringify(args)}`;
        
        // Use deduplicator for GET operations (list, get, query)
        if (['list', 'get', 'query'].includes(String(method))) {
          return globalDeduplicator.execute(
            url,
            async () => {
              return globalRateLimiter.execute(
                async () => {
                  const retryOptions: RetryOptions = {
                    maxRetries: 3,
                    baseDelay: 1000,
                    shouldRetry: (error: APIError) => {
                      // Retry on rate limits and server errors
                      return error.status === 429 || (error.status !== undefined && error.status >= 500);
                    }
                  };

                  return retryWithBackoff(
                    () => (entity[method] as Function)(...args),
                    retryOptions
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
            const retryOptions: RetryOptions = {
              maxRetries: 2,
              baseDelay: 2000,
              shouldRetry: (error: APIError) => {
                // Only retry rate limits for mutations
                return error.status === 429;
              }
            };

            return retryWithBackoff(
              () => (entity[method] as Function)(...args),
              retryOptions
            );
          },
          { priority: 15 } // Higher priority for mutations
        );
      };
    }
  });

  // Pass through other properties
  Object.keys(entity).forEach(key => {
    if (!(wrapped as any)[key]) {
      (wrapped as any)[key] = (entity as any)[key];
    }
  });

  return wrapped;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch create multiple items
 * @template T - Entity type extending BaseEntity
 * @param {EntityCRUD<T>} entity - Entity to create items for
 * @param {Array<Omit<T, keyof BaseEntity>>} items - Items to create
 * @returns {Promise<T[]>} Created items
 * 
 * @example
 * const transactions = await batchCreate(Transaction, [
 *   { description: 'Coffee', amount: 5, category: 'food', type: 'expense', date: '2025-10-08' },
 *   { description: 'Lunch', amount: 15, category: 'food', type: 'expense', date: '2025-10-08' }
 * ]);
 */
export async function batchCreate<T extends BaseEntity>(
  entity: EntityCRUD<T>,
  items: Array<Omit<T, keyof BaseEntity>>
): Promise<T[]> {
  return globalBatcher.add(
    `${entity.name}/create`,
    items,
    async (batch: Array<Omit<T, keyof BaseEntity>>): Promise<T[]> => {
      // Process in chunks to avoid overwhelming the API
      const results: T[] = [];
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
 * @template T - Entity type extending BaseEntity
 * @param {EntityCRUD<T>} entity - Entity to update items for
 * @param {BatchUpdateItem<T>[]} updates - Array of {id, data} objects
 * @returns {Promise<T[]>} Updated items
 * 
 * @example
 * const updated = await batchUpdate(Transaction, [
 *   { id: '123', data: { category: 'groceries' } },
 *   { id: '456', data: { category: 'dining' } }
 * ]);
 */
export async function batchUpdate<T extends BaseEntity>(
  entity: EntityCRUD<T>,
  updates: BatchUpdateItem<T>[]
): Promise<T[]> {
  return globalBatcher.add(
    `${entity.name}/update`,
    updates,
    async (batch: BatchUpdateItem<T>[]): Promise<T[]> => {
      const results: T[] = [];
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
 * @template T - Entity type extending BaseEntity
 * @param {EntityCRUD<T>} entity - Entity to delete items from
 * @param {string[]} ids - IDs to delete
 * @returns {Promise<void[]>} Deletion results
 * 
 * @example
 * await batchDelete(Transaction, ['123', '456', '789']);
 */
export async function batchDelete<T extends BaseEntity>(
  entity: EntityCRUD<T>,
  ids: string[]
): Promise<void[]> {
  return globalBatcher.add(
    `${entity.name}/delete`,
    ids,
    async (batch: string[]): Promise<void[]> => {
      const results: void[] = [];
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

// ============================================================================
// CACHE & UTILITY FUNCTIONS
// ============================================================================

/**
 * Invalidate cache for entity
 * @param {string} entityName - Name of entity to invalidate cache for
 * 
 * @example
 * invalidateCache('Transaction'); // Clear all Transaction cache
 */
export function invalidateCache(entityName: string): void {
  const pattern = new RegExp(`^GET:${entityName}/`);
  globalDeduplicator.invalidate(pattern);
}

/**
 * Flush all pending batched requests
 * @returns {Promise<void>}
 * 
 * @example
 * await flushBatches(); // Process all pending batch operations immediately
 */
export async function flushBatches(): Promise<void> {
  await globalBatcher.flush();
}

/**
 * Get rate limiter statistics
 * @returns {RateLimiterStatsResponse} Current stats for rate limiter and deduplicator
 * 
 * @example
 * const stats = getRateLimiterStats();
 * console.log(`Queue length: ${stats.rateLimiter.queueLength}`);
 */
export function getRateLimiterStats(): RateLimiterStatsResponse {
  return {
    rateLimiter: globalRateLimiter.getStatus(),
    deduplicator: globalDeduplicator.getStats(),
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// OPTIMIZED ENTITY EXPORTS
// ============================================================================

// Financial Entities
export const Transaction: WrappedEntity<Transaction> = wrapEntity(base44.entities.Transaction);
export const Budget: WrappedEntity<Budget> = wrapEntity(base44.entities.Budget);
export const Goal: WrappedEntity<Goal> = wrapEntity(base44.entities.Goal);
export const BNPLPlan: WrappedEntity<BNPLPlan> = wrapEntity(base44.entities.BNPLPlan);
export const Bill: WrappedEntity<Bill> = wrapEntity(base44.entities.Bill);
export const DebtAccount: WrappedEntity<DebtAccount> = wrapEntity(base44.entities.DebtAccount);
export const Investment: WrappedEntity<Investment> = wrapEntity(base44.entities.Investment);

// Shift Worker Entities
export const PaycheckSettings: WrappedEntity<PaycheckSettings> = wrapEntity(base44.entities.PaycheckSettings);
export const ShiftRule: WrappedEntity<ShiftRule> = wrapEntity(base44.entities.ShiftRule);
export const Shift: WrappedEntity<Shift> = wrapEntity(base44.entities.Shift);
export const ForecastSnapshot: WrappedEntity<ForecastSnapshot> = wrapEntity(base44.entities.ForecastSnapshot);

// Gamification & AI Entities
export const Gamification: WrappedEntity<Gamification> = wrapEntity(base44.entities.Gamification);
export const AgentTask: WrappedEntity<AgentTask> = wrapEntity(base44.entities.AgentTask);
export const Notification: WrappedEntity<Notification> = wrapEntity(base44.entities.Notification);
export const AutomationRule: WrappedEntity<AutomationRule> = wrapEntity(base44.entities.AutomationRule);

// Tax & Location Entities
export const FederalTaxConfig: WrappedEntity<FederalTaxConfig> = wrapEntity(base44.entities.FederalTaxConfig);
export const StateTaxConfig: WrappedEntity<StateTaxConfig> = wrapEntity(base44.entities.StateTaxConfig);
export const ZipJurisdiction: WrappedEntity<ZipJurisdiction> = wrapEntity(base44.entities.ZipJurisdiction);
export const CostOfLiving: WrappedEntity<CostOfLiving> = wrapEntity(base44.entities.CostOfLiving);

// Subscription Entities
export const Plan: WrappedEntity<Plan> = wrapEntity(base44.entities.Plan);
export const Subscription: WrappedEntity<Subscription> = wrapEntity(base44.entities.Subscription);

// Authentication (no wrapping needed)
export const User = base44.auth;

// Export unwrapped base44 for special cases
export { base44 };

// ============================================================================
// DEVELOPMENT MONITORING
// ============================================================================

// Log stats in development
if (import.meta.env.DEV) {
  setInterval(() => {
    const stats = getRateLimiterStats();
    if (stats.rateLimiter.queueLength > 0 || stats.deduplicator.pendingRequests > 0) {
      console.log('📊 API Stats:', stats);
    }
  }, 10000); // Every 10 seconds
}
