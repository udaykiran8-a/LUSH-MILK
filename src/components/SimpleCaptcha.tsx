
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  
  // Generate a random string for captcha
  const generateCaptchaText = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Draw the captcha on canvas
  const drawCaptcha = (text: string) => {
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    
    // Fill background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    
    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvasRef.width,
        Math.random() * canvasRef.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Add noise (lines)
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvasRef.width, Math.random() * canvasRef.height);
      ctx.lineTo(Math.random() * canvasRef.width, Math.random() * canvasRef.height);
      ctx.stroke();
    }
    
    // Draw captcha text
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Draw each character with slight variations
    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 25;
      const y = canvasRef.height / 2 + (Math.random() * 10 - 5);
      const rotation = (Math.random() * 0.4) - 0.2; // Small rotation between -0.2 and 0.2 radians
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  // Initialize captcha
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptchaText(newCaptcha);
    setUserInput('');
    // Reset verification state
    onVerify(false);
  };

  // Verify user input against captcha
  const verifyCaptcha = () => {
    if (userInput.trim() === captchaText) {
      onVerify(true);
      toast.success('CAPTCHA verified successfully!');
      return true;
    } else {
      onVerify(false);
      toast.error('CAPTCHA verification failed. Please try again.');
      refreshCaptcha();
      return false;
    }
  };

  // Set up canvas ref and initial captcha
  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Draw captcha whenever text changes or canvas is set
  useEffect(() => {
    if (captchaText && canvasRef) {
      drawCaptcha(captchaText);
    }
  }, [captchaText, canvasRef]);

  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="flex items-center">
        <canvas
          ref={setCanvasRef}
          width={200}
          height={60}
          className="border border-gray-200 rounded-md"
        />
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="ml-2" 
          onClick={refreshCaptcha}
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lushmilk-terracotta focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter the text above"
        />
        <Button 
          type="button" 
          onClick={verifyCaptcha}
          className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
        >
          Verify
        </Button>
      </div>
    </div>
  );
};

export default SimpleCaptcha;
