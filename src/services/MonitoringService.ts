/**
 * MonitoringService.ts
 * 
 * Provides comprehensive monitoring and analytics for the LUSH MILK application:
 * - Performance monitoring
 * - Error tracking
 * - User behavior analytics
 * - Resource usage tracking
 * - Database query performance
 * - API request monitoring
 */

// Configuration
const MONITORING_CONFIG = {
  ERROR_SAMPLE_RATE: 1.0, // 100% of errors
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10% of performance events
  LOG_ENDPOINT: process.env.NEXT_PUBLIC_MONITORING_ENDPOINT || '/api/monitoring',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  BATCH_SIZE: 10, // Number of events to batch before sending
  FLUSH_INTERVAL: 10000, // Flush events every 10 seconds
};

// Event types
type EventType = 'error' | 'performance' | 'user' | 'resource' | 'database' | 'api' | 'update';

// Base event interface
interface MonitoringEvent {
  type: EventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  environment: string;
  appVersion: string;
}

// Error event
interface ErrorEvent extends MonitoringEvent {
  type: 'error';
  message: string;
  stack?: string;
  componentName?: string;
  context?: Record<string, any>;
}

// Performance event
interface PerformanceEvent extends MonitoringEvent {
  type: 'performance';
  name: string;
  duration: number;
  startTime: number;
  category: 'navigation' | 'resource' | 'component' | 'custom';
  attributes?: Record<string, any>;
}

// User event
interface UserEvent extends MonitoringEvent {
  type: 'user';
  action: string;
  path: string;
  properties?: Record<string, any>;
}

// Database event
interface DatabaseEvent extends MonitoringEvent {
  type: 'database';
  operation: 'query' | 'insert' | 'update' | 'delete';
  table: string;
  duration: number;
  success: boolean;
  cached?: boolean;
}

// API event
interface APIEvent extends MonitoringEvent {
  type: 'api';
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  success: boolean;
}

// Update event
interface UpdateEvent extends MonitoringEvent {
  type: 'update';
  currentVersion: string;
  latestVersion: string;
  updateAction: 'check' | 'notification_shown' | 'update_clicked' | 'dismissed' | 'forced';
  platform: 'android' | 'web';
  details?: Record<string, any>;
}

/**
 * Session Manager for tracking user sessions
 */
class SessionManager {
  private static sessionId: string | null = null;
  private static userId: string | null = null;
  
  /**
   * Initialize a new session
   */
  static init(): string {
    // Generate random session ID if not exists
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
      this.saveSession();
    }
    
    return this.sessionId;
  }
  
  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });
  }
  
  /**
   * Save session to storage
   */
  private static saveSession(): void {
    try {
      localStorage.setItem('monitoring_session_id', this.sessionId!);
    } catch (e) {
      // Fallback to memory-only if localStorage not available
    }
  }
  
  /**
   * Get current session ID
   */
  static getSessionId(): string {
    if (!this.sessionId) {
      // Try to restore from storage
      try {
        const savedId = localStorage.getItem('monitoring_session_id');
        if (savedId) {
          this.sessionId = savedId;
        } else {
          this.init();
        }
      } catch (e) {
        this.init();
      }
    }
    
    return this.sessionId!;
  }
  
  /**
   * Set the user ID for the session
   */
  static setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /**
   * Get the user ID if available
   */
  static getUserId(): string | null {
    return this.userId;
  }
}

/**
 * Event Buffer manages batching and sending of events
 */
class EventBuffer {
  private static buffer: MonitoringEvent[] = [];
  private static flushTimer: number | null = null;
  
  /**
   * Add event to buffer
   */
  static addEvent(event: MonitoringEvent): void {
    this.buffer.push(event);
    
    // Start flush timer if not already running
    if (!this.flushTimer && typeof window !== 'undefined') {
      this.flushTimer = window.setTimeout(() => this.flush(), MONITORING_CONFIG.FLUSH_INTERVAL);
    }
    
    // Flush immediately if buffer reaches batch size
    if (this.buffer.length >= MONITORING_CONFIG.BATCH_SIZE) {
      this.flush();
    }
  }
  
