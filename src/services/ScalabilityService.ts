/**
 * ScalabilityService.ts
 * 
 * Provides scalability features for the LUSH MILK application:
 * - Connection pooling for database operations
 * - Rate limiting to prevent abuse
 * - Caching for frequently accessed data
 * - Request queuing for high-load scenarios
 */

import { supabase } from '../integrations/supabase/client';
import { User, Product, Order } from './DatabaseService';
import { toast } from 'sonner';

// In-memory cache with TTL
interface CacheItem<T> {
  data: T;
  expiry: number;
}

// Cache configuration
const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE: 2 * 60 * 1000, // 2 minutes
  ORDER_HISTORY: 3 * 60 * 1000, // 3 minutes
};

// Request throttling configuration
const RATE_LIMITS = {
  DEFAULT: { maxRequests: 50, perWindow: 60 * 1000 }, // 50 per minute
  WRITE_OPERATIONS: { maxRequests: 20, perWindow: 60 * 1000 }, // 20 per minute
  CRITICAL: { maxRequests: 5, perWindow: 60 * 1000 }, // 5 per minute
};

/**
 * Cache Service for storing frequently accessed data
 */
export class CacheService {
  private static caches: {
    products: Map<string, CacheItem<Product[]>>;
    userProfiles: Map<string, CacheItem<User>>;
    orderHistory: Map<string, CacheItem<Order[]>>;
    [key: string]: Map<string, CacheItem<any>>;
  } = {
    products: new Map(),
    userProfiles: new Map(),
    orderHistory: new Map(),
    custom: new Map(),
  };

  /**
   * Get item from cache if available and not expired
   */
  static get<T>(cacheName: string, key: string): T | null {
    const cache = this.caches[cacheName];
    if (!cache) return null;

    const item = cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache with TTL
   */
  static set<T>(cacheName: string, key: string, data: T, ttlMs: number): void {
    const cache = this.caches[cacheName] || (this.caches[cacheName] = new Map());
    
    cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
    
    // Optional: Log cache statistics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache ${cacheName} size: ${cache.size} entries`);
    }
  }

  /**
   * Clear a specific cache or item
   */
  static invalidate(cacheName: string, key?: string): void {
    const cache = this.caches[cacheName];
    if (!cache) return;

    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  /**
   * Clear all caches
   */
  static invalidateAll(): void {
    Object.values(this.caches).forEach(cache => cache.clear());
  }
}

/**
 * Rate Limiting Service to prevent abuse
 */
export class RateLimitService {
  private static requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Check if a request should be allowed based on rate limits
   * @param userId User making the request
   * @param operationType Type of operation (default, write, critical)
   * @returns Whether the request should be allowed
   */
  static allowRequest(userId: string, operationType: 'DEFAULT' | 'WRITE_OPERATIONS' | 'CRITICAL' = 'DEFAULT'): boolean {
    const limit = RATE_LIMITS[operationType];
    const key = `${userId}:${operationType}`;
    
    const now = Date.now();
    const userRequests = this.requestCounts.get(key);

    // If no previous requests or window expired, reset counter
    if (!userRequests || now > userRequests.resetAt) {
      this.requestCounts.set(key, { 
        count: 1, 
        resetAt: now + limit.perWindow 
      });
      return true;
    }

    // If under limit, increment and allow
    if (userRequests.count < limit.maxRequests) {
      userRequests.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Register a request for rate limiting
   * @param userId User making the request
   * @param operationType Type of operation
   * @returns True if allowed, false if rate limited
   */
  static registerRequest(userId: string, operationType: 'DEFAULT' | 'WRITE_OPERATIONS' | 'CRITICAL' = 'DEFAULT'): boolean {
    const isAllowed = this.allowRequest(userId, operationType);
    
    if (!isAllowed && process.env.NODE_ENV === 'development') {
      console.warn(`Rate limit exceeded for user ${userId} on ${operationType} operations`);
    }
    
    return isAllowed;
  }
}

/**
 * Request Queue for handling high load
 */
export class RequestQueueService {
  private static queues: Map<string, Array<() => Promise<any>>> = new Map();
  private static processing: Map<string, boolean> = new Map();
  private static MAX_QUEUE_SIZE = 100;

  /**
   * Add request to queue and process when available
   * @param queueName Name of the queue (e.g., 'orders', 'profiles')
   * @param request Function that returns a promise with the request
   * @returns Promise that resolves with the request result
   */
  static async enqueue<T>(queueName: string, request: () => Promise<T>): Promise<T> {
    // Initialize queue if it doesn't exist
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.processing.set(queueName, false);
    }

    const queue = this.queues.get(queueName)!;
    
    // Reject if queue is full to prevent memory issues
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error(`Request queue '${queueName}' is full. Try again later.`);
    }

    // Create a promise that will resolve when the request is processed
    return new Promise<T>((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      // Start processing if not already doing so
      this.processQueue(queueName);
    });
  }

