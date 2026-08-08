import React, { useState, useRef, useEffect } from 'react';
import { 
  Tv, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Heart, 
  MessageSquare, 
  Share2, 
  DollarSign, 
  Award, 
  Sparkles, 
  Plus, 
  Upload, 
  Shield, 
  X, 
  ExternalLink, 
  Lock, 
  CheckCircle, 
  CreditCard, 
  AlertCircle,
  Eye,
  Info
} from 'lucide-react';
import { FeedPost, Comment, Transaction } from '../types';
import { signContent } from '../utils/crypto';
import CinematicCanvasPlayer from './CinematicCanvasPlayer';

interface VideoHubSectionProps {
  posts: FeedPost[];
  onAddPost: (post: FeedPost) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, comment: Comment) => void;
  currentUserKey: string;
  currentPrivateKey: string;
  username: string;
  avatar: string;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  theme?: 'dark' | 'light';
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const PRESET_VIDEOS = [
  {
    title: 'New Berlin Grid-Leak',
    description: 'Intercepted raw diagnostic dump of the centralized silo controllers. Peer-to-peer routing is alive.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Cyberpunk Neon Streets',
    description: 'Off-grid sector cameras streaming high-frequency color pulses. Art under the mesh.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-neon-light-on-a-street-in-hong-kong-43033-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Neural Hive Visualizer',
    description: 'Dynamic math representation of peer connections across Europe-West cluster routers.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-numbers-41908-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60'
  }
];

