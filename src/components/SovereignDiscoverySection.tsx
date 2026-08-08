import React, { useState, useEffect } from 'react';
import { GoogleAdSenseAd } from './GoogleAdSenseAd';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Compass, 
  Trash2, 
  Heart, 
  MessageSquare, 
  Share2, 
  Key, 
  CheckCircle2, 
  Volume2, 
  ShieldCheck, 
  Activity, 
  UserPlus, 
  UserCheck, 
  Video, 
  Users, 
  Sliders,
  Award,
  BookOpen,
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { FeedPost, Comment } from '../types';
import { 
  getLocalInteractionLedger, 
  compilePersonalizationProfile, 
  personalizeAndDiscoverContent, 
  discoverPeerConnections, 
  logOnDeviceInteraction,
  purgeDiscoveryIntelligence,
  UserPersonalizationProfile,
  PeerRecommendation
} from '../utils/discoveryEngine';

interface SovereignDiscoverySectionProps {
  posts: FeedPost[];
  onAddPost: (post: FeedPost) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, comment: Comment) => void;
  currentUserKey: string;
  currentPrivateKey: string;
  username: string;
  avatar: string;
  balance?: number;
  onUpdateBalance?: (newBalance: number) => void;
  isPremium?: boolean;
  theme?: 'dark' | 'light';
}

