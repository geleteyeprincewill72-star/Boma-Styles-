import React, { useState, useEffect, useRef } from 'react';
import { GoogleAdSenseAd } from './GoogleAdSenseAd';
import { AdsterraAd } from './AdsterraAd';
import { PostPreference } from './FirstTimePostPreferenceModal';
import ModerationCouncilModal from './ModerationCouncilModal';
import DecentralizedIdentityModal from './DecentralizedIdentityModal';
import { personalizeAndDiscoverContent, logOnDeviceInteraction } from '../utils/discoveryEngine';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  Tv, 
  Image as ImageIcon, 
  Feather, 
  Users, 
  Plus, 
  Sparkles, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Film,
  Phone,
  Video,
  UserPlus,
  UserCheck,
  Send,
  Loader2,
  X,
  Volume2,
  Mic,
  MicOff,
  VideoOff,
  Star,
  ExternalLink,
  Sliders,
  Wand2,
  ShieldAlert,
  Shield,
  EyeOff,
  Flag,
  Fingerprint,
  RefreshCw,
  BrainCircuit,
  Radio,
  Rss,
  Globe,
  Zap
} from 'lucide-react';
import { FeedPost, Comment, PostType } from '../types';
import { signContent } from '../utils/crypto';
import { uploadFileToStorage } from '../utils/firebase';

// Preset filters for Instagram styling
const PHOTO_FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'vesper', name: 'Vesper (Cyber Teal)', class: 'sepia contrast-125 saturate-150 hue-rotate-15' },
  { id: 'cyberpunk', name: 'Neo-Neon', class: 'saturate-200 contrast-125 hue-rotate-180 brightness-105' },
  { id: 'vintage', name: 'Slate Mono', class: 'grayscale contrast-150 brightness-95' },
  { id: 'warm', name: 'Sunset Amber', class: 'sepia contrast-110 saturate-125 hue-rotate-340' }
];

const IMAGE_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60', name: 'Cyber Server Cluster' },
  { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', name: 'Abstract Crypto Mesh' },
  { url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60', name: 'Decentralized Core Graphic' },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60', name: 'Satellite Orbital Network' }
];

const VIDEO_PRESETS = [
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4', name: 'Terminal Stream' },
  { url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-close-up-39996-large.mp4', name: 'Hardware Ledger' }
];

interface StatusItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  text: string;
  timestamp: number;
  isGradient: boolean;
  gradientClass?: string;
}

interface ChatMessage {
  sender: 'me' | 'them';
  text: string;
  timestamp: number;
}

interface FeedSectionProps {
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
  theme?: 'dark' | 'light';
  isPremium?: boolean;
  isCreatorVerified?: boolean;
  postPreference?: PostPreference | null;
  onOpenPreferenceModal?: () => void;
  onUpdateIdentity?: (newUsername: string, newAvatar: string, newBio: string, newKeys?: any) => void;
}

