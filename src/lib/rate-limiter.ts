/**
 * Simple in-memory rate limiter
 * For production, consider using a Redis-based solution
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 5) {
    this.limits = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a key (IP address, user ID, etc.) has exceeded rate limits
   * @param key Identifier to rate limit (typically IP address)
   * @returns Object containing limit status and reset time
   */
  check(key: string): { limited: boolean; remaining: number; resetTime: Date } {
    const now = Date.now();
    
    // Get or create rate limit record
    let record = this.limits.get(key);
    if (!record) {
      record = { count: 0, resetTime: now + this.windowMs };
      this.limits.set(key, record);
    }
    
    // Reset if window has expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }
    
    // Increment count
    record.count++;
    
    const limited = record.count > this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - record.count);
    
    return {
      limited,
      remaining,
      resetTime: new Date(record.resetTime)
    };
  }

  /**
   * Clean up expired rate limit records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiters with different configurations
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes for auth
export const apiRateLimiter = new RateLimiter(60 * 1000, 20); // 20 requests per minute for API
export const contactFormLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 submissions per hour 