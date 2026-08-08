import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Award, 
  History, 
  BookOpen, 
  Vote, 
  X, 
  Sparkles, 
  Lock,
  Eye,
  FileText
} from 'lucide-react';
import { FeedPost, ModerationCouncilMember, ModerationDecisionLog } from '../types';

interface ModerationCouncilModalProps {
  isOpen: boolean;
  onClose: () => void;
  flaggedPosts: FeedPost[];
  onVoteOnPost: (postId: string, voteType: 'approve' | 'remove' | 'warning') => void;
  currentUserName: string;
}

const INITIAL_MEMBERS: ModerationCouncilMember[] = [
  {
    id: 'juror_1',
    username: 'Councilor_Athena',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    role: 'Elected Council Lead',
    reputationScore: 994,
    decisionsCount: 142,
    joinedAt: Date.now() - 86400000 * 90,
    isActive: true
  },
  {
    id: 'juror_2',
    username: 'Sovereign_Marcus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    role: 'Community Moderator',
    reputationScore: 870,
    decisionsCount: 98,
    joinedAt: Date.now() - 86400000 * 60,
    isActive: true
  },
  {
    id: 'juror_3',
    username: 'Peer_Valkyrie_09',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    role: 'Sovereign Juror',
    reputationScore: 780,
    decisionsCount: 54,
    joinedAt: Date.now() - 86400000 * 30,
    isActive: true
  }
];

const INITIAL_LOGS: ModerationDecisionLog[] = [
  {
    id: 'dec_101',
    postId: 'p_881',
    postTitle: 'Suspicious Airdrop Bot Link',
    postAuthorName: 'CryptoBot_99',
    category: 'Spam',
    votedApprove: 0,
    votedRemove: 5,
    votedWarning: 0,
    finalVerdict: 'Removed by Community Council',
    timestamp: Date.now() - 3600000 * 4,
    councilSignature: 'sig_council_0x892a'
  },
  {
    id: 'dec_102',
    postId: 'p_712',
    postTitle: 'Unverified Satellite Launch Claim',
    postAuthorName: 'AeroEnthusiast',
    category: 'Misinformation',
    votedApprove: 1,
    votedRemove: 1,
    votedWarning: 4,
    finalVerdict: 'Content Warning Added',
    timestamp: Date.now() - 3600000 * 12,
    councilSignature: 'sig_council_0x441f'
  }
];

const COMMUNITY_GUIDELINES = [
  {
    title: '1. Civil & Constructive Dialogue',
    desc: 'Promote healthy discussion, respectful debate, and collaborative peer creation. Harassment or slurs will be voted down by the jury.'
  },
  {
    title: '2. Zero Tolerance for Malicious Links / Spam',
    desc: 'Unverified phishing sites, automated crypto scams, or repetitive bot posts will be immediately removed by council vote.'
  },
  {
    title: '3. Transparent Content Warnings',
    desc: 'Sensitive media, unverified rumors, or intense flashing visuals must carry clear content warning tags.'
  },
  {
    title: '4. Respect Sovereign Anonymity',
    desc: 'Posts made with Zero-Knowledge anonymous badges are protected. Attempting to dox anonymous creators is strictly prohibited.'
  }
];

