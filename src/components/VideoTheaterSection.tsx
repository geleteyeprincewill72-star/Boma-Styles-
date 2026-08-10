import React, { useState, useEffect, useRef } from 'react';
import { AdsterraAd } from './AdsterraAd';
import { 
  Play, 
  Pause, 
  Tv, 
  Award, 
  Sparkles, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Heart, 
  Lock, 
  CheckCircle, 
  Video, 
  DollarSign, 
  History, 
  User, 
  X, 
  ChevronRight, 
  CreditCard, 
  Volume2, 
  Shield,
  Film,
  Eye,
  ExternalLink,
  Plus,
  Camera,
  VideoOff,
  RefreshCw,
  Activity,
  BarChart2,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { FeedPost, Comment } from '../types';
import { uploadFileToStorage } from '../utils/firebase';
import CreatorVideoAnalytics from './CreatorVideoAnalytics';
import CustomHlsPlayer from './CustomHlsPlayer';
import PhoneAdaptationBanner from './PhoneAdaptationBanner';

interface VideoTheaterSectionProps {
  posts: FeedPost[];
  onAddPost: (newPost: FeedPost) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, comment: Comment) => void;
  balance: number;
  onUpdateBalance: React.Dispatch<React.SetStateAction<number>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  isPremium: boolean;
  theme?: 'dark' | 'light';
  username?: string;
  avatar?: string;
  isAppCreator?: boolean;
}

const VIDEO_PRESETS = [
  { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', name: 'Mux HLS Test Stream (Adaptive 1080p-360p)', desc: 'Full multi-bitrate HLS live stream test' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4', name: 'Terminal Stream', desc: 'Decentralized command routing visualization' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-close-up-39996-large.mp4', name: 'Hardware Ledger', desc: 'Sovereign ledger microchip compilation sequence' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-glowing-globe-of-connections-41804-large.mp4', name: 'Global Swarm Mesh', desc: 'Visual representation of peer-to-peer DHT relays' }
];

