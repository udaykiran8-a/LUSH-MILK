import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendWelcomeEmail, notifyEmailStatus } from '@/services/EmailService';
import { ReCaptcha } from '@/components/security/ReCaptcha';

interface RegisterFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ loading, setLoading }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error("You must accept the Terms of Service to create an account");
      return;
    }
    
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }
    
    setLoading(true);
    
    try {
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            accept_marketing: acceptMarketing
          }
        }
      });
      
      if (error) throw error;
      
      // Create customer record
      const { error: customerError } = await supabase
        .from('customers')
        .insert([{ 
          user_id: data.user?.id,
          email: email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          marketing_consent: acceptMarketing
        }]);
      
      if (customerError) {
        console.error("Error creating customer record:", customerError);
        // Non-critical, continue
      }
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail(email, fullName);
      
      // Show success message
      toast.success("Registration successful!", {
        description: "We've sent you an email to verify your account."
      });
      
      // Navigate to login
      navigate('/login');
      
      // Show email notification (if it failed)
      if (!emailSent) {
        notifyEmailStatus(false, 'welcome');
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="fullName"
            type="text"
            placeholder="Your full name"
            className="pl-10"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Choose a secure password"
            className="pl-10 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Must be at least 8 characters long with a mix of letters, numbers, and symbols
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-tight">
            I agree to the <a href="/terms" className="text-lushmilk-terracotta hover:underline">Terms of Service</a> and <a href="/privacy" className="text-lushmilk-terracotta hover:underline">Privacy Policy</a>
          </Label>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="marketing" 
            checked={acceptMarketing}
            onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="marketing" className="text-sm font-normal leading-tight">
            I want to receive updates about products, promotions and other news
          </Label>
        </div>
      </div>
      
      <div className="py-2">
        <p className="text-sm text-gray-600 mb-2">
          Please verify you are human:
        </p>
        <ReCaptcha onVerify={handleRecaptchaVerify} />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white flex items-center justify-center"
        disabled={loading || !acceptTerms || !recaptchaToken}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create account <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default RegisterForm; 