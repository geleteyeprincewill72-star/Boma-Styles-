import React, { useState, useEffect } from 'react';
import WelcomeConsentModal from './WelcomeConsentModal';
import { 
  auth, 
  saveUserProfile, 
  checkUsernameUnique,
  fetchUserProfile
} from '../utils/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Eye,
  EyeOff,
  AtSign,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { exportRepositoryAsZip } from '../utils/zipExporter';

interface AuthScreenProps {
  onAuthSuccess: (uid: string, username: string, avatar: string, email: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Download source code ZIP state
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipSuccessMessage, setZipSuccessMessage] = useState(false);

  const handleDownloadSourceZip = async () => {
    if (downloadingZip) return;
    try {
      setDownloadingZip(true);
      setZipProgress(15);
      await exportRepositoryAsZip(undefined, (progress) => {
        setZipProgress(progress);
      });
      setZipSuccessMessage(true);
      setTimeout(() => setZipSuccessMessage(false), 3500);
    } catch (err: any) {
      console.warn("Client ZIP export error, using direct server route:", err);
      window.location.href = '/api/download-source-zip';
    } finally {
      setTimeout(() => {
        setDownloadingZip(false);
        setZipProgress(0);
      }, 1000);
    }
  };
  
  // Sign Up Form States
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Reset Form State
  const [resetEmail, setResetEmail] = useState('');

  // UI Toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Welcome Consent Modal State
  const [showConsentModal, setShowConsentModal] = useState<boolean>(() => {
    return localStorage.getItem('aura_terms_agreed') !== 'true';
  });

  // Handle OAuth Redirect Result on Mount
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setLoading(true);
          const user = result.user;
          let profile = await fetchUserProfile(user.uid);
          let finalUsername = profile?.username;
          let finalAvatar = profile?.avatar || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

          if (!profile) {
            const baseUsername = user.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || user.email?.split('@')[0] || 'peer';
            finalUsername = `${baseUsername}_${Math.floor(Math.random() * 900) + 100}`;
            
            profile = {
              uid: user.uid,
              username: finalUsername,
              displayName: user.displayName || finalUsername,
              email: user.email || '',
              bio: 'Aura Member via Google',
              avatar: finalAvatar,
              coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
              website: '',
              location: 'Google Identity',
              isVerified: true,
              role: 'user',
              status: 'active',
              createdAt: Date.now()
            };

            await saveUserProfile(user.uid, profile);
          }

