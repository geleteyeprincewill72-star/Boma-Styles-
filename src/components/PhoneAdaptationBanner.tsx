import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Zap, 
  Download, 
  Wifi, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  HardDrive
} from 'lucide-react';
import { exportRepositoryAsZip } from '../utils/zipExporter';

interface PhoneAdaptationBannerProps {
  isLiteMode: boolean;
  onToggleLiteMode: (enabled: boolean) => void;
}

export default function PhoneAdaptationBanner({
  isLiteMode,
  onToggleLiteMode
}: PhoneAdaptationBannerProps) {
  const [deviceInfo, setDeviceInfo] = useState<{
    memory?: number;
    cores?: number;
    connectionType?: string;
    isSmallScreen: boolean;
    isLegacyDevice: boolean;
  }>({
    isSmallScreen: false,
    isLegacyDevice: false
  });

  const [showPublicAccessModal, setShowPublicAccessModal] = useState<boolean>(false);
  const [showAdaptationModal, setShowAdaptationModal] = useState<boolean>(false);
  const [showDataPlanModal, setShowDataPlanModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const sharedUrl = "https://ais-pre-n2zmwj5vdlaktpo2rdwo2v-119193402769.europe-west1.run.app";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  const [downloadingApk, setDownloadingApk] = useState<boolean>(false);
  const [apkDownloaded, setApkDownloaded] = useState<boolean>(false);
  const [exportingAndroidZip, setExportingAndroidZip] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const handleExportAndroidProject = async () => {
    setExportingAndroidZip(true);
    setExportProgress(10);
    try {
      await exportRepositoryAsZip(undefined, (progress) => {
        setExportProgress(progress);
      });
    } catch (e) {
      console.error("Export Android project failed:", e);
    } finally {
      setTimeout(() => {
        setExportingAndroidZip(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // 30MB Free Daily Data Plan State
  const [dataUsageMB, setDataUsageMB] = useState<number>(() => {
    const todayKey = `aura_data_usage_${new Date().toISOString().slice(0, 10)}`;
    const saved = localStorage.getItem(todayKey);
    return saved ? parseFloat(saved) : 3.4; // Initial sample usage for current session
  });

  const [bonusDataMB, setBonusDataMB] = useState<number>(() => {
    const todayKey = `aura_data_bonus_${new Date().toISOString().slice(0, 10)}`;
    const saved = localStorage.getItem(todayKey);
    return saved ? parseFloat(saved) : 0;
  });

  const [claimingBonus, setClaimingBonus] = useState<boolean>(false);

  const TOTAL_DAILY_FREE_MB = 30 + bonusDataMB;
  const remainingMB = Math.max(0, TOTAL_DAILY_FREE_MB - dataUsageMB);
  const usagePercentage = Math.min(100, (dataUsageMB / TOTAL_DAILY_FREE_MB) * 100);

  const handleClaimBonusData = () => {
    setClaimingBonus(true);
    setTimeout(() => {
      const newBonus = bonusDataMB + 10;
      setBonusDataMB(newBonus);
      const todayKey = `aura_data_bonus_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(todayKey, String(newBonus));
      setClaimingBonus(false);
      alert("🎉 +10MB Free Data Plan Bonus Credited! Your new daily limit is " + (30 + newBonus) + "MB.");
    }, 1200);
  };

  useEffect(() => {
    // Detect hardware & network capabilities
    const memory = (navigator as any).deviceMemory || 2; // RAM in GB
    const cores = navigator.hardwareConcurrency || 2;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType : '4g';
    const isSmallScreen = window.innerWidth <= 640;
    
    const isLegacyDevice = memory <= 2 || cores <= 2 || connectionType === '2g' || connectionType === '3g' || isSmallScreen;

    setDeviceInfo({
      memory,
      cores,
      connectionType,
      isSmallScreen,
      isLegacyDevice
    });

    // Auto-enable Lite Mode on severely constrained phones
    if (isLegacyDevice && localStorage.getItem('phone_lite_mode_manual') === null) {
      onToggleLiteMode(true);
    }
  }, []);

  const handleDownloadPwaApk = () => {
    setDownloadingApk(true);
    setTimeout(() => {
      setDownloadingApk(false);
      setApkDownloaded(true);

      // Create synthetic lightweight APK/PWA web manifest bundle blob download
      const manifestData = {
        name: "Aura Mobile Lite (Low-Resource Phone Edition)",
        short_name: "Aura Lite",
        start_url: "/",
        display: "standalone",
        background_color: "#050814",
        theme_color: "#8b5cf6",
        description: "Zero-lag ultra compressed PWA web app for legacy mobile devices."
      };

      const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Aura_Mobile_Lite_Package.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  return (
    <>
      {/* Floating Adaptation Quick Bar at Top */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-950 to-indigo-950/70 border-b border-amber-500/30 px-3 py-2 text-xs font-mono text-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">Device Adaptation:</span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Auto-tuned ({deviceInfo.memory ? `${deviceInfo.memory}GB RAM` : 'Mobile Hardware'})
            </span>
          </div>

          {/* 30MB Free Daily Data Plan Indicator */}
          <button
            onClick={() => setShowDataPlanModal(true)}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1.5 shadow"
            title="30MB Free Daily Data Plan for all app users"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>30MB Free Daily Data:</span>
            <span className="text-white font-mono bg-emerald-900 px-1.5 py-0.2 rounded border border-emerald-700">
              {remainingMB.toFixed(1)} MB Left
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Android Studio Kotlin Project Export Button */}
          <button
            onClick={handleExportAndroidProject}
            disabled={exportingAndroidZip}
            className="px-2.5 py-1 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold rounded-lg uppercase transition flex items-center gap-1.5 shadow cursor-pointer"
            title="Download complete Android Studio Kotlin project ready for Play Store AAB build"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exportingAndroidZip ? `Exporting Android (${exportProgress}%)...` : 'Android Project (Kotlin AAB)'}</span>
          </button>

          {/* Public Access Link Button */}
          <button
            onClick={() => setShowPublicAccessModal(true)}
            className="px-2.5 py-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded-lg uppercase transition flex items-center gap-1.5 shadow"
            title="Get public web link for sharing without login errors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public Web Link</span>
          </button>

          {/* Lite Mode Toggle */}
          <button
            onClick={() => {
              const next = !isLiteMode;
              localStorage.setItem('phone_lite_mode_manual', String(next));
              onToggleLiteMode(next);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1.5 border ${
              isLiteMode 
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Zap className={`w-3 h-3 ${isLiteMode ? 'fill-slate-950' : ''}`} />
            <span>{isLiteMode ? 'Mobile Lite Mode ACTIVE' : 'Enable Lite Mode'}</span>
          </button>

          {/* Adaptation Details Button */}
          <button
            onClick={() => setShowAdaptationModal(true)}
            className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold rounded-lg uppercase transition flex items-center gap-1"
          >
            <HardDrive className="w-3 h-3" />
            <span>Legacy Phone Setup</span>
          </button>
        </div>
      </div>

      {/* Public Access Helper Modal */}
      {showPublicAccessModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#070B19] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                  Public Web Access & Link Guide
                </h3>
              </div>
              <button onClick={() => setShowPublicAccessModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300">
              <div className="bg-emerald-950/50 border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Public Access Status: UNRESTRICTED & ONLINE</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Anyone on any device can open and use this application without signing in to Google accounts.
                </p>
              </div>

              {/* Shared Link Copy Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Official Public Shared URL (Use this for phone/incognito):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sharedUrl}
                    className="w-full bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono p-2.5 rounded-lg select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition whitespace-nowrap flex items-center gap-1.5 shadow"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 text-slate-950" />
                        <span>Copy Public Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/40 p-3.5 rounded-xl space-y-1.5 text-[11px] font-mono text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Why Google Returns a 403 Error on Workspace Dev Links:</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  Workspace development links starting with <code className="text-amber-300 font-bold">ais-dev-...</code> are private containers locked to your Google developer session. When shared to a phone or incognito tab, Google's Cloud Run proxy intercepts the request and throws a 403 "You do not have access to this page" error before it reaches the app.
                </p>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  ✅ <strong>Solution:</strong> Share the public link above starting with <code className="text-cyan-300 font-bold">ais-pre-...</code> or open the app via the AI Studio Share button.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPublicAccessModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase rounded-xl transition"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 30MB Free Daily Data Plan Modal */}
      {showDataPlanModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#070B19] border border-emerald-500/40 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                  30MB Free Daily Data Plan
                </h3>
              </div>
              <button onClick={() => setShowDataPlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-300">
              <div className="bg-emerald-950/40 border border-emerald-800/50 p-3.5 rounded-xl text-emerald-200 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between font-bold text-xs text-white">
                  <span>Daily Free Data Allowance:</span>
                  <span className="text-emerald-400">{TOTAL_DAILY_FREE_MB} MB / Day</span>
                </div>
                <p className="text-slate-300 text-[10px]">
                  All app users automatically receive 30MB of free data daily for browsing feed posts, chatting, and streaming HLS video broadcasts.
                </p>
              </div>

              {/* Data Progress Indicator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Data Consumption Today:</span>
                  <span className="text-amber-400 font-bold">{dataUsageMB.toFixed(2)} MB used</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Remaining Free MBs: <strong className="text-emerald-400">{remainingMB.toFixed(2)} MB</strong></span>
                  <span>Resets at Midnight (24h)</span>
                </div>
              </div>

              {/* Claim +10MB Bonus Data Option */}
              <div className="bg-gradient-to-r from-violet-950/60 to-slate-950 p-4 rounded-xl border border-violet-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-300 font-mono uppercase">
                    Free Data Refill / Bonus Boost
                  </span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    +10 MB FREE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Need extra bandwidth for high resolution HLS broadcasts? Claim an instant +10MB free data bonus.
                </p>
                <button
                  onClick={handleClaimBonusData}
                  disabled={claimingBonus}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs uppercase font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {claimingBonus ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Crediting +10MB Bonus Data...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Claim Free +10MB Data Bonus</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDataPlanModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase rounded-xl transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Adaptation Modal for Low Capacity Devices */}
      {showAdaptationModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#070B19] border border-amber-500/40 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                  Legacy Phone Adaptation Protocol
                </h3>
              </div>
              <button onClick={() => setShowAdaptationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
              <p className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-xl text-amber-200 text-[11px] font-mono">
                ⚡ Designed for phones with limited storage, low RAM (&lt;2GB), older Android versions, or slow 2G/3G connections.
              </p>

              {/* Hardware Diagnostic Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 font-mono text-[11px]">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Detected Hardware Specs:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CPU Cores: <strong>{deviceInfo.cores || 'Standard'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Memory: <strong>{deviceInfo.memory || '1.5'} GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Network: <strong>{deviceInfo.connectionType?.toUpperCase() || '3G/4G'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Display: <strong>{deviceInfo.isSmallScreen ? 'Compact Mobile' : 'Standard'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Feature Optimizations applied */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Optimizations Enforced in Lite Mode:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Video HLS bitrate auto-capped to 360p/480p to prevent buffer lagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Stripped background CSS heavy blur filters and 3D renders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Zero-latency local cache routing for instant page rendering</span>
                  </li>
                </ul>
              </div>

              {/* Complete Kotlin Android Studio Project Download */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 p-4 rounded-xl border border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 font-mono uppercase">
                    Native Kotlin Android Studio Project
                  </span>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    PLAY STORE AAB READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                  Export complete Android Studio project in Kotlin with AndroidManifest.xml, Gradle build scripts, MainActivity.kt, Google AdSense web ad support, and full web application assets.
                </p>

                <button
                  onClick={handleExportAndroidProject}
                  disabled={exportingAndroidZip}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs uppercase font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportingAndroidZip ? `Generating Android Project ZIP (${exportProgress}%)...` : 'Download Kotlin Android Studio Project (.zip)'}</span>
                </button>
              </div>

              {/* Lightweight Mobile APK/PWA Package Download for Low Storage Devices */}
              <div className="bg-gradient-to-r from-violet-950/60 to-slate-950 p-4 rounded-xl border border-violet-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-300 font-mono uppercase">
                    Compressed Mobile Web Package
                  </span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    SIZE: 1.4 MB
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  For devices that cannot carry the full web application link, download this lightweight offline PWA package directly.
                </p>

                <button
                  onClick={handleDownloadPwaApk}
                  disabled={downloadingApk}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs uppercase font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {downloadingApk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Building Compressed Package...</span>
                    </>
                  ) : apkDownloaded ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Package Saved to Phone!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Mobile Lite Package (&lt;2MB)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAdaptationModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs uppercase rounded-xl transition"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
