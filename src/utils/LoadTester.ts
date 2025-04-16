/**
 * LoadTester.ts
 * 
 * Utility for load testing application components:
 * - Database connection stress testing
 * - API endpoints performance testing
 * - Concurrent request handling simulation
 * - Performance metrics collection and reporting
 */

import ConnectionPoolService, { RequestPriority } from '../services/ConnectionPoolService';
import { createClient } from '@supabase/supabase-js';

// Test configuration
interface LoadTestConfig {
  // Number of concurrent users to simulate
  concurrentUsers: number;
  // Duration of the test in milliseconds
  testDuration: number;
  // Time between requests for each simulated user (ms)
  requestInterval: number;
  // Maximum time a request can take before considered failed (ms)
  requestTimeout: number;
  // Ramp-up period to gradually increase load (ms)
  rampUpPeriod: number;
  // Random delay between requests (0-1 multiplier of requestInterval)
  randomDelayFactor: number;
  // Target endpoint for API tests
  targetEndpoint?: string;
  // Target database table for database tests
  targetTable?: string;
  // Operation to perform (read, write, mixed)
  operation: 'read' | 'write' | 'mixed';
  // Use connection pool for database tests
  useConnectionPool: boolean;
}

// Default configuration
const defaultConfig: LoadTestConfig = {
  concurrentUsers: 10,
  testDuration: 30000, // 30 seconds
  requestInterval: 1000, // 1 second
  requestTimeout: 5000, // 5 seconds
  rampUpPeriod: 5000, // 5 seconds
  randomDelayFactor: 0.2, // 20% random variation
  operation: 'read',
  useConnectionPool: true
};

// Test results
interface LoadTestResults {
  // Total requests sent
  totalRequests: number;
  // Successful requests
  successfulRequests: number;
  // Failed requests
  failedRequests: number;
  // Requests per second
  requestsPerSecond: number;
  // Average response time (ms)
  averageResponseTime: number;
  // Minimum response time (ms)
  minResponseTime: number;
  // Maximum response time (ms)
  maxResponseTime: number;
  // 95th percentile response time (ms)
  p95ResponseTime: number;
  // Errors encountered during testing
  errors: Array<{
    timestamp: number;
    message: string;
    code?: string;
  }>;
  // Time series data for graphing
  timeSeries: Array<{
    timestamp: number;
    activeUsers: number;
    requestsPerSecond: number;
    responseTime: number;
  }>;
}

/**
 * Utility for load testing application components
 */
export class LoadTester {
  private config: LoadTestConfig;
  private activeUsers: number = 0;
  private testStartTime: number = 0;
  private testEndTime: number = 0;
  private running: boolean = false;
  private responseTimes: number[] = [];
  private requestsCompleted: number = 0;
  private requestsFailed: number = 0;
  private errors: LoadTestResults['errors'] = [];
  private timeSeriesData: LoadTestResults['timeSeries'] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private abortController: AbortController | null = null;

