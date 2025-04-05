
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  // Generate random text for CAPTCHA
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError(false);
    setVerified(false);
    onVerify(false);
  };

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Verify user input against CAPTCHA
  const verifyInput = () => {
    if (userInput === captchaText) {
      setVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      onVerify(false);
      // Generate new CAPTCHA after failed attempt
      setTimeout(generateCaptcha, 1000);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="text-sm font-medium">Verification</div>
      <div className="flex flex-col space-y-3">
        <div 
          className="bg-gray-100 p-3 rounded-md text-center relative select-none font-mono tracking-wider"
          style={{ 
            background: 'linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb 100%)',
            backgroundSize: '8px 8px',
            letterSpacing: '0.2em',
            textShadow: '1px 1px 1px rgba(255,255,255,0.8)'
          }}
        >
          {captchaText}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" 
            onClick={generateCaptcha}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh CAPTCHA</span>
          </Button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            className={`flex-1 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm`}
            placeholder="Enter the text above"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={verified}
          />
          <Button 
            type="button"
            onClick={verifyInput}
            disabled={userInput.length === 0 || verified}
            className="w-24"
          >
            {verified ? (
              <>
                <Check className="mr-1 h-4 w-4" /> Verified
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm flex items-center">
            <X className="mr-1 h-4 w-4" /> Incorrect verification code. Try again.
          </div>
        )}
        {verified && (
          <div className="text-green-500 text-sm flex items-center">
            <Check className="mr-1 h-4 w-4" /> Verification successful!
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleCaptcha;
