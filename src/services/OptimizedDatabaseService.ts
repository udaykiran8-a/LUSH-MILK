/**
 * OptimizedDatabaseService.ts
 * 
 * An optimized version of the database service that uses connection pooling
 * for improved performance under high load.
 * 
 * This service:
 * - Uses the ConnectionPoolService for efficient connection management
 * - Implements request prioritization for critical operations
 * - Adds retry logic and circuit breaking for resilience
 * - Provides detailed performance metrics
 */

import ConnectionPoolService, { RequestPriority } from './ConnectionPoolService';
import { Tables } from '@/integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';

// Re-export types for convenience
export type User = Tables<'users'>;
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type Payment = Tables<'payments'>;

// Circuit breaker states
enum CircuitState {
  CLOSED, // Normal operation, requests flow through
  OPEN,   // Failed state, requests are rejected
  HALF_OPEN // Testing if service has recovered
}

// Options for database operations
interface DatabaseOptions {
  // Priority level for this operation
  priority?: RequestPriority;
  // Maximum time to wait for a connection (ms)
  timeout?: number;
  // Number of retry attempts for transient errors
  retries?: number;
  // Time between retries (ms)
  retryDelay?: number;
}

// Default options
const defaultOptions: DatabaseOptions = {
  priority: RequestPriority.NORMAL,
  timeout: 5000,
  retries: 2,
  retryDelay: 500
};

// Interface for Supabase error response
interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}

/**
 * Optimized database service that uses connection pooling
 */
export class OptimizedDatabaseService {
  private static instance: OptimizedDatabaseService;
  private connectionPool: ConnectionPoolService;
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private circuitResetTimeout: number = 30000; // 30 seconds
  private failureThreshold: number = 5;
  private metrics: {
    operationCounts: Record<string, number>;
    errors: Record<string, number>;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    lastResetTime: number;
  };

