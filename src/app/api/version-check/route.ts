import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

/**
 * Version check endpoint for Android app updates
 * Returns information about the latest app version and update requirements
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const currentVersion = url.searchParams.get('version') || '1.0.0';
  const platform = url.searchParams.get('platform') || 'android';
  
  try {
    // Try to get version information from database first (for remote control)
    const { data: versionData, error } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .order('release_date', { ascending: false })
      .limit(1)
      .single();
    
    if (versionData && !error) {
      // Use version data from database
      const latestVersion = versionData.version_number;
      
      // Get features for this version
      const { data: features } = await supabase
        .from('version_features')
        .select('feature')
        .eq('version_number', latestVersion)
        .eq('platform', platform);
      
      // Parse version numbers for comparison
      const parseVersion = (version: string): number[] => {
        return version.split('.').map(part => parseInt(part, 10));
      };
      
      // Compare versions
      const isUpdateRequired = (current: string, latest: string): boolean => {
        const currentParts = parseVersion(current);
        const latestParts = parseVersion(latest);
        
        // Compare major, minor, patch versions
        for (let i = 0; i < 3; i++) {
          const currentPart = currentParts[i] || 0;
          const latestPart = latestParts[i] || 0;
          
          if (latestPart > currentPart) return true;
          if (latestPart < currentPart) return false;
        }
        
        return false; // Versions are equal
      };
      
      // Determine update status
      const updateAvailable = isUpdateRequired(currentVersion, latestVersion);
      
      // Construct response with database values
      const response = {
        currentVersion,
        latestVersion,
        updateAvailable,
        updateRequired: versionData.force_update || false,
        downloadUrl: versionData.download_url || 'https://play.google.com/store/apps/details?id=com.lushmilk.app',
        features: features?.map(f => f.feature) || []
      };
      
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Error fetching version data from database:', error);
    // Fall back to hardcoded values below
  }
  
  // Fallback to hardcoded values if database query fails
  // Latest versions by platform
  const latestVersions = {
    android: '1.0.1', // Update this with each release
    ios: '1.0.0',     // Not currently used but included for future
  };
  
  // Features in new versions
  const versionFeatures = {
    '1.0.1': [
      'Improved performance on low-end devices',
      'Fixed payment processing issues',
      'Enhanced security for sensitive data',
      'Improved offline functionality'
    ]
  };
  
  // Parse version numbers for comparison
  const parseVersion = (version: string): number[] => {
    return version.split('.').map(part => parseInt(part, 10));
  };
  
  // Compare versions
  const isUpdateRequired = (current: string, latest: string): boolean => {
    const currentParts = parseVersion(current);
    const latestParts = parseVersion(latest);
    
    // Compare major, minor, patch versions
    for (let i = 0; i < 3; i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false; // Versions are equal
  };
  
  // Get latest version for the platform
  const latestVersion = latestVersions[platform as keyof typeof latestVersions] || latestVersions.android;
  
  // Determine update status
  const updateRequired = isUpdateRequired(currentVersion, latestVersion);
  
  // Get features list for the latest version
  const features = versionFeatures[latestVersion as keyof typeof versionFeatures] || [];
  
  // Construct response
  const response = {
    currentVersion,
    latestVersion,
    updateAvailable: updateRequired,
    updateRequired: false, // Set to true for critical updates that require forced updating
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.lushmilk.app',
    features
  };
  
  return NextResponse.json(response);
} 