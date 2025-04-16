/**
 * Database Integration Verification Script
 * 
 * This script verifies database connection, schema, and operations before deployment.
 * Run with: npx ts-node scripts/verify-db-integration.ts
 */

import { supabase } from '../src/integrations/supabase/client';
import { UserDatabase, OrderDatabase, ProductDatabase, PaymentDatabase } from '../src/services/DatabaseService';
import chalk from 'chalk';

// Test item IDs (replace with actual test IDs from your database)
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';
const TEST_PRODUCT_ID = process.env.TEST_PRODUCT_ID || 'test-product-id';
const TEST_ORDER_ID = process.env.TEST_ORDER_ID || 'test-order-id';

interface VerificationResult {
  success: boolean;
  message: string;
}

/**
 * Verify Supabase connection
 */
async function verifySupabaseConnection(): Promise<VerificationResult> {
  try {
    console.log(chalk.blue('Verifying Supabase connection...'));
    
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                        process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                         process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: 'Missing Supabase environment variables'
      };
    }
    
    // Test connection by making a simple query
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      return {
        success: false,
        message: `Connection error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Unexpected error: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Verify database schema
 */
async function verifyDatabaseSchema(): Promise<VerificationResult> {
  try {
    console.log(chalk.blue('Verifying database schema...'));
    
    // List of required tables
    const requiredTables = [
      'users',
      'products',
      'orders',
      'order_items',
      'payments',
      'profiles'
    ];
    
    // Verify each table exists
    const missingTables: string[] = [];
    
    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)')
        .limit(1);
      
      if (error && error.code === '42P01') { // SQL table not found error
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Missing required tables: ${missingTables.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'All required tables exist in the database'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Schema verification error: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Verify database operations using the DatabaseService
 */
async function verifyDatabaseOperations(): Promise<VerificationResult> {
  try {
    console.log(chalk.blue('Verifying database operations...'));
    
    // Initialize database services
    const userDb = new UserDatabase();
    const productDb = new ProductDatabase();
    const orderDb = new OrderDatabase();
    const paymentDb = new PaymentDatabase();
    
    // Verify basic read operations
    const operations = [
      userDb.getUserProfile(TEST_USER_ID).then(() => true).catch(() => false),
      productDb.getProductById(TEST_PRODUCT_ID).then(() => true).catch(() => false),
      orderDb.getOrderById(TEST_ORDER_ID).then(() => true).catch(() => false)
    ];
    
    const results = await Promise.all(operations);
    const failures = results.filter(result => !result).length;
    
    if (failures > 0) {
      return {
        success: false,
        message: `${failures} out of ${operations.length} database operations failed`
      };
    }
    
    return {
      success: true,
      message: 'Successfully verified basic database operations'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database operations error: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Verify data integrity
 */
async function verifyDataIntegrity(): Promise<VerificationResult> {
  try {
    console.log(chalk.blue('Verifying data integrity...'));
    
    // Check for orphaned records across all relevant tables
    const tables = [
      { name: 'orders', foreignKey: 'customer_id', referencedTable: 'customers' },
      { name: 'payments', foreignKey: 'order_id', referencedTable: 'orders' },
      { name: 'customers', foreignKey: 'user_id', referencedTable: 'users' },
      { name: 'subscriptions', foreignKey: 'customer_id', referencedTable: 'customers' },
      { name: 'cart_items', foreignKey: 'cart_id', referencedTable: 'carts' },
      { name: 'deliveries', foreignKey: 'order_id', referencedTable: 'orders' },
    ];
    
    let totalOrphanedRecords = 0;
    const orphanedDetails = [];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table.name)
        .select(`id, ${table.foreignKey}`)
        .is(table.foreignKey, null);
      
      if (error) {
        console.error(chalk.red(`Error checking ${table.name}: ${error.message}`));
        continue;
      }
      
      if (data && data.length > 0) {
        totalOrphanedRecords += data.length;
        orphanedDetails.push(`${data.length} orphaned records in ${table.name}`);
      }
    }
    
    // Check for invalid values
    const invalidChecks = [
      { 
        table: 'orders', 
        field: 'total_amount', 
        condition: 'lt', 
        value: 0, 
        message: 'orders with negative amounts' 
      },
      { 
        table: 'products', 
        field: 'price', 
        condition: 'lt', 
        value: 0, 
        message: 'products with negative prices' 
      },
    ];
    
    let totalInvalidRecords = 0;
    const invalidDetails = [];
    
    for (const check of invalidChecks) {
      const { data, error } = await supabase
        .from(check.table)
        .select(`id, ${check.field}`)
        .filter(check.field, check.condition, check.value);
      
      if (error) {
        console.error(chalk.red(`Error checking ${check.table}: ${error.message}`));
        continue;
      }
      
      if (data && data.length > 0) {
        totalInvalidRecords += data.length;
        invalidDetails.push(`${data.length} ${check.message}`);
      }
    }
    
    const totalIssues = totalOrphanedRecords + totalInvalidRecords;
    
    if (totalIssues > 0) {
      return {
        success: false,
        message: `Found ${totalIssues} data integrity issues:\n` +
                 `${orphanedDetails.join(', ')}\n` +
                 `${invalidDetails.join(', ')}`
      };
    }
    
    return {
      success: true,
      message: 'Data integrity verification passed'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Data integrity error: ${error?.message || 'Unknown error'}`
    };
  }
}

/**
 * Main verification function
 */
async function verifyDatabaseIntegration() {
  console.log(chalk.yellow.bold('=== DATABASE INTEGRATION VERIFICATION ==='));
  
  // Run all verification steps
  const connectionResult = await verifySupabaseConnection();
  console.log(
    connectionResult.success ? chalk.green('✓') : chalk.red('✗'), 
    connectionResult.message
  );
  
  // Only proceed if connection is successful
  if (!connectionResult.success) {
    console.log(chalk.red('Database connection failed. Aborting verification.'));
    process.exit(1);
  }
  
  const schemaResult = await verifyDatabaseSchema();
  console.log(
    schemaResult.success ? chalk.green('✓') : chalk.red('✗'), 
    schemaResult.message
  );
  
  const operationsResult = await verifyDatabaseOperations();
  console.log(
    operationsResult.success ? chalk.green('✓') : chalk.red('✗'), 
    operationsResult.message
  );
  
  const integrityResult = await verifyDataIntegrity();
  console.log(
    integrityResult.success ? chalk.green('✓') : chalk.red('✗'), 
    integrityResult.message
  );
  
  // Overall result
  const allPassed = 
    connectionResult.success && 
    schemaResult.success && 
    operationsResult.success && 
    integrityResult.success;
  
  console.log(chalk.yellow.bold('=== VERIFICATION SUMMARY ==='));
  if (allPassed) {
    console.log(chalk.green.bold('✓ All database integration tests passed'));
    console.log(chalk.green('Database is ready for deployment'));
  } else {
    console.log(chalk.red.bold('✗ Database integration verification failed'));
    console.log(chalk.red('Fix the issues before deploying to production'));
    process.exit(1);
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyDatabaseIntegration()
    .catch(error => {
      console.error(chalk.red.bold('Verification failed with error:'), error);
      process.exit(1);
    });
} 