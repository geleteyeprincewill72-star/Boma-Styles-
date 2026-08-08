import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  User, 
  Camera, 
  FileText, 
  Download, 
  RefreshCw, 
  Check, 
  Copy, 
  X, 
  Database, 
  Sparkles, 
  Lock, 
  ExternalLink,
  Users,
  Fingerprint,
  Zap,
  Globe
} from 'lucide-react';
import { KeyPair } from '../types';
import { generateSigningKeyPair } from '../utils/crypto';

interface DecentralizedIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatar: string;
  currentBio: string;
  keyPair: KeyPair | null;
  onUpdateIdentity: (newUsername: string, newAvatar: string, newBio: string, newKeyPair?: KeyPair) => void;
  followedCount: number;
}

export const DecentralizedIdentityModal: React.FC<DecentralizedIdentityModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  currentAvatar,
  currentBio,
  keyPair,
  onUpdateIdentity,
  followedCount
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [bio, setBio] = useState(currentBio || 'Sovereign digital identity node participant.');
  const [copiedDid, setCopiedDid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'crypto' | 'sovereign'>('profile');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
    `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'peer'}`
  ];

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setAvatar(currentAvatar);
      setBio(currentBio || 'Sovereign digital identity node participant.');
    }
  }, [isOpen, currentUsername, currentAvatar, currentBio]);

  if (!isOpen) return null;

  // Construct W3C Decentralized Identifier (DID) from public key
  const didString = keyPair?.publicKey 
    ? `did:key:z6M${keyPair.publicKey.slice(0, 36)}...${keyPair.publicKey.slice(-8)}`
    : 'did:key:z6M00000000000000000000000000000';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIdentity(username, avatar, bio);
    setSaveSuccessMsg('Identity & profile updated decentrally on device!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      onClose();
    }, 1500);
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(didString);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleCopyPublicKey = () => {
    if (keyPair?.publicKey) {
      navigator.clipboard.writeText(keyPair.publicKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleRegenerateKeys = async () => {
    if (confirm("Regenerating your RSA keypair will update your cryptographic signing identity. Your new posts will be signed with the new key while past dispatches remain tied to your old key fingerprint. Proceed?")) {
      setIsRegeneratingKey(true);
      try {
        const newKeys = await generateSigningKeyPair();
        onUpdateIdentity(username, avatar, bio, newKeys);
        setSaveSuccessMsg('New RSA-2048 Asymmetric Keypair & DID Generated!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      } catch (err) {
        console.error("Failed to generate keys", err);
      } finally {
        setIsRegeneratingKey(false);
      }
    }
  };

  const handleExportIdentity = () => {
    const identityData = {
      did: didString,
      username,
      avatar,
      bio,
      publicKey: keyPair?.publicKey || '',
      createdTimestamp: Date.now(),
      protocol: 'Aura-Sovereign-SSID-v2',
      clientStorage: 'Decentralized-On-Device'
    };

    const blob = new Blob([JSON.stringify(identityData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username.toLowerCase().replace(/\s+/g, '_')}_sovereign_identity.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#070B19] border border-cyan-500/40 w-full max-w-2xl rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Fingerprint className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span>Self-Sovereign Identity Manager</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-mono">
                  100% User Owned
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Decentralized Digital Identity • Zero Central Server Dependency
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

        {/* Nav Tabs */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 relative z-10 flex-shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Identity</span>
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'crypto'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Asymmetric RSA Keys</span>
          </button>
          <button
            onClick={() => setActiveTab('sovereign')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sovereign'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DID Protocol & Backup</span>
          </button>
        </div>

        {/* Save Success Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2 font-mono relative z-10 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 relative z-10 flex-1">
          
          {/* TAB 1: Profile Creation & Customization */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Avatar Selection & Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="text-xs font-mono font-bold text-cyan-300 uppercase block">
                  Profile Picture / Peer Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/60 shadow-lg relative group flex-shrink-0">
                    <img src={avatar} className="w-full h-full object-cover bg-slate-900" alt="Avatar" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Paste image or SVG avatar URL..."
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono">Quick presets:</span>
                      {AVATAR_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(p)}
                          className={`w-6 h-6 rounded-md overflow-hidden border transition ${
                            avatar === p ? 'border-cyan-400 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={p} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-mono font-bold text-cyan-300 uppercase block flex items-center justify-between">
                  <span>Username / Handle</span>
                  <span className="text-[10px] text-slate-500 font-normal">Self-Sovereign Alias</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter unique peer handle..."
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              {/* Bio Input */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-mono font-bold text-cyan-300 uppercase block flex items-center justify-between">
                  <span>Short Bio / Sovereign Description</span>
                  <span className="text-[10px] text-slate-500 font-normal">Max 180 chars</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the network about yourself, interests, or project focus..."
                  rows={3}
                  maxLength={180}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-sans p-2.5 rounded-lg focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-xs uppercase rounded-xl transition shadow-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Save Decentralized Identity</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: Asymmetric Cryptographic Keypair */}
          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span>RSA-2048 Asymmetric Public Key</span>
                  </span>
                  <button
                    onClick={handleCopyPublicKey}
                    className="text-[10px] font-mono px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded flex items-center gap-1 transition"
                  >
                    {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all max-h-24 overflow-y-auto leading-relaxed">
                  {keyPair?.publicKey || 'Keypair compilation pending...'}
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-snug">
                  This public key cryptographically authenticates your posts and dispatches on the network without requiring a centralized password database.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>On-Device Private Key Security</span>
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 font-mono">
                    NEVER TRANSMITTED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Your private key is stored exclusively in your device's encrypted local keychain. No central server ever sees or stores your private key.
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={handleRegenerateKeys}
                    disabled={isRegeneratingKey}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingKey ? 'animate-spin' : ''}`} />
                    <span>Regenerate Keypair</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: W3C DID Identifier & Sovereign Backup */}
          {activeTab === 'sovereign' && (
            <div className="space-y-4">
              
              {/* W3C DID string */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-mono font-bold text-cyan-300 uppercase block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    W3C Decentralized Identifier (DID)
                  </span>
                  <button
                    onClick={handleCopyDid}
                    className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-700 text-cyan-300 rounded flex items-center gap-1"
                  >
                    {copiedDid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDid ? 'Copied' : 'Copy DID'}</span>
                  </button>
                </label>
                <input
                  type="text"
                  readOnly
                  value={didString}
                  className="w-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono p-2.5 rounded-lg select-all"
                />
                <p className="text-[11px] text-slate-400 font-sans">
                  Your W3C standard DID (<strong className="text-slate-300">did:key</strong>) uniquely identifies your node across decentralized peer-to-peer protocols.
                </p>
              </div>

              {/* Export Identity File */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">
                      Export Sovereign Identity File
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Download your full identity payload JSON to port your profile to any client or offline backup.
                    </p>
                  </div>
                  <button
                    onClick={handleExportIdentity}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Data Control Summary */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-xs uppercase">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Decentralized Data Control</span>
                </div>
                <ul className="text-[11px] text-emerald-200 font-sans space-y-1 list-disc list-inside">
                  <li>Your profile name, avatar, and bio are stored in your local browser state.</li>
                  <li>Followed users count: <strong className="text-white">{followedCount} peers</strong>.</li>
                  <li>Zero centralized credentials required; identity resides on your terms.</li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 relative z-10 flex-shrink-0 text-xs font-mono text-slate-500">
          <span>Aura SSID v2.0 • Decentralized Node</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default DecentralizedIdentityModal;
