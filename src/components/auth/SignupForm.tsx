
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, EyeIcon, EyeOffIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SimpleCaptcha from '@/components/SimpleCaptcha';

interface SignupFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Zxcvbn password strength levels
const PASSWORD_STRENGTH_LABELS = [
  { label: 'Very Weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Fair', color: 'bg-yellow-500' },
  { label: 'Good', color: 'bg-lime-500' },
  { label: 'Strong', color: 'bg-green-500' }
];

const SignupForm: React.FC<SignupFormProps> = ({ loading, setLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(Date.now()); // Use timestamp as key to force re-render
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  
  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Simple password validation function
  useEffect(() => {
    if (signupPassword) {
      // Update password requirements
      setPasswordRequirements({
        minLength: signupPassword.length >= 8,
        hasLower: /[a-z]/.test(signupPassword),
        hasUpper: /[A-Z]/.test(signupPassword),
        hasNumber: /[0-9]/.test(signupPassword),
        hasSpecial: /[^A-Za-z0-9]/.test(signupPassword)
      });
      
      // Calculate strength score (1-5)
      let score = 0;
      if (signupPassword.length >= 8) score++;
      if (/[a-z]/.test(signupPassword)) score++;
      if (/[A-Z]/.test(signupPassword)) score++;
      if (/[0-9]/.test(signupPassword)) score++;
      if (/[^A-Za-z0-9]/.test(signupPassword)) score++;
      
      setPasswordStrength(score);
    } else {
      setPasswordRequirements({
        minLength: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false
      });
      setPasswordStrength(0);
    }
  }, [signupPassword]);

  // Email validation
  useEffect(() => {
    if (signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      setValidationErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        email: ''
      }));
    }
  }, [signupEmail]);

  // Password confirmation validation
  useEffect(() => {
    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  }, [signupPassword, signupConfirmPassword]);

  // Name validation
  useEffect(() => {
    if (signupName && signupName.trim().length < 3) {
      setValidationErrors(prev => ({
        ...prev,
        name: 'Name must be at least 3 characters'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        name: ''
      }));
    }
  }, [signupName]);

  const resetForm = () => {
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setCaptchaVerified(false);
    setCaptchaKey(Date.now()); // Reset captcha
  };

  const validateForm = () => {
    const errors = { ...validationErrors };
    let isValid = true;
    
    // Name validation
    if (!signupName || signupName.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
      isValid = false;
    }
    
    // Email validation
    if (!signupEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!signupPassword || passwordStrength < 3) {
      errors.password = 'Password must meet the requirements';
      isValid = false;
    }
    
    // Confirm password
    if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    if (!captchaVerified) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          }
        }
      });
      
      if (error) throw error;
      
      // Wait a moment to ensure the auth user is created before adding to users table
      if (data.user?.id) {
        try {
          // Create user profile in users table
          const { error: profileError } = await supabase.from('users').insert({
            auth_uid: data.user.id,
            name: signupName,
            email: signupEmail,
            role: 'customer'
          });
          
          if (profileError) {
            console.error("Error creating user profile:", profileError);
            // Don't throw here, we'll still consider signup successful
          }
        } catch (profileError) {
          console.error("Error in profile creation:", profileError);
        }
      }
      
      toast.success("Registration successful! Please check your email to verify your account.");
      resetForm();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to sign up");
      // Reset captcha on error for security
      setCaptchaKey(Date.now());
      setCaptchaVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaVerify = (verified: boolean) => {
    console.log("CAPTCHA verification status:", verified);
    setCaptchaVerified(verified);
  };

  const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300" />
      )}
      <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className={validationErrors.name ? 'text-red-500' : ''}>
          Full Name
        </Label>
        <Input
          id="name"
          placeholder="Your full name"
          required
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          className={validationErrors.name ? 'border-red-300 focus:border-red-500' : ''}
        />
        {validationErrors.name && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className={validationErrors.email ? 'text-red-500' : ''}>
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Your email address"
          required
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          className={validationErrors.email ? 'border-red-300 focus:border-red-500' : ''}
        />
        {validationErrors.email && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className={validationErrors.password ? 'text-red-500' : ''}>
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className={`pr-10 ${validationErrors.password ? 'border-red-300 focus:border-red-500' : ''}`}
            required
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Password strength meter */}
        {signupPassword && (
          <>
            <div className="flex space-x-1 h-1 mt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level}
                  className={`h-full flex-1 rounded-full ${
                    passwordStrength >= level 
                      ? PASSWORD_STRENGTH_LABELS[passwordStrength - 1].color 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password strength: {passwordStrength > 0 ? PASSWORD_STRENGTH_LABELS[passwordStrength - 1].label : 'None'}
            </p>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <PasswordRequirement met={passwordRequirements.minLength} label="At least 8 characters" />
              <PasswordRequirement met={passwordRequirements.hasLower} label="Lowercase letter" />
              <PasswordRequirement met={passwordRequirements.hasUpper} label="Uppercase letter" />
              <PasswordRequirement met={passwordRequirements.hasNumber} label="Number" />
              <PasswordRequirement met={passwordRequirements.hasSpecial} label="Special character" />
            </div>
          </>
        )}
      </div>
      
      <div className="space-y-2">
        <Label 
          htmlFor="confirm-password" 
          className={validationErrors.confirmPassword ? 'text-red-500' : ''}
        >
          Confirm Password
        </Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your password"
          className={`pr-10 ${validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
          required
          value={signupConfirmPassword}
          onChange={(e) => setSignupConfirmPassword(e.target.value)}
        />
        {validationErrors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
        )}
      </div>
      
      <div className="pt-2">
        <SimpleCaptcha key={captchaKey} onVerify={handleCaptchaVerify} />
      </div>
      
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white flex items-center justify-center"
          disabled={loading || !captchaVerified || passwordStrength < 3}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        By creating an account, you agree to our <a href="/terms" className="text-lushmilk-terracotta hover:underline">Terms of Service</a> and <a href="/privacy" className="text-lushmilk-terracotta hover:underline">Privacy Policy</a>.
      </p>
    </form>
  );
};

export default SignupForm;
