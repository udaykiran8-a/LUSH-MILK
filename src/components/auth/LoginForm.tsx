import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, EyeIcon, EyeOffIcon, Loader2, Mail, Lock, ShieldAlert, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
// Import our custom ReCaptcha component
import { ReCaptcha } from '@/components/security/ReCaptcha';
import { isValidReCaptchaToken } from '@/services/ReCaptchaService';

interface LoginFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ loading, setLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string;
  }>({ score: 0, feedback: '' });

  // Check if account is locked
  useEffect(() => {
    const lockedUntil = localStorage.getItem('account_lock_expiry');
    const attempts = localStorage.getItem('login_attempts');
    
    if (lockedUntil) {
      const expiry = parseInt(lockedUntil, 10);
      if (expiry > Date.now()) {
        setIsLocked(true);
        setLockExpiry(expiry);
        setLoginAttempts(parseInt(attempts || '0', 10));
      } else {
        // Lock expired
        localStorage.removeItem('account_lock_expiry');
        localStorage.setItem('login_attempts', '0');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    } else if (attempts) {
      setLoginAttempts(parseInt(attempts, 10));
    }
  }, []);

  // Countdown timer for account lockout
  useEffect(() => {
    if (isLocked && lockExpiry) {
      const intervalId = setInterval(() => {
        const remaining = Math.max(0, lockExpiry - Date.now());
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setIsLocked(false);
          localStorage.removeItem('account_lock_expiry');
          localStorage.setItem('login_attempts', '0');
          setLoginAttempts(0);
          clearInterval(intervalId);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [isLocked, lockExpiry]);

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      toast.error("Account temporarily locked", {
        description: "Too many failed attempts. Please try again later."
      });
      return;
    }
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    // Only check recaptcha for accounts with multiple failed attempts
    if (loginAttempts >= 2 && !recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }
    
    try {
      setLoading(true);

      // Verify reCAPTCHA token if we have login attempts
      if (loginAttempts >= 2 && recaptchaToken) {
        const isValid = await isValidReCaptchaToken(recaptchaToken);
        if (!isValid) {
          throw new Error("reCAPTCHA verification failed. Please try again.");
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      // Successful login
      toast.success("Login successful!");
      // Reset login attempts
      localStorage.setItem('login_attempts', '0');
      setLoginAttempts(0);
      
      // No need to navigate here as the auth listener will handle it
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('login_attempts', newAttempts.toString());
      
      // Reset reCAPTCHA token after failed attempt
      setRecaptchaToken(null);
      
      // Lock account after 5 failed attempts (15 minute lockout)
      if (newAttempts >= 5) {
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        const expiryTime = Date.now() + lockoutDuration;
        
        setIsLocked(true);
        setLockExpiry(expiryTime);
        localStorage.setItem('account_lock_expiry', expiryTime.toString());
        
        toast.error("Account temporarily locked", {
          description: "Too many failed login attempts. Please try again after 15 minutes."
        });
      } else {
        toast.error(error.message || "Failed to login", {
          description: `Attempt ${newAttempts} of 5 before temporary lockout.`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetLockout = () => {
    // This would typically be protected by additional verification in production
    localStorage.removeItem('account_lock_expiry');
    localStorage.setItem('login_attempts', '0');
    setIsLocked(false);
    setLoginAttempts(0);
    setLockExpiry(null);
    
    toast.success("Lockout has been reset", {
      description: "You can now attempt to log in again."
    });
  };

  // Format remaining lockout time
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Account temporarily locked</h3>
              <p className="text-sm text-red-700 mt-1">
                Too many failed login attempts. Please try again in {formatTimeRemaining(timeRemaining)}.
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs"
                onClick={resetLockout}
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Reset lockout (Demo only)
              </Button>
            </div>
          </div>
        </div>
      )}
    
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            className="pl-10"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            disabled={isLocked || loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-sm text-lushmilk-terracotta hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            className="pl-10 pr-10"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            disabled={isLocked || loading}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLocked || loading}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Show reCAPTCHA after multiple failed attempts */}
      {loginAttempts >= 2 && (
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-2">
            Please verify you are human:
          </p>
          <ReCaptcha onVerify={handleRecaptchaVerify} />
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white flex items-center justify-center"
        disabled={loading || isLocked || (loginAttempts >= 2 && !recaptchaToken)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      
      {loginAttempts > 0 && !isLocked && (
        <p className="text-xs text-center text-gray-500">
          Failed attempts: {loginAttempts}/5 before temporary lockout
        </p>
      )}
    </form>
  );
};

export default LoginForm;
