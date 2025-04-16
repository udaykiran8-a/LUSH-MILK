/**
 * DataCachingService.ts
 * 
 * Client-side caching service for the LUSH MILK application:
 * - Memory caching with configurable TTL (Time-To-Live)
 * - Persistent caching using localStorage
 * - Cache invalidation strategies
 * - Automatic cache refreshing
 * - Cache statistics and monitoring
 */

interface CacheConfig {
  // Default TTLs in milliseconds
  defaultTTL: number;
  productsTTL: number;
  userProfileTTL: number;
  categoryListTTL: number;
  orderHistoryTTL: number;
  
  // Storage limits
  maxMemoryCacheSize: number; // Max items in memory cache
  maxLocalStorageSize: number; // Max size in bytes for localStorage
  
  // Cache behavior
  refreshThreshold: number; // Percentage of TTL when background refresh should happen
  cacheRevalidationInterval: number; // Interval in ms for checking cache validity
}

interface CacheItem<T> {
  data: T;
  expiry: number;
  lastAccessed: number;
  accessCount: number;
  size: number;
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  productsTTL: 60 * 60 * 1000, // 1 hour
  userProfileTTL: 30 * 60 * 1000, // 30 minutes
  categoryListTTL: 24 * 60 * 60 * 1000, // 24 hours
  orderHistoryTTL: 15 * 60 * 1000, // 15 minutes
  
  maxMemoryCacheSize: 100, // Maximum 100 items in memory cache
  maxLocalStorageSize: 5 * 1024 * 1024, // 5MB max localStorage usage
  
  refreshThreshold: 0.8, // Refresh when 80% of TTL is reached
  cacheRevalidationInterval: 60 * 1000, // Check cache validity every minute
};

type RefreshFunction<T> = () => Promise<T>;

/**
 * Main Data Caching Service
 * Provides caching functionality for application data
 */
