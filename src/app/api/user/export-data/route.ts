import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateServerSession } from '@/lib/auth-validation';

/**
 * API endpoint for users to export their data (GDPR compliance)
 * Returns all user data in a structured JSON format
 */
export async function GET() {
  try {
    // Validate user is authenticated
    const validation = await validateServerSession();
    if (!validation.authenticated || !validation.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = validation.userId;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Error fetching user data' },
        { status: 500 }
      );
    }

    // Fetch customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    // Fetch order history
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        payments(*)
      `)
      .eq('customer_id', customer?.id || '');
      
    // Fetch payment history
    const { data: paymentHistory, error: paymentHistoryError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId);
      
    // Create sanitized user export data
    const userData = {
      exportDate: new Date().toISOString(),
      userProfile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        // Remove any sensitive fields you don't want to include
      },
      customerInfo: customer || null,
      orderHistory: orders?.map(order => ({
        ...order,
        // Remove any sensitive payment details
        payments: order.payments ? {
          id: order.payments.id,
          status: order.payments.status,
          amount: order.payments.amount,
          currency: order.payments.currency,
          created_at: order.payments.created_at,
          // Exclude payment method details for security
        } : null
      })) || [],
      paymentHistory: paymentHistory?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created_at: payment.created_at,
        // Exclude sensitive payment details
      })) || []
    };
    
    // Set filename for download
    const filename = `lush-milk-data-export-${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
} 