import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createCsrfToken, validateCsrfToken, extractCsrfToken } from './lib/csrf';

// Generate a unique nonce for CSP
function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/**
 * Middleware for enforcing security headers and HTTPS
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const nonce = generateNonce();

  // =================================
  // 1. HTTPS Enforcement
  // =================================
  if (
    !request.nextUrl.hostname.includes('localhost') && 
    !request.nextUrl.hostname.includes('127.0.0.1') && 
    request.nextUrl.protocol === 'http:'
  ) {
    // Redirect HTTP to HTTPS
    return NextResponse.redirect(
      `https://${request.nextUrl.hostname}${request.nextUrl.pathname}${request.nextUrl.search}`,
      { status: 301 }
    );
  }

  // =================================
  // 2. Add security headers
  // =================================
  
  // Set HSTS header (HTTP Strict Transport Security)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  const baseCsp = [
    // Default directives
    "default-src 'self'",
    "img-src 'self' data: https://stripe.com https://*.stripe.com https://*.lushmilk.in",
    "font-src 'self' data: https://fonts.gstatic.com",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ];
  
  // Enhanced CSP for checkout pages
  if (request.nextUrl.pathname.includes('/checkout')) {
    const checkoutCsp = [
      ...baseCsp,
      // More restrictive for checkout pages
      "form-action 'self' https://api.stripe.com",
      // Allow Stripe to load resources
      "img-src 'self' data: https://*.stripe.com https://stripe.com",
      // Block all plugins
      "plugin-types 'none'"
    ];
    
    response.headers.set('Content-Security-Policy', checkoutCsp.join('; '));
  } else {
    response.headers.set('Content-Security-Policy', baseCsp.join('; '));
  }
  
  // Set X-Content-Type-Options header
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Set X-Frame-Options header
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Set Referrer-Policy header
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Set Permissions-Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)'
  );
  
  // Set X-XSS-Protection header (legacy, but doesn't hurt)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // =================================
  // 3. CSRF Protection - IMPROVED
  // =================================
  
  // For GET requests: Generate CSRF token and set in secure cookie
  if ((request.method === 'GET' || request.method === 'HEAD') && 
      !request.cookies.has('csrf_token')) {
    const csrfToken = createCsrfToken();
    
    // Set CSRF token in cookies with secure attributes
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Changed from 'lax' to 'strict' for better security
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    // NOTE: We no longer set the token in a header to prevent leakage
    // The token is now only available through secure cookies
  }
  
  // For POST/PUT/DELETE requests: Validate the CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) && 
      request.nextUrl.pathname.startsWith('/api/')) {
    
    // Skip CSRF validation for authentication endpoints to prevent blocking login/signup
    // and for webhook endpoints that require direct access
    if (!request.nextUrl.pathname.startsWith('/api/auth') && 
        !request.nextUrl.pathname.startsWith('/api/webhook')) {
      
      const csrfCookie = request.cookies.get('csrf_token')?.value;
      const csrfToken = extractCsrfToken(request);
      
      // If tokens don't match or either is missing, block the request
      if (!csrfCookie || !csrfToken || !validateCsrfToken(csrfToken, csrfCookie)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid CSRF token',
            message: 'Your request was blocked due to security concerns. Please refresh the page and try again.'
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
  }

  // Add security headers to all API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Security headers
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Add STS header in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
  }

  return response;
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes that handle their own security
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 