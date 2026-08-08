import React, { useState, useEffect } from 'react';
import { WifiOff, Clock, AlertTriangle, RefreshCw, Globe, ShieldAlert } from 'lucide-react';

interface OfflineTrialLockModalProps {
  isOffline: boolean;
}

export default function OfflineTrialLockModal({ isOffline }: OfflineTrialLockModalProps) {
  const [offlineStart, setOfflineStart] = useState<number | null>(() => {
    const saved = localStorage.getItem('aura_offline_start_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (isOffline) {
      if (!offlineStart) {
        const now = Date.now();
        setOfflineStart(now);
        localStorage.setItem('aura_offline_start_time', now.toString());
      }
    } else {
      // Reconnected! Clear offline timer
      if (offlineStart !== null) {
        setOfflineStart(null);
        localStorage.removeItem('aura_offline_start_time');
      }
    }
  }, [isOffline]);

  useEffect(() => {
    if (!isOffline || !offlineStart) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - offlineStart) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOffline, offlineStart]);

  if (!isOffline || !offlineStart) return null;

  const MAX_OFFLINE_SECONDS = 2 * 60 * 60; // 2 hours = 7200s
  const isExpired = elapsedSeconds >= MAX_OFFLINE_SECONDS;
  const remainingSeconds = Math.max(0, MAX_OFFLINE_SECONDS - elapsedSeconds);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (!isExpired) {
    // Floating banner showing offline remaining time
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 bg-amber-950/90 border border-amber-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between text-xs font-mono text-amber-200 animate-fadeIn">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            Offline Mode Active • <strong>{formatTime(remainingSeconds)}</strong> remaining of 2h quota
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-1 hover:bg-amber-900 rounded transition text-amber-300"
          title="Retry Connection"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // EXPIRED LOCK SCREEN (2-Hour Offline Limit Reached)
  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md w-full bg-[#0A0F1D] border-2 border-red-500/60 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/50 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-red-950 text-red-300 border border-red-800 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">
            OFFLINE TRIAL EXPIRED (2 HOURS REACHED)
          </span>
          <h2 className="text-xl font-black text-slate-100 font-sans tracking-tight">
            Internet Connection Required
          </h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed pt-1">
            You have used the maximum <strong>2-hour offline allocation</strong> for shared PWA sessions. To protect node data integrity and re-verify your cryptographic identity, please connect to Wi-Fi or mobile data.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2 text-xs font-mono text-slate-300">
          <div className="flex justify-between border-b border-slate-900 pb-2">
            <span className="text-slate-500">Offline Time Used:</span>
            <span className="text-red-400 font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Max Allowed Limit:</span>
            <span className="text-emerald-400 font-bold">2 Hours (7200s)</span>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 via-indigo-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-mono text-xs font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-white animate-spin" />
          <span>RECONNECT TO THE INTERNET & REFRESH</span>
        </button>

        <p className="text-[10px] text-slate-500 font-mono">
          Aura Sovereign Network • Automated Offline Security Protocol
        </p>

      </div>
    </div>
  );
}