  /**
   * Process requests in a queue one by one
   */
  private static async processQueue(queueName: string): Promise<void> {
    // If already processing this queue, do nothing
    if (this.processing.get(queueName)) return;
    
    this.processing.set(queueName, true);
    const queue = this.queues.get(queueName)!;

    while (queue.length > 0) {
      const request = queue.shift()!;
      
      try {
        await request();
      } catch (error) {
        console.error(`Error processing request in queue '${queueName}':`, error);
      }
    }

    this.processing.set(queueName, false);
  }
}

/**
 * Connection Pool Management
 * 
 * For the Supabase client, we don't directly manage connection pooling as it's handled
 * by the Supabase service. However, we can optimize how we use connections.
 */
export class ConnectionPoolService {
  private static activeConnections = 0;
  private static MAX_CONNECTIONS = 50;
  private static pendingRequests: Array<{ 
    resolve: (value: void) => void; 
    reject: (reason: any) => void; 
  }> = [];

  /**
   * Acquire a connection from the pool
   */
  static async acquireConnection(): Promise<void> {
    if (this.activeConnections < this.MAX_CONNECTIONS) {
      this.activeConnections++;
      return Promise.resolve();
    }

    // If at connection limit, queue the request
    return new Promise<void>((resolve, reject) => {
      this.pendingRequests.push({ resolve, reject });
      
      // Set a timeout to prevent indefinite waiting
      setTimeout(() => {
        const index = this.pendingRequests.findIndex(
          request => request.resolve === resolve
        );
        
        if (index !== -1) {
          this.pendingRequests.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, 10000); // 10 second timeout
    });
  }

  /**
   * Release a connection back to the pool
   */
  static releaseConnection(): void {
    if (this.activeConnections > 0) {
      this.activeConnections--;
    }

    // If there are pending requests, process the next one
    if (this.pendingRequests.length > 0) {
      const nextRequest = this.pendingRequests.shift()!;
      this.activeConnections++;
      nextRequest.resolve();
    }
  }

  /**
   * Execute a function within a managed connection
   */
  static async withConnection<T>(fn: () => Promise<T>): Promise<T> {
    try {
      await this.acquireConnection();
      return await fn();
    } finally {
      this.releaseConnection();
    }
  }
}

/**
 * Scalability Service - Main entry point for enhanced database operations
 */
export class ScalabilityService {
  /**
   * Get products with caching
   */
  static async getProducts(options?: { inStockOnly?: boolean; milkType?: string; popularOnly?: boolean }) {
    // Create cache key based on filter options
    const cacheKey = options ? JSON.stringify(options) : 'all';
    
    // Check cache first
    const cachedProducts = CacheService.get<Product[]>('products', cacheKey);
    if (cachedProducts) {
      return { success: true, data: cachedProducts, error: null, fromCache: true };
    }
    
    // If not in cache, fetch from database with connection pooling
    try {
      const result = await ConnectionPoolService.withConnection(async () => {
        let query = supabase.from('products').select('*');
  
        // Apply filters if provided
        if (options?.inStockOnly) {
          query = query.eq('in_stock', true);
        }
        
        if (options?.milkType) {
          query = query.eq('milk_type', options.milkType);
        }
        
        if (options?.popularOnly) {
          query = query.eq('popular', true);
        }
  
        return await query;
      });
      
      if (result.error) throw result.error;
      
      // Store in cache for future requests
      CacheService.set('products', cacheKey, result.data, CACHE_TTL.PRODUCTS);
      
      return { success: true, data: result.data, error: null, fromCache: false };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, data: [], error, fromCache: false };
    }
  }
  
  /**
   * Get user profile with caching and rate limiting
   */
  static async getUserProfile(userId: string) {
    // Apply rate limiting
    if (!RateLimitService.registerRequest(userId, 'DEFAULT')) {
      toast.error('Too many requests. Please try again later.');
      return { 
        success: false, 
        data: null, 
        error: 'Rate limit exceeded', 
        fromCache: false 
      };
    }
    
    // Check cache first
    const cachedProfile = CacheService.get<User>('userProfiles', userId);
    if (cachedProfile) {
      return { success: true, data: cachedProfile, error: null, fromCache: true };
    }
    
    // If not in cache, fetch from database with connection pooling
    try {
      const result = await ConnectionPoolService.withConnection(async () => {
        return await supabase
          .from('users')
          .select('*, customers(*)')
          .eq('id', userId)
          .single();
      });
      
      if (result.error) throw result.error;
      
      // Store in cache for future requests
      CacheService.set('userProfiles', userId, result.data, CACHE_TTL.USER_PROFILE);
      
      return { success: true, data: result.data, error: null, fromCache: false };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, data: null, error, fromCache: false };
    }
  }
  
