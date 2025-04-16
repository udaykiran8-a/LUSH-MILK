/**
 * AppUpdateService.ts
 * Handles app update checking and notifications for mobile apps
 */

import { isAndroidDevice } from '@/config/mobile';
import { MonitoringService } from '@/services/MonitoringService';

// Types for version check response
interface VersionCheckResponse {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateRequired: boolean;
  downloadUrl: string;
  features: string[];
}

// Local storage keys
const UPDATE_STORAGE_KEYS = {
  LAST_CHECK: 'lushmilk_last_update_check',
  DISMISSED_VERSION: 'lushmilk_dismissed_update'
};

// Update check configuration
const UPDATE_CONFIG = {
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // Check for updates once a day
  VERSION_CHECK_ENDPOINT: '/api/version-check',
  RETRY_TIMEOUT: 60 * 60 * 1000 // Retry after 1 hour on failure
};

export class AppUpdateService {
  private static instance: AppUpdateService;
  private updateInfo: VersionCheckResponse | null = null;
  private checkInProgress = false;
  private updateListeners: ((info: VersionCheckResponse) => void)[] = [];
  
  // Add a singleton tracking mechanism
  private static isInitialized = false;
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AppUpdateService {
    if (!AppUpdateService.instance) {
      AppUpdateService.instance = new AppUpdateService();
    }
    return AppUpdateService.instance;
  }
  
  /**
   * Add update listener
   */
  public addUpdateListener(listener: (info: VersionCheckResponse) => void): () => void {
    this.updateListeners.push(listener);
    
    // If update info is already available, notify the listener immediately
    if (this.updateInfo && (this.updateInfo.updateAvailable || this.updateInfo.updateRequired)) {
      listener(this.updateInfo);
    }
    
    // Return function to remove the listener
    return () => {
      this.updateListeners = this.updateListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners about update
   */
  private notifyListeners(): void {
    if (this.updateInfo) {
      this.updateListeners.forEach(listener => listener(this.updateInfo!));
    }
  }
  
  /**
   * Get current app version
   */
  public getCurrentVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  }
  
  /**
   * Check if an update is available
   */
  public async checkForUpdates(force = false): Promise<VersionCheckResponse | null> {
    // Skip if not on Android device and not forced
    if (!isAndroidDevice() && !force) {
      return null;
    }
    
    // Skip if check is already in progress
    if (this.checkInProgress) {
      return this.updateInfo;
    }
    
    // Only check once per day unless forced
    const lastCheck = parseInt(localStorage.getItem(UPDATE_STORAGE_KEYS.LAST_CHECK) || '0', 10);
    const now = Date.now();
    
    if (!force && now - lastCheck < UPDATE_CONFIG.CHECK_INTERVAL) {
      return this.updateInfo;
    }
    
    this.checkInProgress = true;
    
    try {
      // Get current version and platform
      const currentVersion = this.getCurrentVersion();
      const platform = isAndroidDevice() ? 'android' : 'web';
      
      // Track update check event
      MonitoringService.trackUpdateEvent('check', currentVersion, '', platform);
      
      // Call version check API
      const response = await fetch(
        `${UPDATE_CONFIG.VERSION_CHECK_ENDPOINT}?version=${currentVersion}&platform=${platform}`
      );
      
      if (!response.ok) {
        throw new Error(`Error checking for updates: ${response.status}`);
      }
      
      // Parse response
      const data: VersionCheckResponse = await response.json();
      this.updateInfo = data;
      
      // Store last check timestamp
      localStorage.setItem(UPDATE_STORAGE_KEYS.LAST_CHECK, now.toString());
      
      // Check if it's a new update (different from previously dismissed)
      const dismissedVersion = localStorage.getItem(UPDATE_STORAGE_KEYS.DISMISSED_VERSION);
      const isNewUpdate = data.latestVersion !== dismissedVersion;
      
      // Notify listeners if update is available/required and not dismissed
      if ((data.updateAvailable || data.updateRequired) && isNewUpdate) {
        this.notifyListeners();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      
      // Set shorter retry interval on failure
      localStorage.setItem(
        UPDATE_STORAGE_KEYS.LAST_CHECK, 
        (now - UPDATE_CONFIG.CHECK_INTERVAL + UPDATE_CONFIG.RETRY_TIMEOUT).toString()
      );
      
      return null;
    } finally {
      this.checkInProgress = false;
    }
  }
  
  /**
   * Dismiss update for current version
   */
  public dismissUpdate(): void {
    if (this.updateInfo) {
      localStorage.setItem(UPDATE_STORAGE_KEYS.DISMISSED_VERSION, this.updateInfo.latestVersion);
    }
  }
  
  /**
   * Open app store to update the app
   */
  public openAppStore(): void {
    if (this.updateInfo?.downloadUrl) {
      window.open(this.updateInfo.downloadUrl, '_blank');
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.lushmilk.app', '_blank');
    }
  }
  
  /**
   * Initialize the update service
   */
  public initialize(): void {
    // Prevent double initialization
    if (AppUpdateService.isInitialized) {
      return;
    }
    
    AppUpdateService.isInitialized = true;
    
    // Check for updates on startup with a slight delay
    setTimeout(() => {
      this.checkForUpdates();
    }, 3000);
    
    // Set up periodic update checks
    setInterval(() => {
      this.checkForUpdates();
    }, UPDATE_CONFIG.CHECK_INTERVAL);
  }
}

// Export singleton instance
export const appUpdateService = AppUpdateService.getInstance(); 