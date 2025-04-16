import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { authRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json();
    
    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    
    // Apply rate limiting
    const rateLimitResult = authRateLimiter.check(`auth:${ip}`);
    
    // If rate limited, return 429 Too Many Requests
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString()
          }
        }
      );
    }
    
    // Validate inputs
    if (!email || !password || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Handle sign in
    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ user: data.user }, { status: 200 });
    }
    
    // Handle sign up
    if (action === 'signup') {
      // Additional validation for signup
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          user: data.user,
          message: 'Please check your email to confirm your account'
        },
        { status: 200 }
      );
    }
    
    // Invalid action
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 