  /**
   * Private constructor (singleton pattern)
   */
  private constructor() {
    this.connectionPool = ConnectionPoolService.getInstance();
    this.connectionPool.init();
    this.resetMetrics();
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(): OptimizedDatabaseService {
    if (!OptimizedDatabaseService.instance) {
      OptimizedDatabaseService.instance = new OptimizedDatabaseService();
    }
    return OptimizedDatabaseService.instance;
  }

  /**
   * Reset performance metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      operationCounts: {},
      errors: {},
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      lastResetTime: Date.now()
    };
  }

  /**
   * Get current performance metrics
   */
  public getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.lastResetTime,
      circuitState: this.circuitState
    };
  }

  /**
   * Execute a database operation with circuit breaking and retry
   * @param operation Database operation function
   * @param operationName Name of the operation for metrics
   * @param options Operation options
   */
  private async executeOperation<T>(
    operation: (client: ReturnType<typeof createClient>) => Promise<T>,
    operationName: string,
    options: DatabaseOptions = {}
  ): Promise<T> {
    const mergedOptions = { ...defaultOptions, ...options };
    const startTime = Date.now();
    
    // Track metrics
    this.metrics.totalOperations++;
    this.metrics.operationCounts[operationName] = (this.metrics.operationCounts[operationName] || 0) + 1;
    
    // Check circuit breaker
    if (this.circuitState === CircuitState.OPEN) {
      // Circuit is open, check if enough time has passed to try again
      const now = Date.now();
      if (now - this.lastFailureTime > this.circuitResetTimeout) {
        // Move to half-open state
        this.circuitState = CircuitState.HALF_OPEN;
      } else {
        // Circuit still open, fail fast
        this.metrics.failedOperations++;
        throw new Error(`Circuit breaker open for operation: ${operationName}`);
      }
    }
    
    let retries = mergedOptions.retries!;
    let lastError: any = null;
    
    while (retries >= 0) {
      try {
        // Execute operation using connection pool
        const result = await this.connectionPool.execute(
          operation,
          mergedOptions.priority!,
          mergedOptions.timeout!
        );
        
        // Success - update metrics and circuit state
        const executionTime = Date.now() - startTime;
        this.metrics.successfulOperations++;
        this.metrics.totalExecutionTime += executionTime;
        this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.successfulOperations;
        
        // If in half-open state, reset circuit breaker
        if (this.circuitState === CircuitState.HALF_OPEN) {
          this.resetCircuitBreaker();
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if error is transient (connection issues, timeouts)
        const isTransient = this.isTransientError(error);
        
        if (isTransient && retries > 0) {
          // Retry transient errors
          retries--;
          await new Promise(resolve => setTimeout(resolve, mergedOptions.retryDelay!));
        } else {
          // Update failure metrics
          this.metrics.failedOperations++;
          const errorKey = error.message || 'unknown';
          this.metrics.errors[errorKey] = (this.metrics.errors[errorKey] || 0) + 1;
          
          // Update circuit breaker state
          this.recordFailure();
          break;
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  }
  
  /**
   * Check if an error is transient and can be retried
   */
  private isTransientError(error: any): boolean {
    // Connection timeouts, network errors
    const transientMessages = [
      'timeout',
      'connection',
      'network',
      'socket',
      'unavailable',
      'temporary',
      'overloaded'
    ];
    
    const message = (error.message || '').toLowerCase();
    return transientMessages.some(term => message.includes(term));
  }
  
  /**
   * Record a failure for circuit breaking
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Check if we should open the circuit
    if (this.circuitState === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      this.circuitState = CircuitState.OPEN;
      console.warn('Circuit breaker opened due to failure threshold exceeded');
    }
  }
  
  /**
   * Reset the circuit breaker
   */
  private resetCircuitBreaker(): void {
    this.circuitState = CircuitState.CLOSED;
    this.failureCount = 0;
    console.info('Circuit breaker reset to closed state');
  }

  // ===============================
  // === USER RELATED OPERATIONS ===
  // ===============================
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string, options?: DatabaseOptions): Promise<User | null> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data as User | null;
    }, 'getUserById', { 
      priority: RequestPriority.HIGH, 
      ...options 
    });
  }
  
  /**
   * Get user by email
   */
  async getUserByEmail(email: string, options?: DatabaseOptions): Promise<User | null> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
        
      if (error && (error as SupabaseError).code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data as User | null;
    }, 'getUserByEmail', { 
      priority: RequestPriority.HIGH, 
      ...options 
    });
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, userData: Partial<User>, options?: DatabaseOptions): Promise<User> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data as User;
    }, 'updateUserProfile', { 
      priority: RequestPriority.NORMAL,
      ...options 
    });
  }

  // ================================
  // === PRODUCT RELATED OPERATIONS ===
  // ================================
  
  /**
   * Get products with pagination
   */
  async getProducts(page: number = 1, pageSize: number = 20, options?: DatabaseOptions): Promise<Product[]> {
    return this.executeOperation(async (client) => {
      const offset = (page - 1) * pageSize;
      
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('name')
        .limit(pageSize)
        .offset(offset);
        
      if (error) throw error;
      return data as Product[];
    }, 'getProducts', options);
  }
  
  /**
   * Get product by ID
   */
  async getProductById(productId: string, options?: DatabaseOptions): Promise<Product | null> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (error && (error as SupabaseError).code !== 'PGRST116') throw error;
      return data as Product | null;
    }, 'getProductById', options);
  }
  
  /**
   * Search products
   */
  async searchProducts(query: string, options?: DatabaseOptions): Promise<Product[]> {
    return this.executeOperation(async (client) => {
      // Using ilike for text search as a more compatible alternative
      const { data, error } = await client
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
        
      if (error) throw error;
      return data as Product[];
    }, 'searchProducts', options);
  }

  // ===============================
  // === ORDER RELATED OPERATIONS ===
  // ===============================
  
  /**
   * Get orders for a user
   */
  async getUserOrders(userId: string, options?: DatabaseOptions): Promise<Order[]> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Order[];
    }, 'getUserOrders', options);
  }
  
  /**
   * Create a new order
   */
  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>, options?: DatabaseOptions): Promise<Order> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('orders')
        .insert(orderData)
        .select()
        .single();
        
      if (error) throw error;
      return data as Order;
    }, 'createOrder', { 
      priority: RequestPriority.CRITICAL,
      ...options 
    });
  }
  
  /**
   * Get order details by ID
   */
  async getOrderById(orderId: string, options?: DatabaseOptions): Promise<Order | null> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (error && (error as SupabaseError).code !== 'PGRST116') throw error;
      return data as Order | null;
    }, 'getOrderById', options);
  }

  // =================================
  // === PAYMENT RELATED OPERATIONS ===
  // =================================
  
  /**
   * Create a payment record
   */
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>, options?: DatabaseOptions): Promise<Payment> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('payments')
        .insert(paymentData)
        .select()
        .single();
        
      if (error) throw error;
      return data as Payment;
    }, 'createPayment', { 
      priority: RequestPriority.CRITICAL,
      retries: 3, // More retries for critical payment operations
      ...options 
    });
  }
  
  /**
   * Get payment details for an order
   */
  async getPaymentsByOrderId(orderId: string, options?: DatabaseOptions): Promise<Payment[]> {
    return this.executeOperation(async (client) => {
      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Payment[];
    }, 'getPaymentsByOrderId', { 
      priority: RequestPriority.HIGH,
      ...options 
    });
  }
}

// Export singleton instance
export const optimizedDatabase = OptimizedDatabaseService.getInstance();

// Default export
export default OptimizedDatabaseService; 