  /**
   * Constructor
   * @param config Load test configuration
   */
  constructor(config: Partial<LoadTestConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Run API endpoint load test
   */
  public async runApiTest(): Promise<LoadTestResults> {
    if (!this.config.targetEndpoint) {
      throw new Error('Target endpoint must be specified for API tests');
    }

    this.initializeTest();
    this.abortController = new AbortController();

    // Create time series recording interval
    this.intervalId = setInterval(() => this.recordTimeSeriesPoint(), 1000);

    // Start simulated users
    const userPromises = [];
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      // Calculate delay for this user based on ramp-up period
      const userStartDelay = (i / this.config.concurrentUsers) * this.config.rampUpPeriod;
      userPromises.push(this.simulateApiUser(i, userStartDelay));
    }

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, this.config.testDuration));
    
    // Stop the test
    this.running = false;
    this.abortController.abort();
    if (this.intervalId) clearInterval(this.intervalId);
    this.testEndTime = Date.now();

    // Wait for all user promises to resolve
    await Promise.all(userPromises);

    // Calculate and return results
    return this.calculateResults();
  }

  /**
   * Run database load test
   */
  public async runDatabaseTest(): Promise<LoadTestResults> {
    if (!this.config.targetTable) {
      throw new Error('Target table must be specified for database tests');
    }

    this.initializeTest();
    this.abortController = new AbortController();

    // Initialize connection pool if used
    if (this.config.useConnectionPool) {
      ConnectionPoolService.getInstance().init();
    }

    // Create time series recording interval
    this.intervalId = setInterval(() => this.recordTimeSeriesPoint(), 1000);

    // Start simulated users
    const userPromises = [];
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      // Calculate delay for this user based on ramp-up period
      const userStartDelay = (i / this.config.concurrentUsers) * this.config.rampUpPeriod;
      userPromises.push(this.simulateDatabaseUser(i, userStartDelay));
    }

    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, this.config.testDuration));
    
    // Stop the test
    this.running = false;
    this.abortController.abort();
    if (this.intervalId) clearInterval(this.intervalId);
    this.testEndTime = Date.now();

    // Wait for all user promises to resolve
    await Promise.all(userPromises);

    // Calculate and return results
    return this.calculateResults();
  }

  /**
   * Initialize test data
   */
  private initializeTest(): void {
    this.testStartTime = Date.now();
    this.testEndTime = 0;
    this.running = true;
    this.activeUsers = 0;
    this.responseTimes = [];
    this.requestsCompleted = 0;
    this.requestsFailed = 0;
    this.errors = [];
    this.timeSeriesData = [];
  }

  /**
   * Simulate a single API user making requests
   */
  private async simulateApiUser(userId: number, startDelay: number): Promise<void> {
    // Wait for user's start delay
    await new Promise(resolve => setTimeout(resolve, startDelay));
    
    // Exit if test already stopped
    if (!this.running) return;

    this.activeUsers++;
    
    try {
      while (this.running) {
        await this.makeApiRequest(userId);
        
        // Calculate random delay for next request
        const baseDelay = this.config.requestInterval;
        const randomFactor = 1 + (Math.random() * this.config.randomDelayFactor * 2 - this.config.randomDelayFactor);
        const delay = baseDelay * randomFactor;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      this.activeUsers--;
    }
  }

  /**
   * Simulate a single database user making requests
   */
  private async simulateDatabaseUser(userId: number, startDelay: number): Promise<void> {
    // Wait for user's start delay
    await new Promise(resolve => setTimeout(resolve, startDelay));
    
    // Exit if test already stopped
    if (!this.running) return;

    this.activeUsers++;
    
    try {
      while (this.running) {
        await this.makeDatabaseRequest(userId);
        
        // Calculate random delay for next request
        const baseDelay = this.config.requestInterval;
        const randomFactor = 1 + (Math.random() * this.config.randomDelayFactor * 2 - this.config.randomDelayFactor);
        const delay = baseDelay * randomFactor;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      this.activeUsers--;
    }
  }

  /**
   * Make a single API request
   */
  private async makeApiRequest(userId: number): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Skip if test has been stopped
      if (!this.running || !this.abortController) return;
      
      // Make request with timeout
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout);
      });
      
      const fetchPromise = fetch(this.config.targetEndpoint!, {
        method: this.getOperationMethod(),
        headers: {
          'Content-Type': 'application/json',
        },
        body: this.config.operation !== 'read' ? JSON.stringify({
          testData: `loadtest-${userId}-${Date.now()}`,
          timestamp: Date.now()
        }) : undefined,
        signal: this.abortController.signal
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      // Record successful request
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.responseTimes.push(responseTime);
      this.requestsCompleted++;
      
    } catch (error: any) {
      // Record failed request
      this.requestsFailed++;
      
      // Only record error if not aborted
      if (error.name !== 'AbortError') {
        this.errors.push({
          timestamp: Date.now(),
          message: error.message || 'Unknown error',
          code: error.code
        });
      }
    }
  }

  /**
   * Make a single database request
   */
  private async makeDatabaseRequest(userId: number): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Skip if test has been stopped
      if (!this.running) return;
      
      if (this.config.useConnectionPool) {
        // Use connection pool
        await this.makeDatabaseRequestWithPool(userId);
      } else {
        // Use direct connection
        await this.makeDatabaseRequestDirect(userId);
      }
      
      // Record successful request
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.responseTimes.push(responseTime);
      this.requestsCompleted++;
      
    } catch (error: any) {
      // Record failed request
      this.requestsFailed++;
      
      this.errors.push({
        timestamp: Date.now(),
        message: error.message || 'Unknown error',
        code: error.code
      });
    }
  }

  /**
   * Make database request with connection pool
   */
  private async makeDatabaseRequestWithPool(userId: number): Promise<void> {
    const connectionPool = ConnectionPoolService.getInstance();
    
    // Choose appropriate priority based on user ID
    // This is just for demonstration - in reality priority would be based on the operation
    const priority = userId % 4 as RequestPriority;
    
    // Timeout for queued requests should be less than the overall request timeout
    const queueTimeout = Math.floor(this.config.requestTimeout * 0.8);
    
    await connectionPool.execute(async (client) => {
      if (this.config.operation === 'read' || 
          (this.config.operation === 'mixed' && Math.random() > 0.5)) {
        // Read operation
        const { data, error } = await client
          .from(this.config.targetTable!)
          .select('*')
          .limit(10);
          
        if (error) throw error;
        return data;
      } else {
        // Write operation
        const { data, error } = await client
          .from(this.config.targetTable!)
          .insert({
            test_data: `loadtest-${userId}-${Date.now()}`,
            timestamp: new Date().toISOString()
          });
          
        if (error) throw error;
        return data;
      }
    }, priority, queueTimeout);
  }

  /**
   * Make database request with direct connection
   */
  private async makeDatabaseRequestDirect(userId: number): Promise<void> {
    // Get credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not available');
    }
    
    // Create client directly
    const client = createClient(supabaseUrl, supabaseKey);
    
    if (this.config.operation === 'read' || 
        (this.config.operation === 'mixed' && Math.random() > 0.5)) {
      // Read operation
      const { data, error } = await client
        .from(this.config.targetTable!)
        .select('*')
        .limit(10);
        
      if (error) throw error;
      return;
    } else {
      // Write operation
      const { data, error } = await client
        .from(this.config.targetTable!)
        .insert({
          test_data: `loadtest-${userId}-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
        
      if (error) throw error;
      return;
    }
  }

  /**
   * Get HTTP method based on operation type
   */
  private getOperationMethod(): string {
    switch (this.config.operation) {
      case 'read':
        return 'GET';
      case 'write':
        return 'POST';
      case 'mixed':
        return Math.random() > 0.5 ? 'GET' : 'POST';
      default:
        return 'GET';
    }
  }

  /**
   * Record a point in time series data
   */
  private recordTimeSeriesPoint(): void {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.testStartTime;
    
    // Skip if test hasn't started yet
    if (elapsedTime <= 0) return;
    
    // Calculate current metrics
    const secondsElapsed = elapsedTime / 1000;
    const requestsPerSecond = this.requestsCompleted / secondsElapsed;
    
    // Calculate average response time of recent requests
    const recentResponseTimes = this.responseTimes.slice(-Math.min(100, this.responseTimes.length));
    const averageResponseTime = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((sum, time) => sum + time, 0) / recentResponseTimes.length
      : 0;
    
    // Add data point
    this.timeSeriesData.push({
      timestamp: currentTime,
      activeUsers: this.activeUsers,
      requestsPerSecond,
      responseTime: averageResponseTime
    });
  }

  /**
   * Calculate final test results
   */
  private calculateResults(): LoadTestResults {
    const totalRequests = this.requestsCompleted + this.requestsFailed;
    const testDuration = (this.testEndTime - this.testStartTime) / 1000; // in seconds
    const requestsPerSecond = totalRequests / testDuration;
    
    // Calculate response time statistics
    let minResponseTime = Infinity;
    let maxResponseTime = 0;
    let totalResponseTime = 0;
    
    for (const time of this.responseTimes) {
      minResponseTime = Math.min(minResponseTime, time);
      maxResponseTime = Math.max(maxResponseTime, time);
      totalResponseTime += time;
    }
    
    // If no successful requests, set min to 0
    if (minResponseTime === Infinity) minResponseTime = 0;
    
    const averageResponseTime = this.responseTimes.length > 0
      ? totalResponseTime / this.responseTimes.length
      : 0;
    
    // Calculate 95th percentile
    let p95ResponseTime = 0;
    if (this.responseTimes.length > 0) {
      const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
      const p95Index = Math.floor(sortedTimes.length * 0.95);
      p95ResponseTime = sortedTimes[p95Index] || sortedTimes[sortedTimes.length - 1];
    }
    
    return {
      totalRequests,
      successfulRequests: this.requestsCompleted,
      failedRequests: this.requestsFailed,
      requestsPerSecond,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      p95ResponseTime,
      errors: this.errors,
      timeSeries: this.timeSeriesData
    };
  }

  /**
   * Generate a formatted report of the test results
   */
  public formatResults(results: LoadTestResults): string {
    // Calculate failure rate percentage
    const failureRate = results.totalRequests > 0
      ? (results.failedRequests / results.totalRequests * 100).toFixed(2)
      : '0.00';
    
    // Format the results as a string
    let report = `
====================================
      LOAD TEST REPORT
====================================

Test Configuration:
  Concurrent Users: ${this.config.concurrentUsers}
  Test Duration: ${this.config.testDuration / 1000} seconds
  Request Interval: ${this.config.requestInterval} ms
  Operation: ${this.config.operation}
  ${this.config.targetEndpoint ? `API Endpoint: ${this.config.targetEndpoint}` : ''}
  ${this.config.targetTable ? `Database Table: ${this.config.targetTable}` : ''}
  ${this.config.useConnectionPool ? 'Using Connection Pool: Yes' : ''}

Performance Summary:
  Total Requests: ${results.totalRequests}
  Successful Requests: ${results.successfulRequests}
  Failed Requests: ${results.failedRequests} (${failureRate}%)
  Requests Per Second: ${results.requestsPerSecond.toFixed(2)}

Response Times:
  Average: ${results.averageResponseTime.toFixed(2)} ms
  Minimum: ${results.minResponseTime.toFixed(2)} ms
  Maximum: ${results.maxResponseTime.toFixed(2)} ms
  95th Percentile: ${results.p95ResponseTime.toFixed(2)} ms

`;

    // Add error summary if there were errors
    if (results.errors.length > 0) {
      report += `\nError Summary (showing first 10):`;
      
      // Group errors by message
      const errorGroups = new Map<string, number>();
      for (const error of results.errors) {
        const key = error.message;
        errorGroups.set(key, (errorGroups.get(key) || 0) + 1);
      }
      
      // Add top errors to report
      const sortedErrors = [...errorGroups.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      for (const [message, count] of sortedErrors) {
        report += `\n  "${message}" - ${count} occurrences`;
      }
    }

    report += '\n====================================\n';
    
    return report;
  }
}

// Default export
export default LoadTester; 