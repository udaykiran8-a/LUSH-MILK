import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z, ZodError, infer as zodInfer } from 'zod';

// Define interfaces for expected data structures
interface ProductInfo {
  name: string;
  image: string;
  price_1l: number;
}

// Zod schema for subscription validation
export const SubscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  milkType: z.string().min(1, "Milk type is required"),
  quantityLiters: z.number().positive("Quantity must be positive"),
  deliverySchedule: z.enum_(["daily", "alternate_days", "weekly"]),
  deliveryTime: z.enum_(["morning", "evening"]),
  startDate: z.string().datetime({ message: "Valid start date is required" }),
  endDate: z.string().datetime().optional().nullable(),
  deliveryAddress: z.string().min(5, "Delivery address is required")
});

// Use the imported z.infer
export type SubscriptionRequest = zodInfer<typeof SubscriptionSchema>;

export interface SubscriptionWithDetails {
  id: string;
  customer_id: string;
  milk_type: string;
  quantity_liters: number;
  delivery_schedule: string;
  delivery_time: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  address: string;
  product?: ProductInfo | null;
}

/**
 * Creates a new subscription
 */
export async function createSubscription(
  subscriptionInput: unknown
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const parseResult = SubscriptionSchema.safeParse(subscriptionInput);
    
    if (!parseResult.success) {
      // Explicitly check for the error property to help type narrowing
      if ('error' in parseResult) {
          const firstErrorMessage = parseResult.error.issues[0]?.message || 'Invalid input';
          console.error('Validation error:', parseResult.error.issues);
          toast.error('Invalid subscription details', { description: firstErrorMessage });
          return { success: false, error: `Validation failed: ${firstErrorMessage}` };
      } else {
          // Should theoretically not happen if success is false, but handle defensively
          const errMsg = 'Validation failed with unknown error structure.';
          console.error(errMsg, parseResult);
          toast.error('Invalid subscription details', { description: errMsg });
          return { success: false, error: errMsg };
      }
    }
    
    // Access data from the successful parse result (type is correctly narrowed here)
    const validatedData = parseResult.data;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        customer_id: validatedData.customerId,
        milk_type: validatedData.milkType,
        quantity_liters: validatedData.quantityLiters,
        delivery_schedule: validatedData.deliverySchedule,
        delivery_time: validatedData.deliveryTime,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate, 
        status: 'active',
        address: validatedData.deliveryAddress
      })
      .select('id') 
      .single();    
    
    if (error) {
      console.error('Error creating subscription:', error.message);
      toast.error('Failed to create your subscription', { description: error.message });
      return { success: false, error: error.message };
    }

    if (!data || !data.id) {
      const errMsg = 'Subscription created but no ID returned';
      console.error(errMsg);
      toast.error('Subscription creation issue', { description: errMsg });
      return { success: false, error: errMsg };
    }
    
    toast.success('Subscription created successfully!', {
      description: `Deliveries start ${new Date(validatedData.startDate).toLocaleDateString()}`
    });
    
    return { success: true, subscriptionId: data.id };
  } catch (error) {
    console.error('Unexpected subscription creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during creation';
    toast.error('Could not process subscription', { description: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches all subscriptions for a customer (not just active)
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<{ success: boolean; data?: SubscriptionWithDetails[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('subscriptions') // Specify the expected type for the table
      .select(`
        id, customer_id, milk_type, quantity_liters, delivery_schedule, 
        delivery_time, start_date, end_date, status, created_at, address,
        product:products(name, image, price_1l)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching subscriptions:', error.message);
      toast.error('Failed to load subscriptions', { description: error.message });
      return { success: false, error: error.message };
    }
    
    // Data structure should match SubscriptionWithDetails[] based on select
    return { success: true, data: data || [] }; 
  } catch (error) {
    console.error('Subscription fetch failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown fetch error';
    toast.error('Could not retrieve subscriptions', { description: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Updates an existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  // Use Partial<SubscriptionRequest> for updates to allow validating subsets
  updates: Partial<SubscriptionRequest> 
): Promise<{ success: boolean; error?: string }> { // Return structured response
  try {
    // Optional: Validate partial updates if needed using .partial() schema
    // const partialSchema = SubscriptionSchema.partial();
    // const parseResult = partialSchema.safeParse(updates);
    // if (!parseResult.success) { ... handle validation error ... }
    // const validatedUpdates = parseResult.data;

    // Map camelCase to snake_case for the database update
    const updateData: Record<string, any> = {};
    if (updates.milkType !== undefined) updateData.milk_type = updates.milkType;
    if (updates.quantityLiters !== undefined) updateData.quantity_liters = updates.quantityLiters;
    if (updates.deliverySchedule !== undefined) updateData.delivery_schedule = updates.deliverySchedule;
    if (updates.deliveryTime !== undefined) updateData.delivery_time = updates.deliveryTime;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate; 
    if (updates.deliveryAddress !== undefined) updateData.address = updates.deliveryAddress;
    
    if (Object.keys(updateData).length === 0) {
      toast.info('No changes detected to update');
      return { success: true }; // Or success: false, error: 'No changes'? Depends on desired behavior.
    }
    
    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);
    
    if (error) {
      console.error('Error updating subscription:', error.message);
      toast.error('Failed to update subscription', { description: error.message });
      return { success: false, error: error.message };
    }
    
    toast.success('Subscription updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Subscription update failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown update error';
    toast.error('Could not update subscription', { description: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Pauses or resumes a subscription
 */
export async function changeSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'paused' | 'cancelled'
): Promise<{ success: boolean; error?: string }> { // Return structured response
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subscriptionId);
    
    if (error) {
      console.error('Error updating subscription status:', error.message);
      toast.error(`Failed to ${status} subscription`, { description: error.message });
      return { success: false, error: error.message };
    }
    
    const statusMessage = status === 'active' ? 'resumed' : status;
    toast.success(`Subscription ${statusMessage} successfully`);
    return { success: true };
  } catch (error) {
    console.error('Subscription status change failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown status change error';
    toast.error(`Could not ${status} subscription`, { description: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets the upcoming deliveries for a subscription
 */
export async function getUpcomingDeliveries(
  subscriptionId: string,
  limit: number = 7
): Promise<any[]> { // Consider defining a Delivery type
  try {
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();
    
    if (subError || !subscription) {
      console.error('Error fetching subscription details:', subError?.message);
      // Don't show toast here, could be normal if ID is wrong
      return [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    const { data: deliveries, error: delError } = await supabase
      .from('deliveries') // Assume Delivery type
      .select('*')
      .eq('subscription_id', subscriptionId)
      .gte('delivery_date', today)
      .order('delivery_date', { ascending: true })
      .limit(limit);
    
    if (delError) {
      console.error('Error fetching upcoming deliveries:', delError.message);
      toast.error('Failed to load upcoming deliveries', { description: delError.message });
      return [];
    }
    
    return deliveries || [];
  } catch (error) {
    console.error('Failed to fetch upcoming deliveries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching deliveries';
    toast.error('Could not get upcoming deliveries', { description: errorMessage });
    return [];
  }
}

/**
 * Generates upcoming delivery dates based on subscription settings
 * This is used to show users their delivery schedule
 */
export function generateDeliveryDates(
  startDate: string,
  endDate: string | null,
  deliverySchedule: string,
  count: number = 10
): Date[] {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const dates: Date[] = [];
  let currentDate = new Date(start);
  
  while (dates.length < count) {
    // Skip if we've passed the end date
    if (end && currentDate > end) break;
    
    // Add this date to our results
    dates.push(new Date(currentDate));
    
    // Move to next delivery date based on schedule
    switch (deliverySchedule) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'alternate_days':
        currentDate.setDate(currentDate.getDate() + 2);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      default:
        currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return dates;
} 