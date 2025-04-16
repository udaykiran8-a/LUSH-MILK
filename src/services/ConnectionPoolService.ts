/**
 * ConnectionPoolService.ts
 * 
 * Service for managing database connection pooling and request queuing:
 * - Optimized connection reuse
 * - Connection limiting to prevent database overload
 * - Priority-based request queuing
 * - Connection timeout and health monitoring
 * - Graceful degradation during high load
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Connection pool configuration
interface ConnectionPoolConfig {
  // Maximum number of concurrent connections
  maxConnections: number;
  // Maximum idle time for a connection before it's recycled (ms)
  maxIdleTime: number;
  // Maximum request queue size
  maxQueueSize: number;
  // Connection acquisition timeout (ms)
  acquisitionTimeout: number;
  // Maximum lifetime of a connection (ms)
  maxConnectionLifetime: number;
  // Connection check interval (ms)
  healthCheckInterval: number;
}

// Connection object with metadata
interface PooledConnection {
  // The actual connection client
  client: SupabaseClient;
  // When the connection was created
  createdAt: number;
  // Last time the connection was used
  lastUsed: number;
  // Is this connection currently in use
  inUse: boolean;
  // Number of operations performed on this connection
  operationsCount: number;
  // Has this connection reported errors
  hasReportedErrors: boolean;
}

// Request priority levels
enum RequestPriority {
  // Critical operations (payments, checkout)
  CRITICAL = 0,
  // High importance (user authentication)
  HIGH = 1,
  // Normal operations (product browsing)
  NORMAL = 2,
  // Background operations (analytics)
  LOW = 3
}

// Queued request
interface QueuedRequest {
  // Unique request ID
  id: string;
  // Priority level
  priority: RequestPriority;
  // When the request was queued
  queuedAt: number;
  // Reference to the operation to perform
  operation: (client: SupabaseClient) => Promise<any>;
  // Resolve function for the promise
  resolve: (value: any) => void;
  // Reject function for the promise
  reject: (reason: any) => void;
  // Maximum time the request is willing to wait (ms)
  timeout?: number;
}

// Default configuration for the connection pool
const defaultConfig: ConnectionPoolConfig = {
  maxConnections: 10,
  maxIdleTime: 60000, // 1 minute
  maxQueueSize: 100,
  acquisitionTimeout: 5000, // 5 seconds
  maxConnectionLifetime: 3600000, // 1 hour
  healthCheckInterval: 30000 // 30 seconds
};

/**
 * Service for managing a pool of database connections
 */
export class ConnectionPoolService {
  private static instance: ConnectionPoolService;
  
  // Pool configuration
  private config: ConnectionPoolConfig;
  
  // Pool of connections
  private connectionPool: PooledConnection[] = [];
  
  // Queue of pending requests
  private requestQueue: QueuedRequest[] = [];
  
  // Is initialized flag
  private isInitialized = false;
  
