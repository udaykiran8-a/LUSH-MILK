# Automated Email System for LUSH MILK

## Overview

The LUSH MILK application includes a comprehensive automated email system that sends emails without human intervention. This system handles various types of communications, from transactional emails to marketing campaigns, ensuring timely and relevant communication with users.

## Architecture

The automated email system consists of three main components:

1. **Event-Driven Triggers**: Emails sent automatically when specific database events occur
2. **Scheduled Jobs**: Emails sent on regular intervals or at specific times
3. **Supabase Edge Functions**: Serverless functions that handle complex email logic

## Event-Driven Emails

These emails are triggered by specific user actions or system events:

### 1. Welcome Emails

Automatically sent when a user creates a new account. The system:
- Listens for Supabase Auth `SIGNED_UP` events
- Retrieves user data (name, email) from the session
- Uses a tracking mechanism to prevent duplicate emails
- Sends personalized welcome content

### 2. Order Confirmation Emails

Automatically sent when an order is marked as completed. The system:
- Uses real-time database change notifications via Supabase Realtime
- Listens specifically for order status changes to "completed"
- Fetches order details including items, prices, and shipping information
- Generates and sends a detailed order receipt

### 3. Password Reset Emails

Automatically sent when a user requests a password reset. The system:
- Listens for Supabase Auth `PASSWORD_RECOVERY` events
- Generates a secure, time-limited reset link
- Sends instructions with the reset link

## Scheduled Emails

These emails are sent on a schedule rather than in response to immediate events:

### 1. Abandoned Cart Reminders

Sent to users who added items to their cart but didn't complete checkout. The system:
- Runs a scheduled check every 24 hours
- Identifies carts that have been inactive for more than 24 hours
- Uses a Supabase Edge Function to generate personalized cart reminder emails
- Updates the cart record to prevent duplicate reminders

### 2. Product Restock Notifications

Sent to users who signed up for notifications when an out-of-stock product becomes available. The system:
- Periodically checks product notifications table
- Cross-references with current product inventory
- Sends notifications when previously unavailable products are back in stock

### 3. Weekly Newsletters

Sent to users who have opted in to marketing communications. The system:
- Sends on a specific day of the week (Sunday)
- Fetches all subscribed users from the database
- Batches emails in groups of 50 to avoid rate limits
- Tracks sent newsletters to prevent duplicates

## Implementation Details

### Tracking Mechanism

To prevent duplicate emails, the system uses:
- In-memory Map storage for session tracking
- Database records for long-term tracking
- Unique keys based on event type, recipient, and timestamp

### Error Handling

The automated email system includes robust error handling:
- Failed emails are logged for further investigation
- Critical errors trigger system notifications
- Non-critical errors allow the system to continue operation

### Performance Considerations

The system is designed to handle high volumes efficiently:
- Batch processing for bulk emails
- Rate limiting to avoid hitting API caps
- Asynchronous processing to not block the main application

## Configuration and Customization

Environment variables control system behavior:
- `VITE_RESEND_API_KEY`: API key for the Resend email service
- `VITE_EMAIL_FROM`: Default sender email address
- `VITE_SUPPORT_EMAIL`: Support email for user inquiries

## How to Use

No human intervention is required! The system automatically:
1. Initializes on application startup via `initializeAutomatedEmails()` in the main app component
2. Sets up all event listeners and schedulers
3. Provides a cleanup function to properly close connections when needed

## Monitoring and Debugging

To monitor the automated email system:
1. Check application logs for email send status
2. View the Resend dashboard for detailed delivery statistics
3. Run database queries on relevant tables to see email tracking data

## Security Considerations

The automated system maintains security by:
1. Using environment variables for sensitive credentials
2. Creating limited-time tokens for authentication links
3. Following best practices for email security 