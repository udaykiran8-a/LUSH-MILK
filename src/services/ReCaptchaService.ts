/**
 * Service for verifying reCAPTCHA tokens on the server side
 */

const RECAPTCHA_SECRET_KEY = import.meta.env.VITE_RECAPTCHA_SECRET_KEY;
const VERIFICATION_URL = 'https://www.google.com/recaptcha/api/siteverify';

export interface ReCaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  error?: string;
}

/**
 * Verifies a reCAPTCHA token with Google's API
 * 
 * @param token The token received from the client-side reCAPTCHA
 * @returns A promise that resolves to the verification result
 */
export async function verifyReCaptchaToken(token: string): Promise<ReCaptchaVerifyResponse> {
  try {
    // In a real implementation, this would be a server-side function
    // You should never expose your secret key on the client side
    // This is just a demonstration of how the API works
    
    const formData = new FormData();
    formData.append('secret', RECAPTCHA_SECRET_KEY);
    formData.append('response', token);
    
    const response = await fetch(VERIFICATION_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`reCAPTCHA verification failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as ReCaptchaVerifyResponse;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Checks if a reCAPTCHA token is valid with a minimum score (for v3)
 * 
 * @param token The token received from the client-side reCAPTCHA
 * @param minScore The minimum score required (between 0.0 and 1.0)
 * @returns A promise that resolves to true if the token is valid and meets the minimum score
 */
export async function isValidReCaptchaToken(token: string, minScore: number = 0.5): Promise<boolean> {
  const result = await verifyReCaptchaToken(token);
  
  if (!result.success) {
    return false;
  }
  
  // For v3 reCAPTCHA, check the score
  if (result.score !== undefined && result.score < minScore) {
    return false;
  }
  
  return true;
}

/**
 * Generates the HTML script tag for loading reCAPTCHA on a page
 * 
 * @param render 'explicit' for manual rendering or 'onload' for automatic
 * @returns The HTML script tag as a string
 */
export function getReCaptchaScriptTag(render: 'explicit' | 'onload' = 'explicit'): string {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  return `<script src="https://www.google.com/recaptcha/api.js?render=${render === 'explicit' ? 'explicit' : siteKey}" async defer></script>`;
} 