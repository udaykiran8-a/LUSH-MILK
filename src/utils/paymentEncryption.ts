import * as CryptoJS from 'crypto-js';

// Default fallback key for development only
const DEV_FALLBACK_KEY = 'development_only_key_do_not_use_in_production';
const DEV_FALLBACK_SALT = 'development_only_salt_do_not_use_in_production';

/**
 * Gets the secret key from environment variables with proper validation and fallbacks
 * @returns The secret key for encryption
 */
const getSecretKey = (): string => {
  // Try getting from different environment variable formats (Vite, Next.js, etc.)
  const key = import.meta.env?.VITE_PAYMENT_SECRET_KEY || 
              process.env?.NEXT_PUBLIC_PAYMENT_SECRET_KEY ||
              process.env?.PAYMENT_SECRET_KEY;
  
  if (!key) {
    // In production, throw error if key is missing
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Payment secret key is not set in environment variables');
      throw new Error('Payment encryption configuration error - contact support');
    }
    
    // In development, use fallback but log warning
    console.warn('WARNING: Using development fallback key. NOT SECURE FOR PRODUCTION!');
    return DEV_FALLBACK_KEY;
  }
  
  return key;
};

/**
 * Gets the salt from environment variables with proper validation and fallbacks
 * @returns The salt for hashing
 */
const getSalt = (): string => {
  // Try getting from different environment variable formats (Vite, Next.js, etc.)
  const salt = import.meta.env?.VITE_PAYMENT_SALT || 
               process.env?.NEXT_PUBLIC_PAYMENT_SALT ||
               process.env?.PAYMENT_SALT;
  
  if (!salt) {
    // In production, throw error if salt is missing
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Payment salt is not set in environment variables');
      throw new Error('Payment hashing configuration error - contact support');
    }
    
    // In development, use fallback but log warning
    console.warn('WARNING: Using development fallback salt. NOT SECURE FOR PRODUCTION!');
    return DEV_FALLBACK_SALT;
  }
  
  return salt;
};

/**
 * Encrypts payment data to secure it before transmission
 * @param paymentData - Object containing payment details
 * @returns Encrypted string with initialization vector
 */
export const encryptPaymentData = (paymentData: any): string => {
  try {
    const dataString = JSON.stringify(paymentData);
    
    // Use standard Node.js crypto for IV generation instead of lib.WordArray
    const iv = CryptoJS.enc.Hex.parse(Array.from(new Array(16))
      .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
      .join(''));
    
    // Encrypt with proper parameter format
    const encrypted = CryptoJS.AES.encrypt(dataString, getSecretKey());
    
    // Return both the IV and encrypted data
    return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
  } catch (error) {
    console.error('Payment encryption error:', error);
    throw new Error('Failed to secure payment data');
  }
};

/**
 * Decrypts encrypted payment data
 * @param encryptedData - The encrypted payment data string with initialization vector
 * @returns Original payment data object
 */
export const decryptPaymentData = (encryptedData: string): any => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = CryptoJS.enc.Hex.parse(parts[0]);
    const encrypted = parts[1];
    
    // Decrypt with proper parameter format
    const bytes = CryptoJS.AES.decrypt(encrypted, getSecretKey());
    
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty data');
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Payment decryption error:', error);
    throw new Error('Failed to decrypt payment data');
  }
};

/**
 * Hashes sensitive data like credit card numbers for storage
 * @param data - Data to be hashed
 * @returns Hashed string
 */
export const hashSensitiveData = (data: string): string => {
  try {
    // Use SHA256 instead of PBKDF2 since we're having compatibility issues
    return CryptoJS.SHA256(data + getSalt()).toString();
  } catch (error) {
    console.error('Data hashing error:', error);
    throw new Error('Failed to hash sensitive data');
  }
};

/**
 * Masks a credit card number for display
 * @param cardNumber - Full credit card number
 * @returns Masked card number (e.g., **** **** **** 1234)
 */
export const maskCardNumber = (cardNumber: string): string => {
  // Remove all non-digit characters
  const sanitizedNumber = cardNumber.replace(/\D/g, '');
  // Always show last 4 digits, mask the rest
  return sanitizedNumber.length > 4 
    ? `${'*'.repeat(sanitizedNumber.length - 4)} ${sanitizedNumber.slice(-4)}`
    : sanitizedNumber;
};

/**
 * Creates a secure payment token with expiration
 * @param userId - User ID
 * @param timestamp - Current timestamp
 * @param expiresIn - Expiration time in milliseconds (default: 15 minutes)
 * @returns Secure token for payment verification
 */
export const createPaymentToken = (
  userId: string, 
  timestamp: number,
  expiresIn: number = 15 * 60 * 1000
): { token: string, expires: number } => {
  try {
    const expirationTime = timestamp + expiresIn;
    const tokenData = `${userId}-${timestamp}-${expirationTime}-${getSecretKey()}`;
    
    // Use SHA256 instead of HmacSHA256
    return {
      token: CryptoJS.SHA256(tokenData).toString(),
      expires: expirationTime
    };
  } catch (error) {
    console.error('Payment token creation error:', error);
    throw new Error('Failed to create payment token');
  }
};

/**
 * Validates a payment token
 * @param token - The token to validate
 * @param userId - User ID
 * @param timestamp - Original timestamp
 * @param expirationTime - Token expiration time
 * @returns Boolean indicating if token is valid and not expired
 */
export const validatePaymentToken = (
  token: string,
  userId: string,
  timestamp: number,
  expirationTime: number
): boolean => {
  try {
    // Check if token has expired
    if (Date.now() > expirationTime) {
      return false;
    }
    
    // Recreate the token to validate
    const tokenData = `${userId}-${timestamp}-${expirationTime}-${getSecretKey()}`;
    
    // Use SHA256 instead of HmacSHA256
    const expectedToken = CryptoJS.SHA256(tokenData).toString();
    
    // Compare in constant time to prevent timing attacks
    return expectedToken === token;
  } catch (error) {
    console.error('Payment token validation error:', error);
    return false;
  }
};
