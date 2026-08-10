import React, { useEffect } from 'react';
import { Sparkles, ShieldCheck, Megaphone, ExternalLink } from 'lucide-react';

export type AdsterraUnitType =
  | 'skyscraper_600'
  | 'half_skyscraper_300'
  | 'medium_rectangle_250'
  | 'banner_468'
  | 'native_container'
  | 'direct_link';

export interface AdsterraAdProps {
  unit?: AdsterraUnitType;
  className?: string;
  theme?: 'dark' | 'light';
  showLabel?: boolean;
}

// Global script injector component for popunder / social bar scripts (6 & 8)
export const AdsterraGlobalScripts: React.FC = () => {
  useEffect(() => {
    const scriptsToLoad = [
      'https://pl30772147.effectivecpmnetwork.com/74/28/9b/74289b3f19835294855fcfa189d920e2.js',
      'https://pl30772145.effectivecpmnetwork.com/a1/86/05/a18605aa7c1ce27037bd837c8d316f0f.js',
    ];

    scriptsToLoad.forEach((src) => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }, []);

  return null;
};

export const ADSTERRA_DIRECT_LINK = 'https://www.effectivecpmnetwork.com/xddn697s?key=06b9af586f62221b549286b7721cd5e4';

const AD_CONFIGS: Record<
  AdsterraUnitType,
  { width: number; height: number; name: string; type: 'iframe' | 'container' | 'link' }
> = {
  skyscraper_600: {
    width: 160,
    height: 600,
    name: 'Skyscraper Banner (160x600)',
    type: 'iframe',
  },
  half_skyscraper_300: {
    width: 160,
    height: 300,
    name: 'Sidebar Banner (160x300)',
    type: 'iframe',
  },
  medium_rectangle_250: {
    width: 300,
    height: 250,
    name: 'Medium Rectangle (300x250)',
    type: 'iframe',
  },
  banner_468: {
    width: 468,
    height: 60,
    name: 'Banner Display (468x60)',
    type: 'iframe',
  },
  native_container: {
    width: 320,
    height: 280,
    name: 'Native Container Banner',
    type: 'container',
  },
  direct_link: {
    width: 300,
    height: 120,
    name: 'Adsterra Direct SmartLink',
    type: 'link',
  },
};

const IFRAME_KEYS: Record<string, string> = {
  skyscraper_600: 'c39296fee6dc63c8429a3b42fe32ab05',
  half_skyscraper_300: 'c27b08ca5d3b590828889eb1dfab2399',
  medium_rectangle_250: 'c6e0e12488471a43f3b1b01a1f234d70',
  banner_468: '96d1f81854b1ddcc2fab39244ae0e60c',
};

export const AdsterraAd: React.FC<AdsterraAdProps> = ({
  unit = 'medium_rectangle_250',
  className = '',
  theme = 'dark',
  showLabel = true,
}) => {
  const isLight = theme === 'light';
  const config = AD_CONFIGS[unit] || AD_CONFIGS.medium_rectangle_250;

  const getSrcDoc = () => {
    if (unit === 'native_container') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script async="async" data-cfasync="false" src="https://pl30772148.effectivecpmnetwork.com/e0c9d5333632084b264170121b8c957f/invoke.js"></script>
  <div id="container-e0c9d5333632084b264170121b8c957f"></div>
</body>
</html>`;
    }

    const key = IFRAME_KEYS[unit] || IFRAME_KEYS.medium_rectangle_250;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : 'iframe',
      'height' : ${config.height},
      'width' : ${config.width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script>
</body>
</html>`;
  };

  return (
    <div
      className={`my-3 relative rounded-2xl p-3 overflow-hidden border font-sans transition-all duration-200 flex flex-col items-center justify-center max-w-full ${
        isLight
          ? 'bg-slate-50 border-slate-200 shadow-sm'
          : 'bg-[#0a0f1d] border-slate-850 shadow-md'
      } ${className}`}
    >
      {showLabel && (
        <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-300 uppercase tracking-wider">Adsterra Sponsored Network</span>
          </div>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            Adsterra
          </span>
        </div>
      )}

      {/* Adsterra Unit Container */}
      {unit === 'direct_link' ? (
        <div className="w-full text-center space-y-2 py-2">
          <p className="text-xs text-slate-300 font-sans">
            Special Sponsored Content & Exclusive SmartLink Offer
          </p>
          <a
            href={ADSTERRA_DIRECT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>Explore Adsterra Sponsored Offer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div
          className="flex items-center justify-center overflow-hidden rounded-xl bg-black/20 max-w-full"
          style={{ width: `${config.width}px`, height: `${config.height}px` }}
        >
          <iframe
            title={`Adsterra Ad - ${unit}`}
            srcDoc={getSrcDoc()}
            width={config.width}
            height={config.height}
            style={{
              border: 'none',
              overflow: 'hidden',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            scrolling="no"
          />
        </div>
      )}

      <div className="w-full mt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Cloudflare & Production Ready
        </span>
        <span>{config.width}×{config.height}</span>
      </div>
    </div>
  );
};

export default AdsterraAd;