  /**
   * Flush buffer and send events to server
   */
  static async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    // Clear timer
    if (this.flushTimer && typeof window !== 'undefined') {
      window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Clone events to send
    const eventsToSend = [...this.buffer];
    this.buffer = [];
    
    try {
      // Send events to server
      await fetch(MONITORING_CONFIG.LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true,
      });
    } catch (error) {
      // If sending fails, log to console in development
      if (MONITORING_CONFIG.ENVIRONMENT === 'development') {
        console.error('Failed to send monitoring events:', error);
        console.log('Events:', eventsToSend);
      }
      
      // Re-add events to buffer if in important categories
      const criticalEvents = eventsToSend.filter(e => 
        e.type === 'error' || 
        (e.type === 'performance' && (e as PerformanceEvent).duration > 1000)
      );
      
      if (criticalEvents.length > 0) {
        this.buffer.push(...criticalEvents);
      }
    }
  }
  
  /**
   * Ensure events are sent when the page is closed
   */
  static setupBeforeUnload(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }
}

/**
 * Performance Monitoring Service
 */
export class PerformanceMonitoring {
  private static marks: Record<string, number> = {};
  
  /**
   * Start timing an operation
   */
  static startMeasure(name: string): void {
    this.marks[name] = performance.now();
  }
  
  /**
   * End timing and record the performance
   */
  static endMeasure(name: string, category: 'navigation' | 'resource' | 'component' | 'custom' = 'custom', attributes?: Record<string, any>): void {
    const startTime = this.marks[name];
    if (!startTime) {
      console.warn(`No start time found for measure: ${name}`);
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Sample performance events based on configuration
    if (Math.random() < MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) {
      const event: PerformanceEvent = {
        type: 'performance',
        timestamp: Date.now(),
        sessionId: SessionManager.getSessionId(),
        userId: SessionManager.getUserId() || undefined,
        environment: MONITORING_CONFIG.ENVIRONMENT,
        appVersion: MONITORING_CONFIG.APP_VERSION,
        name,
        duration,
        startTime,
        category,
        attributes
      };
      
      EventBuffer.addEvent(event);
    }
    
    // Clean up the mark
    delete this.marks[name];
  }
  
  /**
   * Create performance measure decorator for class methods
   */
  static measure(category: 'component' | 'custom' = 'custom') {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args: any[]) {
        const measureName = `${target.constructor.name}.${propertyKey}`;
        PerformanceMonitoring.startMeasure(measureName);
        
        try {
          const result = originalMethod.apply(this, args);
          
          // Handle promises
          if (result instanceof Promise) {
            return result.finally(() => {
              PerformanceMonitoring.endMeasure(measureName, category, { 
                className: target.constructor.name,
                methodName: propertyKey
              });
            });
          }
          
          PerformanceMonitoring.endMeasure(measureName, category, { 
            className: target.constructor.name,
            methodName: propertyKey
          });
          
          return result;
        } catch (error) {
          PerformanceMonitoring.endMeasure(measureName, category, { 
            className: target.constructor.name,
            methodName: propertyKey,
            error: true
          });
          
          throw error;
        }
      };
      
      return descriptor;
    };
  }
  
  /**
   * Track web vitals metrics
   */
  static setupWebVitalsTracking(): void {
    if (typeof window !== 'undefined') {
      // Import web vitals lazily when needed
      import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP, getTTFB }) => {
        getCLS(metric => this.reportWebVital('CLS', metric.value));
        getFID(metric => this.reportWebVital('FID', metric.value));
        getLCP(metric => this.reportWebVital('LCP', metric.value));
        getFCP(metric => this.reportWebVital('FCP', metric.value));
        getTTFB(metric => this.reportWebVital('TTFB', metric.value));
      }).catch(err => {
        console.error('Failed to load web-vitals:', err);
      });
    }
  }
  
  /**
   * Report web vital metrics
   */
  private static reportWebVital(name: string, value: number): void {
    const event: PerformanceEvent = {
      type: 'performance',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      name: `web-vital-${name}`,
      duration: value,
      startTime: performance.now() - value,
      category: 'navigation',
      attributes: { metricName: name, metricValue: value }
    };
    
    EventBuffer.addEvent(event);
  }
}

/**
 * Error Tracking Service
 */
export class ErrorTracking {
  private static isInitialized = false;
  
