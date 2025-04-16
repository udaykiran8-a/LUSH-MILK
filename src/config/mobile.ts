/**
 * Mobile configuration and platform detection utilities
 */

// Detect if running on a mobile device
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

// Detect if running on Android specifically
export const isAndroidDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android/i.test(userAgent.toLowerCase());
};

// Detect Android version
export const getAndroidVersion = (): number | null => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const match = userAgent.toLowerCase().match(/android\s([0-9.]*)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
};

// Detect device category (low-end, mid-range, high-end)
export const getDeviceCategory = (): 'low' | 'mid' | 'high' => {
  // Simple heuristic based on Android version
  const androidVersion = getAndroidVersion();
  
  // Check for common high-end device markers
  const userAgent = navigator.userAgent.toLowerCase();
  const highEndMarkers = ['sm-g', 'sm-n', 'pixel', 'oneplus'];
  
  if (highEndMarkers.some(marker => userAgent.includes(marker)) || androidVersion && androidVersion >= 11) {
    return 'high';
  } else if (androidVersion && androidVersion >= 9) {
    return 'mid';
  } else {
    return 'low';
  }
};

// Get device screen info
export const getDeviceScreenInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  };
};

// Mobile-specific configuration
export const mobileConfig = {
  // Touch interaction settings
  touch: {
    tapDelay: 0, // Remove 300ms tap delay
    minTapSize: 48, // Minimum tap target size (in px)
    feedbackDuration: 150, // Haptic feedback duration (ms)
  },
  
  // Performance settings by device category
  performance: {
    low: {
      imageQuality: 'low',
      enableAnimations: false,
      prefetchLimit: 3,
      lazyLoadImages: true,
      cacheLimit: 50, // MB
      throttleScroll: true
    },
    mid: {
      imageQuality: 'medium',
      enableAnimations: true,
      prefetchLimit: 5,
      lazyLoadImages: true,
      cacheLimit: 100, // MB
      throttleScroll: false
    },
    high: {
      imageQuality: 'high',
      enableAnimations: true,
      prefetchLimit: 8,
      lazyLoadImages: true,
      cacheLimit: 150, // MB
      throttleScroll: false
    }
  },
  
  // Security settings for mobile
  security: {
    storeAuthInSecureStorage: true,
    biometricAuthEnabled: false, // Can be enabled by user
    sessionTimeoutMinutes: 30,
    allowScreenshots: false,
  },
  
  // Network settings
  network: {
    offlineMode: false,
    retryOnReconnect: true,
    cacheStrategy: 'network-first', // 'cache-first', 'network-first', 'network-only'
    timeoutMs: 15000, // 15 seconds
    retryCount: 3
  }
};

// Apply mobile-specific adjustments to the DOM
export const applyMobileOptimizations = (): void => {
  if (isMobileDevice()) {
    // Add viewport meta tag for responsive design
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
    
    // Add mobile class to body
    document.body.classList.add('mobile-device');
    
    if (isAndroidDevice()) {
      // Add device category class
      const deviceCategory = getDeviceCategory();
      document.body.classList.add(`android-${deviceCategory}-device`);
      document.body.classList.add('android-device');
      
      // Apply Android-specific styles
      const androidStyle = document.createElement('style');
      androidStyle.textContent = `
        /* Android-specific styles */
        :root {
          --safe-area-inset-top: 24px;
          --safe-area-inset-bottom: 12px;
        }
        
        /* Fix for input focus issues */
        input, textarea, select {
          font-size: 16px; /* Prevent auto-zoom */
        }
        
        /* Android ripple effect */
        .btn, button, .clickable {
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Better scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Performance optimizations for low-end devices */
        ${deviceCategory === 'low' ? `
          * {
            transition-duration: 0ms !important;
            animation-duration: 0ms !important;
          }
          
          img {
            image-rendering: optimizeSpeed;
          }
          
          /* Reduce paint complexity */
          body * {
            will-change: auto !important;
          }
        ` : ''}
      `;
      document.head.appendChild(androidStyle);
      
      // Apply hardware acceleration selectively based on device capability
      if (deviceCategory !== 'low') {
        const accelerationStyle = document.createElement('style');
        accelerationStyle.textContent = `
          /* Hardware acceleration for transitions */
          .card, .modal, .animated, .product-item, nav, header, footer {
            transform: translateZ(0);
            will-change: transform, opacity;
          }
        `;
        document.head.appendChild(accelerationStyle);
      }
    }
  }
};

