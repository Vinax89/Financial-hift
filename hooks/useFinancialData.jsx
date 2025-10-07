/**
 * @fileoverview Comprehensive financial data management hook
 * @description Provides unified interface for fetching, caching, and managing
 * all financial entities with retry logic, offline support, and chaos testing
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Transaction } from '@/api/entities';
import { Shift } from '@/api/entities';
import { Goal } from '@/api/entities';
import { DebtAccount } from '@/api/entities';
import { Budget } from '@/api/entities';
import { Bill } from '@/api/entities';
import { Investment } from '@/api/entities';
import { useLocalStorage } from './useLocalStorage';
import { retryWithBackoff } from '@/utils/api';
import { perfLog, perfEnabled } from '@/utils/perf';
import { logError, logWarn } from '@/utils/logger.js';

const ENTITIES = {
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

/**
 * Unified hook for managing all financial data
 * @returns {Object} Financial data and control methods
 * @property {Array} transactions - All transactions
 * @property {Array} shifts - All shifts
 * @property {Array} goals - All goals
 * @property {Array} debts - All debt accounts
 * @property {Array} budgets - All budgets
 * @property {Array} bills - All bills
 * @property {Array} investments - All investments
 * @property {Object} loading - Loading states per entity
 * @property {boolean} isLoading - Overall loading state
 * @property {Object} errors - Error states per entity
 * @property {boolean} hasErrors - Whether any errors exist
 * @property {Function} loadAllData - Load all entities
 * @property {Function} refreshData - Refresh specific or all entities
 * @property {Function} clearError - Clear error for specific entity
 * @property {boolean} dataLoaded - Whether initial load complete
 * @property {Object} cacheInfo - Cache metadata
 */
export function useFinancialData() {
    const [data, setData] = useState(() => 
        Object.keys(ENTITIES).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
    );
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});
    const [chaosMode] = useLocalStorage('apex-finance:chaos-mode', false);
    
    const cache = useRef(
        Object.keys(ENTITIES).reduce((acc, key) => ({ 
            ...acc, 
            [key]: { data: [], timestamp: 0, version: 0 } 
        }), {})
    ).current;
    
    const dataLoadedRef = useRef(false);
    const abortControllersRef = useRef({});
    const isLoadingAllRef = useRef(false); // New ref for tracking overall loading

    const handleError = useCallback((entityType, error) => {
        logError(`Error loading ${entityType}`, error);
        setErrors(prev => ({ ...prev, [entityType]: error.message }));
        setLoading(prev => ({ ...prev, [entityType]: false }));
    }, []);

    const clearError = useCallback((entityType) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[entityType];
            return newErrors;
        });
    }, []);

    const hydrateFromLocal = useCallback(() => {
        const hydrated = {};
        Object.keys(ENTITIES).forEach((key) => {
            try {
                const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_PREFIX + key) : null;
                hydrated[key] = raw ? JSON.parse(raw) : [];
            } catch {
                hydrated[key] = [];
            }
        });
        setData(prev => ({ ...prev, ...hydrated }));
    }, []);

    const loadEntityData = useCallback(async (entityType, forceRefresh = false) => {
        const EntityClass = ENTITIES[entityType];
        if (!EntityClass) return;

        // Abort any previous in-flight request for this entity
        if (abortControllersRef.current[entityType]) {
            abortControllersRef.current[entityType].abort();
        }

        const now = Date.now();
        const cacheEntry = cache[entityType];
        
        if (!forceRefresh && cacheEntry.timestamp && (now - cacheEntry.timestamp) < CACHE_DURATION) {
            setData(prev => ({ ...prev, [entityType]: cacheEntry.data }));
            clearError(entityType);
            return cacheEntry.data;
        }

        setLoading(prev => ({ ...prev, [entityType]: true }));
        clearError(entityType);

        const abortController = new AbortController();
        abortControllersRef.current[entityType] = abortController;

        // perf timing
        const t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

        try {
            // Chaos Engineering: Introduce instability if Chaos Mode is enabled
            if (chaosMode) {
                await new Promise(res => setTimeout(res, Math.random() * 2000 + 500));
                if (Math.random() < 0.3) {
                    throw new Error(`Chaos Test: Simulated network failure for ${entityType}`);
                }
                if (Math.random() < 0.2) {
                    return null;
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
            
            if (abortController.signal.aborted) return;
            
            const safeResult = Array.isArray(result) ? result : [];

            // persist snapshot for offline
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STORAGE_PREFIX + entityType, JSON.stringify(safeResult));
                }
            } catch (storageError) {
                logWarn(`Failed to save ${entityType} to local storage`, { error: storageError });
            }
            
            cache[entityType] = { 
                data: safeResult, 
                timestamp: now,
                version: (cacheEntry.version || 0) + 1
            };
            
            setData(prev => ({ ...prev, [entityType]: safeResult }));
            return safeResult;
            
        } catch (error) {
            if (!abortController.signal.aborted) {
                handleError(entityType, error);
            }
            return cache[entityType]?.data || []; // Return cached data on error
        } finally {
            if (!abortController.signal.aborted) {
                setLoading(prev => ({ ...prev, [entityType]: false }));
            }
            // perf log
            const t1 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
            perfLog(`entities.${entityType}.list`, t1 - t0);

            delete abortControllersRef.current[entityType];
        }
    }, [handleError, clearError, cache, chaosMode]);

    const loadAllData = useCallback(async (forceRefresh = false) => {
        // Prevent duplicate loadAll bursts
        if (isLoadingAllRef.current && !forceRefresh) {
            return;
        }
        isLoadingAllRef.current = true;
        setLoading(prev => ({ ...prev, all: true }));
        
        try {
            const promises = Object.keys(ENTITIES).map(key => 
                loadEntityData(key, forceRefresh)
            );
            await Promise.allSettled(promises);
            dataLoadedRef.current = true;
        } finally {
            setLoading(prev => ({ ...prev, all: false }));
            isLoadingAllRef.current = false;
        }
    }, [loadEntityData]);

    const refreshData = useCallback(async (entityTypes = null) => {
        if (!entityTypes || !Array.isArray(entityTypes)) {
            return loadAllData(true);
        }
        
        const refreshPromises = entityTypes.map(key => loadEntityData(key, true));
        await Promise.allSettled(refreshPromises);
    }, [loadAllData, loadEntityData]);

    useEffect(() => {
        const controllers = abortControllersRef.current;
        return () => {
            Object.values(controllers).forEach(controller => {
                if (controller) controller.abort();
            });
        };
    }, []);

    useEffect(() => {
        // Hydrate from local if offline on first mount
        // Ensure navigator is defined (client-side only) and check if not already loaded
        if (typeof navigator !== 'undefined' && !navigator.onLine && !dataLoadedRef.current) {
            hydrateFromLocal();
            dataLoadedRef.current = true; // Mark as loaded from local to prevent re-hydration
        }
    }, [hydrateFromLocal]);

    useEffect(() => {
        // The values of cache and refreshData are stable due to useRef and useCallback,
        // making this useEffect's dependencies stable.
        if (!dataLoadedRef.current) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const staleEntities = Object.keys(cache).filter(key => {
                const entry = cache[key];
                return entry.timestamp && (now - entry.timestamp) > CACHE_DURATION;
            });
            
            if (staleEntities.length > 0) {
                refreshData(staleEntities);
            }
        }, CACHE_DURATION);

        return () => clearInterval(interval);
    }, [refreshData, cache]); // Dependencies are stable

    const isLoadingOverall = loading.all || Object.keys(ENTITIES).some(key => loading[key]);
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
