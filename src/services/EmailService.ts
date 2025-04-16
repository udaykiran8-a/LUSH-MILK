import { Resend } from 'resend';
import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const DEFAULT_FROM = import.meta.env.VITE_EMAIL_FROM || 'onboarding@resend.dev';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@lushmilk.in';

// Initialize the Resend client
const resend = new Resend(API_KEY);

/**
 * Send a welcome email to a new user
 * 
 * @param email User's email address
 * @param name User's name (optional)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Welcome to LUSH MILK!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">Welcome to LUSH MILK!</h1>
          <p>Hello ${name || 'there'},</p>
          <p>
            Thank you for creating an account with LUSH MILK. We're excited to have you join our community
            of milk enthusiasts!
          </p>
          <p>
            With your new account, you can:
          </p>
          <ul>
            <li>Browse our premium milk selection</li>
            <li>Save your favorite products</li>
            <li>Track your orders</li>
            <li>Receive exclusive offers</li>
          </ul>
          <p>
            If you have any questions or need assistance, please don't hesitate to contact our support team
            at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
          </p>
          <p>Happy shopping!</p>
          <p>The LUSH MILK Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }

    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send an order confirmation email
 * 
 * @param email User's email address
 * @param orderDetails Order details to include in the email
 */
export async function sendOrderConfirmation(
  email: string, 
  orderDetails: {
    orderId: string;
    date: string;
    items: Array<{name: string; quantity: number; price: number}>;
    total: number;
    address: string;
  }
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: `LUSH MILK Order Confirmation #${orderDetails.orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">Your Order Confirmation</h1>
          <p>Thank you for your order!</p>
          
          <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p><strong>Order #:</strong> ${orderDetails.orderId}</p>
            <p><strong>Date:</strong> ${orderDetails.date}</p>
            <p><strong>Shipping Address:</strong> ${orderDetails.address}</p>
          </div>
          
          <h3>Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #eee;">
                <th style="text-align: left; padding: 10px;">Product</th>
                <th style="text-align: center; padding: 10px;">Qty</th>
                <th style="text-align: right; padding: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="text-align: center; padding: 10px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px;">$${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                <td style="text-align: right; padding: 10px;"><strong>$${orderDetails.total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p style="margin-top: 30px;">
            If you have any questions about your order, please contact us at 
            <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
          </p>
          
          <p>Thank you for shopping with LUSH MILK!</p>
        </div>
      `
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }

    console.log('Order confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Send a password reset email
 * 
 * @param email User's email address
 * @param resetLink Password reset link
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'Reset Your LUSH MILK Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">Reset Your Password</h1>
          <p>We received a request to reset your LUSH MILK account password.</p>
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #b56e58; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>
            This link will expire in 1 hour. If you didn't request a password reset, 
            you can safely ignore this email.
          </p>
          
          <p>
            If you're having trouble clicking the button, copy and paste the URL below into your web browser:
          </p>
          <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }

    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send a contact form submission notification
 * 
 * @param name Sender's name
 * @param email Sender's email
 * @param message Message content
 */
export async function sendContactFormNotification(
  name: string,
  email: string,
  message: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: SUPPORT_EMAIL,
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">New Contact Form Submission</h1>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Please respond to this inquiry as soon as possible.</p>
        </div>
      `,
      reply_to: email
    });

    if (error) {
      console.error('Failed to send contact form notification:', error);
      return false;
    }

    // Send confirmation to the user
    const { error: userError } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: 'We\'ve Received Your Message - LUSH MILK',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #b56e58;">We've Received Your Message</h1>
          <p>Hello ${name},</p>
          <p>
            Thank you for contacting LUSH MILK. We've received your message and will
            get back to you as soon as possible.
          </p>
          <p><strong>Your message:</strong></p>
          <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; padding: 15px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>
            If you have any additional information to share, please reply to this email.
          </p>
          <p>Best regards,</p>
          <p>The LUSH MILK Team</p>
        </div>
      `
    });

    if (userError) {
      console.error('Failed to send confirmation email to user:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in contact form notification:', error);
    return false;
  }
}

/**
 * Handle success/error notifications for email operations
 */
export function notifyEmailStatus(success: boolean, type: 'welcome' | 'order' | 'reset' | 'contact'): void {
  if (success) {
    switch (type) {
      case 'welcome':
        toast.success('Welcome email sent successfully');
        break;
      case 'order':
        toast.success('Order confirmation email sent');
        break;
      case 'reset':
        toast.success('Password reset email sent');
        break;
      case 'contact':
        toast.success('Your message has been sent');
        break;
    }
  } else {
    switch (type) {
      case 'welcome':
        toast.error('Failed to send welcome email');
        break;
      case 'order':
        toast.error('Failed to send order confirmation');
        break;
      case 'reset':
        toast.error('Failed to send password reset email');
        break;
      case 'contact':
        toast.error('Failed to send your message');
        break;
    }
  }
} 