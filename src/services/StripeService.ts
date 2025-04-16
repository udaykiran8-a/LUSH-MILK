/**
 * StripeService.ts
 * 
 * Secure payment processing using Stripe
 * Handles card tokenization, payment intents, and 3D Secure
 */

import { loadStripe, Stripe as StripeInstance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React from 'react';

interface PaymentIntent {
  id: string;
  amount: number;
  client_secret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

interface StripePaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  description: string;
  receipt_email?: string;
}

// Error types for better error handling
export enum StripeErrorType {
  CARD_ERROR = 'card_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export class StripeService {
  private static instance: StripeService;
  private stripePromise: Promise<StripeInstance | null>;
  private publishableKey: string;

  constructor() {
    // Initialize Stripe with the publishable key
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    this.stripePromise = loadStripe(this.publishableKey);
  }

  /**
   * Initialize StripeService
   * Called when application starts to ensure Stripe is ready
   */
  public static initialize(): void {
    // Create singleton instance if it doesn't exist
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    console.log('Stripe service initialized');
  }

  /**
   * Get singleton instance of StripeService
   */
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Get the Stripe promise instance
   */
  public getStripe(): Promise<StripeInstance | null> {
    return this.stripePromise;
  }

  /**
   * Create a payment intent by calling our API
   * @param amount The amount in the smallest currency unit
   * @param currency The currency code
   * @param orderId The order ID
   * @param customerId The customer ID
   * @param email The email for the receipt
   */
  public async createPaymentIntent(
    amount: number, 
    currency: string = 'inr',
    orderId: string,
    customerId: string,
    email?: string
  ): Promise<{ clientSecret: string }> {
    try {
      // Generate a unique idempotency key to prevent duplicate charges
      const idempotencyKey = crypto.randomUUID();
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          customerId,
          receipt_email: email,
          description: `LUSH MILK Order #${orderId}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Wrap children with Stripe Elements provider
   * @param children React children
   * @param clientSecret The client secret from payment intent
   */
  public createElementsProvider(
    children: React.ReactNode, 
    clientSecret: string | null
  ): React.ReactElement {
    const options = clientSecret 
      ? { clientSecret } 
      : { mode: 'payment' as const, currency: 'inr' };
      
    return (
      <Elements stripe={this.stripePromise} options={options}>
        {children}
      </Elements>
    );
  }

  /**
   * Confirm a card payment (handles 3D Secure)
   */
  public static async confirmCardPayment(clientSecret: string, paymentMethod: {
    card: any;
    billing_details: {
      name: string;
      email?: string;
      address?: {
        line1?: string;
        postal_code?: string;
        city?: string;
        country?: string;
      };
    };
  }): Promise<{ success: boolean; error?: string; paymentIntent?: any }> {
    try {
      const stripe = await this.getInstance().getStripe();
      
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe failed to initialize'
        };
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      });

      if (error) {
        // Handle specific error types
        return { 
          success: false, 
          error: error.message,
          paymentIntent: null
        };
      }

      return { 
        success: true, 
        paymentIntent 
      };
    } catch (error) {
      console.error('Error confirming card payment:', error);
      return {
        success: false,
        error: error && typeof error === 'object' && 'message' in error 
          ? error.message 
          : 'Payment confirmation failed'
      };
    }
  }

  /**
   * Get payment method details from card elements
   */
  public static async createPaymentMethod(cardElement: any, billingDetails: {
    name: string;
    email?: string;
    address?: {
      line1?: string;
      postal_code?: string;
      city?: string;
      country?: string;
    };
  }): Promise<{ success: boolean; paymentMethod?: any; error?: string }> {
    try {
      const stripe = await this.getInstance().getStripe();
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      console.error('Error creating payment method:', error);
      return {
        success: false,
        error: error.message || 'Failed to process payment method'
      };
    }
  }

  /**
   * Handle Stripe errors with detailed messaging
   */
  public static handleError(error: any): { type: StripeErrorType; message: string } {
    // Default error
    let errorType = StripeErrorType.UNKNOWN_ERROR;
    let errorMessage = 'An unexpected error occurred';

    if (error.type) {
      // Handle specific Stripe error types
      switch (error.type) {
        case 'card_error':
          errorType = StripeErrorType.CARD_ERROR;
          errorMessage = error.message || 'Your card was declined';
          break;
        case 'validation_error':
          errorType = StripeErrorType.VALIDATION_ERROR;
          errorMessage = error.message || 'Invalid payment information';
          break;
        case 'authentication_error':
          errorType = StripeErrorType.AUTHENTICATION_ERROR;
          errorMessage = 'Authentication with payment provider failed';
          break;
        case 'rate_limit_error':
          errorType = StripeErrorType.RATE_LIMIT_ERROR;
          errorMessage = 'Too many requests made to the payment provider';
          break;
        case 'api_error':
        case 'api_connection_error':
        case 'idempotency_error':
          errorType = StripeErrorType.SERVER_ERROR;
          errorMessage = 'Payment service temporarily unavailable';
          break;
        default:
          errorType = StripeErrorType.UNKNOWN_ERROR;
          errorMessage = error.message || 'Payment processing error';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Log detailed error for debugging but return user-friendly message
    console.error('Stripe error details:', error);
    
    return {
      type: errorType,
      message: errorMessage
    };
  }
}

export default StripeService; 