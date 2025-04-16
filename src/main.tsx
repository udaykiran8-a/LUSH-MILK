import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeMobileEnvironment } from './config/mobile';
import { initializeMobileSecurity } from './services/MobileSecurityService';
import { registerServiceWorker } from './utils/registerServiceWorker';

// Initialize mobile optimizations if on a mobile device
initializeMobileEnvironment();

// Initialize mobile security features
const cleanupSecurity = initializeMobileSecurity();

// Register service worker for offline capabilities
registerServiceWorker();

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Clean up function for security features
window.addEventListener('beforeunload', () => {
  cleanupSecurity();
});
