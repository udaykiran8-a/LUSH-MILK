// Type definitions for Deno standard library
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }
  
  export const env: Env;
}

// Declarations for Deno-specific module imports
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
  }
  
  export function serve(handler: (request: Request) => Response | Promise<Response>, init?: ServeInit): void;
  export function serve(init: ServeInit): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export { createClient } from '@supabase/supabase-js';
}

declare module 'https://esm.sh/resend' {
  export { Resend } from 'resend';
} 