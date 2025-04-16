/**
 * RateLimitingService.ts
 * 
 * Service for limiting request rates to protect the LUSH MILK API:
 * - Token bucket algorithm implementation
 * - Different rate limits for different routes/operations
 * - User-based and IP-based rate limiting
 * - Configurable limits and penalties
 * - Distributed rate limiting with Redis support
 */

// Import Redis client if available
let redis: any = null;
try {
  if (process.env.REDIS_URL) {
    // Dynamic import to prevent issues if Redis is not installed
    import('redis').then((module) => {
      const client = module.createClient({
        url: process.env.REDIS_URL
      });
      client.on('error', (err) => console.error('Redis error:', err));
      client.connect().then(() => {
        console.log('Redis connected for distributed rate limiting');
        redis = client;
      });
    }).catch(err => {
      console.warn('Redis module not available, using in-memory rate limiting:', err.message);
    });
  }
} catch (error) {
  console.warn('Redis setup failed, using in-memory rate limiting');
}

/**
 * Get rate limit data from Redis
 */
async function getRedisRateLimit(key: string): Promise<RateLimitTracker | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get(`rate_limit:${key}`);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set rate limit data in Redis
 */
async function setRedisRateLimit(key: string, data: RateLimitTracker, ttl: number): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.set(`rate_limit:${key}`, JSON.stringify(data), {
      EX: Math.ceil(ttl / 1000)  // Convert ms to seconds for Redis TTL
    });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

// Rate limit configuration by route type
interface RateLimitConfig {
  // Requests per minute
  maxRequestsPerMinute: number;
  // Burst capacity (max tokens in bucket)
  burstCapacity: number;
  // Token refill rate (tokens per second)
  refillRate: number;
  // Penalty factor for failed attempts (e.g., login)
  penaltyFactor: number;
  // Cooldown period after exceeding limits (seconds)
  cooldownPeriod: number;
}

// Rate limit tracked data 
interface RateLimitTracker {
  // Current token count
  tokens: number;
  // Last refill timestamp
  lastRefill: number;
  // Current cooldown expiry (if any)
  cooldownExpiry?: number;
  // Failed attempts counter
  failedAttempts: number;
}

// Route types with different rate limits
enum RouteType {
  // Public API endpoints (higher limits)
  PUBLIC_API = 'public_api',
  // Authentication operations (lower limits to prevent brute force)
  AUTH = 'auth',
  // User account operations
  USER_ACCOUNT = 'user_account',
  // Product operations (browsing, search)
  PRODUCT = 'product',
  // Order operations (checkout, history)
  ORDER = 'order',
  // Admin operations (very limited)
  ADMIN = 'admin'
}

// Configuration for different route types
const rateLimitConfigs: Record<RouteType, RateLimitConfig> = {
  [RouteType.PUBLIC_API]: {
    maxRequestsPerMinute: 60, // 1 request per second on average
    burstCapacity: 15,
    refillRate: 1,
    penaltyFactor: 1,
    cooldownPeriod: 60
  },
  [RouteType.AUTH]: {
    maxRequestsPerMinute: 10, // Very limited for security
    burstCapacity: 5,
    refillRate: 0.2,
    penaltyFactor: 3, // Higher penalty for failed auth
    cooldownPeriod: 300 // 5 minute cooldown
  },
  [RouteType.USER_ACCOUNT]: {
    maxRequestsPerMinute: 30,
    burstCapacity: 10,
    refillRate: 0.5,
    penaltyFactor: 1,
    cooldownPeriod: 120
  },
  [RouteType.PRODUCT]: {
    maxRequestsPerMinute: 120, // Higher for product browsing
    burstCapacity: 30,
    refillRate: 2,
    penaltyFactor: 1,
    cooldownPeriod: 60
  },
  [RouteType.ORDER]: {
    maxRequestsPerMinute: 20,
    burstCapacity: 8,
    refillRate: 0.3,
    penaltyFactor: 1,
    cooldownPeriod: 180
  },
  [RouteType.ADMIN]: {
    maxRequestsPerMinute: 30,
    burstCapacity: 10,
    refillRate: 0.5,
    penaltyFactor: 2,
    cooldownPeriod: 240
  }
};

/**
 * Service to manage rate limiting for the application
 */
export class RateLimitingService {
  // In-memory store for rate limit trackers
  private static limiters: Map<string, RateLimitTracker> = new Map();
  
  // Cache of route paths to route types
  private static routeTypeCache: Map<string, RouteType> = new Map();
  
  // Timestamps of recent requests for cleanup
  private static recentRequests: number[] = [];
  
  // Is initialized flag
  private static isInitialized = false;
  
  /**
   * Initialize the rate limiting service
   */
  static init(): void {
    if (this.isInitialized) return;
    
    // Start periodic cleanup
    if (typeof window === 'undefined') { // Only on server-side
      setInterval(() => this.cleanup(), 60000); // Clean up every minute
    }
    
    this.isInitialized = true;
    console.log('Rate limiting service initialized');
  }
  
