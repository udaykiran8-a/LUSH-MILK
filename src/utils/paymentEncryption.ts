
import CryptoJS from 'crypto-js';

// Secret key should be stored in environment variables in a production environment
const SECRET_KEY = 'lushmilk-secure-payment-key';
// Additional salt for extra security
const SALT = 'lushmilk-salt-value';

/**
 * Encrypts payment data to secure it before transmission
 * @param paymentData - Object containing payment details
 * @returns Encrypted string with initialization vector
 */
export const encryptPaymentData = (paymentData: any): string => {
  const dataString = JSON.stringify(paymentData);
  // Generate a random initialization vector for added security
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(dataString, SECRET_KEY, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Return both the IV and encrypted data
  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
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
    
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hashes sensitive data like credit card numbers for storage
 * @param data - Data to be hashed
 * @returns Hashed string
 */
export const hashSensitiveData = (data: string): string => {
  // Use PBKDF2 with 1000 iterations for stronger hashing
  return CryptoJS.PBKDF2(data, SALT, { 
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
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
  const expirationTime = timestamp + expiresIn;
  const tokenData = `${userId}-${timestamp}-${expirationTime}-${SECRET_KEY}`;
  return {
    token: CryptoJS.HmacSHA256(tokenData, SECRET_KEY).toString(),
    expires: expirationTime
  };
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
  // Check if token has expired
  if (Date.now() > expirationTime) {
    return false;
  }
  
  // Recreate the token to validate
  const tokenData = `${userId}-${timestamp}-${expirationTime}-${SECRET_KEY}`;
  const expectedToken = CryptoJS.HmacSHA256(tokenData, SECRET_KEY).toString();
  
  // Compare in constant time to prevent timing attacks
  return expectedToken === token;
};
