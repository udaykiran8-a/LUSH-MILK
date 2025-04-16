import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  
  // Use refs to prevent race conditions and stale closure issues
  const authStateRef = useRef<AuthState>(authState);
  
  // Keep the ref in sync with state
  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      lastActivity: Date.now()
    }));
  }, []);

  // Fetch user profile data from database with proper error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, client_id, role, auth_uid')
        .eq('auth_uid', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        toast.error('Could not load user profile', { 
          description: 'Please try reloading the page',
          duration: 5000
        });
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast.error('Unexpected error loading profile', { 
        description: 'Please try signing in again',
        duration: 5000
      });
      return null;
    }
  }, []);

  // Create customer record for new users
  const ensureCustomerRecordExists = useCallback(async (userId: string, userEmail: string, userName: string) => {
    try {
      // First check if customer record already exists
      const { data: existingCustomer, error: queryError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (queryError) {
        console.error('Error checking for customer record:', queryError);
        return;
      }
      
      // Only create if it doesn't exist
      if (!existingCustomer) {
        // Create a customer record
        const { error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            subscription_type: 'none',
            delivery_preference: 'morning'
          });
        
        if (insertError) {
          console.error('Error creating customer record:', insertError);
          return;
        }
        
        console.log('Customer record created for user:', userId);
      }
    } catch (error) {
      console.error('Failed to ensure customer record exists:', error);
    }
  }, []);

  // Update user profile in database with better error handling
  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    if (!authStateRef.current.user?.id) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('auth_uid', authStateRef.current.user.id);

      if (error) throw error;

      // Update local state with new profile data
      setAuthState(prev => ({
        ...prev,
        userProfile: prev.userProfile ? { ...prev.userProfile, ...profileData } : null
      }));

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', { 
        description: error.message || 'Please try again later',
        duration: 5000
      });
    }
  };

  // Check for session timeout using a single interval and ref
  useEffect(() => {
    const inactivityCheckInterval = setInterval(() => {
      const { isAuthenticated, lastActivity } = authStateRef.current;
      
      if (isAuthenticated && lastActivity && (Date.now() - lastActivity > SESSION_TIMEOUT)) {
        // Session timeout - sign out user
        console.log('Session timeout due to inactivity');
        clearInterval(inactivityCheckInterval);
        
        supabase.auth.signOut().then(() => {
          toast.warning('Your session has expired', {
            id: 'session-timeout',
            description: 'Please log in again to continue.',
          });
        }).catch(error => {
          console.error('Error signing out after timeout:', error);
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(inactivityCheckInterval);
  }, []);

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

  // Main auth setup effect
  useEffect(() => {
    let subscription: { data: { subscription: any } } | null = null;
    
    const setupAuth = async () => {
      try {
        // Setup auth state listener
        const setupAuthListener = async () => {
          try {
            const { data } = await supabase.auth.onAuthStateChange(
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
                  try {
                    const userProfile = await fetchUserProfile(user.id);
                    
                    // If this is a sign up or sign in, ensure customer record exists
                    if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
                      await ensureCustomerRecordExists(
                        user.id, 
                        user.email || '',
                        userProfile?.name || user.email || 'New Customer'
                      );
                    }
                    
                    // Now update with the profile data
                    setAuthState(current => ({
                      ...current,
                      userProfile,
                      loading: false
                    }));
                  } catch (profileError) {
                    console.error('Error loading user profile:', profileError);
                    setAuthState(current => ({
                      ...current,
                      loading: false
                    }));
                  }
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
                } else if (event === 'SIGNED_UP') {
                  toast.success('Welcome to Lush Milk!', {
                    id: 'signed-up-toast',
                    description: 'Your account has been created successfully.',
                    duration: 5000,
                  });
                } else if (event === 'SIGNED_OUT') {
                  toast.info('You have been signed out', {
                    id: 'signed-out-toast',
                    duration: 3000,
                  });
                }
              }
            );
            
            subscription = data;
            return data.subscription;
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
            try {
              const userProfile = await fetchUserProfile(user.id);
              
              setAuthState(current => ({
                ...current,
                userProfile,
                loading: false
              }));
            } catch (profileError) {
              console.error('Error loading initial user profile:', profileError);
              setAuthState(current => ({
                ...current,
                loading: false
              }));
            }
          } else {
            setAuthState(current => ({
              ...current,
              loading: false
            }));
          }
        } catch (sessionError) {
          console.error('Error checking session:', sessionError);
          setAuthState(current => ({
            ...current,
            loading: false
          }));
        }

        // Set up auth listener after checking session
        await setupAuthListener();
      } catch (error) {
        console.error('Critical auth setup error:', error);
        setAuthState(current => ({
          ...current,
          loading: false
        }));
      }
    };

    setupAuth();

    // Cleanup subscription on unmount
    return () => {
      if (subscription && subscription.data.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile, ensureCustomerRecordExists]);

  // Sign out function with error handling
  const signOut = async () => {
    try {
      setAuthState(current => ({
        ...current,
        loading: true
      }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear local state
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
        lastActivity: null,
        userProfile: null
      });
      
      toast.success('You have been signed out');
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
      toast.error('Failed to sign out', {
        description: error.message || 'Please try again',
        duration: 5000
      });
      
      setAuthState(current => ({
        ...current,
        loading: false
      }));
    }
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider
        value={{
          ...authState,
          signOut,
          updateLastActivity,
          updateUserProfile
        }}
      >
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
