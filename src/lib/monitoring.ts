/**
 * Application Monitoring Utility
 * 
 * Provides functions for tracking application health, performance,
 * and security events.
 */

// Types for monitoring events
export type MonitoringLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface MonitoringEvent {
  level: MonitoringLevel;
  category: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

// Memory store for events (in a real app, you would use a proper storage/monitoring service)
const events: MonitoringEvent[] = [];
const MAX_EVENTS = 1000; // Limit memory usage in development

// Configuration options
let monitoringConfig = {
  enabled: true,
  minLevel: 'info' as MonitoringLevel, // Minimum level to record
  consoleOutput: true, // Whether to also output to console
  endpoint: '', // Remote endpoint to send logs to (if any)
};

// Levels and their priorities
const LEVEL_PRIORITY: Record<MonitoringLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

/**
 * Configure the monitoring system
 */
export function configureMonitoring(config: Partial<typeof monitoringConfig>) {
  monitoringConfig = { ...monitoringConfig, ...config };
}

/**
 * Record a monitoring event
 */
export function recordEvent(
  level: MonitoringLevel,
  category: string,
  message: string,
  data?: Record<string, any>,
  context?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
  }
): void {
  // Skip if monitoring is disabled
  if (!monitoringConfig.enabled) {
    return;
  }

  // Skip if level is below minimum
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[monitoringConfig.minLevel]) {
    return;
  }

  const event: MonitoringEvent = {
    level,
    category,
    message,
    timestamp: new Date().toISOString(),
    data,
    ...context,
  };

  // Add to local event store (limited size to prevent memory issues)
  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }

  // Output to console if enabled
  if (monitoringConfig.consoleOutput) {
    const consoleMethod = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
      critical: console.error,
    }[level];

    consoleMethod(
      `[${event.timestamp}] [${level.toUpperCase()}] [${category}] ${message}`,
      data || ''
    );
  }

  // Send to remote endpoint if configured
  if (monitoringConfig.endpoint) {
    sendToRemoteEndpoint(event).catch(err => {
      console.error('Failed to send monitoring event to remote endpoint:', err);
    });
  }
}

/**
 * Convenience methods for different event levels
 */
export const monitoring = {
  debug: (category: string, message: string, data?: Record<string, any>, context?: any) =>
    recordEvent('debug', category, message, data, context),
  info: (category: string, message: string, data?: Record<string, any>, context?: any) =>
    recordEvent('info', category, message, data, context),
  warn: (category: string, message: string, data?: Record<string, any>, context?: any) =>
    recordEvent('warn', category, message, data, context),
  error: (category: string, message: string, data?: Record<string, any>, context?: any) =>
    recordEvent('error', category, message, data, context),
  critical: (category: string, message: string, data?: Record<string, any>, context?: any) =>
    recordEvent('critical', category, message, data, context),
};

/**
 * Get recent monitoring events for display in admin dashboard
 */
export function getRecentEvents(
  options: {
    limit?: number;
    level?: MonitoringLevel;
    category?: string;
    userId?: string;
  } = {}
): MonitoringEvent[] {
  const { limit = 100, level, category, userId } = options;

  return events
    .filter(event => {
      if (level && LEVEL_PRIORITY[event.level] < LEVEL_PRIORITY[level]) {
        return false;
      }
      if (category && event.category !== category) {
        return false;
      }
      if (userId && event.userId !== userId) {
        return false;
      }
      return true;
    })
    .slice(0, limit);
}

/**
 * Send monitoring event to a remote endpoint
 */
async function sendToRemoteEndpoint(event: MonitoringEvent): Promise<void> {
  if (!monitoringConfig.endpoint) {
    return;
  }

  try {
    const response = await fetch(monitoringConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send monitoring event:', error);
    // Don't throw - we don't want monitoring failures to break the app
  }
}

/**
 * Track performance of a function
 */
export function trackPerformance<T>(
  category: string,
  name: string,
  fn: () => T,
  context?: any
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    monitoring.debug(
      category,
      `Performance: ${name}`,
      { duration: `${duration.toFixed(2)}ms` },
      context
    );
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    monitoring.error(
      category,
      `Error in ${name}`,
      { 
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error)
      },
      context
    );
    
    throw error;
  }
}

/**
 * Track performance of an async function
 */
export async function trackPerformanceAsync<T>(
  category: string,
  name: string,
  fn: () => Promise<T>,
  context?: any
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    monitoring.debug(
      category,
      `Performance: ${name}`,
      { duration: `${duration.toFixed(2)}ms` },
      context
    );
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    monitoring.error(
      category,
      `Error in ${name}`,
      { 
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : String(error)
      },
      context
    );
    
    throw error;
  }
} 