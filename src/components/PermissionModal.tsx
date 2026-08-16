import React from 'react';
import { Camera, Mic, Image as ImageIcon, Bell, ShieldCheck, X } from 'lucide-react';
import { PermissionDetails } from '../hooks/usePermissions';

interface PermissionModalProps {
  request: PermissionDetails | null;
  onGrant: () => void;
  onDeny: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ request, onGrant, onDeny }) => {
  if (!request) return null;

  const renderIcon = () => {
    switch (request.type) {
      case 'camera':
        return <Camera className="w-8 h-8 text-indigo-400" />;
      case 'microphone':
        return <Mic className="w-8 h-8 text-amber-400" />;
      case 'photos':
        return <ImageIcon className="w-8 h-8 text-emerald-400" />;
      case 'notifications':
        return <Bell className="w-8 h-8 text-blue-400" />;
      default:
        return <ShieldCheck className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            {renderIcon()}
          </div>
          <button 
            onClick={onDeny}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{request.title}</h3>
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">{request.description}</p>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 mb-6 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-0.5">Privacy Rationale:</span>
            {request.rationale}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onDeny}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-sm transition"
          >
            Not Now
          </button>
          <button
            onClick={onGrant}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            Allow Access
          </button>
        </div>
      </div>
    </div>
  );
};
