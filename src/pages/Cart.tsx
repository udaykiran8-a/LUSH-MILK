import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ArrowRight, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from "@/components/ui/separator"
import SecureCheckoutForm from '@/components/SecureCheckoutForm';

const CartItemCard = ({ item, updateQuantity, removeFromCart }: any) => {
  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center">
        <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded-md mr-4" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-600">₹{(item.price * 70).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-3 py-2 hover:bg-gray-100 focus:outline-none"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="px-4 text-gray-700">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-3 py-2 hover:bg-gray-100 focus:outline-none"
          >
            +
          </button>
        </div>
        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-600 focus:outline-none">
          <XCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

const EmptyCartMessage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
    <p className="text-gray-500">Add items to your cart to proceed to checkout.</p>
    <Link to="/products">
      <Button className="mt-6 bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white">
        Continue Shopping
      </Button>
    </Link>
  </div>
);

const Cart = () => {
  const { items: cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

  const cartTotal = getCartTotal();

  return (
    <Layout>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-serif font-bold text-lushmilk-richbrown mb-2">Shopping Cart</h1>
            <p className="text-lushmilk-brown text-lg">Review your order and proceed to checkout.</p>
          </motion.div>

          {cartItems.length === 0 ? (
            <EmptyCartMessage />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                  />
                ))}
                <Button onClick={clearCart} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
                  Clear Cart
                </Button>
              </div>

              <div className="mt-6 lg:mt-0 lg:w-1/3">
                <SecureCheckoutForm />
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
