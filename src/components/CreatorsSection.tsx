import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Search, 
  UserCheck, 
  UserPlus, 
  MessageSquare, 
  PhoneCall, 
  Video, 
  ShieldCheck, 
  Play, 
  Film, 
  Rss, 
  Heart, 
  Share2, 
  Award, 
  Eye, 
  ExternalLink,
  Lock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { CreatorProfile, CreatorCategory, FeedPost } from '../types';

interface CreatorsSectionProps {
  currentUsername: string;
  currentUserAvatar: string;
  posts: FeedPost[];
  onStartCall: (creator: CreatorProfile, callType: 'voice' | 'video') => void;
  onSendMessage: (creatorUsername: string) => void;
  theme?: 'dark' | 'light';
}

const SAMPLE_CREATORS: CreatorProfile[] = [
  {
    id: 'creator_1',
    displayName: 'David Johnson',
    username: 'davidjohnson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Pioneering multimodal AI cinema, neural cinematography, and real-time sovereign streaming. Director of "Neo-Genesis 2088".',
    category: 'AI Filmmaking',
    isVerified: true,
    isOnline: true,
    followersCount: 14200,
    followingCount: 238,
    postsCount: 84,
    videosCount: 32,
    totalViews: 489200,
    totalLikes: 78200,
    joinedDate: 'Joined March 2025',
    location: 'San Francisco, CA',
    tags: ['AI Cinema', 'Veo Video', 'Cyberpunk', 'Sound Design'],
    privacySettings: {
      whoCanMessage: 'everyone',
      whoCanCall: 'everyone',
      whoCanVideoCall: 'everyone',
      showOnlineStatus: true
    }
  },
  {
    id: 'creator_2',
    displayName: 'Elena Vance',
    username: 'elenavance',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    bio: 'Generative artist creating high-resolution abstract architectures, cyberpunk landscapes, and interactive shaders.',
    category: 'Digital Art',
    isVerified: true,
    isOnline: true,
    followersCount: 28900,
    followingCount: 194,
    postsCount: 142,
    videosCount: 18,
    totalViews: 920400,
    totalLikes: 145000,
    joinedDate: 'Joined January 2025',
    location: 'Berlin, Germany',
    tags: ['Generative Art', '4K HDR', 'Synthesizer', '3D Design'],
    privacySettings: {
      whoCanMessage: 'everyone',
      whoCanCall: 'everyone',
      whoCanVideoCall: 'everyone',
      showOnlineStatus: true
    }
  },
  {
    id: 'creator_3',
    displayName: 'Marcus Chen',
    username: 'marcuschen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    bio: 'Web3 systems architect, peer-to-peer communication researcher, and sovereign protocol advocate.',
    category: 'Tech & Web3',
    isVerified: true,
    isOnline: false,
    followersCount: 18400,
    followingCount: 412,
    postsCount: 65,
    videosCount: 14,
    totalViews: 310500,
    totalLikes: 42100,
    joinedDate: 'Joined April 2025',
    location: 'Singapore',
    tags: ['P2P Mesh', 'WebRTC', 'Decentralized', 'Cryptography'],
    privacySettings: {
      whoCanMessage: 'everyone',
      whoCanCall: 'friends',
      whoCanVideoCall: 'friends',
      showOnlineStatus: true
    }
  },
  {
    id: 'creator_4',
    displayName: 'Aria Sterling',
    username: 'ariasterling',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    bio: 'Electronic music producer and neural audio designer. Creating ambient cyberpunk synthwave for deep focus and virtual worlds.',
    category: 'Music & Sound',
    isVerified: true,
    isOnline: true,
    followersCount: 35100,
    followingCount: 310,
    postsCount: 110,
    videosCount: 45,
    totalViews: 1200400,
    totalLikes: 210900,
    joinedDate: 'Joined February 2025',
    location: 'London, UK',
    tags: ['Synthwave', 'Neural Audio', 'Spatial Sound', 'Studio Master'],
    privacySettings: {
      whoCanMessage: 'everyone',
      whoCanCall: 'everyone',
      whoCanVideoCall: 'everyone',
      showOnlineStatus: true
    }
  }
];

