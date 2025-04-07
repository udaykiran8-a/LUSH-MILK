
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SimpleCaptcha from '@/components/SimpleCaptcha';

interface SignupFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ loading, setLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(Date.now()); // Use timestamp as key to force re-render

  const resetForm = () => {
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setCaptchaVerified(false);
    setCaptchaKey(Date.now()); // Reset captcha
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
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
      
      // Create user profile with client_id
      await supabase.from('users').insert({
        auth_uid: data.user?.id,
        name: signupName,
        email: signupEmail,
        role: 'customer'
      });
      
      toast.success("Registration successful! Please check your email to verify your account.");
      resetForm();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaVerify = (verified: boolean) => {
    setCaptchaVerified(verified);
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Your full name"
          required
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Your email address"
          required
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pr-10"
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your password"
          className="pr-10"
          required
          value={signupConfirmPassword}
          onChange={(e) => setSignupConfirmPassword(e.target.value)}
        />
      </div>
      
      <div className="pt-2">
        <SimpleCaptcha key={captchaKey} onVerify={handleCaptchaVerify} />
      </div>
      
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white flex items-center justify-center"
          disabled={loading || !captchaVerified}
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
    </form>
  );
};

export default SignupForm;