export class DataCachingService {
  private static config: CacheConfig = DEFAULT_CACHE_CONFIG;
  private static memoryCache: Map<string, CacheItem<any>> = new Map();
  private static refreshCallbacks: Map<string, RefreshFunction<any>> = new Map();
  private static revalidationInterval: NodeJS.Timeout | null = null;
  private static cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
  };
  
  /**
   * Initialize the caching service with optional custom configuration
   */
  static init(customConfig?: Partial<CacheConfig>): void {
    // Merge custom config with defaults
    if (customConfig) {
      this.config = { ...DEFAULT_CACHE_CONFIG, ...customConfig };
    }
    
    // Start cache revalidation process
    this.startCacheRevalidation();
    
    // Load persisted cache from localStorage
    this.loadPersistedCache();
    
    console.log('Data caching service initialized');
  }
  
  /**
   * Get TTL for a specific data type
   */
  private static getTTL(type: string): number {
    switch (type) {
      case 'products':
        return this.config.productsTTL;
      case 'user-profile':
        return this.config.userProfileTTL;
      case 'categories':
        return this.config.categoryListTTL;
      case 'order-history':
        return this.config.orderHistoryTTL;
      default:
        return this.config.defaultTTL;
    }
  }
  
  /**
   * Start interval for checking cache validity
   */
  private static startCacheRevalidation(): void {
    if (typeof window !== 'undefined' && !this.revalidationInterval) {
      this.revalidationInterval = setInterval(() => {
        this.revalidateCache();
      }, this.config.cacheRevalidationInterval);
    }
  }
  
  /**
   * Load any persisted cache from localStorage
   */
  private static loadPersistedCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const persistedCache = localStorage.getItem('lush_milk_data_cache');
      if (persistedCache) {
        const parsed = JSON.parse(persistedCache);
        
        // Add each item to memory cache
        Object.entries(parsed).forEach(([key, value]) => {
          const cacheItem = value as CacheItem<any>;
          
          // Only load if not expired
          if (cacheItem.expiry > Date.now()) {
            this.memoryCache.set(key, cacheItem);
            this.cacheStats.size += cacheItem.size;
          }
        });
        
        console.log(`Loaded ${this.memoryCache.size} items from persisted cache`);
      }
    } catch (error) {
      console.error('Error loading persisted cache', error);
      // Clear potentially corrupted cache
      localStorage.removeItem('lush_milk_data_cache');
    }
  }
  
  /**
   * Persist important cache items to localStorage
   */
  private static persistCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheToStore: Record<string, CacheItem<any>> = {};
      let totalSize = 0;
      
      // Only persist frequently accessed items
      const sortedEntries = Array.from(this.memoryCache.entries())
        .filter(([, item]) => item.accessCount > 3)
        .sort((a, b) => b[1].accessCount - a[1].accessCount);
      
      // Add items until we hit the max size
      for (const [key, item] of sortedEntries) {
        if (totalSize + item.size <= this.config.maxLocalStorageSize) {
          cacheToStore[key] = item;
          totalSize += item.size;
        } else {
          break;
        }
      }
      
      localStorage.setItem('lush_milk_data_cache', JSON.stringify(cacheToStore));
    } catch (error) {
      console.error('Error persisting cache', error);
    }
  }
  
  /**
   * Estimate the size of data in bytes
   */
  private static estimateSize(data: any): number {
    try {
      const jsonString = JSON.stringify(data);
      return jsonString.length * 2; // Rough estimate (2 bytes per character)
    } catch (error) {
      return 1000; // Default fallback size
    }
  }
  
  /**
   * Check and remove expired items from cache
   */
  private static revalidateCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    const refreshKeys: string[] = [];
    
    // Identify expired items and candidates for refresh
    this.memoryCache.forEach((item, key) => {
      if (item.expiry < now) {
        expiredKeys.push(key);
      } else if (item.expiry < now + (this.getTTL(key.split(':')[0]) * (1 - this.config.refreshThreshold))) {
        refreshKeys.push(key);
      }
    });
    
    // Remove expired items
    expiredKeys.forEach(key => {
      const item = this.memoryCache.get(key);
      if (item) {
        this.cacheStats.size -= item.size;
        this.memoryCache.delete(key);
        this.cacheStats.evictions++;
      }
    });
    
    // Refresh items approaching expiry
    refreshKeys.forEach(key => {
      const refreshFn = this.refreshCallbacks.get(key);
      if (refreshFn) {
        this.refreshItem(key, refreshFn).catch(error => {
          console.error(`Error refreshing cache item ${key}`, error);
        });
      }
    });
    
    // If cache size exceeds limit, remove least recently used items
    if (this.memoryCache.size > this.config.maxMemoryCacheSize) {
      this.evictLeastRecentlyUsed();
    }
    
    // Persist cache to localStorage
    this.persistCache();
  }
  
  /**
   * Evict least recently used items until cache size is within limits
   */
  private static evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const itemsToRemove = this.memoryCache.size - this.config.maxMemoryCacheSize;
    
    for (let i = 0; i < itemsToRemove && i < entries.length; i++) {
      const [key, item] = entries[i];
      this.memoryCache.delete(key);
      this.cacheStats.size -= item.size;
      this.cacheStats.evictions++;
    }
  }
  
  /**
   * Refresh a specific item in the cache
   */
  private static async refreshItem<T>(key: string, refreshFn: RefreshFunction<T>): Promise<void> {
    try {
      const data = await refreshFn();
      const existingItem = this.memoryCache.get(key);
      
      if (existingItem) {
        const size = this.estimateSize(data);
        this.cacheStats.size = this.cacheStats.size - existingItem.size + size;
        
        // Update existing cache item
        this.memoryCache.set(key, {
          data,
          expiry: Date.now() + this.getTTL(key.split(':')[0]),
          lastAccessed: existingItem.lastAccessed,
          accessCount: existingItem.accessCount,
          size,
        });
      }
    } catch (error) {
      console.error(`Failed to refresh cache item ${key}`, error);
      // Don't remove from cache on refresh failure, just leave the old data
    }
  }
  
  /**
   * Get data from cache or fetch using the provided function
   */
  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      type?: string;
      ttl?: number;
      registerRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const cacheKey = options.type ? `${options.type}:${key}` : `default:${key}`;
    const now = Date.now();
    
    // Check if in cache and not expired
    const cachedItem = this.memoryCache.get(cacheKey);
    if (cachedItem && cachedItem.expiry > now) {
      // Update access statistics
      cachedItem.lastAccessed = now;
      cachedItem.accessCount++;
      this.memoryCache.set(cacheKey, cachedItem);
      this.cacheStats.hits++;
      
      // If approaching expiry, trigger background refresh
      if (options.registerRefresh !== false && 
          cachedItem.expiry < now + (this.getTTL(options.type || 'default') * (1 - this.config.refreshThreshold))) {
        this.refreshItem(cacheKey, fetchFn).catch(console.error);
      }
      
      return cachedItem.data;
    }
    
    // Cache miss - fetch data
    this.cacheStats.misses++;
    
    try {
      const data = await fetchFn();
      
      // Calculate TTL
      const ttl = options.ttl || this.getTTL(options.type || 'default');
      const size = this.estimateSize(data);
      
      // Store in cache
      this.memoryCache.set(cacheKey, {
        data,
        expiry: now + ttl,
        lastAccessed: now,
        accessCount: 1,
        size,
      });
      
      this.cacheStats.size += size;
      
      // Register refresh callback if requested
      if (options.registerRefresh !== false) {
        this.refreshCallbacks.set(cacheKey, fetchFn);
      }
      
      // If cache is too large, remove least recently used
      if (this.memoryCache.size > this.config.maxMemoryCacheSize) {
        this.evictLeastRecentlyUsed();
      }
      
      return data;
    } catch (error) {
      // Error fetching data
      console.error(`Error fetching data for cache key ${cacheKey}`, error);
      
      // If we have stale data, return it
      if (cachedItem) {
        console.warn(`Returning stale data for ${cacheKey}`);
        return cachedItem.data;
      }
      
      // Otherwise rethrow
      throw error;
    }
  }
  
  /**
   * Set data in cache directly
   */
  static set<T>(
    key: string,
    data: T,
    options: {
      type?: string;
      ttl?: number;
    } = {}
  ): void {
    const cacheKey = options.type ? `${options.type}:${key}` : `default:${key}`;
    const ttl = options.ttl || this.getTTL(options.type || 'default');
    
    // Remove existing item first (to update size tracking)
    const existingItem = this.memoryCache.get(cacheKey);
    if (existingItem) {
      this.cacheStats.size -= existingItem.size;
    }
    
    const size = this.estimateSize(data);
    
    // Store in cache
    this.memoryCache.set(cacheKey, {
      data,
      expiry: Date.now() + ttl,
      lastAccessed: Date.now(),
      accessCount: 1,
      size,
    });
    
    this.cacheStats.size += size;
    
    // If cache is too large, remove least recently used
    if (this.memoryCache.size > this.config.maxMemoryCacheSize) {
      this.evictLeastRecentlyUsed();
    }
  }
  
  /**
   * Get data from cache if available
   */
  static get<T>(key: string, type?: string): T | null {
    const cacheKey = type ? `${type}:${key}` : `default:${key}`;
    const now = Date.now();
    
    const cachedItem = this.memoryCache.get(cacheKey);
    if (cachedItem && cachedItem.expiry > now) {
      // Update access statistics
      cachedItem.lastAccessed = now;
      cachedItem.accessCount++;
      this.memoryCache.set(cacheKey, cachedItem);
      this.cacheStats.hits++;
      
      return cachedItem.data;
    }
    
    this.cacheStats.misses++;
    return null;
  }
  
  /**
   * Remove an item from cache
   */
  static invalidate(key: string, type?: string): boolean {
    const cacheKey = type ? `${type}:${key}` : `default:${key}`;
    
    const item = this.memoryCache.get(cacheKey);
    if (item) {
      this.cacheStats.size -= item.size;
      this.memoryCache.delete(cacheKey);
      this.refreshCallbacks.delete(cacheKey);
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear cache by type or entirely
   */
  static clear(type?: string): void {
    if (type) {
      // Clear only specific type
      const prefix = `${type}:`;
      
      this.memoryCache.forEach((item, key) => {
        if (key.startsWith(prefix)) {
          this.cacheStats.size -= item.size;
          this.memoryCache.delete(key);
          this.refreshCallbacks.delete(key);
        }
      });
    } else {
      // Clear entire cache
      this.memoryCache.clear();
      this.refreshCallbacks.clear();
      this.cacheStats.size = 0;
    }
  }
  
  /**
   * Get cache statistics
   */
  static getStats(): typeof DataCachingService.cacheStats & {
    itemCount: number;
    hitRate: number;
  } {
    const totalAccesses = this.cacheStats.hits + this.cacheStats.misses;
    return {
      ...this.cacheStats,
      itemCount: this.memoryCache.size,
      hitRate: totalAccesses > 0 ? this.cacheStats.hits / totalAccesses : 0,
    };
  }
  
  /**
   * Clean up resources used by the cache service
   */
  static cleanup(): void {
    if (this.revalidationInterval) {
      clearInterval(this.revalidationInterval);
      this.revalidationInterval = null;
    }
    
    this.persistCache();
    this.memoryCache.clear();
    this.refreshCallbacks.clear();
    this.cacheStats.size = 0;
  }
}

// Export utility functions for direct use
export const dataCache = {
  init: DataCachingService.init,
  getOrFetch: DataCachingService.getOrFetch,
  set: DataCachingService.set,
  get: DataCachingService.get,
  invalidate: DataCachingService.invalidate,
  clear: DataCachingService.clear,
  getStats: DataCachingService.getStats,
  cleanup: DataCachingService.cleanup,
};

export default DataCachingService; 