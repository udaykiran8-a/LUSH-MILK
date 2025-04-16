declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    grecaptcha?: any;
    theme?: 'light' | 'dark';
    size?: 'compact' | 'normal' | 'invisible';
    tabindex?: number;
    onExpired?: () => void;
    onErrored?: () => void;
    ref?: React.RefObject<any>;
    hl?: string;
    badge?: 'bottomright' | 'bottomleft' | 'inline';
    type?: 'image' | 'audio';
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    reset(): void;
    execute(): Promise<string>;
    executeAsync(): Promise<string>;
    getValue(): string | null;
    getWidgetId(): number;
  }
} 