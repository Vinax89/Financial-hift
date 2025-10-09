/**
 * @fileoverview Comprehensive financial data management hook
 * @description Provides unified interface for fetching, caching, and managing
 * all financial entities with retry logic, offline support, and chaos testing
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Transaction,
  Shift,
  Goal,
  DebtAccount,
  Budget,
  Bill,
  Investment,
} from '@/api/optimizedEntities';
import { useLocalStorage } from './useLocalStorage';
import { retryWithBackoff } from '@/utils/api';
import { perfLog } from '@/utils/perf';
import { logError, logWarn } from '@/utils/logger.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Entity type keys
 */
export type EntityType = 
  | 'transactions'
  | 'shifts'
  | 'goals'
  | 'debts'
  | 'budgets'
  | 'bills'
  | 'investments';

/**
 * Entity class with list method
 */
interface EntityClass<T> {
  list: (sort?: string, limit?: number) => Promise<T[]>;
}

/**
 * Map of entity types to their classes
 */
type EntityMap = {
  transactions: EntityClass<any>;
  shifts: EntityClass<any>;
  goals: EntityClass<any>;
  debts: EntityClass<any>;
  budgets: EntityClass<any>;
  bills: EntityClass<any>;
  investments: EntityClass<any>;
};

/**
 * Financial data state containing all entity arrays
 */
export interface FinancialData {
  transactions: any[];
  shifts: any[];
  goals: any[];
  debts: any[];
  budgets: any[];
  bills: any[];
  investments: any[];
}

/**
 * Loading state per entity
 */
export interface LoadingState {
  transactions?: boolean;
  shifts?: boolean;
  goals?: boolean;
  debts?: boolean;
  budgets?: boolean;
  bills?: boolean;
  investments?: boolean;
  all?: boolean;
}

/**
 * Error state per entity
 */
export interface ErrorState {
  transactions?: string;
  shifts?: string;
  goals?: string;
  debts?: string;
  budgets?: string;
  bills?: string;
  investments?: string;
}

/**
 * Cache entry with data and metadata
 */
interface CacheEntry<T = any[]> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * Cache state for all entities
 */
type CacheState = {
  [K in EntityType]: CacheEntry;
};

/**
 * Abort controllers map
 */
type AbortControllers = {
  [K in EntityType]?: AbortController;
};

/**
 * Return type of useFinancialData hook
 */
export interface UseFinancialDataReturn extends FinancialData {
  /** Loading state per entity */
  loading: LoadingState;
  /** Overall loading state */
  isLoading: boolean;
  /** Error messages per entity */
  errors: ErrorState;
  /** Whether any errors exist */
  hasErrors: boolean;
  /** Load all financial data */
  loadAllData: (forceRefresh?: boolean) => Promise<void>;
  /** Refresh specific entities or all */
  refreshData: (entityTypes?: EntityType[] | null) => Promise<void>;
  /** Clear error for specific entity */
  clearError: (entityType: EntityType) => void;
  /** Whether initial data load is complete */
  dataLoaded: boolean;
  /** Cache metadata for all entities */
  cacheInfo: CacheState;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITIES: EntityMap = {
  transactions: Transaction,
  shifts: Shift,
  goals: Goal,
  debts: DebtAccount,
  budgets: Budget,
  bills: Bill,
  investments: Investment,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = 'apex-finance:snapshot:';

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Unified hook for managing all financial data
 * 
 * @returns Financial data and control methods
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { 
 *     transactions, 
 *     goals, 
 *     isLoading, 
 *     loadAllData, 
 *     refreshData 
 *   } = useFinancialData();
 *   
 *   useEffect(() => {
 *     loadAllData();
 *   }, []);
 *   
 *   return (
 *     <div>
 *       {isLoading ? 'Loading...' : `${transactions.length} transactions`}
 *       <button onClick={() => refreshData(['transactions'])}>
 *         Refresh Transactions
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFinancialData(): UseFinancialDataReturn {
  const [data, setData] = useState<FinancialData>(() => 
    Object.keys(ENTITIES).reduce((acc, key) => ({ 
      ...acc, 
      [key]: [] 
    }), {} as FinancialData)
  );
  
  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [chaosMode] = useLocalStorage<boolean>('apex-finance:chaos-mode', false);
  
  const cache = useRef<CacheState>(
    Object.keys(ENTITIES).reduce((acc, key) => ({ 
      ...acc, 
      [key]: { data: [], timestamp: 0, version: 0 } 
    }), {} as CacheState)
  ).current;
  
  const dataLoadedRef = useRef<boolean>(false);
  const abortControllersRef = useRef<AbortControllers>({});
  const isLoadingAllRef = useRef<boolean>(false);

  /**
   * Handle error for entity loading
   */
  const handleError = useCallback((entityType: EntityType, error: Error): void => {
    logError(`Error loading ${entityType}`, error);
    setErrors(prev => ({ ...prev, [entityType]: error.message }));
    setLoading(prev => ({ ...prev, [entityType]: false }));
  }, []);

  /**
   * Clear error for specific entity
   */
  const clearError = useCallback((entityType: EntityType): void => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[entityType];
      return newErrors;
    });
  }, []);

  /**
   * Hydrate data from localStorage (offline fallback)
   */
  const hydrateFromLocal = useCallback((): void => {
    const hydrated: Partial<FinancialData> = {};
    
    (Object.keys(ENTITIES) as EntityType[]).forEach((key) => {
      try {
        const raw = typeof window !== 'undefined' 
          ? window.localStorage.getItem(STORAGE_PREFIX + key) 
          : null;
        hydrated[key] = raw ? JSON.parse(raw) : [];
      } catch {
        hydrated[key] = [];
      }
    });
    
    setData(prev => ({ ...prev, ...hydrated } as FinancialData));
  }, []);

