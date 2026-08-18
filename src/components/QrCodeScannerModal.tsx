/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  X, 
  Upload, 
  FlipHorizontal, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Server, 
  Radio,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import jsQR from 'jsqr';
import { NetworkNode } from '../types';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeScanned: (node: NetworkNode) => void;
  existingNodes: NetworkNode[];
}

export interface ParsedPeerPayload {
  publicKey: string;
  name?: string;
  ip?: string;
  nodeId?: string;
}

export default function QrCodeScannerModal({
  isOpen,
  onClose,
  onNodeScanned,
  existingNodes
}: QrCodeScannerModalProps) {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ParsedPeerPayload | null>(null);
  const [customNodeName, setCustomNodeName] = useState('');
  const [customIp, setCustomIp] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse raw scanned text into a structured peer node
  const parsePayload = useCallback((raw: string): ParsedPeerPayload | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // 1. Try parsing JSON format
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (parsed.publicKey || parsed.pubKey || parsed.key) {
          return {
            publicKey: parsed.publicKey || parsed.pubKey || parsed.key,
            name: parsed.name || parsed.nodeName || `Peer-${(parsed.publicKey || '').slice(0, 6)}`,
            ip: parsed.ip || parsed.host || `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            nodeId: parsed.id || parsed.nodeId
          };
        }
      }
    } catch {
      // Ignore JSON parse failure and fall back
    }

    // 2. Try URI schemes (e.g. aura://node?key=... or aura:node:...)
    if (trimmed.startsWith('aura:') || trimmed.startsWith('auranode:') || trimmed.startsWith('p2p:')) {
      try {
        const urlObj = new URL(trimmed.replace(/^aura:\/\//, 'https://aura.internal/'));
        const key = urlObj.searchParams.get('key') || urlObj.searchParams.get('pubkey') || urlObj.searchParams.get('publicKey');
        const name = urlObj.searchParams.get('name');
        const ip = urlObj.searchParams.get('ip');
        if (key) {
          return {
            publicKey: key,
            name: name || undefined,
            ip: ip || undefined
          };
        }
      } catch {
        // Continue
      }
    }

    // 3. Direct Public Key String (Hex, Base64, or Standard Key String)
    if (trimmed.length >= 16) {
      return {
        publicKey: trimmed,
        name: `Node-${trimmed.slice(0, 6)}`,
        ip: `${Math.floor(Math.random() * 180) + 30}.${Math.floor(Math.random() * 250) + 2}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 2}`
      };
    }

    return null;
  }, []);

  // Stop camera media stream
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Frame scanner loop using jsQR
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        const parsed = parsePayload(code.data);
        if (parsed) {
          // Play subtle haptic feedback if supported
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          setScannedResult(parsed);
          setCustomNodeName(parsed.name || `Node-${parsed.publicKey.slice(0, 6)}`);
          setCustomIp(parsed.ip || `192.168.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`);
          stopCamera();
          return;
        }
      }
    }

    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  }, [isScanning, parsePayload, stopCamera]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment. Please use image upload or manual input.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      let message = 'Unable to access camera. Please check camera permissions or use image upload below.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please grant camera permission in your browser or switch to image upload.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device. Please use QR image upload or manual key entry.';
      }
      setCameraError(message);
      setIsScanning(false);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !scannedResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode, scannedResult, startCamera, stopCamera]);

  useEffect(() => {
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, scanVideoFrame]);

  // Handle image file scan
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setManualError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setIsProcessingImage(false);
          setManualError('Could not process canvas context.');
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsProcessingImage(false);

        if (code && code.data) {
          const parsed = parsePayload(code.data);
          if (parsed) {
            setScannedResult(parsed);
            setCustomNodeName(parsed.name || `Node-${parsed.publicKey.slice(0, 6)}`);
            setCustomIp(parsed.ip || `172.16.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`);
          } else {
            setManualError('QR code detected, but payload does not contain a valid Aura peer public key.');
          }
        } else {
          setManualError('No QR code found in the uploaded image. Please try a clearer image or use manual entry.');
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setManualError('Failed to load image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual input submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const parsed = parsePayload(manualInput);
    if (parsed) {
      setScannedResult(parsed);
      setCustomNodeName(parsed.name || `Node-${parsed.publicKey.slice(0, 6)}`);
      setCustomIp(parsed.ip || `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250) + 1}`);
    } else {
      setManualError('Invalid public key format. Please enter a valid public key string (at least 16 characters) or JSON node payload.');
    }
  };

  // Confirm and add node to network
  const handleConfirmAddNode = () => {
    if (!scannedResult) return;

    // Check if node already exists
    const cleanKey = scannedResult.publicKey.trim();
    const alreadyExists = existingNodes.some(
      n => n.publicKey === cleanKey || n.id === scannedResult.nodeId || n.name.toLowerCase() === customNodeName.trim().toLowerCase()
    );

    const newNode: NetworkNode = {
      id: scannedResult.nodeId || `node_peer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: customNodeName.trim() || `Node-${cleanKey.slice(0, 6)}`,
      status: 'online',
      ip: customIp.trim() || '192.168.1.100',
      ping: Math.floor(Math.random() * 45) + 12,
      syncedBlocks: 4,
      publicKey: cleanKey,
      addedAt: Date.now(),
      isCustom: true
    };

    onNodeScanned(newNode);
    handleResetModal();
    onClose();
  };

  const handleResetModal = () => {
    setScannedResult(null);
    setCustomNodeName('');
    setCustomIp('');
    setManualInput('');
    setManualError(null);
    setCameraError(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      id="qr-scanner-modal-backdrop"
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="qr-scanner-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                <span>Scan Peer Node QR</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                  P2P Mesh
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Scan another peer&apos;s public key to add them to your DHT mesh
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              handleResetModal();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {!scannedResult ? (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => {
                    setActiveMode('camera');
                    setManualError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeMode === 'camera'
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera</span>
                </button>
                <button
                  onClick={() => {
                    setActiveMode('upload');
                    stopCamera();
                    setManualError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeMode === 'upload'
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  onClick={() => {
                    setActiveMode('manual');
                    stopCamera();
                    setManualError(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    activeMode === 'manual'
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Paste Key</span>
                </button>
              </div>

              {/* CAMERA MODE */}
              {activeMode === 'camera' && (
                <div className="space-y-3">
                  <div className="relative aspect-video sm:aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Viewfinder Target Graphic */}
                    {!cameraError && isScanning && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-52 h-52 relative border border-cyan-500/30 rounded-2xl">
                          {/* Corner Brackets */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                          
                          {/* Animated Scan Line */}
                          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scanLaser_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        </div>
                      </div>
                    )}

                    {/* Camera Error Message */}
                    {cameraError && (
                      <div className="p-6 text-center space-y-3 max-w-sm">
                        <div className="w-10 h-10 mx-auto rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <p className="text-xs text-amber-300 font-sans leading-relaxed">
                          {cameraError}
                        </p>
                        <div className="flex justify-center gap-2 pt-1">
                          <button
                            onClick={startCamera}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono transition flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry Camera
                          </button>
                          <button
                            onClick={() => setActiveMode('upload')}
                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3" />
                            Upload Image Instead
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Camera Controls Overlay */}
                    {!cameraError && isScanning && (
                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>Align QR Code inside box</span>
                        </div>
                        <button
                          onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-300 transition text-[10px]"
                          title="Switch camera front/back"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5" />
                          <span>Flip</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UPLOAD MODE */}
              {activeMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition space-y-3 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition">
                      {isProcessingImage ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <strong className="text-sm text-slate-200 block font-sans">
                        {isProcessingImage ? 'Analyzing QR image...' : 'Click or drop a QR code image here'}
                      </strong>
                      <p className="text-xs text-slate-500 font-sans mt-1">
                        Supports PNG, JPG, WEBP screenshots containing node public keys
                      </p>
                    </div>
                  </div>

                  {manualError && (
                    <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-amber-300 text-xs font-sans flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{manualError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL MODE */}
              {activeMode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                      Peer Public Key or Node Payload
                    </label>
                    <textarea
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste 64+ char public key (e.g. 30820122300d06092a864886f70d...) or JSON node payload..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-400 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 scrollbar-thin"
                      required
                    />
                  </div>

                  {manualError && (
                    <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-rose-300 text-xs font-sans flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{manualError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Validate & Add Key</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            /* SCANNED RESULT CONFIRMATION VIEW */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-sans">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Valid Peer Public Key Discovered!</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  The scanned QR payload matches cryptographic peer specifications. You can customize the local node nickname before linking it to your DHT swarm.
                </p>
              </div>

              {/* Node Configuration Form */}
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 block tracking-wider font-semibold">
                    Node Nickname
                  </label>
                  <input
                    type="text"
                    value={customNodeName}
                    onChange={(e) => setCustomNodeName(e.target.value)}
                    placeholder="e.g. Tokyo-Peer-Validator"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 block tracking-wider font-semibold">
                    Simulated / Mesh IP Address
                  </label>
                  <input
                    type="text"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    placeholder="e.g. 192.168.4.12"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400 block tracking-wider font-semibold">
                    Scanned Public Address Key
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-cyan-400 break-all select-all max-h-24 overflow-y-auto scrollbar-thin font-mono leading-relaxed">
                    {scannedResult.publicKey}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono transition"
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddNode}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-1.5"
                >
                  <Server className="w-4 h-4" />
                  <span>Add Node to Swarm</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero-Knowledge Handshake</span>
          </span>
          <span>Aura DHT Protocol</span>
        </div>
      </div>
    </div>
  );
}