          onAuthSuccess(user.uid, finalUsername || 'peer', finalAvatar, user.email || '');
        }
      })
      .catch((err: any) => {
        console.warn("Redirect sign-in handler error:", err);
        if (err.code === 'auth/unauthorized-domain') {
          setError(renderUnauthorizedDomainAlert(window.location.hostname));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAgreeConsent = (enableLocationSafety: boolean) => {
    localStorage.setItem('aura_terms_agreed', 'true');
    localStorage.setItem('aura_location_safety_enabled', enableLocationSafety ? 'true' : 'false');
    setShowConsentModal(false);
  };

  const handleDeclineConsent = () => {
    window.location.href = 'about:blank';
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const isValidUsername = (unameStr: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(unameStr.trim());
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestUid = `peer_${Date.now()}_${Math.floor(Math.random() * 900) + 100}`;
      const guestName = `Peer_${guestUid.slice(-4)}`;
      const guestAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${guestUid}`;
      const guestEmail = `${guestName.toLowerCase()}@aura.net`;

      await saveUserProfile(guestUid, {
        uid: guestUid,
        username: guestName.toLowerCase(),
        displayName: guestName,
        email: guestEmail,
        bio: 'Aura Member (Peer Guest)',
        avatar: guestAvatar,
        coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
        website: '',
        location: 'Aura Network',
        isVerified: false,
        role: 'user',
        status: 'active',
        createdAt: Date.now()
      });

      onAuthSuccess(guestUid, guestName.toLowerCase(), guestAvatar, guestEmail);
    } catch (err: any) {
      setError('Failed to launch guest session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUnauthorizedDomainAlert = (domainName: string) => (
    <div className="space-y-3 p-3.5 bg-amber-950/50 border border-amber-600/50 rounded-2xl text-xs text-amber-200">
      <div className="flex items-center gap-2 font-bold text-amber-300">
        <Globe className="w-4.5 h-4.5 text-amber-400 shrink-0" />
        <span>Firebase Authorized Domain Check Required</span>
      </div>
      <p className="text-[11px] text-slate-300 leading-relaxed">
        Firebase Authentication restricts Google Sign-In to authorized domains. Add this domain to your Firebase Console settings:
      </p>
      
      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Production Domain Hostname</div>
        <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg font-mono text-cyan-300 font-bold border border-cyan-500/30">
          <span className="truncate text-xs">{domainName}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(domainName);
              setCopiedDomain(true);
              setTimeout(() => setCopiedDomain(false), 2000);
            }}
            className="ml-2 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 transition"
          >
            {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedDomain ? 'COPIED!' : 'COPY'}</span>
          </button>
        </div>
      </div>

      <ol className="list-decimal list-inside text-[11px] space-y-1.5 font-mono text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        <li>Open <a href="https://console.firebase.google.com/project/aura-8fda0/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-bold inline-flex items-center gap-1">Firebase Settings <ExternalLink className="w-3 h-3" /></a></li>
        <li>Go to <strong>Authentication → Settings → Authorized domains</strong></li>
        <li>Click <strong>Add domain</strong> and paste: <strong className="text-white">{domainName}</strong></li>
        <li>Save changes and refresh this page.</li>
      </ol>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            const provider = new GoogleAuthProvider();
            signInWithRedirect(auth, provider);
          }}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
        >
          <span>TRY GOOGLE REDIRECT MODE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleGuestSignIn}
          className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-800"
        >
          <span>CONTINUE IN PEER DEMO MODE</span>
        </button>
      </div>
    </div>
  );

  // 1. LOGIN HANDLER (Email + Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || !loginPassword) {
      setError('Please enter both Email Address and Password.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const user = userCredential.user;

      if (user) {
        let profile = null;
        try {
          profile = await fetchUserProfile(user.uid);
        } catch (_) {}
        const finalUsername = profile?.username || user.email?.split('@')[0] || 'peer';
        const finalAvatar = profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;
        
        onAuthSuccess(user.uid, finalUsername, finalAvatar, user.email || cleanEmail);
      }
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      setLoading(false);

      if (err.code === 'auth/operation-not-allowed') {
        setError(
          <div className="space-y-2">
            <p className="font-bold text-amber-300">Email/Password sign-in is disabled in your Firebase project.</p>
            <p className="text-[11px] leading-relaxed">
              To enable it:
            </p>
            <ol className="list-decimal list-inside text-[11px] space-y-1 font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Firebase Console</a></li>
              <li>Select Project: <strong>aura-8fda0</strong></li>
              <li>Go to <strong>Authentication → Sign-in method</strong></li>
              <li>Click <strong>Email/Password</strong> and toggle <strong>Enable</strong>, then click <strong>Save</strong></li>
            </ol>
          </div>
        );
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(renderUnauthorizedDomainAlert(window.location.hostname));
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  // 2. SIGN UP HANDLER (Create Account)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName || !cleanUsername || !cleanEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!isValidUsername(cleanUsername)) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, or underscores.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);

    try {
      const isUnique = await checkUsernameUnique(cleanUsername);
      if (!isUnique) {
        setError(`The username "@${cleanUsername}" is already taken. Please choose another username.`);
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, signupPassword);
      const user = userCredential.user;

      if (user) {
        const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

        await saveUserProfile(user.uid, {
          uid: user.uid,
          displayName: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          bio: 'Aura Network Member',
          avatar: avatarUrl,
          coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
          website: '',
          location: 'Aura Network',
          isVerified: false,
          role: 'user',
          status: 'active',
          createdAt: Date.now()
        });

        onAuthSuccess(user.uid, cleanUsername, avatarUrl, cleanEmail);
      }
    } catch (err: any) {
      console.error("Firebase Sign-Up Error:", err);
      setLoading(false);

      if (err.code === 'auth/operation-not-allowed') {
        setError(
          <div className="space-y-2">
            <p className="font-bold text-amber-300">Email/Password sign-up is disabled in your Firebase project.</p>
            <p className="text-[11px] leading-relaxed">
              To enable it in Firebase Console:
            </p>
            <ol className="list-decimal list-inside text-[11px] space-y-1 font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Firebase Console</a></li>
              <li>Select Project: <strong>aura-8fda0</strong></li>
              <li>Go to <strong>Authentication → Sign-in method</strong></li>
              <li>Click <strong>Email/Password</strong> and toggle <strong>Enable</strong>, then click <strong>Save</strong></li>
            </ol>
          </div>
        );
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password with at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    }
  };

  // 3. GOOGLE SIGN IN HANDLER
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user) {
        let profile = null;
        try {
          profile = await fetchUserProfile(user.uid);
        } catch (_) {}
        let finalUsername = profile?.username;
        let finalAvatar = profile?.avatar || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

        if (!profile) {
          const baseUsername = user.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') || user.email?.split('@')[0] || 'peer';
          finalUsername = `${baseUsername}_${Math.floor(Math.random() * 900) + 100}`;
          
          profile = {
            uid: user.uid,
            username: finalUsername,
            displayName: user.displayName || finalUsername,
            email: user.email || '',
            bio: 'Aura Member via Google',
            avatar: finalAvatar,
            coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
            website: '',
            location: 'Google Identity',
            isVerified: true,
            role: 'user',
            status: 'active',
            createdAt: Date.now()
          };

          await saveUserProfile(user.uid, profile);
        }

        onAuthSuccess(user.uid, finalUsername || 'peer', finalAvatar, user.email || '');
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setLoading(false);

      if (err.code === 'auth/operation-not-allowed') {
        setError(
          <div className="space-y-2">
            <p className="font-bold text-amber-300">Google Sign-In provider is disabled in Firebase Console.</p>
            <ol className="list-decimal list-inside text-[11px] space-y-1 font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Firebase Console</a></li>
              <li>Select Project: <strong>dependable-limiter-p6rpq</strong></li>
              <li>Go to <strong>Authentication → Sign-in method</strong></li>
              <li>Click <strong>Google</strong> and toggle <strong>Enable</strong>, select support email, then click <strong>Save</strong></li>
            </ol>
          </div>
        );
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(renderUnauthorizedDomainAlert(window.location.hostname));
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In popup was closed before completing sign-in.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google Sign-In popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  // 4. PASSWORD RESET HANDLER
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfoMessage(`Password reset link sent successfully to ${cleanEmail}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found matching this email address.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B13] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_50%)]" />
      
      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-[#0A0F1D]/95 border border-purple-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative z-10 my-8">
        
        {/* Quick Source Code Download Button in Auth Header */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleDownloadSourceZip}
            disabled={downloadingZip}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
              zipSuccessMessage
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : downloadingZip
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 animate-pulse'
                : 'bg-slate-900/90 hover:bg-slate-850 border-purple-500/30 text-purple-200 hover:text-white hover:border-purple-400'
            }`}
            title="Download full project source code ZIP archive"
          >
            {zipSuccessMessage ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded ZIP!</span>
              </>
            ) : downloadingZip ? (
              <>
                <div className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                <span>Zipping {zipProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download Source ZIP</span>
              </>
            )}
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-950/50 border border-purple-400/30 mb-3">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-sans uppercase">
            AURA
          </h2>
          <p className="text-slate-400 text-xs mt-1">Social & AI Network</p>
        </div>

        {/* Auth Tabs (Sign In / Sign Up) */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-6 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setInfoMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl transition text-center ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfoMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl transition text-center ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CREATE ACCOUNT
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-950/60 border border-red-800/70 flex items-start gap-2.5 text-red-200 text-xs font-sans animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed w-full">{error}</div>
          </div>
        )}

        {/* Info Alert Box */}
        {infoMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-start gap-2.5 text-emerald-200 text-xs font-sans animate-fadeIn">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {/* ================= MODE: LOG IN ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setInfoMessage(null); }}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-3 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase font-mono transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <span>LOGGING IN...</span>
              ) : (
                <>
                  <span>LOG IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0A0F1D] px-3 text-[10px] text-slate-500 font-mono uppercase tracking-wider absolute">OR</span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium transition flex items-center justify-center gap-3 shadow hover:border-slate-700 disabled:opacity-50"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.24 1 3.22 3.73 1.34 7.73l3.85 3C6.1 7.7 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.43c-.28 1.47-1.11 2.71-2.36 3.55v2.95h3.81c2.23-2.05 3.61-5.07 3.61-8.61z"/>
                <path fill="#FBBC05" d="M5.19 14.24c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.34 6.64C.49 8.25 0 10.07 0 12s.49 3.75 1.34 5.36l3.85-3.12z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.81-2.95c-1.05.7-2.4 1.13-4.15 1.13-3.16 0-5.9-2.66-6.81-5.69l-3.85 3C3.22 20.27 7.24 23 12 23z"/>
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>
          </form>
        )}

        {/* ================= MODE: CREATE ACCOUNT ================= */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Princewill Geleteye"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* 2. Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. princewill_72"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-purple-300 font-mono placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* 3. Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5. Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase font-mono transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <span>CREATING ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0A0F1D] px-3 text-[10px] text-slate-500 font-mono uppercase tracking-wider absolute">OR</span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium transition flex items-center justify-center gap-3 shadow hover:border-slate-700 disabled:opacity-50"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.24 1 3.22 3.73 1.34 7.73l3.85 3C6.1 7.7 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.43c-.28 1.47-1.11 2.71-2.36 3.55v2.95h3.81c2.23-2.05 3.61-5.07 3.61-8.61z"/>
                <path fill="#FBBC05" d="M5.19 14.24c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.34 6.64C.49 8.25 0 10.07 0 12s.49 3.75 1.34 5.36l3.85-3.12z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.81-2.95c-1.05.7-2.4 1.13-4.15 1.13-3.16 0-5.9-2.66-6.81-5.69l-3.85 3C3.22 20.27 7.24 23 12 23z"/>
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>
          </form>
        )}

        {/* ================= MODE: FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-sm font-bold text-white font-sans uppercase">Reset Your Password</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase font-mono transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setInfoMessage(null); }}
              className="w-full text-center text-xs font-mono text-purple-400 hover:text-purple-300 transition block mt-2"
            >
              ← Back to Log In
            </button>
          </form>
        )}

      </div>

      <WelcomeConsentModal
        isOpen={showConsentModal}
        onAgree={handleAgreeConsent}
        onDecline={handleDeclineConsent}
      />
    </div>
  );
}
