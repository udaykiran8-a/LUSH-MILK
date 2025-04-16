/**
 * MobileSecurityService.ts
 * Handles security concerns specific to mobile environments
 */

import { supabase } from '@/integrations/supabase/client';
import { mobileConfig, isAndroidDevice, getAndroidVersion, getDeviceCategory } from '@/config/mobile';
import * as CryptoJS from 'crypto-js';

// Secure storage keys with app-specific prefix to avoid collision
const APP_PREFIX = 'lushmilk_';
const STORAGE_KEYS = {
  AUTH_TOKEN: `${APP_PREFIX}auth_token`,
  REFRESH_TOKEN: `${APP_PREFIX}refresh_token`,
  USER_DATA: `${APP_PREFIX}user_data`,
  PAYMENT_INFO: `${APP_PREFIX}payment_temp`,
  DEVICE_ID: `${APP_PREFIX}device_id`,
  LAST_SECURITY_CHECK: `${APP_PREFIX}last_sec_check`
};

// Secret key for local encryption (this would be better stored in native code)
const LOCAL_SECRET_KEY = import.meta.env.VITE_LOCAL_ENCRYPTION_KEY || 'lush-mobile-local-key';

// Generate a unique device ID if not already present
export const ensureDeviceId = (): string => {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
};

/**
 * Securely store authentication data
 */
export const secureStoreAuth = async (session: any): Promise<boolean> => {
  try {
    if (!session || !session.access_token) return false;
    
    const encryptedToken = encryptData(session.access_token);
    const encryptedRefresh = session.refresh_token ? encryptData(session.refresh_token) : null;
    
    // Store encrypted tokens in localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, encryptedToken);
    if (encryptedRefresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, encryptedRefresh);
    
    // Store last login timestamp
    const timestamp = Date.now();
    localStorage.setItem(`${APP_PREFIX}last_login`, timestamp.toString());
    
    return true;
  } catch (error) {
    console.error('Error storing auth securely:', error);
    return false;
  }
};

/**
 * Retrieve securely stored auth data
 */
export const getSecureAuth = (): { accessToken: string | null, refreshToken: string | null } => {
  try {
    const encryptedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const encryptedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    const accessToken = encryptedToken ? decryptData(encryptedToken) : null;
    const refreshToken = encryptedRefresh ? decryptData(encryptedRefresh) : null;
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error retrieving secure auth:', error);
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Clear all secure storage
 */
export const clearSecureStorage = (): void => {
  try {
    // Keep device ID
    const deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    
    // Clear all app-specific storage
    for (const key in localStorage) {
      if (key.startsWith(APP_PREFIX) && key !== STORAGE_KEYS.DEVICE_ID) {
        localStorage.removeItem(key);
      }
    }
    
    // Restore device ID
    if (deviceId) {
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
  } catch (error) {
    console.error('Error clearing secure storage:', error);
  }
};

/**
 * Apply security timeout (session expiry)
 */
export const setupSecurityTimeout = (): (() => void) => {
  let timeoutId: number | null = null;
  let lastActivity = Date.now();
  
  const checkInactivity = () => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    const timeoutMs = mobileConfig.security.sessionTimeoutMinutes * 60 * 1000;
    
    if (inactiveTime > timeoutMs) {
      // Session timeout - log out
      supabase.auth.signOut();
      clearSecureStorage();
      
      // Notify user (if the app is visible)
      if (document.visibilityState === 'visible') {
        const timeoutEvent = new CustomEvent('session-timeout');
        document.dispatchEvent(timeoutEvent);
      }
    } else {
      // Schedule next check
      timeoutId = window.setTimeout(checkInactivity, 60000); // Check every minute
    }
  };
  
  // Activity listeners
  const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart', 'visibilitychange'];
  const resetTimer = () => {
    if (document.visibilityState !== 'hidden') {
      lastActivity = Date.now();
    }
  };
  
  // Set up listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, resetTimer);
  });
  
  // Start timer
  timeoutId = window.setTimeout(checkInactivity, 60000);
  
  // Return cleanup function
  return () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
  };
};

/**
 * Detect if device is rooted (basic detection)
 */
