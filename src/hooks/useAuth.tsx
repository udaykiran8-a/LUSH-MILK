
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  lastActivity: number | null;
  userProfile: UserProfile | null;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  client_id: string | null;
  role: string;
  auth_uid: string;
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  updateLastActivity: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Create auth context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    lastActivity: null,
    userProfile: null
  });

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Fetch user profile data from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, client_id, role, auth_uid')
        .eq('auth_uid', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Update user profile in database
  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!authState.user?.id) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('auth_uid', authState.user.id);

      if (error) throw error;

      // Update local state with new profile data
      setAuthState(prev => ({
        ...prev,
        userProfile: prev.userProfile ? { ...prev.userProfile, ...profileData } : null
      }));

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  // Check for session timeout
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.lastActivity) return;

    const checkInactivity = setInterval(() => {
      if (authState.lastActivity && Date.now() - authState.lastActivity > SESSION_TIMEOUT) {
        // Session timeout - sign out user
        console.log('Session timeout due to inactivity');
        supabase.auth.signOut().then(() => {
          toast.warning('Your session has expired', {
            id: 'session-timeout',
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
    // Setup auth state listener
    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth event:', event);
            
            const user = session?.user ?? null;
            const isAuthenticated = !!user;
            
            // First update auth state synchronously
            setAuthState(current => ({
              ...current,
              session,
              user,
              loading: isAuthenticated, // Keep loading true until we fetch the profile
              isAuthenticated,
              lastActivity: isAuthenticated ? Date.now() : null
            }));
            
            // Then fetch user profile if authenticated
            if (isAuthenticated && user) {
              const userProfile = await fetchUserProfile(user.id);
              
              // Now update with the profile data
              setAuthState(current => ({
                ...current,
                userProfile,
                loading: false
              }));
            } else {
              // Make sure loading is false when not authenticated
              setAuthState(current => ({
                ...current,
                loading: false
              }));
            }
            
            // Show auth status toasts
            if (event === 'SIGNED_IN') {
              toast.success('Welcome back!', {
                id: 'signed-in-toast',
                description: 'You have successfully signed in.',
                duration: 3000,
              });
            } else if (event === 'SIGNED_OUT') {
              toast.info('You have been signed out', {
                id: 'signed-out-toast',
                duration: 3000,
              });
            }
          }
        );
        
        return subscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setAuthState(current => ({
          ...current,
          loading: false
        }));
        return null;
      }
    };

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const session = data.session;
        const user = session?.user ?? null;
        const isAuthenticated = !!user;

        setAuthState(current => ({
          ...current,
          session,
          user,
          loading: isAuthenticated, // Keep loading true until we fetch profile
          isAuthenticated,
          lastActivity: isAuthenticated ? Date.now() : null
        }));
        
        if (isAuthenticated && user) {
          const userProfile = await fetchUserProfile(user.id);
          
          setAuthState(current => ({
            ...current,
            userProfile,
            loading: false
          }));
        } else {
          setAuthState(current => ({
            ...current,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setAuthState(current => ({
          ...current,
          loading: false
        }));
      }
    };

    // Initialize auth
    let subscription: any = null;
    
    const initAuth = async () => {
      // First check for existing session
      await checkSession();
      
      // Then setup auth listener
      subscription = await setupAuthListener();
    };

    initAuth();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const signOut = async () => {
    try {
      setAuthState(current => ({ ...current, loading: true }));
      await supabase.auth.signOut();
      
      // Clear user data
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
        lastActivity: null,
        userProfile: null
      });
      
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out', {
        id: 'sign-out-error',
        description: 'Please try again later.',
      });
      setAuthState(current => ({ ...current, loading: false }));
    }
  };
  
  const value = {
    ...authState,
    signOut,
    updateLastActivity,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
