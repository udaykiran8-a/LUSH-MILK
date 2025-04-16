# LUSH MILK Automated Email System

## Overview

The LUSH MILK application uses an automated email system to handle various types of user communications without manual intervention. This system is designed to be reliable, scalable, and provides timely information to customers throughout their journey with the application.

## Architecture

The automated email system is built on:

1. **EmailService**: Core service for formatting and sending emails using Resend
2. **AutomatedEmailService**: Handles triggers and scheduling of automated emails
3. **Database Listeners**: Monitors database events to trigger relevant emails
4. **Scheduler**: Manages timing for recurring and delayed emails

## Event-Driven Emails

These emails are triggered automatically in response to specific user actions or system events:

| Email Type | Trigger | Purpose |
|------------|---------|---------|
| Welcome Email | New user registration | Greet new users and provide getting started information |
| Order Confirmation | Order completion | Confirm purchase details and provide tracking information |
| Password Reset | Password reset request | Deliver secure password reset links |
| Shipping Update | Order status change | Notify customers about shipping status changes |
| Payment Failed | Failed payment attempt | Alert users to payment issues and suggest solutions |

## Scheduled Emails

These emails are sent according to specific timing rules:

| Email Type | Schedule | Purpose |
|------------|----------|---------|
| Abandoned Cart Reminder | 24 hours after cart abandonment | Re-engage customers who left items in cart |
| Product Restock | Upon inventory update | Notify interested customers when out-of-stock items return |
| Weekly Newsletter | Every Sunday morning | Deliver product updates and promotions to subscribers |
| Loyalty Rewards | Monthly on 1st day | Inform users of accumulated rewards or special offers |

## Implementation Details

### Email Triggering Mechanism

The system uses Supabase Realtime database listeners to monitor relevant tables for changes:

```typescript
// Example of setting up a listener for order status changes
const orderSubscription = supabase
  .channel('order-status-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: 'status=eq.completed'
    },
    async (payload) => {
      // Email sending logic here
    }
  )
  .subscribe();
```

### Scheduling Mechanism

For time-based emails, the system uses:

1. **Short-term scheduling**: JavaScript `setTimeout` for emails needed within minutes/hours
2. **Recurring scheduling**: `setInterval` for regularly occurring emails
3. **Database tracking**: Records of when emails were last sent to prevent duplicates

```typescript
// Example of a scheduler for abandoned cart emails
const abandonedCartInterval = setInterval(async () => {
  // Logic to find abandoned carts and send reminder emails
}, 24 * 60 * 60 * 1000); // Runs every 24 hours
```

## Configuration

The email system is configured in the following locations:

- `.env`: Contains API keys and configuration for the email service
- `EmailService.ts`: Defines email templates and sending functions
- `AutomatedEmailService.ts`: Contains trigger and scheduling logic

## Tracking and Monitoring

Each email sent is tracked to:

1. Prevent duplicate emails
2. Record delivery status
3. Track open/click rates (via Resend analytics)

Failed emails are logged to the application error log with detailed error information.

## Error Handling & Retries

The system implements:

1. **Immediate retry**: Attempts to resend immediately for network errors
2. **Exponential backoff**: For persistent failures, waits progressively longer between retries
3. **Fallback mechanism**: For critical emails that repeatedly fail, stores them for manual review

## Performance Considerations

To prevent system overload:

1. Emails are sent in batches when dealing with large numbers (like newsletters)
2. Rate limiting is implemented to comply with Resend's sending limits
3. Non-critical emails are queued and processed during low-traffic periods

## Security Considerations

The email system enforces:

1. Email verification before sending sensitive information
2. No inclusion of sensitive data like passwords in email content
3. Protection against email enumeration attacks
4. Proper authentication for API endpoints that trigger emails

## How to Use

### Adding New Email Templates

1. Create the template HTML in `src/templates`
2. Add the corresponding send function in `EmailService.ts`
3. Register any triggers or schedules in `AutomatedEmailService.ts`

### Testing Emails

For testing purposes:

1. Set `EMAIL_TEST_MODE=true` in development to redirect all emails to test addresses
2. Use the debug interface at `/admin/email-debug` (admin access only) to view queued emails
3. View email logs in the admin dashboard

### Disabling Automated Emails

For maintenance or debugging:

1. Set `DISABLE_AUTOMATED_EMAILS=true` in environment variables
2. Individual email types can be disabled via feature flags in the admin panel

## Troubleshooting

Common issues:

1. **Emails not sending**: Check Resend API credentials and rate limits
2. **Duplicate emails**: Verify email tracking system is working correctly
3. **Delayed emails**: Check scheduler is running and not blocked by long-running operations 