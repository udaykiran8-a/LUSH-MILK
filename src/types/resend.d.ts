declare module 'resend' {
  export interface SendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    reply_to?: string;
    headers?: Record<string, string>;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
    tags?: Array<{
      name: string;
      value: string;
    }>;
  }

  export interface SendEmailResponse {
    id: string;
    from: string;
    to: string | string[];
    created_at: string;
    status: 'success' | 'error';
    error?: {
      message: string;
      code: string;
    };
  }

  export class Emails {
    send(options: SendEmailOptions): Promise<SendEmailResponse>;
  }

  export class Resend {
    constructor(apiKey: string);
    emails: Emails;
  }
} 