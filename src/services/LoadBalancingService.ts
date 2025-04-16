/**
 * LoadBalancingService.ts
 * 
 * Client-side load balancing capabilities for the LUSH MILK application:
 * - Request prioritization
 * - Resource-aware fetch operations
 * - Circuit breaker pattern implementation
 * - Exponential backoff for retries
 * - Health checking for API endpoints
 */

import { monitoring } from './MonitoringService';

// Configuration
const LOAD_BALANCING_CONFIG = {
  // Circuit breaker settings
  FAILURE_THRESHOLD: 5, // Number of failures before circuit opens
  RESET_TIMEOUT: 30000, // Time in ms until trying to close circuit
  
  // Retry settings
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 300, // Base delay in ms
  MAX_RETRY_DELAY: 5000, // Maximum delay
  
  // Health check settings
  HEALTH_CHECK_INTERVAL: 60000, // Check endpoint health every minute
  HEALTH_CHECK_TIMEOUT: 3000, // Timeout for health checks
  
  // Request priority settings
  HIGH_PRIORITY_TIMEOUT: 10000, // 10 seconds
  NORMAL_PRIORITY_TIMEOUT: 30000, // 30 seconds
  LOW_PRIORITY_TIMEOUT: 60000, // 60 seconds
};

// Endpoint statuses
type EndpointStatus = 'healthy' | 'degraded' | 'unhealthy';

// Priority levels for requests
type RequestPriority = 'high' | 'normal' | 'low';

/**
 * Circuit Breaker Pattern Implementation
 * Prevents system overload by failing fast when services are unavailable
 */
class CircuitBreaker {
  private failures: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private lastFailureTime: number = 0;
  private resetTimeout: NodeJS.Timeout | null = null;
  
  constructor(
    private readonly name: string,
    private readonly failureThreshold: number = LOAD_BALANCING_CONFIG.FAILURE_THRESHOLD,
    private readonly resetTimeoutMs: number = LOAD_BALANCING_CONFIG.RESET_TIMEOUT
  ) {}
  
  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If circuit is open, check if we should try half-open state
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = 'half-open';
        console.log(`CircuitBreaker [${this.name}]: Transitioning to half-open state`);
      } else {
        // Circuit is open, fail fast
        throw new Error(`Service unavailable: Circuit for ${this.name} is open`);
      }
    }
    
    try {
      // Execute the function
      const result = await fn();
      
      // On success, reset circuit if in half-open state
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      // Record failure
      this.recordFailure();
      
      // If we've reached the threshold, open the circuit
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        this.lastFailureTime = Date.now();
        console.error(`CircuitBreaker [${this.name}]: Circuit opened after ${this.failures} failures`);
        
        // Set timeout to try again
        if (this.resetTimeout) {
          clearTimeout(this.resetTimeout);
        }
        
        this.resetTimeout = setTimeout(() => {
          this.state = 'half-open';
          console.log(`CircuitBreaker [${this.name}]: Transitioning to half-open state`);
        }, this.resetTimeoutMs);
      }
      
      throw error;
    }
  }
  
  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failures++;
  }
  
  /**
   * Reset the circuit breaker
   */
  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    console.log(`CircuitBreaker [${this.name}]: Circuit closed`);
    
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
  }
  
  /**
   * Get the current state of the circuit
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

/**
 * Retry Handler with Exponential Backoff
 */
class RetryHandler {
  /**
   * Retry a function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryCondition?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || LOAD_BALANCING_CONFIG.MAX_RETRIES;
    const baseDelay = options.baseDelay || LOAD_BALANCING_CONFIG.BASE_RETRY_DELAY;
    const maxDelay = options.maxDelay || LOAD_BALANCING_CONFIG.MAX_RETRY_DELAY;
    const retryCondition = options.retryCondition || (() => true);
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // On the first attempt, just try immediately
        if (attempt > 0) {
          // Calculate exponential backoff delay with jitter
          const delay = Math.min(
            baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100,
            maxDelay
          );
          
          console.log(`RetryHandler: Attempt ${attempt} of ${maxRetries}, waiting ${delay}ms`);
          
          // Wait for the calculated delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Try the function
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if this error should be retried
        if (!retryCondition(error)) {
          console.log(`RetryHandler: Error not eligible for retry`, error);
          throw error;
        }
        
        // If we've used all retries, throw the last error
        if (attempt === maxRetries) {
          console.error(`RetryHandler: Maximum retries (${maxRetries}) reached`, error);
          throw error;
        }
      }
    }
    
    // This shouldn't be reached due to the throws above, but TypeScript needs it
    throw lastError;
  }
}

/**
 * Endpoint Health Checker
 * Monitors health of API endpoints
 */
class EndpointHealthChecker {
  private static endpoints: Map<string, {
    status: EndpointStatus;
    lastCheck: number;
    responseTime: number;
    failures: number;
  }> = new Map();
  
