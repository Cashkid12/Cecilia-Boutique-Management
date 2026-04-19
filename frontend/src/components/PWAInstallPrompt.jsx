import { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { X, Smartphone, Monitor, Share, ShoppingBag, Check } from 'lucide-react';

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isIOS, handleInstall, handleDismiss, shouldShowPrompt } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (shouldShowPrompt()) {
      // Show after 3 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      // Auto-hide after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowPrompt(false);
      }, 13000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [shouldShowPrompt]);

  // Listen for app installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setShowCelebration(true);
      setShowPrompt(false);
      
      // Hide celebration after 4 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const success = await handleInstall();
      if (success) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowPrompt(false);
          setShowCelebration(false);
        }, 4000);
      }
    }
  };

  const handleDismissClick = () => {
    handleDismiss();
    setShowPrompt(false);
  };

  // Celebration Screen
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary-light to-white z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="text-center">
          {/* Confetti Animation */}
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full shadow-2xl animate-bounce">
              <ShoppingBag size={48} className="text-dark" />
            </div>
            {/* Floating icons */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              >
                <ShoppingBag size={20} className="text-primary opacity-50" />
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-dark mb-2">App Installed! 🎉</h2>
          <p className="text-lg text-gray-600 mb-6">
            Welcome to Cecilia Boutique on your home screen!
          </p>

          <div className="flex items-center justify-center gap-2 text-primary-dark">
            <Check size={20} />
            <span className="font-medium">Ready to use</span>
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt || isInstalled) return null;

  // Mobile prompt
  if (window.innerWidth < 768) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50 animate-slide-up">
          <button
            onClick={handleDismissClick}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-primary-light rounded-lg">
              <ShoppingBag size={24} className="text-primary-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark">Cecilia Boutique</h3>
              <p className="text-sm text-gray-600">
                Install the app for quick access to inventory and sales on the go!
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full px-4 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <Smartphone size={18} />
            {isIOS ? 'Add to Home Screen' : 'Install App'}
          </button>
        </div>

        {/* iOS Instructions Modal */}
        {showIOSInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-dark flex items-center gap-2">
                  <Share size={20} className="text-primary-dark" />
                  Install on iPhone
                </h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <ol className="space-y-4 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary text-dark rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <span>Tap the <strong>Share</strong> button 📤 at the bottom of Safari</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary text-dark rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary text-dark rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <span>Tap <strong>"Add"</strong> in the top right corner</span>
                </li>
              </ol>

              <div className="bg-primary-light rounded-xl p-4 mb-4">
                <p className="text-xs text-dark">
                  <strong>💡 Tip:</strong> You can also long-press the app icon for quick actions like "Record Sale" and "Check Stock"
                </p>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full px-4 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop prompt
  return (
    <div className="fixed top-4 right-4 bg-white rounded-2xl shadow-2xl border-2 border-primary-light p-6 max-w-md z-50 animate-fade-in">
      <button
        onClick={handleDismissClick}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="p-3 bg-primary-light rounded-xl">
          <Monitor size={28} className="text-primary-dark" />
        </div>
        <div>
          <h3 className="font-bold text-dark text-lg">Cecilia Boutique</h3>
          <p className="text-sm text-gray-600">
            Available as a desktop app! Install for offline access and a dedicated window.
          </p>
        </div>
      </div>

      <div className="bg-primary-light rounded-xl p-4 mb-4">
        <p className="text-xs text-dark mb-2"><strong>Benefits:</strong></p>
        <ul className="space-y-1 text-xs text-dark">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> One-tap access from taskbar
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Works offline
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Full-screen experience
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Faster loading
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleInstallClick}
          className="flex-1 px-4 py-3 bg-primary text-dark rounded-xl hover:bg-primary-dark transition-all font-medium flex items-center justify-center gap-2 shadow-md"
        >
          <Monitor size={18} />
          Install on Desktop
        </button>
        <button
          onClick={handleDismissClick}
          className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