export default function ModerationCouncilModal({
  isOpen,
  onClose,
  flaggedPosts,
  onVoteOnPost,
  currentUserName
}: ModerationCouncilModalProps) {
  const [activeTab, setActiveTab] = useState<'queue' | 'members' | 'logs' | 'guidelines'>('queue');
  const [councilMembers, setCouncilMembers] = useState<ModerationCouncilMember[]>(INITIAL_MEMBERS);
  const [decisionLogs] = useState<ModerationDecisionLog[]>(INITIAL_LOGS);
  const [isJuror, setIsJuror] = useState<boolean>(true);
  const [votedPostIds, setVotedPostIds] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleVote = (postId: string, voteType: 'approve' | 'remove' | 'warning') => {
    onVoteOnPost(postId, voteType);
    setVotedPostIds(prev => ({ ...prev, [postId]: voteType }));
  };

  const handleApplyJury = () => {
    if (councilMembers.some(m => m.username === currentUserName)) {
      alert("You are already an active member of the Sovereign Moderation Jury!");
      return;
    }

    const newJuror: ModerationCouncilMember = {
      id: `juror_${Date.now()}`,
      username: currentUserName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      role: 'Sovereign Juror',
      reputationScore: 500,
      decisionsCount: 0,
      joinedAt: Date.now(),
      isActive: true
    };

    setCouncilMembers(prev => [...prev, newJuror]);
    setIsJuror(true);
    alert("🎉 Application Approved! You are now a verified Sovereign Juror for Decentralized Content Moderation.");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#070B18] border border-amber-500/40 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide uppercase">
                  Decentralized Moderation Council
                </h2>
                <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  DAO Jury System
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Elected community jurors review flagged posts based on guidelines with transparent voting.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-850 overflow-x-auto font-mono text-xs text-slate-400">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'queue' ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Review Queue</span>
            <span className="ml-1 text-[10px] bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
              {flaggedPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'members' ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Council Jury</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'logs' ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Decision Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap font-bold ${
              activeTab === 'guidelines' ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Community Guidelines</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: REVIEW QUEUE */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono text-slate-300 font-bold">
                    Juror Status: {isJuror ? 'Active Sovereign Juror' : 'Guest Viewer'}
                  </span>
                </div>
                {!isJuror && (
                  <button
                    onClick={handleApplyJury}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-mono font-bold rounded-lg shadow"
                  >
                    Join Jury
                  </button>
                )}
              </div>

              {flaggedPosts.length > 0 ? (
                flaggedPosts.map((post) => {
                  const hasVoted = votedPostIds[post.id];
                  const votes = post.moderationVotes || { approve: 0, remove: 0, warning: 0 };

                  return (
                    <div 
                      key={post.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg hover:border-amber-500/30 transition"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={post.authorAvatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'} 
                            alt={post.authorName} 
                            className="w-7 h-7 rounded-full border border-slate-700"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-200 font-sans">
                              {post.authorName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Flagged: {post.flaggedReason || 'Community Guideline Check'}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded font-bold uppercase">
                          Pending Council Vote
                        </span>
                      </div>

                      {/* Post Content Preview */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans space-y-2">
                        {post.title && <div className="font-bold text-amber-300">{post.title}</div>}
                        <p>{post.content}</p>
                        {post.mediaUrl && (
                          <div className="text-[10px] font-mono text-cyan-400">
                            📎 Attached Media: {post.mediaUrl.slice(0, 45)}...
                          </div>
                        )}
                      </div>

                      {/* Voting Stats & Action Buttons */}
                      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                          <span className="text-emerald-400 font-bold">🟢 Approve: {votes.approve}</span>
                          <span className="text-rose-400 font-bold">🔴 Remove: {votes.remove}</span>
                          <span className="text-amber-400 font-bold">🟡 Warning: {votes.warning}</span>
                        </div>

                        {hasVoted ? (
                          <div className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-xl text-center">
                            ✓ Vote Recorded ({hasVoted.toUpperCase()})
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(post.id, 'approve')}
                              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 shadow"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => handleVote(post.id, 'warning')}
                              className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-500/50 text-amber-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 shadow"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>Warning</span>
                            </button>

                            <button
                              onClick={() => handleVote(post.id, 'remove')}
                              className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 shadow"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-mono font-bold text-slate-200">
                    Review Queue Clear
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans max-w-sm mx-auto">
                    There are no flagged posts awaiting council votes at this time. All community broadcasts are compliant.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COUNCIL MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Active Council Jurors ({councilMembers.length})</span>
                </h3>
                <button
                  onClick={handleApplyJury}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold rounded-lg transition"
                >
                  + Apply to Join Jury
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {councilMembers.map((member) => (
                  <div key={member.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                    <img 
                      src={member.avatar} 
                      alt={member.username} 
                      className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-slate-100 truncate">{member.username}</span>
                        <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/40 font-mono">
                          ★ {member.reputationScore}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-400 font-mono">{member.role}</p>
                      <p className="text-[10px] text-slate-500 font-sans">{member.decisionsCount} Rulings Participated</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DECISION LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Transparent Council Ruling Ledger</span>
              </h3>

              <div className="space-y-2">
                {decisionLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 font-mono">{log.postTitle || 'Flagged Broadcast'}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-400 rounded">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Author: {log.postAuthorName} • Verified via {log.councilSignature}
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border whitespace-nowrap ${
                      log.finalVerdict.includes('Removed') 
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                    }`}>
                      {log.finalVerdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Community Content Guidelines</span>
              </h3>

              <div className="space-y-2">
                {COMMUNITY_GUIDELINES.map((guide, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <h4 className="text-xs font-mono font-bold text-amber-300">{guide.title}</h4>
                    <p className="text-xs text-slate-300 font-sans">{guide.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Decentralized Council Governance • Zero Central Censorship</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg transition"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}
