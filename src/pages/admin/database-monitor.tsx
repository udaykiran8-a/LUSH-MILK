import React, { useState, useEffect } from 'react';
import { Chart, LineChart } from '../../components/ui/Chart';
import { supabase } from '../../lib/supabaseClient';

interface PoolMetrics {
  activeConnections: number;
  idleConnections: number;
  pendingConnections: number;
  maxConnections: number;
  utilizationPercentage: number;
  averageQueryTime: number;
}

interface QueryMetrics {
  timestamp: string;
  queryTime: number;
  queryType: string;
}

const DatabaseMonitor: React.FC = () => {
  const [poolMetrics, setPoolMetrics] = useState<PoolMetrics>({
    activeConnections: 0,
    idleConnections: 0,
    pendingConnections: 0,
    maxConnections: 20,
    utilizationPercentage: 0,
    averageQueryTime: 0
  });
  
  const [queryTimes, setQueryTimes] = useState<number[]>([]);
  const [queryLabels, setQueryLabels] = useState<string[]>([]);
  const [connectionHistory, setConnectionHistory] = useState<number[]>([]);
  const [historyLabels, setHistoryLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<{reads: number, writes: number, avg: number} | null>(null);
  
  // Fetch initial data
  useEffect(() => {
    fetchDatabaseMetrics();
    const interval = setInterval(fetchDatabaseMetrics, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchDatabaseMetrics = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would call a proper API that returns pool metrics
      // For demo purposes, we'll simulate the data
      
      // Simulate a database query to get metrics
      const startTime = performance.now();
      const { data, error } = await supabase.from('users').select('id').limit(1);
      const endTime = performance.now();
      
      if (error) throw error;
      
      // Generate simulated pool metrics
      const newMetrics: PoolMetrics = {
        activeConnections: Math.floor(Math.random() * 8) + 1,
        idleConnections: Math.floor(Math.random() * 5) + 1,
        pendingConnections: Math.floor(Math.random() * 3),
        maxConnections: 20,
        utilizationPercentage: 0,
        averageQueryTime: endTime - startTime
      };
      
      // Calculate utilization
      newMetrics.utilizationPercentage = 
        (newMetrics.activeConnections / newMetrics.maxConnections) * 100;
      
      setPoolMetrics(newMetrics);
      
      // Update query time history
      const currentTime = new Date();
      const timeLabel = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
      
      setQueryTimes(prev => {
        const updated = [...prev, newMetrics.averageQueryTime];
        if (updated.length > 10) updated.shift();
        return updated;
      });
      
      setQueryLabels(prev => {
        const updated = [...prev, timeLabel];
        if (updated.length > 10) updated.shift();
        return updated;
      });
      
      // Update connection history
      setConnectionHistory(prev => {
        const updated = [...prev, newMetrics.activeConnections];
        if (updated.length > 10) updated.shift();
        return updated;
      });
      
      setHistoryLabels(prev => {
        const updated = [...prev, timeLabel];
        if (updated.length > 10) updated.shift();
        return updated;
      });
      
      setIsLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching database metrics:', err);
      setError('Failed to fetch database metrics');
      setIsLoading(false);
    }
  };
  
  const runLoadTest = async () => {
    try {
      setIsRunningTest(true);
      setTestResults(null);
      
      // In a real app, this would call a dedicated load test endpoint
      // For demo purposes, we'll simulate a load test with multiple queries
      
      const readTimes: number[] = [];
      const writeTimes: number[] = [];
      
      // Perform 10 read operations
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await supabase.from('users').select('id').limit(5);
        const endTime = performance.now();
        readTimes.push(endTime - startTime);
      }
      
      // Perform 5 write operations (to a log table that we assume exists)
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        // In a real app, this would write to a actual table
        // Here we're just simulating the timing
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        const endTime = performance.now();
        writeTimes.push(endTime - startTime);
      }
      
      const avgReadTime = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
      const avgWriteTime = writeTimes.reduce((a, b) => a + b, 0) / writeTimes.length;
      const avgOverall = [...readTimes, ...writeTimes].reduce((a, b) => a + b, 0) / (readTimes.length + writeTimes.length);
      
      setTestResults({
        reads: avgReadTime,
        writes: avgWriteTime,
        avg: avgOverall
      });
      
      setIsRunningTest(false);
      
    } catch (err) {
      console.error('Error running load test:', err);
      setError('Failed to complete load test');
      setIsRunningTest(false);
    }
  };
  
  const getConnectionStatusColor = () => {
    if (poolMetrics.utilizationPercentage > 80) return 'bg-red-500';
    if (poolMetrics.utilizationPercentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Database Connection Monitor</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Connection Metrics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Connection Pool Status</h2>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${getConnectionStatusColor()}`}></div>
            <span className="text-gray-700">
              {poolMetrics.utilizationPercentage < 50 ? 'Healthy' : 
               poolMetrics.utilizationPercentage < 80 ? 'Moderate' : 'High Load'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-xl font-medium">{poolMetrics.activeConnections}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Idle</div>
              <div className="text-xl font-medium">{poolMetrics.idleConnections}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-xl font-medium">{poolMetrics.pendingConnections}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Max</div>
              <div className="text-xl font-medium">{poolMetrics.maxConnections}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Pool Utilization</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getConnectionStatusColor()}`} 
                style={{ width: `${poolMetrics.utilizationPercentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {poolMetrics.utilizationPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Query Metrics */}
        <div className="bg-white p-4 rounded-lg shadow col-span-2">
          <h2 className="text-lg font-semibold mb-4">Query Performance</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Latest Query Time</div>
            <div className="text-xl font-medium">
              {poolMetrics.averageQueryTime.toFixed(2)} ms
            </div>
          </div>
          <LineChart 
            data={queryTimes}
            labels={queryLabels}
            title="Query Times (ms)"
            height={150}
            width={500}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Connection History */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Connection History</h2>
          <Chart 
            data={connectionHistory}
            labels={historyLabels}
            height={200}
            width={400}
            barColor="#3B82F6"
          />
        </div>
        
        {/* Load Test */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Database Load Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            Run a simulated load test to analyze database performance under load.
          </p>
          
          <button
            onClick={runLoadTest}
            disabled={isRunningTest}
            className={`px-4 py-2 rounded font-medium ${
              isRunningTest 
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunningTest ? 'Running Test...' : 'Run Load Test'}
          </button>
          
          {testResults && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Test Results</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs text-gray-500">Read Avg</div>
                  <div className="font-medium">{testResults.reads.toFixed(2)} ms</div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs text-gray-500">Write Avg</div>
                  <div className="font-medium">{testResults.writes.toFixed(2)} ms</div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs text-gray-500">Overall</div>
                  <div className="font-medium">{testResults.avg.toFixed(2)} ms</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 italic">
        This dashboard is automatically refreshed every 5 seconds. Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default DatabaseMonitor; 