/**
 * Test Utilities for LUSH MILK Application
 * 
 * This file contains utilities for test data seeding, mocking,
 * performance testing, and error simulation.
 */

import { supabase } from '../integrations/supabase/client';
import { User, Customer, Product, Order, Payment } from '../services/DatabaseService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed Data Functions
 */
export const TestSeeder = {
  /**
   * Seed a test user with customer profile
   */
  async seedTestUser(): Promise<{ userId: string, email: string, customerId: string }> {
    const userId = uuidv4();
    const email = `test-${userId.substring(0, 8)}@example.com`;
    
    // Create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        auth_uid: `test-auth-${userId}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (userError) throw userError;
    
    // Create customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        email: email,
        full_name: 'Test User',
        marketing_consent: false,
        order_notifications: true,
        restock_notifications: false
      })
      .select()
      .single();
      
    if (customerError) throw customerError;
    
    return {
      userId,
      email,
      customerId: customerData.id
    };
  },
  
  /**
   * Seed test products
   */
  async seedTestProducts(count: number = 5): Promise<string[]> {
    const products = Array.from({ length: count }, (_, i) => ({
      name: `Test Milk ${i + 1}`,
      milk_type: ['Cow', 'Almond', 'Oat', 'Soy', 'Coconut'][i % 5],
      price_1l: (2.99 + i * 0.5),
      price_250ml: (0.99 + i * 0.25),
      price_500ml: (1.99 + i * 0.25),
      in_stock: (i % 3) !== 0, // Some out of stock
      popular: (i % 2) === 0, // Some popular
      image: `https://placeholder.com/milk_${i + 1}.jpg`,
      description: `Delicious test milk ${i + 1}`,
      fat_percentage: Math.floor(Math.random() * 5) + 1,
      snf_range: "8-9%",
      region: "Test Region"
    }));
    
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select('id');
      
    if (error) throw error;
    
    return data.map(p => p.id);
  },
  
  /**
   * Seed test orders with items
   */
  async seedOrderHistory(customerId: string, productIds: string[]): Promise<string[]> {
    const orderCount = Math.min(3, productIds.length);
    const orderIds: string[] = [];
    
    for (let i = 0; i < orderCount; i++) {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          status: ['pending', 'processing', 'completed'][i % 3],
          total_amount: (10 + i * 5),
          milk_type: ['Cow', 'Almond', 'Oat'][i % 3],
          fat_percentage: Math.floor(Math.random() * 5) + 1,
          snf_percentage: Math.floor(Math.random() * 3) + 8,
          created_at: new Date(Date.now() - i * 86400000).toISOString(), // Days ago
          delivered_at: i === 2 ? new Date().toISOString() : null,
          delivery_person: i === 2 ? "Test Delivery Person" : null,
          vehicle: i === 2 ? "Test Vehicle" : null,
          cancelled_reason: ""
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      orderIds.push(order.id);
      
      // Add order items (2 per order)
      const orderItems = [
        {
          order_id: order.id,
          product_id: productIds[i % productIds.length],
          quantity: 1 + (i % 3),
          unit_price: 2.99,
          product_name: `Test Product ${i}`
        },
        {
          order_id: order.id,
          product_id: productIds[(i + 1) % productIds.length],
          quantity: 1,
          unit_price: 3.99,
          product_name: `Test Product ${i + 1}`
        }
      ];
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
    }
    
    return orderIds;
  },
  
  /**
   * Clean up test data
   */
  async cleanupTestData(userId: string): Promise<void> {
    // Delete user (should cascade to customer, orders, etc.)
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
  }
};

/**
 * Mock Database Functions
 * For offline testing when database is unavailable
 */
