import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductDatabase } from './DatabaseService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  milk_type: string;
  fat_percentage: number;
  region: string;
  in_stock: boolean;
  popular: boolean;
}

export interface ProductPricing {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  discount?: number;
  sale_active?: boolean;
  volume_discount?: boolean;
}

/**
 * Fetches all products with enhancements for UI display
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { data: products, error } = await ProductDatabase.getProducts();
    
    if (error) throw error;
    
    // Enhance products with default values if needed
    return products.map(product => ({
      ...product,
      image: product.image || '/images/default-milk.jpg',
      in_stock: product.in_stock !== false, // Default to true if not specified
      popular: !!product.popular
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    toast.error('Failed to load products');
    return [];
  }
}

/**
 * Fetches a single product by ID
 */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const { data: product, error } = await ProductDatabase.getProductById(productId);
    
    if (error) throw error;
    
    if (!product) {
      toast.error('Product not found');
      return null;
    }
    
    // Enhance product with default values
    return {
      ...product,
      image: product.image || '/images/default-milk.jpg',
      in_stock: product.in_stock !== false
    };
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    toast.error('Failed to load product details');
    return null;
  }
}

/**
 * Fetches products by milk type/category
 */
export async function fetchProductsByCategory(milkType: string): Promise<Product[]> {
  try {
    const { data: products, error } = await ProductDatabase.getProducts({
      milkType: milkType
    });
    
    if (error) throw error;
    
    // Enhance products with default values
    return products.map(product => ({
      ...product,
      image: product.image || '/images/default-milk.jpg',
      in_stock: product.in_stock !== false
    }));
  } catch (error) {
    console.error(`Error fetching products by category ${milkType}:`, error);
    toast.error('Failed to load product category');
    return [];
  }
}

/**
 * Fetches popular products for homepage
 */
export async function fetchPopularProducts(limit: number = 4): Promise<Product[]> {
  try {
    const { data: products, error } = await ProductDatabase.getProducts({
      popularOnly: true
    });
    
    if (error) throw error;
    
    // Limit results and enhance with default values
    return products.slice(0, limit).map(product => ({
      ...product,
      image: product.image || '/images/default-milk.jpg',
      in_stock: product.in_stock !== false
    }));
  } catch (error) {
    console.error('Error fetching popular products:', error);
    // Don't show error toast for this one to avoid UI disruption on homepage
    return [];
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    // Simplify the search to use basic equality checks
    const cleanQuery = query.toLowerCase().trim();
    
    // Fetch all products and filter in memory
    const { data, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) throw error;
    
    // Filter in memory instead of using advanced DB features
    const filteredProducts = (data || []).filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const milkType = (product.milk_type || '').toLowerCase();
      
      return name.includes(cleanQuery) || 
             description.includes(cleanQuery) || 
             milkType.includes(cleanQuery);
    });
    
    // Enhance products with default values
    return filteredProducts.map(product => ({
      ...product,
      image: product.image || '/images/default-milk.jpg',
      in_stock: product.in_stock !== false
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    toast.error('Failed to search products');
    return [];
  }
} 