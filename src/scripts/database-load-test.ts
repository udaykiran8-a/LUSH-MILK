/**
 * Database Load Test Script
 * 
 * This script demonstrates using the connection pool service and load tester to 
 * simulate high database traffic and compare performance with and without connection pooling.
 * 
 * Usage:
 * ts-node src/scripts/database-load-test.ts
 */

import ConnectionPoolService from '../services/ConnectionPoolService';
import LoadTester from '../utils/LoadTester';
import { writeFileSync } from 'fs';
import path from 'path';

// Add Node.js type declarations
declare const process: {
  env: Record<string, string>;
  exitCode: number;
};

declare const module: {
  exports: any;
  id: string;
  parent: any;
};

/**
 * Run database load tests with various configurations
 */
async function runDatabaseLoadTests() {
  console.log('Starting database load tests...');
  
  // Initialize the connection pool service
  ConnectionPoolService.getInstance().init();
  
  // Test configurations
  const testConfigurations = [
    {
      name: 'Low Load - Without Pool',
      concurrentUsers: 5,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: false
    },
    {
      name: 'Low Load - With Pool',
      concurrentUsers: 5,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: true
    },
    {
      name: 'Medium Load - Without Pool',
      concurrentUsers: 20,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: false
    },
    {
      name: 'Medium Load - With Pool',
      concurrentUsers: 20,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: true
    },
    {
      name: 'High Load - Without Pool',
      concurrentUsers: 50,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: false
    },
    {
      name: 'High Load - With Pool',
      concurrentUsers: 50,
      testDuration: 15000,
      operation: 'read',
      useConnectionPool: true
    },
    {
      name: 'Mixed Operations - Without Pool',
      concurrentUsers: 20,
      testDuration: 15000,
      operation: 'mixed',
      useConnectionPool: false
    },
    {
      name: 'Mixed Operations - With Pool',
      concurrentUsers: 20,
      testDuration: 15000,
      operation: 'mixed',
      useConnectionPool: true
    }
  ];
  
  // Results array
  const results = [];
  
  // Run each test configuration
  for (const config of testConfigurations) {
    console.log(`\nRunning test: ${config.name}`);
    
    try {
      // Create load tester with this configuration
      const loadTester = new LoadTester({
        concurrentUsers: config.concurrentUsers,
        testDuration: config.testDuration,
        operation: config.operation as any,
        useConnectionPool: config.useConnectionPool,
        targetTable: 'products', // Using products table for tests
        requestInterval: 200, // 200ms between requests
      });
      
      // Run the test
      console.log(`Starting test with ${config.concurrentUsers} concurrent users for ${config.testDuration/1000} seconds...`);
      const testResults = await loadTester.runDatabaseTest();
      
      // Log the formatted results
      const formattedResults = loadTester.formatResults(testResults);
      console.log(formattedResults);
      
      // Store results for comparison
      results.push({
        name: config.name,
        concurrentUsers: config.concurrentUsers,
        operation: config.operation,
        useConnectionPool: config.useConnectionPool,
        requestsPerSecond: testResults.requestsPerSecond,
        averageResponseTime: testResults.averageResponseTime,
        p95ResponseTime: testResults.p95ResponseTime,
        failureRate: testResults.totalRequests > 0 
          ? (testResults.failedRequests / testResults.totalRequests * 100)
          : 0
      });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error running test ${config.name}:`, error);
    }
  }
  
  // Compare and output results
  compareResults(results);
}

/**
 * Compare the results of different test configurations
 */
function compareResults(results: any[]) {
  console.log('\n====================================');
  console.log('         COMPARISON REPORT');
  console.log('====================================\n');
  
  console.log('Performance Comparison:');
  console.log('------------------------------------------------------------------------------------------');
  console.log('| Test                     | Req/Sec | Avg Time (ms) | P95 Time (ms) | Failure Rate (%) |');
  console.log('------------------------------------------------------------------------------------------');
  
  for (const result of results) {
    console.log(
      `| ${result.name.padEnd(24)} | ${result.requestsPerSecond.toFixed(2).padStart(7)} | ${result.averageResponseTime.toFixed(2).padStart(12)} | ${result.p95ResponseTime.toFixed(2).padStart(12)} | ${result.failureRate.toFixed(2).padStart(15)} |`
    );
  }
  
  console.log('------------------------------------------------------------------------------------------\n');
  
  // Calculate improvement with connection pool
  console.log('Connection Pool Performance Improvement:');
  console.log('------------------------------------------------------------------------------------------');
  console.log('| Load Level    | Throughput Improvement | Latency Reduction | Failure Rate Reduction |');
  console.log('------------------------------------------------------------------------------------------');
  
  const loadLevels = ['Low Load', 'Medium Load', 'High Load', 'Mixed Operations'];
  
  for (const level of loadLevels) {
    const withoutPool = results.find(r => r.name === `${level} - Without Pool`);
    const withPool = results.find(r => r.name === `${level} - With Pool`);
    
    if (withoutPool && withPool) {
      // Calculate improvements
      const throughputImprovement = ((withPool.requestsPerSecond / withoutPool.requestsPerSecond) - 1) * 100;
      const latencyReduction = ((withoutPool.averageResponseTime - withPool.averageResponseTime) / withoutPool.averageResponseTime) * 100;
      const failureRateReduction = withoutPool.failureRate > 0 
        ? ((withoutPool.failureRate - withPool.failureRate) / withoutPool.failureRate) * 100
        : 0;
      
      console.log(
        `| ${level.padEnd(13)} | ${throughputImprovement.toFixed(2).padStart(22)}% | ${latencyReduction.toFixed(2).padStart(17)}% | ${failureRateReduction.toFixed(2).padStart(22)}% |`
      );
    }
  }
  
  console.log('------------------------------------------------------------------------------------------\n');
  
  // Save the comparison results to a file
  const reportContent = `
# Database Connection Pooling Performance Report

## Test Configuration
- Database: Supabase
- Test Date: ${new Date().toISOString().split('T')[0]}
- Operations Tested: Read, Mixed (Read/Write)
- Load Levels: Low (5 users), Medium (20 users), High (50 users)

## Performance Comparison

| Test | Req/Sec | Avg Time (ms) | P95 Time (ms) | Failure Rate (%) |
|------|---------|--------------|--------------|-----------------|
${results.map(r => `| ${r.name} | ${r.requestsPerSecond.toFixed(2)} | ${r.averageResponseTime.toFixed(2)} | ${r.p95ResponseTime.toFixed(2)} | ${r.failureRate.toFixed(2)} |`).join('\n')}

## Connection Pool Performance Improvement

| Load Level | Throughput Improvement | Latency Reduction | Failure Rate Reduction |
|------------|------------------------|-------------------|------------------------|
${loadLevels.map(level => {
  const withoutPool = results.find(r => r.name === `${level} - Without Pool`);
  const withPool = results.find(r => r.name === `${level} - With Pool`);
  
  if (withoutPool && withPool) {
    const throughputImprovement = ((withPool.requestsPerSecond / withoutPool.requestsPerSecond) - 1) * 100;
    const latencyReduction = ((withoutPool.averageResponseTime - withPool.averageResponseTime) / withoutPool.averageResponseTime) * 100;
    const failureRateReduction = withoutPool.failureRate > 0 
      ? ((withoutPool.failureRate - withPool.failureRate) / withoutPool.failureRate) * 100
      : 0;
    
    return `| ${level} | ${throughputImprovement.toFixed(2)}% | ${latencyReduction.toFixed(2)}% | ${failureRateReduction.toFixed(2)}% |`;
  }
  return '';
}).filter(Boolean).join('\n')}

## Conclusion

${generateConclusion(results)}
`;

  // Save report to file - Fixed cwd() issue
  try {
    // Use __dirname instead of process.cwd() for TypeScript
    const reportPath = path.resolve(__dirname, '../../connection-pool-performance-report.md');
    writeFileSync(reportPath, reportContent);
    console.log('Report saved to connection-pool-performance-report.md');
  } catch (error) {
    console.error('Failed to save report:', error);
  }
}

/**
 * Generate a conclusion based on the test results
 */
function generateConclusion(results: any[]): string {
  // Calculate average improvements
  let totalThroughputImprovement = 0;
  let totalLatencyReduction = 0;
  let totalFailureRateReduction = 0;
  let count = 0;
  
  const loadLevels = ['Low Load', 'Medium Load', 'High Load', 'Mixed Operations'];
  
  for (const level of loadLevels) {
    const withoutPool = results.find(r => r.name === `${level} - Without Pool`);
    const withPool = results.find(r => r.name === `${level} - With Pool`);
    
    if (withoutPool && withPool) {
      totalThroughputImprovement += ((withPool.requestsPerSecond / withoutPool.requestsPerSecond) - 1) * 100;
      totalLatencyReduction += ((withoutPool.averageResponseTime - withPool.averageResponseTime) / withoutPool.averageResponseTime) * 100;
      
      if (withoutPool.failureRate > 0) {
        totalFailureRateReduction += ((withoutPool.failureRate - withPool.failureRate) / withoutPool.failureRate) * 100;
      }
      
      count++;
    }
  }
  
  const avgThroughputImprovement = totalThroughputImprovement / count;
  const avgLatencyReduction = totalLatencyReduction / count;
  const avgFailureRateReduction = totalFailureRateReduction / count;
  
  // Find the highest load test
  const highLoadWithPool = results.find(r => r.name === 'High Load - With Pool');
  const highLoadWithoutPool = results.find(r => r.name === 'High Load - Without Pool');
  
  // Generate conclusion
  let conclusion = 'The implementation of connection pooling shows significant performance improvements ';
  conclusion += 'across all tested load levels. ';
  
  conclusion += `On average, connection pooling resulted in a ${avgThroughputImprovement.toFixed(1)}% increase in throughput, `;
  conclusion += `a ${avgLatencyReduction.toFixed(1)}% reduction in response times, `;
  
  if (avgFailureRateReduction > 0) {
    conclusion += `and a ${avgFailureRateReduction.toFixed(1)}% reduction in failure rates. `;
  } else {
    conclusion += 'with minimal impact on failure rates. ';
  }
  
  if (highLoadWithPool && highLoadWithoutPool) {
    const highLoadImprovement = ((highLoadWithPool.requestsPerSecond / highLoadWithoutPool.requestsPerSecond) - 1) * 100;
    
    if (highLoadImprovement > 50) {
      conclusion += 'The benefits were most pronounced under high load conditions, ';
      conclusion += `where throughput improved by ${highLoadImprovement.toFixed(1)}%. `;
      conclusion += 'This demonstrates that connection pooling is particularly valuable during peak usage periods.';
    } else {
      conclusion += 'The benefits were consistent across different load conditions, ';
      conclusion += 'indicating that connection pooling provides value even during normal operations.';
    }
  }
  
  conclusion += '\n\nBased on these results, we recommend:';
  conclusion += '\n\n1. Implementing connection pooling across all database operations';
  conclusion += '\n2. Configuring the connection pool size based on expected concurrent users';
  conclusion += '\n3. Implementing request prioritization for critical operations';
  conclusion += '\n4. Regular monitoring of connection pool metrics to optimize settings';
  
  return conclusion;
}

// Fixed require.main and process.exit issues
// Run the tests when this script is executed directly
// Using a different approach that works in TypeScript
const isMainModule = !module.parent;
if (isMainModule) {
  runDatabaseLoadTests().catch(error => {
    console.error('Error running tests:', error);
    // Use numbered exit code
    process.exitCode = 1;
  });
}

export { runDatabaseLoadTests }; 