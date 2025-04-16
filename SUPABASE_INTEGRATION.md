# Supabase Integration for LUSH MILK

## API Keys and Configuration

The LUSH MILK application has been set up with the following Supabase credentials:

- **Project URL**: `https://oyhuqbosxspxvmocoozo.supabase.co`
- **Anonymous Key**: For client-side operations with Row Level Security (RLS)
- **Service Role Key**: For server-side admin operations

## Environment Variables

The application uses the following environment variables:

```
VITE_SUPABASE_URL=https://oyhuqbosxspxvmocoozo.supabase.co
VITE_SUPABASE_KEY=[anon-key]
VITE_SUPABASE_SERVICE_KEY=[service-role-key]
```

## Client Setup

There are two Supabase clients configured:

1. **Standard Client** (`src/integrations/supabase/client.ts`):
   - Uses the anonymous key with RLS protection
   - For all client-side database operations
   - Used for general authentication and data access

2. **Admin Client** (`src/integrations/supabase/admin.ts`):
   - Uses the service role key with admin privileges
   - For server-side operations that require bypassing RLS
   - Only use for secure operations like account deletion

## Database Services

The application uses a centralized DatabaseService pattern with modules for:

- **UserDatabase**: User profile and customer operations
- **OrderDatabase**: Order management
- **ProductDatabase**: Product catalog operations
- **PaymentDatabase**: Payment processing

## TypeScript Configuration

TypeScript has been configured to support the Supabase integration with:

1. Custom type declarations for third-party libraries
2. JSX configuration for React components
3. Path aliases for cleaner imports

## Security Considerations

1. The service role key can bypass Row Level Security - it should only be used in secure server contexts and never exposed to the client.
2. Row Level Security policies should be properly configured on all tables to protect data even with the anonymous key.
3. Regular security audits should be performed to ensure proper data access controls.

## Local Development

To run the application locally with Supabase:

1. Ensure the `.env` file exists with the correct credentials
2. Run `npm run db:start` to start the local Supabase instance if using local development
3. Run `npm run dev` to start the application

## Database Operations Example

```typescript
// Get user profile
const profile = await UserDatabase.getProfile(userId);

// Update customer information
await UserDatabase.updateCustomer(userId, {
  full_name: "John Doe",
  phone: "+1234567890"
});

// Delete account (uses admin privileges)
await UserDatabase.deleteAccount(userId);
``` 