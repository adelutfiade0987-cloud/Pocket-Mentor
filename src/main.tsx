import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Early global capture for Android / Chromium beforeinstallprompt event
declare global {
  interface Window {
    deferredPWAInstallPrompt?: any;
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPWAInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

// Explicit Service Worker Registration for PWA Criteria & Offline Cache
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                }
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
