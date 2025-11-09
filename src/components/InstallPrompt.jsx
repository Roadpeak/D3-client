import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4 z-[9999] lg:bottom-4 bottom-24 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">Install Discoun3</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get instant access to deals and use offline
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl hover:from-cyan-500 hover:via-blue-600 hover:to-blue-700 text-sm font-semibold shadow-md transition-all duration-200 active:scale-95"
        >
          Install Now
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;