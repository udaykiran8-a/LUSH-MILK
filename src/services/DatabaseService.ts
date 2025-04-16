/**
 * DatabaseService.ts
 * Centralized service for all database operations in the LUSH MILK application
 */

import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

// Types for database operations
export type User = Tables<'users'>;
export type Customer = Tables<'customers'>;
export type Order = Tables<'orders'>;
export type Product = Tables<'products'>;
export type Payment = Tables<'payments'>;
export type Cart = Tables<'carts'>;
export type CartItem = Tables<'cart_items'>;
export type ProductNotification = Tables<'product_notifications'>;

// User-related database operations
export const UserDatabase = {
  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, customers(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Get customer data by user ID (alias for getUserProfile)
   */
  async getCustomerData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, customers(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, data: data?.customers, error: null };
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, profile: Partial<Customer>) {
    try {
      // Get the customer ID associated with this user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, customers(id)')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!userData?.customers?.id) throw new Error('Customer record not found');

      const customerId = userData.customers.id;

      // Update customer profile
      const { data, error } = await supabase
        .from('customers')
        .update(profile)
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Update customer (alias for updateUserProfile)
   */
  async updateCustomer(userId: string, profileData: Partial<Customer>) {
    return this.updateUserProfile(userId, profileData);
  },

  /**
   * Update user email notification preferences
   */
  async updateEmailPreferences(userId: string, preferences: {
    marketing_emails?: boolean;
    order_notifications?: boolean;
    restock_notifications?: boolean;
  }) {
    try {
      // Get customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, customers(id)')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!userData?.customers?.id) throw new Error('Customer record not found');

      const customerId = userData.customers.id;

      // Update preferences
      const { data, error } = await supabase
        .from('customers')
        .update(preferences)
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Delete user account and associated data
   */
  async deleteUserAccount(userId: string) {
    try {
      // First get the auth_uid to delete from auth.users later
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('auth_uid')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      const authUid = userData?.auth_uid;

      // Delete the user from the database (cascades to customer, orders, etc.)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Delete from auth.users if auth_uid was found
      if (authUid) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
          authUid
        );
        if (authError) throw authError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { success: false, error };
    }
  },

  /**
   * Ensure a customer record exists for the user
   */
  async ensureCustomerExists(userId: string, email: string) {
    try {
      // Check if customer exists
      const { data: existingCustomer, error: checkError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingCustomer) {
        return { 
          success: true, 
          customerId: existingCustomer.id, 
          created: false, 
          error: null 
        };
      }

      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({ 
          user_id: userId, 
          email: email,
          marketing_consent: false,
          order_notifications: true,
          restock_notifications: false
        })
        .select()
        .single();

      if (createError) throw createError;

      return { 
        success: true, 
        customerId: newCustomer.id, 
        created: true, 
        error: null 
      };
    } catch (error) {
      console.error('Error ensuring customer exists:', error);
      return { success: false, customerId: null, created: false, error };
    }
  }
};

// Order-related database operations
export const OrderDatabase = {
  /**
   * Create a new order
   */
  async createOrder(orderData: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, orderId: data?.id, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, orderId: null, error };
    }
  },

  /**
   * Add items to an order
   */
  async addOrderItems(orderId: string, items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    product_name: string;
  }>) {
    try {
      // Create items with order_id
      const itemsWithOrderId = items.map(item => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_name: item.product_name
      }));
      
      const { data, error } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)
        .select();
        
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error adding order items:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Get order history for a user
   */
  async getOrderHistory(userId: string) {
    try {
      // First get the customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('customers(id)')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      const customerId = userData?.customers?.id;
      
      if (!customerId) {
        return { success: false, data: [], error: new Error('Customer not found') };
      }

      // Now get the orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error fetching order history:', error);
      return { success: false, data: [], error };
    }
  }
};