export default function SovereignDiscoverySection({
  posts,
  onLikePost,
  onAddComment,
  username,
  avatar,
  balance,
  onUpdateBalance,
  isPremium = false,
  theme = 'dark'
}: SovereignDiscoverySectionProps) {
  const [profile, setProfile] = useState<UserPersonalizationProfile | null>(null);
  const [recommendedPosts, setRecommendedPosts] = useState<{ post: FeedPost; score: number; matchReasons: string[] }[]>([]);
  const [peerRecs, setPeerRecs] = useState<PeerRecommendation[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'peers' | 'analytics'>('content');
  const [customMultipliers, setCustomMultipliers] = useState({
    micro: 1.0,
    media: 1.0,
    play: 1.0,
    node: 1.0
  });
  
  // Followed states inside this component, mirroring App's state
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_followed_users');
    return cached ? new Set(JSON.parse(cached)) : new Set(['Cypher Architect']);
  });

  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Load and refresh state
  const refreshEngine = () => {
    const compiledProf = compilePersonalizationProfile();
    setProfile(compiledProf);

    // Apply custom sliders multipliers to posts' type scores dynamically
    const baseRanked = personalizeAndDiscoverContent(posts);
    const customizedRanked = baseRanked.map(item => {
      const mult = customMultipliers[item.post.type as keyof typeof customMultipliers] || 1.0;
      return {
        ...item,
        score: parseFloat((item.score * mult).toFixed(1))
      };
    }).sort((a, b) => b.score - a.score);

    setRecommendedPosts(customizedRanked);
    setPeerRecs(discoverPeerConnections(posts, username));
  };

  useEffect(() => {
    refreshEngine();

    // Listen for global interaction events (likes/comments elsewhere in the app)
    const handleUpdate = () => {
      refreshEngine();
    };

    window.addEventListener('aura_discovery_update', handleUpdate);
    return () => {
      window.removeEventListener('aura_discovery_update', handleUpdate);
    };
  }, [posts, customMultipliers]);

  const triggerAlert = (msg: string) => {
    setSystemAlert(msg);
    setTimeout(() => setSystemAlert(null), 4000);
  };

  // Log local interaction and trigger state reload
  const handleItemInteract = (post: FeedPost, type: 'view' | 'like' | 'comment' | 'tip') => {
    logOnDeviceInteraction(post.id, post.authorName, post.type, post.content, type);
    refreshEngine();
  };

  const handleLike = (postId: string, post: FeedPost) => {
    onLikePost(postId);
    handleItemInteract(post, 'like');
    triggerAlert("Like registered locally. Personalized recommendation weights recalculated!");
  };

  const handleCommentSubmit = (postId: string, post: FeedPost) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    const dummyComment: Comment = {
      id: `comment_${Date.now()}`,
      authorName: username,
      content: text,
      timestamp: Date.now(),
      signature: 'local_discovery_mock_sig_' + Math.random().toString(36).substring(2, 7)
    };

    onAddComment(postId, dummyComment);
    handleItemInteract(post, 'comment');
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    triggerAlert("Decentralized comment signature saved locally. Weights updated.");
  };

  const handleTip = (post: FeedPost) => {
    const tipAmount = 15;
    if (balance !== undefined) {
      if (balance < tipAmount) {
        triggerAlert(`Insufficient tokens. Tipping requires ${tipAmount} LC.`);
        return;
      }
      if (onUpdateBalance) {
        onUpdateBalance(balance - tipAmount);
      }
    }
    handleItemInteract(post, 'tip');
    triggerAlert(`Dispatched ${tipAmount} LC tip directly to ${post.authorName}. Personalization boosted!`);
  };

  const handleFollowToggle = (authorName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(authorName)) {
        next.delete(authorName);
        triggerAlert(`Unfollowed ${authorName}`);
      } else {
        next.add(authorName);
        triggerAlert(`Following ${authorName} securely`);
      }
      localStorage.setItem('aura_followed_users', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleSendFriendRequest = (authorName: string) => {
    if (friendRequests.has(authorName)) {
      triggerAlert(`Friend request is already pending replication with ${authorName}.`);
      return;
    }
    setFriendRequests(prev => {
      const next = new Set(prev);
      next.add(authorName);
      return next;
    });
    triggerAlert(`Dispatched E2E Friend request to ${authorName}! Syncing peer index.`);
  };

  const handleWipeLedger = () => {
    if (confirm("Are you absolutely sure you want to clear your local intelligence ledger? All personalized weights, interaction histories, and matching indexes will be permanently purged.")) {
      purgeDiscoveryIntelligence();
      setCustomMultipliers({ micro: 1.0, media: 1.0, play: 1.0, node: 1.0 });
      triggerAlert("Privacy sanitization complete. Local intelligence ledger wiped to 0.");
    }
  };

  return (
    <div className="space-y-6" id="discovery-engine-container">
      {/* Interactive alert toast */}
      {systemAlert && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A0F1D] border border-cyan-500 text-cyan-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md max-w-sm">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
          <span>{systemAlert}</span>
        </div>
      )}

      {/* Discovery Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-violet-950/40 border border-cyan-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <h1 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
                Sovereign Discovery Protocol
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Real-time on-device recommendations powered by client-side collaborative matching and local content vectoring.
              <span className="text-cyan-400 block mt-1 font-mono">
                ✓ ZERO personal interaction logs are ever sent to centralized servers. Your intelligence stays on your chip.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWipeLedger}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-900/50 hover:bg-red-900/20 text-red-400 rounded-lg text-xs font-mono transition"
              title="Instantly sanitizes and resets your on-device profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Sanitize Ledger
            </button>
            <div className="px-3 py-1.5 bg-slate-950 border border-slate-900 rounded-lg text-xs font-mono text-slate-400">
              Local Interactions: <strong className="text-cyan-400">{profile?.totalInteractions || 0}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Sub-tabs */}
        <div className="flex gap-2 mt-6 border-t border-slate-900 pt-4">
          <button
            onClick={() => setActiveSubTab('content')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeSubTab === 'content' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated Stream
          </button>
          <button
            onClick={() => setActiveSubTab('peers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeSubTab === 'peers' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Suggested Peers
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeSubTab === 'analytics' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Privacy Radar Config
          </button>
        </div>
      </div>

      {/* SUBTAB CONTENT 1: CURATED FEED */}
      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                curated_mesh_replica
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Ranking dynamically updated on every tap
              </span>
            </div>

            {recommendedPosts.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-sans text-slate-400">No mesh posts found for curation.</p>
                <p className="text-xs font-mono text-slate-600 mt-1">Stand by for gossip ledger synchronization...</p>
              </div>
            ) : (
              recommendedPosts.map(({ post, score, matchReasons }, idx) => {
                const isFollowed = followedUsers.has(post.authorName);
                const hasSentRequest = friendRequests.has(post.authorName);
                const isVideo = post.type === 'play';
                const hasMedia = post.type === 'media' && post.mediaUrl;

                return (
                  <React.Fragment key={post.id}>
                    <div 
                      className="bg-[#0A0F1D] border border-slate-900 rounded-2xl overflow-hidden shadow-lg hover:border-slate-800 transition duration-200"
                      onClick={() => handleItemInteract(post, 'view')}
                    >
                    {/* Sovereign Curated Match Header Indicator */}
                    <div className="bg-gradient-to-r from-cyan-950/60 to-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-950">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                          Sovereign Match Score: {score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {matchReasons.slice(0, 1).map((reason, rIdx) => (
                          <span key={rIdx} className="text-[9px] bg-cyan-950 border border-cyan-800/40 text-cyan-400 px-2 py-0.5 rounded font-sans flex items-center gap-1">
                            <Info className="w-2.5 h-2.5" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content Top-Line */}
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={post.authorAvatar} 
                          className="w-9 h-9 rounded-full object-cover bg-slate-850 border border-slate-900" 
                          alt="" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-semibold text-xs text-slate-200">{post.authorName}</span>
                            {((post.authorName === username && isPremium) || post.authorName === 'Cypher Architect' || post.authorName === 'Lyra Vesper') && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-400 rounded-full text-[8px] font-sans font-bold shadow-sm animate-pulse" title="OmniSphere Premium Verified Creator">
                                <Sparkles className="w-2 h-2 text-amber-400" />
                                <span>Premium</span>
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500 font-mono">
                              • {new Date(post.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {/* Public Key Stamp */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <Key className="w-2.5 h-2.5 text-violet-400" />
                            <span className="text-[9px] text-slate-600 font-mono">
                              {post.authorPublicKey.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Social Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendFriendRequest(post.authorName); }}
                          className={`p-1 rounded-lg border text-xs transition ${
                            hasSentRequest 
                              ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400' 
                              : 'border-slate-900 hover:border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {hasSentRequest ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFollowToggle(post.authorName); }}
                          className={`px-2 py-0.5 rounded border text-[10px] font-mono transition ${
                            isFollowed 
                              ? 'bg-cyan-950 border-cyan-500/40 text-cyan-400' 
                              : 'border-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>

                    {/* Play / Cinema Video Channel specific layout */}
                    {isVideo && (
                      <div className="bg-slate-950 border-y border-slate-950 relative">
                        <div className="aspect-video w-full relative group cursor-pointer">
                          <video 
                            src={post.mediaUrl}
                            className="w-full h-full object-cover"
                            poster={post.mediaThumbnail}
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-slate-900">
                              <Video className="w-4 h-4 fill-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900/20">
                          <h4 className="font-sans font-bold text-xs text-slate-100">{post.title}</h4>
                        </div>
                      </div>
                    )}

                    {/* Image / Gallery Layout */}
                    {hasMedia && (
                      <div className="bg-slate-950 flex justify-center overflow-hidden max-h-80">
                        <img 
                          src={post.mediaUrl} 
                          className="w-full object-cover" 
                          alt="Decentralized media block" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Content text */}
                    <div className="px-5 py-3 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </div>

                    {/* Local Interaction Indicators & Inputs */}
                    <div className="px-5 py-2.5 bg-slate-950/40 border-t border-slate-950 flex items-center gap-4 text-slate-400 text-[11px] font-mono">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id, post); }}
                        className={`flex items-center gap-1 transition ${
                          post.hasLiked ? 'text-rose-500 font-bold' : 'hover:text-slate-200'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                        <span>{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount} comments</span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleTip(post); }}
                        className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px] text-emerald-400 hover:bg-emerald-900/20 transition"
                      >
                        <Volume2 className="w-3 h-3" />
                        Tip 15 LC
                      </button>

                      <span className="text-[9px] text-slate-600 font-mono ml-auto">
                        Type: {post.type.toUpperCase()}
                      </span>
                    </div>

                    {/* Local Comment input mock */}
                    <div className="bg-slate-950/30 border-t border-slate-950 p-3 flex gap-2">
                      <input
                        type="text"
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Add signed comment locally..."
                        className="flex-grow bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-cyan-500 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            handleCommentSubmit(post.id, post);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCommentSubmit(post.id, post); }}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded text-[10px] font-mono transition"
                      >
                        Sign
                      </button>
                    </div>
                  </div>

                  {!isPremium && (idx + 1) % 4 === 0 && (
                    <div className="my-6">
                      <GoogleAdSenseAd 
                        format={idx % 8 === 0 ? 'rectangle' : 'horizontal'} 
                        theme={theme} 
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
          </div>

          {/* Quick Stats sidebar widget */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <Award className="w-4 h-4 text-violet-400" />
                Discovery Insights
              </h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Your client is reading metadata tags from downloaded mesh replicas to identify patterns locally. No identifiers are broadcasted.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">Device Model</span>
                  <span className="text-slate-300">Aura-V1 Client Engine</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">Security Mode</span>
                  <span className="text-cyan-400">Pure Local (100% Offline)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">Ledger File Size</span>
                  <span className="text-slate-300">~{JSON.stringify(getLocalInteractionLedger()).length} bytes</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/30 to-cyan-950/20 border border-slate-900 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                The Core Theory
              </h4>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Instead of feeding centralized machine learning algorithms with continuous streams of behavioral data, Aura shifts the vectorization to the edges.
              </p>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Recommenders are fully client-side scripts reading the local gossip DB index. Absolute personal data sovereignty is maintained.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 2: PEER RECOMMENDATIONS (LOOKALIKES) */}
      {activeSubTab === 'peers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-400" />
              lookalike_peer_suggestions
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Calculated dynamically via shared interest hashtags
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peerRecs.length === 0 ? (
              <div className="p-12 text-center col-span-full bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl">
                <p className="text-sm font-sans text-slate-400">Searching peer network...</p>
              </div>
            ) : (
              peerRecs.map((peer, pIdx) => {
                const isFollowed = followedUsers.has(peer.name);
                const hasSentRequest = friendRequests.has(peer.name);

                return (
                  <div 
                    key={pIdx}
                    className="bg-[#0A0F1D] border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-800 transition duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={peer.avatar} 
                            className="w-11 h-11 rounded-full object-cover bg-slate-850 border border-slate-800" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-sans font-bold text-xs text-slate-200">{peer.name}</h4>
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono mt-0.5">
                              <Cpu className="w-3 h-3 text-cyan-500 animate-pulse" />
                              <span>{peer.alignmentScore}% Peer Alignment</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded">
                          SIMILAR_MIND
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {peer.bio}
                      </p>

                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider block">Common interest overlaps:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {peer.matchingInterests.length > 0 ? (
                            peer.matchingInterests.map((interest, iIdx) => (
                              <span key={iIdx} className="text-[9px] font-mono bg-slate-950 border border-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                                #{interest}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-mono text-slate-600">Discovered via global mesh popularity</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-950">
                      <button
                        onClick={() => handleSendFriendRequest(peer.name)}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono transition ${
                          hasSentRequest 
                            ? 'bg-indigo-950/40 border border-indigo-500/40 text-indigo-400' 
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800/80'
                        }`}
                      >
                        {hasSentRequest ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        <span>{hasSentRequest ? 'Requested' : 'Add Friend'}</span>
                      </button>

                      <button
                        onClick={() => handleFollowToggle(peer.name)}
                        className={`py-1.5 rounded text-xs font-mono font-semibold transition ${
                          isFollowed 
                            ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-400' 
                            : 'border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isFollowed ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 3: PERSONALIZATION PROFILE ANALYTICS & TUNING */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Tuning Controls */}
            <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-5 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Sovereign Tuning Multipliers
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Directly customize the local personalization formula. Adjust multipliers to weight different protocol layers in your on-device feed.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {Object.entries(customMultipliers).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 capitalize">{key === 'play' ? 'Cinema (Videos)' : key === 'micro' ? 'Scribbles (Microblog)' : key === 'media' ? 'Visual Gallery' : 'Circles (Nodes)'} Multiplier</span>
                      <span className="text-cyan-400 font-bold">{(val as number).toFixed(1)}x</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-600 font-mono">0.0x</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1" 
                        value={val}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          setCustomMultipliers(prev => ({
                            ...prev,
                            [key]: num
                          }));
                          triggerAlert(`Adjusted ${key} multiplier to ${num}x.`);
                        }}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-[10px] text-slate-600 font-mono">2.0x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Logs (On-device Transparency Panel) */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3 font-mono">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sovereign Privacy Audit Log
              </h3>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Below is a full live diagnostic trace of what the on-device compiler calculated. This proves no private keys or behavioral profiles are leaking.
              </p>

              <div className="p-3.5 bg-slate-900/30 rounded-xl text-[10px] space-y-1.5 text-slate-500 max-h-48 overflow-y-auto">
                <div>[SYSTEM] Local storage database 'aura_discovery_ledger' detected.</div>
                <div>[SYSTEM] Read index size: {profile?.totalInteractions || 0} interaction points.</div>
                <div>[VECTORIZER] Hashing content tag-weight indices...</div>
                {profile && Object.entries(profile.tagScores).slice(0, 5).map(([tag, score]) => (
                  <div key={tag} className="text-cyan-500/80">
                    &gt;&gt; Index tag '{tag}': weight={score}
                  </div>
                ))}
                {profile && Object.entries(profile.authorScores).slice(0, 3).map(([author, score]) => (
                  <div key={author} className="text-violet-400/80">
                    &gt;&gt; Index peer affinity '{author}': weight={score}
                  </div>
                ))}
                <div>[COMPILE] Successfully resolved LOOKALIKES and Curated stream matching.</div>
                <div className="text-emerald-400 font-bold">[AUDIT] Zero network transmissions requested. Personal data secured on sandbox filesystem.</div>
              </div>
            </div>
          </div>

          {/* Side Interest Profile List */}
          <div className="space-y-6">
            <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Interests Signature Vector
              </h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Below are your locally learned interest vectors extracted from content hashtags and textual semantic indices.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {profile && Object.keys(profile.tagScores).length > 0 ? (
                  Object.entries(profile.tagScores)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([tag, score]) => (
                      <div key={tag} className="flex justify-between items-center bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-900">
                        <span className="text-[11px] font-mono text-cyan-300">#{tag}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-slate-900 rounded overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(((score as number) / 30) * 100, 100)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">w={score as number}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-slate-600 border border-dashed border-slate-900 rounded-xl">
                    No active interest signatures compiled yet. Try liking or commenting on some feed content to train the engine locally!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
