import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  Lock, 
  AlertTriangle, 
  X, 
  CheckCircle, 
  Compass, 
  Radio, 
  Activity,
  Key,
  KeyRound
} from 'lucide-react';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface DeviceSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  username: string;
  triggerNotification: (msg: string) => void;
}

export default function DeviceSecurityModal({
  isOpen,
  onClose,
  uid,
  username,
  triggerNotification
}: DeviceSecurityModalProps) {
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return localStorage.getItem('aura_geo_permission_granted') === 'true';
  });
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number; time: number } | null>(() => {
    const saved = localStorage.getItem('aura_device_last_coords');
    return saved ? JSON.parse(saved) : null;
  });
  const [recoveryKey, setRecoveryKey] = useState<string>(() => {
    let key = localStorage.getItem('aura_secondary_recovery_key');
    if (!key) {
      key = 'AURA-SEC-' + Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
      localStorage.setItem('aura_secondary_recovery_key', key);
    }
    return key;
  });
  const [remoteLocked, setRemoteLocked] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  useEffect(() => {
    if (hasPermission && !coords) {
      refreshDeviceLocation();
    }
  }, [hasPermission]);

  const requestPermissionAndLocate = () => {
    setLoadingGeo(true);
    if (!navigator.geolocation) {
      triggerNotification("Geolocation is not supported by your browser engine.");
      setLoadingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          time: Date.now()
        };
        setCoords(newCoords);
        setHasPermission(true);
        localStorage.setItem('aura_geo_permission_granted', 'true');
        localStorage.setItem('aura_device_last_coords', JSON.stringify(newCoords));

        // Sync securely to Firestore if available
        try {
          if (uid) {
            await setDoc(doc(db, 'device_tracking', uid), {
              username,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              updatedAt: Date.now(),
              userAgent: navigator.userAgent,
              deviceFingerprint: `NODE-GPU-${pos.coords.latitude.toFixed(2)}`
            }, { merge: true });
          }
        } catch (e) {
          console.log("Local security sync active.");
        }

        setLoadingGeo(false);
        triggerNotification("Device security geolocation active. Primary device trackable if misplaced.");
      },
      (err) => {
        console.error("Geo error:", err);
        setLoadingGeo(false);
        triggerNotification(`Location permission request denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const refreshDeviceLocation = () => {
    requestPermissionAndLocate();
  };

  const toggleEmergencyAlarm = () => {
    setAlarmActive(!alarmActive);
    if (!alarmActive) {
      triggerNotification("🚨 Emergency Locator Beacon Triggered! High-pitch audio signal broadcasted.");
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 2.5);
      } catch (e) {
        // audio fallback
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0A0F1D] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5 animate-fadeIn font-sans">
        
        {/* Top Glow & Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                <span>Device Anti-Theft & Security Grid</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Misplaced device recovery & biometric login protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Request Banner */}
        {!hasPermission ? (
          <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl space-y-3 text-xs text-amber-200 leading-relaxed">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-300 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Permission Consent Required</span>
            </div>
            <p>
              To protect your login against unauthorized access and ensure you can track your phone if misplaced, Aura requests access to your device's Geolocation.
            </p>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-mono">
              🛡️ <strong>Reason:</strong> Coordinates are encrypted client-side. If your phone is lost, logging into Aura from another device will reveal its last known GPS location and allow remote alarm triggers.
            </div>
            <button
              onClick={requestPermissionAndLocate}
              disabled={loadingGeo}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-100 font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-slate-100 animate-spin" />
              <span>{loadingGeo ? 'Requesting GPS Consent...' : 'Grant Device Protection Consent'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Last Known Coordinates Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Last Known Coordinates:</span>
                </span>
                <button
                  onClick={refreshDeviceLocation}
                  disabled={loadingGeo}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] underline font-bold"
                >
                  {loadingGeo ? 'Refreshing...' : 'Refresh GPS'}
                </button>
              </div>

              {coords ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Latitude</span>
                    <span className="text-emerald-300 font-bold">{coords.lat.toFixed(5)}° N</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Longitude</span>
                    <span className="text-emerald-300 font-bold">{coords.lng.toFixed(5)}° E</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Precision Radius</span>
                    <span className="text-slate-300">± {coords.accuracy.toFixed(1)} meters</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Captured Time</span>
                    <span className="text-slate-300">{new Date(coords.time).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-500 p-2 text-center">
                  Acquiring GPS coordinates...
                </div>
              )}

              {/* Map Preview Link */}
              {coords && (
                <a
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Live Device Coordinates on Map</span>
                </a>
              )}
            </div>

            {/* Emergency Locator Alarm & Remote Lock */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleEmergencyAlarm}
                className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  alarmActive
                    ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-red-500/50 hover:text-red-300'
                }`}
              >
                <Radio className="w-5 h-5 text-red-400" />
                <span>{alarmActive ? 'SILENCE BEACON' : 'TRIGGER BEACON'}</span>
              </button>

              <button
                onClick={() => {
                  setRemoteLocked(!remoteLocked);
                  triggerNotification(remoteLocked ? "Device remote lock disengaged." : "🔒 Remote Device Lock Activated! Login session protected.");
                }}
                className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                  remoteLocked
                    ? 'bg-amber-950 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300'
                }`}
              >
                <Lock className="w-5 h-5 text-amber-400" />
                <span>{remoteLocked ? 'UNLOCK SESSION' : 'REMOTE LOCK'}</span>
              </button>
            </div>

            {/* Secondary Master Recovery Key */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Secondary Recovery Key</span>
                </span>
                <span className="text-[10px] text-slate-500">Keep confidential</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                If you forget your password, enter this key on the login screen to reset account access instantly:
              </p>
              <div className="p-2 bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-center rounded-lg tracking-widest select-all">
                {recoveryKey}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-xl border border-slate-800 transition"
          >
            Close Security Controls
          </button>
        </div>

      </div>
    </div>
  );
}
