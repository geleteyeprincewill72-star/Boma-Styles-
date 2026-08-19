import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface WelcomePrivacyModalProps {
  isOpen: boolean;
  onAgreeAndContinue: (enableLocationSafety: boolean) => void;
  onDeclineAndExit: () => void;
}

export const WelcomePrivacyModal: React.FC<WelcomePrivacyModalProps> = ({
  isOpen,
  onAgreeAndContinue,
  onDeclineAndExit
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [enableLocationSafety, setEnableLocationSafety] = useState(false);
  const [activeTab, setActiveTab] = useState<'welcome' | 'terms' | 'privacy' | 'safety'>('welcome');
  const [declinedExit, setDeclinedExit] = useState(false);

  if (!isOpen) return null;

  if (declinedExit) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-6 font-mono text-slate-100">
        <div className="max-w-md w-full bg-[#070B19] border border-red-500/40 rounded-2xl p-6 space-y-4 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <XCircle className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-base font-bold uppercase tracking-wider text-red-300">
            Terms Declined
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You have chosen not to accept the Terms of Service and Privacy Policy. To use the Aura Messaging & Communication Platform, acceptance is required.
          </p>          <p className="text-[11px] text-slate-500 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            You may now close this browser tab or window, or click below to re-review the terms.
          </p>
          <button
            onClick={() => setDeclinedExit(false)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-xl transition"
          >
            Re-Review Terms & Conditions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans text-slate-100">
      <div className="bg-[#070B19] border border-cyan-500/40 w-full max-w-2xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow Accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 relative z-10 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              Welcome to Aura
              <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-400 px-2 py-0.5 rounded font-mono">
                Messaging & Communication Platform
              </span>
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Terms of Service, Privacy Policy & Safety Onboarding
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 font-mono text-xs gap-2 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'welcome' 
                ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'terms' 
                ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'privacy' 
                ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'safety' 
                ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency Location Safety
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed text-slate-300 font-sans border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 rounded-xl">
          {activeTab === 'welcome' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Private Communication & Sovereign Security
              </h3>
              <p>
                Aura is a modern, end-to-end encrypted messaging, text conversation, phone-number communication, and AI-assisted collaboration application designed for complete user privacy and performance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2 text-slate-300">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Private Text & Voice Notes</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Creators Discovery & Social Hub</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Free Account Registration</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Optional Emergency Safety</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Terms of Service
              </h3>
              <p className="font-mono text-[11px] text-slate-400">Effective Date: August 2026</p>
              <p>
                By registering for or using Aura, you agree to comply with these Terms of Service. Aura provides private text messaging, phone-number-based communication, contact sync, and AI assistance.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-[11px]">
                <li><strong>Acceptable Use:</strong> You agree not to use Aura for illegal activities, harassment, malware distribution, or unauthorized access.</li>
                <li><strong>Free Access:</strong> Downloading, registering, and using basic messaging features on Aura is 100% free of charge.</li>
                <li><strong>Verified Monetization:</strong> Any earnings or peer reward incentives within the app are processed through secure server-side verification to prevent fraud and manipulation.</li>
                <li><strong>Account Termination:</strong> Accounts violating core safety policies or spam regulations may be suspended by network administrators.</li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Privacy Policy
              </h3>
              <p className="font-mono text-[11px] text-slate-400">Protecting Your Data & Digital Sovereignty</p>
              <p>
                Aura respects your fundamental right to digital privacy and data protection.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-[11px]">
                <li><strong>Encryption:</strong> Private messages and voice notes are encrypted to ensure content remains confidential between participants.</li>
                <li><strong>No Public Posts:</strong> Aura focuses exclusively on private direct messages, phone contacts, and AI assistance — public feed posting has been completely removed.</li>
                <li><strong>Data Protection:</strong> Personal information, phone numbers, and profile details are protected with standard database authentication and encryption controls.</li>
              </ul>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Optional Emergency Location-Based Safety Features
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Aura includes an optional location-based safety module designed to assist in emergency scenarios.
              </p>
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg space-y-2 text-[11px]">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>How Emergency Location Safety Works:</span>
                </div>
                <p className="text-slate-300">
                  If enabled, this feature allows your device's location to be reported during active SOS calls or emergency situations to assist first responders or law enforcement during investigations in strict accordance with applicable local laws and judicial standards.
                </p>
                <p className="text-slate-400 italic">
                  This feature is completely optional. You can turn it ON or OFF at any time inside App Settings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Agreement Actions & Toggles */}
        <div className="space-y-3 shrink-0 border-t border-slate-800 pt-4 font-mono text-xs">
          {/* Checkbox 1: Terms Agreement */}
          <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-900/60 transition">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-950 cursor-pointer"
            />
            <span className="text-slate-200 text-xs font-sans leading-tight">
              I have read, understood, and agree to the <strong className="text-cyan-400">Terms of Service</strong> and <strong className="text-cyan-400">Privacy Policy</strong>.
            </span>
          </label>

          {/* Checkbox 2: Optional Emergency Location Safety */}
          <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 transition">
            <input
              type="checkbox"
              checked={enableLocationSafety}
              onChange={(e) => setEnableLocationSafety(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-amber-700 text-amber-500 focus:ring-amber-500 bg-slate-950 cursor-pointer"
            />
            <div className="text-xs font-sans leading-tight">
              <span className="text-amber-300 font-bold block mb-0.5">
                Enable Optional Emergency Location-Based Safety Feature
              </span>
              <span className="text-slate-400 text-[10px]">
                Allows device location assistance during emergency situations/investigations under applicable laws. (Can be toggled off anytime in Settings).
              </span>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setDeclinedExit(true)}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0"
            >
              I Do Not Agree (Exit)
            </button>

            <button
              onClick={() => {
                if (agreedToTerms) {
                  onAgreeAndContinue(enableLocationSafety);
                }
              }}
              disabled={!agreedToTerms}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>I Agree & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomePrivacyModal;
