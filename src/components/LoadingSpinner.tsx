import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  message = 'Loading...',
  fullScreen = false,
}) => {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-[1em] w-[1em]" size={size} />
        {message && (
          <p className="mt-2 text-lushmilk-brown text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 