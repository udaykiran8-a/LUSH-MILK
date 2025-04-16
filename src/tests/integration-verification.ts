/**
 * Integration Verification Script
 * 
 * This script tests the integration between frontend components, backend services,
 * database connections, and external APIs. Run this after domain migration to 
 * verify all systems are working correctly.
 */

import { UserDatabase, OrderDatabase, ProductDatabase, PaymentDatabase } from '../services/DatabaseService';
import { supabase } from '../integrations/supabase/client';
import { supabaseAdmin } from '../integrations/supabase/admin';

// Set this to a test user ID for verification
const TEST_USER_ID = 'test-user-id'; // Replace with actual test user ID

async function verifySupabaseConnection() {
  console.log('Verifying Supabase connection...');
  
  try {
    // Check basic Supabase connection
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Verify environment variables
    console.log('Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not properly configured');
      return false;
    }
    
    console.log('✅ Environment variables are properly configured');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection verification failed:', error.message || error);
    return false;
  }
}

async function verifyDatabaseServices() {
  console.log('\nVerifying database services...');
  
  try {
    // Test UserDatabase
    console.log('Testing UserDatabase...');
    const userResult = await UserDatabase.getUserProfile(TEST_USER_ID);
    console.log(userResult.success ? '✅ UserDatabase working' : '❌ UserDatabase error');
    
    // Test ProductDatabase
    console.log('Testing ProductDatabase...');
    const productsResult = await ProductDatabase.getProducts();
    console.log(productsResult.success ? `✅ ProductDatabase working (${productsResult.data.length} products found)` : '❌ ProductDatabase error');
    
    // Test OrderDatabase - Just check if the service is accessible
    console.log('Testing OrderDatabase...');
    const orderService = typeof OrderDatabase.getOrderHistory === 'function';
    console.log(orderService ? '✅ OrderDatabase accessible' : '❌ OrderDatabase not properly initialized');
    
    // Test PaymentDatabase - Just check if the service is accessible
    console.log('Testing PaymentDatabase...');
    const paymentService = typeof PaymentDatabase.getPaymentHistory === 'function';
    console.log(paymentService ? '✅ PaymentDatabase accessible' : '❌ PaymentDatabase not properly initialized');
    
    return userResult.success && productsResult.success && orderService && paymentService;
  } catch (error: any) {
    console.error('❌ Database services verification failed:', error.message || error);
    return false;
  }
}

async function verifyEmailServices() {
  console.log('\nVerifying email services configuration...');
  
  try {
    // Check if email service environment variables are configured
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const emailFrom = import.meta.env.VITE_EMAIL_FROM;
    const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL;
    
    if (!resendApiKey) {
      console.warn('⚠️ Resend API key not configured');
    } else {
      console.log('✅ Resend API key configured');
    }
    
    // Check email domain in configuration
    if (emailFrom && !emailFrom.includes('@lushmilk.in') && !emailFrom.includes('@resend.dev')) {
      console.warn('⚠️ Default email sender not using lushmilk.in domain:', emailFrom);
    } else {
      console.log('✅ Email sender configuration looks good');
    }
    
    if (supportEmail && !supportEmail.includes('@lushmilk.in')) {
      console.warn('⚠️ Support email not using lushmilk.in domain:', supportEmail);
    } else {
      console.log('✅ Support email configuration looks good');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Email services verification failed:', error.message || error);
    return false;
  }
}

async function verifyDomainConfiguration() {
  console.log('\nVerifying domain configuration...');
  
  try {
    // Check for any hardcoded old domain references
    const { data: oldDomainRefs, error } = await supabase
      .from('settings')
      .select('value')
      .like('value', '%lushmilk.com%');
    
    if (error) {
      console.error('❌ Could not check domain references:', error.message);
    } else {
      if (oldDomainRefs && oldDomainRefs.length > 0) {
        console.warn(`⚠️ Found ${oldDomainRefs.length} references to old domain in settings table`);
      } else {
        console.log('✅ No old domain references found in database settings');
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Domain configuration verification failed:', error.message || error);
    return false;
  }
}

// Main verification function
export async function verifyIntegration() {
  console.log('Starting integration verification...');
  let success = true;
  
  try {
    const supabaseConnected = await verifySupabaseConnection();
    if (!supabaseConnected) {
      console.error('❌ Supabase connection check failed. Further checks may not be reliable.');
      success = false;
    }
    
    const dbServicesWorking = await verifyDatabaseServices();
    if (!dbServicesWorking) {
      console.error('❌ Database services check failed.');
      success = false;
    }
    
    const emailConfigured = await verifyEmailServices();
    if (!emailConfigured) {
      console.warn('⚠️ Email services not fully configured.');
      // Don't fail verification for this
    }
    
    const domainConfigured = await verifyDomainConfiguration();
    if (!domainConfigured) {
      console.warn('⚠️ Domain configuration check had issues.');
      // Don't fail verification for this
    }
    
    console.log('\n--- Integration Verification Summary ---');
    console.log(`Supabase Connection: ${supabaseConnected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Database Services: ${dbServicesWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Email Configuration: ${emailConfigured ? '✅ PASS' : '⚠️ WARNING'}`);
    console.log(`Domain Configuration: ${domainConfigured ? '✅ PASS' : '⚠️ WARNING'}`);
    console.log('-------------------------------------');
    
    return success;
  } catch (error: any) {
    console.error('❌ Integration verification failed with critical error:', error.message || error);
    return false;
  }
}

// For running directly from command line
if (require.main === module) {
  verifyIntegration()
    .then(success => {
      console.log(`\nVerification ${success ? 'completed successfully' : 'had issues'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Verification script failed with error:', error);
      process.exit(1);
    });
} 