interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_SUPABASE_SERVICE_KEY: string;
  
  // reCAPTCHA Configuration
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_RECAPTCHA_SECRET_KEY: string;
  
  // Email Configuration
  readonly VITE_RESEND_API_KEY: string;
  readonly VITE_EMAIL_FROM: string;
  readonly VITE_SUPPORT_EMAIL: string;
  
  // Security Keys
  readonly VITE_PAYMENT_SECRET_KEY: string;
  readonly VITE_PAYMENT_SALT: string;
  
  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 