import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

// Zod schema for cart item validation
const CartItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(1, "Product name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  image: z.string().url("Valid image URL is required"),
  isSubscription: z.boolean().optional()
});

export type CartItem = z.infer<typeof CartItemSchema>;

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart data from localStorage
        return Array.isArray(parsedCart) 
          ? parsedCart.filter(item => {
              try {
                CartItemSchema.parse(item);
                return true;
              } catch (error) {
                console.error('Invalid cart item removed:', item, error);
                return false;
              }
            })
          : [];
      }
      return [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
      toast.error('Failed to save cart', {
        description: 'Your cart items may not persist. Please try again.'
      });
    }
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    try {
      // Validate the item before adding
      const validatedItem = CartItemSchema.parse({...item, quantity: 1});
      
      setItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);
        if (existingItem) {
          return prevItems.map(i => 
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevItems, { ...validatedItem, quantity: 1 }];
      });
    } catch (error) {
      console.error('Invalid item, not adding to cart:', error);
      toast.error('Could not add item to cart', {
        description: 'The item data is invalid. Please try again.'
      });
    }
  };

  const removeFromCart = (id: number | string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    // Validate quantity is a positive integer
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error('Invalid quantity', {
        description: 'Quantity must be a positive whole number'
      });
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
