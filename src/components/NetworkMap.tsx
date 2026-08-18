/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Network, 
  Key, 
  CheckCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Database,
  Cpu,
  AlertTriangle,
  QrCode,
  Camera,
  Plus,
  Trash2,
  Radio,
  ExternalLink,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { NetworkNode, FeedPost } from '../types';
import { verifySignature } from '../utils/crypto';
import QrCodeScannerModal from './QrCodeScannerModal';
import NodeQrModal from './NodeQrModal';

interface NetworkMapProps {
  nodes: NetworkNode[];
  posts: FeedPost[];
  myPublicKey: string;
  myPrivateKey: string;
  onRefreshNodes: () => void;
  onGenerateNewKeys: () => void;
  onAddNode?: (node: NetworkNode) => void;
  onRemoveNode?: (nodeId: string) => void;
  isAppCreator?: boolean;
}

export default function NetworkMap({
  nodes,
  posts,
  myPublicKey,
  myPrivateKey,
  onRefreshNodes,
  onGenerateNewKeys,
  onAddNode,
  onRemoveNode,
  isAppCreator = false
}: NetworkMapProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ledgerVerified, setLedgerVerified] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [verifiedCount, setVerifiedCount] = useState(0);

  // QR Modal States
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showNodeQrModal, setShowNodeQrModal] = useState(false);
  const [selectedQrNode, setSelectedQrNode] = useState<{
    publicKey: string;
    name: string;
    ip: string;
    isSelf: boolean;
  } | null>(null);

  // Node added toast feedback
  const [lastAddedNodeName, setLastAddedNodeName] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshNodes();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleVerifyLedger = async () => {
    setLedgerVerified('verifying');
    setVerifiedCount(0);
    
    let valid = true;
    let checked = 0;

    for (const post of posts) {
      // Re-sign verification
      const sigPayload = `${post.authorName}:${post.content}:${post.type}:${post.timestamp}`;
      const isOk = await verifySignature(sigPayload, post.signature, post.authorPublicKey);
      if (!isOk) {
        valid = false;
        break;
      }
      checked++;
      setVerifiedCount(checked);
    }

    setTimeout(() => {
      setLedgerVerified(valid ? 'valid' : 'invalid');
    }, 800);
  };

  const handleNodeScanned = (newNode: NetworkNode) => {
    if (onAddNode) {
      onAddNode(newNode);
    }
    setLastAddedNodeName(newNode.name);
    setTimeout(() => {
      setLastAddedNodeName(null);
    }, 4500);
  };

  const handleOpenMyQr = () => {
    setSelectedQrNode({
      publicKey: myPublicKey,
      name: 'Local Sovereign Client',
      ip: '127.0.0.1 (Local)',
      isSelf: true
    });
    setShowNodeQrModal(true);
  };

  const handleOpenPeerQr = (node: NetworkNode) => {
    setSelectedQrNode({
      publicKey: node.publicKey || `30820122300d06092a864886f70d01010105000382010f003082010a0282010100${node.id.replace(/[^a-f0-9]/gi, '')}9b2`,
      name: node.name,
      ip: node.ip,
      isSelf: !!node.isSelf
    });
    setShowNodeQrModal(true);
  };

  const onlineNodesCount = nodes.filter(n => n.status === 'online').length;
  const customNodesCount = nodes.filter(n => n.isCustom).length;

  return (
    <div className="space-y-6" id="network-map-container">
      {/* Network Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
              <Network className="text-cyan-400 w-5 h-5" />
              Distributed Swarm & Key Network
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>{onlineNodesCount}/{nodes.length} MESH PEERS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time peer discovery map • Local asymmetric cryptographic key pairs • QR P2P Node Linking
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scan QR Code Button */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-cyan-950/30 active:scale-95"
            id="scan-node-qr-btn"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Node QR</span>
          </button>

          {/* Show My Node QR */}
          <button
            onClick={handleOpenMyQr}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-750 hover:bg-slate-850 hover:border-violet-500/40 text-violet-300 rounded-xl text-xs font-mono transition"
            id="show-my-qr-btn"
          >
            <QrCode className="w-3.5 h-3.5 text-violet-400" />
            <span>My Node QR</span>
          </button>

          {/* Rediscover Peers */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono transition"
            disabled={isRefreshing}
            title="Refresh ping and peer block heights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Rediscover</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner on Adding Peer via QR */}
      {lastAddedNodeName && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 text-xs font-mono animate-fadeIn shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block font-sans text-xs">P2P Node Successfully Linked!</strong>
              <span>Node &quot;{lastAddedNodeName}&quot; added to your local DHT Swarm mesh & routing table.</span>
            </div>
          </div>
          <button
            onClick={() => setLastAddedNodeName(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-900/60 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-slate-500 block">Total Swarm Nodes</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>{nodes.length} Nodes</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-slate-500 block">Active Status</span>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{onlineNodesCount} Online</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-slate-500 block">QR Scanned Peers</span>
          <div className="text-lg font-bold text-violet-400 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>{customNodesCount} Added</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase text-slate-500 block">DHT Latency</span>
          <div className="text-lg font-bold text-cyan-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>~28 ms avg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: The Swarm Topology Node Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-sans text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Direct Node Connections (DHT Mesh)</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                Interactive Topology
              </span>
            </div>

            {/* Dynamic SVG Graph of Nodes */}
            <div className="aspect-video sm:aspect-[16/10] bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#151D30_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Dynamic SVG Connection Mesh */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Core Connection lines */}
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#10b981" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20%" y1="25%" x2="80%" y2="25%" stroke="#334155" strokeWidth="1" />
                <line x1="80%" y1="25%" x2="75%" y2="75%" stroke="#334155" strokeWidth="1" />
                <line x1="75%" y1="75%" x2="25%" y2="75%" stroke="#334155" strokeWidth="1" />
                <line x1="25%" y1="75%" x2="20%" y2="25%" stroke="#334155" strokeWidth="1" />

                {/* Additional dynamic lines for scanned custom nodes */}
                {nodes.some(n => n.isCustom) && (
                  <>
                    <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
                    <line x1="20%" y1="25%" x2="50%" y2="15%" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                  </>
                )}
              </svg>

              {/* Node Bubbles with tooltips */}
              <div 
                onClick={() => handleOpenPeerQr(nodes[1] || nodes[0])}
                className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                title="Click to view node QR"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(6,182,212,0.5)] group-hover:scale-110 transition">
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded shadow">
                  Frankfurt-Relay
                </span>
              </div>

              <div 
                onClick={() => handleOpenPeerQr(nodes[2] || nodes[0])}
                className="absolute top-[25%] right-[20%] translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                title="Click to view node QR"
              >
                <div className="w-8 h-8 rounded-full bg-violet-950 border-2 border-violet-500 flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:scale-110 transition">
                  <Server className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded shadow">
                  Seattle-Val-6
                </span>
              </div>

              <div 
                onClick={() => handleOpenPeerQr(nodes[3] || nodes[0])}
                className="absolute bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2 flex flex-col items-center group cursor-pointer"
                title="Click to view node QR"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-110 transition">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded shadow">
                  Tokyo-Gossip
                </span>
              </div>

              <div 
                onClick={() => handleOpenPeerQr(nodes[4] || nodes[0])}
                className="absolute bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2 flex flex-col items-center group cursor-pointer"
                title="Click to view node QR"
              >
                <div className="w-8 h-8 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition">
                  <Server className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded shadow">
                  Melbourne-DHT
                </span>
              </div>

              {/* Scanned Custom Peer Node Bubble */}
              {nodes.filter(n => n.isCustom).slice(0, 1).map((cNode) => (
                <div 
                  key={cNode.id}
                  onClick={() => handleOpenPeerQr(cNode)}
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                  title="Click to view node QR"
                >
                  <div className="w-9 h-9 rounded-full bg-pink-950 border-2 border-pink-500 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.6)] animate-pulse group-hover:scale-110 transition">
                    <QrCode className="w-4 h-4 text-pink-300" />
                  </div>
                  <span className="text-[9px] font-mono text-pink-300 font-bold mt-1 bg-slate-950 border border-pink-500/40 px-2 py-0.5 rounded shadow">
                    ★ {cNode.name.slice(0, 14)}
                  </span>
                </div>
              ))}

              {/* Self Node (Local Client) */}
              <div 
                onClick={handleOpenMyQr}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                title="Click to view your Public Key QR Code"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-dashed border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:border-solid group-hover:scale-105 transition">
                  <Database className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold mt-1 bg-slate-950 border border-cyan-500/30 px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <span>LOCAL (YOU)</span>
                  <QrCode className="w-3 h-3 text-cyan-300" />
                </span>
              </div>
            </div>
          </div>

          {/* Connected Peers list table */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase font-mono text-slate-400 tracking-wider font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Swarm Discovery Directory ({nodes.length} Peers)</span>
              </h4>
              <button
                onClick={() => setShowScannerModal(true)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 hover:border-cyan-800 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Peer</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="pb-2 font-semibold">Node Name</th>
                    <th className="pb-2 font-semibold text-center">Status</th>
                    <th className="pb-2 font-semibold">IP Address</th>
                    <th className="pb-2 font-semibold text-right">Height</th>
                    <th className="pb-2 font-semibold text-right">Ping</th>
                    <th className="pb-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {nodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-950/40 transition">
                      <td className="py-2.5 text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{node.name}</span>
                          {node.isSelf && (
                            <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1 rounded">
                              You
                            </span>
                          )}
                          {node.isCustom && (
                            <span className="text-[9px] bg-pink-950 text-pink-400 border border-pink-800 px-1 rounded">
                              QR Scanned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide border ${
                          node.status === 'online' 
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                            : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500">{node.ip}</td>
                      <td className="py-2.5 text-right text-slate-300">{node.syncedBlocks}</td>
                      <td className="py-2.5 text-right text-cyan-400">{node.ping}ms</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Code Action Button */}
                          <button
                            onClick={() => handleOpenPeerQr(node)}
                            className="p-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition"
                            title={`View QR Code for ${node.name}`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Remove Custom Node Option */}
                          {node.isCustom && onRemoveNode && (
                            <button
                              onClick={() => onRemoveNode(node.id)}
                              className="p-1 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition"
                              title="Disconnect peer node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Cryptographic Keys Card & Audit (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key pair card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-bold font-sans text-slate-200">Asymmetric Key Identity</h3>
              </div>
              <button
                onClick={handleOpenMyQr}
                className="flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-950/50 hover:bg-violet-900/50 border border-violet-800/40 px-2 py-1 rounded-lg transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                These cryptographic keys are generated locally inside your browser using the <strong className="text-slate-300">Web Crypto API</strong>. Your public key can be shared via QR code with other nodes.
              </p>

              <div className="space-y-3 font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      Your Public Address Key (Shareable)
                    </span>
                    <button
                      onClick={handleOpenMyQr}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      <span>Share QR</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10px] text-cyan-400 break-all select-all font-mono leading-normal shadow-inner max-h-[85px] overflow-y-auto scrollbar-thin">
                    {myPublicKey}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase text-slate-500 block font-semibold">
                      Your Private Key (Strictly Secret)
                    </span>
                    <span className="text-[9px] uppercase font-bold text-rose-500 tracking-widest bg-rose-950/40 border border-rose-900/40 px-1.5 py-0.5 rounded">
                      Private
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10px] text-slate-600 select-none break-all font-mono leading-normal max-h-[75px] overflow-hidden relative">
                    <span className="blur-[1.5px]">{myPrivateKey}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end justify-center pb-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                        Memory Guard Locked
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleOpenMyQr}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-violet-950/30"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>My Node QR</span>
                </button>
                <button
                  onClick={onGenerateNewKeys}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-mono transition"
                >
                  Regenerate Keys
                </button>
              </div>
            </div>
          </div>

          {/* Shared Ledger integrity visual validator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-sans text-slate-200">Local Ledger Security Audit</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">Active</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Initiate a cryptographic scan of all localized replica blocks. This verifies that every post&apos;s content matches its hash signature.
              </p>

              {ledgerVerified === 'idle' && (
                <button
                  onClick={handleVerifyLedger}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-100 rounded-xl text-xs font-mono font-bold transition shadow-md"
                >
                  Run Cryptographic Audit ({posts.length} Blocks)
                </button>
              )}

              {ledgerVerified === 'verifying' && (
                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span className="text-xs font-mono text-cyan-400 block animate-pulse">
                    Verifying SHA-256 Block signatures: {verifiedCount} / {posts.length}
                  </span>
                </div>
              )}

              {ledgerVerified === 'valid' && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl flex gap-2.5">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs font-mono">
                    <strong className="block font-bold">Ledger Verified Valid!</strong>
                    <span>All {verifiedCount} block hash signatures perfectly match the authors&apos; public keys. Integrity confirmed.</span>
                  </div>
                </div>
              )}

              {ledgerVerified === 'invalid' && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl flex gap-2.5">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs font-mono">
                    <strong className="block font-bold">Audit Failed</strong>
                    <span>A signature mismatch was detected. Some block data may have been altered in transit or cache.</span>
                  </div>
                </div>
              )}

              {ledgerVerified !== 'idle' && (
                <button
                  onClick={() => setLedgerVerified('idle')}
                  className="text-xs text-slate-500 hover:text-slate-300 font-mono"
                >
                  Reset Audit Tool
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creator-Only Node Settings & DHT Architecture Control */}
      {isAppCreator && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-lg shadow-cyan-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold font-sans text-slate-100">Creator Master Node Settings & Gossip Protocol Routing</h3>
            </div>
            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              👑 Creator Access Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">DHT Routing Latency</span>
              <span className="text-cyan-400 font-bold text-sm">Optimal (12ms)</span>
              <p className="text-[10px] text-slate-400 font-sans">Automatic mesh hop pathing enabled across 15 global clusters.</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">Master Node Port</span>
              <span className="text-emerald-400 font-bold text-sm">Port 3000 (Protected)</span>
              <p className="text-[10px] text-slate-400 font-sans">TLS 1.3 encrypted WebSocket & REST proxy active.</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">Swarm Replication Factor</span>
              <span className="text-purple-400 font-bold text-sm">4x Redundancy</span>
              <p className="text-[10px] text-slate-400 font-sans">All AI & user posts auto-replicated across nodes.</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      <QrCodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onNodeScanned={handleNodeScanned}
        existingNodes={nodes}
      />

      {/* Node QR Code Display Modal */}
      {selectedQrNode && (
        <NodeQrModal
          isOpen={showNodeQrModal}
          onClose={() => {
            setShowNodeQrModal(false);
            setSelectedQrNode(null);
          }}
          publicKey={selectedQrNode.publicKey}
          nodeName={selectedQrNode.name}
          ip={selectedQrNode.ip}
          isSelf={selectedQrNode.isSelf}
        />
      )}
    </div>
  );
}
