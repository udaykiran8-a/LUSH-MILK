import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateServerSession } from '@/lib/auth-validation';

/**
 * API endpoint for users to delete their account and data (GDPR compliance)
 * Implements a full right-to-be-forgotten process
 */
export async function DELETE(request: Request) {
  try {
    // Validate the user is authenticated
    const validation = await validateServerSession();
    if (!validation.authenticated || !validation.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = validation.userId;
    
    // Parse the request body for confirmation
    const body = await request.json();
    const { confirmDelete, password } = body;
    
    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Account deletion must be explicitly confirmed' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // First verify the user's password to confirm identity
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: body.email || '', // Should be provided in the request
      password: password || '',
    });
    
    if (passwordError) {
      console.error('Password verification failed:', passwordError);
      return NextResponse.json(
        { error: 'Password verification failed. Please enter your correct password to proceed with account deletion.' },
        { status: 403 }
      );
    }
    
    // Start transaction to delete user data (will use RLS policies to ensure proper access)
    
    // 1. Get the customer id first
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (customer) {
      // 2. Delete payment history
      await supabase
        .from('payment_history')
        .delete()
        .eq('user_id', userId);
      
      // 3. Delete payments associated with orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customer.id);
        
      if (orders && orders.length > 0) {
        for (const order of orders) {
          await supabase
            .from('payments')
            .delete()
            .eq('order_id', order.id);
        }
      }
      
      // 4. Delete orders
      await supabase
        .from('orders')
        .delete()
        .eq('customer_id', customer.id);
      
      // 5. Delete customer record
      await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);
    }
    
    // 6. Delete user profile data - anonymize first
    await supabase
      .from('users')
      .update({
        email: `deleted_${userId}@example.com`,
        name: 'Deleted User',
        phone_number: null,
        address: null,
        // Add other fields that should be anonymized
      })
      .eq('id', userId);
    
    // 7. Finally, delete the auth user (this will trigger cascading deletes if set up in RLS)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json(
        { error: 'Error deleting account. Some data may have been removed.' },
        { status: 500 }
      );
    }
    
    // 8. Clear cookies and session
    cookies().getAll().forEach(cookie => {
      cookies().delete(cookie.name);
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your account and associated data have been deleted successfully.' 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 