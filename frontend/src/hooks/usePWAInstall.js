import { useState, useEffect, useCallback } from 'react';

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissedAt, setDismissedAt] = useState(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissTime = new Date(dismissed);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (dismissTime > sevenDaysAgo) {
        setDismissedAt(dismissTime);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('[PWA] Install not available yet - browser may need to meet PWA criteria');
      console.log('[PWA] Check: 1) Valid manifest.json 2) Service worker registered 3) HTTPS 4) Icons exist');
      
      // Show user-friendly message
      if (isIOS) {
        // iOS needs manual instructions
        return 'ios';
      } else {
        // Chrome/Edge: Try to trigger anyway or show message
        alert('To install this app:\n\n1. Click the install icon in your browser address bar (⊕ or 📥)\n2. Or use browser menu → "Install Cecilia Boutique"\n3. Make sure all app icons are generated (see /icons/ folder)');
        return false;
      }
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        handleDismiss();
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install error:', error);
      return false;
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setIsInstallable(false);
    const now = new Date();
    setDismissedAt(now);
    localStorage.setItem('pwa-install-dismissed', now.toISOString());
  }, []);

  const shouldShowPrompt = useCallback(() => {
    // Don't show if already installed
    if (isInstalled) return false;
    
    // Don't show if dismissed recently
    if (dismissedAt) return false;
    
    // Don't show on login page
    if (window.location.pathname === '/login') return false;
    
    // For iOS, always show if not dismissed
    if (isIOS) return true;
    
    // For other browsers, only show if installable
    return isInstallable;
  }, [isInstalled, dismissedAt, isIOS, isInstallable]);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    handleInstall,
    handleDismiss,
    shouldShowPrompt,
    deferredPrompt
  };
};
