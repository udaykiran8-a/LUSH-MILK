import { Resend } from 'resend';
import { toast } from 'sonner';
import { 
  sendWelcomeEmail, 
  sendOrderConfirmation, 
  sendPasswordResetEmail 
} from './EmailService';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

// Initialize trigger store to track already sent emails
const emailTriggerStore = new Map<string, boolean>();

// Map to track sent scheduled emails to avoid duplicates
const scheduledEmailSent = new Map<string, number>();

/**
 * Configure email triggers based on database events
 */
export function setupEmailTriggers() {
  // User registration trigger
  const authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_UP' && session?.user) {
      const { id, email, user_metadata } = session.user;
      const triggerKey = `welcome_${id}`;
      
      // Only send if not already sent
      if (!emailTriggerStore.get(triggerKey) && email) {
        sendWelcomeEmail(email, user_metadata?.full_name as string)
          .then(success => {
            if (success) {
              emailTriggerStore.set(triggerKey, true);
              console.log(`Welcome email automatically sent to ${email}`);
            }
          });
      }
    }
  });

  // Order status change trigger
  const orderSubscription = supabase
    .channel('order-status-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: 'status=eq.completed'
      },
      async (payload) => {
        const orderId = payload.new.id;
        const customerId = payload.new.customer_id;
        const triggerKey = `order_confirmation_${orderId}`;
        
        // Only send if not already sent
        if (!emailTriggerStore.get(triggerKey)) {
          try {
            // Get customer email
            const { data: customer } = await supabase
              .from('customers')
              .select('email')
              .eq('id', customerId)
              .single();
              
            if (customer?.email) {
              // Get order items
              const { data: orderItems } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);
                
              if (orderItems) {
                const success = await sendOrderConfirmation(customer.email, {
                  orderId,
                  date: formatDate(payload.new.created_at),
                  items: orderItems.map(item => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    price: item.unit_price
                  })),
                  total: payload.new.total_amount,
                  address: payload.new.delivery_address
                });
                
                if (success) {
                  emailTriggerStore.set(triggerKey, true);
                  console.log(`Order confirmation automatically sent for order ${orderId}`);
                }
              }
            }
          } catch (error) {
            console.error('Error sending automated order confirmation:', error);
          }
        }
      }
    )
    .subscribe();

  // Password reset trigger
  const passwordResetSubscription = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session?.user?.email) {
      const { id, email } = session.user;
      const triggerKey = `password_reset_${id}_${Date.now()}`;
      
      // Generate reset link
      const resetLink = `${window.location.origin}/reset-password?token=${session.access_token}`;
      
      sendPasswordResetEmail(email, resetLink)
        .then(success => {
          if (success) {
            emailTriggerStore.set(triggerKey, true);
            console.log(`Password reset email automatically sent to ${email}`);
          }
        });
    }
  });

  // Return cleanup function
  return () => {
    authSubscription.data.subscription.unsubscribe();
    orderSubscription.unsubscribe();
    passwordResetSubscription.data.subscription.unsubscribe();
    emailTriggerStore.clear();
  };
}

/**
 * Schedule periodic emails like promotions, newsletters
 * 
 * @param intervalMs Milliseconds between checks (default 24 hours)
 */
