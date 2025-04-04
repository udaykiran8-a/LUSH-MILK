
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, CreditCard, Calendar, ShieldCheck } from 'lucide-react';
import { encryptPaymentData, maskCardNumber, createPaymentToken } from '@/utils/paymentEncryption';
import { motion } from 'framer-motion';

const SecureCheckoutForm = () => {
  const { getCartTotal, clearCart } = useCart();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSecurityBadge, setShowSecurityBadge] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    
    // Format with spaces every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    const limitedDigits = digits.slice(0, 4);
    
    // Format as MM/YY
    if (limitedDigits.length > 2) {
      return `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}`;
    }
    
    return limitedDigits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow up to 3 digits for CVV
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setShowSecurityBadge(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Encrypt payment data
      const paymentData = {
        cardNumber,
        cardName,
        expiryDate,
        amount: getCartTotal(),
        timestamp: Date.now(),
      };
      
      const encryptedData = encryptPaymentData(paymentData);
      const userId = 'user-' + Math.random().toString(36).substring(2, 9);
      const paymentToken = createPaymentToken(userId, Date.now());
      
      console.log('Encrypted payment data:', encryptedData);
      console.log('Payment token:', paymentToken);
      
      // Clear the cart after successful payment
      clearCart();
      
      // Show success message
      toast.success('Payment processed successfully!', {
        description: `Your order has been placed. Payment of ₹${getCartTotal() * 70} confirmed.`,
        duration: 5000,
      });
      
      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
    } catch (error) {
      toast.error('Payment failed!', {
        description: 'There was an error processing your payment. Please try again.',
      });
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setShowSecurityBadge(false), 3000);
    }
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md border border-lushmilk-cream/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown">Secure Checkout</h2>
        <div className="flex items-center text-lushmilk-green">
          <Lock className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Encrypted & Secure</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="cardName" className="text-lushmilk-brown">Cardholder Name</Label>
          <Input
            id="cardName"
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
            className="border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardNumber" className="text-lushmilk-brown">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
              className="pl-10 border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
            />
            <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-lushmilk-terracotta/60" />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="expiryDate" className="text-lushmilk-brown">Expiry Date</Label>
            <div className="relative">
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                required
                className="pl-10 border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-lushmilk-terracotta/60" />
            </div>
          </div>
          
          <div className="space-y-2 w-1/3">
            <Label htmlFor="cvv" className="text-lushmilk-brown">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={handleCvvChange}
              required
              type="password"
              className="border-lushmilk-cream/50 focus:border-lushmilk-terracotta"
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white py-6"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${getCartTotal() * 70}`}
          </Button>
        </div>
        
        {cardNumber && (
          <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
            <span>Card number will be stored as: {maskCardNumber(cardNumber)}</span>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-4 py-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Encrypted
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> PCI Compliant
          </span>
        </div>
      </form>
      
      {showSecurityBadge && (
        <motion.div
          className="fixed bottom-4 right-4 bg-green-50 text-green-700 p-3 rounded-lg shadow-lg flex items-center gap-2 z-50 border border-green-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Secure Transaction Processing</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SecureCheckoutForm;
