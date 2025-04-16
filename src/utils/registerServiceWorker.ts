/**
 * Service Worker Registration Utility
 * This file handles the registration and lifecycle management of the service worker
 * for offline capabilities and improved performance.
 */

/**
 * Register the service worker
 * @returns Promise that resolves when the service worker is registered
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Set up update handling
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed but waiting to activate
                  triggerUpdateNotification();
                }
              });
            }
          });
          
          return registration;
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          return undefined;
        });
    });
  }
  
  // Return resolved promise if service workers are not supported
  return Promise.resolve(undefined);
}

/**
 * Update the service worker
 * This will trigger the service worker to activate immediately
 */
export function updateServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

/**
 * Check if there's a new service worker available
 * @returns Promise that resolves to true if a new service worker is available
 */
export async function checkForServiceWorkerUpdate(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    
    return !!registration.waiting;
  }
  
  return false;
}

/**
 * Trigger notification about available update
 */
function triggerUpdateNotification(): void {
  const event = new CustomEvent('serviceWorkerUpdateAvailable');
  window.dispatchEvent(event);
}

/**
 * Add event listener for service worker updates
 * @param callback Function to call when an update is available
 */
export function onServiceWorkerUpdate(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener('serviceWorkerUpdateAvailable', handler);
  
  // Return a cleanup function
  return () => window.removeEventListener('serviceWorkerUpdateAvailable', handler);
} 