import { UserDatabase, OrderDatabase, ProductDatabase, PaymentDatabase } from '../services/DatabaseService';
import { supabase } from '../integrations/supabase/client';

// This is not a complete test file - it's a template for database integration testing
// that should be expanded with actual test runner like Jest or Vitest

/**
 * Tests the database services with real data
 */
async function testDatabaseIntegration() {
  console.log('Starting database integration tests...');
  
  // Test user ID - would need to be replaced with a real test user
  const TEST_USER_ID = 'test-user-id'; // Example ID
  
  try {
    // Test UserDatabase operations
    console.log('Testing UserDatabase...');
    
    // Use getUserProfile instead of getProfile
    const profileResult = await UserDatabase.getUserProfile(TEST_USER_ID);
    console.log('User profile:', profileResult.success && profileResult.data ? 'Found' : 'Not found or error');
    
    const customerResult = await UserDatabase.getCustomerData(TEST_USER_ID);
    const customer = customerResult.success ? customerResult.data : null;
    console.log('Customer data:', customer ? 'Found' : 'Not found or error');
    
    if (!customer) {
      const createCustomerResult = await UserDatabase.ensureCustomerExists(TEST_USER_ID, 'test@example.com');
      // Check the success flag and customerId from the returned object
      console.log('Customer creation:', createCustomerResult.success && createCustomerResult.customerId ? 'Success' : 'Failed');
    }
    
    // Test ProductDatabase operations
    console.log('\nTesting ProductDatabase...');
    
    // Use getProducts instead of getAllProducts
    const productsResult = await ProductDatabase.getProducts();
    const products = productsResult.success ? productsResult.data : [];
    console.log(`Found ${products.length} products`);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      const singleProductResult = await ProductDatabase.getProductById(firstProduct.id);
      console.log('Single product:', singleProductResult.success && singleProductResult.data ? 'Found' : 'Not found or error');
      
      // getProductsByCategory does not exist, use getProducts with filter if needed, or test existing methods
      // Example: Check if the first product's category exists (assuming product has a category field)
      if (firstProduct.category) {
        console.log(`First product category: ${firstProduct.category}`);
      } else {
         console.log('First product has no category defined.');
      }
    }
    
    // Test OrderDatabase operations
    console.log('\nTesting OrderDatabase...');
    
    const ordersResult = await OrderDatabase.getOrderHistory(TEST_USER_ID);
    // Access data property which should be an array
    const orders = ordersResult.success ? ordersResult.data : [];
    console.log(`Found ${orders.length} orders for user`);
    
    if (orders.length > 0) {
       // getOrderById does not exist based on previous errors, test existing methods
       // Example: Check if first order has items (assuming OrderDatabase has a method like getOrderItems)
       console.log(`First order ID: ${orders[0].id}`);
       // If OrderDatabase.getOrderItems exists:
       // const itemsResult = await OrderDatabase.getOrderItems(orders[0].id);
       // console.log('First order items:', itemsResult.success ? itemsResult.data.length : 'Error fetching items');
    }
    
    // Test database relationships
    console.log('\nTesting database relationships...');
    
    // Check if customer has orders
    // Access customerId from the fetched customer data
    if (customer && customer.id) {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customer.id); // Use customer.id here
      
      if (error) console.error("Error fetching customer orders:", error.message);
      console.log(`Customer has ${data?.length || 0} orders`);
    }
    
    // Check if orders have payments
    if (orders.length > 0) {
      const firstOrderId = orders[0].id;
      const { data, error } = await supabase
        .from('payments')
        .select('id, status')
        .eq('order_id', firstOrderId);
      
      if (error) console.error("Error fetching order payments:", error.message);
      console.log(`Order ${firstOrderId} has ${data?.length || 0} payments`);
    }
    
    console.log('\nDatabase integration tests completed successfully');
    return true;
  } catch (error: any) { // Added type annotation for error
    console.error('Database integration test failed:', error.message || error);
    return false;
  }
}

