import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderDatabase, PaymentDatabase } from './DatabaseService';
import { sendOrderConfirmation } from './EmailService';
import { formatDate } from '@/lib/utils';

export interface OrderDetails {
  user_id: string;
  customer_id: string;
  total_amount: number;
  items: OrderItem[];
  delivery_address: string;
  status?: string;
  milk_type: string;
  fat_percentage: number;
  snf_percentage: number;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_description?: string;
}

export interface PaymentDetails {
  amount: number;
  payment_method: string;
  payment_token?: string;
  status?: string;
  payment_gateway: string;
  transaction_id: string;
}

/**
 * Creates a new order in the database
 */
export async function createOrder(orderDetails: OrderDetails): Promise<any> {
  try {
    // Make sure we're using only valid fields
    const orderData = {
      // Properly map fields to match the database schema
      customer_id: orderDetails.customer_id, // Instead of user_id
      // ... include other valid fields here
      status: orderDetails.status || 'pending',
      milk_type: orderDetails.milk_type,
      fat_percentage: orderDetails.fat_percentage,
      snf_percentage: orderDetails.snf_percentage
    };

    // Create the order in the database
    const { success, orderId, error } = await OrderDatabase.createOrder(orderData);
    
    if (!success) throw error;
    return { success, orderId };
  } catch (error) {
    console.error('Error creating order:', error);
    toast.error('Failed to create your order. Please try again.');
    return { success: false, error };
  }
}

/**
 * Updates the payment status and order status accordingly
 */
export async function processPayment(orderId: string, paymentDetails: PaymentDetails): Promise<any> {
  try {
    // Properly map payment fields to match the database schema
    const paymentData = {
      order_id: orderId,
      amount: paymentDetails.amount,
      payment_mode: paymentDetails.payment_method, // Correct field name mapping
      payment_gateway: paymentDetails.payment_gateway,
      transaction_id: paymentDetails.transaction_id,
      status: 'processing'
    };

    // Process the payment
    const { success, paymentId, error } = await PaymentDatabase.createPayment(paymentData);
    
    if (!success) throw error;
    return { success, paymentId };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error };
  }
}

/**
 * Retrieves order history for a user
 */
export async function getOrderHistory(userId: string) {
  try {
    const orders = await OrderDatabase.getOrderHistory(userId);
    return orders;
  } catch (error) {
    console.error('Error fetching order history:', error);
    toast.error('Failed to load order history');
    return [];
  }
} 