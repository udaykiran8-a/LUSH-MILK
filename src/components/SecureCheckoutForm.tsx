
import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, CreditCard, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import { 
  encryptPaymentData, 
  maskCardNumber, 
  createPaymentToken,
  validatePaymentToken
} from '@/utils/paymentEncryption';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

// Regular expressions for validation
const CARD_NUMBER_REGEX = /^[\d\s]{16,19}$/;
const CVV_REGEX = /^\d{3,4}$/;
const EXPIRY_DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;

const SecureCheckoutForm = () => {
  const { getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSecurityBadge, setShowSecurityBadge] = useState(false);
  
  // Form validation states
  const [formErrors, setFormErrors] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Security token state
  const [securityToken, setSecurityToken] = useState<{
    token: string;
    timestamp: number;
    expires: number;
  } | null>(null);
  
  // Generate a security token on component mount
  useEffect(() => {
    if (user) {
      const timestamp = Date.now();
      const tokenData = createPaymentToken(user.id, timestamp);
      setSecurityToken({
        token: tokenData.token,
        timestamp,
        expires: tokenData.expires
      });
    }
  }, [user]);

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
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    
    // Validate card number
    if (formattedValue && !CARD_NUMBER_REGEX.test(formattedValue)) {
      setFormErrors(prev => ({
        ...prev, 
        cardNumber: 'Please enter a valid 16-digit card number'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
    
    // Validate expiry date
    if (formattedValue && !EXPIRY_DATE_REGEX.test(formattedValue)) {
      setFormErrors(prev => ({
        ...prev, 
        expiryDate: 'Please enter a valid expiry date (MM/YY)'
      }));
    } else if (formattedValue) {
      // Check if card is expired
      const [month, year] = formattedValue.split('/');
      const expiryDate = new Date();
      expiryDate.setFullYear(2000 + parseInt(year, 10), parseInt(month, 10) - 1, 1);
      
      if (expiryDate < new Date()) {
        setFormErrors(prev => ({
          ...prev, 
          expiryDate: 'This card has expired'
        }));
      } else {
        setFormErrors(prev => ({ ...prev, expiryDate: '' }));
      }
    } else {
      setFormErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow up to 3 digits for CVV
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
    
    // Validate CVV
    if (value && !CVV_REGEX.test(value)) {
      setFormErrors(prev => ({
        ...prev, 
        cvv: 'Please enter a valid 3-digit CVV'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, cvv: '' }));
    }
  };
  
  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value);
    
    // Validate card name
    if (e.target.value && e.target.value.trim().length < 3) {
      setFormErrors(prev => ({
        ...prev, 
        cardName: 'Please enter the full name on the card'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, cardName: '' }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = { ...formErrors };
    
    // Validate card number
    if (!cardNumber || !CARD_NUMBER_REGEX.test(cardNumber)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
      isValid = false;
    }
    
    // Validate card name
    if (!cardName || cardName.trim().length < 3) {
      errors.cardName = 'Please enter the full name on the card';
      isValid = false;
    }
    
    // Validate expiry date
    if (!expiryDate || !EXPIRY_DATE_REGEX.test(expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      isValid = false;
    } else {
      // Check if card is expired
      const [month, year] = expiryDate.split('/');
      const expiryDateObj = new Date();
      expiryDateObj.setFullYear(2000 + parseInt(year, 10), parseInt(month, 10) - 1, 1);
      
      if (expiryDateObj < new Date()) {
        errors.expiryDate = 'This card has expired';
        isValid = false;
      }
    }
    
    // Validate CVV
    if (!cvv || !CVV_REGEX.test(cvv)) {
      errors.cvv = 'Please enter a valid CVV';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if form is valid
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        description: 'All fields must be filled correctly',
      });
      return;
    }
    
    // Check if security token is still valid
    if (!securityToken || Date.now() > securityToken.expires) {
      // Generate new token
      const timestamp = Date.now();
      const userId = user?.id || 'guest-' + Math.random().toString(36).substring(2, 9);
      const tokenData = createPaymentToken(userId, timestamp);
      
      setSecurityToken({
        token: tokenData.token,
        timestamp,
        expires: tokenData.expires
      });
    }
    
    setIsProcessing(true);
    setShowSecurityBadge(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Encrypt payment data with temporal nonce
      const paymentData = {
        cardNumber,
        cardName,
        expiryDate,
        amount: getCartTotal(),
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 15),
      };
      
      const encryptedData = encryptPaymentData(paymentData);
      const userId = user?.id || 'guest-' + Math.random().toString(36).substring(2, 9);
      
      // Security logging - DO NOT log actual card data
      console.log('Payment attempt:', {
        userId: userId,
        cardType: cardNumber.startsWith('4') ? 'Visa' : 
                 cardNumber.startsWith('5') ? 'Mastercard' : 'Other',
        lastFour: cardNumber.replace(/\s/g, '').slice(-4),
        amount: getCartTotal() * 70,
        timestamp: new Date().toISOString()
      });
      
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
          <span className="text-sm font-medium">Enhanced Encryption</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="cardName" className="text-lushmilk-brown">Cardholder Name</Label>
          <Input
            id="cardName"
            placeholder="Name on card"
            value={cardName}
            onChange={handleCardNameChange}
            required
            className={`border-lushmilk-cream/50 focus:border-lushmilk-terracotta ${
              formErrors.cardName ? 'border-red-300 focus:border-red-500' : ''
            }`}
            aria-invalid={!!formErrors.cardName}
            aria-errormessage="cardNameError"
          />
          {formErrors.cardName && (
            <p id="cardNameError" className="text-xs text-red-500 mt-1">
              {formErrors.cardName}
            </p>
          )}
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
              className={`pl-10 border-lushmilk-cream/50 focus:border-lushmilk-terracotta ${
                formErrors.cardNumber ? 'border-red-300 focus:border-red-500' : ''
              }`}
              aria-invalid={!!formErrors.cardNumber}
              aria-errormessage="cardNumberError"
            />
            <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-lushmilk-terracotta/60" />
          </div>
          {formErrors.cardNumber && (
            <p id="cardNumberError" className="text-xs text-red-500 mt-1">
              {formErrors.cardNumber}
            </p>
          )}
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
                className={`pl-10 border-lushmilk-cream/50 focus:border-lushmilk-terracotta ${
                  formErrors.expiryDate ? 'border-red-300 focus:border-red-500' : ''
                }`}
                aria-invalid={!!formErrors.expiryDate}
                aria-errormessage="expiryDateError"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-lushmilk-terracotta/60" />
            </div>
            {formErrors.expiryDate && (
              <p id="expiryDateError" className="text-xs text-red-500 mt-1">
                {formErrors.expiryDate}
              </p>
            )}
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
              className={`border-lushmilk-cream/50 focus:border-lushmilk-terracotta ${
                formErrors.cvv ? 'border-red-300 focus:border-red-500' : ''
              }`}
              aria-invalid={!!formErrors.cvv}
              aria-errormessage="cvvError"
            />
            {formErrors.cvv && (
              <p id="cvvError" className="text-xs text-red-500 mt-1">
                {formErrors.cvv}
              </p>
            )}
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
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">Test mode</p>
            <p className="text-xs text-yellow-600">No real payments are processed during checkout in this demo.</p>
          </div>
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
