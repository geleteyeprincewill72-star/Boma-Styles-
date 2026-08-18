import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Wrench, 
  Zap, 
  ShieldCheck, 
  Megaphone, 
  Calendar, 
  History, 
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import { AppUpdate } from '../types';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates: AppUpdate[];
  currentVersion: string;
}

export default function WhatsNewModal({
  isOpen,
  onClose,
  updates,
  currentVersion
}: WhatsNewModalProps) {
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrLatest = updates.find(u => u.isCurrentDeployed || u.version === currentVersion) || updates[0];
  const activeUpdate = selectedUpdateId 
    ? updates.find(u => u.id === selectedUpdateId) || currentOrLatest 
    : currentOrLatest;

  const handleAcknowledge = () => {
    if (activeUpdate) {
      localStorage.setItem('aura_acknowledged_update_version', activeUpdate.version);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" id="whats-new-modal">
      <div className="bg-slate-900 border border-violet-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 font-sans">
                  What's New in Aura
                </h2>
                {activeUpdate && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    v{activeUpdate.version}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Weekly improvements, security upgrades & release notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version History Selector Tabs */}
        {updates.length > 1 && (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-mono scrollbar-thin">
            <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
              <History className="w-3.5 h-3.5" /> Releases:
            </span>
            {updates.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUpdateId(u.id)}
                className={`px-3 py-1 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                  activeUpdate?.id === u.id
                    ? 'bg-violet-600 text-white font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>v{u.version}</span>
                {u.isCurrentDeployed && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {activeUpdate ? (
            <>
              {/* Release Headline & Date */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{activeUpdate.title}</h3>
                  {activeUpdate.summary && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeUpdate.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeUpdate.releaseDate}</span>
                </div>
              </div>

              {/* 1. New Features */}
              {activeUpdate.newFeatures && activeUpdate.newFeatures.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> New Capabilities & Features
                  </h4>
                  <div className="grid gap-2">
                    {activeUpdate.newFeatures.map((feat, idx) => (
                      <div key={idx} className="bg-slate-950/50 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Bug Fixes */}
              {activeUpdate.bugFixes && activeUpdate.bugFixes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Resolved Issues & Bug Fixes
                  </h4>
                  <div className="grid gap-2">
                    {activeUpdate.bugFixes.map((fix, idx) => (
                      <div key={idx} className="bg-slate-950/50 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{fix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Performance Improvements */}
              {activeUpdate.performanceImprovements && activeUpdate.performanceImprovements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Performance & Speed Improvements
                  </h4>
                  <div className="grid gap-2">
                    {activeUpdate.performanceImprovements.map((perf, idx) => (
                      <div key={idx} className="bg-slate-950/50 border border-cyan-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{perf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Security Improvements */}
              {activeUpdate.securityImprovements && activeUpdate.securityImprovements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Security & Privacy Hardening
                  </h4>
                  <div className="grid gap-2">
                    {activeUpdate.securityImprovements.map((sec, idx) => (
                      <div key={idx} className="bg-slate-950/50 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{sec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Announcements */}
              {activeUpdate.importantAnnouncements && activeUpdate.importantAnnouncements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> Important Announcements
                  </h4>
                  <div className="grid gap-2">
                    {activeUpdate.importantAnnouncements.map((ann, idx) => (
                      <div key={idx} className="bg-slate-950/50 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <Megaphone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{ann}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p>No release notes found for this version.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Running Aura v{currentVersion} • Releases published weekly
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleAcknowledge}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition shadow flex items-center gap-2"
            >
              <span>Got it, thanks!</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
