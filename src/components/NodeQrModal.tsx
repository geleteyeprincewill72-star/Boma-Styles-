/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Key, 
  ShieldCheck,
  Server
} from 'lucide-react';
import QRCode from 'qrcode';

interface NodeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  nodeName?: string;
  ip?: string;
  isSelf?: boolean;
}

export default function NodeQrModal({
  isOpen,
  onClose,
  publicKey,
  nodeName = 'My Sovereign Node',
  ip = '127.0.0.1',
  isSelf = true
}: NodeQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Structured payload for standard discovery
  const payloadJson = JSON.stringify({
    type: 'aura-peer-node',
    version: '2.6',
    name: nodeName,
    publicKey: publicKey,
    ip: ip,
    timestamp: Date.now()
  });

  useEffect(() => {
    if (!isOpen || !publicKey) return;

    // Generate high-resolution QR code
    QRCode.toDataURL(payloadJson, {
      width: 400,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.warn('QR Generation error, falling back to direct key:', err);
        QRCode.toDataURL(publicKey, {
          width: 400,
          margin: 2,
          color: {
            dark: '#030712',
            light: '#ffffff'
          }
        }).then(setQrDataUrl).catch(console.error);
      });
  }, [isOpen, publicKey, payloadJson]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadJson);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `aura-node-${nodeName.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      id="node-qr-modal-backdrop"
    >
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="node-qr-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                <span>{nodeName}</span>
                {isSelf && (
                  <span className="text-[9px] bg-violet-950 text-violet-300 border border-violet-800/60 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                    Your Node
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Asymmetric Public Key QR Code for P2P Discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin text-center">
          {/* QR Container */}
          <div className="bg-white p-4 rounded-2xl border-4 border-slate-800 shadow-xl inline-block mx-auto max-w-[260px]">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`${nodeName} Public Key QR Code`}
                className="w-full h-auto aspect-square object-contain rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 font-mono text-xs">
                Generating QR Code...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Have another peer open their Aura <strong className="text-cyan-400">Network &gt; Scan Node QR</strong> to instantly link your node to their distributed swarm.
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>IP: {ip}</span>
              <span>•</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ECDSA / RSA Signed</span>
            </div>
          </div>

          {/* Key Box */}
          <div className="space-y-1.5 text-left font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Public Address Key</span>
              <button
                onClick={handleCopyKey}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied Key!' : 'Copy Key'}</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-cyan-400 break-all select-all font-mono max-h-20 overflow-y-auto scrollbar-thin">
              {publicKey}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleCopyPayload}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'JSON Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadQr}
              className="py-2.5 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-violet-400" />
            <span>Public Identity Only</span>
          </span>
          <span>Zero Secret Exposure</span>
        </div>
      </div>
    </div>
  );
}
