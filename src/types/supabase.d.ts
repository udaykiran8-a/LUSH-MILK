import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    // Functions API
    functions: {
      invoke: (
        functionName: string,
        options?: { 
          body?: object | string;
          headers?: Record<string, string>;
        }
      ) => Promise<{
        data: any;
        error: any;
      }>;
    };
    
    // Realtime API
    channel: (channelName: string) => {
      on: (
        event: string,
        filter: any,
        callback: (payload: any) => void
      ) => any;
      subscribe: () => {
        unsubscribe: () => void;
      };
    };
  }
  
  // Auth extensions
  namespace SupabaseAuth {
    interface GoTrueClient {
      onAuthStateChange: (
        callback: (event: string, session: any) => void
      ) => {
        data: {
          subscription: {
            unsubscribe: () => void;
          };
        };
      };
    }
  }
} 