  /**
   * Register an endpoint for health checking
   */
  static registerEndpoint(endpoint: string): void {
    if (!this.endpoints.has(endpoint)) {
      this.endpoints.set(endpoint, {
        status: 'healthy',
        lastCheck: 0,
        responseTime: 0,
        failures: 0
      });
      
      // Perform initial health check
      this.checkEndpointHealth(endpoint);
    }
  }
  
  /**
   * Check the health of an endpoint
   */
  static async checkEndpointHealth(endpoint: string): Promise<EndpointStatus> {
    const endpointData = this.endpoints.get(endpoint);
    if (!endpointData) {
      this.registerEndpoint(endpoint);
      return 'healthy';
    }
    
    // Skip if checked recently
    const now = Date.now();
    if (now - endpointData.lastCheck < LOAD_BALANCING_CONFIG.HEALTH_CHECK_INTERVAL) {
      return endpointData.status;
    }
    
    try {
      // Perform a HEAD request to check endpoint health
      const startTime = performance.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), LOAD_BALANCING_CONFIG.HEALTH_CHECK_TIMEOUT);
      
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = performance.now() - startTime;
      
      // Update endpoint status based on response
      let status: EndpointStatus = 'healthy';
      
      if (!response.ok) {
        status = 'degraded';
      }
      
      // Slow responses indicate degraded status
      if (responseTime > 1000) {
        status = 'degraded';
      }
      
      // Reset failures if successful
      if (status === 'healthy') {
        endpointData.failures = 0;
      }
      
      this.endpoints.set(endpoint, {
        status,
        lastCheck: now,
        responseTime,
        failures: endpointData.failures
      });
      
      return status;
    } catch (error) {
      // Increment failures
      endpointData.failures++;
      
      let status: EndpointStatus = 'degraded';
      
      // Mark as unhealthy after multiple failures
      if (endpointData.failures >= 3) {
        status = 'unhealthy';
      }
      
      this.endpoints.set(endpoint, {
        status,
        lastCheck: now,
        responseTime: -1,
        failures: endpointData.failures
      });
      
      console.warn(`EndpointHealthChecker: Health check failed for ${endpoint}`, error);
      return status;
    }
  }
  
  /**
   * Get the status of an endpoint
   */
  static getEndpointStatus(endpoint: string): EndpointStatus {
    const endpointData = this.endpoints.get(endpoint);
    if (!endpointData) {
      this.registerEndpoint(endpoint);
      return 'healthy';
    }
    
    return endpointData.status;
  }
  
  /**
   * Set up periodic health checks for all registered endpoints
   */
  static startPeriodicHealthChecks(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.endpoints.forEach((_data, endpoint) => {
          this.checkEndpointHealth(endpoint).catch(error => {
            console.error(`EndpointHealthChecker: Periodic health check failed for ${endpoint}`, error);
          });
        });
      }, LOAD_BALANCING_CONFIG.HEALTH_CHECK_INTERVAL);
    }
  }
}

/**
 * Prioritized Request Queue
 * Ensures high priority requests are processed first
 */
class PrioritizedRequestQueue {
  private static queues: {
    high: Array<() => Promise<any>>;
    normal: Array<() => Promise<any>>;
    low: Array<() => Promise<any>>;
  } = {
    high: [],
    normal: [],
    low: []
  };
  
  private static processing = false;
  
  /**
   * Add a request to the queue with priority
   */
  static async enqueue<T>(
    priority: RequestPriority,
    request: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await request();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };
      
      // Add to appropriate queue
      this.queues[priority].push(wrappedRequest);
      
      // Start processing if not already
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process queued requests in priority order
   */
  private static async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    while (
      this.queues.high.length > 0 || 
      this.queues.normal.length > 0 || 
      this.queues.low.length > 0
    ) {
      let request: (() => Promise<any>) | undefined;
      
      // Process high priority first, then normal, then low
      if (this.queues.high.length > 0) {
        request = this.queues.high.shift();
      } else if (this.queues.normal.length > 0) {
        request = this.queues.normal.shift();
      } else if (this.queues.low.length > 0) {
        request = this.queues.low.shift();
      }
      
      if (request) {
        try {
          await request();
        } catch (error) {
          // Error handled in wrapped request
          console.error('Error processing queued request', error);
        }
      }
    }
    
