import React, { useEffect, useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Globe, AlertCircle } from 'lucide-react';

interface GoogleAdSenseAdProps {
  clientPublisherId?: string; // e.g. "ca-pub-XXXXXXXXXXXXXX"
  adSlotId?: string; // e.g. "1234567890"
  format?: 'auto' | 'fluid' | 'rectangle' | 'banner' | 'horizontal';
  responsive?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  fallbackTitle?: string;
  fallbackDesc?: string;
}

export const GoogleAdSenseAd: React.FC<GoogleAdSenseAdProps> = ({
  clientPublisherId = 'ca-pub-3940256099942544', // Default test publisher ID
  adSlotId = '1000000001',
  format = 'auto',
  responsive = true,
  className = '',
  theme = 'dark',
  fallbackTitle = 'Aura Cloud Services & AI Nodes',
  fallbackDesc = 'Deploy decentralized container pipelines globally. Get $50 credits when upgrading your ledger.'
}) => {
  const isLight = theme === 'light';
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);

  useEffect(() => {
    // Inject Google AdSense Script if not already loaded in document
    const scriptId = 'google-adsense-sdk-script';
    let scriptElem = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptElem) {
      scriptElem = document.createElement('script');
      scriptElem.id = scriptId;
      scriptElem.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientPublisherId}`;
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      document.head.appendChild(scriptElem);
    }

    // Attempt to push ad initialization to window.adsbygoogle
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as unknown as { adsbygoogle: Array<object> }).adsbygoogle || [];
        adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (e) {
      console.warn("Google AdSense auto-push notice:", e);
      setAdError(true);
    }
  }, [clientPublisherId, adSlotId]);

  return (
    <div className={`w-full my-4 relative rounded-2xl p-4 overflow-hidden border font-sans transition-all duration-200 ${
      isLight 
        ? 'bg-white border-slate-200 shadow-sm' 
        : 'bg-[#090E1A] border-slate-900 shadow-md'
    } ${className}`}>
      {/* Header Label */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-300 uppercase tracking-wider">Google AdSense Web Placement</span>
          <span className="text-slate-500">• {clientPublisherId}</span>
        </div>
        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
          Web Ad
        </span>
      </div>

      {/* Actual AdSense Slot Container */}
      <div className="w-full min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client={clientPublisherId}
          data-ad-slot={adSlotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />

        {/* Dynamic Web Fallback Preview Card (if AdSense fails or in preview sandbox) */}
        {(!adLoaded || adError) && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-950/80 rounded-xl border border-slate-900">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                  {fallbackTitle}
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {fallbackDesc}
                </p>
              </div>
            </div>

            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold uppercase rounded-lg transition shrink-0 flex items-center gap-1"
            >
              <span>Sponsor Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="mt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          AdSense Ready • High Viewability & WCAG Compliant
        </span>
        <span>Format: {format.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default GoogleAdSenseAd;
