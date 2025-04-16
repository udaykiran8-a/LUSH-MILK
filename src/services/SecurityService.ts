/**
 * SecurityService.ts
 * 
 * Enhanced security measures for the LUSH MILK application:
 * - Data encryption for sensitive information
 * - CSRF protection
 * - XSS prevention utilities
 * - Security headers management
 * - Password strength validation
 * - Session management
 */

import { supabase } from '../integrations/supabase/client';
import CryptoJS from 'crypto-js';

// Secret key for local encryption (in production, use environment variables)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'lush-milk-secure-key';

/**
 * Data Encryption Service
 * For encrypting sensitive data before storing locally
 */
export class DataEncryptionService {
  /**
   * Encrypt sensitive data
   * @param data Data to encrypt
   * @returns Encrypted string
   */
  static encrypt(data: any): string {
    // Convert object to string if needed
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encrypt using AES
    return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
  }
  
  /**
   * Decrypt data
   * @param encryptedData Encrypted string
   * @returns Decrypted data (string or parsed object)
   */
  static decrypt(encryptedData: string): any {
    try {
      // Decrypt using AES
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // Try to parse as JSON, return as string if not valid JSON
      try {
        return JSON.parse(decryptedString);
      } catch (e) {
        return decryptedString;
      }
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }
  
  /**
   * Encrypt sensitive data for localStorage
   * @param key Storage key
   * @param data Data to store
   */
  static secureLocalStorage = {
    setItem(key: string, data: any): void {
      try {
        const encryptedData = DataEncryptionService.encrypt(data);
        localStorage.setItem(`secure_${key}`, encryptedData);
      } catch (error) {
        console.error('Error storing encrypted data:', error);
      }
    },
    
    getItem(key: string): any {
      try {
        const encryptedData = localStorage.getItem(`secure_${key}`);
        if (!encryptedData) return null;
        
        return DataEncryptionService.decrypt(encryptedData);
      } catch (error) {
        console.error('Error retrieving encrypted data:', error);
        return null;
      }
    },
    
    removeItem(key: string): void {
      localStorage.removeItem(`secure_${key}`);
    },
    
    clear(): void {
      // Only clear secure items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };
}

/**
 * CSRF Protection Service
 */
export class CSRFProtectionService {
  private static TOKEN_KEY = 'csrf_token';
  
  /**
   * Generate a new CSRF token
   * @returns Generated token
   */
  static generateToken(): string {
    const token = CryptoJS.lib.WordArray.random(16).toString();
    DataEncryptionService.secureLocalStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }
  
  /**
   * Get the current CSRF token, generate if not exists
   * @returns Current CSRF token
   */
  static getToken(): string {
    let token = DataEncryptionService.secureLocalStorage.getItem(this.TOKEN_KEY);
    
    if (!token) {
      token = this.generateToken();
    }
    
    return token;
  }
  
  /**
   * Validate a CSRF token against stored token
   * @param token Token to validate
   * @returns Whether token is valid
   */
  static validateToken(token: string): boolean {
    const storedToken = DataEncryptionService.secureLocalStorage.getItem(this.TOKEN_KEY);
    return storedToken === token;
  }
  
  /**
   * Add CSRF token to a fetch request
   * @param options Fetch options
   * @returns Updated fetch options with CSRF token
   */
  static addTokenToRequest(options: RequestInit = {}): RequestInit {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    headers.append('X-CSRF-Token', token);
    
    return {
      ...options,
      headers
    };
  }
}

/**
 * XSS Prevention Utilities
 */
export class XSSPreventionService {
  /**
   * Sanitize a string to prevent XSS attacks
   * @param input String to sanitize
   * @returns Sanitized string
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  /**
   * Sanitize object values recursively
   * @param obj Object to sanitize
   * @returns Sanitized object
   */
  static sanitizeObject(obj: any): any {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    // Handle objects
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.sanitizeObject(obj[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Create a safe HTML attribute
   * @param value Value to sanitize
   * @returns Sanitized value safe for HTML attributes
   */
  static createSafeAttribute(value: string): string {
    if (!value) return '';
    
    // Remove dangerous attribute values that could lead to script execution
    return value.replace(/javascript:/gi, '')
                .replace(/data:/gi, '')
                .replace(/vbscript:/gi, '')
                .replace(/on\w+=/gi, '');
  }
}

/**
 * Password Strength Service
 */
export class PasswordStrengthService {
  /**
   * Check password strength
   * @param password Password to check
   * @returns Object containing strength score and feedback
   */
  static checkStrength(password: string): { 
    score: number; 
    feedback: string;
    isStrong: boolean;
  } {
    if (!password) {
      return { score: 0, feedback: 'Password is required', isStrong: false };
    }
    
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters');
    } else {
      score += 1;
    }
    
    // Contains uppercase
    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters');
    } else {
      score += 1;
    }
    
    // Contains lowercase
    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters');
    } else {
      score += 1;
    }
    
    // Contains numbers
    if (!/[0-9]/.test(password)) {
      feedback.push('Add numbers');
    } else {
      score += 1;
    }
    
    // Contains special characters
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Add special characters');
    } else {
      score += 1;
    }
    
    // Check for common passwords (simplified)
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('This is a commonly used password');
    }
    
    // Final score calculation
    const isStrong = score >= 4;
    
    return {
      score,
      feedback: feedback.join('. ') || 'Password is strong',
      isStrong
    };
  }
}

/**
 * Session Security Service
 */
export class SessionSecurityService {
  private static SESSION_ACTIVITY_KEY = 'last_activity';
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    DataEncryptionService.secureLocalStorage.setItem(
      this.SESSION_ACTIVITY_KEY,
      Date.now()
    );
  }
  
