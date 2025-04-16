import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createSubscription, 
  getCustomerSubscriptions, 
  updateSubscription, 
  changeSubscriptionStatus,
  generateDeliveryDates,
  SubscriptionSchema
} from '../SubscriptionService';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      // Mock successful response
      const mockData = { id: 'mock-subscription-id' };
      const mockResponse = { data: mockData, error: null };
      supabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const validSubscriptionData = {
        customerId: 'customer-123',
        milkType: 'Full Cream',
        quantityLiters: 2,
        deliverySchedule: 'daily' as const,
        deliveryTime: 'morning' as const,
        startDate: new Date().toISOString(),
        deliveryAddress: '123 Main St, Chennai'
      };

      const result = await createSubscription(validSubscriptionData);

      // Assert the supabase functions were called correctly
      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from().insert).toHaveBeenCalled();
      expect(supabase.from().insert().select).toHaveBeenCalled();
      expect(supabase.from().insert().select().single).toHaveBeenCalled();
      
      // Assert the result is the subscription ID
      expect(result).toBe(mockData.id);
    });

    it('should validate subscription data before creating', async () => {
      // Invalid subscription data with missing required fields
      const invalidSubscriptionData = {
        customerId: '',  // Empty string is invalid
        milkType: 'Full Cream',
        quantityLiters: 0,  // Must be positive
        deliverySchedule: 'invalid-schedule' as any,  // Invalid enum value
        deliveryTime: 'morning' as const,
        startDate: 'not-a-date',  // Invalid date format
        deliveryAddress: '123'  // Too short
      };

      // Attempt to create with invalid data should fail validation
      await expect(createSubscription(invalidSubscriptionData as any))
        .resolves.toBeNull();
      
      // Supabase should not be called at all if validation fails
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('getCustomerSubscriptions', () => {
    it('should fetch subscriptions for a customer', async () => {
      // Mock subscription data
      const mockSubscriptions = [
        {
          id: 'sub-1',
          customer_id: 'customer-123',
          milk_type: 'Full Cream',
          quantity_liters: 2,
          status: 'active'
        },
        {
          id: 'sub-2',
          customer_id: 'customer-123',
          milk_type: 'Low Fat',
          quantity_liters: 1,
          status: 'paused'
        }
      ];
      
      // Mock response
      const mockResponse = { data: mockSubscriptions, error: null };
      supabase.from().select().eq().order.mockResolvedValue(mockResponse);

      const customerId = 'customer-123';
      const result = await getCustomerSubscriptions(customerId);

      // Assert the supabase functions were called correctly
      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from().select).toHaveBeenCalled();
      expect(supabase.from().select().eq).toHaveBeenCalledWith('customer_id', customerId);
      expect(supabase.from().select().eq().order).toHaveBeenCalledWith('created_at', { ascending: false });
      
      // Assert the result is the subscriptions array
      expect(result).toEqual(mockSubscriptions);
    });

    it('should handle errors when fetching subscriptions', async () => {
      // Mock error response
      const mockResponse = { data: null, error: new Error('Database error') };
      supabase.from().select().eq().order.mockResolvedValue(mockResponse);

      const customerId = 'customer-123';
      const result = await getCustomerSubscriptions(customerId);

      // Assert an empty array is returned on error
      expect(result).toEqual([]);
    });
  });

  describe('updateSubscription', () => {
    it('should update a subscription successfully', async () => {
      // Mock successful response
      const mockResponse = { error: null };
      supabase.from().update().eq.mockResolvedValue(mockResponse);

      const subscriptionId = 'sub-123';
      const updates = {
        quantityLiters: 3,
        deliverySchedule: 'weekly' as const,
        deliveryAddress: '456 New St, Chennai'
      };

      const result = await updateSubscription(subscriptionId, updates);

      // Assert the supabase functions were called correctly
      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from().update).toHaveBeenCalled();
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', subscriptionId);
      
      // Assert the result is true (success)
      expect(result).toBe(true);
    });
  });

  describe('changeSubscriptionStatus', () => {
    it('should change subscription status successfully', async () => {
      // Mock successful response
      const mockResponse = { error: null };
      supabase.from().update().eq.mockResolvedValue(mockResponse);

      const subscriptionId = 'sub-123';
      const status = 'paused';

      const result = await changeSubscriptionStatus(subscriptionId, status);

      // Assert the supabase functions were called correctly
      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from().update).toHaveBeenCalledWith({ status });
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', subscriptionId);
      
      // Assert the result is true (success)
      expect(result).toBe(true);
    });
  });

  describe('generateDeliveryDates', () => {
    it('should generate correct delivery dates for daily schedule', () => {
      const startDate = '2023-06-01T00:00:00Z';
      const endDate = null;
      const deliverySchedule = 'daily';
      const count = 5;

      const result = generateDeliveryDates(startDate, endDate, deliverySchedule, count);

      // Should return 5 dates
      expect(result.length).toBe(5);
      
      // First date should be the start date
      expect(result[0].toISOString().split('T')[0]).toBe('2023-06-01');
      
      // Subsequent dates should be 1 day apart
      expect(result[1].toISOString().split('T')[0]).toBe('2023-06-02');
      expect(result[2].toISOString().split('T')[0]).toBe('2023-06-03');
      expect(result[3].toISOString().split('T')[0]).toBe('2023-06-04');
      expect(result[4].toISOString().split('T')[0]).toBe('2023-06-05');
    });

    it('should generate correct delivery dates for alternate_days schedule', () => {
      const startDate = '2023-06-01T00:00:00Z';
      const endDate = null;
      const deliverySchedule = 'alternate_days';
      const count = 3;

      const result = generateDeliveryDates(startDate, endDate, deliverySchedule, count);

      // Should return 3 dates
      expect(result.length).toBe(3);
      
      // Dates should be 2 days apart
      expect(result[0].toISOString().split('T')[0]).toBe('2023-06-01');
      expect(result[1].toISOString().split('T')[0]).toBe('2023-06-03');
      expect(result[2].toISOString().split('T')[0]).toBe('2023-06-05');
    });

    it('should generate correct delivery dates for weekly schedule', () => {
      const startDate = '2023-06-01T00:00:00Z';
      const endDate = null;
      const deliverySchedule = 'weekly';
      const count = 3;

      const result = generateDeliveryDates(startDate, endDate, deliverySchedule, count);

      // Should return 3 dates
      expect(result.length).toBe(3);
      
      // Dates should be 7 days apart
      expect(result[0].toISOString().split('T')[0]).toBe('2023-06-01');
      expect(result[1].toISOString().split('T')[0]).toBe('2023-06-08');
      expect(result[2].toISOString().split('T')[0]).toBe('2023-06-15');
    });

    it('should respect end date when generating delivery dates', () => {
      const startDate = '2023-06-01T00:00:00Z';
      const endDate = '2023-06-05T00:00:00Z'; // End date is June 5th
      const deliverySchedule = 'daily';
      const count = 10; // Ask for 10 dates

      const result = generateDeliveryDates(startDate, endDate, deliverySchedule, count);

      // Should only return 5 dates (June 1 to June 5)
      expect(result.length).toBe(5);
      
      // Last date should be the end date
      expect(result[result.length - 1].toISOString().split('T')[0]).toBe('2023-06-05');
    });
  });

  describe('SubscriptionSchema', () => {
    it('should validate valid subscription data', () => {
      const validData = {
        customerId: 'customer-123',
        milkType: 'Full Cream',
        quantityLiters: 2,
        deliverySchedule: 'daily' as const,
        deliveryTime: 'morning' as const,
        startDate: new Date().toISOString(),
        deliveryAddress: '123 Main St, Chennai'
      };

      const result = SubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid subscription data', () => {
      const invalidData = {
        customerId: '', // Empty
        milkType: 'Full Cream',
        quantityLiters: -1, // Negative
        deliverySchedule: 'invalid' as any,
        deliveryTime: 'noon' as any,
        startDate: 'not-a-date',
        deliveryAddress: ''
      };

      const result = SubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
}); 