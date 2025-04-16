import { useState, useEffect } from 'react';
import { setupMFA, verifyMFASetup, listMFAFactors, removeMFAFactor } from '@/lib/mfa';
import { toast } from 'sonner';
import Image from 'next/image';

type MFASetupProps = {
  supabase: any;
  userId: string;
  onComplete?: () => void;
};

export default function MFASetup({ supabase, userId, onComplete }: MFASetupProps) {
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'initial' | 'qr-code' | 'verify' | 'success'>('initial');
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [hasMFA, setHasMFA] = useState(false);
  const [setupData, setSetupData] = useState<{ qrCode?: string; secret?: string; factorId?: string }>({});
  const [verificationCode, setVerificationCode] = useState('');
  
  // Fetch existing MFA factors
  useEffect(() => {
    const fetchFactors = async () => {
      try {
        setLoading(true);
        const data = await listMFAFactors(supabase);
        setMfaFactors(data.totp || []);
        setHasMFA((data.totp || []).length > 0);
      } catch (error) {
        console.error('Error fetching MFA factors:', error);
        toast.error('Failed to load MFA settings');
      } finally {
        setLoading(false);
      }
    };
    
    if (supabase && userId) {
      fetchFactors();
    }
  }, [supabase, userId]);
  
  // Start MFA setup process
  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const data = await setupMFA(supabase);
      setSetupData(data);
      setSetupStep('qr-code');
    } catch (error) {
      console.error('Error starting MFA setup:', error);
      toast.error('Failed to start MFA setup');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify MFA setup with code
  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!setupData.factorId) {
        throw new Error('Missing factor ID');
      }
      
      await verifyMFASetup(supabase, setupData.factorId, verificationCode);
      setSetupStep('success');
      toast.success('MFA enabled successfully');
      
      // Refresh factors list
      const data = await listMFAFactors(supabase);
      setMfaFactors(data.totp || []);
      setHasMFA(true);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error verifying MFA setup:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Disable MFA
  const handleDisableMFA = async (factorId: string) => {
    try {
      setLoading(true);
      await removeMFAFactor(supabase, factorId);
      toast.success('MFA disabled successfully');
      
      // Refresh factors list
      const data = await listMFAFactors(supabase);
      setMfaFactors(data.totp || []);
      setHasMFA((data.totp || []).length > 0);
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
      <p className="text-gray-600">
        Add an extra layer of security to your account by enabling two-factor authentication.
      </p>
      
      {loading && <div className="py-4 text-center">Loading...</div>}
      
      {!loading && (
        <>
          {hasMFA ? (
            <div className="border-t pt-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="font-medium">Two-factor authentication is enabled</h3>
                  <p className="text-sm text-gray-500">Your account is protected with an authenticator app.</p>
                </div>
                {mfaFactors.map(factor => (
                  <button
                    key={factor.id}
                    onClick={() => handleDisableMFA(factor.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    disabled={loading}
                  >
                    Disable
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {setupStep === 'initial' && (
                <button
                  onClick={handleStartSetup}
                  className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                  disabled={loading}
                >
                  Set Up Two-Factor Authentication
                </button>
              )}
              
              {setupStep === 'qr-code' && setupData.qrCode && (
                <div className="space-y-4">
                  <h3 className="font-medium">Scan this QR code</h3>
                  <p className="text-sm text-gray-600">
                    Scan the QR code below with your authenticator app (like Google Authenticator, 
                    Authy, or Microsoft Authenticator).
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-lg">
                      <img
                        src={setupData.qrCode}
                        alt="QR Code for MFA setup"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">Manual entry code:</p>
                    <p className="font-mono text-xs mt-1 break-all">{setupData.secret}</p>
                  </div>
                  
                  <button
                    onClick={() => setSetupStep('verify')}
                    className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                  >
                    Continue
                  </button>
                </div>
              )}
              
              {setupStep === 'verify' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Verify your authenticator app</h3>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code from your authenticator app to verify setup.
                  </p>
                  
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      id="verificationCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="123456"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSetupStep('qr-code')}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifySetup}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                      disabled={loading}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
              
              {setupStep === 'success' && (
                <div className="space-y-4 text-center">
                  <div className="text-green-500 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-lg">Two-factor authentication enabled</h3>
                  <p className="text-sm text-gray-600">
                    Your account is now protected with two-factor authentication.
                    Make sure to keep your recovery codes safe.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 