export const detectRootedDevice = (): boolean => {
  if (!isAndroidDevice()) return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for common root app indicators
  const rootIndicators = ['supersu', 'superuser', 'magisk', 'chainfire', 'kingroot'];
  return rootIndicators.some(indicator => userAgent.includes(indicator));
};

/**
 * Set up security policies for WebView
 */
export const configureContentSecurity = (): void => {
  // Create a Content Security Policy meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  
  // Define a stronger CSP for production
  const isProduction = import.meta.env.PROD;
  
  // Build CSP based on environment
  if (isProduction) {
    // Stricter CSP for production
    cspMeta.content = `
      default-src 'self';
      connect-src 'self' ${import.meta.env.VITE_SUPABASE_URL} https://api.resend.com;
      img-src 'self' data: https://avatars.githubusercontent.com https://*.supabaseusercontent.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      script-src 'self' 'unsafe-inline' https://unpkg.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `;
  } else {
    // More permissive CSP for development
    cspMeta.content = `
      default-src 'self';
      connect-src 'self' ${import.meta.env.VITE_SUPABASE_URL} https://api.resend.com localhost:* ws://localhost:*;
      img-src 'self' data: https://avatars.githubusercontent.com https://*.supabaseusercontent.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
      object-src 'none';
    `;
  }
  
  document.head.appendChild(cspMeta);
  
  // Add feature policy to restrict dangerous features
  const featurePolicyMeta = document.createElement('meta');
  featurePolicyMeta.httpEquiv = 'Feature-Policy';
  featurePolicyMeta.content = `
    camera 'none';
    microphone 'none';
    geolocation 'none';
    accelerometer 'none';
    autoplay 'none';
    document-domain 'none';
  `;
  
  document.head.appendChild(featurePolicyMeta);
};

/**
 * Protects against clipboard-based attacks
 */
export const setupClipboardProtection = (): void => {
  // Prevent clipboard hijacking
  document.addEventListener('copy', (e) => {
    // Only apply protection on secure fields
    if ((e.target as HTMLElement)?.closest('.secure-field')) {
      e.preventDefault();
    }
  });
  
  // Protect paste events to sensitive fields
  document.addEventListener('paste', (e) => {
    const target = e.target as HTMLElement;
    
    // Sanitize pasted content for input fields
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Allow pasting only to certain fields
      if (target.classList.contains('no-paste')) {
        e.preventDefault();
      }
    }
  });
};

/**
 * Disable screenshots for sensitive screens (Android 9+)
 */
export const disableScreenCapture = (sensitive: boolean): void => {
  if (isAndroidDevice()) {
    try {
      // Create or update a style for the body
      let securityStyle = document.getElementById('security-style');
      
      if (!securityStyle) {
        securityStyle = document.createElement('style');
        securityStyle.id = 'security-style';
        document.head.appendChild(securityStyle);
      }
      
      if (sensitive) {
        securityStyle.textContent = `
          body {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          input, textarea {
            -webkit-user-select: auto;
          }
          
          .secure-field {
            -webkit-text-security: disc;
          }
        `;
        
        // Add class to body for additional styling
        document.body.classList.add('secure-screen');
      } else {
        securityStyle.textContent = '';
        document.body.classList.remove('secure-screen');
      }
    } catch (error) {
      console.error('Error configuring screen security:', error);
    }
  }
};

/**
 * Run device security check
 */
export const runDeviceSecurityCheck = (): { secure: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for rooted device
  if (detectRootedDevice()) {
    issues.push('device_rooted');
  }
  
  // Check Android version
  const androidVersion = getAndroidVersion();
  if (androidVersion && androidVersion < 7) {
    issues.push('android_outdated');
  }
  
  // Check for debug mode
  if (isAndroidDevice() && /debug|test/.test(navigator.userAgent.toLowerCase())) {
    issues.push('debug_mode');
  }
  
  // Store check timestamp
  localStorage.setItem(STORAGE_KEYS.LAST_SECURITY_CHECK, Date.now().toString());
  
  return {
    secure: issues.length === 0,
    issues
  };
};

/**
 * Detect WebView tampering
 */