export function setupEmailScheduler(intervalMs = 24 * 60 * 60 * 1000) {
  // Keep track of which emails have been sent in this session
  const scheduledEmailSent = new Map<string, number>();
  
  // Function to check and send scheduled emails
  const checkScheduledEmails = async () => {
    try {
      const now = Date.now();
      
      // 1. Check for abandoned carts (24 hours inactive)
      const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const { data: abandonedCarts } = await supabase
        .from('carts')
        .select('*, customers(email, full_name)')
        .eq('status', 'active')
        .lt('updated_at', yesterday);
        
      if (abandonedCarts) {
        for (const cart of abandonedCarts) {
          const email = cart.customers?.email;
          const name = cart.customers?.full_name;
          const cartId = cart.id;
          
          // Only send once per day
          const lastSent = scheduledEmailSent.get(`cart_reminder_${cartId}`);
          if (!lastSent || (now - lastSent > 24 * 60 * 60 * 1000)) {
            if (email) {
              // Send cart reminder email
              const { data, error } = await supabase.functions.invoke('send-cart-reminder', {
                body: { email, name, cartId }
              });
              
              if (!error) {
                scheduledEmailSent.set(`cart_reminder_${cartId}`, now);
                console.log(`Automated cart reminder sent to ${email}`);
              }
            }
          }
        }
      }
      
      // 2. Check for product restock notifications
      const { data: restockSubscriptions } = await supabase
        .from('product_notifications')
        .select('*, customers(email), products(*)')
        .eq('status', 'pending')
        .eq('type', 'restock');
        
      if (restockSubscriptions) {
        for (const sub of restockSubscriptions) {
          const email = sub.customers?.email;
          const product = sub.products;
          
          if (email && product && product.in_stock) {
            // Send restock notification
            const { data, error } = await supabase.functions.invoke('send-restock-notification', {
              body: { email, productId: product.id, productName: product.name }
            });
            
            if (!error) {
              // Update notification status
              await supabase
                .from('product_notifications')
                .update({ status: 'sent', updated_at: new Date().toISOString() })
                .eq('id', sub.id);
                
              console.log(`Automated restock notification sent for product ${product.id}`);
            }
          }
        }
      }
      
      // 3. Send weekly newsletter every Sunday
      const today = new Date();
      if (today.getDay() === 0) { // Sunday
        const weeklyKey = `weekly_newsletter_${today.toISOString().split('T')[0]}`;
        
        if (!scheduledEmailSent.get(weeklyKey)) {
          // Get all subscribers
          const { data: subscribers } = await supabase
            .from('customers')
            .select('email, full_name')
            .eq('marketing_consent', true);
            
          if (subscribers) {
            // Batch send newsletter (in chunks to avoid rate limits)
            const batchSize = 50;
            for (let i = 0; i < subscribers.length; i += batchSize) {
              const batch = subscribers.slice(i, i + batchSize);
              
              try {
                // First try to use edge functions
                const { data, error } = await supabase.functions.invoke('send-weekly-newsletter', {
                  body: { recipients: batch, date: today.toISOString() }
                });
                
                if (error) {
                  // If edge function fails, fall back to direct sending
                  console.warn('Edge function failed, falling back to direct sending:', error);
                  const result = await sendWeeklyNewsletterDirect(batch, today.toISOString());
                  if (!result.error) {
                    console.log(`Sent ${batch.length} newsletters directly in batch ${i/batchSize + 1}`);
                  }
                } else {
                  console.log(`Sent ${batch.length} newsletters via edge function in batch ${i/batchSize + 1}`);
                }
              } catch (functionError) {
                // If invoking the function itself fails (e.g., functions not available)
                console.warn('Unable to use edge functions, falling back to direct sending:', functionError);
                const result = await sendWeeklyNewsletterDirect(batch, today.toISOString());
                if (!result.error) {
                  console.log(`Sent ${batch.length} newsletters directly in batch ${i/batchSize + 1}`);
                }
              }
            }
            
            scheduledEmailSent.set(weeklyKey, now);
          }
        }
      }
      
    } catch (error) {
      console.error('Error in email scheduler:', error);
    }
    
    // Schedule next check
    setTimeout(checkScheduledEmails, intervalMs);
  };
  
  // Start the scheduler
  const timeoutId = setTimeout(checkScheduledEmails, 60 * 1000); // First check after 1 minute
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    scheduledEmailSent.clear();
  };
}

/**
 * Setup all automated email systems
 */
export function initializeAutomatedEmails() {
  const cleanupTriggers = setupEmailTriggers();
  const cleanupScheduler = setupEmailScheduler();
  
  // Return combined cleanup function
  return () => {
    cleanupTriggers();
    cleanupScheduler();
  };
}

// Function to send weekly newsletter directly if edge functions aren't available
async function sendWeeklyNewsletterDirect(recipients: any[], date: string) {
  try {
    const API_KEY = import.meta.env.VITE_RESEND_API_KEY;
    const DEFAULT_FROM = import.meta.env.VITE_EMAIL_FROM || 'newsletter@lushmilk.in';
    
    if (!API_KEY) {
      console.error('Resend API key not found');
      return { error: 'API key missing' };
    }
    
    const resend = new Resend(API_KEY);
    
    // Build newsletter content
    const newsletterDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Process in smaller batches
    const batchSize = 5; // Smaller batch size for direct sending
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Send to each recipient individually
      for (const recipient of batch) {
        const { error } = await resend.emails.send({
          from: DEFAULT_FROM,
          to: recipient.email,
          subject: `LUSH MILK Weekly Newsletter - ${newsletterDate}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #b56e58;">LUSH MILK Weekly Newsletter</h1>
              <p>Hello ${recipient.full_name || 'valued customer'},</p>
              <p>Here are this week's featured products and news...</p>
              
              <!-- Newsletter content would go here -->
              
              <p>Thank you for being a LUSH MILK customer!</p>
              <p>The LUSH MILK Team</p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                If you no longer wish to receive these emails, 
                <a href="${import.meta.env.VITE_FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}">unsubscribe here</a>.
              </p>
            </div>
          `
        });
        
        if (error) {
          console.error(`Failed to send newsletter to ${recipient.email}:`, error);
        }
      }
      
      // Pause between batches to avoid rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { data: { sent: true }, error: null };
  } catch (error) {
    console.error('Error sending weekly newsletter directly:', error);
    return { data: null, error };
  }
} 