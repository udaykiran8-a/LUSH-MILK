
import CryptoJS from 'crypto-js';

// Secret key should be stored in environment variables in a production environment
const SECRET_KEY = 'lushmilk-secure-payment-key';

/**
 * Encrypts payment data to secure it before transmission
 * @param paymentData - Object containing payment details
 * @returns Encrypted string
 */
export const encryptPaymentData = (paymentData: any): string => {
  const dataString = JSON.stringify(paymentData);
  return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
};

/**
 * Decrypts encrypted payment data
 * @param encryptedData - The encrypted payment data string
 * @returns Original payment data object
 */
export const decryptPaymentData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
};

/**
 * Hashes sensitive data like credit card numbers for storage
 * @param data - Data to be hashed
 * @returns Hashed string
 */
export const hashSensitiveData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Masks a credit card number for display
 * @param cardNumber - Full credit card number
 * @returns Masked card number (e.g., **** **** **** 1234)
 */
export const maskCardNumber = (cardNumber: string): string => {
  const last4Digits = cardNumber.slice(-4);
  return `**** **** **** ${last4Digits}`;
};

/**
 * Creates a secure payment token
 * @param userId - User ID
 * @param timestamp - Current timestamp
 * @returns Secure token for payment verification
 */
export const createPaymentToken = (userId: string, timestamp: number): string => {
  const tokenData = `${userId}-${timestamp}-${SECRET_KEY}`;
  return CryptoJS.HmacSHA256(tokenData, SECRET_KEY).toString();
};
