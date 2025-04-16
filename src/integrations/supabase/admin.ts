import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service role key - only use for secure server-side operations
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Supabase URL or Service Key not provided. Check your environment variables.');
}

// This client should ONLY be used for server-side operations that require admin privileges
// NEVER expose this client to the browser
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

// Add an extension to the supabaseAdmin object to provide the admin methods
// This ensures TypeScript compatibility
if (supabaseAdmin) {
  // @ts-ignore - we're extending the client with admin functionalities
  supabaseAdmin.auth.admin = {
    deleteUser: async (userId: string) => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData };
      }
      
      return { error: null };
    }
  };
} 