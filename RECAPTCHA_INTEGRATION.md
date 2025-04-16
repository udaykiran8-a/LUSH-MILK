# reCAPTCHA Integration for LUSH MILK

## Overview

Google reCAPTCHA has been integrated into the LUSH MILK application to provide enhanced security by protecting forms from spam and abuse. This document outlines the implementation details and usage guidelines.

## API Keys

The application uses the following reCAPTCHA credentials:

- **Site Key**: `6LeLLRkrAAAAAGiXt4DCnldcxTaR9lLIyE1Il-_J`
  - Used in client-side code to render the reCAPTCHA widget

- **Secret Key**: `6LeLLRkrAAAAACfnfKkzG67Jfur3l7sqVN4r9uQe`
  - Used server-side to verify tokens (should never be exposed to clients)

## Environment Configuration

The reCAPTCHA keys are stored in environment variables:

```
VITE_RECAPTCHA_SITE_KEY=6LeLLRkrAAAAAGiXt4DCnldcxTaR9lLIyE1Il-_J
VITE_RECAPTCHA_SECRET_KEY=6LeLLRkrAAAAACfnfKkzG67Jfur3l7sqVN4r9uQe
```

## Integration Components

### ReCaptcha Component

A custom `ReCaptcha` component has been created to standardize reCAPTCHA usage across the application:

```tsx
// src/components/security/ReCaptcha.tsx
import { useEffect, useRef } from 'react';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  size?: 'normal' | 'compact' | 'invisible';
}

export function ReCaptcha({ onVerify, size = 'normal' }: ReCaptchaProps) {
  // Implementation details...
}
```

### ReCaptchaService

A `ReCaptchaService` provides utility functions for token verification:

```tsx
// src/services/ReCaptchaService.ts
export async function verifyReCaptchaToken(token: string): Promise<ReCaptchaVerifyResponse> {
  // Implementation details...
}

export async function isValidReCaptchaToken(token: string, minScore: number = 0.5): Promise<boolean> {
  // Implementation details...
}
```

## Implementation in Forms

reCAPTCHA has been integrated into the following forms:

1. **Login Form**
   - Triggers after 2 failed login attempts
   - Prevents further login attempts until verification is completed
   - Resets upon successful verification

2. **Registration Form** (pending implementation)
   - Required for all new account registrations
   - Helps prevent automated account creation

3. **Checkout Form** (pending implementation)
   - Added to prevent fraudulent order submissions
   - Uses invisible reCAPTCHA to minimize user friction

## Security Considerations

1. The secret key should never be included in client-side code or repositories
2. Server-side verification should be used for all critical operations
3. Consider implementing rate limiting in addition to reCAPTCHA
4. Monitor reCAPTCHA analytics for suspicious patterns

## Future Enhancements

1. Implement adaptive reCAPTCHA that only appears when suspicious activity is detected
2. Add reCAPTCHA Enterprise for enhanced fraud detection
3. Implement score-based filtering for reCAPTCHA v3

## Reference Documentation

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Verification API Documentation](https://developers.google.com/recaptcha/docs/verify) 