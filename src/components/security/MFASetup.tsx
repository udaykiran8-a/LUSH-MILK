import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MFASetupProps {
  userId: string;
}

export function MFASetup({ userId }: MFASetupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  
  useEffect(() => {
    checkMFAStatus();
  }, [userId]);
  
  const checkMFAStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      // Check if there's an enabled TOTP factor
      const hasTOTP = data.totp.find(factor => factor.status === 'verified');
      setIsMFAEnabled(!!hasTOTP);
      
    } catch (error) {
      console.error('Error checking MFA status:', error);
      toast.error('Failed to check MFA status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startMFAEnrollment = async () => {
    try {
      setIsEnrolling(true);
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setFactorId(data.id);
      
    } catch (error) {
      console.error('Error starting MFA enrollment:', error);
      toast.error('Failed to start MFA setup');
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const verifyMFA = async () => {
    if (!factorId) {
      toast.error('MFA setup not initiated correctly');
      return;
    }
    
    try {
      setIsVerifying(true);
      
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode
      });
      
      if (error) throw error;
      
      // MFA was successfully verified
      setIsMFAEnabled(true);
      setQrCode(null);
      setVerificationCode('');
      toast.success('MFA setup successfully completed');
      
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast.error('Failed to verify MFA code. Please try again');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const disableMFA = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await supabase.auth.mfa.listFactors();
      const totpFactor = data.totp.find(factor => factor.status === 'verified');
      
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id
        });
        
        if (error) throw error;
        
        setIsMFAEnabled(false);
        toast.success('MFA has been disabled');
      }
      
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isMFAEnabled) {
    return (
      <div className="space-y-4">
        <Alert className="bg-success-50 border-success-200">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success-700">MFA is enabled</AlertTitle>
          <AlertDescription className="text-success-600">
            Your account is secured with multi-factor authentication
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Multi-Factor Authentication</h3>
            <p className="text-xs text-gray-500">
              Disable MFA for your account. Not recommended for security reasons.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={disableMFA}
            disabled={isLoading}
          >
            Disable MFA
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {!qrCode ? (
        <>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MFA is not enabled</AlertTitle>
            <AlertDescription>
              Your account is less secure without multi-factor authentication
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Multi-Factor Authentication</h3>
              <p className="text-xs text-gray-500">
                Enable MFA to add an extra layer of security to your account
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={startMFAEnrollment}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Enable MFA
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Set up Multi-Factor Authentication</h3>
          
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Install an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy
            </li>
            <li>
              Scan the QR code below with your authenticator app
            </li>
            <li>
              Enter the 6-digit verification code from your app
            </li>
          </ol>
          
          <div className="flex justify-center py-4">
            <div className="border p-2 rounded bg-white">
              <img src={qrCode} alt="MFA QR Code" width={200} height={200} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setQrCode(null);
                setVerificationCode('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyMFA}
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 