    this.processing = false;
  }
  
  /**
   * Get current queue lengths
   */
  static getQueueLengths(): { high: number; normal: number; low: number } {
    return {
      high: this.queues.high.length,
      normal: this.queues.normal.length,
      low: this.queues.low.length
    };
  }
}

/**
 * Main Load Balancing Service
 */
export class LoadBalancingService {
  private static circuitBreakers: Map<string, CircuitBreaker> = new Map();
  
  /**
   * Initialize load balancing service
   */
  static init(): void {
    // Start health checks
    EndpointHealthChecker.startPeriodicHealthChecks();
    
    // Register common endpoints
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      EndpointHealthChecker.registerEndpoint(`${origin}/api/health`);
      EndpointHealthChecker.registerEndpoint(`${origin}/api/products`);
      EndpointHealthChecker.registerEndpoint(`${origin}/api/users`);
    }
    
    console.log('Load balancing service initialized');
  }
  
  /**
   * Get or create a circuit breaker for an endpoint
   */
  private static getCircuitBreaker(name: string): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name));
    }
    
    return this.circuitBreakers.get(name)!;
  }
  
  /**
   * Send a request with load balancing features
   */
  static async sendRequest<T>(
    endpoint: string,
    options: RequestInit & {
      priority?: RequestPriority;
      retry?: boolean;
      circuitBreaker?: boolean;
      timeout?: number;
    } = {}
  ): Promise<T> {
    // Set defaults
    const priority = options.priority || 'normal';
    const retry = options.retry !== false; // Default true
    const useCircuitBreaker = options.circuitBreaker !== false; // Default true
    
    // Set timeout based on priority
    const timeout = options.timeout || 
      (priority === 'high' 
        ? LOAD_BALANCING_CONFIG.HIGH_PRIORITY_TIMEOUT 
        : priority === 'normal' 
          ? LOAD_BALANCING_CONFIG.NORMAL_PRIORITY_TIMEOUT 
          : LOAD_BALANCING_CONFIG.LOW_PRIORITY_TIMEOUT);
    
    // Check endpoint health
    const status = await EndpointHealthChecker.checkEndpointHealth(endpoint);
    if (status === 'unhealthy' && priority !== 'high') {
      throw new Error(`Endpoint ${endpoint} is unhealthy`);
    }
    
    // Define the fetch operation
    const fetchOperation = async (): Promise<T> => {
      // Set up timeout
      const controller = new AbortController();
      const signal = controller.signal;
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        // Use monitoring fetch if available
        const fetchFn = monitoring?.fetch || fetch;
        const response = await fetchFn(endpoint, {
          ...options,
          signal
        });
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        return data as T;
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    // Create the execution chain with the selected features
    let executionChain = fetchOperation;
    
    // Add circuit breaker if enabled
    if (useCircuitBreaker) {
      const circuitBreaker = this.getCircuitBreaker(endpoint);
      const withCircuitBreaker = () => circuitBreaker.execute(executionChain);
      executionChain = withCircuitBreaker;
    }
    
    // Add retry if enabled
    if (retry) {
      const retryCondition = (error: any) => {
        // Only retry on network errors or 5xx status codes
        if (error.name === 'AbortError') return false;
        if (error.message.includes('status 4')) return false;
        return true;
      };
      
      const withRetry = () => RetryHandler.withRetry(executionChain, { retryCondition });
      executionChain = withRetry;
    }
    
    // Execute with priority queue
    return PrioritizedRequestQueue.enqueue(priority, executionChain);
  }
  
  /**
   * Check if an endpoint is healthy
   */
  static isEndpointHealthy(endpoint: string): boolean {
    const status = EndpointHealthChecker.getEndpointStatus(endpoint);
    return status === 'healthy';
  }
  
  /**
   * Get queue statistics
   */
  static getQueueStatistics(): { high: number; normal: number; low: number } {
    return PrioritizedRequestQueue.getQueueLengths();
  }
  
  /**
   * Get circuit breaker status for an endpoint
   */
  static getCircuitBreakerStatus(endpoint: string): 'closed' | 'open' | 'half-open' | 'not-found' {
    const circuitBreaker = this.circuitBreakers.get(endpoint);
    if (!circuitBreaker) return 'not-found';
    
    return circuitBreaker.getState();
  }
}

// Export utility functions for direct use
export const loadBalancer = {
  init: LoadBalancingService.init,
  sendRequest: LoadBalancingService.sendRequest,
  isEndpointHealthy: LoadBalancingService.isEndpointHealthy,
  getQueueStatistics: LoadBalancingService.getQueueStatistics,
  getCircuitBreakerStatus: LoadBalancingService.getCircuitBreakerStatus
};

export default LoadBalancingService; 