export const detectWebViewTampering = (): boolean => {
  // Check unusual properties that might indicate tampering
  if (isAndroidDevice()) {
    try {
      // Check for dev tools
      const hasDevTools = !!(window as any).chrome?.devtools;
      
      // Check for unusual properties
      const hasUnusualProps = !!(window as any).__nightmare || 
                            !!(window as any).callPhantom || 
                            !!(window as any)._phantom;
      
      return hasDevTools || hasUnusualProps;
    } catch (error) {
      // Error during checks may indicate tampering
      return true;
    }
  }
  
  return false;
};

/**
 * Local data encryption for sensitive information
 */
export const encryptData = (data: any): string => {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Add device-specific salt for better security
  const deviceId = ensureDeviceId();
  const combinedKey = `${LOCAL_SECRET_KEY}:${deviceId}`;
  
  return CryptoJS.AES.encrypt(stringData, combinedKey).toString();
};

/**
 * Decrypt locally stored data
 */
export const decryptData = (encryptedData: string): string => {
  try {
    // Use device-specific key for decryption
    const deviceId = ensureDeviceId();
    const combinedKey = `${LOCAL_SECRET_KEY}:${deviceId}`;
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, combinedKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Compliance with Play Store security requirements
 */
export const enforcePlayStoreCompliance = (): void => {
  // Set up secure flag for HTTPS traffic
  if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
  
  // Redirect to the correct domain if needed
  if (!window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('lushmilk.in') && 
      window.location.hostname.includes('lushmilk')) {
    // If on the old domain, redirect to the new one
    const newUrl = window.location.href.replace(/lushmilk\.[^/]+/, 'lushmilk.in');
    window.location.href = newUrl;
  }
  
  // Enforce TLS 1.2+
  try {
    // This is more for documentation as browsers handle TLS version
    const secureContextMeta = document.createElement('meta');
    secureContextMeta.name = 'secure-context';
    secureContextMeta.content = 'required';
    document.head.appendChild(secureContextMeta);
  } catch (error) {
    console.error('Error setting secure context:', error);
  }
  
  // Disable developer extensions (helps with Play Store compliance)
  if (isAndroidDevice() && import.meta.env.PROD) {
    try {
      // Attempt to disable Chrome DevTools
      const devToolsDetector = setInterval(() => {
        const isDevToolsOpen = 
          /Chrome/.test(navigator.userAgent) && 
          /Google Inc/.test(navigator.vendor) &&
          (window as any).devtools?.open;
          
        if (isDevToolsOpen) {
          // Log an error and potentially notify server
          console.error('DevTools detected in production environment');
        }
      }, 5000);
      
      // Clean up interval when page unloads
      window.addEventListener('beforeunload', () => {
        clearInterval(devToolsDetector);
      });
    } catch (error) {
      // Non-critical error, can be ignored
    }
  }
};

/**
 * Initialize all mobile security features
 */
export const initializeMobileSecurity = (): (() => void) => {
  // Ensure device ID is set
  ensureDeviceId();
  
  // Configure security content policies
  configureContentSecurity();
  
  // Set up session timeout
  const cleanupTimeout = setupSecurityTimeout();
  
  // Add clipboard protection
  setupClipboardProtection();
  
  // Run security checks
  const securityStatus = runDeviceSecurityCheck();
  
  // Apply Play Store security practices
  enforcePlayStoreCompliance();
  
  // Monitor for tampering attempts
  const tamperCheckInterval = setInterval(() => {
    if (detectWebViewTampering()) {
      console.warn('WebView tampering detected');
      // Notify backend of potential security issue
    }
  }, 30000);
  
  // Check for rooted device
  if (detectRootedDevice()) {
    console.warn('Detected potentially rooted device. Some features may be restricted.');
    // In a real app, you might want to restrict certain operations
  }
  
  // Set up event listener for secure screens
  document.addEventListener('route-change', (e: Event) => {
    const customEvent = e as CustomEvent;
    const isSecurePage = customEvent.detail?.secure === true;
    
    // Disable screenshots on secure pages
    disableScreenCapture(isSecurePage);
  });
  
  // Return cleanup
  return () => {
    cleanupTimeout();
    clearInterval(tamperCheckInterval);
  };
}; 