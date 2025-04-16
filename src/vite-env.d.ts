/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_PAYMENT_SECRET_KEY: string;
  readonly VITE_PAYMENT_SALT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
