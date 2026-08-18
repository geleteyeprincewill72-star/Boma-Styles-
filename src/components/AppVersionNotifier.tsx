import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, ArrowRight } from 'lucide-react';
import { fetchAppUpdates, getCurrentDeployedVersion } from '../utils/firebase';
import { AppUpdate } from '../types';

interface AppVersionNotifierProps {
  onOpenWhatsNew?: () => void;
}

export default function AppVersionNotifier({ onOpenWhatsNew }: AppVersionNotifierProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [hasNewNotesToView, setHasNewNotesToView] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const currentRunning = getCurrentDeployedVersion();
        const acknowledgedVersion = localStorage.getItem('aura_acknowledged_update_version');

        // 1. Fetch from server endpoint
        const res = await fetch('/api/updates');
        if (res.ok) {
          const data = await res.json();
          const latest = data.latestVersion || currentRunning;
          setLatestVersion(latest);
          
          if (data.updateAvailable) {
            setUpdateAvailable(true);
            setReleaseNotes(`Version ${latest} is published.`);
          } else if (acknowledgedVersion !== currentRunning) {
            // User hasn't acknowledged the currently deployed version yet
            setHasNewNotesToView(true);
            setReleaseNotes(`Version ${currentRunning} is now active.`);
          }
          return;
        }

        // 2. Firestore fallback
        const updates: AppUpdate[] = await fetchAppUpdates(true);
        if (updates.length > 0) {
          const topUpdate = updates[0];
          setLatestVersion(topUpdate.version);
          if (topUpdate.version !== currentRunning) {
            setUpdateAvailable(true);
            setReleaseNotes(topUpdate.title || `Version ${topUpdate.version} is now available.`);
          } else if (acknowledgedVersion !== currentRunning) {
            setHasNewNotesToView(true);
            setReleaseNotes(topUpdate.title || `Version ${currentRunning} is now live.`);
          }
        }
      } catch (err) {
        // Silent background check failure
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    const currentRunning = getCurrentDeployedVersion();
    localStorage.setItem('aura_acknowledged_update_version', latestVersion || currentRunning);
  };

  const handleOpenModal = () => {
    if (onOpenWhatsNew) {
      onOpenWhatsNew();
    }
  };

  if (isDismissed || (!updateAvailable && !hasNewNotesToView)) return null;

  return (
    <div 
      id="app-version-banner"
      className="bg-gradient-to-r from-violet-950 via-slate-900 to-cyan-950 border-b border-violet-500/40 px-4 py-2.5 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-lg z-50 animate-fadeIn"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
        </span>
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-white font-sans font-semibold">
            {updateAvailable ? `Aura ${latestVersion} Released!` : `Aura has been updated 🎉`}
          </strong>
          <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
            {releaseNotes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenWhatsNew && (
          <button
            onClick={handleOpenModal}
            className="px-3 py-1 bg-violet-600/80 hover:bg-violet-600 text-white font-medium rounded-lg transition flex items-center gap-1.5 shadow text-xs"
          >
            <span>See What's New</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {updateAvailable && (
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-1.5 shadow text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Update Now</span>
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