// Fix common webview issues
export const fixWebViewIssues = (): void => {
  if (isAndroidDevice()) {
    // Fix for 300ms click delay
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Fix for position:fixed elements disappearing on focus
    const androidVersion = getAndroidVersion();
    if (androidVersion && androidVersion < 9) {
      const fixKeyboardScript = document.createElement('script');
      fixKeyboardScript.textContent = `
        function isFixed(element) {
          const { position } = window.getComputedStyle(element);
          return position === 'fixed';
        }
        
        document.addEventListener('focus', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const fixedElements = Array.from(document.querySelectorAll('*')).filter(isFixed);
            fixedElements.forEach(el => {
              el.dataset.wasFixed = 'true';
              el.style.position = 'absolute';
            });
          }
        }, true);
        
        document.addEventListener('blur', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const fixedElements = Array.from(document.querySelectorAll('[data-was-fixed="true"]'));
            fixedElements.forEach(el => {
              el.style.position = 'fixed';
              delete el.dataset.wasFixed;
            });
          }
        }, true);
      `;
      document.head.appendChild(fixKeyboardScript);
    }
    
    // Fix for scrolling issues
    const scrollFixScript = document.createElement('script');
    scrollFixScript.textContent = `
      // Prevent overscroll bouncing
      document.body.addEventListener('touchmove', function(e) {
        if (!document.scrollingElement.scrollTop && document.scrollingElement.scrollTop === 0) {
          document.scrollingElement.scrollTop = 1;
        }
      }, { passive: true });
    `;
    document.head.appendChild(scrollFixScript);
  }
};

// Optimize images based on device capability
export const setupResponsiveImages = (): void => {
  if (isAndroidDevice()) {
    const deviceCategory = getDeviceCategory();
    const imageQuality = mobileConfig.performance[deviceCategory].imageQuality;
    
    // Apply image optimizations based on device category
    document.querySelectorAll('img').forEach(img => {
      // Add loading attribute
      img.loading = 'lazy';
      
      // Set appropriate resolution based on device category
      if (img.dataset.src) {
        if (imageQuality === 'low' && img.dataset.lowRes) {
          img.src = img.dataset.lowRes;
        } else if (imageQuality === 'medium' && img.dataset.midRes) {
          img.src = img.dataset.midRes;
        } else if (imageQuality === 'high' && img.dataset.highRes) {
          img.src = img.dataset.highRes;
        } else {
          img.src = img.dataset.src;
        }
      }
      
      // Prevent layout shifts with aspect ratio
      if (img.width && img.height) {
        img.style.aspectRatio = `${img.width}/${img.height}`;
      }
    });
  }
};

// Monitor performance in real-time
export const setupPerformanceMonitoring = (): void => {
  if (isAndroidDevice()) {
    // Setup FPS monitoring
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    
    const fpsCounter = document.createElement('div');
    fpsCounter.style.position = 'fixed';
    fpsCounter.style.bottom = '5px';
    fpsCounter.style.right = '5px';
    fpsCounter.style.background = 'rgba(0,0,0,0.5)';
    fpsCounter.style.color = 'white';
    fpsCounter.style.padding = '4px';
    fpsCounter.style.fontSize = '12px';
    fpsCounter.style.zIndex = '9999';
    fpsCounter.style.display = 'none'; // Hide by default, can be enabled for testing
    
    document.body.appendChild(fpsCounter);
    
    function countFrame() {
      frameCount++;
      const now = performance.now();
      
      if (now >= lastFrameTime + 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        frameCount = 0;
        lastFrameTime = now;
        fpsCounter.textContent = `${fps} FPS`;
        
        // Auto-adjust for poor performance
        if (fps < 20) {
          document.body.classList.add('low-performance-mode');
        } else {
          document.body.classList.remove('low-performance-mode');
        }
      }
      
      requestAnimationFrame(countFrame);
    }
    
    requestAnimationFrame(countFrame);
    
    // Monitor memory usage if available
    if ((performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        
        // If memory usage is high, force garbage collection if possible
        if (memoryUsage > mobileConfig.performance[getDeviceCategory()].cacheLimit) {
          // Clear image caches, etc.
          document.querySelectorAll('img[src^="data:"]').forEach(img => {
            img.src = '';
          });
          
          // Clear any large objects from memory
          if (window.gc) window.gc();
        }
      }, 30000); // Check every 30 seconds
    }
  }
};

// Initialize mobile settings
export const initializeMobileEnvironment = (): void => {
  // Only apply optimizations for mobile devices
  if (isMobileDevice()) {
    applyMobileOptimizations();
    fixWebViewIssues();
    
    // Apply performance optimizations
    window.addEventListener('load', () => {
      setupResponsiveImages();
      
      // Only enable performance monitoring in development
      if (import.meta.env.DEV) {
        setupPerformanceMonitoring();
      }
    });
    
    // Prevent 300ms click delay
    const touchScript = document.createElement('script');
    touchScript.src = 'https://unpkg.com/fastclick/lib/fastclick.js';
    touchScript.onload = function() {
      // @ts-ignore - FastClick is added to window
      if (window.FastClick) window.FastClick.attach(document.body);
    };
    document.head.appendChild(touchScript);
    
    // Handle device orientation changes
    window.addEventListener('orientationchange', () => {
      // Force recalculation of layout
      setTimeout(() => {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }, 100);
    });
    
    // Apply low-end device optimizations if needed
    if (getDeviceCategory() === 'low') {
      // Reduce animation frame rate for better performance
      (window as any).requestAnimationFrame = function(callback: FrameRequestCallback) {
        return setTimeout(callback, 1000 / 30); // Limit to 30fps
      };
    }
  }
}; 