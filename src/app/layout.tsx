'use client';

import { useEffect } from 'react';
import { appUpdateService } from '@/services/AppUpdateService';
import { UpdateNotification } from '@/components/UpdateNotification';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize app update service
    appUpdateService.initialize();
  }, []);
  
  return (
    <html lang="en">
      <body>
        {children}
        <UpdateNotification />
      </body>
    </html>
  );
} 