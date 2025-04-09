
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastActivity: number | null;
}

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    lastActivity: null
  });

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Check for session timeout
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.lastActivity) return;

    const checkInactivity = setInterval(() => {
      if (authState.lastActivity && Date.now() - authState.lastActivity > SESSION_TIMEOUT) {
        // Session timeout - sign out user
        console.log('Session timeout due to inactivity');
        supabase.auth.signOut().then(() => {
          toast.warning('Your session has expired', {
            description: 'Please log in again to continue.',
          });
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [authState.isAuthenticated, authState.lastActivity]);

  // Add activity listeners
  useEffect(() => {
    if (authState.isAuthenticated) {
      // Track user activity
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      const handleActivity = () => updateLastActivity();
      
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      // Set initial activity
      updateLastActivity();

      return () => {
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [authState.isAuthenticated, updateLastActivity]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here
        setAuthState(current => ({
          ...current,
          session,
          user: session?.user ?? null,
          loading: false,
          isAuthenticated: !!session?.user,
          lastActivity: Date.now()
        }));
        
        // Log auth events for debugging
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN') {
          toast.success('Welcome back!', {
            description: 'You have successfully signed in.',
            duration: 3000,
          });
        } else if (event === 'SIGNED_OUT') {
          toast.info('You have been signed out', {
            duration: 3000,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(current => ({
        ...current,
        session,
        user: session?.user ?? null,
        loading: false,
        isAuthenticated: !!session?.user,
        lastActivity: session ? Date.now() : null
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setAuthState(current => ({ ...current, loading: true }));
      await supabase.auth.signOut();
      
      // State will be updated by the auth state listener
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out', {
        description: 'Please try again later.',
      });
      setAuthState(current => ({ ...current, loading: false }));
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    signOut,
    loading: authState.loading,
    isAuthenticated: authState.isAuthenticated,
    updateLastActivity,
  };
};
