import { supabase } from '../integrations/supabase/client';
import chalk from 'chalk';

// Define expected schema for email-related tables
const requiredTables = [
  'product_notifications',
  'carts',
  'cart_items'
];

const tableColumns = {
  product_notifications: [
    'id', 'customer_id', 'product_id', 'type', 
    'status', 'created_at', 'updated_at'
  ],
  carts: [
    'id', 'customer_id', 'status', 'last_reminder_sent', 
    'created_at', 'updated_at'
  ],
  cart_items: [
    'id', 'cart_id', 'product_id', 'quantity', 
    'created_at', 'updated_at'
  ],
  customers: [
    'email', 'full_name', 'marketing_consent', 
    'order_notifications', 'marketing_emails', 'restock_notifications',
    'created_at', 'updated_at'
  ],
  products: [
    'image', 'popular', 'in_stock'
  ]
}

/**
 * Verify that the database has all required tables and columns
 */
async function verifyEmailSchema() {
  console.log(chalk.blue('\n📋 Verifying database schema for email functionality...'));
  
  let errors = false;
  
  // 1. Check if required tables exist
  const { data: tableData, error: tableError } = await supabase
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');
    
  if (tableError) {
    console.error(chalk.red('❌ Error fetching tables:'), tableError.message);
    return false;
  }
  
  const existingTables = tableData.map(t => t.tablename);
  console.log(chalk.gray(`Found ${existingTables.length} tables in database`));
  
  for (const table of requiredTables) {
    if (!existingTables.includes(table)) {
      console.error(chalk.red(`❌ Missing required table: ${table}`));
      errors = true;
    } else {
      console.log(chalk.green(`✓ Table exists: ${table}`));
    }
  }
  
  // 2. Check if all required columns exist in each table
  for (const [table, columns] of Object.entries(tableColumns)) {
    // Skip if the table doesn't exist
    if (requiredTables.includes(table) && !existingTables.includes(table)) {
      continue;
    }
    
    const { data: columnData, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: table });
      
    if (columnError) {
      console.error(chalk.red(`❌ Error fetching columns for ${table}:`), columnError.message);
      errors = true;
      continue;
    }
    
    const existingColumns = columnData || [];
    console.log(chalk.gray(`Table ${table} has ${existingColumns.length} columns`));
    
    for (const column of columns) {
      if (!existingColumns.includes(column)) {
        console.error(chalk.red(`❌ Missing column ${column} in table ${table}`));
        errors = true;
      } else {
        console.log(chalk.green(`✓ Column exists: ${table}.${column}`));
      }
    }
  }
  
  if (errors) {
    console.error(chalk.red('\n❌ Schema verification failed. Database is missing required tables or columns.'));
    console.log(chalk.yellow('Please run the migration: npx supabase db push'));
    return false;
  } else {
    console.log(chalk.green('\n✅ All required tables and columns for email functionality exist!'));
    return true;
  }
}

/**
 * Main function to run the test
 */
async function main() {
  try {
    const schemaValid = await verifyEmailSchema();
    
    if (schemaValid) {
      console.log(chalk.blue('\n📨 Email system database schema is complete and ready for use'));
    } else {
      console.log(chalk.yellow('\n⚠️ Please fix database schema issues before proceeding'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Error running verification:'), error);
    process.exit(1);
  }
}

// Execute main function
main();

// For module usage
export { verifyEmailSchema }; 