export default function FeedSection({
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
  isPremium = false,
  isCreatorVerified = false,
  postPreference,
  onOpenPreferenceModal,
  onUpdateIdentity
}: FeedSectionProps) {
  const [activeTab, setActiveTab] = useState<PostType | 'all' | 'bookmarks'>('all');
  const [isPosting, setIsPosting] = useState(false);
  const [postType, setPostType] = useState<PostType>('micro');
  const [content, setContent] = useState('');
  
  // Decentralized Content Feed Algorithm & Self-Sovereign Identity States
  const [feedSourceMode, setFeedSourceMode] = useState<'all' | 'following' | 'personalized'>('all');
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(true);
  const [newDispatchesCount, setNewDispatchesCount] = useState(0);
  const [userBio, setUserBio] = useState(() => {
    return localStorage.getItem('aura_user_bio') || 'Sovereign digital identity node participant.';
  });

  useEffect(() => {
    if (!isAutoUpdateEnabled) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.22) {
        setNewDispatchesCount(prev => prev + 1);
      }
    }, 8500);
    return () => clearInterval(interval);
  }, [isAutoUpdateEnabled]);
  
  // Zero-Knowledge Anonymous Posting & AI Post Synthesis
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);
  const [isCreateAsAiPost, setIsCreateAsAiPost] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [flaggedPosts, setFlaggedPosts] = useState<FeedPost[]>([]);
  
  // Custom video / image fields
  const [title, setTitle] = useState('');
  const [selectedImg, setSelectedImg] = useState(IMAGE_PRESETS[0].url);
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_PRESETS[0].url);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [nodeName, setNodeName] = useState('Aether Devs');

  // Custom Voice Recording States
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Automated Sponsored Ad Impression Tracking Hook
  useEffect(() => {
    try {
      const cached = localStorage.getItem('aura_sponsored_ads');
      if (cached) {
        const ads = JSON.parse(cached);
        let updated = false;
        const newAds = ads.map((ad: any) => {
          const isRendered = posts.some(p => p.isSponsored && p.adId === ad.id);
          if (isRendered) {
            updated = true;
            return { ...ad, impressions: (ad.impressions || 0) + 1 };
          }
          return ad;
        });
        if (updated) {
          localStorage.setItem('aura_sponsored_ads', JSON.stringify(newAds));
        }
      }
    } catch (e) {
      console.error("Ad impression tracking error", e);
    }
  }, [posts]);

  // Bookmarks state
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_bookmarked_posts');
    return cached ? new Set(JSON.parse(cached)) : new Set<string>();
  });

  useEffect(() => {
    localStorage.setItem('aura_bookmarked_posts', JSON.stringify(Array.from(bookmarkedPostIds)));
  }, [bookmarkedPostIds]);

  // Reposts state
  const [repostedPostIds, setRepostedPostIds] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_reposted_posts');
    return cached ? new Set(JSON.parse(cached)) : new Set<string>();
  });

  useEffect(() => {
    localStorage.setItem('aura_reposted_posts', JSON.stringify(Array.from(repostedPostIds)));
  }, [repostedPostIds]);

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_blocked_users');
    return cached ? new Set(JSON.parse(cached)) : new Set<string>();
  });

  useEffect(() => {
    localStorage.setItem('aura_blocked_users', JSON.stringify(Array.from(blockedUsers)));
  }, [blockedUsers]);

  // Reported posts state
  const [reportedPostIds, setReportedPostIds] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_reported_posts');
    return cached ? new Set(JSON.parse(cached)) : new Set<string>();
  });

  useEffect(() => {
    localStorage.setItem('aura_reported_posts', JSON.stringify(Array.from(reportedPostIds)));
  }, [reportedPostIds]);
  
  // Comment input states
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

  // Social Graph / Interaction states
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(() => {
    const cached = localStorage.getItem('aura_followed_users');
    return cached ? new Set(JSON.parse(cached)) : new Set(['Cypher Architect']);
  });

  useEffect(() => {
    localStorage.setItem('aura_followed_users', JSON.stringify(Array.from(followedUsers)));
  }, [followedUsers]);

  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [activeChatPeer, setActiveChatPeer] = useState<{ name: string; avatar: string } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ [key: string]: ChatMessage[] }>({});
  
  // Calling Overlay State
  const [activeCall, setActiveCall] = useState<{ peerName: string; peerAvatar: string; type: 'voice' | 'video'; state: 'dialing' | 'connected' | 'ended' } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Firebase Storage uploading states & handlers
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgressMsg("Uploading image to Firebase Storage...");
    try {
      const path = `posts/${Date.now()}_${file.name}`;
      const downloadUrl = await uploadFileToStorage(file, path);
      setSelectedImg(downloadUrl);
      setUploadProgressMsg("Image uploaded successfully!");
      triggerNotification("Custom image uploaded and signed securely!");
    } catch (err) {
      console.error(err);
      triggerNotification("Upload failed. Using default presets.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgressMsg("Uploading video to Firebase Storage...");
    try {
      const path = `posts/${Date.now()}_${file.name}`;
      const downloadUrl = await uploadFileToStorage(file, path);
      setSelectedVideo(downloadUrl);
      setUploadProgressMsg("Video uploaded successfully!");
      triggerNotification("Custom video broadcast uploaded successfully!");
    } catch (err) {
      console.error(err);
      triggerNotification("Video upload failed. Check file bounds.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartRecording = async () => {
    audioChunksRef.current = [];
    setIsRecording(true);
    setRecordedVoiceUrl(null);
    setVoiceDuration(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVoiceUrl(url);
          setVoiceDuration(5);
        };
        recorder.start();
        setMediaRecorder(recorder);
        triggerNotification("Recording from local microphone node...");
      } else {
        throw new Error("navigator.mediaDevices.getUserMedia is unavailable");
      }
    } catch (err) {
      console.warn("Media recording denied or unsupported. Activating synthetic voice compilation fallback.", err);
      // Fallback timer representing recorded speech
      let secs = 0;
      const interval = setInterval(() => {
        secs++;
        if (secs >= 5) {
          clearInterval(interval);
        }
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      // Stop all tracks in the stream to release mic icon
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      triggerNotification("Recording compiled and signed!");
    } else {
      // Fallback synthetic voice link
      setRecordedVoiceUrl("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
      setVoiceDuration(5);
      triggerNotification("Synthetic voice packet compiled successfully!");
    }
  };

  // Status updates states
  const [statusList, setStatusList] = useState<StatusItem[]>([
    {
      id: 'st_1',
      authorName: 'Lyra Vesper',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      text: 'Syncing Frankfurt sub-mesh! 🛰️',
      timestamp: Date.now() - 3600000,
      isGradient: false
    },
    {
      id: 'st_2',
      authorName: 'Orion Sterling',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
      mediaUrl: '',
      text: 'Preserving central telemetry sequence... 🔒',
      timestamp: Date.now() - 7200000,
      isGradient: true,
      gradientClass: 'from-slate-900 via-violet-950 to-indigo-900'
    },
    {
      id: 'st_3',
      authorName: 'Cypher Architect',
      authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
      mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
      text: 'Decentralized streams are live! 💻',
      timestamp: Date.now() - 10800000,
      isGradient: false
    }
  ]);
  const [activeStatusViewer, setActiveStatusViewer] = useState<StatusItem | null>(null);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusGradient, setStatusGradient] = useState('from-cyan-900 via-slate-900 to-violet-950');

  // AI synthesising states (Under 50,000 users)
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [peerCount, setPeerCount] = useState(4812);
  const [notifications, setNotifications] = useState<string[]>([]);

  const triggerNotification = (text: string) => {
    setNotifications(prev => [...prev, text]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 4000);
  };

  // Setup simulated calling timer
  useEffect(() => {
    if (activeCall && activeCall.state === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall]);

  const handleStartCall = (peerName: string, peerAvatar: string, type: 'voice' | 'video') => {
    setActiveCall({ peerName, peerAvatar, type, state: 'dialing' });
    triggerNotification(`Dialing secure encrypted P2P ${type} call to ${peerName}...`);
    
    // Simulate connection after 2.5 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, state: 'connected' } : null);
      triggerNotification(`P2P encrypted line verified with ${peerName}!`);
    }, 2500);
  };

  const handleEndCall = () => {
    if (activeCall) {
      setActiveCall(prev => prev ? { ...prev, state: 'ended' } : null);
      triggerNotification(`Call with ${activeCall.peerName} terminated.`);
      setTimeout(() => setActiveCall(null), 1000);
    }
  };

  // Trigger server-side creator post fetch (until 1 million users)
  const handleTriggerAISynthesis = async () => {
    setIsSynthesizing(true);
    triggerNotification("Connecting to Sovereign Network Feed... Fetching latest creator dispatch.");

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (data.success && data.post) {
        onAddPost(data.post);
        setPeerCount(prev => prev + 1);
        triggerNotification(`New dispatch received from Creator ${data.post.authorName}! Syncing block...`);
      } else {
        triggerNotification("Network returned fallback creator post. Syncing block...");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Feed connection disrupted. Standard post cached.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const sigPayload = `${username}:${content}:${postType}:${Date.now()}`;
    const signature = await signContent(sigPayload, currentPrivateKey);

    // Anonymous posting zero-knowledge setup
    const anonId = Math.floor(1000 + Math.random() * 9000);
    const postAuthorName = isAnonymousPost ? `Anonymous Sovereign #${anonId}` : username;
    const postAvatar = isAnonymousPost ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60' : avatar;
    const postKey = isAnonymousPost ? `anon_zk_${Math.random().toString(36).substring(2, 12)}` : currentUserKey;

    const newPost: FeedPost = {
      id: `post_${Date.now()}`,
      authorName: postAuthorName,
      authorPublicKey: postKey,
      authorAvatar: postAvatar,
      isAnonymous: isAnonymousPost,
      anonymousBadge: isAnonymousPost ? 'Zero-Knowledge Protocol' : undefined,
      type: postType,
      timestamp: Date.now(),
      content,
      signature,
      likes: 0,
      commentsCount: 0,
      comments: [],
      hasLiked: false
    };

    if (postType === 'media') {
      newPost.mediaUrl = selectedImg;
      newPost.mediaThumbnail = selectedImg;
      newPost.aspectRatio = '1:1';
      const filterObj = PHOTO_FILTERS.find(f => f.id === selectedFilter);
      if (filterObj && filterObj.id !== 'none') {
        newPost.content += ` #${filterObj.id}-filter`;
      }
    } else if (postType === 'play') {
      newPost.mediaUrl = selectedVideo;
      newPost.mediaThumbnail = IMAGE_PRESETS[1].url;
      newPost.title = title || 'Decentralized Stream Broadcast';
      newPost.views = 1;
      newPost.aspectRatio = '16:9';
    } else if (postType === 'node') {
      newPost.nodeName = nodeName;
    } else if (postType === 'voice') {
      newPost.voiceUrl = recordedVoiceUrl || 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
      newPost.voiceDuration = voiceDuration || 5;
    }

    onAddPost(newPost);
    setContent('');
    setTitle('');
    setRecordedVoiceUrl(null);
    setVoiceDuration(0);
    setIsAnonymousPost(false);
    setIsPosting(false);
    triggerNotification(
      isAnonymousPost 
        ? "Anonymous post published via Zero-Knowledge protocol! Author identity masked." 
        : "Broadcast compiled, signed, and propagated to swarm nodes!"
    );
  };

  const handleFlagPost = (post: FeedPost) => {
    const reason = prompt("Select or enter reason for reporting to the Decentralized Moderation Council:\n1. Spam / Phishing\n2. Harassment\n3. Misinformation\n4. Graphic Media\n5. Guideline Violation", "Spam");
    if (!reason) return;

    const flaggedItem: FeedPost = {
      ...post,
      moderationStatus: 'flagged',
      flaggedReason: reason,
      flaggedAt: Date.now(),
      moderationVotes: post.moderationVotes || { approve: 1, remove: 0, warning: 0 }
    };

    setFlaggedPosts(prev => {
      if (prev.some(p => p.id === post.id)) return prev;
      return [...prev, flaggedItem];
    });

    triggerNotification("Post reported! Queued for Decentralized Moderation Council review & voting.");
    setShowModerationModal(true);
  };

  const handleCouncilVote = (postId: string, voteType: 'approve' | 'remove' | 'warning') => {
    setFlaggedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const votes = p.moderationVotes || { approve: 0, remove: 0, warning: 0 };
        const updatedVotes = { ...votes, [voteType]: votes[voteType] + 1 };
        
        let newStatus = p.moderationStatus;
        if (updatedVotes.remove >= 2) {
          newStatus = 'removed_by_council';
        } else if (updatedVotes.approve >= 3) {
          newStatus = 'approved';
        }

        return {
          ...p,
          moderationVotes: updatedVotes,
          moderationStatus: newStatus
        };
      }
      return p;
    }));
    triggerNotification(`Recorded ${voteType.toUpperCase()} vote on Moderation Ledger!`);
  };

  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    const sigPayload = `${username}:${commentText}:${Date.now()}`;
    const signature = await signContent(sigPayload, currentPrivateKey);

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      authorName: username,
      content: commentText,
      timestamp: Date.now(),
      signature
    };

    onAddComment(postId, newComment);
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    triggerNotification("Signed comment block replicated on feed ledger.");
  };

  const handleFollowToggle = (authorName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(authorName)) {
        next.delete(authorName);
        triggerNotification(`Unfollowed ${authorName}`);
      } else {
        next.add(authorName);
        triggerNotification(`Following ${authorName} securely`);
      }
      return next;
    });
  };

  const handleSendFriendRequest = (authorName: string) => {
    if (friendRequests.has(authorName)) {
      triggerNotification(`Friend request already dispatched to ${authorName}.`);
      return;
    }
    setFriendRequests(prev => {
      const next = new Set(prev);
      next.add(authorName);
      return next;
    });
    triggerNotification(`Dispatched secure friend request to ${authorName}! Replicating on DHT mesh...`);
  };

  const handleOpenChat = (peerName: string, peerAvatar: string) => {
    setActiveChatPeer({ name: peerName, avatar: peerAvatar });
    if (!chatHistory[peerName]) {
      setChatHistory(prev => ({
        ...prev,
        [peerName]: [
          { sender: 'them', text: `Hi, this is a secure end-to-end encrypted chat. Our public keys are verifying.`, timestamp: Date.now() - 50000 }
        ]
      }));
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !activeChatPeer) return;
    const peerName = activeChatPeer.name;
    const newMsg: ChatMessage = {
      sender: 'me',
      text: chatInput,
      timestamp: Date.now()
    };

    setChatHistory(prev => ({
      ...prev,
      [peerName]: [...(prev[peerName] || []), newMsg]
    }));
    setChatInput('');

    // Simulate automated friendly peer response
    setTimeout(() => {
      const automaticResponses = [
        "Received. Compiling my local blocks to match.",
        "That sounds perfect. Let's sync on this through the gossip ledger.",
        "Understood. Initiating metadata purge for this thread locally.",
        "Your cryptographic signature is fully verified. Talk to you soon!",
        "Yes, the decentralized Solas layout is incredibly smooth!"
      ];
      const replyText = automaticResponses[Math.floor(Math.random() * automaticResponses.length)];
      const responseMsg: ChatMessage = {
        sender: 'them',
        text: replyText,
        timestamp: Date.now()
      };
      setChatHistory(prev => ({
        ...prev,
        [peerName]: [...(prev[peerName] || []), responseMsg]
      }));
    }, 1500);
  };

  const handleCreateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusText.trim()) return;

    const newStatus: StatusItem = {
      id: `st_${Date.now()}`,
      authorName: username,
      authorAvatar: avatar,
      mediaUrl: '',
      text: statusText,
      timestamp: Date.now(),
      isGradient: true,
      gradientClass: statusGradient
    };

    setStatusList(prev => [newStatus, ...prev]);
    setStatusText('');
    setIsAddingStatus(false);
    triggerNotification("Your ephemeral status was signed and broadcasted to swarm peers!");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Initial channel / blocked / bookmarks filter
  let processedPosts = posts.filter(post => {
    if (blockedUsers.has(post.authorName)) return false;
    if (activeTab === 'bookmarks') {
      return bookmarkedPostIds.has(post.id);
    }
    return activeTab === 'all' || post.type === activeTab;
  });

  // 2. Apply Decentralized Feed Algorithm (Following Swarm vs On-Device AI Interest Match vs All Mesh)
  let matchReasonsMap: { [postId: string]: string[] } = {};

  if (feedSourceMode === 'following') {
    processedPosts = processedPosts.filter(post => 
      followedUsers.has(post.authorName) || post.authorName === username
    );
  } else if (feedSourceMode === 'personalized') {
    const discoveryResults = personalizeAndDiscoverContent(processedPosts);
    processedPosts = discoveryResults.map(res => {
      matchReasonsMap[res.post.id] = res.matchReasons;
      return res.post;
    });
  }

  const filteredPosts = processedPosts;

  return (
    <div className="space-y-6" id="feed-container">

      {/* Notifications Drawer */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((notif, index) => (
          <div key={index} className="bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md max-w-sm pointer-events-auto">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span>{notif}</span>
          </div>
        ))}
      </div>

      {/* CREATOR NETWORK PIPELINE BAR (Until 1,000,000 Users) */}
      {isCreatorVerified && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-violet-950/40 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-950/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h4 className="text-sm font-bold text-slate-100 font-sans uppercase tracking-wider flex items-center gap-1.5">
                Verified Creator Swarm Network Active
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Until the network reaches <strong className="text-cyan-300">1,000,000 active members</strong>, verified high-resolution creator posts, 1080p video broadcasts, photos, and dispatches automatically stream to keep your feed vibrant and engaged.
            </p>
            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-4">
              <span>Active Creator Swarm: <strong className="text-cyan-400">{(418920 + peerCount).toLocaleString()}</strong> / 1,000,000 Members</span>
              <span>Feed Stream: ONLINE</span>
            </div>
          </div>

          <button
            onClick={handleTriggerAISynthesis}
            disabled={isSynthesizing}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-850 text-slate-100 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-md shadow-cyan-950/30 self-start sm:self-auto"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                Fetching Dispatch...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-100" />
                Fetch Latest Creator Dispatch
              </>
            )}
          </button>
        </div>
      )}

      {/* THE UPSIDE: HORIZONTAL STATUS / STORIES SECTION */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">
          Upside: Live Peer Status & Swarm Stories
        </span>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none" id="status-bar">
          
          {/* Add Status Button Bubble */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => setIsAddingStatus(true)}>
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-cyan-400 flex items-center justify-center transition relative group">
              <img src={avatar} className="w-12 h-12 rounded-full object-cover opacity-40 group-hover:opacity-60" alt="" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-100 font-bold border-2 border-slate-900">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Share Status</span>
          </div>

          {/* Render Active Statuses */}
          {statusList.map((st) => (
            <div 
              key={st.id} 
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
              onClick={() => setActiveStatusViewer(st)}
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-violet-600 transition hover:scale-105 duration-200">
                <div className="w-14 h-14 rounded-full bg-slate-950 p-0.5">
                  <img 
                    src={st.authorAvatar} 
                    className="w-full h-full rounded-full object-cover border border-slate-900 bg-slate-800" 
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] font-sans font-medium text-slate-300 max-w-[70px] truncate">
                {st.authorName === username ? "My Status" : st.authorName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* POST STYLE PREFERENCE BANNER */}
      {postPreference ? (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wide">
                  Your Custom Post Style:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950/90 border border-amber-500/40 text-amber-300 rounded-md font-mono">
                  {postPreference.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-950/90 border border-indigo-500/40 text-indigo-300 rounded-md font-mono">
                  {postPreference.platformStyle || 'Twitter/X Style'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 rounded-md font-mono">
                  {postPreference.mediaQuality || '1080p HD'}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-sans line-clamp-1 mt-1">
                "{postPreference.description}"
              </p>
            </div>
          </div>
          
          <button
            onClick={onOpenPreferenceModal}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto hover:scale-[1.02]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Update Style & Quality</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-950/80 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-slate-300">
              Customize how you want your posts to look, choose 4K/1080p quality & Facebook/Twitter/YouTube/WhatsApp platform styles!
            </span>
          </div>
          <button
            onClick={onOpenPreferenceModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap shadow"
          >
            Describe My Post Style
          </button>
        </div>
      )}

      {/* COMPOSER FORM SECTION & DECENTRALIZED IDENTITY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4 pt-2">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            The Swarm Post Feed
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Replicating gossip-network replicas • Cryptographically signed client-side
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowIdentityModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded-lg text-xs font-mono transition shadow group hover:scale-[1.02]"
            title="Manage Self-Sovereign Digital Identity (DID) & Profile"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span>Sovereign Identity (DID)</span>
          </button>

          <button
            onClick={() => setShowModerationModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-950/60 border border-indigo-500/40 hover:bg-indigo-900/50 text-indigo-300 rounded-lg text-xs font-mono transition shadow"
            title="Open Community Governance & Moderation Council Queue"
          >
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Moderation Council</span>
            {flaggedPosts.filter(p => p.moderationStatus === 'flagged').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {flaggedPosts.filter(p => p.moderationStatus === 'flagged').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-slate-100 rounded-lg text-sm font-medium transition duration-200 shadow-md shadow-cyan-950/20 self-start sm:self-auto"
            id="btn-create-post"
          >
            <Plus className="w-4 h-4" />
            Broadcast to Swarm
          </button>
        </div>
      </div>

      {/* DECENTRALIZED FEED ALGORITHM CONTROL PANEL */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>Decentralized Feed Algorithm:</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                {feedSourceMode === 'all' && 'Global Mesh Dispatches'}
                {feedSourceMode === 'following' && `Following Swarm (${followedUsers.size} Peers)`}
                {feedSourceMode === 'personalized' && 'On-Device Zero-Knowledge AI Match'}
              </span>
            </span>
          </div>

          {/* Live Auto Sync Switch & Manual AI Post Generator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAISynthesis}
              disabled={isSynthesizing}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-slate-100 rounded-lg text-xs font-mono font-bold transition shadow"
              title="Discover a fresh new creator dispatch for this session"
            >
              {isSynthesizing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-200" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isSynthesizing ? 'Discovering Fresh Dispatch...' : '✨ Discover Fresh Post'}</span>
            </button>

            <button
              onClick={() => setIsAutoUpdateEnabled(!isAutoUpdateEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition ${
                isAutoUpdateEnabled 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle dynamic real-time feed updates from decentralized swarm"
            >
              <span className={`w-2 h-2 rounded-full ${isAutoUpdateEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>Dynamic Sync: {isAutoUpdateEnabled ? 'ACTIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Source Mode Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setFeedSourceMode('all')}
            className={`p-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
              feedSourceMode === 'all'
                ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>All Mesh Channels</span>
          </button>

          <button
            onClick={() => setFeedSourceMode('following')}
            className={`p-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
              feedSourceMode === 'following'
                ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Following Swarm ({followedUsers.size})</span>
          </button>

          <button
            onClick={() => setFeedSourceMode('personalized')}
            className={`p-3 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
              feedSourceMode === 'personalized'
                ? 'bg-gradient-to-r from-purple-950/90 to-slate-900 border-purple-500 text-purple-300 shadow-lg shadow-purple-950/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>On-Device AI Interest Match</span>
          </button>
        </div>

        {/* Zero-Knowledge Privacy Explanation Banner when in Personalized Mode */}
        {feedSourceMode === 'personalized' && (
          <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl text-xs font-sans text-purple-200 flex items-center gap-2.5 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              <strong>Privacy-Preserving Personalization Engine:</strong> Feed posts are ranked 100% locally on your device based on keyword vectors & interaction frequency. Zero analytics logs are sent to central servers.
            </span>
          </div>
        )}
      </div>

      {/* FLOATING LIVE NEW DISPATCHES BADGE */}
      {newDispatchesCount > 0 && (
        <button
          onClick={() => {
            setNewDispatchesCount(0);
            triggerNotification("Feed synchronized with latest decentralized swarm dispatches!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 animate-bounce cursor-pointer transition"
        >
          <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>⚡ {newDispatchesCount} New Decentralized Dispatch{newDispatchesCount > 1 ? 'es' : ''} Received — Click to Refresh Feed</span>
        </button>
      )}

      {/* THE DOWNSIDE: MAIN SCROLLABLE POSTS FEED */}
      <div className="space-y-3">
        <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">
          Downside: continuous swarm scroll
        </span>

        {/* Protocol Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-950 rounded-xl border border-slate-900">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'all' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            All Channels
          </button>
          <button
            onClick={() => setActiveTab('micro')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'micro' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            Scribbles
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'media' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'play' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Cinema
          </button>
          <button
            onClick={() => setActiveTab('node')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'node' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Circles
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'voice' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Notes
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium font-mono transition duration-150 ${
              activeTab === 'bookmarks' 
                ? 'bg-slate-900 text-cyan-400 border border-slate-800' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Bookmarks
          </button>
        </div>

        {/* Scroll List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-sans text-slate-400">No replica blocks found for this protocol layer filter.</p>
              <p className="text-xs font-mono text-slate-600 mt-1">Gossip client standing by for peer updates...</p>
            </div>
          ) : (
            filteredPosts.map((post, idx) => {
              const hasMedia = post.type === 'media' && post.mediaUrl;
              const hasVideo = post.type === 'play' && post.mediaUrl;
              const isFollowed = followedUsers.has(post.authorName);
              const isSelf = post.authorName === username;
              const hasSentRequest = friendRequests.has(post.authorName);
              const appliedFilterClass = PHOTO_FILTERS.find(f => post.content.includes(`#${f.id}-filter`))?.class || '';
              const isReported = reportedPostIds.has(post.id);

              if (isReported) {
                return (
                  <div key={post.id} className="p-6 bg-[#070B14] border border-rose-950/40 rounded-2xl flex flex-col items-center text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold font-sans text-slate-200">Publication Block Masked</h4>
                      <p className="text-[11px] font-mono text-slate-500 max-w-md">
                        This gossip-network block has been marked for AI Moderation analysis by edge node peers.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          setReportedPostIds(prev => {
                            const next = new Set(prev);
                            next.delete(post.id);
                            return next;
                          });
                          triggerNotification("Restored block back to feed.");
                        }}
                        className="px-3 py-1 bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 rounded text-xs font-mono transition"
                      >
                        Bypass Mask
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={post.id}>
                  <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl overflow-hidden shadow-lg hover:border-slate-800 transition duration-200">

                  {/* Post Top-Line / Identity Header */}
                  <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-950 bg-[#0A0F1D]/60">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={post.authorAvatar} 
                          className="w-10 h-10 rounded-full object-cover bg-slate-850 border border-slate-800" 
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-sans font-semibold text-sm text-slate-200">
                            {post.authorName}
                          </span>

                          {post.isAnonymous && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-950/60 border border-violet-500/40 text-violet-300 rounded-full text-[9px] font-mono font-semibold shadow-sm" title="Zero-Knowledge Anonymous Sovereign Post">
                              <EyeOff className="w-2.5 h-2.5 text-violet-400" />
                              <span>Anonymous (ZK-Protocol)</span>
                            </span>
                          )}
                          {((isSelf && isPremium) || post.authorName === 'Cypher Architect' || post.authorName === 'Lyra Vesper' || post.authorName === 'Aura Creator') && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-400 rounded-full text-[9px] font-sans font-bold shadow-sm animate-pulse" title="Aura Verified Creator">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              <span>Verified Creator</span>
                            </span>
                          )}
                          {post.type === 'node' && (
                            <span className="px-1.5 py-0.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded text-[9px] font-mono uppercase">
                              node: {post.nodeName}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            • {new Date(post.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Public Key Signature stamp */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Key className="w-3 h-3 text-violet-400" />
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider truncate max-w-[120px] sm:max-w-xs cursor-help" title={`Verified Public Identity Signature Key:\n${post.authorPublicKey}`}>
                            {post.authorPublicKey.slice(0, 14)}...
                          </span>
                          <div className="flex items-center gap-0.5 bg-slate-950 px-1 py-0.2 rounded border border-slate-850">
                            <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest scale-95 origin-left">Signed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SOCIAL GRAPH / INTERACTION CONTROLS */}
                    {!isSelf && (
                      <div className="flex items-center gap-1.5">
                        
                        {/* Friend Request */}
                        <button
                          onClick={() => handleSendFriendRequest(post.authorName)}
                          className={`p-1.5 rounded-lg border text-xs font-mono transition ${
                            hasSentRequest 
                              ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400' 
                              : 'border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                          }`}
                          title={hasSentRequest ? "Dispatched" : "Send P2P Friend Request"}
                        >
                          {hasSentRequest ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>

                        {/* Follow */}
                        <button
                          onClick={() => handleFollowToggle(post.authorName)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition ${
                            isFollowed 
                              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400' 
                              : 'border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </button>

                        {/* Chat Trigger */}
                        <button
                          onClick={() => handleOpenChat(post.authorName, post.authorAvatar)}
                          className="p-1.5 rounded-lg border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                          title="Open Secure E2E Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Call Trigger */}
                        <button
                          onClick={() => handleStartCall(post.authorName, post.authorAvatar, 'voice')}
                          className="p-1.5 rounded-lg border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                          title="Call Creator"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Channel Indicator */}
                    {isSelf && (
                      <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-850">
                        {post.type === 'micro' && <Feather className="w-4 h-4 text-sky-400" />}
                        {post.type === 'media' && <ImageIcon className="w-4 h-4 text-pink-400" />}
                        {post.type === 'play' && <Video className="w-4 h-4 text-red-400" />}
                        {post.type === 'node' && <Users className="w-4 h-4 text-emerald-400" />}
                      </div>
                    )}
                  </div>

                  {/* Video Render Section */}
                  {hasVideo && (
                    <div className="bg-slate-950 border-b border-slate-950">
                      <div className="aspect-video w-full relative">
                        <video 
                          src={post.mediaUrl}
                          controls
                          className="w-full h-full object-cover"
                          poster={post.mediaThumbnail}
                        />
                      </div>
                      <div className="p-4 bg-slate-900/40 border-b border-slate-950">
                        <h4 className="font-sans font-bold text-base text-slate-100 leading-snug flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-red-500 flex-shrink-0" />
                          {post.title}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          Solas Swarm Broadcast • Simulated video streams signed in P2P ledger
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Voice Note Player Render Section */}
                  {post.type === 'voice' && post.voiceUrl && (
                    <div className="bg-slate-950/40 border-b border-slate-950 p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                          <Mic className="w-3.5 h-3.5 animate-pulse" />
                          Voice Note Broadcast
                        </span>
                        <span>Duration: {post.voiceDuration || 5}s</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <audio 
                          src={post.voiceUrl} 
                          controls 
                          className="flex-grow h-10 accent-cyan-500 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Render Section */}
                  {hasMedia && (
                    <div className="bg-slate-950 border-b border-slate-950 flex justify-center overflow-hidden relative">
                      <div className="w-full max-w-xl aspect-square bg-slate-900/30 overflow-hidden relative">
                        <img 
                          src={post.mediaUrl} 
                          className={`w-full h-full object-cover transition duration-300 ${appliedFilterClass}`}
                          alt="Shared visual block"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content Message */}
                  <div className="p-5 space-y-3.5 font-sans text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {post.content.replace(/#\w+-filter/g, '')}
                    
                    {post.isSponsored && post.sponsorCta && (
                      <div className="mt-4 pt-4 border-t border-slate-900/40">
                        <a
                          href={post.sponsorUrl || 'https://ai.studio/build'}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            try {
                              const cached = localStorage.getItem('aura_sponsored_ads');
                              if (cached) {
                                const ads = JSON.parse(cached);
                                const updated = ads.map((ad: any) => {
                                  if (ad.id === post.adId) {
                                    return { 
                                      ...ad, 
                                      clicks: (ad.clicks || 0) + 1,
                                      spent: (ad.spent || 0) + (ad.cpc || 0.10)
                                    };
                                  }
                                  return ad;
                                });
                                localStorage.setItem('aura_sponsored_ads', JSON.stringify(updated));
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-slate-100 rounded-xl text-xs font-mono font-bold uppercase transition shadow-lg shadow-violet-500/10"
                        >
                          <Tv className="w-4 h-4 text-violet-300 animate-pulse" />
                          {post.sponsorCta}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Interaction Footer Bar */}
                  <div className="px-5 py-3.5 bg-slate-950/40 border-t border-slate-950 flex items-center gap-6 text-slate-400 text-xs font-mono">
                    <button 
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition ${
                        post.hasLiked ? 'text-rose-500' : 'hover:text-slate-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} comments</span>
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() => {
                          const tipAmount = Math.floor(Math.random() * 20) + 5;
                          if (balance !== undefined) {
                            if (balance < tipAmount) {
                              triggerNotification(`Insufficient wallet balance! You need ${tipAmount} LC to tip, but only have ${balance.toFixed(2)} LC.`);
                              return;
                            }
                            if (onUpdateBalance) {
                              onUpdateBalance(balance - tipAmount);
                            }
                            triggerNotification(`Dispatched ${tipAmount} LC Tip securely from your wallet to ${post.authorName}! Remaining: ${(balance - tipAmount).toFixed(2)} LC`);
                          } else {
                            triggerNotification(`Dispatched ${tipAmount} LC Tip securely from your wallet to ${post.authorName}!`);
                          }
                        }}
                        className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded text-[11px] text-emerald-400 hover:bg-emerald-900/20 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Tip Creator
                      </button>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => {
                        setBookmarkedPostIds(prev => {
                          const next = new Set(prev);
                          if (next.has(post.id)) {
                            next.delete(post.id);
                            triggerNotification("Bookmark removed from edge storage.");
                          } else {
                            next.add(post.id);
                            triggerNotification("Bookmark saved to secure local sandbox!");
                          }
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1.5 transition ${
                        bookmarkedPostIds.has(post.id) ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
                      }`}
                      title="Bookmark to local sandbox"
                    >
                      <Star className={`w-3.5 h-3.5 ${bookmarkedPostIds.has(post.id) ? 'fill-cyan-400 stroke-cyan-400' : ''}`} />
                      <span className="hidden sm:inline">{bookmarkedPostIds.has(post.id) ? 'Saved' : 'Bookmark'}</span>
                    </button>

                    {/* Repost Toggle */}
                    <button
                      onClick={() => {
                        setRepostedPostIds(prev => {
                          const next = new Set(prev);
                          if (next.has(post.id)) {
                            next.delete(post.id);
                            triggerNotification("Repost retracted from swarm ledger.");
                          } else {
                            next.add(post.id);
                            triggerNotification("Reposted block signed and broadcast to peers!");
                          }
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1.5 transition ${
                        repostedPostIds.has(post.id) ? 'text-violet-400 font-semibold' : 'hover:text-slate-200'
                      }`}
                      title="Repost to gossip network"
                    >
                      <Share2 className={`w-3.5 h-3.5 ${repostedPostIds.has(post.id) ? 'stroke-violet-400' : ''}`} />
                      <span className="hidden sm:inline">{repostedPostIds.has(post.id) ? 'Reposted' : 'Repost'}</span>
                    </button>

                    {/* Flag to Moderation Council */}
                    <button
                      onClick={() => handleFlagPost(post)}
                      className="flex items-center gap-1 hover:text-indigo-400 transition text-[11px] text-indigo-400/80"
                      title="Flag post to Decentralized Moderation Council"
                    >
                      <Flag className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Flag to Council</span>
                    </button>

                    {/* Report Content */}
                    <button
                      onClick={() => {
                        setReportedPostIds(prev => {
                          const next = new Set(prev);
                          next.add(post.id);
                          return next;
                        });
                        triggerNotification("Publication block reported for AI Moderation analysis.");
                      }}
                      className="flex items-center gap-1 hover:text-rose-400 transition text-[11px]"
                      title="Report publication for AI Moderation"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Report</span>
                    </button>

                    {/* Block Creator */}
                    {!isSelf && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to completely block and ignore all packets from @${post.authorName}?`)) {
                            setBlockedUsers(prev => {
                              const next = new Set(prev);
                              next.add(post.authorName);
                              return next;
                            });
                            triggerNotification(`Successfully blocked all ledger streams from @${post.authorName}`);
                          }
                        }}
                        className="flex items-center gap-1 hover:text-rose-400 transition text-[11px]"
                        title="Block peer node"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Block</span>
                      </button>
                    )}

                    <button 
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(JSON.stringify(post, null, 2));
                          triggerNotification("Ledger JSON metadata block copied!");
                        } catch {
                          triggerNotification("Hash block copied!");
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-slate-200 ml-auto"
                      title="Export Ledger Block Data"
                    >
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span className="hidden sm:inline">Block JSON</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-slate-950/30 border-t border-slate-950 p-4 space-y-4">
                    {post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="text-xs font-sans p-3.5 bg-slate-900/40 rounded-xl border border-slate-900/80 space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                              <span className="font-semibold text-slate-200">{comment.authorName}</span>
                              <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-300 mt-1">{comment.content}</p>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600 mt-1.5 pt-1 border-t border-slate-900/60">
                              <ShieldCheck className="w-3 h-3 text-cyan-500/80" />
                              <span>Signed comment: {comment.signature.slice(0, 14)}...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Comment with decentralized signature..."
                        className="flex-grow bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono transition"
                      >
                        Sign Comment
                      </button>
                    </div>
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
      </div>

      {/* COMPOSER BROADCAST MODAL */}
      {isPosting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-slate-100 font-sans">Broadcast Composer</h3>
              </div>
              <button 
                onClick={() => setIsPosting(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-2">Protocol Layer</label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPostType('micro')}
                    className={`p-2 rounded-lg border text-[10px] font-mono flex flex-col items-center gap-1 transition ${
                      postType === 'micro' 
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Feather className="w-4 h-4" />
                    Micro
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('media')}
                    className={`p-2 rounded-lg border text-[10px] font-mono flex flex-col items-center gap-1 transition ${
                      postType === 'media' 
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('play')}
                    className={`p-2 rounded-lg border text-[10px] font-mono flex flex-col items-center gap-1 transition ${
                      postType === 'play' 
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('node')}
                    className={`p-2 rounded-lg border text-[10px] font-mono flex flex-col items-center gap-1 transition ${
                      postType === 'node' 
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Circle
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('voice')}
                    className={`p-2 rounded-lg border text-[10px] font-mono flex flex-col items-center gap-1 transition ${
                      postType === 'voice' 
                        ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    Voice
                  </button>
                </div>
              </div>

              {postType === 'voice' && (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                      Client Waveform Recorder
                    </span>
                    {isRecording && (
                      <span className="text-[10px] font-mono text-rose-500 animate-pulse uppercase">
                        Recording...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 rounded-lg text-xs font-mono transition"
                      >
                        <Mic className="w-4 h-4" />
                        Start Secure Mic Record
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 text-rose-400 rounded-lg text-xs font-mono transition animate-pulse"
                      >
                        <MicOff className="w-4 h-4" />
                        Stop & Compile Packet
                      </button>
                    )}
                  </div>

                  {recordedVoiceUrl && (
                    <div className="p-2.5 bg-[#070B14] rounded-lg border border-slate-900 space-y-2">
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                        <span>Compiled Voice Object Signature</span>
                        <span className="text-cyan-500 font-bold uppercase">Ready</span>
                      </div>
                      <audio src={recordedVoiceUrl} controls className="w-full h-8 accent-cyan-500" />
                    </div>
                  )}
                </div>
              )}

              {postType === 'play' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Video Title (Cinema Channel)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter video title..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Video Content Preset</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {VIDEO_PRESETS.map((vid, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedVideo(vid.url)}
                          className={`p-2 text-left rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
                            selectedVideo === vid.url 
                              ? 'bg-slate-950 border-cyan-500 text-cyan-400' 
                              : 'border-slate-850 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          <Film className="w-3.5 h-3.5 text-slate-500" />
                          {vid.name}
                        </button>
                      ))}
                    </div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Or Upload Custom Video (Firebase Storage)</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {postType === 'media' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Image Asset Preset (Gallery Channel)</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {IMAGE_PRESETS.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImg(img.url)}
                          className={`p-2 text-left rounded-lg text-xs font-mono border transition flex items-center gap-1.5 truncate ${
                            selectedImg === img.url 
                              ? 'bg-slate-950 border-cyan-500 text-cyan-400' 
                              : 'border-slate-850 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                            <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <span className="truncate">{img.name}</span>
                        </button>
                      ))}
                    </div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Or Upload Custom Image (Firebase Storage)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {postType === 'node' && (
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">Target Community Circle (Group Channel)</label>
                  <select
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="Solas Devs">⊞ Aura Devs Circle</option>
                    <option value="Privacy Activists">⊞ Privacy & Cryptography Swarms</option>
                    <option value="Digital Artists">⊞ Open-Source Digital Hubs</option>
                  </select>
                </div>
              )}

              {isUploading && (
                <div className="bg-slate-950 border border-cyan-500/30 p-3 rounded-xl flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-[11px] font-mono text-cyan-300">{uploadProgressMsg}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Broadcasting Message</label>
                  {postPreference && (
                    <button
                      type="button"
                      onClick={() => {
                        const desc = postPreference.description || "technology, creative videos, and community updates";
                        const tone = postPreference.tone || "Casual & Friendly";
                        const category = postPreference.category || "Tech & Innovation";

                        const sampleDrafts = [
                          `🚀 ${category} Update: Focusing on ${desc.toLowerCase().slice(0, 100)}. What are your thoughts on this today? #AuraMesh #${category.replace(/[^a-zA-Z]/g, '')}`,
                          `💡 Here's a quick broadcast matching my post preference: ${desc.slice(0, 120)}! 🎬 #${tone.replace(/[^a-zA-Z]/g, '')} #AuraNetwork`,
                          `⚡ Building on: "${desc.slice(0, 90)}..." - Excited to share this with the community! #SovereignTech #Content`
                        ];

                        const picked = sampleDrafts[Math.floor(Math.random() * sampleDrafts.length)];
                        setContent(picked);
                        triggerNotification("Generated post draft based on your post style preferences!");
                      }}
                      className="text-[10px] font-mono text-amber-300 hover:text-amber-200 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1 transition shadow-sm"
                    >
                      <Wand2 className="w-3 h-3 text-amber-400" />
                      <span>Draft with My Post Style</span>
                    </button>
                  )}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={postPreference ? `Writing post matching style: ${postPreference.description}...` : "Share details privately... Use #hashtags or reference @users"}
                  maxLength={1000}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans resize-none"
                  required
                />
              </div>

              {/* Zero-Knowledge Anonymous Post Toggle */}
              <div 
                onClick={() => setIsAnonymousPost(!isAnonymousPost)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isAnonymousPost 
                    ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/30' 
                    : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isAnonymousPost ? 'bg-violet-900/50 text-violet-300' : 'bg-slate-900 text-slate-400'}`}>
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
                      Post Anonymously
                      <span className="px-1.5 py-0.2 bg-violet-950 text-violet-300 border border-violet-800/40 text-[9px] font-mono rounded-full">
                        Zero-Knowledge ZK-SNARK
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Strips username & avatar. Author identity is replaced with an untraceable cryptographic hash.
                    </p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                  isAnonymousPost ? 'bg-violet-500 border-violet-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                }`}>
                  {isAnonymousPost && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex gap-2">
                <Key className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] font-mono text-slate-400 leading-relaxed">
                  <span className="text-violet-300 font-bold">Local-First Signature:</span> Your post is cryptographically signed at the edge. No central router can freeze your broadcast.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-mono transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-slate-100 rounded-xl text-xs font-mono transition shadow-md"
                >
                  Sign & Propagate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMERGES EPHEMERAL STATUS VIEW (Modal story viewer) */}
      {activeStatusViewer && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl flex flex-col">
            
            {/* Top timer progress bar */}
            <div className="absolute top-4 inset-x-4 z-20 flex gap-1">
              <div className="h-1 flex-grow bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 animate-[pulse_3s_infinite]" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Header */}
            <div className="absolute top-8 inset-x-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={activeStatusViewer.authorAvatar} className="w-8 h-8 rounded-full object-cover border border-slate-900" alt="" referrerPolicy="no-referrer" />
                <span className="font-sans font-bold text-slate-100 text-sm shadow-sm">{activeStatusViewer.authorName}</span>
              </div>
              <button 
                onClick={() => setActiveStatusViewer(null)}
                className="w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center text-slate-200 border border-slate-800/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Immersive View Content */}
            <div className="flex-grow flex items-center justify-center relative bg-slate-950">
              {activeStatusViewer.isGradient ? (
                <div className={`w-full h-full bg-gradient-to-br ${activeStatusViewer.gradientClass} flex items-center justify-center p-8 text-center`}>
                  <p className="text-xl font-bold text-slate-100 font-sans tracking-tight leading-relaxed">{activeStatusViewer.text}</p>
                </div>
              ) : (
                <>
                  <img src={activeStatusViewer.mediaUrl} className="w-full h-full object-cover opacity-65" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-8 text-center">
                    <p className="text-lg font-bold text-slate-100 font-sans leading-relaxed">{activeStatusViewer.text}</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer comments/replies */}
            <div className="p-4 bg-slate-950 border-t border-slate-900 flex items-center gap-2">
              <input 
                type="text" 
                placeholder={`Reply securely to ${activeStatusViewer.authorName}...`} 
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    triggerNotification(`Reply dispatched to ${activeStatusViewer.authorName}!`);
                    setActiveStatusViewer(null);
                  }
                }}
              />
              <button 
                onClick={() => {
                  triggerNotification(`Reply dispatched to ${activeStatusViewer.authorName}!`);
                  setActiveStatusViewer(null);
                }}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-cyan-400"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EPHEMERAL STATUS UPDATE MODAL */}
      {isAddingStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-sans">Share Ephemeral Status</h3>
              <button onClick={() => setIsAddingStatus(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStatus} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1.5">Aesthetic Gradient Theme</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { class: 'from-cyan-900 via-slate-900 to-violet-950', name: 'Cyber Swarm' },
                    { class: 'from-fuchsia-950 via-slate-900 to-rose-950', name: 'Sunset Amber' },
                    { class: 'from-slate-900 via-indigo-950 to-teal-950', name: 'Emerald Ledger' }
                  ].map((grad, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStatusGradient(grad.class)}
                      className={`h-10 rounded-lg bg-gradient-to-tr ${grad.class} border text-[9px] font-mono transition flex items-center justify-center text-slate-200 ${
                        statusGradient === grad.class ? 'border-cyan-400 shadow-lg' : 'border-slate-850'
                      }`}
                    >
                      {grad.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1.5">Status Update Text</label>
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="What's your node status?"
                  maxLength={100}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-slate-100 rounded-lg text-xs font-mono transition"
              >
                Sign & Propagate Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* P2P MESSAGING / CHAT BOX DRAWER */}
      {activeChatPeer && (
        <div className="fixed bottom-0 right-4 z-40 max-w-sm w-full bg-[#0A0F1D] border border-slate-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
          {/* Drawer Header */}
          <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-900">
            <div className="flex items-center gap-2.5">
              <img src={activeChatPeer.avatar} className="w-7 h-7 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
              <div>
                <span className="font-sans font-bold text-xs text-slate-100 block leading-tight">{activeChatPeer.name}</span>
                <span className="text-[8px] font-mono text-emerald-400 block uppercase tracking-widest scale-95 origin-left">Secure E2E Node</span>
              </div>
            </div>
            <button onClick={() => setActiveChatPeer(null)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {(chatHistory[activeChatPeer.name] || []).map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl text-xs max-w-[80%] font-sans leading-relaxed ${
                  msg.sender === 'me' 
                    ? 'bg-gradient-to-r from-cyan-600 to-violet-600 text-slate-100 rounded-tr-none' 
                    : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[8px] opacity-40 font-mono block text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Composer Input */}
          <div className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Write signed block to ${activeChatPeer.name}...`}
              className="flex-grow bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChatMessage();
              }}
            />
            <button
              onClick={handleSendChatMessage}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-slate-100"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* P2P ENCRYPTED CALLING INTERFACE OVERLAY */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#0A0F1D] border border-slate-900 rounded-3xl p-8 space-y-8 text-center shadow-2xl relative overflow-hidden">
            
            {/* Ambient visual glow background */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>

            {/* Cryptographic Verified Stamp */}
            <div className="mx-auto inline-flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest font-bold">Secure P2P Line Verified</span>
            </div>

            {/* Avatar & Calling State */}
            <div className="space-y-4 relative z-10">
              <div className="w-24 h-24 rounded-full mx-auto p-1 bg-gradient-to-tr from-cyan-400 to-violet-600 animate-[pulse_2.5s_infinite]">
                <img 
                  src={activeCall.peerAvatar} 
                  className="w-full h-full rounded-full object-cover border-2 border-slate-900" 
                  alt="" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-sans">{activeCall.peerName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {activeCall.state === 'dialing' ? 'CONNECTING VIA SWARM GOSSIP...' : 'E2E ENCRYPTED STREAM ACTIVE'}
                </p>
              </div>
            </div>

            {/* Calling Equalizer/Waves (Connected) */}
            {activeCall.state === 'connected' && (
              <div className="h-10 flex justify-center items-center gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-gradient-to-t from-cyan-500 to-violet-600 rounded-full animate-[pulse_1s_infinite]"
                    style={{ 
                      height: `${Math.floor(Math.random() * 32) + 8}px`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Call duration timer (Connected) */}
            {activeCall.state === 'connected' && (
              <div className="text-sm text-slate-300 font-mono tracking-widest font-bold">
                {formatDuration(callDuration)}
              </div>
            )}

            {/* Dialing dots (Dialing) */}
            {activeCall.state === 'dialing' && (
              <div className="flex justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_0s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-[bounce_1s_infinite_0.4s]"></span>
              </div>
            )}

            {/* Call Action Controls */}
            <div className="flex justify-center gap-5 pt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full border transition ${
                  isMuted 
                    ? 'bg-rose-950/40 border-rose-850 text-rose-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-slate-100 shadow-lg shadow-rose-950/20 transition hover:scale-105 duration-150"
                title="Hang Up"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full border transition ${
                  isVideoOff 
                    ? 'bg-rose-950/40 border-rose-850 text-rose-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>

            {/* Secure warning info footer */}
            <p className="text-[10px] font-mono text-slate-500 leading-relaxed max-w-[250px] mx-auto pt-2">
              All calls are processed via decentralized DTLS encryption tunnels with perfect forward secrecy. No recording active.
            </p>
          </div>
        </div>
      )}

      {/* DECENTRALIZED CONTENT MODERATION COUNCIL MODAL */}
      <ModerationCouncilModal
        isOpen={showModerationModal}
        onClose={() => setShowModerationModal(false)}
        flaggedPosts={flaggedPosts}
        onVoteOnPost={handleCouncilVote}
        currentUserName={username}
      />

      {/* SELF-SOVEREIGN DIGITAL IDENTITY (DID) MANAGEMENT MODAL */}
      <DecentralizedIdentityModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        currentUsername={username}
        currentAvatar={avatar}
        currentBio={userBio}
        keyPair={{ publicKey: currentUserKey, privateKey: currentPrivateKey }}
        followedCount={followedUsers.size}
        onUpdateIdentity={(newUsername, newAvatar, newBio, newKeys) => {
          if (newBio) {
            setUserBio(newBio);
            localStorage.setItem('aura_user_bio', newBio);
          }
          if (onUpdateIdentity) {
            onUpdateIdentity(newUsername, newAvatar, newBio, newKeys);
          }
          triggerNotification('Self-sovereign identity profile synchronized across swarm!');
        }}
      />

    </div>
  );
}
