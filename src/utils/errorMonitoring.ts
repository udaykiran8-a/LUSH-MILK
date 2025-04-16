import { toast } from 'sonner';

interface ErrorDetails {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

// Simple in-memory error store (would be replaced with actual error monitoring service in production)
const errorStore: ErrorDetails[] = [];

// Get environment
const isDevelopment = import.meta.env.DEV;
const environment = isDevelopment ? 'development' : 'production';

/**
 * Log error to monitoring service
 * In a real implementation, this would send errors to a service like Sentry, LogRocket, etc.
 */
export function logError(error: Error | string, options: Partial<ErrorDetails> = {}): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  const errorDetails: ErrorDetails = {
    message: errorMessage,
    stack: errorStack,
    context: options.context || {},
    userId: options.userId,
    severity: options.severity || 'medium',
    tags: options.tags || [],
  };
  
  // Add environment info
  errorDetails.context = {
    ...errorDetails.context,
    environment,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
  
  // In development, log to console
  if (isDevelopment) {
    console.error('🚨 Error logged:', errorDetails);
  }
  
  // Store error (simulating sending to a monitoring service)
  errorStore.push(errorDetails);
  
  // In a real implementation, send to error monitoring service
  // Example: Sentry.captureException(error, { extra: errorDetails });
}

/**
 * Global error handler for caught exceptions
 */
export function handleError(error: unknown, options: Partial<ErrorDetails> = {}): void {
  // Convert to Error object if it's not already
  const errorObject = error instanceof Error ? error : new Error(String(error));
  
  // Log the error
  logError(errorObject, options);
  
  // Show user-friendly toast unless disabled
  if (options.context?.suppressToast !== true) {
    toast.error(
      options.context?.userMessage || 'Something went wrong',
      {
        description: isDevelopment ? errorObject.message : 'Please try again or contact support if the problem persists.',
        duration: 5000,
      }
    );
  }
}

/**
 * Initialize global error handling
 */
export function initErrorMonitoring(userId?: string): void {
  // Set up global unhandled error catching
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, {
      userId,
      context: {
        type: 'uncaught_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      severity: 'high',
    });
    
    // Don't show toast for script errors
    // This is to avoid spamming the user with error toasts for 3rd party script errors
    const isScriptError = event.filename && !event.filename.includes(window.location.origin);
    if (!isScriptError) {
      toast.error('An unexpected error occurred', {
        description: 'Please reload the page and try again.',
      });
    }
  });
  
  // Set up unhandled promise rejection catching
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    logError(error, {
      userId,
      context: {
        type: 'unhandled_promise_rejection',
      },
      severity: 'high',
    });
    
    toast.error('An unexpected error occurred', {
      description: 'Please reload the page and try again.',
    });
  });
  
  console.log('Error monitoring initialized');
}

/**
 * Get all logged errors (for debugging purposes)
 * This would be removed in a real production implementation
 */
export function getLoggedErrors(): ErrorDetails[] {
  return [...errorStore];
}

/**
 * Clear all logged errors (for debugging purposes)
 * This would be removed in a real production implementation
 */
export function clearLoggedErrors(): void {
  errorStore.length = 0;
}

/**
 * Check if a feature is allowed to fail silently
 * Used for non-critical features that shouldn't interrupt user experience when they fail
 */
export function isNonCriticalFeature(featureName: string): boolean {
  const nonCriticalFeatures = [
    'analytics',
    'recommendations',
    'feedback',
    'social-sharing',
    'notifications',
  ];
  
  return nonCriticalFeatures.includes(featureName);
} 