import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get request data
    const { email, name, cartId } = await req.json();
    
    if (!email || !cartId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(name, image, price)')
      .eq('cart_id', cartId);
    
    if (cartError) throw cartError;
    
    // Initialize Resend client
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const resend = new Resend(resendApiKey);
    
    // Format cart items for email
    const formattedItems = cartItems.map(item => ({
      name: item.products?.name || 'Product',
      quantity: item.quantity,
      price: item.products?.price || 0,
      image: item.products?.image || '',
    }));
    
    // Calculate total
    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create checkout URL with cart ID
    const checkoutUrl = `${Deno.env.get('FRONTEND_URL') || 'https://lushmilk.in'}/checkout?cart=${cartId}`;
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: 'LUSH MILK <noreply@lushmilk.in>',
      to: email,
      subject: 'Your cart is waiting for you!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">Hello ${name || 'there'}!</h1>
          <p>We noticed you left some items in your cart. Would you like to complete your purchase?</p>
          
          <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3>Your Cart</h3>
            ${formattedItems.map(item => `
              <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <div style="flex: 0 0 60px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" />
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 0; color: #666;">Quantity: ${item.quantity}</p>
                </div>
                <div style="flex: 0 0 80px; text-align: right;">
                  $${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            `).join('')}
            
            <div style="text-align: right; font-weight: bold; margin-top: 10px;">
              Total: $${total.toFixed(2)}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="background-color: #b56e58; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Your Purchase
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This email was sent automatically because you left items in your cart. 
            If you've already completed your purchase or no longer wish to receive these reminders, 
            you can update your <a href="${Deno.env.get('FRONTEND_URL') || 'https://lushmilk.in'}/account/preferences">notification preferences</a>.
          </p>
        </div>
      `,
    });
    
    if (error) throw error;
    
    // Update cart last_reminder_sent
    await supabase
      .from('carts')
      .update({ last_reminder_sent: new Date().toISOString() })
      .eq('id', cartId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cart reminder email sent',
        id: data?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in cart reminder function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 