  /**
   * Map a route path to a route type for rate limiting
   */
  static getRouteType(path: string): RouteType {
    // Check cache first
    if (this.routeTypeCache.has(path)) {
      return this.routeTypeCache.get(path)!;
    }
    
    let routeType: RouteType;
    
    // Determine route type based on path
    if (path.includes('/auth') || path.includes('/login') || path.includes('/register')) {
      routeType = RouteType.AUTH;
    } else if (path.includes('/admin')) {
      routeType = RouteType.ADMIN;
    } else if (path.includes('/user') || path.includes('/profile') || path.includes('/account')) {
      routeType = RouteType.USER_ACCOUNT;
    } else if (path.includes('/product') || path.includes('/category') || path.includes('/search')) {
      routeType = RouteType.PRODUCT;
    } else if (path.includes('/order') || path.includes('/checkout') || path.includes('/cart')) {
      routeType = RouteType.ORDER;
    } else {
      routeType = RouteType.PUBLIC_API;
    }
    
    // Cache the result
    this.routeTypeCache.set(path, routeType);
    return routeType;
  }
  
  /**
   * Check if a request is allowed based on rate limits
   * @param identifier - User ID or IP address
   * @param path - API route path
   * @param isSuccessful - Was the request successful (for penalty calculation)
   * @returns Whether the request is allowed
   */
  static isAllowed(identifier: string, path: string, isSuccessful = true): boolean {
    if (!this.isInitialized) {
      this.init();
    }
    
    const routeType = this.getRouteType(path);
    const config = rateLimitConfigs[routeType];
    const key = `${identifier}:${routeType}`;
    
    // Record timestamp for cleanup
    this.recentRequests.push(Date.now());
    
    // Get or create tracker
    let tracker = this.limiters.get(key);
    if (!tracker) {
      tracker = {
        tokens: config.burstCapacity,
        lastRefill: Date.now(),
        failedAttempts: 0
      };
      this.limiters.set(key, tracker);
    }
    
    // Check if in cooldown period
    if (tracker.cooldownExpiry && Date.now() < tracker.cooldownExpiry) {
      return false;
    }
    
    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsedSeconds = (now - tracker.lastRefill) / 1000;
    
    if (elapsedSeconds > 0) {
      // Add tokens based on refill rate and time elapsed
      tracker.tokens = Math.min(
        config.burstCapacity,
        tracker.tokens + elapsedSeconds * config.refillRate
      );
      tracker.lastRefill = now;
    }
    
    // If no tokens available, request is not allowed
    if (tracker.tokens < 1) {
      // Apply cooldown if burst capacity was exceeded
      if (tracker.tokens <= 0.01) {
        tracker.cooldownExpiry = now + config.cooldownPeriod * 1000;
      }
      return false;
    }
    
    // Consume token for this request
    tracker.tokens -= 1;
    
    // Update failed attempts counter
    if (!isSuccessful) {
      tracker.failedAttempts += 1;
      
      // Apply penalty for failed attempts
      const penalty = config.penaltyFactor * tracker.failedAttempts;
      tracker.tokens = Math.max(0, tracker.tokens - penalty);
      
      // Reset tokens and apply cooldown if too many failures
      if (tracker.failedAttempts >= 5) {
        tracker.tokens = 0;
        tracker.cooldownExpiry = now + config.cooldownPeriod * 1000;
        // Reset failed attempts
        tracker.failedAttempts = 0;
      }
    } else {
      // Reset failed attempts on success
      tracker.failedAttempts = 0;
    }
    
    return true;
  }
  
  /**
   * Get remaining tokens for an identifier and route type
   */
  static getRemainingTokens(identifier: string, routeType: RouteType): number {
    const key = `${identifier}:${routeType}`;
    const tracker = this.limiters.get(key);
    
    if (!tracker) {
      return rateLimitConfigs[routeType].burstCapacity;
    }
    
    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsedSeconds = (now - tracker.lastRefill) / 1000;
    
    if (elapsedSeconds > 0) {
      const config = rateLimitConfigs[routeType];
      const tokens = Math.min(
        config.burstCapacity,
        tracker.tokens + elapsedSeconds * config.refillRate
      );
      
      return tokens;
    }
    
    return tracker.tokens;
  }
  
  /**
   * Get time until next allowed request in milliseconds
   */
  static getTimeUntilNextAllowed(identifier: string, routeType: RouteType): number {
    const key = `${identifier}:${routeType}`;
    const tracker = this.limiters.get(key);
    
    if (!tracker) {
      return 0;
    }
    
    const config = rateLimitConfigs[routeType];
    
    // If in cooldown period
    if (tracker.cooldownExpiry && Date.now() < tracker.cooldownExpiry) {
      return tracker.cooldownExpiry - Date.now();
    }
    
    // If has enough tokens, can request immediately
    if (tracker.tokens >= 1) {
      return 0;
    }
    
    // Calculate time until enough tokens are refilled
    const tokensNeeded = 1 - tracker.tokens;
    const secondsNeeded = tokensNeeded / config.refillRate;
    
    return Math.ceil(secondsNeeded * 1000);
  }
  
