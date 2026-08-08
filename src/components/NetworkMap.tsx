/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Key, 
  CheckCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Database,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { NetworkNode, FeedPost } from '../types';
import { verifySignature } from '../utils/crypto';

interface NetworkMapProps {
  nodes: NetworkNode[];
  posts: FeedPost[];
  myPublicKey: string;
  myPrivateKey: string;
  onRefreshNodes: () => void;
  onGenerateNewKeys: () => void;
  isAppCreator?: boolean;
}

export default function NetworkMap({
  nodes,
  posts,
  myPublicKey,
  myPrivateKey,
  onRefreshNodes,
  onGenerateNewKeys,
  isAppCreator = false
}: NetworkMapProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ledgerVerified, setLedgerVerified] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [verifiedCount, setVerifiedCount] = useState(0);

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

  return (
    <div className="space-y-6" id="network-map-container">
      {/* Network Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <Network className="text-cyan-400 w-5 h-5" />
            Distributed Swarm & Key Network
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time peer discovery map • Local asymmetric cryptographic key pairs
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Rediscover Peers
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: The Swarm Topology Node Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold font-sans text-slate-200 mb-4 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Direct Node Connections (DHT)
            </h3>

            {/* Simulated SVG Graph of Nodes */}
            <div className="aspect-video bg-slate-950 border border-slate-800/80 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#151D30_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Dynamic SVG Connection Mesh */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Connection lines */}
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#10b981" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20%" y1="25%" x2="80%" y2="25%" stroke="#334155" strokeWidth="1" />
                <line x1="80%" y1="25%" x2="75%" y2="75%" stroke="#334155" strokeWidth="1" />
                <line x1="75%" y1="75%" x2="25%" y2="75%" stroke="#334155" strokeWidth="1" />
                <line x1="25%" y1="75%" x2="20%" y2="25%" stroke="#334155" strokeWidth="1" />
              </svg>

              {/* Node Bubbles with tooltips */}
              <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group">
                <div className="w-8 h-8 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center animate-bounce shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Europe-Relay</span>
              </div>

              <div className="absolute top-[25%] right-[20%] translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-violet-950 border-2 border-violet-500 flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                  <Server className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Pacific-Validator</span>
              </div>

              <div className="absolute bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">US-West-Hedge</span>
              </div>

              <div className="absolute bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse">
                  <Server className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">South-Asia-Mesh</span>
              </div>

              {/* Self Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-dashed border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Database className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold mt-1 bg-slate-950 border border-cyan-500/30 px-2 py-0.5 rounded shadow">LOCAL CLIENT (YOU)</span>
              </div>
            </div>
          </div>

          {/* Connected Peers list table */}
          <div className="space-y-2 mt-6">
            <h4 className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Swarm Discovery Directory</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <th className="pb-1.5 font-semibold">Node Name</th>
                    <th className="pb-1.5 font-semibold text-center">Status</th>
                    <th className="pb-1.5 font-semibold">IP Address</th>
                    <th className="pb-1.5 font-semibold text-right">Block Height</th>
                    <th className="pb-1.5 font-semibold text-right">Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {nodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-950/20">
                      <td className="py-2 text-slate-300 font-medium">{node.name} {node.isSelf && '(You)'}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide border ${
                          node.status === 'online' 
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                            : 'bg-amber-950/40 border-amber-800/40 text-amber-400'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500">{node.ip}</td>
                      <td className="py-2 text-right text-slate-300">{node.syncedBlocks}</td>
                      <td className="py-2 text-right text-cyan-400">{node.ping}ms</td>
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Key className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold font-sans text-slate-200">Asymmetric Key Identity</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                These cryptographic keys are generated locally inside your browser using the <strong className="text-slate-300">Web Crypto API</strong>. The private key remains in local browser memory and is never broadcast over the network.
              </p>

              <div className="space-y-3 font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block mb-1">Your Public Address Key (Shareable)</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[10px] text-cyan-400 break-all select-all font-mono leading-normal shadow-inner max-h-[90px] overflow-y-auto scrollbar-thin">
                    {myPublicKey}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase text-slate-500 block">Your Private Key (Strictly Secret)</span>
                    <span className="text-[9px] uppercase font-bold text-rose-500 tracking-widest bg-rose-950/40 border border-rose-900/40 px-1 rounded">Private</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-600 select-none break-all font-mono leading-normal max-h-[80px] overflow-hidden relative">
                    {/* Blur visual simulation */}
                    <span className="blur-[1.5px]">{myPrivateKey}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end justify-center pb-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Memory Guard Locked
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onGenerateNewKeys}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-mono transition"
                >
                  Regenerate Identity Keys
                </button>
              </div>
            </div>
          </div>

          {/* Shared Ledger integrity visual validator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-sans text-slate-200">Local Ledger Security Audit</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">Active</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Initiate a cryptographic scan of all localized replica blocks. This verifies that every post's content matches its hash signature.
              </p>

              {ledgerVerified === 'idle' && (
                <button
                  onClick={handleVerifyLedger}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-100 rounded-lg text-xs font-mono transition shadow-md"
                >
                  Run Cryptographic Audit ({posts.length} Blocks)
                </button>
              )}

              {ledgerVerified === 'verifying' && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center space-y-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span className="text-xs font-mono text-cyan-400 block animate-pulse">
                    Verifying SHA-256 Block signatures: {verifiedCount} / {posts.length}
                  </span>
                </div>
              )}

              {ledgerVerified === 'valid' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-lg flex gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs font-mono">
                    <strong className="block font-bold">Ledger Verified Valid!</strong>
                    <span>All {verifiedCount} block hash signatures perfectly match the authors' public keys. Integrity confirmed.</span>
                  </div>
                </div>
              )}

              {ledgerVerified === 'invalid' && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-lg flex gap-2">
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
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 shadow-lg shadow-cyan-950/20 space-y-4">
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
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">DHT Routing Latency</span>
              <span className="text-cyan-400 font-bold text-sm">Optimal (12ms)</span>
              <p className="text-[10px] text-slate-400 font-sans">Automatic mesh hop pathing enabled across 15 global clusters.</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">Master Node Port</span>
              <span className="text-emerald-400 font-bold text-sm">Port 3000 (Protected)</span>
              <p className="text-[10px] text-slate-400 font-sans">TLS 1.3 encrypted WebSocket & REST proxy active.</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase text-slate-500 block">Swarm Replication Factor</span>
              <span className="text-purple-400 font-bold text-sm">4x Redundancy</span>
              <p className="text-[10px] text-slate-400 font-sans">All AI & user posts auto-replicated across nodes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