  /**
   * Check if session has timed out
   * @returns Whether session has timed out
   */
  static hasSessionTimedOut(): boolean {
    const lastActivity = DataEncryptionService.secureLocalStorage.getItem(
      this.SESSION_ACTIVITY_KEY
    );
    
    if (!lastActivity) return true;
    
    const now = Date.now();
    return now - lastActivity > this.SESSION_TIMEOUT;
  }
  
  /**
   * Initialize session monitoring
   * This updates the activity timestamp on user interactions
   */
  static initializeSessionMonitoring(): void {
    // Set initial activity
    this.updateActivity();
    
    // Update on user interaction
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, () => this.updateActivity(), { passive: true });
    });
    
    // Periodically check for timeout
    setInterval(() => {
      if (this.hasSessionTimedOut()) {
        // Handle timeout (e.g., redirect to login)
        console.log('Session timed out due to inactivity');
        
        // Optional: Auto logout
        this.logout();
      }
    }, 60000); // Check every minute
  }
  
  /**
   * Handle user logout
   * Clears session data and redirects to login
   */
  static async logout(): Promise<void> {
    try {
      // Clear secure storage
      DataEncryptionService.secureLocalStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

/**
 * Main Security Service
 */
export class SecurityService {
  /**
   * Initialize all security features
   */
  static initialize(): void {
    // Start session monitoring
    SessionSecurityService.initializeSessionMonitoring();
    
    // Generate initial CSRF token
    CSRFProtectionService.generateToken();
    
    console.log('Security services initialized');
  }
  
  /**
   * Encrypt sensitive data
   */
  static encryptData(data: any): string {
    return DataEncryptionService.encrypt(data);
  }
  
  /**
   * Decrypt data
   */
  static decryptData(encryptedData: string): any {
    return DataEncryptionService.decrypt(encryptedData);
  }
  
  /**
   * Secure storage for sensitive data
   */
  static secureStorage = DataEncryptionService.secureLocalStorage;
  
  /**
   * Get CSRF token for forms
   */
  static getCsrfToken(): string {
    return CSRFProtectionService.getToken();
  }
  
  /**
   * Add CSRF protection to fetch requests
   */
  static secureRequest(options: RequestInit = {}): RequestInit {
    return CSRFProtectionService.addTokenToRequest(options);
  }
  
  /**
   * Sanitize input to prevent XSS
   */
  static sanitize(input: any): any {
    return XSSPreventionService.sanitizeObject(input);
  }
  
  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string;
    isStrong: boolean;
  } {
    return PasswordStrengthService.checkStrength(password);
  }
  
  /**
   * Log out user
   */
  static logout(): Promise<void> {
    return SessionSecurityService.logout();
  }
}

// Export direct access to security utilities
export const security = {
  initialize: SecurityService.initialize,
  encrypt: SecurityService.encryptData,
  decrypt: SecurityService.decryptData,
  storage: SecurityService.secureStorage,
  csrf: SecurityService.getCsrfToken,
  secureRequest: SecurityService.secureRequest,
  sanitize: SecurityService.sanitize,
  checkPassword: SecurityService.checkPasswordStrength,
  logout: SecurityService.logout
};

export default SecurityService; 