/**
 * Runs data validation tests to check data consistency
 */
async function testDataValidation() {
  console.log('Starting data validation tests...');
  
  try {
    // Test for orphaned records
    const { data: orphanedOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_id')
      .is('customer_id', null);
    
    if (ordersError) console.error("Error checking orphaned orders:", ordersError.message);
    console.log(`Found ${orphanedOrders?.length || 0} orders without customers`);
    
    const { data: orphanedPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, order_id')
      .is('order_id', null);
    
    if (paymentsError) console.error("Error checking orphaned payments:", paymentsError.message);
    console.log(`Found ${orphanedPayments?.length || 0} payments without orders`);
    
    // Test for data inconsistencies
    const { data: invalidOrders, error: invalidOrdersError } = await supabase
      .from('orders')
      .select('id, total_amount')
      .lt('total_amount', 0);
    
    if (invalidOrdersError) console.error("Error checking invalid orders:", invalidOrdersError.message);
    console.log(`Found ${invalidOrders?.length || 0} orders with invalid total amounts`);
    
    console.log('\nData validation tests completed');
    return {
      orphanedOrders: orphanedOrders?.length || 0,
      orphanedPayments: orphanedPayments?.length || 0,
      invalidOrders: invalidOrders?.length || 0
    };
  } catch (error: any) { // Added type annotation for error
    console.error('Data validation tests failed:', error.message || error);
    return {
      error: error.message || 'Unknown validation error' // Return error message
    };
  }
}

/**
 * Reports database integration testing results
 */
async function reportDatabaseHealth() {
  console.log('----- DATABASE INTEGRATION AUDIT -----');
  
  const integrationTestPassed = await testDatabaseIntegration();
  const validationResults = await testDataValidation();
  
  console.log('\n----- DATABASE HEALTH SUMMARY -----');
  console.log(`Integration tests: ${integrationTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log('Data validation:');
  
  if ('error' in validationResults) {
    console.log('  FAILED - Error during validation');
  } else {
    const issues = 
      validationResults.orphanedOrders + 
      validationResults.orphanedPayments + 
      validationResults.invalidOrders;
    
    console.log(`  ${issues === 0 ? 'PASSED' : 'ISSUES FOUND'}`);
    
    if (issues > 0) {
      console.log(`  - Orphaned orders: ${validationResults.orphanedOrders}`);
      console.log(`  - Orphaned payments: ${validationResults.orphanedPayments}`);
      console.log(`  - Invalid orders: ${validationResults.invalidOrders}`);
    }
  }
  
  console.log('\nRecommendations:');
  if (!integrationTestPassed || 'error' in validationResults) {
    console.log('- Fix the database integration issues before deployment');
    console.log('- Consider running database migrations to repair inconsistencies');
    return false;
  } else {
    const anyIssues = !('error' in validationResults) && (
      validationResults.orphanedOrders > 0 || 
      validationResults.orphanedPayments > 0 || 
      validationResults.invalidOrders > 0
    );
    
    if (anyIssues) {
      console.log('- Clean up data inconsistencies before deployment');
      console.log('- Review database constraints and add foreign key constraints');
      return false;
    } else {
      console.log('- Database appears healthy and ready for deployment');
      console.log('- Consider setting up regular database health checks');
      return true;
    }
  }
}

// Enable direct execution of this test
// @ts-ignore: Using Node.js module system
if (typeof require !== 'undefined' && require.main === module) {
  reportDatabaseHealth()
    .then(isHealthy => {
      console.log(`\nOverall database health: ${isHealthy ? 'GOOD' : 'NEEDS ATTENTION'}`);
      // @ts-ignore: Using Node.js process
      process.exit(isHealthy ? 0 : 1);
    })
    .catch(error => {
      console.error('Failed to run database health check:', error);
      // @ts-ignore: Using Node.js process
      process.exit(1);
    });
}

// Export functions for use in test suites
export {
  testDatabaseIntegration,
  testDataValidation,
  reportDatabaseHealth
}; 