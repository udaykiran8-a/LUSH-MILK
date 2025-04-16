import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// This is a simplified implementation since we couldn't install the actual package
// In a real implementation, you would import the ReCAPTCHA component properly

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  size?: 'normal' | 'compact' | 'invisible';
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export function ReCaptcha({ onVerify, size = 'normal' }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Skip if already loaded
    if (typeof window === 'undefined' || window.grecaptcha) {
      return;
    }

    // Create script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    
    // Define callback
    window.onRecaptchaLoad = () => {
      if (!containerRef.current) return;
      
      try {
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          size,
          callback: onVerify,
          'expired-callback': () => {
            toast.error('reCAPTCHA expired. Please verify again.');
          },
          'error-callback': () => {
            toast.error('Error loading reCAPTCHA. Please try again.');
          }
        });
      } catch (error) {
        console.error('reCAPTCHA render error:', error);
      }
    };
    
    script.onload = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(window.onRecaptchaLoad);
      } else {
        window.onRecaptchaLoad();
      }
    };
    
    // Append script to document
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      document.head.removeChild(script);
      delete window.onRecaptchaLoad;
    };
  }, [onVerify, size, siteKey]);
  
  return <div ref={containerRef} className="g-recaptcha my-3" />;
}

export function useReCaptcha() {
  const verify = async (): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.error('reCAPTCHA not loaded');
      return null;
    }
    
    try {
      const token = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: 'submit' }
      );
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      return null;
    }
  };
  
  const reset = (widgetId?: number) => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      return;
    }
    
    try {
      window.grecaptcha.reset(widgetId);
    } catch (error) {
      console.error('reCAPTCHA reset error:', error);
    }
  };
  
  return { verify, reset };
} 