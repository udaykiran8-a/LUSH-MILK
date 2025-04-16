declare module 'next/server' {
  export interface NextRequest {
    cookies: {
      get: (name: string) => { value: string } | undefined;
    };
    headers: Headers;
    nextUrl: URL;
  }

  export interface NextResponse {
    cookies: {
      set: (name: string, value: string, options?: any) => void;
    };
    headers: Headers;
  }

  export function NextResponse(
    body?: BodyInit | null,
    options?: ResponseInit
  ): NextResponse;

  export function NextRequest(
    input: RequestInfo,
    init?: RequestInit
  ): NextRequest;

  export function redirect(url: string): NextResponse;
}

declare module 'next/headers' {
  export function cookies(): {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options?: any) => void;
  };
  
  export function headers(): Headers;
}

declare module 'next/image' {
  import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    fill?: boolean;
  }
  
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module 'next/link' {
  import React from 'react';
  
  export interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: React.ReactNode;
    target?: string;
    className?: string;
  }
  
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/router' {
  export interface Router {
    pathname: string;
    query: Record<string, string | string[]>;
    asPath: string;
    push(url: string, as?: string, options?: any): Promise<boolean>;
    replace(url: string, as?: string, options?: any): Promise<boolean>;
    back(): void;
    reload(): void;
  }
  
  export function useRouter(): Router;
}

declare module '@supabase/auth-helpers-nextjs' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export function createServerSupabaseClient(ctx: any): SupabaseClient;
  export function createRouteHandlerSupabaseClient(): SupabaseClient;
} 