export default function VideoTheaterSection({
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
  balance,
  onUpdateBalance,
  transactions,
  setTransactions,
  isPremium,
  theme = 'dark',
  username = 'AnonPeer_402',
  avatar = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
  isAppCreator = false
}: VideoTheaterSectionProps) {
  const isLight = theme === 'light';

  // Device Lite Adaptation Mode state for legacy/low-end phones
  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('phone_lite_mode_manual') === 'true';
  });

  // Creator Analytics View State
  const [showCreatorAnalytics, setShowCreatorAnalytics] = useState<boolean>(() => {
    return isAppCreator || localStorage.getItem('aura_is_creator') === 'true';
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Video selection state
  const videoPosts = posts.filter(p => p.type === 'play' || p.mediaUrl?.endsWith('.mp4') || p.mediaUrl?.includes('.m3u8') || p.mediaUrl?.includes('mixkit'));
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  // Play Queue local state array
  const [videoQueue, setVideoQueue] = useState<FeedPost[]>([]);

  // Session Watch History State
  interface WatchHistoryItem {
    id: string;
    title: string;
    authorName: string;
    mediaThumbnail?: string;
    watchedAt: number;
    post: FeedPost;
  }

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('aura_video_watch_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Track watch history when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      setWatchHistory(prev => {
        const filtered = prev.filter(item => item.id !== selectedPost.id);
        const updated = [
          {
            id: selectedPost.id,
            title: selectedPost.title || 'Broadcast Stream',
            authorName: selectedPost.authorName || 'Bios Styles',
            mediaThumbnail: selectedPost.mediaThumbnail,
            watchedAt: Date.now(),
            post: selectedPost
          },
          ...filtered
        ];
        try {
          sessionStorage.setItem('aura_video_watch_history', JSON.stringify(updated.slice(0, 25)));
        } catch (e) {}
        return updated;
      });
    }
  }, [selectedPost?.id]);

  const addToQueue = (post: FeedPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoQueue.some(item => item.id === post.id)) {
      alert("This broadcast is already in your play queue!");
      return;
    }
    setVideoQueue(prev => [...prev, post]);
  };

  const removeFromQueue = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVideoQueue(prev => prev.filter(item => item.id !== postId));
  };

  const clearQueue = () => {
    setVideoQueue([]);
  };

  const handleVideoEnded = () => {
    if (videoQueue.length > 0) {
      const nextVideo = videoQueue[0];
      setVideoQueue(prev => prev.slice(1));
      handleSelectVideo(nextVideo);
    }
  };

  // Initialize selected post if videos exist
  useEffect(() => {
    if (!selectedPost && videoPosts.length > 0) {
      setSelectedPost(videoPosts[0]);
    }
  }, [posts, selectedPost]);

  // Comment input
  const [commentText, setCommentText] = useState('');

  // Web Sponsor Ad simulation state
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adType, setAdType] = useState<'interstitial' | 'rewarded'>('interstitial');
  const [adCountdown, setAdCountdown] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Creator Tipping Modal states
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipTargetAuthor, setTipTargetAuthor] = useState('');
  const [tipTargetPostId, setTipTargetPostId] = useState('');
  const [tipAmount, setTipAmount] = useState('10');
  const [tipMethod, setTipMethod] = useState<'wallet' | 'stripe' | 'paypal'>('wallet');
  
  // Tipping Card details
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [tippingProcessing, setTippingProcessing] = useState(false);
  const [tippingSuccess, setTippingSuccess] = useState(false);

  // Video Broadcast upload states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState(VIDEO_PRESETS[0].url);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Native Camera states
  const [useCamera, setUseCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(e => console.warn(e));
      }
    } catch (err) {
      console.error("Failed to access camera/microphone:", err);
      alert("Failed to access camera/microphone. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm;codecs=vp9,opus' });
    } catch (e) {
      try {
        recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
      } catch (err) {
        recorder = new MediaRecorder(cameraStream);
      }
    }

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    startCamera();
  };

  useEffect(() => {
    if (!showUploadForm) {
      stopCamera();
      setRecordedBlob(null);
      setRecordingTime(0);
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [showUploadForm, useCamera]);

  useEffect(() => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recordedBlob]);

  // Google AdSense state tracking
  const [impressions, setImpressions] = useState(240);
  const [earnings, setEarnings] = useState(12.80);

  // Show Interstitial on video change (30% chance)
  const handleSelectVideo = (post: FeedPost) => {
    const triggerAd = Math.random() < 0.35 && !isPremium;
    if (triggerAd) {
      triggerWebSponsorAd('interstitial');
    }
    setSelectedPost(post);
  };

  const triggerWebSponsorAd = (type: 'interstitial' | 'rewarded') => {
    setAdType(type);
    setShowAdOverlay(true);
    const duration = type === 'rewarded' ? 7 : 5;
    setAdCountdown(duration);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          if (type === 'rewarded') {
            // Reward user with 15 LC
            onUpdateBalance(b => b + 15);
            // Log transaction
            const newTx = {
              id: `tx_sponsor_ad_${Date.now()}`,
              type: 'deposit',
              amount: 15.00,
              description: 'Google AdSense Web Sponsor Video Compensation',
              timestamp: Date.now(),
              txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
            };
            setTransactions(prevTx => [newTx, ...prevTx]);
            setEarnings(e => e + 0.15); // Add to creator dashboard
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setImpressions(prev => prev + 1);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const submitTip = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please specify a valid tip amount.");
      return;
    }

    if (tipMethod === 'wallet' && balance < amount) {
      alert(`Insufficient balance in your Lumina Wallet! You need ${amount} LC but only have ${balance.toFixed(2)} LC.`);
      return;
    }

    setTippingProcessing(true);

    setTimeout(() => {
      // Process payment
      if (tipMethod === 'wallet') {
        onUpdateBalance(prev => prev - amount);
      }

      // Add to transactions ledger
      const newTx = {
        id: `tx_tip_${Date.now()}`,
        type: tipMethod === 'wallet' ? 'payment' : 'deposit',
        amount: amount,
        description: `Direct Creator Tip securely processed to ${tipTargetAuthor} via ${
          tipMethod === 'wallet' ? 'Lumina Ledger' : tipMethod === 'stripe' ? 'Stripe Gateway' : 'PayPal Secure Checkout'
        }`,
        timestamp: Date.now(),
        txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
      };

      setTransactions(prev => [newTx, ...prev]);
      setTippingProcessing(false);
      setTippingSuccess(true);

      // Trigger automatic update of video likes/tips representation or notification
      setTimeout(() => {
        setShowTipModal(false);
        setTippingSuccess(false);
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
      }, 2000);

    }, 2000);
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert("Please provide a title and video stream description.");
      return;
    }

    let finalVideoUrl = newVideoUrl;

    if (useCamera) {
      if (!recordedBlob) {
        alert("Please record a video first or switch back to preset streams.");
        return;
      }
      try {
        setIsUploading(true);
        const fileName = `camera_recording_${Date.now()}.webm`;
        const path = `videos/${fileName}`;
        const file = new File([recordedBlob], fileName, { type: 'video/webm' });
        finalVideoUrl = await uploadFileToStorage(file, path);
      } catch (err) {
        console.error("Storage upload failed:", err);
        alert("Failed to upload the recorded video to Firebase Storage.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const newPost: FeedPost = {
      id: `video_${Date.now()}`,
      authorName: username,
      authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100c5bc6',
      authorAvatar: avatar,
      type: 'play',
      timestamp: Date.now(),
      title: newTitle,
      content: newDesc,
      signature: 'sig_broadcast_' + Date.now().toString(16),
      mediaUrl: finalVideoUrl,
      mediaThumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      views: 1,
      likes: 0,
      commentsCount: 0,
      comments: [],
      aspectRatio: '16:9'
    };

    onAddPost(newPost);
    setSelectedPost(newPost);
    setNewTitle('');
    setNewDesc('');
    setRecordedBlob(null);
    setUseCamera(false);
    setShowUploadForm(false);
  };

  const handleAddCommentLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentText.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      authorName: 'AnonPeer_402',
      content: commentText,
      timestamp: Date.now(),
      signature: 'sig_comment_' + Date.now().toString(16)
    };

    onAddComment(selectedPost.id, newComment);
    
    // Update local selected post to show comment immediately
    const updatedComments = [
      {
        id: `c_${Date.now()}`,
        authorName: 'AnonPeer_402',
        content: commentText,
        timestamp: Date.now(),
        signature: 'sig_comment_' + Date.now().toString(16)
      },
      ...(selectedPost.comments || [])
    ];

    setSelectedPost({
      ...selectedPost,
      commentsCount: (selectedPost.commentsCount || 0) + 1,
      comments: updatedComments
    });

    setCommentText('');
  };

  return (
    <div className="space-y-6" id="video-theater-section">
      {/* Phone Adaptation Banner for Legacy / Low Resource Devices */}
      <PhoneAdaptationBanner
        isLiteMode={isLiteMode}
        onToggleLiteMode={(val) => setIsLiteMode(val)}
      />

      {/* Top Header Grid */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <Tv className="w-5 h-5 text-rose-500 animate-pulse" />
            Sovereign Video Theater
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-buffer decentralized video relay nodes • P2P cryptographic stream broadcasting
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Creator Exclusive Analytics Button */}
          <button
            onClick={() => setShowCreatorAnalytics(!showCreatorAnalytics)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 border shadow ${
              showCreatorAnalytics
                ? 'bg-violet-600 text-white border-violet-400 shadow-violet-900/50'
                : 'bg-violet-950/60 border-violet-800/60 text-violet-300 hover:bg-violet-900/60'
            }`}
            title="Exclusively visible to content creator"
          >
            <Activity className="w-4 h-4 text-violet-300 animate-pulse" />
            <span>Creator Analytics</span>
            <span className="text-[9px] bg-violet-950 border border-violet-700 px-1 rounded font-normal text-violet-200">
              {showCreatorAnalytics ? 'ON' : 'LIVE'}
            </span>
          </button>

          <button
            onClick={() => triggerWebSponsorAd('rewarded')}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono font-bold uppercase transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-400 animate-bounce" />
            Rewarded Ad (+15 LC)
          </button>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition uppercase"
          >
            <Plus className="w-4 h-4" />
            Broadcast Video
          </button>
        </div>
      </div>

      {/* Creator Exclusive Real-Time Analytics Dashboard */}
      {showCreatorAnalytics && (
        <CreatorVideoAnalytics
          posts={posts}
          selectedPost={selectedPost}
          isAppCreator={isAppCreator}
          impressions={impressions}
          earnings={earnings}
          isPlaying={isVideoPlaying}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Player Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPost ? (
            <div className="bg-[#05080E] border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Custom HTML5 HLS Video Player Frame */}
              <div className="w-full bg-black relative">
                <CustomHlsPlayer
                  key={selectedPost.id}
                  src={selectedPost.mediaUrl || ''}
                  poster={selectedPost.mediaThumbnail}
                  title={selectedPost.title || 'Broadcast Stream'}
                  autoPlay={true}
                  isLiteMode={isLiteMode}
                  creatorName={selectedPost.authorName || 'Bios Styles'}
                  onEnded={() => {
                    setIsVideoPlaying(false);
                    handleVideoEnded();
                  }}
                  onPause={() => setIsVideoPlaying(false)}
                  onPlay={() => {
                    setIsVideoPlaying(true);
                    if ((window as any).triggerMonetizationEvent) {
                      (window as any).triggerMonetizationEvent(`Watched HLS broadcast stream: "${selectedPost.title}"`, 4.8);
                    }
                  }}
                  onMonetizationEvent={(desc, rewardUSD) => {
                    // Update creator ad earnings
                    setEarnings(e => e + rewardUSD);
                    if ((window as any).triggerMonetizationEvent) {
                      (window as any).triggerMonetizationEvent(desc, rewardUSD * 10);
                    }
                  }}
                />
              </div>

              {/* Theater Information Deck */}
              <div className="p-5 space-y-4">

                {/* OPAY Account Holder Facebook Notification Notice Banner */}
                <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 rounded-xl p-3.5 space-y-2 font-mono text-xs text-slate-200 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      OPAY Node Notification System
                    </span>
                    <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-bold">
                      Account: 08154561612
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    🔔 <strong>Notification Alert:</strong> Money gained from broadcast video views & ad interactions is credited to OPAY account <strong className="text-amber-300">08154561612</strong>. Please chat me on Facebook at <strong className="text-amber-300">"Bios Styles"</strong> that you have seen it!
                  </p>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition shadow"
                  >
                    <span>Chat "Bios Styles" On Facebook</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold font-sans text-slate-100 tracking-tight leading-snug">
                      {selectedPost.title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono tracking-widest bg-rose-950/40 border border-rose-800/40 text-rose-400 px-2 py-0.5 rounded font-black flex items-center gap-1">
                      <Film className="w-3 h-3 animate-pulse" />
                      Live Stream
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2 border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        {selectedPost.views?.toLocaleString() || '1,424'} views
                      </span>
                      <span>•</span>
                      <span>{new Date(selectedPost.timestamp).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLikePost(selectedPost.id);
                          setSelectedPost(p => p ? { ...p, likes: (p.likes || 0) + 1 } : null);
                        }}
                        className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-200 transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-rose-400" />
                        {selectedPost.likes || 0}
                      </button>

                      <button
                        onClick={() => {
                          setTipTargetAuthor(selectedPost.authorName);
                          setTipTargetPostId(selectedPost.id);
                          setShowTipModal(true);
                        }}
                        className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/40 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition"
                      >
                        <DollarSign className="w-3.5 h-3.5 animate-pulse" />
                        Tip Creator
                      </button>

                      {/* Queue Button for Current Video */}
                      <button
                        onClick={(e) => {
                          const isQueued = videoQueue.some(item => item.id === selectedPost.id);
                          if (isQueued) {
                            removeFromQueue(selectedPost.id, e);
                          } else {
                            addToQueue(selectedPost, e);
                          }
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition border ${
                          videoQueue.some(item => item.id === selectedPost.id)
                            ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400'
                            : 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-cyan-400'
                        }`}
                        title={videoQueue.some(item => item.id === selectedPost.id) ? "Remove from Queue" : "Add to Play Queue"}
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        {videoQueue.some(item => item.id === selectedPost.id) ? 'Queued' : 'Queue Video'}
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Sovereign video link copied to node clipboards!");
                        }}
                        className="p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-xl text-slate-300 transition"
                        title="Share Cryptographic Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Author Information row */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedPost.authorAvatar}
                      alt={selectedPost.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-800"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{selectedPost.authorName}</span>
                      <span className="text-[9px] text-slate-500 font-mono truncate max-w-[200px] block" title={selectedPost.authorPublicKey}>
                        Node: {selectedPost.authorPublicKey?.slice(0, 24)}...
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">P2P Signature verified</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded font-mono font-bold uppercase mt-1 inline-block">
                      SECURE_SHIELDS_ONLINE
                    </span>
                  </div>
                </div>

                {/* Description text */}
                <div className="text-slate-300 text-xs leading-relaxed font-sans bg-slate-900/20 border border-slate-950 p-4 rounded-xl">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                {/* Local Comments Component */}
                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                    Decentralized Comments ({selectedPost.commentsCount || 0})
                  </h4>

                  <form onSubmit={handleAddCommentLocal} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Sign a comment onto the gossip ledger..."
                      className="flex-grow bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-rose-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded-xl text-xs font-bold font-mono uppercase transition"
                    >
                      Post
                    </button>
                  </form>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map(c => (
                        <div key={c.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-300 font-bold">{c.authorName}</span>
                            <span className="text-slate-500">{new Date(c.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-400 text-xs font-sans leading-relaxed">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-[10px] text-slate-500 font-mono">
                        No signed messages on this broadcast block yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#05080E] border border-slate-900 rounded-2xl p-12 text-center text-slate-500 font-mono space-y-3">
              <Film className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
              <div>No video broadcasts are currently available on this mesh channel.</div>
            </div>
          )}
        </div>

        {/* Sidebar & Upload Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Play Queue Panel */}
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-cyan-400 animate-pulse" />
                Play Queue
              </h3>
              {videoQueue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-[9px] text-slate-500 hover:text-rose-400 font-mono uppercase font-bold transition-colors"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {videoQueue.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {videoQueue.map((p, idx) => (
                  <div
                    key={`${p.id}_q_${idx}`}
                    className="p-2 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between gap-2 text-xs font-sans group relative"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-cyan-500 font-bold w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="w-10 h-8 bg-black rounded overflow-hidden flex-shrink-0">
                        <img src={p.mediaThumbnail} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 w-full">
                        <h4 className="text-xs font-bold text-slate-200 truncate pr-4">
                          {p.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono block">
                          {p.authorName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => removeFromQueue(p.id, e)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-md transition hover:bg-slate-900 shrink-0"
                      title="Remove from play queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* Active "Up Next" preview */}
                <div className="p-2 bg-cyan-950/15 border border-cyan-500/20 rounded-xl text-[10px] font-mono text-cyan-400 flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Up Next: <strong className="font-bold">{videoQueue[0].title}</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-slate-950/30 border border-dashed border-slate-900 rounded-xl text-[10px] text-slate-500 font-mono space-y-1">
                <p>Play queue is empty.</p>
                <p className="text-slate-600">Click "+ Queue" on any broadcast stream to build an auto-play sequence.</p>
              </div>
            )}
          </div>

          {/* Watch History Sidebar Panel */}
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-400" />
                <span>Watch History</span>
                <span className="text-[10px] bg-amber-950/60 border border-amber-800/40 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  {watchHistory.length}
                </span>
              </h3>
              {watchHistory.length > 0 && (
                <button
                  onClick={() => {
                    setWatchHistory([]);
                    sessionStorage.removeItem('aura_video_watch_history');
                  }}
                  className="text-[9px] text-slate-500 hover:text-rose-400 font-mono uppercase font-bold transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {watchHistory.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {watchHistory.map((item) => {
                  const isCurrent = selectedPost?.id === item.id;
                  return (
                    <div
                      key={item.id + '_' + item.watchedAt}
                      onClick={() => handleSelectVideo(item.post)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 transition cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-950/30 border-amber-500/60 text-slate-100 shadow-sm'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-12 h-9 bg-black rounded overflow-hidden flex-shrink-0 relative">
                          <img
                            src={item.mediaThumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-amber-300 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-200 truncate font-sans">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                            <span className="truncate">By {item.authorName}</span>
                            {isCurrent ? (
                              <span className="text-amber-400 font-bold uppercase">Now Watching</span>
                            ) : (
                              <span className="text-slate-500">
                                {new Date(item.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 px-3 bg-slate-950/30 border border-dashed border-slate-900 rounded-xl text-[10px] text-slate-500 font-mono space-y-1">
                <p>No watch history in this session yet.</p>
                <p className="text-slate-600">Videos you play will automatically appear here as a clickable history list.</p>
              </div>
            )}
          </div>

          {/* Active Broadcasts Sidebar List */}
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                Mesh Broadcasts
              </span>
              <span className="text-[9px] bg-rose-950/60 border border-rose-800/40 text-rose-400 px-2 py-0.5 rounded font-black font-mono">
                {videoPosts.length} ONLINE
              </span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {videoPosts.map(p => {
                const isQueued = videoQueue.some(item => item.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition ${
                      selectedPost?.id === p.id
                        ? 'bg-rose-950/20 border-rose-500 text-slate-100 shadow'
                        : 'border-slate-850 hover:border-slate-800 text-slate-400 bg-slate-950/20'
                    }`}
                  >
                    <div 
                      onClick={() => handleSelectVideo(p)}
                      className="flex gap-2.5 cursor-pointer flex-grow min-w-0"
                    >
                      <div className="w-16 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img
                          src={p.mediaThumbnail}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white drop-shadow opacity-80" />
                        </div>
                      </div>
                      <div className="flex-grow min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 font-sans line-clamp-1">
                          {p.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          By {p.authorName}
                        </span>
                        <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 font-mono px-1 py-0.5 rounded uppercase inline-block">
                          {p.views?.toLocaleString() || '142'} Views
                        </span>
                      </div>
                    </div>

                    {/* Quick Queue Toggle Button */}
                    <button
                      onClick={(e) => isQueued ? removeFromQueue(p.id, e) : addToQueue(p, e)}
                      className={`px-2 py-1 border rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 shrink-0 ${
                        isQueued 
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-red-950/25 hover:border-red-500/30 hover:text-red-400' 
                          : 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-rose-400'
                      }`}
                      title={isQueued ? "Remove from queue" : "Add to queue"}
                    >
                      {isQueued ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Queued</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-rose-500" />
                          <span>Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adsterra Sponsor Banner Sidebar Placement */}
          {!isPremium && (
            <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-3 flex flex-col items-center justify-center">
              <AdsterraAd unit="medium_rectangle_250" theme={theme} />
            </div>
          )}

          {/* Video Creator Analytics Panel (For Creator representation) */}
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Broadcast Analytics
            </h4>
            
            <div className="grid grid-cols-2 gap-3 font-mono text-center">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase block">Ad Impressions</span>
                <span className="text-sm font-bold text-slate-200 block mt-1">{impressions}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase block">Estimated CPM</span>
                <span className="text-sm font-bold text-emerald-400 block mt-1">${earnings.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-normal">
              CPM and video impression tokens sync directly to peer wallets on every epoch validation. Only you can view these metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Video Upload Form Modal / Accordion */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#060913] border-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-500 animate-pulse" />
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Initiate Video Broadcast
                </h4>
              </div>
              <button onClick={() => setShowUploadForm(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishVideo} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">Video Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Video Title"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">Stream Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Tell the mesh what this signed stream block is about..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 uppercase font-mono block">Broadcast Source</label>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUseCamera(false)}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold transition flex items-center justify-center gap-1.5 ${
                      !useCamera ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    Preset Streams
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCamera(true)}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold transition flex items-center justify-center gap-1.5 ${
                      useCamera ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Record Camera
                  </button>
                </div>

                {!useCamera ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-mono block">Select Stream Preset Video</label>
                    <div className="grid grid-cols-1 gap-2">
                      {VIDEO_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.url}
                          onClick={() => setNewVideoUrl(preset.url)}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between text-[11px] font-mono transition ${
                            newVideoUrl === preset.url
                              ? 'bg-rose-950/20 border-rose-500 text-rose-400'
                              : 'bg-slate-950 border-slate-850 text-slate-400'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">{preset.name}</span>
                            <span className="text-[9px] text-slate-500">{preset.desc}</span>
                          </div>
                          {newVideoUrl === preset.url && <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                      {!recordedBlob ? (
                        <>
                          <video
                            ref={liveVideoRef}
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {!cameraStream && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-950/90 z-10">
                              <VideoOff className="w-8 h-8 text-rose-500 animate-pulse" />
                              <span className="font-mono text-[9px] text-center px-4">Initializing mesh camera sync...</span>
                            </div>
                          )}
                          {isRecording && (
                            <div className="absolute top-2 right-2 bg-rose-600/95 text-white font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse z-20">
                              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                              REC {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </>
                      ) : (
                        <video
                          src={URL.createObjectURL(recordedBlob)}
                          controls
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      {!recordedBlob ? (
                        !isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            disabled={!cameraStream}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-mono text-[10px] font-bold uppercase transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span className="w-2 h-2 rounded-full bg-white block animate-ping" />
                            Start Recording
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-mono text-[10px] font-bold uppercase transition flex items-center gap-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-600 block" />
                            Stop Recording
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={resetRecording}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-[10px] font-bold uppercase transition flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Re-record
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-500 font-mono leading-relaxed border-t border-slate-900 pt-2 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Broadcasting will sign content using your unique cryptographic key.</span>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-center font-sans text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading to Storage...
                  </>
                ) : (
                  'Sign & Launch Broadcast'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Creator Tipping Secure Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#060913] border-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Secure Tip To {tipTargetAuthor}
                </h4>
              </div>
              <button onClick={() => setShowTipModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900/60 font-mono text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Available Ledger Balance</span>
              <span className="text-sm font-bold text-emerald-400">{balance.toFixed(2)} LC</span>
            </div>

            {tippingSuccess ? (
              <div className="p-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase">Tip Dispatched</h5>
                  <p className="text-[10px] text-slate-400 font-mono">Tip successfully validated and added to ledger stream.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submitTip} className="space-y-4 text-xs font-mono">
                {/* Tip Amount Grid */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1.5">Select Tip Value</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['5', '10', '20', '50'].map(val => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setTipAmount(val)}
                        className={`py-2 rounded border text-center transition ${
                          tipAmount === val
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-slate-950 border-slate-900 text-slate-400'
                        }`}
                      >
                        {val} LC
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 uppercase">Or Custom:</span>
                    <input
                      type="number"
                      value={tipAmount}
                      onChange={e => setTipAmount(e.target.value)}
                      className="flex-grow bg-slate-950 border border-slate-900 rounded px-2 py-1 text-slate-100 text-[11px] text-center"
                      min="1"
                    />
                  </div>
                </div>

                {/* Secure Provider Selection */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1.5">Secure Payment Provider</label>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setTipMethod('wallet')}
                      className={`py-1.5 rounded border text-center transition ${
                        tipMethod === 'wallet'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-950 border-slate-900 text-slate-500'
                      }`}
                    >
                      Aura LC
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipMethod('stripe')}
                      className={`py-1.5 rounded border text-center transition ${
                        tipMethod === 'stripe'
                          ? 'bg-indigo-950 border-indigo-500 text-indigo-400 font-bold'
                          : 'bg-slate-950 border-slate-900 text-slate-500'
                      }`}
                    >
                      Stripe
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipMethod('paypal')}
                      className={`py-1.5 rounded border text-center transition ${
                        tipMethod === 'paypal'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-400 font-bold'
                          : 'bg-slate-950 border-slate-900 text-slate-500'
                      }`}
                    >
                      PayPal
                    </button>
                  </div>
                </div>

                {/* Credit card form if Stripe is selected */}
                {tipMethod === 'stripe' && (
                  <div className="space-y-2 border-t border-slate-900 pt-3 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase block">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Cardholder Name"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-100 text-[11px]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase block">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-100 font-mono text-[11px]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase block">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center text-[11px]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 uppercase block">CVC</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="•••"
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-100 font-mono text-center text-[11px]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {tipMethod === 'paypal' && (
                  <div className="p-3 bg-cyan-950/20 border border-cyan-800/20 rounded-xl text-center space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] text-cyan-400 font-bold block">PayPal Instant Checkout Active</span>
                    <p className="text-[9px] text-slate-400">
                      You will be authenticated using PayPal sandbox. Funds will be directly converted and sent to {tipTargetAuthor}.
                    </p>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 leading-relaxed flex items-center gap-1.5 border-t border-slate-900 pt-2.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted peer tunnel: SSL 256-bit SHA algorithm</span>
                </div>

                <button
                  type="submit"
                  disabled={tippingProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-center"
                >
                  {tippingProcessing ? 'Processing Tip...' : `Authorize Tipping of ${parseFloat(tipAmount || '0').toFixed(2)} LC`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL SCREEN WEB SPONSOR AD OVERLAY FOR INTERSTITIAL AND REWARDED VIDEO */}
      {showAdOverlay && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between p-6 select-none font-mono">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1 text-rose-400 font-bold uppercase animate-pulse">
              <Tv className="w-4 h-4" />
              Google AdSense Web Placement
            </span>
            <span>
              {adCountdown > 0 ? (
                <span className="px-3 py-1 bg-slate-900 border border-slate-850 rounded text-slate-300">
                  Skippable in {adCountdown}s
                </span>
              ) : (
                <button
                  onClick={() => setShowAdOverlay(false)}
                  className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded hover:bg-rose-400 animate-pulse uppercase"
                >
                  Skip Ad [X]
                </button>
              )}
            </span>
          </div>

          <div className="text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="relative w-32 h-32 mx-auto">
              <Sparkles className="w-32 h-32 text-rose-500/20 absolute inset-0 animate-spin" />
              <Film className="w-16 h-16 text-rose-400 absolute inset-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded">
                Decentralized Swarm Prime
              </span>
              <h4 className="text-xl font-bold text-slate-100 font-sans">Lumina Sovereign Mesh</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Host your own digital ecosystem without borders. Connect directly to peers using encrypted DHT relays. No third parties, no downtime, 100% control.
              </p>
            </div>

            <div className="pt-4">
              <a 
                href="https://ai.studio/build" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="inline-block px-8 py-3 bg-rose-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition shadow-lg shadow-rose-500/20"
              >
                Visit Mesh Site
              </a>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 space-y-2 border-t border-slate-900 pt-4">
            <div>
              {adType === 'rewarded' ? (
                adCountdown > 0 ? (
                  <span>Watch for {adCountdown} seconds to claim your **15.00 LC** compensation...</span>
                ) : (
                  <span className="text-emerald-400 font-black animate-pulse">Compensation Claimed! +15.00 LC safely routed to ledger wallet.</span>
                )
              ) : (
                <span>Supporting OmniSphere decentralized developer nodes.</span>
              )}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600">
              Ad Unit ID: ca-app-pub-3940256099942544/5224354917
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
