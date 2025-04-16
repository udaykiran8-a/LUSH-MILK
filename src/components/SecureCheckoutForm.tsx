import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, CreditCard, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import ErrorBoundary from '@/components/ErrorBoundary';
import { createOrder } from '@/services/OrderService';
import StripeService from '@/services/StripeService';

// Define proper interface for card element
interface CardElement {
  mount: (selector: string) => void;
  on: (event: string, handler: (event: any) => void) => void;
  unmount: () => void;
}

// Define proper interface for user profile
interface UserProfile {
  name?: string; // Use the correct property name
  email?: string;
  auth_uid?: string;
}

const SecureCheckoutForm = () => {
  const { getCartTotal, clearCart, items } = useCart();
  const { user, userProfile } = useAuth();
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [cardElement, setCardElement] = useState<CardElement | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  
  // Get cart total
  const cartTotal = getCartTotal();
  
  // Load Stripe.js when component mounts
  useEffect(() => {
    // Initialize the Stripe service
    StripeService.initialize();
    
    // Load Stripe.js
    let isMounted = true;
    const loadStripe = async () => {
      try {
        const stripeInstance = await (window as any).Stripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        );
        if (isMounted) {
          setStripe(stripeInstance);
        }
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        if (isMounted) {
          setError('Payment system unavailable. Please try again later.');
        }
      }
    };
    
    // Wait until Stripe.js is loaded
    if ((window as any).Stripe) {
      loadStripe();
    } else {
      document.querySelector('#stripe-js')?.addEventListener('load', loadStripe);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Initialize card element
  useEffect(() => {
    if (!stripe) return;
    
    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });
    
    card.mount('#card-element');
    setCardElement(card);
    
    // Handle real-time validation errors
    card.on('change', (event: any) => {
      setCardComplete(event.complete);
      setError(event.error ? event.error.message : '');
    });
    
    return () => {
      card.unmount();
    };
  }, [stripe]);
  
  // Create payment intent when cart total changes
  useEffect(() => {
    if (cartTotal <= 0 || !stripe) return;
    
    const createIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'idempotency-key': uuidv4() // Prevent duplicate charges
          },
          body: JSON.stringify({
            amount: cartTotal,
            currency: 'inr',
            orderId: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            customerId: user?.id || 'guest',
            description: `LUSH MILK Order - ${items.length} items`,
            receipt_email: userProfile?.email
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError('Unable to initialize payment. Please try again.');
      }
    };
    
    createIntent();
  }, [cartTotal, stripe, user?.id, userProfile?.email, items.length]);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !cardElement || !clientSecret) {
      setError('Payment system is not ready. Please try again.');
      return;
    }
    
    if (processing || succeeded) return;
    
    setProcessing(true);
    setError(null);
    
    // Validate address
    if (!address.trim()) {
      setError('Please enter your delivery address');
      setProcessing(false);
      return;
    }
    
    try {
      // Create order in database first (which will be updated after payment)
      const orderId = await createOrder({
        user_id: user?.id || '',
        customer_id: userProfile?.auth_uid || '',
        total_amount: cartTotal,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          product_name: item.name
        })),
        delivery_address: address,
        status: 'pending_payment',
        milk_type: items[0]?.type || 'standard',
        fat_percentage: items[0]?.fatPercentage || 3.5,
        snf_percentage: items[0]?.snfPercentage || 8.5
      });
      
      if (!orderId) {
        throw new Error('Failed to create order');
      }
      
      // Process the payment with Stripe (3D Secure where required)
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userProfile?.name || user?.email || 'Customer',
            email: userProfile?.email || user?.email,
            address: {
              line1: address.split(',')[0] || address,
              city: address.split(',')[1] || '',
              country: 'IN' // Default to India for LUSH MILK
            }
          }
        },
        receipt_email: userProfile?.email || user?.email
      });
      
      if (confirmError) {
        // Handle specific payment errors
        throw new Error(confirmError.message);
      }
      
      // Payment succeeded
      if (paymentIntent.status === 'succeeded') {
        // Clear cart after successful payment
        clearCart();
        
        // Show success message
        toast.success('Payment processed successfully!', {
          description: `Your order has been placed. Payment of ₹${cartTotal.toFixed(2)} confirmed.`,
          duration: 5000,
        });
        
        setSucceeded(true);
        setProcessing(false);
        
        // Reset form
        setAddress('');
      } else if (paymentIntent.status === 'requires_action') {
        // The payment requires additional actions (like 3D Secure)
        // This should be handled automatically by Stripe.js
        toast.info('Additional verification required', {
          description: 'Please complete the security verification to proceed with your payment.',
        });
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}. Please try again.`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      toast.error('Payment failed', {
        description: error.message || 'Please try again or use a different payment method.',
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };
  
  if (succeeded) {
    return (
      <div className="rounded-lg border p-6 shadow-sm bg-white text-center">
        <div className="mb-4 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your order has been placed and will be delivered soon.
        </p>
        <Button 
          className="mt-2" 
          onClick={() => window.location.href = '/account?tab=orders'}
        >
          View Your Orders
        </Button>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-lushmilk-terracotta" />
        Secure Checkout
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label className="text-lushmilk-brown">Delivery Address</Label>
            <Input
              placeholder="Enter your full delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
            />
          </div>
          
          <div>
            <Label className="text-lushmilk-brown">Card Details</Label>
            <div 
              id="card-element" 
              className="p-3 border rounded-md border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
            />
            {error && (
              <div className="text-red-500 text-sm mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {error}
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90"
              disabled={!stripe || !cardComplete || processing}
            >
              {processing ? 'Processing...' : `Pay ₹${cartTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </form>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CreditCard className="h-3 w-3" />
          <span>Visa, Mastercard, RuPay accepted</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500">Secure payment</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <img 
          src="/images/stripe-secure-badge.png" 
          alt="Secure payments powered by Stripe" 
          className="inline-block h-6"
        />
      </div>
    </div>
  );
};

export default SecureCheckoutForm;
