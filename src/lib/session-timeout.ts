/**
 * Session Timeout Utility for LUSH MILK Application
 * 
 * This utility manages user session timeouts due to inactivity.
 * It can be used to automatically log out users after a period of inactivity.
 */

// Default timeout in milliseconds (30 minutes)
const DEFAULT_TIMEOUT = 30 * 60 * 1000;

// Token for localStorage
const LAST_ACTIVITY_KEY = 'lush_milk_last_activity';
const SESSION_STARTED_KEY = 'lush_milk_session_started';

/**
 * Configuration options for the session timeout
 */
export interface SessionTimeoutConfig {
  // Timeout duration in milliseconds
  timeoutMs: number;
  
  // Callback function to execute when the session times out
  onTimeout: () => void;
  
  // Whether to show a warning before timing out
  showWarning: boolean;
  
  // How many milliseconds before timeout to show the warning
  warningMs: number;
  
  // Callback function to execute when the warning is displayed
  onWarning?: () => void;
}

/**
 * Class to manage session timeout
 */
export class SessionTimeout {
  private config: SessionTimeoutConfig;
  private timeoutId: number | null = null;
  private warningId: number | null = null;
  private events: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  private boundActivityHandler: EventListener;
  
  constructor(config: Partial<SessionTimeoutConfig> = {}) {
    // Merge default config with user-provided config
    this.config = {
      timeoutMs: config.timeoutMs || DEFAULT_TIMEOUT,
      onTimeout: config.onTimeout || this.defaultLogout,
      showWarning: config.showWarning !== undefined ? config.showWarning : true,
      warningMs: config.warningMs || 60000, // 1 minute warning by default
      onWarning: config.onWarning,
    };
    
    this.boundActivityHandler = this.handleUserActivity.bind(this);
  }
  
  /**
   * Start monitoring for user inactivity
   */
  public start(): void {
    this.setLastActivity();
    this.setSessionStartTime();
    this.registerActivityEvents();
    this.resetTimeout();
  }
  
  /**
   * Stop monitoring for user inactivity
   */
  public stop(): void {
    this.clearTimeouts();
    this.unregisterActivityEvents();
  }
  
  /**
   * Reset the session manually (e.g., after a successful API call or page navigation)
   */
  public resetSession(): void {
    this.setLastActivity();
    this.resetTimeout();
  }
  
  /**
   * Return how much time is left in the session
   */
  public getTimeRemaining(): number {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return this.config.timeoutMs;
    
    const now = Date.now();
    const elapsed = now - lastActivity;
    return Math.max(0, this.config.timeoutMs - elapsed);
  }
  
  /**
   * Return the total session duration so far
   */
  public getSessionDuration(): number {
    const startTime = this.getSessionStartTime();
    if (!startTime) return 0;
    
    return Date.now() - startTime;
  }
  
  /**
   * Register event listeners for user activity
   */
  private registerActivityEvents(): void {
    this.events.forEach(event => {
      window.addEventListener(event, this.boundActivityHandler, false);
    });
  }
  
  /**
   * Unregister event listeners for user activity
   */
  private unregisterActivityEvents(): void {
    this.events.forEach(event => {
      window.removeEventListener(event, this.boundActivityHandler, false);
    });
  }
  
  /**
   * Handle user activity events
   */
  private handleUserActivity(): void {
    this.setLastActivity();
    this.resetTimeout();
  }
  
  /**
   * Reset the timeout and warning timers
   */
  private resetTimeout(): void {
    this.clearTimeouts();
    
    if (this.config.showWarning) {
      const warningDelay = this.config.timeoutMs - this.config.warningMs;
      this.warningId = window.setTimeout(() => {
        if (this.config.onWarning) {
          this.config.onWarning();
        }
      }, warningDelay);
    }
    
    this.timeoutId = window.setTimeout(() => {
      this.stop();
      this.config.onTimeout();
    }, this.config.timeoutMs);
  }
  
  /**
   * Clear all timeouts
   */
  private clearTimeouts(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.warningId !== null) {
      window.clearTimeout(this.warningId);
      this.warningId = null;
    }
  }
  
  /**
   * Update the last activity timestamp
   */
  private setLastActivity(): void {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    } catch (e) {
      console.error('Failed to set last activity time:', e);
    }
  }
  
  /**
   * Get the last activity timestamp
   */
  private getLastActivity(): number | null {
    try {
      const value = localStorage.getItem(LAST_ACTIVITY_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (e) {
      console.error('Failed to get last activity time:', e);
      return null;
    }
  }
  
  /**
   * Set the session start time
   */
  private setSessionStartTime(): void {
    try {
      // Only set if not already set
      if (!localStorage.getItem(SESSION_STARTED_KEY)) {
        localStorage.setItem(SESSION_STARTED_KEY, Date.now().toString());
      }
    } catch (e) {
      console.error('Failed to set session start time:', e);
    }
  }
  
  /**
   * Get the session start time
   */
  private getSessionStartTime(): number | null {
    try {
      const value = localStorage.getItem(SESSION_STARTED_KEY);
      return value ? parseInt(value, 10) : null;
    } catch (e) {
      console.error('Failed to get session start time:', e);
      return null;
    }
  }
  
  /**
   * Default logout handler
   */
  private defaultLogout(): void {
    try {
      // Clear session data
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(SESSION_STARTED_KEY);
      
      // Redirect to login page
      window.location.href = '/auth/signin?reason=session_timeout';
    } catch (e) {
      console.error('Failed to execute default logout:', e);
    }
  }
}

/**
 * Create and configure a session timeout instance
 */
export function createSessionTimeout(config: Partial<SessionTimeoutConfig> = {}): SessionTimeout {
  return new SessionTimeout(config);
}

/**
 * Hook to use the session timeout in a React component (client-side only)
 */
export function useSessionTimeout(config: Partial<SessionTimeoutConfig> = {}): {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getTimeRemaining: () => number;
} {
  // This part will only be executed in the browser
  if (typeof window !== 'undefined') {
    const sessionTimeout = new SessionTimeout(config);
    
    return {
      start: () => sessionTimeout.start(),
      stop: () => sessionTimeout.stop(),
      reset: () => sessionTimeout.resetSession(),
      getTimeRemaining: () => sessionTimeout.getTimeRemaining(),
    };
  }
  
  // Server-side rendering fallback
  return {
    start: () => {},
    stop: () => {},
    reset: () => {},
    getTimeRemaining: () => 0,
  };
} 