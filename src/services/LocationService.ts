import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Define types for location data
export interface DeliveryLocation {
  id?: string;
  customer_id: string;
  address: string;
  lat?: number;
  lng?: number;
  is_default: boolean;
}

// Define serving regions with bounds
export interface Region {
  id: string;
  name: string;
  isActive: boolean;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Service regions currently supported for delivery
const serviceRegions: Region[] = [
  {
    id: 'chennai-central',
    name: 'Chennai Central',
    isActive: true,
    bounds: {
      north: 13.1989,
      south: 12.9141,
      east: 80.3932,
      west: 80.1288
    }
  },
  {
    id: 'chennai-south',
    name: 'Chennai South',
    isActive: true,
    bounds: {
      north: 12.9659,
      south: 12.8341,
      east: 80.2736,
      west: 80.1623
    }
  },
  // Add more regions as service expands
];

/**
 * Check if a given location is within our delivery boundaries
 */
export function isLocationServiceable(lat: number, lng: number): boolean {
  return serviceRegions
    .filter(region => region.isActive)
    .some(region => {
      const { bounds } = region;
      return (
        lat <= bounds.north &&
        lat >= bounds.south &&
        lng <= bounds.east &&
        lng >= bounds.west
      );
    });
}

/**
 * Get service region for a location
 */
export function getServiceRegion(lat: number, lng: number): Region | null {
  return serviceRegions
    .filter(region => region.isActive)
    .find(region => {
      const { bounds } = region;
      return (
        lat <= bounds.north &&
        lat >= bounds.south &&
        lng <= bounds.east &&
        lng >= bounds.west
      );
    }) || null;
}

/**
 * Validate address and get coordinates using geocoding API
 */
export async function validateAddress(address: string): Promise<{isValid: boolean; lat?: number; lng?: number; message?: string}> {
  try {
    // In a real implementation, this would call a geocoding API like Google Maps
    // For demo purposes, we'll simulate successful validation
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock coordinates for demo
    const mockCoordinates = {
      lat: 13.0827,
      lng: 80.2707
    };
    
    // Check if these coordinates are in our delivery zone
    if (isLocationServiceable(mockCoordinates.lat, mockCoordinates.lng)) {
      return {
        isValid: true,
        lat: mockCoordinates.lat,
        lng: mockCoordinates.lng
      };
    } else {
      return {
        isValid: false,
        message: "Sorry, we don't deliver to this location yet."
      };
    }
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      isValid: false,
      message: "Could not validate address. Please try again."
    };
  }
}

/**
 * Save a new delivery location for a customer
 */
export async function saveDeliveryLocation(location: DeliveryLocation): Promise<string | null> {
  try {
    // If this is set as default, unset any existing default
    if (location.is_default) {
      await supabase
        .from('delivery_locations')
        .update({ is_default: false })
        .eq('customer_id', location.customer_id);
    }
    
    // Save the new location
    const { data, error } = await supabase
      .from('delivery_locations')
      .insert(location)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving delivery location:', error);
      toast.error('Failed to save delivery location');
      return null;
    }
    
    toast.success('Delivery location saved');
    return data.id;
  } catch (error) {
    console.error('Error in saveDeliveryLocation:', error);
    toast.error('Could not save delivery location');
    return null;
  }
}

/**
 * Get all delivery locations for a customer
 */
export async function getDeliveryLocations(customerId: string): Promise<DeliveryLocation[]> {
  try {
    const { data, error } = await supabase
      .from('delivery_locations')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });
    
    if (error) {
      console.error('Error fetching delivery locations:', error);
      toast.error('Failed to load delivery locations');
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDeliveryLocations:', error);
    toast.error('Could not retrieve delivery locations');
    return [];
  }
}

/**
 * Get default delivery location for a customer
 */
export async function getDefaultDeliveryLocation(customerId: string): Promise<DeliveryLocation | null> {
  try {
    const { data, error } = await supabase
      .from('delivery_locations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_default', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching default delivery location:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDefaultDeliveryLocation:', error);
    return null;
  }
}

/**
 * Delete a delivery location
 */
export async function deleteDeliveryLocation(locationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('delivery_locations')
      .delete()
      .eq('id', locationId);
    
    if (error) {
      console.error('Error deleting delivery location:', error);
      toast.error('Failed to delete delivery location');
      return false;
    }
    
    toast.success('Delivery location deleted');
    return true;
  } catch (error) {
    console.error('Error in deleteDeliveryLocation:', error);
    toast.error('Could not delete delivery location');
    return false;
  }
} 