  /**
   * Load data for a specific entity
   */
  const loadEntityData = useCallback(async (
    entityType: EntityType, 
    forceRefresh = false
  ): Promise<any[]> => {
    const EntityClass = ENTITIES[entityType];
    if (!EntityClass) return [];

    // Abort any previous in-flight request for this entity
    if (abortControllersRef.current[entityType]) {
      abortControllersRef.current[entityType]?.abort();
    }

    const now = Date.now();
    const cacheEntry = cache[entityType];
    
    // Return cached data if still fresh and not forcing refresh
    if (!forceRefresh && cacheEntry.timestamp && (now - cacheEntry.timestamp) < CACHE_DURATION) {
      setData(prev => ({ ...prev, [entityType]: cacheEntry.data }));
      clearError(entityType);
      return cacheEntry.data;
    }

    setLoading(prev => ({ ...prev, [entityType]: true }));
    clearError(entityType);

    const abortController = new AbortController();
    abortControllersRef.current[entityType] = abortController;

    // Performance timing
    const t0 = (typeof performance !== "undefined" && performance.now) 
      ? performance.now() 
      : Date.now();

    try {
      // Chaos Engineering: Introduce instability if Chaos Mode is enabled
      if (chaosMode) {
        await new Promise(res => setTimeout(res, Math.random() * 2000 + 500));
        if (Math.random() < 0.3) {
          throw new Error(`Chaos Test: Simulated network failure for ${entityType}`);
        }
        if (Math.random() < 0.2) {
          return [];
        }
      }

      // Use resilient fetch with retry/backoff
      const result = await retryWithBackoff(
        () => EntityClass.list('-updated_date', 10000),
        {
          retries: chaosMode ? 4 : 2,
          baseDelay: 250,
          factor: 2,
          jitter: true,
          isRetryable: () => true
        }
      );
      
      if (abortController.signal.aborted) return [];
      
      const safeResult = Array.isArray(result) ? result : [];

      // Persist snapshot for offline use
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            STORAGE_PREFIX + entityType, 
            JSON.stringify(safeResult)
          );
        }
      } catch (storageError) {
        logWarn(`Failed to save ${entityType} to local storage`, { 
          error: storageError 
        });
      }
      
      // Update cache
      cache[entityType] = { 
        data: safeResult, 
        timestamp: now,
        version: (cacheEntry.version || 0) + 1
      };
      
      setData(prev => ({ ...prev, [entityType]: safeResult }));
      return safeResult;
      
    } catch (error) {
      if (!abortController.signal.aborted) {
        handleError(entityType, error as Error);
      }
      return cache[entityType]?.data || []; // Return cached data on error
      
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(prev => ({ ...prev, [entityType]: false }));
      }
      
      // Performance logging
      const t1 = (typeof performance !== "undefined" && performance.now) 
        ? performance.now() 
        : Date.now();
      perfLog(`entities.${entityType}.list`, t1 - t0);

      delete abortControllersRef.current[entityType];
    }
  }, [handleError, clearError, cache, chaosMode]);

  /**
   * Load all financial data
   */
  const loadAllData = useCallback(async (forceRefresh = false): Promise<void> => {
    // Prevent duplicate loadAll bursts
    if (isLoadingAllRef.current && !forceRefresh) {
      return;
    }
    
    isLoadingAllRef.current = true;
    setLoading(prev => ({ ...prev, all: true }));
    
    try {
      const promises = (Object.keys(ENTITIES) as EntityType[]).map(key => 
        loadEntityData(key, forceRefresh)
      );
      await Promise.allSettled(promises);
      dataLoadedRef.current = true;
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
      isLoadingAllRef.current = false;
    }
  }, [loadEntityData]);

  /**
   * Refresh specific entities or all
   */
  const refreshData = useCallback(async (
    entityTypes: EntityType[] | null = null
  ): Promise<void> => {
    if (!entityTypes || !Array.isArray(entityTypes)) {
      return loadAllData(true);
    }
    
    const refreshPromises = entityTypes.map(key => loadEntityData(key, true));
    await Promise.allSettled(refreshPromises);
  }, [loadAllData, loadEntityData]);

  /**
   * Cleanup: Abort all in-flight requests on unmount
   */
  useEffect(() => {
    const controllers = abortControllersRef.current;
    return () => {
      Object.values(controllers).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, []);

  /**
   * Hydrate from localStorage if offline on first mount
   */
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine && !dataLoadedRef.current) {
      hydrateFromLocal();
      dataLoadedRef.current = true;
    }
  }, [hydrateFromLocal]);

  /**
   * Auto-refresh stale cache entries
   */
  useEffect(() => {
    if (!dataLoadedRef.current) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const staleEntities = (Object.keys(cache) as EntityType[]).filter(key => {
        const entry = cache[key];
        return entry.timestamp && (now - entry.timestamp) > CACHE_DURATION;
      });
      
      if (staleEntities.length > 0) {
        refreshData(staleEntities);
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [refreshData, cache]);

  // Computed values
  const isLoadingOverall = loading.all || 
    (Object.keys(ENTITIES) as EntityType[]).some(key => loading[key]);
  const hasAnyErrors = Object.keys(errors).length > 0;

  return {
    ...data,
    loading,
    isLoading: isLoadingOverall,
    errors,
    hasErrors: hasAnyErrors,
    loadAllData,
    refreshData,
    clearError,
    dataLoaded: dataLoadedRef.current,
    cacheInfo: cache,
  };
}

