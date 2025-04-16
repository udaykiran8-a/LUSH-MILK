/**
 * UI Integration Test Component
 * 
 * This component verifies database integration directly from the UI layer.
 * It can be rendered in a test environment or development mode to validate
 * that UI components correctly interact with the database services.
 */

import React, { useState, useEffect } from 'react';
import { UserDatabase, ProductDatabase, OrderDatabase, CartDatabase } from '../services/DatabaseService';

interface TestResult {
  name: string;
  status: 'success' | 'failure' | 'pending';
  message?: string;
  data?: any;
}

interface UIIntegrationTestProps {
  userId?: string;
  onComplete?: (results: TestResult[]) => void;
}

export const UIIntegrationTest: React.FC<UIIntegrationTestProps> = ({ 
  userId = '',
  onComplete 
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testUserId, setTestUserId] = useState(userId);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    if (!testUserId) {
      alert('Please enter a user ID to test');
      return;
    }

    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Fetch user profile
      addResult({
        name: 'Fetch User Profile',
        status: 'pending'
      });

      const userResult = await UserDatabase.getUserProfile(testUserId);
      
      addResult({
        name: 'Fetch User Profile',
        status: userResult.success ? 'success' : 'failure',
        message: userResult.success 
          ? `Found user: ${userResult.data?.email}` 
          : `Failed to find user: ${JSON.stringify(userResult.error)}`,
        data: userResult.data
      });

      // Only continue if user profile fetch succeeded
      if (userResult.success && userResult.data) {
        const customerId = userResult.data.customers?.id;

        // Test 2: Fetch products
        addResult({
          name: 'Fetch Products',
          status: 'pending'
        });

        const productsResult = await ProductDatabase.getProducts();
        
        addResult({
          name: 'Fetch Products',
          status: productsResult.success ? 'success' : 'failure',
          message: productsResult.success 
            ? `Found ${productsResult.data.length} products` 
            : `Failed to fetch products: ${JSON.stringify(productsResult.error)}`,
          data: productsResult.data?.slice(0, 2) // Only show first 2 for brevity
        });

        // Test 3: Fetch order history
        addResult({
          name: 'Fetch Order History',
          status: 'pending'
        });

        const ordersResult = await OrderDatabase.getOrderHistory(testUserId);
        
        addResult({
          name: 'Fetch Order History',
          status: ordersResult.success ? 'success' : 'failure',
          message: ordersResult.success 
            ? `Found ${ordersResult.data.length} orders` 
            : `Failed to fetch orders: ${JSON.stringify(ordersResult.error)}`,
          data: ordersResult.data?.slice(0, 2) // Only show first 2 for brevity
        });

        // Test 4: Get cart (if customer ID is available)
        if (customerId) {
          addResult({
            name: 'Get Active Cart',
            status: 'pending'
          });

          const cartResult = await CartDatabase.getActiveCart(customerId);
          
          addResult({
            name: 'Get Active Cart',
            status: cartResult.success ? 'success' : 'failure',
            message: cartResult.success 
              ? `Found cart with ${cartResult.data?.items?.length || 0} items` 
              : `Failed to fetch cart: ${JSON.stringify(cartResult.error)}`,
            data: cartResult.data
          });
        }
      }
    } catch (error) {
      addResult({
        name: 'Unexpected Error',
        status: 'failure',
        message: `Test suite encountered an error: ${JSON.stringify(error)}`
      });
    } finally {
      setIsRunning(false);
      if (onComplete) {
        onComplete(results);
      }
    }
  };

  useEffect(() => {
    // Auto-run if userId is provided as a prop
    if (userId && userId.length > 0) {
      setTestUserId(userId);
      runTests();
    }
  }, [userId]);

  // Component styling
  const styles = {
    container: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '20px auto',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    header: {
      marginBottom: '20px',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '10px'
    },
    inputGroup: {
      display: 'flex',
      marginBottom: '20px',
      gap: '10px'
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #ced4da',
      fontSize: '16px'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '16px',
      cursor: 'pointer',
      opacity: isRunning ? 0.7 : 1
    },
    resultList: {
      listStyle: 'none',
      padding: 0
    },
    resultItem: (status: string) => ({
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '10px',
      backgroundColor: 
        status === 'success' ? '#d4edda' : 
        status === 'failure' ? '#f8d7da' : 
        '#fff3cd',
      borderLeft: `4px solid ${
        status === 'success' ? '#28a745' : 
        status === 'failure' ? '#dc3545' : 
        '#ffc107'
      }`
    }),
    resultTitle: {
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    resultMessage: {
      fontSize: '14px'
    },
    dataDisplay: {
      marginTop: '10px',
      backgroundColor: 'rgba(0,0,0,0.05)',
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace'
    }
  };

  return (
    <div style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <h2>UI Integration Test</h2>
        <p>Verify database integration from UI components</p>
      </div>

      <div style={styles.inputGroup as React.CSSProperties}>
        <input
          type="text"
          placeholder="Enter User ID to test"
          value={testUserId}
          onChange={(e) => setTestUserId(e.target.value)}
          style={styles.input as React.CSSProperties}
          disabled={isRunning}
        />
        <button 
          onClick={runTests} 
          disabled={isRunning}
          style={styles.button as React.CSSProperties}
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      <ul style={styles.resultList as React.CSSProperties}>
        {results.map((result, index) => (
          <li 
            key={`${result.name}-${index}`} 
            style={styles.resultItem(result.status) as React.CSSProperties}
          >
            <div style={styles.resultTitle as React.CSSProperties}>
              {result.name}: {result.status === 'success' ? '✅' : result.status === 'failure' ? '❌' : '⏳'}
            </div>
            {result.message && (
              <div style={styles.resultMessage as React.CSSProperties}>{result.message}</div>
            )}
            {result.data && (
              <pre style={styles.dataDisplay as React.CSSProperties}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Utility function to run UI integration tests programmatically
 */
export async function runUIIntegrationTests(userId: string): Promise<{
  success: boolean;
  results: TestResult[];
}> {
  return new Promise((resolve) => {
    const results: TestResult[] = [];
    
    const handleComplete = (testResults: TestResult[]) => {
      const success = testResults.every(r => r.status === 'success');
      resolve({ success, results: testResults });
    };
    
    // Create a temporary container to render the component
    const tempContainer = document.createElement('div');
    document.body.appendChild(tempContainer);
    
    // Instead of actually rendering the component since we're in a test environment,
    // we'll simulate it by directly calling the test functions
    const runTests = async () => {
      try {
        // Simulate what the component would do
        const userResult = await UserDatabase.getUserProfile(userId);
        results.push({
          name: 'Fetch User Profile',
          status: userResult.success ? 'success' : 'failure',
          message: userResult.success 
            ? `Found user: ${userResult.data?.email}` 
            : `Failed to find user: ${JSON.stringify(userResult.error)}`,
          data: userResult.data
        });
        
        // Add more tests as needed (similar to component)
        
        handleComplete(results);
      } catch (error) {
        results.push({
          name: 'Unexpected Error',
          status: 'failure',
          message: `Test suite encountered an error: ${JSON.stringify(error)}`
        });
        handleComplete(results);
      } finally {
        // Clean up
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
      }
    };
    
    runTests();
  });
} 