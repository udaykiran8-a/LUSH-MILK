import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type ValidationResult = {
  authenticated: boolean;
  userId?: string;
  isAdmin?: boolean;
  error?: string;
};

/**
 * Validates if the user is authenticated on the server side
 * @returns ValidationResult with authentication status and user details
 */
export async function validateServerSession(): Promise<ValidationResult> {
  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: { path: string; maxAge: number; domain?: string }) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        authenticated: false,
        error: error?.message || 'No active session found'
      };
    }

    // Get user role from user_metadata or check admin status in a separate table
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return {
      authenticated: true,
      userId: session.user.id,
      isAdmin: userProfile?.role === 'admin',
    };
  } catch (error) {
    console.error('Error validating server session:', error);
    return {
      authenticated: false,
      error: 'Server authentication error'
    };
  }
}

/**
 * Validates if the user is an admin on the server side
 * @returns ValidationResult with admin status
 */
export async function validateAdminAccess(): Promise<ValidationResult> {
  const validation = await validateServerSession();
  
  if (!validation.authenticated) {
    return validation;
  }
  
  if (!validation.isAdmin) {
    return {
      authenticated: true,
      userId: validation.userId,
      isAdmin: false,
      error: 'Access forbidden: Admin privileges required'
    };
  }
  
  return validation;
} 