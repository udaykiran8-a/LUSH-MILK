/**
 * Multi-Factor Authentication (MFA) utilities for LUSH MILK application
 * 
 * This module provides functions for implementing TOTP (Time-based One-Time Password)
 * based multi-factor authentication using Supabase Auth.
 */

// Function to set up MFA for a user
export async function setupMFA(supabase: any) {
  try {
    // Initiate the MFA enrollment process
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });
    
    if (error) {
      throw error;
    }
    
    // Return the QR code and secret for the user to save
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id
    };
  } catch (error) {
    console.error('Error setting up MFA:', error);
    throw error;
  }
}

// Function to verify the MFA setup
export async function verifyMFASetup(supabase: any, factorId: string, code: string) {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
      code
    });
    
    if (error) {
      throw error;
    }
    
    // Verify the challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code
    });
    
    if (verifyError) {
      throw verifyError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying MFA setup:', error);
    throw error;
  }
}

// Function to challenge MFA during sign-in
export async function challengeMFA(supabase: any, factorId: string) {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId
    });
    
    if (error) {
      throw error;
    }
    
    return { challengeId: data.id };
  } catch (error) {
    console.error('Error challenging MFA:', error);
    throw error;
  }
}

// Function to verify MFA challenge during sign-in
export async function verifyMFA(supabase: any, factorId: string, challengeId: string, code: string) {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying MFA challenge:', error);
    throw error;
  }
}

// Function to list all MFA factors for the user
export async function listMFAFactors(supabase: any) {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error listing MFA factors:', error);
    throw error;
  }
}

// Function to remove an MFA factor
export async function removeMFAFactor(supabase: any, factorId: string) {
  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing MFA factor:', error);
    throw error;
  }
} 