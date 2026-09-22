import React, { useEffect } from 'react';
import { Leaf, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n';

interface SplashScreenProps {
  onDismiss: () => void;
  lang: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, lang }) => {
  const t = getTranslation(lang);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#16A085] via-[#138a72] to-[#2ECC71] flex flex-col items-center justify-between p-8 text-white select-none">
      <div />

      <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in duration-500">
        {/* Animated Brand Icon */}
        <div className="relative w-28 h-28 mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/30 shadow-2xl flex items-center justify-center">
          <Leaf className="w-16 h-16 text-emerald-300 animate-pulse" />
          <ShieldCheck className="w-8 h-8 text-white absolute -bottom-2 -right-2 bg-[#16A085] p-1.5 rounded-full shadow-lg border-2 border-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t.appName}
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/90 font-medium leading-relaxed px-4">
            {t.appFullName}
          </p>
        </div>

        <p className="text-xs text-emerald-200/80 font-light italic">
          "{t.tagline}"
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Loading Progress Bar */}
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div className="bg-white h-full animate-[progress_3s_ease-in-out_infinite]" />
        </div>

        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-[#16A085] bg-white hover:bg-emerald-50 rounded-full shadow-lg transition-all cursor-pointer"
        >
          <span>{lang === 'th' ? 'เข้าสู่แอปพลิเคชัน' : 'Enter Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