  /**
   * Initialize global error tracking
   */
  static init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        lineNumber: event.lineno,
        columnNumber: event.colno,
        fileName: event.filename
      });
      
      // Don't prevent default - let the browser handle the error too
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      let error: Error;
      
      if (event.reason instanceof Error) {
        error = event.reason;
      } else {
        error = new Error(String(event.reason) || 'Unhandled promise rejection');
      }
      
      this.captureError(error, { unhandledRejection: true });
    });
    
    this.isInitialized = true;
  }
  
  /**
   * Capture and report an error
   */
  static captureError(error: Error, context: Record<string, any> = {}): void {
    // Always capture errors (no sampling)
    const event: ErrorEvent = {
      type: 'error',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      message: error.message,
      stack: error.stack,
      context
    };
    
    EventBuffer.addEvent(event);
    
    // Log to console in development
    if (MONITORING_CONFIG.ENVIRONMENT === 'development') {
      console.error('Error captured:', error, context);
    }
  }
  
  /**
   * Create higher-order component for React error boundary
   */
  static withErrorBoundary<P>(Component: React.ComponentType<P>, componentName: string) {
    return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
      constructor(props: P) {
        super(props);
        this.state = { hasError: false };
      }
      
      static getDerivedStateFromError(_: Error) {
        return { hasError: true };
      }
      
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        ErrorTracking.captureError(error, {
          componentName,
          componentStack: errorInfo.componentStack,
          props: JSON.stringify(this.props)
        });
      }
      
      render() {
        if (this.state.hasError) {
          // You can render a fallback UI here
          return <div>Something went wrong. Please try again later.</div>;
        }
        
        return <Component {...this.props} />;
      }
    };
  }
}

/**
 * User Analytics Service
 */
export class UserAnalytics {
  /**
   * Track a user action
   */
  static trackAction(action: string, properties: Record<string, any> = {}): void {
    const event: UserEvent = {
      type: 'user',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      action,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      properties
    };
    
    EventBuffer.addEvent(event);
  }
  
  /**
   * Track page view
   */
  static trackPageView(path?: string): void {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    this.trackAction('page_view', {
      path: currentPath,
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    });
  }
  
  /**
   * Set up automatic page view tracking for SPA
   */
  static setupPageViewTracking(): void {
    if (typeof window !== 'undefined') {
      // Track initial page load
      this.trackPageView();
      
      // Set up history change tracking
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(state, title, url) {
        originalPushState.call(this, state, title, url);
        UserAnalytics.trackPageView(url?.toString());
      };
      
      history.replaceState = function(state, title, url) {
        originalReplaceState.call(this, state, title, url);
        UserAnalytics.trackPageView(url?.toString());
      };
      
      // Track on navigation
      window.addEventListener('popstate', () => {
        UserAnalytics.trackPageView();
      });
    }
  }
}

/**
 * Database Monitoring Service
 */
