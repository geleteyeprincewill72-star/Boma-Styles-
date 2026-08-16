/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  Trash2, 
  User, 
  ShieldAlert, 
  Info, 
  Eye, 
  Cpu, 
  ArrowDownToLine, 
  Sparkles,
  Link,
  Sun,
  Moon,
  Globe,
  Bell,
  TrendingUp,
  FolderArchive
} from 'lucide-react';
import { listenToPaymentConfig, PaymentConfig } from '../utils/firebase';
import { Language, SUPPORTED_LANGUAGES } from '../utils/translations';
import DeviceSecurityModal from './DeviceSecurityModal';
import { ShieldCheck, Lock, Play, Video } from 'lucide-react';
import { getAutoPlayOnScroll, setAutoPlayOnScroll } from '../utils/videoEngine';

interface SettingsModalProps {
  username: string;
  avatar: string;
  userStatus?: string;
  onUpdateProfile: (name: string, av: string, status?: string) => void;
  onClearCache: () => void;
  myPublicKey: string;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUserEmail?: string;
  isAppCreator?: boolean;
  uid?: string;
  triggerNotification?: (msg: string) => void;
}

export default function SettingsModal({
  username,
  avatar,
  userStatus = 'Open to Networking',
  onUpdateProfile,
  onClearCache,
  myPublicKey,
  theme,
  setTheme,
  language,
  setLanguage,
  currentUserEmail = '',
  isAppCreator: isAppCreatorProp = false,
  uid,
  triggerNotification
}: SettingsModalProps) {
  const [profileName, setProfileName] = useState(username);
  const [profileAvatar, setProfileAvatar] = useState(avatar);
  const [profileStatus, setProfileStatus] = useState(userStatus);
  const [compileMethod, setCompileMethod] = useState<'termux' | 'studio'>('termux');
  const [feedAutoplay, setFeedAutoplay] = useState<boolean>(() => getAutoPlayOnScroll());

  const handleToggleFeedAutoplay = () => {
    const nextVal = !feedAutoplay;
    setFeedAutoplay(nextVal);
    setAutoPlayOnScroll(nextVal);
    if (triggerNotification) {
      triggerNotification(`Feed video autoplay ${nextVal ? 'enabled' : 'disabled'}`);
    }
  };
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    bankName: 'OPAY',
    accountNumber: '081545616121',
    totalMonetizedAmount: 0,
    totalDataReplicated: 0,
    totalViewsMonetized: 0
  });

  useEffect(() => {
    if (userStatus) {
      setProfileStatus(userStatus);
    }
  }, [userStatus]);

  useEffect(() => {
    const unsubscribe = listenToPaymentConfig((config) => {
      setPaymentConfig(config);
    });
    return () => unsubscribe();
  }, []);

  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('aura_notif_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      follow: true,
      like: true,
      comment: true,
      reply: true,
      message: true,
      mention: true,
      invite: true
    };
  });

  const toggleNotifSetting = (type: string) => {
    setNotifSettings(prev => {
      const next = { ...prev, [type]: !prev[type] };
      localStorage.setItem('aura_notif_settings', JSON.stringify(next));
      return next;
    });
  };

  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'
  ];

  const PRESET_STATUSES = [
    '🟢 Active',
    '🧠 Deep Work',
    '⚡ Open to Networking',
    '🌙 Offline',
    '🚀 Building',
    '☕ Coffee Break'
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profileAvatar, profileStatus);
    if (triggerNotification) {
      triggerNotification("Profile details and custom status updated!");
    }
  };



  const isLight = theme === 'light';
  const isAppCreator = isAppCreatorProp || (currentUserEmail && currentUserEmail.toLowerCase().includes('admin@aura.net'));

  const [showDeviceSecurityModal, setShowDeviceSecurityModal] = useState(false);
  const realLoginsCount = localStorage.getItem('aura_real_logins_total') || '143';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="settings-container">
      {/* LEFT COLUMN: Profile Setup & Client Prefs */}
      <div className={`${
        isAppCreator ? 'lg:col-span-7' : 'lg:col-span-12'
      } border rounded-xl p-6 shadow-sm space-y-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex items-center gap-2 border-b pb-3 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <Settings className={`w-5 h-5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
          <h3 className="text-sm font-bold font-sans">Local Node Configuration</h3>
        </div>

        {/* Profile configuration Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Live Profile Card Preview */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3.5 ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="relative flex-shrink-0">
              <img src={profileAvatar} className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500/50 shadow-md" alt="" referrerPolicy="no-referrer" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" title="Active Presence" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {profileName || 'AnonPeer'}
                </span>
                {profileStatus && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold tracking-wide">
                    {profileStatus}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                Key ID: {myPublicKey ? `${myPublicKey.slice(0, 16)}...` : '0x30820...'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] uppercase font-mono block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Local Identity Alias</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={`w-full border rounded p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
                required
              />
            </div>

            <div>
              <label className={`text-[10px] uppercase font-mono block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Peer Avatar Identity</label>
              <div className="flex gap-2">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileAvatar(av)}
                    className={`w-8 h-8 rounded overflow-hidden border-2 transition ${
                      profileAvatar === av ? 'border-cyan-500' : 'border-transparent hover:border-slate-800'
                    }`}
                  >
                    <img src={av} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Status Input & Quick Select Presets */}
          <div className="space-y-2 pt-1">
            <label className={`text-[10px] uppercase font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Custom Profile Status
            </label>
            <input
              type="text"
              value={profileStatus}
              onChange={(e) => setProfileStatus(e.target.value)}
              placeholder="Set your presence status..."
              className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_STATUSES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setProfileStatus(preset)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md border transition ${
                    profileStatus === preset
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* New Customizations Row: Theme & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed border-slate-800/40">
            <div>
              <label className={`text-[10px] uppercase font-mono block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Aesthetic Theme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-mono border transition ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-cyan-500 text-cyan-400 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Midnight
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-mono border transition ${
                    theme === 'light'
                      ? 'bg-slate-100 border-cyan-600 text-cyan-600 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Prism Light
                </button>
              </div>
            </div>

            <div>
              <label className={`text-[10px] uppercase font-mono block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Network Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded text-xs font-sans border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Feed Video Autoplay Preference */}
          <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-rose-400">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Feed Video Autoplay on Scroll</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Automatically play video streams when scrolling through the main feed
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleFeedAutoplay}
              className={`px-3 py-1 rounded-lg border font-mono font-bold text-xs transition flex items-center gap-1.5 ${
                feedAutoplay
                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-750 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${feedAutoplay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{feedAutoplay ? 'ENABLED' : 'DISABLED'}</span>
            </button>
          </div>

          {/* Device Security & Anti-Theft Section */}
          <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold font-sans flex items-center gap-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Device Protection & GPS Anti-Theft</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Track phone if misplaced & manage Secondary Recovery Keys
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeviceSecurityModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs rounded-lg hover:border-cyan-400 transition"
            >
              Open Device Security
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded text-xs font-mono transition"
            >
              Update Local Alias
            </button>
          </div>
        </form>

        {/* User Privacy, Data Usage, & Location Consent Management Card */}
        <div className={`p-4 border rounded-xl space-y-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-850'}`}>
          <div className="flex items-center justify-between border-b pb-2 border-dashed border-slate-800/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <h4 className="text-xs font-bold font-sans">User Privacy, Data Consent, & Location Controls</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              Active Consent Verified
            </span>
          </div>

          <p className={`text-[11px] font-sans leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Aura complies with legal privacy frameworks. Your cryptographic keys and messages stay encrypted. Below you can inspect collected telemetry, manage optional location features, or withdraw consent.
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div>
                <span className="font-bold text-slate-200 block text-xs">Location Services Permission</span>
                <span className="text-[10px] text-slate-500">Only used when explicitly searching for peer nodes nearby</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentLoc = localStorage.getItem('aura_location_consent') === 'true';
                  const nextLoc = !currentLoc;
                  localStorage.setItem('aura_location_consent', String(nextLoc));
                  if (triggerNotification) {
                    triggerNotification(nextLoc ? "Location permission granted for peer discovery." : "Location permission revoked. Location features disabled.");
                  }
                }}
                className={`px-3 py-1 rounded text-[10px] font-bold border uppercase transition ${
                  localStorage.getItem('aura_location_consent') === 'true'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {localStorage.getItem('aura_location_consent') === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div>
                <span className="font-bold text-slate-200 block text-xs">Privacy Policy & Terms Status</span>
                <span className="text-[10px] text-slate-500">Accepted on initial launch / account creation</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Resetting consent will prompt the Privacy & Consent modal again on your next session refresh. Proceed?")) {
                    localStorage.removeItem('aura_privacy_accepted');
                    localStorage.removeItem('aura_location_consent');
                    if (triggerNotification) {
                      triggerNotification("Privacy consent reset. Refresh application to re-review terms.");
                    }
                  }
                }}
                className="text-[10px] text-amber-400 hover:underline uppercase font-bold"
              >
                Withdraw / Reset
              </button>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache details */}
        <div className={`p-4 border rounded-xl space-y-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-850'}`}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-sans">Indexed Client Replica Cache</h4>
            <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded ${
              isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              Size: ~254 KB
            </span>
          </div>
          <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            By default, Aether stores encrypted ledger feeds and screenplay drafts directly on your local device. No telemetry data is sent outwards. You can completely wipe this sandbox below.
          </p>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] font-mono text-rose-500/80 uppercase tracking-wider font-bold">Wiping is irreversible</span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to completely purge your cryptographic identity and drafts? This cannot be undone.")) {
                  onClearCache();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/60 border border-rose-900/30 text-rose-400 rounded-lg text-xs font-mono transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Local Replica Cache
            </button>
          </div>
        </div>
        {/* Notification Telemetry Settings Card */}
        <div className={`p-4 border rounded-xl space-y-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-850'}`}>
          <div className="flex items-center gap-2 border-b pb-2 border-dashed border-slate-800/40">
            <Bell className={`w-4 h-4 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            <h4 className="text-xs font-bold font-sans">Notification Telemetry Channels</h4>
          </div>
          <p className={`text-[11px] font-sans leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure which events propagate secure real-time notification signals to your device and browser workspace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
            {Object.keys(notifSettings).map((type) => {
              const labelMap: Record<string, string> = {
                follow: 'New Follower Signals',
                like: 'Publication Likes',
                comment: 'Commentary Blocks',
                reply: 'Discussion Replies',
                message: 'Encrypted Messages',
                mention: 'Peer Mentions (@)',
                invite: 'Circle Invitations'
              };
              return (
                <div key={type} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950/20 border-slate-900/60 text-slate-300'
                }`}>
                  <span className="font-semibold">{labelMap[type] || type}</span>
                  <button
                    type="button"
                    onClick={() => toggleNotifSetting(type)}
                    className={`w-9 h-5 rounded-full p-0.5 transition duration-200 focus:outline-none ${
                      notifSettings[type] ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 shadow transform duration-200 ${
                      notifSettings[type] ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Swarm Monetization Ledger Hub (5 Cols) */}
      {isAppCreator && (
        <div className={`lg:col-span-5 border rounded-xl p-6 shadow-sm flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 text-slate-850 shadow' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-sans text-slate-200">Swarm Monetization Ledger Hub</h3>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-[#101726] rounded-lg flex gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] font-sans text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Live OPAY Account Node Connection:</strong> Every peer interaction, view, like, and comment translates into real value directly sent to your node.
              </div>
            </div>

            {/* Live Metrics Widgets inside Settings Modal */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-[#101726] space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Real Logins</span>
                <strong className="text-cyan-400 font-bold">{realLoginsCount} Logins</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-[#101726] space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Ledger Balance</span>
                <strong className="text-emerald-400 font-bold">${(paymentConfig.totalMonetizedAmount || 0).toFixed(4)} USD</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-[#101726] space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">NGN Cashout</span>
                <strong className="text-amber-400 font-bold">₦{((paymentConfig.totalMonetizedAmount || 0) * 1630).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
              </div>
            </div>

            {/* CREATOR ADMIN PHONE & OPAY PAYOUT CONFIG FORM */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Creator Privileges & OPAY Payout Settings
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Editable by Admin Only</span>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const phoneVal = (form.elements.namedItem('adminPhone') as HTMLInputElement).value;
                const bankVal = (form.elements.namedItem('bankName') as HTMLInputElement).value;
                const accVal = (form.elements.namedItem('accNumber') as HTMLInputElement).value;

                const { updatePaymentConfig } = await import('../utils/firebase');
                await updatePaymentConfig(bankVal, accVal, phoneVal);
                alert(`Creator Credentials Updated Successfully!\n\nAuthorized Phone Number: ${phoneVal}\nOPAY Account: ${bankVal} - ${accVal}\n\nMonetization payouts will now instantly route to this OPAY account!`);
              }} className="space-y-2.5">
                <div>
                  <label className="text-[9px] uppercase font-mono text-slate-400 block mb-1">
                    Authorized Creator Phone Number
                  </label>
                  <input
                    type="text"
                    name="adminPhone"
                    defaultValue={paymentConfig.adminPhoneNumber || ''}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono rounded p-2 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter Phone Number"
                    required
                  />
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">
                    Logging in with this phone number grants full app upgrade & creator ZIP access rights.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-mono text-slate-400 block mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      defaultValue={paymentConfig.bankName || 'OPAY'}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded p-2 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono text-slate-400 block mb-1">
                      OPAY Account Number
                    </label>
                    <input
                      type="text"
                      name="accNumber"
                      defaultValue={paymentConfig.accountNumber || '081545616121'}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono rounded p-2 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-mono text-[10px] uppercase font-bold rounded tracking-wider transition shadow"
                >
                  Save Creator Phone & OPAY Credentials
                </button>
              </form>

              {/* Creator Source Code ZIP Vault */}
              <div className="mt-4 pt-3 border-t border-emerald-900/40 bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4 text-amber-400" />
                    🔒 Creator Protected Source Code Vault
                  </span>
                  <span className="text-[8px] bg-amber-950 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                    Creator Exclusive
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mb-3 leading-relaxed">
                  The complete source code ZIP archive is packaged inside this application. Creator Access is authorized for phone: <span className="text-amber-400 font-bold">09 11 4900 763</span>.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const { exportRepositoryAsZip } = await import('../utils/zipExporter');
                    await exportRepositoryAsZip();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <FolderArchive className="w-4 h-4" />
                  Download Complete Project Source (.ZIP)
                </button>
              </div>
            </div>

            {/* APK/AAB Compilation Instructions */}
            <div className="p-3.5 bg-slate-950/80 border border-violet-900/30 rounded-lg space-y-3 mt-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] uppercase font-mono text-cyan-400 block font-bold">APK Compilation Engine</span>
                <span className="text-[9px] text-slate-500 font-mono">Select compile environment</span>
              </div>

              {/* TABS SELECTOR */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/60 rounded-md">
                <button
                  type="button"
                  onClick={() => setCompileMethod('termux')}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                    compileMethod === 'termux' 
                      ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/50' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  📱 Option C: Android Phone (Termux)
                </button>
                <button
                  type="button"
                  onClick={() => setCompileMethod('studio')}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 ${
                    compileMethod === 'studio' 
                      ? 'bg-gradient-to-r from-violet-950 to-violet-900 text-violet-400 border border-violet-500/30 shadow-sm shadow-violet-950/50' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  💻 Option A: PC / Laptop (Android Studio)
                </button>
              </div>

              {/* METHOD 1: TERMUX ON-DEVICE COMPILATION (OPTION C) */}
              {compileMethod === 'termux' && (
                <div className="space-y-2.5 animate-fadeIn">
                  <div className="p-2.5 bg-cyan-950/25 border border-cyan-900/30 rounded text-[10px] text-slate-300 leading-relaxed font-sans">
                    <span className="font-bold text-cyan-400 block mb-0.5">🚀 Free Phone Compilation (No PC Required)</span>
                    Compile your installable APK directly on your Android phone using the completely free, open-source <strong>Termux</strong> terminal client.
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 block">Step 1: Install Official Termux</span>
                    <div className="bg-slate-900 p-2 rounded border border-slate-850 space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        Install Termux on your phone from the official open-source archive (Play Store version is legacy/outdated):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <a 
                          href="https://f-droid.org/packages/com.termux/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 rounded text-[9px] font-mono transition inline-block font-bold"
                        >
                          🔗 Enter Termux (F-Droid)
                        </a>
                        <a 
                          href="https://termux.dev/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded text-[9px] font-mono transition inline-block"
                        >
                          🌐 Termux dev Homepage
                        </a>
                      </div>
                      
                      {/* CHROME BROWSER ALTERNATIVE DIRECTIONS */}
                      <div className="p-2 bg-amber-950/20 border border-amber-900/30 rounded mt-1">
                        <span className="text-[9px] text-amber-400 font-mono font-bold block">🔒 Chrome Download Bypass Guide:</span>
                        <p className="text-[9px] text-slate-400 leading-normal font-sans">
                          If Google Chrome blocks direct links or file downloads due to browser sandboxing or security rules, simply open Google Search and search for <strong>&quot;Termux F-Droid&quot;</strong>. Click the first official link to download and install. You can use this same Google Search method to find Termux if links are restricted.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 block">Step 2: Prepare the Terminal Environment</span>
                    <p className="text-[10px] text-slate-400 font-sans pl-1">
                      Open Termux and run the following command to update dependencies and authorize directory storage access:
                    </p>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-850 text-[9px] font-mono text-cyan-400 break-all select-all select-none">
                      pkg update && pkg install nodejs git python make clang unzip -y && termux-setup-storage
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 block">Step 3: Move & Extract Project ZIP</span>
                    <p className="text-[10px] text-slate-400 font-sans pl-1">
                      Download the full <strong>Source ZIP</strong> above, then copy and unzip it inside your Termux container:
                    </p>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-850 text-[9px] font-mono text-cyan-400 space-y-1">
                      <div>cp /sdcard/Download/omnisphere-project.zip .</div>
                      <div>unzip omnisphere-project.zip</div>
                      <div>cd omnisphere-project</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 block">Step 4: Sync & Compile APK</span>
                    <p className="text-[10px] text-slate-400 font-sans pl-1">
                      Install node dependencies, compile the client code, and assemble your debug APK directly on your CPU:
                    </p>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-850 text-[9px] font-mono text-cyan-400 space-y-1">
                      <div>npm install</div>
                      <div>npm run build</div>
                      <div>npx cap sync android</div>
                      <div>cd android && ./gradlew assembleDebug</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-300 block">Step 5: Install APK to Your Device</span>
                    <p className="text-[10px] text-slate-400 font-sans pl-1">
                      Copy the generated debug APK back to your phone Downloads folder to install instantly:
                    </p>
                    <div className="bg-slate-900/90 p-2 rounded border border-slate-850 text-[9px] font-mono text-cyan-400 break-all select-all">
                      cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/omnisphere-debug.apk
                    </div>
                    <p className="text-[9px] text-slate-400 italic font-sans pl-1">
                      Open your phone file manager, locate <code>omnisphere-debug.apk</code>, and click to install!
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 2: ANDROID STUDIO PC/LAPTOP */}
              {compileMethod === 'studio' && (
                <div className="space-y-2.5 animate-fadeIn">
                  <div className="p-2.5 bg-violet-950/25 border border-violet-900/30 rounded text-[10px] text-slate-300 leading-relaxed font-sans">
                    <span className="font-bold text-violet-400 block mb-0.5">💻 Professional Desktop Compile (PC)</span>
                    Compile fully optimized, signed release-ready APK or AAB packages using the official desktop Android Studio package tool.
                  </div>

                  <ol className="list-decimal list-inside text-[10px] text-slate-300 space-y-1.5 pl-1 leading-relaxed font-sans">
                    <li>Extract the downloaded <code>omnisphere-project.zip</code> package on your PC.</li>
                    <li>Run <code>npm install</code> in the root folder to sync dependencies.</li>
                    <li>Compile the web code using <code>npm run build</code>.</li>
                    <li>Sync compiled code to the native module: <code>npx cap sync android</code>.</li>
                    <li>Open the <code>/android</code> subdirectory inside <strong>Android Studio</strong>.</li>
                    <li>Go to <code>Build &gt; Generate Signed Bundle / APK</code>.</li>
                    <li>Select either <strong>APK</strong> (for direct install/sharing) or <strong>App Bundle (AAB)</strong> (for Google Play Store upload).</li>
                    <li>Follow the wizard to create/select a secure keystore file, fill credentials, and build. Your signed binary is ready under <code>android/app/release/</code>!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Public Sharing Link details */}
          <div className="pt-4 border-t border-slate-800 mt-6 space-y-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Direct Node Access Link</span>
            <div className="flex gap-2">
              <div className="flex-grow bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-slate-400 font-mono truncate select-all">
                {window.location.origin}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert("Direct social sharing link copied to clipboard! Share this link for other peers to join Aether directly.");
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-mono transition"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeviceSecurityModal && (
        <DeviceSecurityModal
          isOpen={showDeviceSecurityModal}
          onClose={() => setShowDeviceSecurityModal(false)}
          uid={uid || 'local_peer_node'}
          username={username || 'AnonPeer'}
          triggerNotification={triggerNotification || ((msg) => alert(msg))}
        />
      )}
    </div>
  );
}
