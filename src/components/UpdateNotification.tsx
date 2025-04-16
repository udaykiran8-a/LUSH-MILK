import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { appUpdateService } from '@/services/AppUpdateService';
import { isAndroidDevice } from '@/config/mobile';
import { useTheme } from 'next-themes';

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className }: UpdateNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    latestVersion: string;
    updateRequired: boolean;
    features: string[];
  } | null>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Only show on Android devices
    if (!isAndroidDevice()) return;
    
    // Add listener for update notifications
    const removeListener = appUpdateService.addUpdateListener((info) => {
      setUpdateInfo({
        latestVersion: info.latestVersion,
        updateRequired: info.updateRequired,
        features: info.features
      });
      setShowNotification(true);
    });
    
    // Check for updates on component mount
    appUpdateService.checkForUpdates();
    
    // Cleanup listener on unmount
    return () => {
      removeListener();
    };
  }, []);
  
  // Handle update now button
  const handleUpdate = () => {
    appUpdateService.openAppStore();
    
    // Only dismiss if not a required update
    if (!updateInfo?.updateRequired) {
      setShowNotification(false);
    }
  };
  
  // Handle later button
  const handleLater = () => {
    appUpdateService.dismissUpdate();
    setShowNotification(false);
  };
  
  if (!showNotification || !updateInfo) {
    return null;
  }
  
  // Dynamic background color based on theme
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${bgColor} shadow-lg border-t ${borderColor} ${className}`}>
      <div className="container mx-auto">
        <h3 className={`font-semibold text-lg mb-2 ${textColor}`}>
          {updateInfo.updateRequired 
            ? 'Required Update Available' 
            : 'Update Available'}
        </h3>
        <p className={`mb-2 ${mutedTextColor}`}>
          Version {updateInfo.latestVersion} is now available.
        </p>
        
        {updateInfo.features.length > 0 && (
          <div className="mb-3">
            <p className={`text-sm font-medium ${textColor}`}>What's new:</p>
            <ul className={`text-sm ${mutedTextColor} list-disc pl-5`}>
              {updateInfo.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-4">
          {!updateInfo.updateRequired && (
            <Button variant="outline" onClick={handleLater}>
              Later
            </Button>
          )}
          <Button onClick={handleUpdate}>
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
} 