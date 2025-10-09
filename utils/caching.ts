/**
 * Advanced Caching Strategies
 * 
 * Features:
 * - IndexedDB for persistent caching
 * - Service Worker integration
 * - Offline queue management
 * - Cache invalidation strategies
 * - Network-first, cache-first strategies
 */

/**
 * IndexedDB wrapper for persistent caching
 */
class IndexedDBCache {
    private dbName: string;
    private version: number;
    private db: IDBDatabase | null;

    constructor(dbName: string = 'financial-hift-cache', version: number = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Open database connection
     */
    async open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('expires', 'expires', { unique: false });
                }

                if (!db.objectStoreNames.contains('queue')) {
                    db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    /**
     * Ensure database is open
     */
    async ensureOpen(): Promise<void> {
        if (!this.db) {
            await this.open();
        }
    }

    /**
     * Get item from cache
     */
    async get(key: string): Promise<any> {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                
                // Check if expired
                if (result && result.expires && Date.now() > result.expires) {
                    this.delete(key); // Delete expired item
                    resolve(null);
                    return;
                }

                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Set item in cache
     */
    async set(key: string, value: any, ttl: number | null = null): Promise<void> {
        await this.ensureOpen();

        const data = {
            key,
            value,
            timestamp: Date.now(),
            expires: ttl ? Date.now() + ttl : null,
        };

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete item from cache
     */
    async delete(key: string): Promise<void> {
        await this.ensureOpen();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        await this.ensureOpen();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all keys
     */
    async keys(): Promise<IDBValidKey[]> {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clean expired entries
     */
    async cleanExpired(): Promise<number> {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('expires');
            const now = Date.now();

            const request = index.openCursor();
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    if (cursor.value.expires && cursor.value.expires < now) {
                        cursor.delete();
                        deletedCount++;
                    }
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Add to offline queue
     */
    async addToQueue(request: { url: string; method: string; headers: any; body: any }): Promise<IDBValidKey> {
        await this.ensureOpen();

        const queueItem = {
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['queue'], 'readwrite');
            const store = transaction.objectStore('queue');
            const req = store.add(queueItem);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Get all queued requests
     */
    async getQueue(): Promise<any[]> {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['queue'], 'readonly');
            const store = transaction.objectStore('queue');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove from queue
     */
    async removeFromQueue(id: IDBValidKey): Promise<void> {
        await this.ensureOpen();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['queue'], 'readwrite');
            const store = transaction.objectStore('queue');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear queue
     */
    async clearQueue(): Promise<void> {
        await this.ensureOpen();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['queue'], 'readwrite');
            const store = transaction.objectStore('queue');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Create singleton instance
const dbCache = new IndexedDBCache();

/**
 * Cache strategies
 */
export const CacheStrategy = {
    NETWORK_FIRST: 'network-first',   // Try network first, fallback to cache
    CACHE_FIRST: 'cache-first',       // Try cache first, fallback to network
    NETWORK_ONLY: 'network-only',     // Only use network
    CACHE_ONLY: 'cache-only',         // Only use cache
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate', // Return cache, update in background
};

/**
 * Cached fetch with strategy
 */
export async function cachedFetch(url: string, options: {
    strategy?: string;
    ttl?: number;
    cacheKey?: string;
    [key: string]: any;
} = {}): Promise<any> {
    const {
        strategy = CacheStrategy.NETWORK_FIRST,
        ttl = 5 * 60 * 1000, // 5 minutes default
        cacheKey = url,
    } = options;

    switch (strategy) {
        case CacheStrategy.NETWORK_FIRST:
            return networkFirst(url, options, cacheKey, ttl);
        
        case CacheStrategy.CACHE_FIRST:
            return cacheFirst(url, options, cacheKey, ttl);
        
        case CacheStrategy.NETWORK_ONLY:
            // Extract only fetch-compatible options
            const { strategy: _, ttl: __, cacheKey: ___, ...fetchOptions } = options;
            return fetch(url, fetchOptions);
        
        case CacheStrategy.CACHE_ONLY:
            return dbCache.get(cacheKey);
        
        case CacheStrategy.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(url, options, cacheKey, ttl);
        
        default:
            return networkFirst(url, options, cacheKey, ttl);
    }
}

/**
 * Network-first strategy
 */
async function networkFirst(url: string, options: any, cacheKey: string, ttl: number): Promise<any> {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Cache successful response
        if (response.ok) {
            await dbCache.set(cacheKey, data, ttl);
        }
        
        return data;
    } catch (error) {
        // Fallback to cache
        console.warn('Network failed, trying cache:', error);
        const cachedData = await dbCache.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }
        
        throw error;
    }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(url: string, options: any, cacheKey: string, ttl: number): Promise<any> {
    // Try cache first
    const cachedData = await dbCache.get(cacheKey);
    
    if (cachedData) {
        return cachedData;
    }
    
    // Fallback to network
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.ok) {
            await dbCache.set(cacheKey, data, ttl);
        }
        
        return data;
    } catch (error) {
        console.error('Cache and network both failed:', error);
        throw error;
    }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(url: string, options: any, cacheKey: string, ttl: number): Promise<any> {
    // Return cached data immediately
    const cachedData = await dbCache.get(cacheKey);
    
    // Update cache in background
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            dbCache.set(cacheKey, data, ttl);
        })
        .catch(error => {
            console.warn('Background revalidation failed:', error);
        });
    
    // Return stale data or fetch fresh if no cache
    if (cachedData) {
        return cachedData;
    }
    
    const response = await fetch(url, options);
    return response.json();
}

/**
 * Offline queue manager
 */
class OfflineQueue {
    private processing: boolean;
    private listeners: Array<(data: any) => void>;

    constructor() {
        this.processing = false;
        this.listeners = [];
    }

    /**
     * Add request to queue
     */
    async add(request: { url: string; method: string; headers: any; body: any }): Promise<IDBValidKey> {
        const id = await dbCache.addToQueue(request);
        this.notifyListeners();
        return id;
    }

    /**
     * Process queued requests
     */
    async processQueue() {
        if (this.processing) return;
        
        this.processing = true;
        const queue = await dbCache.getQueue();
        
        for (const item of queue) {
            try {
                await fetch(item.url, {
                    method: item.method,
                    headers: item.headers,
                    body: item.body,
                });
                
                await dbCache.removeFromQueue(item.id);
                console.log('Processed queued request:', item.url);
            } catch (error) {
                console.error('Failed to process queued request:', error);
                // Keep in queue to retry later
            }
        }
        
        this.processing = false;
        this.notifyListeners();
    }

    /**
     * Get queue size
     */
    async getSize() {
        const queue = await dbCache.getQueue();
        return queue.length;
    }

    /**
     * Clear queue
     */
    async clear() {
        await dbCache.clearQueue();
        this.notifyListeners();
    }

    /**
     * Subscribe to queue changes
     */
    subscribe(listener: (data?: any) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify listeners
     */
    notifyListeners(): void {
        this.listeners.forEach(listener => listener({}));
    }
}

// Create singleton instance
const offlineQueue = new OfflineQueue();

/**
 * Online/offline detection
 */
export function setupOfflineDetection() {
    window.addEventListener('online', () => {
        console.log('Network connection restored');
        offlineQueue.processQueue();
    });

    window.addEventListener('offline', () => {
        console.log('Network connection lost');
    });

    // Process queue on page load if online
    if (navigator.onLine) {
        offlineQueue.processQueue();
    }
}

/**
 * Cache invalidation utilities
 */
export const CacheInvalidation = {
    /**
     * Invalidate by key pattern
     */
    async invalidatePattern(pattern: string): Promise<void> {
        const keys = await dbCache.keys();
        const regex = new RegExp(pattern);
        
        const deletePromises = keys
            .filter(key => regex.test(String(key)))
            .map(key => dbCache.delete(String(key)));
        
        await Promise.all(deletePromises);
    },

    /**
     * Invalidate all cache
     */
    async invalidateAll() {
        await dbCache.clear();
    },

    /**
     * Clean expired entries
     */
    async cleanExpired() {
        return dbCache.cleanExpired();
    },
};

/**
 * React hook for cached data
 * Note: Requires React to be available in the environment
 */
export function useCachedData(key: string, fetchFn: () => Promise<any>, options: {
    strategy?: string;
    ttl?: number;
    enabled?: boolean;
} = {}): { data: any; loading: boolean; error: any; refresh: () => Promise<void>; invalidate: () => Promise<void> } {
    // @ts-ignore - React is available globally
    const [data, setData] = React.useState(null);
    // @ts-ignore - React is available globally
    const [loading, setLoading] = React.useState(true);
    // @ts-ignore - React is available globally
    const [error, setError] = React.useState(null);

    const {
        strategy = CacheStrategy.NETWORK_FIRST,
        ttl = 5 * 60 * 1000,
        enabled = true,
    } = options;

    // @ts-ignore - React is available globally
    React.useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                let result;

                if (strategy === CacheStrategy.CACHE_FIRST) {
                    const cached = await dbCache.get(key);
                    if (cached) {
                        if (!cancelled) {
                            setData(cached);
                            setLoading(false);
                        }
                        return;
                    }
                }

                result = await fetchFn();
                
                if (!cancelled) {
                    await dbCache.set(key, result, ttl);
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    // Try cache on error
                    const cached = await dbCache.get(key);
                    if (cached) {
                        setData(cached);
                    } else {
                        setError(err as any);
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [key, fetchFn, strategy, ttl, enabled]);

    // @ts-ignore - React is available globally
    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchFn();
            await dbCache.set(key, result, ttl);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err as any);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn, ttl]);

    // @ts-ignore - React is available globally
    const invalidate = React.useCallback(async () => {
        await dbCache.delete(key);
    }, [key]);

    return {
        data,
        loading,
        error,
        refresh,
        invalidate,
    };
}

/**
 * React hook for offline queue
 * Note: Requires React to be available in the environment
 */
export function useOfflineQueue(): { queueSize: number; processQueue: () => Promise<void>; clearQueue: () => Promise<void> } {
    // @ts-ignore - React is available globally
    const [queueSize, setQueueSize] = React.useState(0);

    // @ts-ignore - React is available globally
    React.useEffect(() => {
        const updateSize = async () => {
            const size = await offlineQueue.getSize();
            setQueueSize(size);
        };

        updateSize();
        const unsubscribe = offlineQueue.subscribe(updateSize);

        return unsubscribe;
    }, []);

    return {
        queueSize,
        processQueue: () => offlineQueue.processQueue(),
        clearQueue: () => offlineQueue.clear(),
    };
}

/**
 * Export all utilities
 */
export default {
    dbCache,
    CacheStrategy,
    cachedFetch,
    offlineQueue,
    setupOfflineDetection,
    CacheInvalidation,
    useCachedData,
    useOfflineQueue,
};
