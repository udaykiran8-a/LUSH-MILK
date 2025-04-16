# Email Integration for LUSH MILK

## Overview

The LUSH MILK application has been integrated with Resend email service to provide transactional and promotional emails, enhancing the user experience with timely communication. This document outlines the implementation details and usage guidelines.

## API Keys

The application uses the following Resend API key:

- **API Key**: `re_FCXfZopT_KtK3NYj9SS8RT5Uikti7TQ9F`

## Environment Configuration

The email configuration is stored in the following environment variables:

```
VITE_RESEND_API_KEY=re_FCXfZopT_KtK3NYj9SS8RT5Uikti7TQ9F
VITE_EMAIL_FROM=onboarding@resend.dev
VITE_SUPPORT_EMAIL=myselfudaykiran8@gmail.com
```

## Email Service Implementation

A centralized EmailService has been implemented with the following functions:

### 1. Welcome Emails

Sent to new users when they create an account.

```typescript
sendWelcomeEmail(email: string, name?: string): Promise<boolean>
```

Usage example:
```typescript
import { sendWelcomeEmail } from '@/services/EmailService';

// After user registration
const emailSent = await sendWelcomeEmail(user.email, user.fullName);
```

### 2. Order Confirmation Emails

Sent when a customer completes an order.

```typescript
sendOrderConfirmation(
  email: string, 
  orderDetails: {
    orderId: string;
    date: string;
    items: Array<{name: string; quantity: number; price: number}>;
    total: number;
    address: string;
  }
): Promise<boolean>
```

Usage example:
```typescript
import { sendOrderConfirmation } from '@/services/EmailService';

// After order creation
await sendOrderConfirmation(customer.email, {
  orderId: order.id,
  date: formatDate(order.created_at),
  items: order.items,
  total: order.total_amount,
  address: order.delivery_address
});
```

### 3. Password Reset Emails

Sent when a user requests a password reset.

```typescript
sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean>
```

Usage example:
```typescript
import { sendPasswordResetEmail } from '@/services/EmailService';

// After password reset request
const resetLink = `https://lushmilk.in/reset-password?token=${resetToken}`;
const emailSent = await sendPasswordResetEmail(user.email, resetLink);
```

### 4. Contact Form Notifications

Sends notifications when users submit contact forms.

```typescript
sendContactFormNotification(
  name: string,
  email: string,
  message: string
): Promise<boolean>
```

Usage example:
```typescript
import { sendContactFormNotification } from '@/services/EmailService';

// After contact form submission
const notified = await sendContactFormNotification(
  form.name,
  form.email,
  form.message
);
```

## Integration Points

The email service has been integrated at the following points in the application:

1. **User Registration**
   - Sends welcome email after successful account creation
   - Implemented in RegisterForm component

2. **Order Checkout**
   - Sends order confirmation after successful payment
   - Implemented in OrderService createOrder function

3. **Forgot Password Flow**
   - Sends password reset link
   - Implemented in ForgotPasswordForm component

4. **Contact Page**
   - Sends notification to support team and confirmation to user
   - Implemented in ContactForm component

## Email Templates

All email templates are defined inline in the EmailService.ts file. They feature:

- Consistent LUSH MILK branding with terracotta accent color (#b56e58)
- Responsive design that works on mobile devices
- Clear call-to-action buttons where applicable
- Support for HTML formatting

## Testing Emails

During development, emails can be tested by:

1. Using the Resend development environment
2. Checking the Resend dashboard for sent emails
3. Viewing email content and delivery status in the console logs

## Security Considerations

1. The Resend API key is stored as an environment variable
2. Sensitive information should not be included in email content
3. Links in emails should use HTTPS
4. Password reset links should expire after a reasonable time

## Future Improvements

1. Move email templates to separate files for better maintainability
2. Add email analytics tracking
3. Implement email preference management for users
4. Create a dedicated email queue for handling failures and retries 