export const MockDatabase = {
  // Mock data storage
  _mockData: {
    users: new Map<string, User>(),
    customers: new Map<string, Customer>(),
    products: new Map<string, Product>(),
    orders: new Map<string, Order>(),
    payments: new Map<string, Payment>()
  },
  
  /**
   * Reset all mock data
   */
  reset(): void {
    this._mockData.users.clear();
    this._mockData.customers.clear();
    this._mockData.products.clear();
    this._mockData.orders.clear();
    this._mockData.payments.clear();
  },
  
  /**
   * Seed mock data with test values
   */
  seedMockData(): void {
    // Add mock users
    const userId = 'mock-user-1';
    const customerId = 'mock-customer-1';
    
    this._mockData.users.set(userId, {
      id: userId,
      email: 'mock@example.com',
      auth_uid: 'mock-auth-1',
      created_at: new Date().toISOString()
    } as User);
    
    this._mockData.customers.set(customerId, {
      id: customerId,
      user_id: userId,
      email: 'mock@example.com',
      full_name: 'Mock User',
      marketing_consent: false,
      order_notifications: true,
      restock_notifications: false
    } as Customer);
    
    // Add mock products
    for (let i = 0; i < 5; i++) {
      const productId = `mock-product-${i + 1}`;
      this._mockData.products.set(productId, {
        id: productId,
        name: `Mock Milk ${i + 1}`,
        milk_type: ['Cow', 'Almond', 'Oat', 'Soy', 'Coconut'][i % 5],
        price_1l: (2.99 + i * 0.5),
        price_250ml: (0.99 + i * 0.25),
        price_500ml: (1.99 + i * 0.25),
        in_stock: (i % 3) !== 0,
        popular: (i % 2) === 0,
        image: `https://placeholder.com/milk_${i + 1}.jpg`,
        description: `Delicious mock milk ${i + 1}`,
        fat_percentage: Math.floor(Math.random() * 5) + 1,
        snf_range: "8-9%",
        region: "Test Region"
      } as unknown as Product);
    }
    
    // Add mock orders
    for (let i = 0; i < 3; i++) {
      const orderId = `mock-order-${i + 1}`;
      this._mockData.orders.set(orderId, {
        id: orderId,
        customer_id: customerId,
        status: ['pending', 'processing', 'completed'][i % 3],
        total_amount: (10 + i * 5),
        milk_type: ['Cow', 'Almond', 'Oat'][i % 3],
        fat_percentage: Math.floor(Math.random() * 5) + 1,
        snf_percentage: Math.floor(Math.random() * 3) + 8,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        delivered_at: i === 2 ? new Date().toISOString() : null,
        delivery_person: i === 2 ? "Test Delivery Person" : null,
        vehicle: i === 2 ? "Test Vehicle" : null,
        cancelled_reason: ""
      } as unknown as Order);
    }
  },
  
  /**
   * Get user by ID (mock implementation)
   */
  getUserProfile(userId: string) {
    const user = this._mockData.users.get(userId);
    if (!user) {
      return { success: false, data: null, error: 'User not found' };
    }
    
    let customer = null;
    for (const [id, cust] of this._mockData.customers.entries()) {
      if (cust.user_id === userId) {
        customer = cust;
        break;
      }
    }
    
    return {
      success: true,
      data: { ...user, customers: customer },
      error: null
    };
  }
  
  // Add more mock methods as needed
};

/**
 * Performance Testing Utilities
 */
export const PerformanceTesting = {
  /**
   * Benchmark a database function
   * @param operationName Name of the operation being tested
   * @param operation Function to benchmark
   * @param iterations Number of times to run the operation
   */
  async benchmark<T>(
    operationName: string,
    operation: () => Promise<T>,
    iterations: number = 10
  ): Promise<{ operationName: string, averageMs: number, results: T[] }> {
    console.log(`Benchmarking ${operationName} (${iterations} iterations)...`);
    
    const startTime = Date.now();
    const results: T[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await operation();
      results.push(result);
    }
    
    const endTime = Date.now();
    const totalMs = endTime - startTime;
    const averageMs = totalMs / iterations;
    
    console.log(`${operationName}: ${averageMs.toFixed(2)}ms average (${totalMs}ms total for ${iterations} iterations)`);
    
    return {
      operationName,
      averageMs,
      results
    };
  }
};

/**
 * Error Simulation Utilities
 */
export const ErrorSimulation = {
  /**
   * Simulate network errors by temporarily replacing Supabase client
   */
  simulateNetworkError(probability: number = 1): void {
    const originalFrom = supabase.from;
    
    // Replace with error-generating version
    (supabase as any).from = function(table: string) {
      if (Math.random() < probability) {
        return {
          select: () => Promise.resolve({ data: null, error: { message: 'Simulated network error', code: 'NETWORK_ERROR' } }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Simulated network error', code: 'NETWORK_ERROR' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Simulated network error', code: 'NETWORK_ERROR' } }),
          delete: () => Promise.resolve({ data: null, error: { message: 'Simulated network error', code: 'NETWORK_ERROR' } }),
        };
      }
      
      return originalFrom.call(supabase, table);
    };
  },
  
  /**
   * Restore original Supabase client
   */
  restoreNormalOperation(): void {
    // Implementation would restore original Supabase client
    // This is a simplified version - actual implementation would need
    // to preserve a reference to the original client
    console.log('Restoring normal database operation');
  }
}; 