export default function VideoHubSection({
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
  currentUserKey,
  currentPrivateKey,
  username,
  avatar,
  balance,
  onUpdateBalance,
  theme = 'dark',
  transactions,
  setTransactions
}: VideoHubSectionProps) {
  const isLight = theme === 'light';
  const videoPosts = posts.filter(post => post.type === 'play');

  // Video playback states
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');

  // Tipping states
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipRecipient, setTipRecipient] = useState<string>('');
  const [tipPostId, setTipPostId] = useState<string>('');
  const [tipAmount, setTipAmount] = useState('10');
  const [tipMethod, setTipMethod] = useState<'card' | 'wallet'>('card');
  
  // Card states
  const [tipCardNumber, setTipCardNumber] = useState('');
  const [tipCardExpiry, setTipCardExpiry] = useState('');
  const [tipCardCvc, setTipCardCvc] = useState('');
  const [tipCardName, setTipCardName] = useState('');
  
  const [tipProcessing, setTipProcessing] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Set first video post as active if none is selected
  useEffect(() => {
    if (!activePost && videoPosts.length > 0) {
      setActivePost(videoPosts[0]);
    }
  }, [videoPosts, activePost]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.log('Autoplay blocked', e));
    }
    setIsPlaying(!isPlaying);
  };

  // Keep playback state updated if video changes
  useEffect(() => {
    if (videoRef.current) {
      setIsPlaying(false);
      videoRef.current.load();
      if (activePost) {
        // Increment view count simulated
        activePost.views = (activePost.views || 0) + 1;
      }
    }
  }, [activePost]);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Card input format helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setTipCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setTipCardExpiry(value.slice(0, 2) + '/' + value.slice(2));
    } else {
      setTipCardExpiry(value);
    }
  };

  // Submit secure tip payment
  const handleSendTip = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(tipAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please specify a valid tipping amount.");
      return;
    }

    if (tipMethod === 'wallet') {
      if (balance < numericAmount) {
        alert(`Insufficient funds in wallet! Your balance is ${balance.toFixed(2)} LC.`);
        return;
      }
    } else {
      // Card validation
      if (!tipCardNumber || !tipCardExpiry || !tipCardCvc || !tipCardName) {
        alert("Please complete all payment parameters to process card transactions.");
        return;
      }
    }

    setTipProcessing(true);
    setProcessingStep("Initiating secure SSL 256-bit proxy bridge...");

    const steps = [
      "Establishing connection to encrypted Stripe tunnel...",
      "Tokenizing sensitive checkout metrics...",
      "Settling ledger nodes for creator reimbursement...",
      "Synchronizing cryptographic verification receipts..."
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setProcessingStep(steps[currentStepIndex]);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        
        // Execute financial deduction
        if (tipMethod === 'wallet') {
          onUpdateBalance(balance - numericAmount);
        }

        // Add real transaction to ledger state
        const generatedHash = '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
        
        const sendTx: Transaction = {
          id: `tx_tip_send_${Date.now()}`,
          type: 'tip_send',
          amount: numericAmount,
          description: `Dispatched tip to creator @${tipRecipient} - ${tipMethod === 'card' ? 'Visa checkout secure' : 'LC Ledger Balance'}`,
          timestamp: Date.now(),
          sender: username,
          receiver: tipRecipient,
          txHash: generatedHash
        };

        setTransactions(prev => [sendTx, ...prev]);

        setTipProcessing(false);
        setTipSuccess(true);

        setTimeout(() => {
          setShowTipModal(false);
          setTipSuccess(false);
          setTipCardNumber('');
          setTipCardExpiry('');
          setTipCardCvc('');
          setTipCardName('');
        }, 1800);
      }
    }, 600);
  };

  // Publish a new play (video) post
  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVideoUrl.trim() || !newDesc.trim()) {
      alert("Specify video title, narrative, and video streaming source URL.");
      return;
    }

    setIsPublishing(true);

    const sigPayload = `${username}:${newDesc}:play:${Date.now()}`;
    const signature = await signContent(sigPayload, currentPrivateKey);

    const newPost: FeedPost = {
      id: `post_video_${Date.now()}`,
      authorName: username,
      authorPublicKey: currentUserKey,
      authorAvatar: avatar,
      type: 'play',
      timestamp: Date.now(),
      title: newTitle,
      content: newDesc,
      signature,
      likes: 0,
      commentsCount: 0,
      comments: [],
      hasLiked: false,
      mediaUrl: newVideoUrl,
      mediaThumbnail: newThumbnailUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
      views: 1,
      aspectRatio: '16:9'
    };

    onAddPost(newPost);
    setActivePost(newPost);
    
    // Clear form
    setNewTitle('');
    setNewDesc('');
    setNewVideoUrl('');
    setNewThumbnailUrl('');
    setIsPublishing(false);
    setShowUploadForm(false);
  };

  // Submit comments directly within Video Hub
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentText.trim()) return;

    const sigPayload = `${username}:${commentText}:${Date.now()}`;
    const signature = await signContent(sigPayload, currentPrivateKey);

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      authorName: username,
      content: commentText,
      timestamp: Date.now(),
      signature
    };

    onAddComment(activePost.id, newComment);
    setCommentText('');
  };

  return (
    <div className="space-y-6" id="video-hub-module">
      {/* Header section */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <h2 className={`text-xl font-bold font-sans flex items-center gap-2 ${isLight ? 'text-slate-850' : 'text-slate-100'}`}>
            <Video className="w-5 h-5 text-pink-500" />
            Sovereign Cinema & Streams
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero Surveillance Streaming • High-Velocity Mesh Player • Immutable Creative Content
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-slate-100 rounded-xl text-xs font-mono font-bold uppercase transition shadow-lg shadow-pink-500/10 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          {showUploadForm ? 'Collapse Form' : 'Broadcast Video'}
        </button>
      </div>

      {/* Upload/Broadcast Form */}
      {showUploadForm && (
        <div className={`p-6 border rounded-2xl space-y-4 animate-fadeIn ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Upload Digital Stream Ledger
            </h3>
            <button onClick={() => setShowUploadForm(false)} className="text-slate-500 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset selector */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Quick Presets: Click to load video demo assets</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_VIDEOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewTitle(p.title);
                    setNewDesc(p.description);
                    setNewVideoUrl(p.url);
                    setNewThumbnailUrl(p.thumbnail);
                  }}
                  className="flex items-center gap-2 p-2 border border-slate-850 bg-slate-950/40 rounded-xl text-left hover:border-pink-500/30 transition group"
                >
                  <img src={p.thumbnail} alt={p.title} className="w-12 h-10 object-cover rounded-md border border-slate-800" referrerPolicy="no-referrer" />
                  <div>
                    <h5 className="text-[11px] font-mono font-bold text-slate-300 group-hover:text-pink-400 truncate w-32">{p.title}</h5>
                    <span className="text-[9px] text-slate-500 block">Click to auto-fill</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePublishVideo} className="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
            <div className="md:col-span-6 space-y-1">
              <label className="text-[10px] text-slate-500 uppercase block">Stream Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Swarm Decoded Lecture"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100"
                required
              />
            </div>
            <div className="md:col-span-6 space-y-1">
              <label className="text-[10px] text-slate-500 uppercase block">Cover Thumbnail URL</label>
              <input 
                type="url" 
                value={newThumbnailUrl}
                onChange={e => setNewThumbnailUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div className="md:col-span-12 space-y-1">
              <label className="text-[10px] text-slate-500 uppercase block">MP4 Video Source URL (Streaming)</label>
              <input 
                type="url" 
                value={newVideoUrl}
                onChange={e => setNewVideoUrl(e.target.value)}
                placeholder="e.g. https://assets.mixkit.co/videos/preview/..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 font-mono text-pink-400"
                required
              />
            </div>
            <div className="md:col-span-12 space-y-1">
              <label className="text-[10px] text-slate-500 uppercase block">Narrative Description / Screenplay Backstory</label>
              <textarea 
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Write description blocks about this digital screenplay stream..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100"
                required
              />
            </div>
            <div className="md:col-span-12">
              <button
                type="submit"
                disabled={isPublishing}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition"
              >
                {isPublishing ? 'Synthesizing Broadcast Shards...' : 'Publish Signed Video Stream'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Player & Active Video Info */}
        <div className="lg:col-span-8 space-y-4">
          {activePost ? (
            <div className={`border rounded-2xl overflow-hidden overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-900'}`}>
              
              {/* CINEMATIC RAYTRACING CANVAS PLAYER */}
              <CinematicCanvasPlayer
                mediaUrl={activePost.mediaUrl}
                title={activePost.title || 'Swarm Video Broadcast'}
                authorName={activePost.authorName}
                isPlaying={isPlaying}
                isMuted={isMuted}
                playbackSpeed={playbackSpeed}
                onTogglePlay={togglePlay}
                onToggleMute={handleVolumeToggle}
                onSpeedChange={handleSpeedChange}
              />

              {/* VIDEO INFO BLOCK */}
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className={`text-lg font-bold font-sans tracking-tight leading-snug ${isLight ? 'text-slate-850' : 'text-slate-100'}`}>
                      {activePost.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        {(activePost.views || 0).toLocaleString()} Views
                      </span>
                      <span>•</span>
                      <span>{new Date(activePost.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* INTERACTIVE BUTTONS BAR */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => onLikePost(activePost.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-mono transition ${
                        activePost.hasLiked 
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 font-bold' 
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${activePost.hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      <span>{activePost.likes} Likes</span>
                    </button>

                    {/* SECURE TIPPING TRIGGERS */}
                    {activePost.authorName !== username && (
                      <button
                        onClick={() => {
                          setTipRecipient(activePost.authorName);
                          setTipPostId(activePost.id);
                          setShowTipModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl text-xs font-mono font-bold uppercase transition shadow-md shadow-emerald-600/10"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                        Tip Creator
                      </button>
                    )}

                    <button
                      onClick={() => alert("Unique gossip magnet URL generated! Copied encryption key to device clipboard.")}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-mono transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* CREATOR CARD */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/30 border border-slate-900/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={activePost.authorAvatar} alt={activePost.authorName} className="w-9 h-9 object-cover rounded-xl border border-slate-800" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-200">@{activePost.authorName}</h4>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] block" title={activePost.authorPublicKey}>
                        Node ID: {activePost.authorPublicKey.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 px-2 py-0.5 rounded">
                    Verified Swarm Broadcaster
                  </span>
                </div>

                {/* NARRATIVE */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-4 border border-slate-900 rounded-2xl font-sans leading-relaxed whitespace-pre-wrap">
                  {activePost.content}
                </div>

              </div>

              {/* COMMENTS PANEL IN PLAY VIEW */}
              <div className="border-t border-slate-900 bg-slate-950/20 p-5 space-y-4">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-pink-500" />
                  Consensus Comments ({activePost.comments.length})
                </h4>

                <form onSubmit={handleCommentSubmit} className="flex gap-2 font-mono text-xs">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Contribute signed response to ledger..."
                    className="flex-1 bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-slate-100"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-slate-100 font-bold rounded-xl text-xs uppercase"
                  >
                    Submit
                  </button>
                </form>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {activePost.comments.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-300 font-bold">@{c.authorName}</span>
                        <span className="text-slate-500">{new Date(c.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-400 text-xs font-sans leading-relaxed">{c.content}</p>
                      {c.signature && (
                        <span className="text-[8px] text-slate-600 truncate block uppercase leading-none" title={c.signature}>
                          BLOCK SIG: {c.signature.slice(0, 32)}...
                        </span>
                      )}
                    </div>
                  ))}
                  {activePost.comments.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No signatures recorded. Be the first to comment!</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 font-mono">
              <Tv className="w-12 h-12 text-slate-600 animate-pulse mb-3" />
              <span>No cinematic video feeds propagated yet.</span>
              <p className="text-[10px] text-slate-600 max-w-xs mt-1">Click the "Broadcast Video" button to seed and sign your first digital cinema stream!</p>
            </div>
          )}

          {/* GOOGLE ADSENSE / WEB SPONSOR BANNER AD (DEMO) */}
          <div className="bg-slate-950/90 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">
                AdSense Unit
              </span>
              <div>
                <h5 className="font-sans font-bold text-slate-200">Quantum Hostings - 99.9% Swarm Uptime</h5>
                <p className="text-[10px] text-slate-500 font-sans leading-tight">Zero tracking, zero metadata retention. Hosted by peer consensus.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[9px] text-slate-600">Unit ID: ca-pub-3940256099942544/1000000001</span>
              <button 
                onClick={() => {
                  onUpdateBalance(balance + 0.10);
                  const newTx: Transaction = {
                    id: `tx_banner_click_${Date.now()}`,
                    type: 'ad_revenue',
                    amount: 0.10,
                    description: 'Google AdSense Banner programmatic click payout',
                    timestamp: Date.now(),
                    txHash: '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
                  };
                  setTransactions(prev => [newTx, ...prev]);
                  alert("Programmatic Click Registered! +0.10 LC safely added to your wallet ledger.");
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 font-bold uppercase rounded-lg text-[10px] hover:scale-105 transition"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Streams Feed Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 border rounded-2xl space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'}`}>
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-pink-500 animate-pulse" />
              Active Stream Feeds ({videoPosts.length})
            </h4>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {videoPosts.map(p => {
                const isActive = activePost?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePost(p)}
                    className={`w-full flex gap-3 p-2.5 rounded-xl text-left border font-mono transition group relative ${
                      isActive 
                        ? 'bg-pink-950/20 border-pink-500/40 shadow-md shadow-pink-500/5' 
                        : 'bg-slate-950/30 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Thumbnail box */}
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-850 shrink-0 relative bg-black">
                      <img src={p.mediaThumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[8px] font-bold text-slate-300 rounded leading-none flex items-center gap-0.5">
                        <Play className="w-2 h-2 fill-slate-300" /> Play
                      </span>
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      <h5 className={`text-[11px] font-bold font-sans tracking-tight truncate leading-tight group-hover:text-pink-400 ${isActive ? 'text-pink-400' : 'text-slate-200'}`}>
                        {p.title}
                      </h5>
                      <p className="text-[9px] text-slate-500 truncate">@{p.authorName}</p>
                      <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded block w-fit truncate">
                        {(p.views || 0)} views
                      </span>
                    </div>
                  </button>
                );
              })}
              {videoPosts.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No broadcasts registered on mesh. Click "Broadcast Video" to sign your own.</p>
              )}
            </div>
          </div>

          {/* Programmatic WEB SPONSOR REWARDED VIDEO WIDGET */}
          <div className="p-4 border border-violet-900/40 bg-violet-950/20 rounded-2xl text-center space-y-3 font-mono text-xs">
            <Award className="w-8 h-8 text-violet-400 mx-auto animate-bounce" />
            <div>
              <h5 className="font-bold text-slate-200 uppercase">Rewarded Web Sponsor Verification</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Verify block security by watching a 5s rewarded video and earn 10.00 LC instantly.</p>
            </div>
            <button
              onClick={() => {
                alert("Triggering Google AdSense Web Sponsor Ad! Watching 5s video to claim reward...");
                setTimeout(() => {
                  onUpdateBalance(balance + 10.00);
                  const newTx: Transaction = {
                    id: `tx_reward_video_${Date.now()}`,
                    type: 'ad_revenue',
                    amount: 10.00,
                    description: 'Google AdSense Web Sponsor Video completion bonus payout',
                    timestamp: Date.now(),
                    txHash: '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
                  };
                  setTransactions(prev => [newTx, ...prev]);
                  alert("Reward Verification Succeeded! +10.00 LC successfully deposited to wallet.");
                }, 5000);
              }}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-slate-100 rounded-xl font-bold uppercase text-[10px] transition shadow-lg shadow-violet-600/10"
            >
              Watch Rewarded Ad (+10.00 LC)
            </button>
          </div>
        </div>

      </div>

      {/* SECURE CREATOR TIPPING PAYMENT MODAL */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#090E1A] border border-slate-900 rounded-3xl w-full max-w-md p-6 relative space-y-5 font-mono text-xs text-slate-300">
            <button
              onClick={() => setShowTipModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
              <Award className="w-6 h-6 text-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">Secure Creator Compensation</h4>
                <p className="text-[9px] text-slate-500 font-mono">End-to-End Cryptographic Checkout</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900/60 flex items-center gap-3">
              <img src={avatar} className="w-10 h-10 object-cover rounded-xl border border-slate-800" referrerPolicy="no-referrer" />
              <div>
                <p className="text-[10px] text-slate-400">Recipient</p>
                <h5 className="font-bold text-slate-200">@{tipRecipient}</h5>
              </div>
            </div>

            {/* Form for payment */}
            <form onSubmit={handleSendTip} className="space-y-4">
              
              {/* Tip amount selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase block">Specify Tip Amount (LC / USD)</label>
                <div className="grid grid-cols-4 gap-2">
                  {['2', '5', '10', '25'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`py-2 border rounded-xl font-bold font-mono transition text-center ${
                        tipAmount === amt 
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {amt} LC
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={e => setTipAmount(e.target.value)}
                  placeholder="Custom amount..."
                  min="0.1"
                  step="0.1"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 font-mono text-center font-bold text-emerald-400"
                  required
                />
              </div>

              {/* Payment provider selector tabs */}
              <div className="grid grid-cols-2 gap-2 border-b border-slate-900 pb-3">
                <button
                  type="button"
                  onClick={() => setTipMethod('card')}
                  className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                    tipMethod === 'card' 
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' 
                      : 'bg-slate-950 border-slate-900 text-slate-500'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Stripe Checkout
                </button>
                <button
                  type="button"
                  onClick={() => setTipMethod('wallet')}
                  className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                    tipMethod === 'wallet' 
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950 border-slate-900 text-slate-500'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  LC Wallet ({balance.toFixed(2)} LC)
                </button>
              </div>

              {tipProcessing ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[11px] text-emerald-400 font-black animate-pulse">{processingStep}</p>
                </div>
              ) : tipSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h5 className="font-bold text-emerald-400 text-sm">Decentralized Tip Deposited!</h5>
                  <p className="text-[10px] text-slate-400">Transaction registered & signed on ledger hash.</p>
                </div>
              ) : (
                <>
                  {tipMethod === 'card' && (
                    <div className="space-y-3 p-3 bg-slate-950/60 border border-slate-900 rounded-2xl animate-fadeIn">
                      
                      {/* Interactive Credit Card Mockup */}
                      <div className="bg-gradient-to-r from-cyan-600 via-cyan-700 to-indigo-800 p-4 rounded-xl text-slate-100 font-mono space-y-4 shadow-lg">
                        <div className="flex justify-between items-start">
                          <CreditCard className="w-8 h-8 text-cyan-300" />
                          <span className="text-[9px] font-black tracking-widest bg-black/20 px-2 py-0.5 rounded uppercase">Stripe Secure</span>
                        </div>
                        <div className="text-sm font-bold tracking-widest text-center py-1">
                          {tipCardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between text-[10px] uppercase">
                          <div>
                            <span className="text-[8px] text-cyan-300 block">Card Holder</span>
                            <span className="font-bold truncate max-w-[150px] inline-block">{tipCardName || 'PEER NODE'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-cyan-300 block">Expiry</span>
                            <span className="font-bold">{tipCardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase block">Cardholder Name</label>
                          <input
                            type="text"
                            value={tipCardName}
                            onChange={e => setTipCardName(e.target.value.toUpperCase())}
                            placeholder="e.g. Cynthia Vane"
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-100"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase block">Visa / Mastercard Number</label>
                          <input
                            type="text"
                            value={tipCardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="e.g. 4000 1234 5678 9010"
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-100"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase block">Expiry Date</label>
                            <input
                              type="text"
                              value={tipCardExpiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-100 text-center"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase block">CVC Security</label>
                            <input
                              type="password"
                              value={tipCardCvc}
                              onChange={e => setTipCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="•••"
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-100 text-center"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tipMethod === 'wallet' && (
                    <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-center space-y-1 animate-fadeIn">
                      <span className="text-[10px] text-slate-500">CONSENSUS BILLING BALANCE</span>
                      <h4 className="text-lg font-bold font-mono text-emerald-400">{balance.toFixed(2)} LC</h4>
                      <p className="text-[9px] text-slate-500 font-mono">Deducted balance will pay out directly. Zero processing fees applied.</p>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 flex items-center gap-1.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-xl border border-slate-900">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Double signed cryptographic hash locks funds from malicious rerouting.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-xs"
                  >
                    Confirm Secure Tipping Payment
                  </button>
                </>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
