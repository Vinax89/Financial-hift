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
    constructor(dbName = 'financial-hift-cache', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Open database connection
     */
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

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
    async ensureOpen() {
        if (!this.db) {
            await this.open();
        }
    }

    /**
     * Get item from cache
     */
    async get(key) {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
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
    async set(key, value, ttl = null) {
        await this.ensureOpen();

        const data = {
            key,
            value,
            timestamp: Date.now(),
            expires: ttl ? Date.now() + ttl : null,
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete item from cache
     */
    async delete(key) {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cache
     */
    async clear() {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all keys
     */
    async keys() {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clean expired entries
     */
    async cleanExpired() {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('expires');
            const now = Date.now();

            const request = index.openCursor();
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
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
    async addToQueue(request) {
        await this.ensureOpen();

        const queueItem = {
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['queue'], 'readwrite');
            const store = transaction.objectStore('queue');
            const req = store.add(queueItem);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Get all queued requests
     */
    async getQueue() {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['queue'], 'readonly');
            const store = transaction.objectStore('queue');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove from queue
     */
    async removeFromQueue(id) {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['queue'], 'readwrite');
            const store = transaction.objectStore('queue');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear queue
     */
    async clearQueue() {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['queue'], 'readwrite');
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
export async function cachedFetch(url, options = {}) {
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
            return fetch(url, options);
        
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
async function networkFirst(url, options, cacheKey, ttl) {
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
async function cacheFirst(url, options, cacheKey, ttl) {
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
async function staleWhileRevalidate(url, options, cacheKey, ttl) {
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
    constructor() {
        this.processing = false;
        this.listeners = [];
    }

    /**
     * Add request to queue
     */
    async add(request) {
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
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify listeners
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener());
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
    async invalidatePattern(pattern) {
        const keys = await dbCache.keys();
        const regex = new RegExp(pattern);
        
        const deletePromises = keys
            .filter(key => regex.test(key))
            .map(key => dbCache.delete(key));
        
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
 */
export function useCachedData(key, fetchFn, options = {}) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const {
        strategy = CacheStrategy.NETWORK_FIRST,
        ttl = 5 * 60 * 1000,
        enabled = true,
    } = options;

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
                        setError(err);
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

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchFn();
            await dbCache.set(key, result, ttl);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [key, fetchFn, ttl]);

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
 */
export function useOfflineQueue() {
    const [queueSize, setQueueSize] = React.useState(0);

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
