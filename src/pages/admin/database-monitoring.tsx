import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Flex, Text, Grid, Box, Select, Label, Heading, Badge, Spinner, TextInput } from '@/components/ui';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { optimizedDatabase } from '@/services/OptimizedDatabaseService';
import ConnectionPoolService, { RequestPriority } from '@/services/ConnectionPoolService';
import LoadTester from '@/utils/LoadTester';
import DataCachingService from '@/services/DataCachingService';
import { ChevronDown, ChevronUp, RefreshCw, AlertCircle, Check, Database, Activity, Loader } from 'lucide-react';

// Test configuration type
type TestConfig = {
  concurrentUsers: number;
  testDuration: number;
  operation: 'read' | 'write' | 'mixed';
  useConnectionPool: boolean;
};

// Result data type
type TestResult = {
  name: string;
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  failureRate: number;
  timestamp: number;
};

const DEFAULT_TEST_CONFIG: TestConfig = {
  concurrentUsers: 20,
  testDuration: 10000, // 10 seconds
  operation: 'read',
  useConnectionPool: true
};

/**
 * Database Monitoring Dashboard
 * Shows real-time metrics about connection pool performance and allows running load tests
 */
export default function DatabaseMonitoring() {
  const [poolStatus, setPoolStatus] = useState<any>(null);
  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'load-testing' | 'metrics'>('overview');
  const [testConfig, setTestConfig] = useState<TestConfig>(DEFAULT_TEST_CONFIG);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [lastTestOutput, setLastTestOutput] = useState('');
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chartUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize connection pool service
  useEffect(() => {
    const poolService = ConnectionPoolService.getInstance();
    poolService.init();
    
    // Set up periodic status refresh
    refreshTimerRef.current = setInterval(refreshStatus, 2000);
    
    // Initial status fetch
    refreshStatus();
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (chartUpdateInterval.current) {
        clearInterval(chartUpdateInterval.current);
      }
    };
  }, []);
  
  // Refresh connection pool and database metrics
  const refreshStatus = async () => {
    try {
      const poolService = ConnectionPoolService.getInstance();
      const status = poolService.getStatus();
      setPoolStatus(status);
      
      const metrics = optimizedDatabase.getMetrics();
      setDbMetrics(metrics);
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
  };
  
  // Run a load test with the current configuration
  const runLoadTest = async () => {
    setIsTestRunning(true);
    setTestProgress(0);
    setLastTestOutput('');
    
    try {
      // Create load tester with current configuration
      const loadTester = new LoadTester({
        concurrentUsers: testConfig.concurrentUsers,
        testDuration: testConfig.testDuration,
        operation: testConfig.operation,
        useConnectionPool: testConfig.useConnectionPool,
        targetTable: 'products',
        requestInterval: 200, // 200ms between requests
      });
      
      // Set up progress tracking
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          const newProgress = Math.min(prev + (100 / (testConfig.testDuration / 1000)), 99);
          return newProgress;
        });
      }, 1000);
      
      // Run the test
      const testResults = await loadTester.runDatabaseTest();
      
      // Clear progress interval
      clearInterval(progressInterval);
      setTestProgress(100);
      
      // Format and display results
      const formattedResults = loadTester.formatResults(testResults);
      setLastTestOutput(formattedResults);
      
      // Save result
      const newResult: TestResult = {
        name: `${testConfig.useConnectionPool ? 'Pooled' : 'Direct'} - ${testConfig.operation} - ${testConfig.concurrentUsers} users`,
        requestsPerSecond: testResults.requestsPerSecond,
        averageResponseTime: testResults.averageResponseTime,
        p95ResponseTime: testResults.p95ResponseTime,
        failureRate: testResults.totalRequests > 0 
          ? (testResults.failedRequests / testResults.totalRequests * 100)
          : 0,
        timestamp: Date.now()
      };
      
      setTestResults(prev => [...prev, newResult]);
      
      // Run comparison test automatically if this was the first test
      if (testResults.length === 0 && testConfig.useConnectionPool) {
        // Wait a moment for the system to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Run the same test without connection pooling
        setTestConfig(prev => ({ ...prev, useConnectionPool: false }));
        setTimeout(() => runLoadTest(), 500);
      }
      
    } catch (error) {
      console.error('Error running load test:', error);
      setLastTestOutput(`Error running test: ${error}`);
    } finally {
      setIsTestRunning(false);
    }
  };
  
  // Handle test configuration changes
  const handleConfigChange = (field: keyof TestConfig, value: any) => {
    setTestConfig(prev => ({ 
      ...prev, 
      [field]: field === 'concurrentUsers' || field === 'testDuration' 
        ? parseInt(value, 10) 
        : value 
    }));
  };
  
  // Clear test results
  const clearResults = () => {
    setTestResults([]);
    setLastTestOutput('');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-8">
        <Heading className="text-3xl font-bold mb-2">Database Performance Monitoring</Heading>
        <Text className="text-gray-500">
          Monitor connection pool status, run performance tests, and visualize database metrics
        </Text>
      </header>
      
      <div className="flex space-x-2 mb-6 border-b pb-2">
        <Button 
          variant={selectedTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={selectedTab === 'load-testing' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('load-testing')}
        >
          Load Testing
        </Button>
        <Button 
          variant={selectedTab === 'metrics' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('metrics')}
        >
          Detailed Metrics
        </Button>
      </div>
      
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <Grid columns={3} gap={4}>
            <Card className="p-4">
              <Flex direction="column" gap={2}>
                <Flex justify="between" align="center">
                  <Text weight="bold">Connection Pool Status</Text>
                  <Button variant="ghost" size="xs" onClick={refreshStatus}><RefreshCw size={16} /></Button>
                </Flex>
                {poolStatus ? (
                  <>
                    <Flex justify="between">
                      <Text>Available Connections:</Text>
                      <Badge variant="outline">{poolStatus.availableConnections}</Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Busy Connections:</Text>
                      <Badge variant="outline">{poolStatus.busyConnections}</Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Queued Requests:</Text>
                      <Badge variant={poolStatus.queueLength > 0 ? "warning" : "outline"}>
                        {poolStatus.queueLength}
                      </Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Peak Connections:</Text>
                      <Badge variant="outline">{poolStatus.stats.peakConcurrentConnections}</Badge>
                    </Flex>
                  </>
                ) : (
                  <Flex justify="center" className="py-4">
                    <Spinner />
                  </Flex>
                )}
              </Flex>
            </Card>
            
            <Card className="p-4">
              <Flex direction="column" gap={2}>
                <Flex justify="between" align="center">
                  <Text weight="bold">Database Operations</Text>
                </Flex>
                {dbMetrics ? (
                  <>
                    <Flex justify="between">
                      <Text>Total Operations:</Text>
                      <Badge variant="outline">{dbMetrics.totalOperations}</Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Successful:</Text>
                      <Badge variant="success">{dbMetrics.successfulOperations}</Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Failed:</Text>
                      <Badge variant={dbMetrics.failedOperations > 0 ? "destructive" : "outline"}>
                        {dbMetrics.failedOperations}
                      </Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Circuit Breaker:</Text>
                      <Badge variant={
                        dbMetrics.circuitState === 0 ? "success" : 
                        dbMetrics.circuitState === 1 ? "destructive" : "warning"
                      }>
                        {dbMetrics.circuitState === 0 ? "Closed" : 
                         dbMetrics.circuitState === 1 ? "Open" : "Half-Open"}
                      </Badge>
                    </Flex>
                  </>
                ) : (
                  <Flex justify="center" className="py-4">
                    <Spinner />
                  </Flex>
                )}
              </Flex>
            </Card>
            
            <Card className="p-4">
              <Flex direction="column" gap={2}>
                <Flex justify="between" align="center">
                  <Text weight="bold">Performance</Text>
                </Flex>
                {dbMetrics ? (
                  <>
                    <Flex justify="between">
                      <Text>Avg. Response Time:</Text>
                      <Badge variant="outline">
                        {dbMetrics.averageExecutionTime?.toFixed(2) || 0} ms
                      </Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Queue Wait Time:</Text>
                      <Badge variant="outline">
                        {poolStatus?.stats?.totalQueueTime 
                          ? (poolStatus.stats.totalQueueTime / Math.max(1, poolStatus.stats.successfulRequests)).toFixed(2) 
                          : 0} ms
                      </Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Success Rate:</Text>
                      <Badge variant={
                        dbMetrics.totalOperations === 0 ? "outline" :
                        dbMetrics.successfulOperations / dbMetrics.totalOperations > 0.95 ? "success" : 
                        dbMetrics.successfulOperations / dbMetrics.totalOperations > 0.8 ? "warning" : "destructive"
                      }>
                        {dbMetrics.totalOperations === 0 
                          ? "N/A" 
                          : ((dbMetrics.successfulOperations / dbMetrics.totalOperations) * 100).toFixed(1) + "%"}
                      </Badge>
                    </Flex>
                    <Flex justify="between">
                      <Text>Uptime:</Text>
                      <Badge variant="outline">
                        {Math.floor(dbMetrics.uptime / 60000)} min
                      </Badge>
                    </Flex>
                  </>
                ) : (
                  <Flex justify="center" className="py-4">
                    <Spinner />
                  </Flex>
                )}
              </Flex>
            </Card>
          </Grid>
          
          <div className="mt-8 space-y-4">
            <Heading className="text-xl font-semibold">Quick Performance Test</Heading>
            <Flex gap={4}>
              <Button 
                onClick={() => {
                  setTestConfig({
                    ...DEFAULT_TEST_CONFIG,
                    concurrentUsers: 5,
                    useConnectionPool: true
                  });
                  setTimeout(runLoadTest, 100);
                }}
                disabled={isTestRunning}
              >
                Run Light Test (5 users)
              </Button>
              <Button 
                onClick={() => {
                  setTestConfig({
                    ...DEFAULT_TEST_CONFIG,
                    concurrentUsers: 20,
                    useConnectionPool: true
                  });
                  setTimeout(runLoadTest, 100);
                }}
                disabled={isTestRunning}
              >
                Run Medium Test (20 users)
              </Button>
              <Button 
                onClick={() => {
                  setTestConfig({
                    ...DEFAULT_TEST_CONFIG,
                    concurrentUsers: 50,
                    useConnectionPool: true
                  });
                  setTimeout(runLoadTest, 100);
                }}
                disabled={isTestRunning}
                variant="destructive"
              >
                Run Heavy Test (50 users)
              </Button>
            </Flex>
          </div>
          
          {testResults.length > 0 && (
            <Card className="p-4 mt-4">
              <Heading className="text-xl font-semibold mb-4">Test Results</Heading>
              {testResults.length > 1 && (
                <div className="h-64 mb-4">
                  <LineChart 
                    data={testResults}
                    index="name"
                    categories={["requestsPerSecond", "averageResponseTime", "failureRate"]}
                    colors={["blue", "green", "red"]}
                  />
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Test</th>
                      <th className="text-left p-2">Req/Sec</th>
                      <th className="text-left p-2">Avg Time</th>
                      <th className="text-left p-2">P95 Time</th>
                      <th className="text-left p-2">Failure %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2">{result.name}</td>
                        <td className="p-2">{result.requestsPerSecond.toFixed(2)}</td>
                        <td className="p-2">{result.averageResponseTime.toFixed(2)} ms</td>
                        <td className="p-2">{result.p95ResponseTime.toFixed(2)} ms</td>
                        <td className="p-2">{result.failureRate.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Flex justify="end" className="mt-4">
                <Button variant="outline" onClick={clearResults}>Clear Results</Button>
              </Flex>
            </Card>
          )}
        </div>
      )}
      
      {selectedTab === 'load-testing' && (
        <div className="space-y-6">
          <Grid columns={2} gap={6}>
            <Card className="p-6">
              <Heading className="text-xl font-semibold mb-4">Load Test Configuration</Heading>
              <Flex direction="column" gap={4}>
                <div>
                  <Label htmlFor="concurrentUsers">Concurrent Users</Label>
                  <TextInput 
                    id="concurrentUsers"
                    type="number" 
                    min={1} 
                    max={100}
                    value={testConfig.concurrentUsers} 
                    onChange={(e) => handleConfigChange('concurrentUsers', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="testDuration">Test Duration (ms)</Label>
                  <Select 
                    id="testDuration"
                    value={testConfig.testDuration.toString()} 
                    onChange={(e) => handleConfigChange('testDuration', e.target.value)}
                  >
                    <option value="5000">5 seconds</option>
                    <option value="10000">10 seconds</option>
                    <option value="30000">30 seconds</option>
                    <option value="60000">60 seconds</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="operation">Operation Type</Label>
                  <Select 
                    id="operation"
                    value={testConfig.operation} 
                    onChange={(e) => handleConfigChange('operation', e.target.value)}
                  >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="mixed">Mixed</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="useConnectionPool">Connection Mode</Label>
                  <Select 
                    id="useConnectionPool"
                    value={testConfig.useConnectionPool.toString()} 
                    onChange={(e) => handleConfigChange('useConnectionPool', e.target.value === 'true')}
                  >
                    <option value="true">Connection Pool</option>
                    <option value="false">Direct Connection</option>
                  </Select>
                </div>
                
                <Button 
                  onClick={runLoadTest} 
                  disabled={isTestRunning}
                  className="mt-2"
                >
                  {isTestRunning ? <Spinner /> : 'Run Load Test'}
                </Button>
                
                {isTestRunning && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-600 rounded" 
                        style={{ width: `${testProgress}%` }}
                      ></div>
                    </div>
                    <Text className="text-xs text-center mt-1">
                      Running test... {testProgress.toFixed(0)}%
                    </Text>
                  </div>
                )}
              </Flex>
            </Card>
            
            <Card className="p-6">
              <Heading className="text-xl font-semibold mb-4">Test Output</Heading>
              {lastTestOutput ? (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm whitespace-pre-wrap h-[400px] overflow-y-auto">
                  {lastTestOutput}
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-md text-center h-[400px] flex items-center justify-center">
                  <Text color="gray">Run a test to see results here</Text>
                </div>
              )}
            </Card>
          </Grid>
          
          {testResults.length > 0 && (
            <Card className="p-6 mt-6">
              <Heading className="text-xl font-semibold mb-4">Results Comparison</Heading>
              <div className="h-96">
                <BarChart 
                  data={testResults}
                  index="name"
                  categories={["requestsPerSecond", "averageResponseTime"]}
                  colors={["blue", "green"]}
                  valueFormatter={{
                    requestsPerSecond: (value) => `${value.toFixed(2)} req/s`,
                    averageResponseTime: (value) => `${value.toFixed(2)} ms`
                  }}
                />
              </div>
              
              {testResults.length >= 2 && (
                <Card className="p-4 mt-4 bg-green-50">
                  <Heading className="text-lg font-semibold mb-2">Performance Improvement</Heading>
                  {testResults.length >= 2 && (() => {
                    // Find tests with and without pool for comparison
                    const withPoolTest = testResults.find(r => r.name.includes('Pooled'));
                    const directTest = testResults.find(r => r.name.includes('Direct'));
                    
                    if (withPoolTest && directTest) {
                      const throughputImprovement = ((withPoolTest.requestsPerSecond / directTest.requestsPerSecond) - 1) * 100;
                      const latencyReduction = ((directTest.averageResponseTime - withPoolTest.averageResponseTime) / directTest.averageResponseTime) * 100;
                      const failureRateReduction = directTest.failureRate > 0 
                        ? ((directTest.failureRate - withPoolTest.failureRate) / directTest.failureRate) * 100
                        : 0;
                        
                      return (
                        <div className="space-y-2">
                          <Flex justify="between" align="center">
                            <Text>Throughput Improvement:</Text>
                            <Badge variant="success">{throughputImprovement.toFixed(1)}%</Badge>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text>Latency Reduction:</Text>
                            <Badge variant="success">{latencyReduction.toFixed(1)}%</Badge>
                          </Flex>
                          <Flex justify="between" align="center">
                            <Text>Failure Rate Reduction:</Text>
                            <Badge variant="success">{failureRateReduction.toFixed(1)}%</Badge>
                          </Flex>
                        </div>
                      );
                    }
                    
                    return <Text>Run tests with and without connection pooling to see improvements</Text>;
                  })()}
                </Card>
              )}
            </Card>
          )}
        </div>
      )}
      
      {selectedTab === 'metrics' && (
        <div className="space-y-6">
          <Grid columns={2} gap={4}>
            <Card className="p-4">
              <Heading className="text-xl font-semibold mb-4">Operation Counts</Heading>
              {dbMetrics?.operationCounts && Object.keys(dbMetrics.operationCounts).length > 0 ? (
                <div className="h-64">
                  <PieChart 
                    data={Object.entries(dbMetrics.operationCounts).map(([name, count]) => ({
                      name,
                      value: count as number
                    }))}
                    category="value"
                    index="name"
                  />
                </div>
              ) : (
                <Flex justify="center" align="center" className="h-64">
                  <Text color="gray">No operations recorded yet</Text>
                </Flex>
              )}
            </Card>
            
            <Card className="p-4">
              <Heading className="text-xl font-semibold mb-4">Error Distribution</Heading>
              {dbMetrics?.errors && Object.keys(dbMetrics.errors).length > 0 ? (
                <div className="h-64">
                  <PieChart 
                    data={Object.entries(dbMetrics.errors).map(([name, count]) => ({
                      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
                      value: count as number
                    }))}
                    category="value"
                    index="name"
                  />
                </div>
              ) : (
                <Flex justify="center" align="center" className="h-64">
                  <Text color="gray">No errors recorded (that's good!)</Text>
                </Flex>
              )}
            </Card>
          </Grid>
          
          <Card className="p-4">
            <Heading className="text-xl font-semibold mb-4">Connection Pool Commands</Heading>
            <Flex gap={2}>
              <Button 
                onClick={() => {
                  const poolService = ConnectionPoolService.getInstance();
                  poolService.reset();
                  setTimeout(refreshStatus, 100);
                }}
                variant="destructive"
              >
                Reset Connection Pool
              </Button>
              
              <Button 
                onClick={() => {
                  optimizedDatabase.resetMetrics();
                  setTimeout(refreshStatus, 100);
                }}
              >
                Reset Metrics
              </Button>
            </Flex>
          </Card>
          
          <Card className="p-4">
            <Heading className="text-xl font-semibold mb-4">Pool Configuration</Heading>
            <div className="space-y-2">
              <Flex justify="between">
                <Text>Maximum Connections:</Text>
                <Badge variant="outline">10</Badge>
              </Flex>
              <Flex justify="between">
                <Text>Max Idle Time:</Text>
                <Badge variant="outline">60 seconds</Badge>
              </Flex>
              <Flex justify="between">
                <Text>Maximum Queue Size:</Text>
                <Badge variant="outline">100</Badge>
              </Flex>
              <Flex justify="between">
                <Text>Acquisition Timeout:</Text>
                <Badge variant="outline">5 seconds</Badge>
              </Flex>
              <Flex justify="between">
                <Text>Max Connection Lifetime:</Text>
                <Badge variant="outline">1 hour</Badge>
              </Flex>
              <Flex justify="between">
                <Text>Health Check Interval:</Text>
                <Badge variant="outline">30 seconds</Badge>
              </Flex>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 