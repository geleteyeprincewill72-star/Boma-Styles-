import React, { useState } from 'react';
import { ShieldCheck, Lock, MapPin, CheckCircle, FileText, XCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface WelcomeConsentModalProps {
  isOpen: boolean;
  onAgree: (enableLocationSafety: boolean) => void;
  onDecline: () => void;
}

export default function WelcomeConsentModal({ isOpen, onAgree, onDecline }: WelcomeConsentModalProps) {
  const [activeTab, setActiveTab] = useState<'welcome' | 'terms' | 'privacy' | 'community' | 'data' | 'rewards' | 'safety'>('welcome');
  const [hasReviewedTerms, setHasReviewedTerms] = useState(false);
  const [enableLocationSafety, setEnableLocationSafety] = useState(true);
  const [declinedState, setDeclinedState] = useState(false);

  if (!isOpen) return null;

  if (declinedState) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 font-mono">
        <div className="bg-[#0A0F1D] border border-red-900/50 rounded-2xl p-6 max-w-md w-full space-y-5 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Consent Declined</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              You have chosen not to agree to the Terms of Service and Privacy Policy. Account creation and app usage are restricted without user consent.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1 text-left">
            <div className="text-cyan-400 font-bold">What would you like to do?</div>
            <div>• Close this tab or exit your browser to leave the application.</div>
            <div>• Or re-open terms to review and agree to continue using Aura.</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeclinedState(false)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
            >
              Re-Review Terms
            </button>
            <button
              onClick={onDecline}
              className="flex-1 py-2.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-xl text-xs font-bold transition"
            >
              Exit App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0F1D] border border-cyan-900/50 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-auto animate-fadeIn text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                Welcome to Aura
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                  Sovereign Mesh Messaging
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Terms of Service, Privacy Policy & Safety Preferences</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900 text-xs font-mono">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'welcome' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Welcome</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'terms' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terms</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'privacy' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'community' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guidelines</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'data' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Data Usage</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'rewards' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Reward Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'safety' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Location Consent</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 max-h-64 overflow-y-auto text-xs space-y-3 font-sans leading-relaxed text-slate-300">
          {activeTab === 'welcome' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>Free & Sovereign Communication Platform</span>
              </h3>
              <p>
                Aura is a 100% free private messaging, text conversation, phone-number-based communication, and AI creative storytelling application.
              </p>
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 text-[11px] font-sans">
                ✝️ Inspired by Christian values of <strong>Honesty, Kindness, Hope, Peace, Unity, Love, Integrity & Service</strong> — welcoming and inclusive of all users.
              </div>
              <ul className="space-y-2 font-mono text-[11px] text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Free Usage:</strong> Download, register, and use core messaging features completely free without subscription requirements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>End-to-End Encryption:</strong> Your private conversations, text messages, and audio calls are cryptographically shielded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Real Monetization:</strong> Earn legitimate rewards stored securely in the production database through active participation.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">Terms of Service</h3>
              <p>
                1. <strong>User Responsibilities:</strong> You agree to use Aura in compliance with applicable laws, treating all users with dignity, honesty, and kindness.
              </p>
              <p>
                2. <strong>Account Rules & Suspension:</strong> Accounts engaging in illegal activity, fraud, hate speech, spamming, or attempting duplicate reward exploits will be subject to immediate suspension.
              </p>
              <p>
                3. <strong>Location Telemetry & Creator Monitoring:</strong> When you grant location permission on your device, your location coordinates and node whereabouts telemetry are collected and accessible strictly to authorized Creator & System Administrators for network safety, fraud detection, emergency response, and administrative management.
              </p>
              <p>
                4. <strong>Service Availability:</strong> Aura provides continuous end-to-end encrypted messaging services backed by Cloud production infrastructure.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">Privacy Policy</h3>
              <p>
                1. <strong>Information Collected:</strong> We collect your phone number, display name, account preferences, encrypted activity metadata, and (upon explicit consent) location coordinates/whereabouts telemetry.
              </p>
              <p>
                2. <strong>How Information Is Used:</strong> Used exclusively to facilitate messaging, verify phone numbers, compute reward balances, secure account access, and provide creator/administrator location telemetry radar.
              </p>
              <p>
                3. <strong>Privacy Protections:</strong> Location data and personal messages are restricted to authorized platform administrators and never sold to third-party advertisers.
              </p>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">Community Guidelines</h3>
              <p>
                1. <strong>Respect & Integrity:</strong> Promote kindness, truth, and peace in all interactions across public feeds and direct messages.
              </p>
              <p>
                2. <strong>Zero Tolerance for Abuse:</strong> Harassment, intimidation, cyberbullying, or sharing illegal content is strictly forbidden and results in permanent ban.
              </p>
              <p>
                3. <strong>Content Moderation:</strong> Our automated and admin moderation tools review reported content to maintain a wholesome, uplifting ecosystem.
              </p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">Data Usage Policy</h3>
              <p>
                1. <strong>Data Minimization:</strong> Aura collects only minimal data required to connect peers, log encrypted transactions, and issue rewards.
              </p>
              <p>
                2. <strong>Data Storage & Retention:</strong> All user balances and session records are stored in secure production cloud databases with automated daily backups.
              </p>
              <p>
                3. <strong>User Rights:</strong> You may request account deletion or data export anytime via settings or by contacting the administrator.
              </p>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm">Reward and Monetization Policy</h3>
              <p>
                1. <strong>Earning Rewards:</strong> Users earn real monetary and data rewards solely through legitimate app activities (e.g. daily check-ins, watching video tutorials, creating quality posts, sending encrypted messages).
              </p>
              <p>
                2. <strong>Anti-Fraud & Audit:</strong> All transactions are signed with cryptographic ledger hashes and verified on the production server. Fake balances, duplicate requests, or automated bot scripts are strictly blocked.
              </p>
              <p>
                3. <strong>Redemptions:</strong> Verified reward balances can be redeemed or spent on premium network services according to official conversion rates.
              </p>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Optional Location Permission & Emergency Safety Feature</span>
              </h3>
              <p className="text-slate-300">
                Aura includes an optional location safety feature. Location features ONLY operate after you explicitly grant permission on your device and comply with applicable privacy laws.
              </p>
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-cyan-300 text-xs">Enable Emergency Location Safety</span>
                  <input
                    type="checkbox"
                    checked={enableLocationSafety}
                    onChange={(e) => setEnableLocationSafety(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  You can grant or revoke location permissions at any time in device settings or App Settings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Consent Acknowledgment Checkbox */}
        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center gap-3">
          <input
            type="checkbox"
            id="terms-consent-checkbox"
            checked={hasReviewedTerms}
            onChange={(e) => setHasReviewedTerms(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer shrink-0"
          />
          <label htmlFor="terms-consent-checkbox" className="text-xs text-slate-300 font-sans cursor-pointer">
            I have read and agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, <strong>Community Guidelines</strong>, <strong>Data Usage Policy</strong>, and <strong>Reward & Monetization Policy</strong>.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-mono">
          <button
            onClick={() => setDeclinedState(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 text-slate-400 hover:text-red-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>I Do Not Agree (Exit)</span>
          </button>

          <button
            onClick={() => onAgree(enableLocationSafety)}
            disabled={!hasReviewedTerms}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-black rounded-xl text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-950/40 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Agree & Continue</span>
          </button>
        </div>

      </div>
    </div>
  );
}
