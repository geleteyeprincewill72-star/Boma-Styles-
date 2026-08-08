import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  Database, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerNativeInstall: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerNativeInstall
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const publicShareUrl = "https://ais-pre-n2zmwj5vdlaktpo2rdwo2v-119193402769.europe-west1.run.app";

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#070B19] border border-cyan-500/50 w-full max-w-lg rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden text-slate-100">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Download className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-mono text-cyan-300 uppercase tracking-wider">
                Download App To Home Screen
              </h2>
              <p className="text-xs font-mono text-slate-400">
                1-Click Standalone Phone App Installation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Sync Status Badge */}
        <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs font-mono relative z-10">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Cloud Database Storage: ACTIVE</span>
          </div>
          <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
            Firestore Synced
          </span>
        </div>

        {/* Direct Native Install Button (If supported) */}
        {deferredPrompt ? (
          <div className="bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 p-4 rounded-xl border border-cyan-500/60 space-y-2 relative z-10 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-cyan-300 uppercase">
                Instant Native Installation Ready
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Your device supports direct installation! Click below to place Aura directly onto your phone home screen.
            </p>
            <button
              onClick={() => {
                onTriggerNativeInstall();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-mono font-black uppercase rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Install Aura Web App Now</span>
            </button>
          </div>
        ) : null}

        {/* Step-by-Step Instructions */}
        <div className="space-y-3 relative z-10">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>How to add to your phone's Home Screen manually:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Android / Chrome */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-cyan-300 text-[11px] uppercase">
                <span>🤖 Android (Chrome / Edge)</span>
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">Step Guide</span>
              </div>
              <ol className="space-y-1.5 text-[11px] font-sans text-slate-300 list-decimal list-inside leading-snug">
                <li>Tap the <strong>3 dots (⋮)</strong> menu top-right</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                <li>Confirm, and launch directly from your apps grid!</li>
              </ol>
            </div>

            {/* iOS / Safari */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono font-bold text-indigo-300 text-[11px] uppercase">
                <span>🍎 iPhone / iPad (Safari)</span>
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400">Step Guide</span>
              </div>
              <ol className="space-y-1.5 text-[11px] font-sans text-slate-300 list-decimal list-inside leading-snug">
                <li>Tap the <strong>Share <Share2 className="w-3 h-3 inline text-indigo-400" /></strong> button at browser bottom</li>
                <li>Scroll down and tap <strong>"Add to Home Screen <PlusSquare className="w-3 h-3 inline text-indigo-400" />"</strong></li>
                <li>Tap <strong>Add</strong> in top right corner!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Public Shared URL Copy Option */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 relative z-10">
          <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
            Direct Public Link (Open anywhere without login errors):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicShareUrl}
              className="w-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono p-2.5 rounded-lg select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition whitespace-nowrap flex items-center gap-1.5 shadow"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 text-slate-950" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 relative z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default PwaInstallModal;
