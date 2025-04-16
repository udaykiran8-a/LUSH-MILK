/**
 * CSRF Protection Utilities
 * Provides utilities for creating, validating, and extracting CSRF tokens
 * with improved security measures
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(20).toString('hex');
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_FORM_FIELD = '_csrf';

/**
 * Create a new CSRF token with expiration time
 * Uses HMAC to sign the token with server secret
 */
export function createCsrfToken(): string {
  // Create a token with timestamp to allow expiration
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${randomBytes}`;
  
  // Create HMAC signature
  const signature = crypto.createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
  
  // Return token as payload.signature
  return `${payload}.${signature}`;
}

/**
 * Validate a CSRF token against the provided secret
 * Checks both the signature and token expiration
 */
export function validateCsrfToken(token: string, storedToken?: string): boolean {
  if (!token) return false;
  
  try {
    // Split token into payload and signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [timestamp, randomValue, providedSignature] = parts;
    
    // Check timestamp for expiration (24-hour expiry)
    const tokenTimestamp = parseInt(timestamp, 10);
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (isNaN(tokenTimestamp) || now - tokenTimestamp > expiry) {
      return false;
    }
    
    // Recreate the payload
    const payload = `${timestamp}.${randomValue}`;
    
    // Calculate expected signature
    const expectedSignature = crypto.createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');
    
    // Constant-time comparison of signatures to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * Extract CSRF token from NextRequest
 * Checks in headers, cookies, and request body
 */
export function extractCsrfToken(request: NextRequest): string | null {
  // Check in headers
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;
  
  // For POST/PUT requests, check in the request body if it's JSON
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        // Clone request to avoid consuming the body
        const clonedRequest = request.clone();
        // Parse body to get CSRF token
        return clonedRequest.json()
          .then(body => body[CSRF_FORM_FIELD] || null)
          .catch(() => null);
      } catch (error) {
        console.error('Error extracting CSRF from request body:', error);
      }
    }
  }
  
  return null;
}

/**
 * Set a CSRF token in the cookies
 */
export function setCsrfCookie(): string {
  const csrfToken = createCsrfToken();
  
  // Set in an HTTP-only cookie with secure flag in production
  cookies().set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  });
  
  return csrfToken;
}

/**
 * Get the CSRF token for use in forms
 */
export function getCsrfToken(): string {
  // Get existing cookie or create a new one
  let token = cookies().get(CSRF_COOKIE_NAME)?.value;
  
  if (!token) {
    token = setCsrfCookie();
  }
  
  return token;
}

/**
 * Create hidden input field with CSRF token for forms
 */
export function createCsrfField(): JSX.Element {
  const token = getCsrfToken();
  return (
    <input type="hidden" name={CSRF_FORM_FIELD} value={token} />
  );
} 