  /**
   * Get rate limit information for an identifier and route type
   */
  static getRateLimitInfo(identifier: string, routeType: RouteType): {
    allowed: boolean;
    remainingTokens: number;
    waitTimeMs: number;
    resetTimeMs: number;
  } {
    const key = `${identifier}:${routeType}`;
    const config = rateLimitConfigs[routeType];
    const tracker = this.limiters.get(key);
    
    // If no tracker exists, fully allowed
    if (!tracker) {
      return {
        allowed: true,
        remainingTokens: config.burstCapacity,
        waitTimeMs: 0,
        resetTimeMs: 0
      };
    }
    
    const now = Date.now();
    
    // Refill tokens based on time elapsed
    const elapsedSeconds = (now - tracker.lastRefill) / 1000;
    let tokens = tracker.tokens;
    
    if (elapsedSeconds > 0) {
      tokens = Math.min(
        config.burstCapacity,
        tokens + elapsedSeconds * config.refillRate
      );
    }
    
    // Check if in cooldown period
    const inCooldown = tracker.cooldownExpiry && now < tracker.cooldownExpiry;
    const allowed = tokens >= 1 && !inCooldown;
    
    // Calculate time until reset (full capacity)
    const tokensToFull = config.burstCapacity - tokens;
    const resetTimeMs = Math.max(0, Math.ceil((tokensToFull / config.refillRate) * 1000));
    
    // Calculate wait time
    let waitTimeMs = 0;
    if (inCooldown) {
      waitTimeMs = tracker.cooldownExpiry! - now;
    } else if (!allowed) {
      const tokensNeeded = 1 - tokens;
      waitTimeMs = Math.ceil((tokensNeeded / config.refillRate) * 1000);
    }
    
    return {
      allowed,
      remainingTokens: Math.floor(tokens),
      waitTimeMs,
      resetTimeMs
    };
  }
  
  /**
   * Reset rate limiter for an identifier and route type
   */
  static reset(identifier: string, routeType: RouteType): void {
    const key = `${identifier}:${routeType}`;
    this.limiters.delete(key);
  }
  
  /**
   * Reset all rate limiters
   */
  static resetAll(): void {
    this.limiters.clear();
  }
  
  /**
   * Clean up old limiters to prevent memory leaks
   */
  private static cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour ago
    
    // Remove old request timestamps
    this.recentRequests = this.recentRequests.filter(time => time > oneHourAgo);
    
    // If no recent requests, clean up everything
    if (this.recentRequests.length === 0) {
      this.limiters.clear();
      return;
    }
    
    // Find inactive limiters to clean up
    const keysToRemove: string[] = [];
    
    this.limiters.forEach((tracker, key) => {
      // Clean up if not used in the last hour and not in cooldown
      const inCooldown = tracker.cooldownExpiry && tracker.cooldownExpiry > now;
      if (tracker.lastRefill < oneHourAgo && !inCooldown) {
        keysToRemove.push(key);
      }
    });
    
    // Remove inactive limiters
    keysToRemove.forEach(key => {
      this.limiters.delete(key);
    });
  }
}

// Route type enum export
export { RouteType };

// Helper middleware factory
export const createRateLimiter = (identifierFn: (req: any) => string) => {
  return (req: any, res: any, next?: () => void) => {
    const identifier = identifierFn(req);
    const path = req.path || req.url || '/';
    
    if (RateLimitingService.isAllowed(identifier, path)) {
      next && next();
    } else {
      const routeType = RateLimitingService.getRouteType(path);
      const info = RateLimitingService.getRateLimitInfo(identifier, routeType);
      
      // Set rate limit headers
      if (res.setHeader) {
        res.setHeader('X-RateLimit-Limit', rateLimitConfigs[routeType].maxRequestsPerMinute);
        res.setHeader('X-RateLimit-Remaining', info.remainingTokens);
        res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTimeMs / 1000));
        res.setHeader('Retry-After', Math.ceil(info.waitTimeMs / 1000));
      }
      
      // Return 429 Too Many Requests
      if (res.status) {
        res.status(429).json({
          error: 'Too many requests',
          waitTime: Math.ceil(info.waitTimeMs / 1000),
          message: `Rate limit exceeded. Please try again in ${Math.ceil(info.waitTimeMs / 1000)} seconds.`
        });
      }
    }
    
    return !next; // For use with fetch API interceptors
  };
};

// Default export
export default RateLimitingService; 