export class DatabaseMonitoring {
  /**
   * Track a database operation
   */
  static trackOperation(operation: 'query' | 'insert' | 'update' | 'delete', table: string, duration: number, success: boolean, cached: boolean = false): void {
    const event: DatabaseEvent = {
      type: 'database',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      operation,
      table,
      duration,
      success,
      cached
    };
    
    EventBuffer.addEvent(event);
    
    // Log slow queries in development
    if (MONITORING_CONFIG.ENVIRONMENT === 'development' && duration > 500) {
      console.warn(`Slow ${operation} on ${table}: ${duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Create a wrapped function to monitor database operation
   */
  static wrapOperation<T>(
    operation: 'query' | 'insert' | 'update' | 'delete',
    table: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let success = false;
    
    return fn()
      .then(result => {
        success = true;
        return result;
      })
      .finally(() => {
        const duration = performance.now() - startTime;
        this.trackOperation(operation, table, duration, success);
      });
  }
}

/**
 * API Monitoring Service
 */
export class APIMonitoring {
  /**
   * Track an API request
   */
  static trackRequest(endpoint: string, method: string, statusCode: number, duration: number, success: boolean): void {
    const event: APIEvent = {
      type: 'api',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      endpoint,
      method,
      statusCode,
      duration,
      success
    };
    
    EventBuffer.addEvent(event);
    
    // Log slow API calls in development
    if (MONITORING_CONFIG.ENVIRONMENT === 'development' && duration > 1000) {
      console.warn(`Slow API call to ${method} ${endpoint}: ${duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Create a wrapped fetch function with monitoring
   */
  static monitoredFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const startTime = performance.now();
    const method = init?.method || 'GET';
    const endpoint = typeof input === 'string' ? input : input.toString();
    
    return fetch(input, init)
      .then(response => {
        const duration = performance.now() - startTime;
        this.trackRequest(
          endpoint,
          method,
          response.status,
          duration,
          response.ok
        );
        return response;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        this.trackRequest(
          endpoint,
          method,
          0, // Unknown status code
          duration,
          false
        );
        throw error;
      });
  }
  
  /**
   * Override the global fetch to add monitoring
   */
  static monkeyPatchFetch(): void {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      window.fetch = (input, init) => {
        return APIMonitoring.monitoredFetch(input, init);
      };
    }
  }
}

/**
 * Update Tracking Service
 */
export class UpdateTracking {
  /**
   * Track update-related events
   */
  static trackUpdateEvent(
    updateAction: 'check' | 'notification_shown' | 'update_clicked' | 'dismissed' | 'forced',
    currentVersion: string,
    latestVersion: string,
    platform: 'android' | 'web' = 'android',
    details?: Record<string, any>
  ): void {
    const event: UpdateEvent = {
      type: 'update',
      timestamp: Date.now(),
      sessionId: SessionManager.getSessionId(),
      userId: SessionManager.getUserId() || undefined,
      environment: MONITORING_CONFIG.ENVIRONMENT,
      appVersion: MONITORING_CONFIG.APP_VERSION,
      currentVersion,
      latestVersion,
      updateAction,
      platform,
      details
    };
    
    EventBuffer.addEvent(event);
  }
}

/**
 * Main Monitoring Service
 */
export class MonitoringService {
  private static isInitialized = false;
  
  /**
   * Initialize all monitoring services
   */
  static init(userId?: string): void {
    if (this.isInitialized) return;
    
    // Initialize session
    SessionManager.init();
    
    // Set user ID if provided
    if (userId) {
      SessionManager.setUserId(userId);
    }
    
    // Set up event buffer
    EventBuffer.setupBeforeUnload();
    
    // Initialize error tracking
    ErrorTracking.init();
    
    // Set up performance monitoring
    PerformanceMonitoring.setupWebVitalsTracking();
    
    // Set up user analytics
    UserAnalytics.setupPageViewTracking();
    
    // Override fetch for API monitoring
    APIMonitoring.monkeyPatchFetch();
    
    this.isInitialized = true;
    
    // Log initialization
    if (MONITORING_CONFIG.ENVIRONMENT === 'development') {
      console.log('Monitoring services initialized');
    }
  }
  
  /**
   * Set the user ID for the current session
   */
  static setUser(userId: string): void {
    SessionManager.setUserId(userId);
  }
  
  /**
   * Track performance of an operation
   */
  static trackPerformance(name: string, fn: () => any, category: 'navigation' | 'resource' | 'component' | 'custom' = 'custom'): any {
    PerformanceMonitoring.startMeasure(name);
    
    try {
      const result = fn();
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          PerformanceMonitoring.endMeasure(name, category);
        });
      }
      
      PerformanceMonitoring.endMeasure(name, category);
      return result;
    } catch (error) {
      PerformanceMonitoring.endMeasure(name, category);
      throw error;
    }
  }
  
  /**
   * Capture an error
   */
  static captureError(error: Error, context: Record<string, any> = {}): void {
    ErrorTracking.captureError(error, context);
  }
  
  /**
   * Track a user action
   */
  static trackAction(action: string, properties: Record<string, any> = {}): void {
    UserAnalytics.trackAction(action, properties);
  }
  
  /**
   * Track a page view
   */
  static trackPageView(path?: string): void {
    UserAnalytics.trackPageView(path);
  }
  
  /**
   * Monitor a database operation
   */
  static async monitorDatabase<T>(
    operation: 'query' | 'insert' | 'update' | 'delete',
    table: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return DatabaseMonitoring.wrapOperation(operation, table, fn);
  }
  
  /**
   * Monitor an API request
   */
  static monitoredFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return APIMonitoring.monitoredFetch(input, init);
  }
  
  /**
   * Track app update event
   */
  static trackUpdateEvent(
    updateAction: 'check' | 'notification_shown' | 'update_clicked' | 'dismissed' | 'forced',
    currentVersion: string,
    latestVersion: string,
    platform: 'android' | 'web' = 'android',
    details?: Record<string, any>
  ): void {
    UpdateTracking.trackUpdateEvent(updateAction, currentVersion, latestVersion, platform, details);
  }
}

// Export utility functions for direct use
export const monitoring = {
  init: MonitoringService.init,
  setUser: MonitoringService.setUser,
  trackPerformance: MonitoringService.trackPerformance,
  captureError: MonitoringService.captureError,
  trackAction: MonitoringService.trackAction,
  trackPageView: MonitoringService.trackPageView,
  monitorDatabase: MonitoringService.monitorDatabase,
  fetch: MonitoringService.monitoredFetch,
  trackUpdateEvent: MonitoringService.trackUpdateEvent,
};

export default MonitoringService; 