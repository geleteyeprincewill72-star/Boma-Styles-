import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check, ArrowRight } from 'lucide-react';

interface WebInstallBannerProps {
  onInstall: () => void;
}

export default function WebInstallBanner({ onInstall }: WebInstallBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const isDismissed = localStorage.getItem('aura_pwa_banner_dismissed') === 'true';

    if (!isStandalone && !isDismissed) {
      // Show friendly prompt after 1.5 seconds
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('aura_pwa_banner_dismissed', 'true');
  };

  const handleAccept = () => {
    setIsVisible(false);
    onInstall();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[90] bg-[#070C18] border border-cyan-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-lg font-mono text-slate-100 animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-950/40">
            <Smartphone className="w-5 h-5 text-slate-950" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Install Aura App</span>
              <span className="text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.2 rounded">Free</span>
            </h4>
            <p className="text-[11px] text-slate-300 font-sans leading-snug">
              Would you like to install Aura on your device for instant private messaging & direct access?
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-900 transition shrink-0"
          title="Dismiss prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-900">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs transition"
        >
          No, Continue on Web
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Yes, Install App</span>
        </button>
      </div>
    </div>
  );
}
