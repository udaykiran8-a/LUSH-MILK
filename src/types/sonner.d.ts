declare module 'sonner' {
  import * as React from 'react';
  
  export interface ToasterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
    closeButton?: boolean;
    richColors?: boolean;
    theme?: 'light' | 'dark' | 'system';
    visibleToasts?: number;
    hotkey?: string[];
  }
  
  export interface ToastOptions {
    id?: string | number;
    duration?: number;
    icon?: React.ReactNode;
    promise?: Promise<any>;
    description?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick: () => void;
    };
    onDismiss?: (id: string) => void;
    onAutoClose?: (id: string) => void;
    className?: string;
    style?: React.CSSProperties;
    important?: boolean;
    loading?: boolean;
    dismissible?: boolean;
  }
  
  export const Toaster: React.FC<ToasterProps>;
  
  export interface ToastFunction {
    (message: React.ReactNode, options?: ToastOptions): string | number;
    success: (message: React.ReactNode, options?: ToastOptions) => string | number;
    error: (message: React.ReactNode, options?: ToastOptions) => string | number;
    loading: (message: React.ReactNode, options?: ToastOptions) => string | number;
    info: (message: React.ReactNode, options?: ToastOptions) => string | number;
    dismiss: (id?: string | number) => void;
    custom: (component: (id: string | number) => React.ReactNode, options?: ToastOptions) => string | number;
  }
  
  export const toast: ToastFunction;
  
  export default toast;
} 