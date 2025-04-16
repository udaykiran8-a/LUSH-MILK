import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// CSP nonce generation for inline scripts (if needed)
const generateCspNonce = () => nanoid();

/**
 * Security middleware to add various security headers and implement protections
 * against common web vulnerabilities.
 */
export function middleware(request: NextRequest) {
  // Clone the response to modify headers
  const response = NextResponse.next();
  const nonce = generateCspNonce();
  
  // Add security headers
  const headers = response.headers;
  
  // Content Security Policy (CSP)
  // Customize this policy based on your application's needs
  headers.set(
    'Content-Security-Policy',
    `default-src 'self'; 
     script-src 'self' 'nonce-${nonce}' https://js.stripe.com; 
     style-src 'self' 'unsafe-inline'; 
     img-src 'self' data: https://i.imgur.com https://*.supabase.co https://images.unsplash.com; 
     font-src 'self' data:; 
     connect-src 'self' https://*.supabase.co https://api.stripe.com; 
     frame-src 'self' https://js.stripe.com; 
     object-src 'none';
     base-uri 'self';
     form-action 'self';`
  );
  
  // XSS Protection
  // Even though modern browsers use CSP, this header provides additional protection for older browsers
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking protection
  headers.set('X-Frame-Options', 'DENY');
  
  // HSTS (HTTP Strict Transport Security)
  // Only apply in production and if using HTTPS
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Cache Control
  // Prevent sensitive information from being cached
  if (request.nextUrl.pathname.startsWith('/api/') || 
      request.nextUrl.pathname.includes('/checkout') ||
      request.nextUrl.pathname.includes('/account')) {
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
  }

  // CSRF Protection
  // For API routes that modify data, consider CSRF token validation
  if (request.method !== 'GET' && request.method !== 'HEAD' && 
      request.nextUrl.pathname.startsWith('/api/')) {
    
    // Get the CSRF token from the cookie
    const csrfTokenCookie = request.cookies.get('csrf_token')?.value;
    
    // Get the CSRF token from the header
    const csrfTokenHeader = request.headers.get('x-csrf-token');
    
    // If they don't match or either is missing, return 403 Forbidden
    if (!csrfTokenCookie || !csrfTokenHeader || csrfTokenCookie !== csrfTokenHeader) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid CSRF token',
          message: 'CSRF validation failed. Please refresh the page and try again.'
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
  
  // Set a CSRF token in a cookie if it doesn't exist already
  // For GET requests that might lead to forms
  if ((request.method === 'GET' || request.method === 'HEAD') && 
      !request.cookies.has('csrf_token')) {
    const csrfToken = nanoid();
    
    // Set the CSRF token cookie
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 // 1 hour
    });
    
    // Add a custom header that frontend JavaScript can read to get the token
    // to include in subsequent requests
    headers.set('x-set-csrf-token', csrfToken);
  }
  
  return response;
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    // Apply to all routes except static files, favicon, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico)).*)',
  ],
}; 