import { MonitoringService } from '@/services/MonitoringService';

type ErrorHandlerOptions = {
  silent?: boolean;
  rethrow?: boolean;
  context?: Record<string, any>;
};

/**
 * Standardized error handling utility
 * @param error The error to handle
 * @param message Optional human-readable message
 * @param options Configuration options
 */
export function handleError(
  error: unknown,
  message?: string,
  options: ErrorHandlerOptions = {}
): void {
  const { silent = false, rethrow = false, context = {} } = options;
  
  // Convert unknown error to Error object
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  // Add custom message if provided
  if (message) {
    errorObj.message = `${message}: ${errorObj.message}`;
  }
  
  // Track error with monitoring
  try {
    MonitoringService.captureError(errorObj, context);
  } catch (monitoringError) {
    // If monitoring fails, log to console as fallback
    console.error('Error tracking failed:', monitoringError);
  }
  
  // Log to console in development unless silent
  if (!silent && process.env.NODE_ENV !== 'production') {
    console.error(errorObj);
    console.error('Context:', context);
  }
  
  // Rethrow if requested
  if (rethrow) {
    throw errorObj;
  }
}

/**
 * Async error handler for use with async/await
 * @param fn Async function to execute
 * @param errorMessage Error message prefix
 * @param options Error handling options
 * @returns The result of the async function or undefined on error
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
  options: ErrorHandlerOptions = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorMessage, options);
    if (options.rethrow) throw error;
    return undefined;
  }
} 