const CATEGORIES: ('All' | CreatorCategory)[] = [
  'All',
  'AI Filmmaking',
  'Digital Art',
  'Music & Sound',
  'Tech & Web3',
  'Writing & Lore',
  'Cyberpunk Visuals',
  'Podcasts & Radio'
];

export const CreatorsSection: React.FC<CreatorsSectionProps> = ({
  currentUsername,
  currentUserAvatar,
  posts,
  onStartCall,
  onSendMessage,
  theme = 'dark'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CreatorCategory>('All');
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'videos' | 'about'>('posts');
  
  // Follow State Management
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('aura_followed_creators');
    return saved ? new Set(JSON.parse(saved)) : new Set(['creator_1']);
  });

  const toggleFollow = (creatorId: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      localStorage.setItem('aura_followed_creators', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const filteredCreators = SAMPLE_CREATORS.filter((creator) => {
    const matchesSearch = 
      creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter posts belonging to selected creator
  const creatorPosts = selectedCreator 
    ? posts.filter(p => p.authorName.toLowerCase() === selectedCreator.displayName.toLowerCase() || p.authorName.toLowerCase().includes(selectedCreator.username.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* If Viewing Specific Creator Profile */}
      {selectedCreator ? (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCreator(null)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Creators Discovery</span>
          </button>

          {/* Profile Banner & Header Card */}
          <div className="bg-[#0F1526] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Banner Image */}
            <div className="h-48 sm:h-64 w-full relative overflow-hidden bg-slate-950">
              <img 
                src={selectedCreator.bannerUrl} 
                alt={selectedCreator.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1526] via-[#0F1526]/40 to-transparent" />
            </div>

            {/* Profile Info Row */}
            <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <img 
                      src={selectedCreator.avatar} 
                      alt={selectedCreator.displayName}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#0F1526] shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <span 
                      className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#0F1526] ${
                        selectedCreator.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                      }`} 
                      title={selectedCreator.isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white font-sans">
                        {selectedCreator.displayName}
                      </h2>
                      {selectedCreator.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-mono text-cyan-400 font-semibold">
                      @{selectedCreator.username}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-[10px] font-mono font-bold">
                        {selectedCreator.category}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">
                        {selectedCreator.isOnline ? '🟢 Online' : '⚪ Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar: Follow, Message, Voice Call, Video Call */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleFollow(selectedCreator.id)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-mono font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                      followedIds.has(selectedCreator.id)
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30'
                    }`}
                  >
                    {followedIds.has(selectedCreator.id) ? (
                      <>
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-purple-200" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSendMessage(selectedCreator.username)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-cyan-400 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                    title={`Message @${selectedCreator.username}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>

                  <button
                    onClick={() => onStartCall(selectedCreator, 'voice')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-emerald-400 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                    title={`Voice Call @${selectedCreator.username}`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span className="hidden sm:inline">Voice Call</span>
                  </button>

                  <button
                    onClick={() => onStartCall(selectedCreator, 'video')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-amber-400 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                    title={`Video Call @${selectedCreator.username}`}
                  >
                    <Video className="w-4 h-4" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>
                </div>
              </div>

              {/* Bio & Metrics */}
              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
                {selectedCreator.bio}
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Followers</span>
                  <span className="text-base font-bold text-white font-mono">
                    {selectedCreator.followersCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Following</span>
                  <span className="text-base font-bold text-white font-mono">
                    {selectedCreator.followingCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Posts & Media</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {selectedCreator.postsCount + selectedCreator.videosCount}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Impact</span>
                  <span className="text-base font-bold text-purple-400 font-mono">
                    {((selectedCreator.totalViews || 0) / 1000).toFixed(1)}k views
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedCreator.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sub Navigation: Posts, Videos, About */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveProfileTab('posts')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                activeProfileTab === 'posts'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Rss className="w-4 h-4" />
              <span>Posts ({creatorPosts.length || selectedCreator.postsCount})</span>
            </button>

            <button
              onClick={() => setActiveProfileTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                activeProfileTab === 'videos'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Videos & Reels ({selectedCreator.videosCount})</span>
            </button>

            <button
              onClick={() => setActiveProfileTab('about')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                activeProfileTab === 'about'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>About & Credentials</span>
            </button>
          </div>

          {/* Content Views */}
          {activeProfileTab === 'posts' && (
            <div className="space-y-4">
              {creatorPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creatorPosts.map(post => (
                    <div key={post.id} className="p-4 bg-[#0F1526] border border-slate-800 rounded-2xl space-y-3">
                      <p className="text-xs text-slate-200 font-sans leading-relaxed">{post.content}</p>
                      {post.mediaUrl && (
                        <img src={post.mediaUrl} alt="" className="w-full h-48 object-cover rounded-xl border border-slate-800" />
                      )}
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-850">
                        <span className="flex items-center gap-1 text-pink-400">
                          <Heart className="w-3.5 h-3.5" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <MessageSquare className="w-3.5 h-3.5" /> {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
                  <Rss className="w-8 h-8 text-purple-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-200">Public Creator Feed Active</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                    @{selectedCreator.username} has published {selectedCreator.postsCount} multimedia posts to the decentralized Aura network.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group">
                  <div className="relative h-44 bg-slate-950">
                    <img 
                      src={`https://images.unsplash.com/photo-${idx === 1 ? '1618005182384-a83a8bd57fbe' : idx === 2 ? '1579783902614-a3fb3927b675' : '1550745165-9bc0b252726f'}?w=600&auto=format&fit=crop&q=80`}
                      alt="Creator Video"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 rounded text-[10px] font-mono text-white">
                      04:20
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate font-sans">
                      Neural Episode #{idx}: High-Res Synthesis
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(idx * 14.2).toFixed(1)}k views • 4K HDR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeProfileTab === 'about' && (
            <div className="bg-[#0F1526] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Creator Sovereign Identity
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                This creator account is registered on the Aura network with cryptographic identity verification.
                All shared multimedia posts, video broadcasts, and studio creations are signed with sovereign key pairs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Location:</span>
                  <span>{selectedCreator.location}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Member Since:</span>
                  <span>{selectedCreator.joinedDate}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Creators Discovery Grid & Category Filter View */
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 via-[#0F1526] to-cyan-950/60 border border-purple-500/20 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>CREATORS DISCOVERY NODE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Discover & Connect with <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Top Creators</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Explore filmmakers, digital artists, musicians, tech researchers, and writers. Follow their channels, message them directly, or launch real WebRTC voice and video calls.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by display name, @username, or specialty..."
                className="w-full bg-[#0F1526] border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/60 font-sans shadow-inner"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Creators Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCreators.map((creator) => {
              const isFollowed = followedIds.has(creator.id);

              return (
                <div 
                  key={creator.id}
                  className="bg-[#0F1526] border border-slate-800/80 hover:border-purple-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl transition duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      onClick={() => setSelectedCreator(creator)}
                      className="flex items-center gap-3.5 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={creator.avatar} 
                          alt={creator.displayName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/30 group-hover:border-purple-400 transition"
                          referrerPolicy="no-referrer"
                        />
                        <span 
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0F1526] ${
                            creator.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                          title={creator.isOnline ? 'Online' : 'Offline'}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white font-sans group-hover:text-purple-300 transition">
                            {creator.displayName}
                          </h3>
                          {creator.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-mono text-cyan-400 font-semibold">
                          @{creator.username}
                        </p>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-800/50 px-2 py-0.2 rounded-md mt-1 inline-block">
                          {creator.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(creator.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow ${
                        isFollowed 
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isFollowed ? <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isFollowed ? 'Following' : 'Follow'}</span>
                    </button>
                  </div>

                  <p 
                    onClick={() => setSelectedCreator(creator)}
                    className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed cursor-pointer"
                  >
                    {creator.bio}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span><strong className="text-white">{creator.followersCount.toLocaleString()}</strong> fans</span>
                      <span><strong className="text-cyan-400">{creator.videosCount}</strong> videos</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSendMessage(creator.username)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
                        title={`Message @${creator.username}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(creator, 'voice')}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 transition"
                        title={`Voice Call @${creator.username}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall(creator, 'video')}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 transition"
                        title={`Video Call @${creator.username}`}
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
export default CreatorsSection;
