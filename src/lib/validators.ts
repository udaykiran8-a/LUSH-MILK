/**
 * Validation utility functions for the LUSH MILK application
 */

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Password validation - at least 8 chars, with at least one uppercase, one lowercase, one number
export function isStrongPassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password meets requirements' };
}

// Phone number validation
export function isValidPhoneNumber(phone: string): boolean {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if the resulting string has between 10 and 15 digits (international standard)
  return digits.length >= 10 && digits.length <= 15;
}

// Credit card validation using Luhn algorithm
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove any non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm implementation
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits in reverse
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

// Address validation
export function isValidAddress(address: {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}): { isValid: boolean; message: string } {
  if (!address.street || address.street.length < 5) {
    return { isValid: false, message: 'Street address is required and must be at least 5 characters' };
  }
  
  if (!address.city || address.city.length < 2) {
    return { isValid: false, message: 'City is required' };
  }
  
  if (!address.state || address.state.length < 2) {
    return { isValid: false, message: 'State/Province is required' };
  }
  
  if (!address.postalCode || !/^[a-zA-Z0-9 -]{3,10}$/.test(address.postalCode)) {
    return { isValid: false, message: 'Valid postal/zip code is required' };
  }
  
  return { isValid: true, message: 'Address is valid' };
}

// Sanitize input to prevent XSS attacks
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate order details
export function validateOrderDetails(order: {
  products: Array<{ id: string; quantity: number }>;
  deliveryAddress: string;
  contactPhone: string;
}): { isValid: boolean; message: string } {
  if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
    return { isValid: false, message: 'Order must contain at least one product' };
  }
  
  for (const item of order.products) {
    if (!item.id || typeof item.quantity !== 'number' || item.quantity < 1) {
      return { isValid: false, message: 'Each product must have a valid ID and positive quantity' };
    }
  }
  
  if (!order.deliveryAddress || order.deliveryAddress.length < 10) {
    return { isValid: false, message: 'Delivery address is required' };
  }
  
  if (!order.contactPhone || !isValidPhoneNumber(order.contactPhone)) {
    return { isValid: false, message: 'Valid contact phone number is required' };
  }
  
  return { isValid: true, message: 'Order details are valid' };
} 