# Email System Verification Guide

This document provides steps to verify your LUSH MILK email system is properly configured and operational.

## Database Schema Verification

The LUSH MILK email system relies on several database tables and columns to function correctly. We've provided a verification script to ensure your database schema matches the requirements.

### Running the Verification Script

To check if your database has all the required tables and columns for email functionality:

```bash
npm run db:verify-email-schema
```

This script will:
1. Connect to your Supabase database
2. Check for the existence of required tables:
   - `product_notifications` - Stores user requests for out-of-stock product alerts
   - `carts` - Tracks active shopping carts for abandoned cart reminders
   - `cart_items` - Stores items in shopping carts
3. Verify required columns exist in the above tables and in the `customers` and `products` tables
4. Report any missing tables or columns with clear instructions on how to fix them

### If Verification Fails

If the verification script reports missing tables or columns, you need to run the database migrations:

```bash
npx supabase db push
```

This will apply all migrations, including the email-related tables and columns.

## Automated Email System Testing

After verifying the database schema, you should test the automated email functionality:

1. **Welcome Email Test**
   - Create a new user account through the registration form
   - Check for the welcome email in your inbox

2. **Order Confirmation Test**
   - Place a test order through the checkout process
   - Verify you receive an order confirmation email

3. **Abandoned Cart Test**
   - Add items to your cart but don't complete checkout
   - Wait 24 hours (or modify the timer for testing)
   - Check for a cart reminder email

4. **Product Restock Test**
   - Set up a restock notification for an out-of-stock product
   - Update the product's `in_stock` value to `true` in the admin panel
   - Verify you receive a restock notification email

## Manual Email Trigger Testing

You can also manually trigger emails to test functionality:

```javascript
// In your browser console or a test script
import { sendWelcomeEmail } from '@/services/EmailService';

// Send a test welcome email
sendWelcomeEmail('test@example.com', 'Test User')
  .then(success => console.log('Email sent:', success));
```

## Troubleshooting

If emails are not being sent despite passing database verification:

1. **Check Environment Variables**
   - Verify `VITE_RESEND_API_KEY` is set correctly
   - Ensure `VITE_EMAIL_FROM` and `VITE_SUPPORT_EMAIL` are configured

2. **Check Console Logs**
   - Look for email sending errors in your browser or server console
   - Common issues include API rate limits or authentication failures

3. **Verify Event Triggers**
   - Ensure the automated email system is initialized in your app
   - Check that Supabase Realtime is enabled for your project
   - Verify that database listeners are connecting properly

4. **Test Direct Email Sending**
   - Try sending an email directly using the Resend API to isolate issues
   - Check the Resend dashboard for any account limitations or errors

## Next Steps

Once your email system is verified and operational, consider:

1. Customizing email templates to match your brand
2. Setting up email analytics to track open and click rates
3. Implementing A/B testing for email campaigns
4. Adding additional automated email types for your specific business needs 