// Product-related database operations
export const ProductDatabase = {
  /**
   * Get all products with optional filtering
   */
  async getProducts(options?: {
    inStockOnly?: boolean;
    milkType?: string;
    popularOnly?: boolean;
  }) {
    try {
      let query = supabase.from('products').select('*');

      // Apply filters if provided
      if (options?.inStockOnly) {
        query = query.eq('in_stock', true);
      }
      
      if (options?.milkType) {
        query = query.eq('milk_type', options.milkType);
      }
      
      if (options?.popularOnly) {
        query = query.eq('popular', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, data: [], error };
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Subscribe to product restock notifications
   */
  async subscribeToRestockNotification(customerId: string, productId: string) {
    try {
      // Check if already subscribed
      const { data: existing, error: checkError } = await supabase
        .from('product_notifications')
        .select('id')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .eq('type', 'restock')
        .single();

      if (existing?.id) {
        // Already subscribed, just update the status if needed
        const { data, error } = await supabase
          .from('product_notifications')
          .update({ status: 'pending' })
          .eq('id', existing.id)
          .select()
          .single();
          
        if (error) throw error;
        return { success: true, data, error: null };
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('product_notifications')
        .insert({
          customer_id: customerId,
          product_id: productId,
          type: 'restock',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error subscribing to restock notification:', error);
      return { success: false, data: null, error };
    }
  },
  
  /**
   * Unsubscribe from product restock notifications
   */
  async unsubscribeFromRestockNotification(customerId: string, productId: string) {
    try {
      const { error } = await supabase
        .from('product_notifications')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .eq('type', 'restock');

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error unsubscribing from restock notification:', error);
      return { success: false, error };
    }
  }
};

// Payment-related database operations
export const PaymentDatabase = {
  /**
   * Create a new payment record
   */
  async createPayment(paymentData: Partial<Payment>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, paymentId: data?.id, error: null };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, paymentId: null, error };
    }
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return { success: false, data: [], error };
    }
  }
};

// Cart-related database operations
export const CartDatabase = {
  /**
   * Get active cart for a customer
   */
  async getActiveCart(customerId: string) {
    try {
      // Check for existing active cart
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('*, cart_items(*)')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .maybeSingle();
        
      // Handle case where no cart is found
      if (cartError) {
        const errorMessage = cartError.message || 'Error getting cart';
        if (errorMessage.includes('PGRST116')) {
          // No active cart found, create one
          return this.createCart(customerId);
        }
        throw cartError;
      }
        
      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', existingCart.id);

      if (itemsError) throw itemsError;

      // Return cart with items
      return {
        success: true,
        data: {
          ...existingCart,
          items: cartItems
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting active cart:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Add item to cart
   */
  async addCartItem(cartId: string, productId: string, quantity: number) {
    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data, error: null };
      }

      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Remove item from cart
   */
  async removeCartItem(cartItemId: string) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return { success: false, error };
    }
  },

  /**
   * Clear cart
   */
  async clearCart(cartId: string) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error };
    }
  },

  /**
   * Mark cart as abandoned
   * This updates the cart status and sets its last_updated time
   */
  async markCartAsAbandoned(cartId: string) {
    try {
      const { data, error } = await supabase
        .from('carts')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error marking cart as abandoned:', error);
      return { success: false, data: null, error };
    }
  },

  /**
   * Convert cart to order
   */
  async convertCartToOrder(cartId: string, orderData: Partial<Order>) {
    try {
      // Start a transaction (simulated with multiple operations)
      
      // 1. Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', cartId);

      if (itemsError) throw itemsError;
      if (!cartItems.length) throw new Error('Cart is empty');

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Convert cart items to order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products.price_1l, // Assuming this is the main price
        product_name: item.products.milk_type
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // 4. Clear the cart (mark as converted)
      const { error: cartUpdateError } = await supabase
        .from('carts')
        .update({
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (cartUpdateError) throw cartUpdateError;

      return { success: true, orderId: order.id, error: null };
    } catch (error) {
      console.error('Error converting cart to order:', error);
      return { success: false, orderId: null, error };
    }
  }
}; 