import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { RateLimitingService } from '@/services/RateLimitingService';
import { logger } from '@/utils/logger';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Rate limiting for payment endpoints
const rateLimiter = new RateLimitingService();

// Validate the input data
const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('inr'),
  orderId: z.string(),
  customerId: z.string(),
  description: z.string().optional(),
  receipt_email: z.string().email().optional(),
});

/**
 * Create a Stripe payment intent
 * This securely initiates the payment process and returns a client secret
 * for confirming the payment on the frontend
 */
export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  
  // Check if this IP is rate limited for payment operations
  if (!rateLimiter.isAllowed(ip, 'payment')) {
    logger.warn(`Rate limit exceeded for payment API from IP ${ip}`);
    return NextResponse.json(
      { error: 'Too many payment attempts. Please try again later.' },
      { status: 429 }
    );
  }
  
  try {
    // Get idempotency key from headers to prevent duplicate charges
    const idempotencyKey = request.headers.get('idempotency-key') || uuidv4();
    
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = paymentIntentSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      logger.error(`Payment validation error: ${errorMessage}`);
      return NextResponse.json({ error: `Invalid payment data: ${errorMessage}` }, { status: 400 });
    }
    
    const { amount, currency, orderId, customerId, description, receipt_email } = validationResult.data;
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to the smallest currency unit (paise for INR)
      currency,
      payment_method_types: ['card'],
      metadata: {
        order_id: orderId,
        customer_id: customerId,
      },
      description,
      receipt_email,
    }, {
      idempotencyKey, // Prevent duplicate charges
    });
    
    logger.info(`Created payment intent ${paymentIntent.id} for order ${orderId}`);
    
    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      logger.error(`Stripe error: ${error.message}`, { code: error.code, type: error.type });
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    
    // Handle general errors
    logger.error(`Error creating payment intent: ${error.message}`);
    return NextResponse.json(
      { error: 'Failed to process payment request' },
      { status: 500 }
    );
  }
} 