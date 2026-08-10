import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  MessageSquare, 
  PhoneCall, 
  Users, 
  Rss, 
  Video, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Flame,
  ChevronRight,
  Zap
} from 'lucide-react';
import { FeedPost } from '../types';
import { AdsterraAd } from './AdsterraAd';

interface HomeScreenProps {
  username: string;
  avatar: string;
  posts: FeedPost[];
  onNavigateTab: (tab: string) => void;
  onAddPost: (post: FeedPost) => void;
  theme?: 'dark' | 'light';
  isPremium?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  username,
  avatar,
  posts,
  onNavigateTab,
  onAddPost,
  theme = 'dark',
  isPremium = false,
}) => {
  const [quickPostText, setQuickPostText] = useState('');
  const isLight = theme === 'light';

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim()) return;
    const newPost: FeedPost = {
      id: `post_home_${Date.now()}`,
      authorName: username,
      authorPublicKey: 'user_pubkey_local',
      authorAvatar: avatar,
      type: 'micro',
      timestamp: Date.now(),
      content: quickPostText.trim(),
      signature: 'sig_local_home',
      likes: 0,
      commentsCount: 0,
      comments: [],
    };
    onAddPost(newPost);
    setQuickPostText('');
  };

  const recentPosts = posts.slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Welcome & Brand Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-cyan-900/40 border border-purple-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>AURA DECENTRALIZED PLATFORM</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sans">
              Welcome to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Aura</span>, {username}!
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your next-generation hub combining instant messaging, voice & video calls, AI assistants, and social feeds into one seamless ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('omnimind')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-purple-900/40 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-purple-200" />
              <span>Ask Aura AI</span>
            </button>
            <button
              onClick={() => onNavigateTab('feed')}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs font-mono transition flex items-center gap-2"
            >
              <Rss className="w-4 h-4 text-cyan-400" />
              <span>View Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Quick Access Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Quick Access Modules
          </h3>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-full">
            All Features Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: AI Assistant */}
          <div
            onClick={() => onNavigateTab('omnimind')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-purple-300'
                : 'bg-[#0F1526] border-purple-500/20 hover:border-purple-500/50 shadow-purple-950/20'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition" />
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded-full">
                AI Powered
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-purple-300 transition">
              AI ASSISTANT
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Chat with Aura AI, generate creative content, and summarize research.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-purple-400 group-hover:translate-x-1 transition">
              <span>Launch Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Messages */}
          <div
            onClick={() => onNavigateTab('messages')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-cyan-300'
                : 'bg-[#0F1526] border-cyan-500/20 hover:border-cyan-500/50 shadow-cyan-950/20'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full group-hover:bg-cyan-500/10 transition" />
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
                E2E Encrypted
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition">
              MESSAGES
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Chat with your friends in private E2E encrypted rooms or group channels.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition">
              <span>Open Chat Rooms</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Calls */}
          <div
            onClick={() => onNavigateTab('calls')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-emerald-300'
                : 'bg-[#0F1526] border-emerald-500/20 hover:border-emerald-500/50 shadow-emerald-950/20'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition" />
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                HD Voice & Video
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-emerald-300 transition">
              VOICE & VIDEO CALLS
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Start instant voice calls or video chats with friends and team peers.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Start Call</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Friends */}
          <div
            onClick={() => onNavigateTab('friends')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-indigo-300'
                : 'bg-[#0F1526] border-indigo-500/20 hover:border-indigo-500/50 shadow-indigo-950/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full">
                Contacts Mesh
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-indigo-300 transition">
              FRIENDS & PEERS
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Find, add, and connect with friends across the decentralized network.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-indigo-400 group-hover:translate-x-1 transition">
              <span>View Contacts</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 5: Social Feed */}
          <div
            onClick={() => onNavigateTab('feed')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-pink-300'
                : 'bg-[#0F1526] border-pink-500/20 hover:border-pink-500/50 shadow-pink-950/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 group-hover:scale-110 transition">
                <Rss className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-pink-300 font-bold bg-pink-950/80 border border-pink-800 px-2 py-0.5 rounded-full">
                Social Feed
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-pink-300 transition">
              POSTS & SOCIAL FEED
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Read posts, comment, like, and share photos & thoughts with the network.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-pink-400 group-hover:translate-x-1 transition">
              <span>Explore Feed</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 6: Video Hub */}
          <div
            onClick={() => onNavigateTab('videos')}
            className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative overflow-hidden ${
              isLight
                ? 'bg-white border-slate-200 hover:border-amber-300'
                : 'bg-[#0F1526] border-amber-500/20 hover:border-amber-500/50 shadow-amber-950/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
                Reels & Streams
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 font-sans group-hover:text-amber-300 transition">
              VIDEO MEDIA THEATER
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Watch trending short reels, community clips, and media broadcasts.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1 transition">
              <span>Open Video Hub</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Post Creator Widget on Home */}
      <div className="rounded-2xl bg-[#0F1526] border border-slate-800 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={username} className="w-10 h-10 rounded-xl object-cover border border-purple-500/30" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 font-sans">Share something with Aura Swarm</h4>
            <p className="text-[10px] text-slate-400 font-mono">Publish a instant micro-post to the feed</p>
          </div>
        </div>

        <form onSubmit={handleQuickPostSubmit} className="space-y-3">
          <textarea
            value={quickPostText}
            onChange={(e) => setQuickPostText(e.target.value)}
            placeholder="What's on your mind today?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500/60 resize-none h-20 font-sans"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('feed')}
                className="text-[11px] font-mono text-slate-400 hover:text-purple-300 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Media Post</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={!quickPostText.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono font-bold text-xs transition"
            >
              Post to Aura
            </button>
          </div>
        </form>
      </div>

      {/* Recent Activity Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Recent Community Posts
          </h3>
          <button
            onClick={() => onNavigateTab('feed')}
            className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View All Posts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl bg-[#0F1526] border border-slate-800/80 p-4 space-y-3 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.authorAvatar || avatar}
                    alt={post.authorName}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-sans">{post.authorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300">
                  {post.type}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1 text-pink-400">
                  <Heart className="w-3.5 h-3.5" />
                  {post.likes} Likes
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.commentsCount || 0} Comments
                </span>
                <button
                  onClick={() => onNavigateTab('feed')}
                  className="text-purple-400 hover:text-purple-300 font-bold"
                >
                  Join Conversation →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reserved Small Advertisement Area (Visually Separated) */}
      {!isPremium && (
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block text-center">
            Sponsored Network Partner
          </span>
          <div className="max-w-xl mx-auto">
            <AdsterraAd theme={isLight ? 'light' : 'dark'} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