  /**
   * Update user profile with rate limiting for write operations
   */
  static async updateUserProfile(userId: string, profile: any) {
    // Apply more strict rate limiting for write operations
    if (!RateLimitService.registerRequest(userId, 'WRITE_OPERATIONS')) {
      toast.error('Too many update requests. Please try again later.');
      return { success: false, data: null, error: 'Rate limit exceeded' };
    }
    
    // Enqueue the request to prevent database overload
    return await RequestQueueService.enqueue('userUpdates', async () => {
      try {
        // Get the customer ID associated with this user
        const { data: userData, error: userError } = await ConnectionPoolService.withConnection(() => 
          supabase
            .from('users')
            .select('id, customers(id)')
            .eq('id', userId)
            .single()
        );
  
        if (userError) throw userError;
        if (!userData?.customers?.id) throw new Error('Customer record not found');
  
        const customerId = userData.customers.id;
  
        // Update customer profile
        const { data, error } = await ConnectionPoolService.withConnection(() =>
          supabase
            .from('customers')
            .update(profile)
            .eq('id', customerId)
            .select()
            .single()
        );
  
        if (error) throw error;
        
        // Invalidate cache after update
        CacheService.invalidate('userProfiles', userId);
        
        return { success: true, data, error: null };
      } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, data: null, error };
      }
    });
  }
  
  /**
   * Get order history with caching
   */
  static async getOrderHistory(userId: string) {
    // Check cache first
    const cachedOrders = CacheService.get<Order[]>('orderHistory', userId);
    if (cachedOrders) {
      return { success: true, data: cachedOrders, error: null, fromCache: true };
    }
    
    // If not in cache, fetch from database with connection pooling
    try {
      // First get the customer ID
      const { data: userData, error: userError } = await ConnectionPoolService.withConnection(() =>
        supabase
          .from('users')
          .select('customers(id)')
          .eq('id', userId)
          .single()
      );

      if (userError) throw userError;
      const customerId = userData?.customers?.id;
      
      if (!customerId) {
        return { success: false, data: [], error: new Error('Customer not found') };
      }

      // Now get the orders
      const { data, error } = await ConnectionPoolService.withConnection(() =>
        supabase
          .from('orders')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      
      // Store in cache for future requests
      CacheService.set('orderHistory', userId, data, CACHE_TTL.ORDER_HISTORY);
      
      return { success: true, data, error: null, fromCache: false };
    } catch (error) {
      console.error('Error fetching order history:', error);
      return { success: false, data: [], error, fromCache: false };
    }
  }
}

// Export caching utilities for direct use
export const caching = {
  /**
   * Set custom cache item
   */
  set: <T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000) => {
    CacheService.set('custom', key, data, ttlMs);
  },
  
  /**
   * Get custom cache item
   */
  get: <T>(key: string): T | null => {
    return CacheService.get<T>('custom', key);
  },
  
  /**
   * Invalidate a cache entry or entire cache
   */
  invalidate: (cacheType: string, key?: string) => {
    CacheService.invalidate(cacheType, key);
  },
  
  /**
   * Clear all caches
   */
  invalidateAll: () => {
    CacheService.invalidateAll();
  }
};

// Export for direct use in components
export default ScalabilityService; 