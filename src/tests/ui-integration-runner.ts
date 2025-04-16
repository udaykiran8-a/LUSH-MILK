/**
 * UI Integration Test Runner
 * 
 * This script runs the UI integration tests programmatically
 * without requiring a browser environment.
 */

import { runUIIntegrationTests } from './ui-integration-test';
import chalk from 'chalk';
import { UserDatabase } from '../services/DatabaseService';
import { TestSeeder } from './test-utils';

// Node.js process
declare const process: {
  exit: (code: number) => never;
};

const LOG_PREFIX = '🔍 [UI Integration]';

/**
 * Main runner function
 */
async function main() {
  console.log(chalk.blue(`\n${LOG_PREFIX} Starting UI integration tests...\n`));
  
  let testUserId = '';
  let customerId = '';
  
  try {
    // Step 1: Create test data
    console.log(chalk.gray(`${LOG_PREFIX} Creating test data...`));
    const testData = await TestSeeder.seedTestUser();
    testUserId = testData.userId;
    customerId = testData.customerId;
    
    const productIds = await TestSeeder.seedTestProducts(3);
    
    console.log(chalk.green(`${LOG_PREFIX} Created test user: ${testUserId}`));
    
    // Step 2: Wait a moment for data to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Run UI integration tests
    console.log(chalk.gray(`${LOG_PREFIX} Running UI integration tests...`));
    const { success, results } = await runUIIntegrationTests(testUserId);
    
    // Step 4: Output results
    console.log(chalk.blue(`\n${LOG_PREFIX} UI Integration Test Results:`));
    
    let passCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'success') {
        passCount++;
        console.log(chalk.green(`✅ ${result.name}: ${result.message}`));
      } else if (result.status === 'failure') {
        failCount++;
        console.log(chalk.red(`❌ ${result.name}: ${result.message}`));
      }
    });
    
    console.log(chalk.blue(`\n${LOG_PREFIX} Summary: ${passCount} passed, ${failCount} failed`));
    
    if (success) {
      console.log(chalk.green(`\n${LOG_PREFIX} All UI integration tests passed!`));
    } else {
      console.log(chalk.red(`\n${LOG_PREFIX} Some UI integration tests failed!`));
    }
    
    // Step 5: Clean up test data
    console.log(chalk.gray(`\n${LOG_PREFIX} Cleaning up test data...`));
    await TestSeeder.cleanupTestData(testUserId);
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(chalk.red(`\n${LOG_PREFIX} Error running UI integration tests:`), error);
    
    // Attempt to clean up test data if it was created
    if (testUserId) {
      try {
        console.log(chalk.gray(`\n${LOG_PREFIX} Cleaning up test data after error...`));
        await TestSeeder.cleanupTestData(testUserId);
      } catch (cleanupError) {
        console.error(chalk.red(`\n${LOG_PREFIX} Error cleaning up test data:`), cleanupError);
      }
    }
    
    process.exit(1);
  }
}

// Run the main function
main(); 