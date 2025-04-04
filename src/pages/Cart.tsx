
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();

  const handleCheckout = () => {
    toast.success('This feature is coming soon!', {
      description: 'The checkout system is under development.',
      action: {
        label: 'Dismiss',
        onClick: () => console.log('Dismissed')
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-lushmilk-brown">Your Cart</h1>
          <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link to="/products">
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-medium text-gray-400 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90">
              <Link to="/products">Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div 
                  key={item.id}
                  className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  layoutId={`cart-item-${item.id}`}
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-lushmilk-brown">
                      <h3>{item.name}</h3>
                      <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">₹{item.price.toFixed(2)} per unit</p>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          className="p-1 text-gray-500 hover:text-gray-700"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-2 py-1 text-gray-700">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-1 text-gray-500 hover:text-gray-700"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm h-fit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-base">
                  <p>Subtotal</p>
                  <p>₹{total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base">
                  <p>Delivery</p>
                  <p className="text-green-600">Free</p>
                </div>
              </div>
              <div className="flex justify-between text-lg font-medium mb-6">
                <p>Total</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
              <Button
                className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