  // Statistics
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    timedOutRequests: 0,
    peakConcurrentConnections: 0,
    totalQueueTime: 0,
    maxQueueLength: 0
  };
  
  // Private constructor (singleton)
  private constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * Get or create the singleton instance
   */
  public static getInstance(config?: Partial<ConnectionPoolConfig>): ConnectionPoolService {
    if (!ConnectionPoolService.instance) {
      ConnectionPoolService.instance = new ConnectionPoolService(config);
    }
    return ConnectionPoolService.instance;
  }
  
  /**
   * Initialize the connection pool
   */
  public init(): void {
    if (this.isInitialized) return;
    
    // Start health check interval
    setInterval(() => this.performHealthCheck(), this.config.healthCheckInterval);
    
    this.isInitialized = true;
    console.log('Connection pool initialized with config:', this.config);
  }
  
  /**
   * Get connection pool status
   */
  public getStatus(): {
    availableConnections: number;
    busyConnections: number;
    queueLength: number;
    stats: typeof ConnectionPoolService.prototype.stats;
  } {
    const availableConnections = this.connectionPool.filter(c => !c.inUse).length;
    const busyConnections = this.connectionPool.filter(c => c.inUse).length;
    
    return {
      availableConnections,
      busyConnections,
      queueLength: this.requestQueue.length,
      stats: { ...this.stats }
    };
  }
  
  /**
   * Execute a database operation with connection pooling
   * @param operation The operation to execute
   * @param priority Priority level for this operation
   * @param timeout Maximum time to wait for a connection (ms)
   * @returns Promise resolving to the operation result
   */
  public async execute<T>(
    operation: (client: SupabaseClient) => Promise<T>, 
    priority: RequestPriority = RequestPriority.NORMAL,
    timeout?: number
  ): Promise<T> {
    this.stats.totalRequests++;
    
    return new Promise<T>((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create the request
      const request: QueuedRequest = {
        id: requestId,
        priority,
        queuedAt: Date.now(),
        operation,
        resolve: (value) => {
          this.stats.successfulRequests++;
          resolve(value as T);
        },
        reject: (reason) => {
          this.stats.failedRequests++;
          reject(reason);
        },
        timeout
      };
      
      // Try to get an available connection first
      const connection = this.getAvailableConnection();
      
      if (connection) {
        // If connection available, use it immediately
        this.executeOperation(connection, request);
      } else if (this.connectionPool.length < this.config.maxConnections) {
        // If pool not full, create a new connection
        this.createConnection().then(newConnection => {
          this.executeOperation(newConnection, request);
        }).catch(error => {
          request.reject(new Error(`Failed to create database connection: ${error.message}`));
        });
      } else {
        // Otherwise queue the request
        this.queueRequest(request);
      }
    });
  }
  
  /**
   * Reset all connections in the pool
   */
  public reset(): void {
    // Reject all queued requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('Connection pool reset'));
    });
    
    // Clear queue
    this.requestQueue = [];
    
    // Close all connections
    this.connectionPool.forEach(connection => {
      // No explicit close method needed for Supabase client
    });
    
    // Clear pool
    this.connectionPool = [];
    
    console.log('Connection pool reset');
  }
  
  /**
   * Get an available connection from the pool
   */
  private getAvailableConnection(): PooledConnection | null {
    const now = Date.now();
    
    // Find an idle connection
    const availableConnection = this.connectionPool.find(connection => {
      // Check if not in use
      if (connection.inUse) {
        return false;
      }
      
      // Check if connection has expired
      const lifetime = now - connection.createdAt;
      if (lifetime > this.config.maxConnectionLifetime) {
        return false;
      }
      
      return true;
    });
    
    return availableConnection || null;
  }
  
  /**
   * Create a new connection
   */
  private async createConnection(): Promise<PooledConnection> {
    // Get credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not available');
    }
    
    // Create a new client
    const client = createClient(supabaseUrl, supabaseKey);
    
    // Create pooled connection
    const connection: PooledConnection = {
      client,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      inUse: false,
      operationsCount: 0,
      hasReportedErrors: false
    };
    
    // Add to pool
    this.connectionPool.push(connection);
    
    // Update stats
    if (this.connectionPool.length > this.stats.peakConcurrentConnections) {
      this.stats.peakConcurrentConnections = this.connectionPool.length;
    }
    
    return connection;
  }
  
  /**
   * Execute an operation using a connection
   */
  private async executeOperation(connection: PooledConnection, request: QueuedRequest): Promise<void> {
    // Mark connection as in use
    connection.inUse = true;
    connection.lastUsed = Date.now();
    
    try {
      // Execute the operation
      const result = await request.operation(connection.client);
      
      // Update connection stats
      connection.operationsCount++;
      
      // Resolve the request
      request.resolve(result);
    } catch (error) {
      // Mark connection as having errors
      connection.hasReportedErrors = true;
      
      // Reject the request
      request.reject(error);
    } finally {
      // Mark connection as available
      connection.inUse = false;
      connection.lastUsed = Date.now();
      
      // Process next request in queue
      this.processNextRequest();
    }
  }
  
  /**
   * Add a request to the queue
   */
  private queueRequest(request: QueuedRequest): void {
    // Check if queue is full
    if (this.requestQueue.length >= this.config.maxQueueSize) {
      // If full, reject low priority requests
      if (request.priority >= RequestPriority.NORMAL) {
        request.reject(new Error('Request queue is full, try again later'));
        return;
      }
      
      // For high priority requests, remove the lowest priority request
      const lowestPriorityIndex = this.requestQueue.findIndex(r => r.priority === RequestPriority.LOW);
      if (lowestPriorityIndex !== -1) {
        const removedRequest = this.requestQueue.splice(lowestPriorityIndex, 1)[0];
        removedRequest.reject(new Error('Request evicted from queue by higher priority request'));
      } else {
        request.reject(new Error('Request queue is full and no low priority requests to evict'));
        return;
      }
    }
    
    // Add request to queue
    this.requestQueue.push(request);
    
    // Update stats
    if (this.requestQueue.length > this.stats.maxQueueLength) {
      this.stats.maxQueueLength = this.requestQueue.length;
    }
    
    // Sort queue by priority and then by queue time
    this.requestQueue.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by queue time (oldest first)
      return a.queuedAt - b.queuedAt;
    });
    
    // Set timeout for the request if specified
    if (request.timeout) {
      setTimeout(() => {
        // Check if request is still in the queue
        const index = this.requestQueue.findIndex(r => r.id === request.id);
        if (index !== -1) {
          // Remove from queue
          this.requestQueue.splice(index, 1);
          // Reject with timeout
          request.reject(new Error('Request timed out waiting for database connection'));
          this.stats.timedOutRequests++;
        }
      }, request.timeout);
    }
  }
  
  /**
   * Process the next request in the queue
   */
  private processNextRequest(): void {
    // If queue is empty, nothing to do
    if (this.requestQueue.length === 0) {
      return;
    }
    
    // Look for an available connection
    const connection = this.getAvailableConnection();
    
    if (connection) {
      // Get the highest priority request
      const request = this.requestQueue.shift()!;
      
      // Calculate queue time
      const queueTime = Date.now() - request.queuedAt;
      this.stats.totalQueueTime += queueTime;
      
      // Execute the request
      this.executeOperation(connection, request);
    } else if (this.connectionPool.length < this.config.maxConnections) {
      // If pool not full, create a new connection
      this.createConnection().then(newConnection => {
        // Get the highest priority request
        const request = this.requestQueue.shift()!;
        
        // Calculate queue time
        const queueTime = Date.now() - request.queuedAt;
        this.stats.totalQueueTime += queueTime;
        
        // Execute the request
        this.executeOperation(newConnection, request);
      }).catch(error => {
        console.error('Failed to create connection for queued request:', error);
      });
    }
  }
  
  /**
   * Perform health check on connections
   */
  private performHealthCheck(): void {
    const now = Date.now();
    
    // Check for expired connections
    this.connectionPool = this.connectionPool.filter(connection => {
      // Skip connections in use
      if (connection.inUse) {
        return true;
      }
      
      // Check idle time
      const idleTime = now - connection.lastUsed;
      if (idleTime > this.config.maxIdleTime) {
        // Connection idle for too long, remove it
        return false;
      }
      
      // Check lifetime
      const lifetime = now - connection.createdAt;
      if (lifetime > this.config.maxConnectionLifetime) {
        // Connection too old, remove it
        return false;
      }
      
      // Check for error history
      if (connection.hasReportedErrors) {
        // Connection has reported errors, remove it
        return false;
      }
      
      // Keep the connection
      return true;
    });
    
    // Process any queued requests if we have capacity
    this.processNextRequest();
  }
  
  /**
   * Get average queue time
   */
  public getAverageQueueTime(): number {
    if (this.stats.successfulRequests === 0) {
      return 0;
    }
    return this.stats.totalQueueTime / this.stats.successfulRequests;
  }
}

// Export request priority enum
export { RequestPriority };

// Default export
export default ConnectionPoolService; 