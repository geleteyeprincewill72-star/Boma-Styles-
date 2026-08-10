import React, { useEffect } from 'react';
import { Sparkles, ShieldCheck, Megaphone } from 'lucide-react';

const SOCIAL_BAR_SCRIPT_SRC = 'https://pl30772147.effectivecpmnetwork.com/74/28/9b/74289b3f19835294855fcfa189d920e2.js';

/**
 * Global component that mounts the exact Adsterra Social Bar script
 * according to Adsterra's recommended placement.
 */
export const AdsterraSocialBar: React.FC = () => {
  useEffect(() => {
    // Check if the exact script is already present in document
    const existingScript = document.querySelector(`script[src="${SOCIAL_BAR_SCRIPT_SRC}"]`);
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = SOCIAL_BAR_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
};

// Backwards compatibility alias
export const AdsterraGlobalScripts = AdsterraSocialBar;

export interface AdsterraAdProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * Status and information panel for the Adsterra Social Bar Integration
 */
export const AdsterraAd: React.FC<AdsterraAdProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`my-3 relative rounded-2xl p-4 border font-sans transition-all duration-200 flex flex-col items-center justify-center max-w-full ${
        isLight
          ? 'bg-slate-50 border-slate-200 shadow-sm'
          : 'bg-[#0a0f1d] border-slate-850 shadow-md'
      } ${className}`}
    >
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold uppercase tracking-wider">Adsterra Social Bar Network</span>
        </div>
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          Active
        </span>
      </div>

      <div className="text-center space-y-1.5 py-2">
        <p className="text-xs font-semibold text-slate-200">
          Adsterra Responsive Social Bar Active
        </p>
        <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
          The non-intrusive, mobile & desktop responsive Adsterra Social Bar is active.
          It displays floating ads smoothly without blocking buttons or navigation.
        </p>
      </div>

      <div className="w-full mt-2 pt-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Single Official Script (EffectiveCPMNetwork)
        </span>
        <span className="text-amber-400/80 font-bold">Recommended Placement</span>
      </div>
    </div>
  );
};

export default AdsterraAd;
