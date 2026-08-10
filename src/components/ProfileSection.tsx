import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ShieldCheck, 
  Edit, 
  Rss, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Award, 
  Calendar, 
  Copy, 
  Check, 
  Settings,
  Share2
} from 'lucide-react';
import { FeedPost } from '../types';

interface ProfileSectionProps {
  username: string;
  avatar: string;
  userStatus?: string;
  myPublicKey: string;
  userEmail?: string;
  posts: FeedPost[];
  onOpenSettings: () => void;
  onNavigateTab: (tab: string) => void;
  theme?: 'dark' | 'light';
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  username,
  avatar,
  userStatus = 'Active Node',
  myPublicKey,
  userEmail = '',
  posts,
  onOpenSettings,
  onNavigateTab,
  theme = 'dark',
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const userPosts = posts.filter((p) => p.authorName === username || p.authorPublicKey === myPublicKey);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(myPublicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Profile Banner Card */}
      <div className="rounded-3xl bg-[#0F1526] border border-slate-800/80 overflow-hidden shadow-2xl relative">
        {/* Top Decorative Graphic Header */}
        <div className="h-32 bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-cyan-900/60 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Verifiable Cryptographic DID
            </span>
          </div>
        </div>

        {/* User Profile Avatar & Header Details */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="relative">
              <img
                src={avatar}
                alt={username}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-[#0F1526] shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full" title={userStatus} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSettings}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shadow-lg shadow-purple-950/30 transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-extrabold text-white font-sans flex items-center gap-2">
                <span>{username}</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full font-normal">
                  {userStatus}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {userEmail ? `Verified Account: ${userEmail}` : `@${username.toLowerCase().replace(/\s+/g, '_')}`}
              </p>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850 max-w-2xl">
              Sovereign member of the Aura Social & AI mesh network. Publishing encrypted posts, participating in P2P chats, and running Gemini AI sessions.
            </p>

            {/* DID Key Bar */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden">
                <Key className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-slate-400 text-[11px] truncate">
                  Key: <strong className="text-slate-200 select-all">{myPublicKey}</strong>
                </span>
              </div>

              <button
                onClick={handleCopyKey}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition shrink-0"
                title="Copy Public Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center">
                <span className="text-lg font-bold text-white font-mono">{userPosts.length}</span>
                <span className="text-[10px] text-slate-400 font-mono block uppercase mt-0.5">Posts</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center">
                <span className="text-lg font-bold text-cyan-400 font-mono">100%</span>
                <span className="text-[10px] text-slate-400 font-mono block uppercase mt-0.5">Trust Score</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center">
                <span className="text-lg font-bold text-emerald-400 font-mono">Active</span>
                <span className="text-[10px] text-slate-400 font-mono block uppercase mt-0.5">AI Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Published Posts */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <Rss className="w-4 h-4 text-purple-400" />
          My Published Posts ({userPosts.length})
        </h3>

        {userPosts.length === 0 ? (
          <div className="rounded-2xl bg-[#0F1526] border border-slate-800 p-8 text-center space-y-3">
            <Rss className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-sans">You haven't created any posts yet.</p>
            <button
              onClick={() => onNavigateTab('feed')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-[#0F1526] border border-slate-800/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300">
                    {post.type}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
