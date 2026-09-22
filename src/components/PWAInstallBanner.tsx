import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n';

interface PWAInstallBannerProps {
  lang: Language;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-[#16A085] text-white py-2.5 px-4 flex items-center justify-between text-xs shadow-inner">
      <div className="flex items-center space-x-2.5">
        <Smartphone className="w-4 h-4 text-emerald-200 animate-bounce" />
        <span>
          {lang === 'th'
            ? 'ติดตั้งแอป PH Eco Alert บนอุปกรณ์ของคุณเพื่อใช้งานแบบ Offline'
            : 'Install PH Eco Alert app on your device for offline support'}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1 bg-white text-[#16A085] font-bold rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          {lang === 'th' ? 'ติดตั้ง (Install)' : 'Install'}
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-[#138a72] rounded-lg transition-colors text-emerald-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
