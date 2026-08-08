import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AppVersionNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/api/app-version');
        if (res.ok) {
          const data = await res.json();
          if (data && data.updateAvailable) {
            setUpdateAvailable(true);
            setReleaseNotes(data.releaseNotes || 'New version deployed with security and messaging upgrades.');
          }
        }
      } catch (err) {
        // Silent background version check error
      }
    };

    // Initial check on mount
    checkVersion();

    // Check regularly every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-violet-950 border-b border-cyan-500/40 px-4 py-2 text-xs font-mono text-cyan-200 flex flex-wrap items-center justify-between gap-2 shadow-lg animate-fadeIn z-50">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>
          <strong>New Version Available!</strong> {releaseNotes}
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-1.5 shadow"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh to Update</span>
      </button>
    </div>
  );
}
