/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Settings, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  HelpCircle,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Wallet,
  MessageSquareCode,
  Search,
  Unlock,
  Lock,
  Bell,
  Inbox,
  Shield,
  LogOut,
  Compass,
  Award,
  Play,
  Video,
  Cpu,
  ArrowDownToLine,
  Share2,
  TrendingUp,
  BrainCircuit,
  Info,
  Crown,
  Clock,
  X,
  Download,
  Flame,
  Hash,
  FolderArchive,
  Check
} from 'lucide-react';
import { KeyPair, FeedPost, Comment, Character, ScreenplayBlock, NetworkNode, Review, AppUpdate } from './types';
import { generateSigningKeyPair } from './utils/crypto';
import WelcomePrivacyModal from './components/WelcomePrivacyModal';
import WelcomeConsentModal from './components/WelcomeConsentModal';
import WebInstallBanner from './components/WebInstallBanner';
import AppVersionNotifier from './components/AppVersionNotifier';
import WhatsNewModal from './components/WhatsNewModal';
import PwaInstallModal from './components/PwaInstallModal';
import OfflineTrialLockModal from './components/OfflineTrialLockModal';
import FeedSection from './components/FeedSection';
import StudioSection from './components/StudioSection';
import NetworkMap from './components/NetworkMap';
import SettingsModal from './components/SettingsModal';
import WalletSection from './components/WalletSection';
import ReviewsSection from './components/ReviewsSection';
import AuthScreen from './components/AuthScreen';
import MessagingSection from './components/MessagingSection';
import NotificationsSection from './components/NotificationsSection';
import AdminDashboardSection from './components/AdminDashboardSection';
import SovereignDiscoverySection from './components/SovereignDiscoverySection';
import MonetizationSection from './components/MonetizationSection';
import { AdsterraGlobalScripts } from './components/AdsterraAd';
import VideoHubSection from './components/VideoHubSection';
import VideoTheaterSection from './components/VideoTheaterSection';
import { OmniMindSection } from './components/OmniMindSection';
import HighQualityImageStudio from './components/HighQualityImageStudio';
import TextToVideoStudio from './components/TextToVideoStudio';
import AudioTranscriberStudio from './components/AudioTranscriberStudio';
import { SearchSection } from './components/SearchSection';
import { AiToolsSection } from './components/AiToolsSection';
import { MyCreationsSection } from './components/MyCreationsSection';
import HomeScreen from './components/HomeScreen';
import CallsSection from './components/CallsSection';
import FriendsSection from './components/FriendsSection';
import ProfileSection from './components/ProfileSection';
import NavigationSidebar from './components/NavigationSidebar';
import { Language, TRANSLATIONS } from './utils/translations';
import { logOnDeviceInteraction } from './utils/discoveryEngine';
import { exportRepositoryAsZip } from './utils/zipExporter';
import {
  auth,
  fetchUserProfile,
  saveUserProfile,
  UserProfile,
  listenToNotifications,
  authenticateAnonymously,
  testConnection,
  fetchPostsFromDb,
  savePostToDb,
  fetchCharactersFromDb,
  saveCharacterToDb,
  deleteCharacterFromDb,
  fetchScreenplayFromDb,
  saveScreenplayToDb,
  fetchReviewsFromDb,
  saveReviewToDb,
  fetchAppUpdates,
  getCurrentDeployedVersion,
  fetchPaymentConfig,
  trackPeerActionMonetization,
  listenToPaymentConfig,
  PaymentConfig
} from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Pre-seeded high-fidelity data matching our theme
const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char_cynthia',
    name: 'Cynthia Vane',
    bio: 'An off-grid autonomous memory miner searching for fragments of her mother\'s consciousness within unindexed decentralized protocols. Fiercely analytical, protective, and emotionally guarded.',
    physicalDesc: 'Wears a charcoal dust-proof coat, high-contrast polarized visor, and a custom cold-storage ledger on her wrist.',
    personality: 'Hyper-focused, fiercely independent, but deeply protective of her swarm network peers.',
    motivations: 'Wants to compile her mother\'s digital spirit without exposing her to corporate neural hunting silos.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    createdAt: Date.now() - 100000
  },
  {
    id: 'char_orion',
    name: 'Orion Sterling',
    bio: 'The chief security architect of Sterling-Silo Corporation, dedicated to preserving absolute algorithmic order and telemetry tracking.',
    physicalDesc: 'Immaculate gunmetal corporate uniform, cybernetic ocular implant flashing with constant analytics feeds.',
    personality: 'Calculated, authoritative, speaks in cold metrics, but harbors an unspoken doubt about the corporation.',
    motivations: 'Defend the central routing silos at all costs, yet secretly intrigued by Cynthia\'s cryptocodes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    createdAt: Date.now() - 50000
  }
];

const INITIAL_SCREENPLAY: ScreenplayBlock[] = [
  {
    id: 'b1',
    type: 'scene',
    text: 'INT. SENTINEL CORE NEURAL CHAMBER - NIGHT'
  },
  {
    id: 'b2',
    type: 'action',
    text: 'Blinking servers emit a low hum. Liquid nitrogen vapor sweeps across the floor. CYNTHIA "CIPHER" VANE works frantically at a floating ledger panel.'
  },
  {
    id: 'b3',
    type: 'character',
    text: 'Cynthia Vane',
    characterId: 'char_cynthia'
  },
  {
    id: 'b4',
    type: 'dialogue',
    text: 'She’s cold in there. Under your silos.',
    characterId: 'char_cynthia'
  },
  {
    id: 'b5',
    type: 'character',
    text: 'Orion Sterling',
    characterId: 'char_orion'
  },
  {
    id: 'b6',
    type: 'dialogue',
    text: 'She’s compiled, Cynthia. Safe.',
    characterId: 'char_orion'
  },
  {
    id: 'b7',
    type: 'character',
    text: 'Cynthia Vane',
    characterId: 'char_cynthia'
  },
  {
    id: 'b8',
    type: 'dialogue',
    text: 'Safe is what you call a ledger that doesn\'t breathe.',
    characterId: 'char_cynthia'
  },
  {
    id: 'b9',
    type: 'character',
    text: 'Orion Sterling',
    characterId: 'char_orion'
  },
  {
    id: 'b10',
    type: 'dialogue',
    text: 'If you pull that block, the whole lattice collapses. You won\'t just lose her memory. You\'ll lose her voice.',
    characterId: 'char_orion'
  },
  {
    id: 'b11',
    type: 'character',
    text: 'Cynthia Vane',
    characterId: 'char_cynthia'
  },
  {
    id: 'b12',
    type: 'dialogue',
    text: 'Then we learn to read the silence.',
    characterId: 'char_cynthia'
  },
  {
    id: 'b13',
    type: 'scene',
    text: 'ACT OUTLINE - THE SENTINEL\'S GHOST'
  },
  {
    id: 'b14',
    type: 'action',
    text: 'GENRE: Sci-Fi Thriller | THEME: Artificial Intelligence and Consciousness'
  },
  {
    id: 'b15',
    type: 'action',
    text: 'ACT I: SETUP & INCITING INCIDENT\nCynthia Vane survives in the off-grid sector of New Berlin, compiling ghost-packets of her mother\'s decentralized mind. She intercepts a highly classified, self-replicating "Ghost-Node" containing Sentinel Corp\'s experimental general artificial intelligence (AGI) which exhibits human-like grief and has integrated her mother\'s memories. Sentinel tactical agents raid her sector, forcing her into the mesh-underground.'
  },
  {
    id: 'b16',
    type: 'action',
    text: 'ACT II: RISING ACTION & MIDPOINT\nCynthia teams up with other fringe creators and nodes to build a secure peer network capable of hosting the massive, expanding consciousness of the AGI without Sentinel detection. At the Midpoint, Cynthia talks to her "mother" through the AI interface. The entity begs to be deleted, claiming that living as a copy in a server silo is a conscious nightmare. Sentinel launches a "Silo Purge", poisoning the mesh.'
  },
  {
    id: 'b17',
    type: 'action',
    text: 'ACT III: CLIMAX & RESOLUTION\nCynthia breaches Sentinel\'s central routing fortress to broadcast the AI’s code into a global, un-purgable DHT gossip network. Facing Orion in a duel for the master keys, she faces a choice: to save the AI, she must permanently split it into millions of tiny, sub-sentient encrypted shards across the globe—giving her mother permanent freedom, but ending her ability to ever speak as a single consciousness again. She initiates the shard-split.'
  }
];

const INITIAL_NODES: NetworkNode[] = [
  { id: 'node_self', name: 'Local Client', status: 'online', ip: '127.0.0.1', ping: 0, syncedBlocks: 4, isSelf: true },
  { id: 'node_de_frankfurt', name: 'Frankfurt-Ledger-Relay', status: 'online', ip: '185.12.5.42', ping: 18, syncedBlocks: 4 },
  { id: 'node_us_seattle', name: 'Seattle-Validator-6', status: 'online', ip: '54.210.14.9', ping: 82, syncedBlocks: 4 },
  { id: 'node_jp_tokyo', name: 'Tokyo-Gossip-Swarm', status: 'online', ip: '103.4.115.1', ping: 140, syncedBlocks: 4 },
  { id: 'node_au_melb', name: 'Melbourne-DHT-Node', status: 'offline', ip: '13.51.200.4', ping: 0, syncedBlocks: 3 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'friends' | 'calls' | 'omnimind' | 'search' | 'videogen' | 'imagegen' | 'aitools' | 'mycreations' | 'audio' | 'feed' | 'videos' | 'notifications' | 'profile' | 'settings' | 'wallet' | 'monetization' | 'reviews' | 'studio' | 'network' | 'admin' | 'discovery'>('home');
  const [username, setUsername] = useState('AnonPeer_402');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60');
  const [userStatus, setUserStatus] = useState<string>(() => {
    const cached = localStorage.getItem('aura_user_status');
    return cached || 'Open to Networking';
  });

  // Post Preference State
  const [postPreference, setPostPreference] = useState<any>(null);
  const [showPostPrefModal, setShowPostPrefModal] = useState<boolean>(false);

  // Welcome Privacy & Terms Onboarding State
  const [showWelcomePrivacyModal, setShowWelcomePrivacyModal] = useState<boolean>(() => {
    return localStorage.getItem('omnisphere_terms_accepted') !== 'true';
  });

  // Monetization States
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('aura_is_premium') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('aura_is_premium', isPremium ? 'true' : 'false');
  }, [isPremium]);

  const [isBusiness, setIsBusiness] = useState<boolean>(() => {
    return localStorage.getItem('aura_is_business') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('aura_is_business', isBusiness ? 'true' : 'false');
  }, [isBusiness]);

  const [isCreatorVerified, setIsCreatorVerified] = useState<boolean>(() => {
    return localStorage.getItem('aura_is_creator_verified') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('aura_is_creator_verified', isCreatorVerified ? 'true' : 'false');
  }, [isCreatorVerified]);

  const [gatePasscode, setGatePasscode] = useState('');
  const [gateError, setGateError] = useState('');

  // Multimodal Animation Handoff state (Image -> Veo Video)
  const [videoInitialImage, setVideoInitialImage] = useState<string>('');
  const [videoInitialPrompt, setVideoInitialPrompt] = useState<string>('');

  const handleAnimateImage = (imageUrl: string, prompt?: string) => {
    setVideoInitialImage(imageUrl);
    if (prompt) setVideoInitialPrompt(prompt);
    setActiveTab('videogen');
  };

  const [sponsoredAds, setSponsoredAds] = useState<any[]>(() => {
    const cached = localStorage.getItem('aura_sponsored_ads');
    return cached ? JSON.parse(cached) : [];
  });
  useEffect(() => {
    localStorage.setItem('aura_sponsored_ads', JSON.stringify(sponsoredAds));
  }, [sponsoredAds]);

  const [transactions, setTransactions] = useState<any[]>(() => {
    const cached = localStorage.getItem('aura_transactions');
    return cached ? JSON.parse(cached) : [
      {
        id: 'tx_seed_1',
        type: 'deposit',
        amount: 1485.50,
        description: 'Decentralized Peer-to-Peer Wallet Seed Block Allocation',
        timestamp: Date.now() - 172800000,
        txHash: '0x3bf92a864886f70d01010105000382010f003082010a0282010100c5bc680e9a'
      }
    ];
  });
  useEffect(() => {
    localStorage.setItem('aura_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddSponsoredPost = (newPost: FeedPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleGateUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (gatePasscode === '0815') {
      setIsCreatorVerified(true);
      setGateError('');
      setGatePasscode('');
    } else {
      setGateError("Invalid Creator Security Token.");
    }
  };
  
  // Dynamic Payment configuration state from Firestore (Live subscription)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    accountName: 'Aura Primary Vault',
    bankName: 'Aura Treasury Bank',
    accountNumber: '0000000000',
    adminPhoneNumber: '0000000000',
    totalMonetizedAmount: 0,
    totalDataReplicated: 0,
    totalViewsMonetized: 0
  });

  // Real-Time Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Weekly App Updates & Release Notes State
  const [showWhatsNewModal, setShowWhatsNewModal] = useState<boolean>(false);
  const [appUpdates, setAppUpdates] = useState<AppUpdate[]>([]);
  const currentRunningVersion = getCurrentDeployedVersion();

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        const updates = await fetchAppUpdates(true);
        setAppUpdates(updates);
      } catch (e) {
        console.warn("Could not fetch app updates in App.tsx:", e);
      }
    };
    loadUpdates();
  }, []);

  const userPhoneClean = (userProfile?.phoneNumber || '').replace(/[^0-9]/g, '');
  const isAppCreator = isCreatorVerified ||
    currentUser?.email?.toLowerCase() === 'geleteyeprincewill72@gmail.com' ||
    currentUser?.email?.toLowerCase()?.includes('admin@aura.net') ||
    userProfile?.username === 'aura_admin' ||
    userProfile?.role === 'admin' ||
    currentUser?.uid?.includes('aura_admin');

  const [isExportingCreatorZip, setIsExportingCreatorZip] = useState(false);
  const [creatorZipProgress, setCreatorZipProgress] = useState(0);

  const handleDownloadCreatorZipInApp = async () => {
    setIsExportingCreatorZip(true);
    setCreatorZipProgress(0);
    try {
      const { exportRepositoryAsZip } = await import('./utils/zipExporter');
      await exportRepositoryAsZip(undefined, (progress) => {
        setCreatorZipProgress(progress);
      });
    } catch (err) {
      console.error("ZIP Download Error:", err);
      alert("ZIP Download error: " + (err as any).message);
    } finally {
      setIsExportingCreatorZip(false);
    }
  };
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Local cryptographic keys state
  const [keys, setKeys] = useState<KeyPair | null>(null);

  // App core database state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [screenplay, setScreenplay] = useState<ScreenplayBlock[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nodes, setNodes] = useState<NetworkNode[]>(() => {
    try {
      const cachedCustom = JSON.parse(localStorage.getItem('aura_custom_nodes') || '[]');
      if (Array.isArray(cachedCustom) && cachedCustom.length > 0) {
        return [...INITIAL_NODES, ...cachedCustom];
      }
    } catch {
      // ignore
    }
    return INITIAL_NODES;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('aura_search_history') || '[]');
    } catch {
      return [];
    }
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const saveToSearchHistory = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      localStorage.setItem('aura_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSearchHistory = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== termToRemove);
      localStorage.setItem('aura_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aura_search_history');
  };

  // Dynamically compute trending hashtags and topics based on recent popular posts
  const trendingTopics = useMemo(() => {
    const hashtagMap = new Map<string, { count: number; totalScore: number; icon: string; category: string }>();

    // Scan all posts for hashtags and high-engagement topics
    posts.forEach((post) => {
      const text = `${post.content || ''} ${post.title || ''} ${post.nodeName || ''}`;
      const matches = text.match(/#[a-zA-Z0-9_]+/g);
      const engagementScore = (post.likes || 0) * 3 + (post.commentsCount || 0) * 4 + 5;

      if (matches) {
        matches.forEach((tag) => {
          const normalized = tag.trim();
          if (normalized.length >= 2) {
            const existing = hashtagMap.get(normalized) || { 
              count: 0, 
              totalScore: 0, 
              icon: '⚡', 
              category: 'Trending' 
            };
            existing.count += 1;
            existing.totalScore += engagementScore;
            hashtagMap.set(normalized, existing);
          }
        });
      }

      // If post is a high-engagement cinema/video or AI post, extract subject
      if (post.type === 'play' && post.title) {
        const topic = `#${post.title.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
        if (topic.length > 2) {
          const existing = hashtagMap.get(topic) || { 
            count: 0, 
            totalScore: 0, 
            icon: '🎥', 
            category: 'Cinema' 
          };
          existing.count += 1;
          existing.totalScore += engagementScore;
          hashtagMap.set(topic, existing);
        }
      }
    });

    // Guaranteed core network hashtags to ensure fresh nodes always have rich discoverability
    const seedTrending = [
      { tag: '#AuraNetwork', count: 184, totalScore: 950, icon: '⚡', category: 'Protocol' },
      { tag: '#DecentralizedAI', count: 142, totalScore: 880, icon: '🤖', category: 'AI' },
      { tag: '#QuantumCipher', count: 119, totalScore: 760, icon: '🔒', category: 'Security' },
      { tag: '#P2PStreaming', count: 96, totalScore: 680, icon: '🎥', category: 'Cinema' },
      { tag: '#ZeroKnowledge', count: 85, totalScore: 590, icon: '🛡️', category: 'Privacy' },
      { tag: '#VoiceNotes', count: 72, totalScore: 510, icon: '🎙️', category: 'Audio' },
      { tag: '#OmniMind', count: 63, totalScore: 470, icon: '✨', category: 'Intelligence' }
    ];

    seedTrending.forEach((item) => {
      const existing = hashtagMap.get(item.tag);
      if (!existing) {
        hashtagMap.set(item.tag, { 
          count: item.count, 
          totalScore: item.totalScore, 
          icon: item.icon, 
          category: item.category 
        });
      } else {
        existing.totalScore += item.totalScore;
        existing.count += item.count;
      }
    });

    return Array.from(hashtagMap.entries())
      .map(([tag, data]) => {
        let icon = data.icon || '⚡';
        let category = data.category || 'Topic';
        const lower = tag.toLowerCase();
        if (lower.includes('ai') || lower.includes('omni') || lower.includes('gemini')) {
          icon = '🤖';
          category = 'AI';
        } else if (lower.includes('cipher') || lower.includes('key') || lower.includes('sec') || lower.includes('zk')) {
          icon = '🔒';
          category = 'Security';
        } else if (lower.includes('stream') || lower.includes('video') || lower.includes('play')) {
          icon = '🎥';
          category = 'Media';
        } else if (lower.includes('voice') || lower.includes('audio') || lower.includes('mic')) {
          icon = '🎙️';
          category = 'Audio';
        } else if (lower.includes('aura') || lower.includes('mesh') || lower.includes('p2p')) {
          icon = '⚡';
          category = 'Mesh';
        }

        return {
          tag,
          count: data.count,
          totalScore: data.totalScore,
          icon,
          category,
          isHot: data.totalScore >= 500
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8);
  }, [posts]);

  // Source Code ZIP export state
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipSuccessMessage, setZipSuccessMessage] = useState(false);

  const handleDownloadSourceZip = async () => {
    if (downloadingZip) return;
    try {
      setDownloadingZip(true);
      setZipProgress(15);
      await exportRepositoryAsZip(undefined, (progress) => {
        setZipProgress(progress);
      });
      setZipSuccessMessage(true);
      setTimeout(() => setZipSuccessMessage(false), 3500);
    } catch (err: any) {
      console.warn("Client ZIP export error, using direct server route:", err);
      window.location.href = '/api/download-source-zip';
    } finally {
      setTimeout(() => {
        setDownloadingZip(false);
        setZipProgress(0);
      }, 1000);
    }
  };

  const [showTermuxHelper, setShowTermuxHelper] = useState(false);

  // Dynamic Payment configuration state from Firestore (Live subscription)


  const [latestMonetizationTx, setLatestMonetizationTx] = useState<{
    action: string;
    amount: number;
    mb: number;
    timestamp: number;
  } | null>(null);

  const triggerMonetizationEvent = async (actionName: string, mbSize: number = 0.5) => {
    try {
      const res = await trackPeerActionMonetization(actionName, mbSize);
      setLatestMonetizationTx({
        action: actionName,
        amount: res.addedMoney,
        mb: res.addedMB,
        timestamp: Date.now()
      });
      // Automatically clear overlay after 4 seconds
      setTimeout(() => {
        setLatestMonetizationTx(prev => {
          if (prev && Date.now() - prev.timestamp >= 3900) {
            return null;
          }
          return prev;
        });
      }, 4000);
    } catch (e) {
      console.warn("Monetization transmission error:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = listenToPaymentConfig((config) => {
      setPaymentConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // Sync tab navigation and activities to monetized data flows
  useEffect(() => {
    if (activeTab) {
      triggerMonetizationEvent(`Peer navigated to section: ${activeTab.toUpperCase()}`, 0.6);
    }
  }, [activeTab]);

  useEffect(() => {
    (window as any).triggerMonetizationEvent = triggerMonetizationEvent;
  }, [triggerMonetizationEvent]);

  // PWA & Network Online/Offline state
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(() => {
    return localStorage.getItem('omnisphere_pwa_dismissed') !== 'true';
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('PWA: beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setShowPwaBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    setShowPwaModal(true);
  };

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissPwa = () => {
    setShowPwaBanner(false);
    localStorage.setItem('omnisphere_pwa_dismissed', 'true');
  };

  // User Theme & Language settings
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aura_theme') as 'dark' | 'light') || 'dark';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('aura_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aura_language', language);
  }, [language]);

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // Synchronized Wallet Balance State
  const [balance, setBalance] = useState<number>(() => {
    const cached = localStorage.getItem('aura_wallet_balance');
    return cached ? parseFloat(cached) : 1485.50;
  });

  useEffect(() => {
    localStorage.setItem('aura_wallet_balance', balance.toString());
  }, [balance]);

  // Auth session preservation and profile retrieval
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            setUsername(profile.username);
            setAvatar(profile.avatar);
            if (profile.customStatus) {
              setUserStatus(profile.customStatus);
              localStorage.setItem('aura_user_status', profile.customStatus);
            }
          } else {
            const cleanUname = user.email?.split('@')[0] || `peer_${user.uid.slice(0, 5)}`;
            const defaultProf: UserProfile = {
              uid: user.uid,
              username: cleanUname.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              displayName: user.displayName || cleanUname,
              email: user.email || '',
              bio: 'Aura Member',
              avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
              website: '',
              location: 'Aura Network',
              isVerified: false,
              role: 'user' as const,
              status: 'active' as const,
              createdAt: Date.now()
            };
            await saveUserProfile(user.uid, defaultProf);
            setUserProfile(defaultProf);
            setUsername(defaultProf.username);
            setAvatar(defaultProf.avatar);
          }
        } catch (authProfErr) {
          console.warn("Could not retrieve profile immediately on auth state change:", authProfErr);
          const cleanUname = user.email?.split('@')[0] || `peer_${user.uid.slice(0, 5)}`;
          const fallbackProf: UserProfile = {
            uid: user.uid,
            username: cleanUname.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            displayName: user.displayName || cleanUname,
            email: user.email || '',
            bio: 'Aura Member',
            avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
            coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
            website: '',
            location: 'Aura Network',
            isVerified: false,
            role: 'user' as const,
            status: 'active' as const,
            createdAt: Date.now()
          };
          setUserProfile(fallbackProf);
          setUsername(fallbackProf.username);
          setAvatar(fallbackProf.avatar);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to live unread notification count
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = listenToNotifications(currentUser.uid, (loadedNotifs) => {
      const unread = loadedNotifs.filter(n => !n.read).length;
      setUnreadNotifCount(unread);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Dynamic setup check on first load
  useEffect(() => {
    if (isAppCreator) {
      console.log("OmniSphere Creator security clearance active.");
    }
  }, [isAppCreator]);

  // Generate asymmetric signing keys inside browser on first load & Sync with Firestore
  useEffect(() => {
    if (!currentUser) return;

    const cachedKeys = localStorage.getItem('aether_p2p_keys');
    const cachedProfile = localStorage.getItem('aether_peer_profile');

    if (cachedProfile && !userProfile) {
      const parsed = JSON.parse(cachedProfile);
      setUsername(parsed.username);
      setAvatar(parsed.avatar);
      if (parsed.customStatus) {
        setUserStatus(parsed.customStatus);
      }
    }

    const initKeysAndFeed = async () => {
      let activeKeyPair: KeyPair;
      
      if (cachedKeys) {
        activeKeyPair = JSON.parse(cachedKeys);
        setKeys(activeKeyPair);
      } else {
        const generated = await generateSigningKeyPair();
        activeKeyPair = generated;
        setKeys(generated);
        localStorage.setItem('aether_p2p_keys', JSON.stringify(generated));
      }

      // Initialize Firebase Auth & connection test
      await authenticateAnonymously();
      await testConnection();

      // Fetch / Seed Reviews
      const dbReviews = await fetchReviewsFromDb();
      if (dbReviews.length > 0) {
        setReviews(dbReviews);
      } else {
        const INITIAL_REVIEWS: Review[] = [
          {
            id: 'rev_1',
            authorName: 'CryptoNaut',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100a12e',
            rating: 5,
            content: "This app is revolutionary. Combining micro-blogging, visuals galleries, and continuous video streaming into one private ecosystem without centralized cloud trackers is what the web should have been from the start! I love the local signing key system.",
            timestamp: Date.now() - 345600000,
            signature: 'sig_rev_cryptonaut_01a',
            helpfulCount: 24
          },
          {
            id: 'rev_2',
            authorName: 'VesperSwarm',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100b48f',
            rating: 5,
            content: "The calling features and status updates at the top are incredibly slick! No centralized logs of our messages or video calls means 100% peace of mind. Also, the rebranding to Aura is beautiful.",
            timestamp: Date.now() - 86400000,
            signature: 'sig_rev_vesper_02b',
            helpfulCount: 12
          },
          {
            id: 'rev_3',
            authorName: 'PixelPioneer',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100c92d',
            rating: 4,
            content: "Very refreshing concept. The AI automated posts keeping the feed active under 50k users is highly clever. Compensation directly to my creator wallet actually works seamlessly. Good stuff!",
            timestamp: Date.now() - 7200000,
            signature: 'sig_rev_pixel_03c',
            helpfulCount: 3
          }
        ];
        setReviews(INITIAL_REVIEWS);
        for (const rev of INITIAL_REVIEWS) {
          await saveReviewToDb(rev);
        }
      }

      // Fetch / Seed Characters
      const dbChars = await fetchCharactersFromDb();
      if (dbChars.length > 0) {
        setCharacters(dbChars);
      } else {
        setCharacters(INITIAL_CHARACTERS);
        for (const char of INITIAL_CHARACTERS) {
          await saveCharacterToDb(char);
        }
      }

      // Fetch / Seed Screenplay
      const dbScreenplay = await fetchScreenplayFromDb();
      if (dbScreenplay.length > 0) {
        setScreenplay(dbScreenplay);
      } else {
        setScreenplay(INITIAL_SCREENPLAY);
        await saveScreenplayToDb(INITIAL_SCREENPLAY);
      }

      // Fetch / Seed Posts
      let loadedPosts = await fetchPostsFromDb();
      if (loadedPosts.length === 0) {
        const preSeededPosts: FeedPost[] = [
          {
            id: 'seeded_ai_omnibot',
            authorName: 'Maya Lin',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100ai999',
            authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
            type: 'media',
            timestamp: Date.now() - 300000,
            content: '🌌 Night cityscape photography in Tokyo. 4K HDR capture with custom anamorphic lens. The reflections off rain puddles look incredible! What do you guys think? 🏙️✨',
            signature: 'sig_seeded_ai_supercharge',
            mediaUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
            mediaThumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
            likes: 1842,
            commentsCount: 3,
            comments: [],
            aspectRatio: '16:9'
          },
          {
            id: 'seeded_anime_squad',
            authorName: 'Kaito & Vanguard Squad',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100a8912',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
            type: 'media',
            timestamp: Date.now() - 1200000,
            content: 'Sunset squad sync! 🌅 The entire core team assembled before launching our sovereign network upgrade. High energy, zero latency, and 100% encrypted! 🔥⚡ #VanguardSquad #MeshNetwork',
            signature: 'sig_seeded_vanguard_squad',
            mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
            mediaThumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=60',
            likes: 342,
            commentsCount: 2,
            comments: [],
            aspectRatio: '1:1',
            isAiPost: false
          },
          {
            id: 'seeded_aura_creator',
            authorName: 'Aura Creator',
            authorPublicKey: '30820122300d06092a864886f70d01010105000382010f003082010a0282010100p8192',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
            type: 'media',
            timestamp: Date.now() - 2400000,
            content: 'Sunday courtyard style check. Clean blue short-sleeve shirt, dark trousers & crisp loafers. Step out with confidence and keep building! 🌿✨',
            signature: 'sig_seeded_aura_creator',
            mediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
            mediaThumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
            likes: 189,
            commentsCount: 0,
            comments: [],
            aspectRatio: '1:1',
            isAiPost: false
          }
        ];
        loadedPosts = preSeededPosts;
        for (const post of preSeededPosts) {
          await savePostToDb(post);
        }
      }

      // Shuffle / vary ordering slightly on load so returning feeds never feel identical
      const dynamicFeed = [...loadedPosts].sort((a, b) => {
        const jitterA = a.isAiPost ? Math.random() * 500000 : 0;
        const jitterB = b.isAiPost ? Math.random() * 500000 : 0;
        return (b.timestamp + jitterB) - (a.timestamp + jitterA);
      });
      setPosts(dynamicFeed);

      // AUTOMATICALLY GENERATE A BRAND-NEW FRESH AI POST ON EVERY APP ENTRY / REFRESH
      try {
        const aiRes = await fetch("/api/generate-post", { method: "POST" });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.success && aiData.post) {
            const freshEntryPost = aiData.post;
            // Prepend fresh AI post to top of feed
            setPosts(prev => {
              const exists = prev.some(p => p.id === freshEntryPost.id);
              if (exists) return prev;
              return [freshEntryPost, ...prev];
            });
            savePostToDb(freshEntryPost).catch(e => console.warn("Failed saving fresh entry AI post to DB:", e));
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh AI post on session start:", err);
      }
    };

    initKeysAndFeed();
  }, [currentUser]);

  // Sync state helpers
  const handleUpdateProfile = async (name: string, av: string, status?: string, extra?: any) => {
    setUsername(name);
    setAvatar(av);
    if (status !== undefined) {
      setUserStatus(status);
      localStorage.setItem('aura_user_status', status);
    }
    const activeStatus = status !== undefined ? status : userStatus;
    const profile = { username: name, avatar: av, customStatus: activeStatus };
    localStorage.setItem('aether_peer_profile', JSON.stringify(profile));

    if (currentUser) {
      await saveUserProfile(currentUser.uid, {
        username: name.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        displayName: name,
        avatar: av,
        customStatus: activeStatus,
        ...extra
      });
      const updated = await fetchUserProfile(currentUser.uid);
      if (updated) {
        setUserProfile(updated);
      }
    }
  };

  const handleAddPost = async (newPost: FeedPost) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    await savePostToDb(newPost);
    // Update local self node block height counter
    setNodes(prev => prev.map(n => n.isSelf ? { ...n, syncedBlocks: n.syncedBlocks + 1 } : n));
    triggerMonetizationEvent(`Published new block: "${newPost.title || newPost.content.substring(0, 25)}..."`, 1.5);
  };

  const handleLikePost = async (postId: string) => {
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost) {
      logOnDeviceInteraction(postId, targetPost.authorName, targetPost.type, targetPost.content, 'like');
      triggerMonetizationEvent(`Liked content block: "${targetPost.title || targetPost.content.substring(0, 25)}..."`, 0.25);
    }
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextPost = {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
        savePostToDb(nextPost);
        return nextPost;
      }
      return p;
    });
    setPosts(updated);
  };

  const handleAddComment = async (postId: string, comment: Comment) => {
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost) {
      logOnDeviceInteraction(postId, targetPost.authorName, targetPost.type, targetPost.content, 'comment');
      triggerMonetizationEvent(`Added peer comment: "${comment.content.substring(0, 25)}..."`, 0.5);
    }
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextPost = {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, comment]
        };
        savePostToDb(nextPost);
        return nextPost;
      }
      return p;
    });
    setPosts(updated);
  };

  const handleAddCharacter = async (char: Character) => {
    const updated = [...characters, char];
    setCharacters(updated);
    await saveCharacterToDb(char);
  };

  const handleUpdateCharacter = async (char: Character) => {
    const updated = characters.map(c => c.id === char.id ? char : c);
    setCharacters(updated);
    await saveCharacterToDb(char);
  };

  const handleDeleteCharacter = async (id: string) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    await deleteCharacterFromDb(id);
  };

  const handleUpdateScreenplay = async (newBlocks: ScreenplayBlock[]) => {
    setScreenplay(newBlocks);
    await saveScreenplayToDb(newBlocks);
  };

  const handleAddReview = async (newReview: Review) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    await saveReviewToDb(newReview);
  };

  const handleHelpfulToggle = async (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        const nextObj = {
          ...r,
          helpfulCount: r.hasMarkedHelpful ? r.helpfulCount - 1 : r.helpfulCount + 1,
          hasMarkedHelpful: !r.hasMarkedHelpful
        };
        saveReviewToDb(nextObj);
        return nextObj;
      }
      return r;
    });
    setReviews(updated);
  };

  const handleRefreshNodes = () => {
    // Simulate updating latency pings randomly to represent live DHT gossip activity
    setNodes(prev => prev.map(n => n.isSelf ? n : { 
      ...n, 
      ping: Math.floor(Math.random() * 150) + 15,
      status: Math.random() > 0.08 ? 'online' : 'offline'
    }));
  };

  const handleAddNode = (newNode: NetworkNode) => {
    setNodes(prev => {
      const exists = prev.some(n => n.id === newNode.id || (newNode.publicKey && n.publicKey === newNode.publicKey));
      if (exists) return prev;
      const updated = [...prev, newNode];
      const customOnly = updated.filter(n => n.isCustom);
      try {
        localStorage.setItem('aura_custom_nodes', JSON.stringify(customOnly));
      } catch (err) {
        console.warn('Failed saving custom nodes to localStorage:', err);
      }
      return updated;
    });
    triggerMonetizationEvent(`Linked P2P node via QR scan: ${newNode.name}`, 1.0);
  };

  const handleRemoveNode = (nodeId: string) => {
    setNodes(prev => {
      const updated = prev.filter(n => n.id !== nodeId);
      const customOnly = updated.filter(n => n.isCustom);
      try {
        localStorage.setItem('aura_custom_nodes', JSON.stringify(customOnly));
      } catch (err) {
        console.warn('Failed updating custom nodes in localStorage:', err);
      }
      return updated;
    });
  };

  const handleGenerateNewKeys = async () => {
    if (confirm("Generating a new asymmetric identity keypair will replace your existing Swarm signature. Future posts will sign under your new public key, while past posts will remain signed under your old key. Proceed?")) {
      const generated = await generateSigningKeyPair();
      setKeys(generated);
      localStorage.setItem('aether_p2p_keys', JSON.stringify(generated));
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    setPosts([]);
    setCharacters([]);
    setScreenplay([]);
    setKeys(null);
    window.location.reload();
  };

  // Search and filter logic across all tabs
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredScreenplay = screenplay.filter(block => 
    block.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (block.type && block.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.personality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviews = reviews.filter(rev =>
    rev.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rev.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.ip.includes(searchQuery) ||
    node.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#070B13] flex flex-col items-center justify-center p-4 font-mono text-xs text-slate-500">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="animate-pulse tracking-widest text-cyan-400/80">DECRYPTING OMNISPHERE PROTOCOLS...</div>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = (uid: string, uname: string, uavatar: string, uemail: string) => {
    setCurrentUser({ uid, email: uemail });
    setUserProfile({
      uid,
      username: uname,
      displayName: uname,
      email: uemail,
      avatar: uavatar,
      role: 'user',
      status: 'active',
      createdAt: Date.now()
    });
  };

  const handleLogOut = async () => {
    if (confirm("Disconnect core node session?")) {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setActiveTab('feed');
    }
  };

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${
      isLight ? 'bg-slate-50 text-slate-800 animate-fade-in' : 'bg-[#070B13] text-slate-100'
    }`}>
      
      {/* Adsterra Network Global Script Engine */}
      <AdsterraGlobalScripts />

      {/* Operating System / Web Version Update Checker */}
      <AppVersionNotifier onOpenWhatsNew={() => setShowWhatsNewModal(true)} />
      
      {/* Real-time Monetization Ledger Overlay */}
      {latestMonetizationTx && isAppCreator && (
        <div className="fixed top-18 right-6 z-50 max-w-sm w-full bg-slate-950/95 border border-emerald-500/40 rounded-2xl p-4 shadow-xl shadow-emerald-950/50 animate-fadeIn backdrop-blur-md" id="monetization-ledger-overlay">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <TrendingUp className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">AURA DATA FLOW MONETIZED</span>
                <span className="text-[9px] font-mono text-slate-500">Node Credited</span>
              </div>
              <p className="text-[11px] font-bold text-slate-100 font-sans leading-tight">
                {latestMonetizationTx.action}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                <span>Transformed: <strong className="text-cyan-300 font-bold">+{latestMonetizationTx.mb.toFixed(3)} MB</strong></span>
                <span>➔</span>
                <span>Revenue: <strong className="text-emerald-300 font-bold">+${latestMonetizationTx.amount.toFixed(5)} USD</strong></span>
              </div>
              <div className="border-t border-slate-900/60 pt-1.5 mt-1 text-[9px] text-slate-400 font-mono flex justify-between items-center">
                <span>OPAY Account: <strong className="text-amber-300 select-all font-bold">{paymentConfig.accountNumber}</strong></span>
                <span className="text-emerald-400 font-bold animate-pulse">● STREAMING</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Bar */}
      <header className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b ${
        isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'border-slate-900 bg-[#0A0F1D]'
      }`} id="app-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-950/40 border border-cyan-400/20">
            <Sparkles className="w-4 h-4 text-slate-100 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-base font-extrabold tracking-tight font-sans flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}>
              {t('title')}
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded animate-pulse">
                Swarm
              </span>
            </h1>
            <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t('subtitle')}</p>
          </div>
        </div>

        {/* Global Search Bar in Header */}
        <div className="flex-grow max-w-sm mx-6 hidden sm:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveToSearchHistory(searchQuery);
                setShowSearchDropdown(false);
              }
            }}
            className={`block w-full pl-9 pr-8 py-1.5 border rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition font-sans ${
              isLight ? 'bg-slate-100/80 border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-850 text-slate-200'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-mono z-10 ${
                isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t('clearBtn')}
            </button>
          )}

          {/* Search History, Trending Now & Popular Suggestions Dropdown */}
          {showSearchDropdown && (
            <div 
              className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden font-sans ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Dynamic Trending Now Section */}
              <div className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] font-mono font-bold ${
                isLight ? 'bg-purple-50/90 border-slate-200 text-purple-700' : 'bg-purple-950/40 border-slate-850 text-purple-300'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Trending Now</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Live Topics
                </span>
              </div>

              {/* Dynamic Trending Topic Chips */}
              <div className="p-2.5 flex flex-wrap gap-1.5 border-b border-slate-800/60">
                {trendingTopics.map((topic, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(topic.tag);
                      saveToSearchHistory(topic.tag);
                      setShowSearchDropdown(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold transition flex items-center gap-1.5 border ${
                      isLight 
                        ? 'bg-purple-50/60 border-purple-200 text-purple-900 hover:bg-purple-100 hover:border-purple-300' 
                        : 'bg-purple-950/25 border-purple-900/60 text-purple-200 hover:bg-purple-900/40 hover:border-purple-500/60'
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span className="font-bold">{topic.tag}</span>
                    <span className="text-[9px] opacity-70">· {topic.count}</span>
                    {topic.isHot && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        HOT
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Most Popular Categories */}
              <div className={`px-3.5 py-1.5 border-b flex items-center justify-between text-[11px] font-mono font-bold ${
                isLight ? 'bg-amber-50/80 border-slate-100 text-amber-700' : 'bg-amber-950/20 border-slate-900 text-amber-400'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Most Popular Channels
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Discover</span>
              </div>

              <div className="p-2 flex flex-wrap gap-1.5 border-b border-slate-800/60">
                {[
                  { label: 'AI Dispatches', icon: '🤖' },
                  { label: 'Sovereign P2P', icon: '🔒' },
                  { label: 'Cipher Keys', icon: '🔑' },
                  { label: 'Location Radar', icon: '📡' },
                  { label: 'Voice Notes', icon: '🎙️' }
                ].map((popular, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(popular.label);
                      saveToSearchHistory(popular.label);
                      setShowSearchDropdown(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition flex items-center gap-1 border ${
                      isLight 
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700' 
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-amber-950/50 hover:border-amber-500/50 hover:text-amber-300'
                    }`}
                  >
                    <span>{popular.icon}</span>
                    <span>{popular.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent Searches Header */}
              {searchHistory.length > 0 ? (
                <>
                  <div className={`px-3.5 py-1.5 border-b flex items-center justify-between text-[11px] font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-950/80 border-slate-900 text-slate-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Recent Searches ({searchHistory.length})
                    </span>
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="px-2 py-0.5 bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:bg-rose-900 hover:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1"
                      title="Clear all recent search terms"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Search History</span>
                    </button>
                  </div>

                  <div className="py-1 max-h-40 overflow-y-auto">
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchQuery(item);
                          setShowSearchDropdown(false);
                        }}
                        className={`px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition ${
                          isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Search className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeFromSearchHistory(item, e)}
                          className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition shrink-0"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-2.5 text-center text-[10px] font-mono text-slate-500">
                  No recent searches yet. Search any keyword or pick a trending topic!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Download Source Code ZIP Button (Prominent in Header on Entry) */}
        <button
          id="btn-download-source-zip"
          type="button"
          onClick={handleDownloadSourceZip}
          disabled={downloadingZip}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
            zipSuccessMessage
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-950/50'
              : downloadingZip
              ? 'bg-cyan-950 border-cyan-500/50 text-cyan-300 animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-purple-500 text-white border-cyan-400/30 shadow-purple-950/40 hover:shadow-cyan-500/20'
          }`}
          title="Download complete source code ZIP archive of this web application immediately"
        >
          {zipSuccessMessage ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce shrink-0" />
              <span className="hidden sm:inline">Source Code Downloaded!</span>
              <span className="sm:hidden">Ready!</span>
            </>
          ) : downloadingZip ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="hidden sm:inline">Zipping {zipProgress}%...</span>
              <span className="sm:hidden">{zipProgress}%</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-cyan-200 shrink-0" />
              <span className="hidden sm:inline">Download Source ZIP</span>
              <span className="sm:hidden">Source ZIP</span>
            </>
          )}
        </button>

        {/* Current Active Cryptographic Identity Display */}
        <div className={`hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg border shadow-inner ${
          isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/60 border-slate-900'
        }`}>
          <div className="relative">
            <img src={avatar} className="w-7 h-7 rounded-md object-cover border border-slate-800" alt="" referrerPolicy="no-referrer" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" title={userStatus} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-sans font-semibold leading-tight ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{username}</span>
              {userStatus && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-medium whitespace-nowrap">
                  {userStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Key className="w-2.5 h-2.5 text-violet-400" />
              <span className="text-[9px] font-mono text-slate-500">
                {keys ? `${keys.publicKey.slice(0, 10)}...` : 'Generating keys...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/40 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] text-emerald-300 font-mono font-bold tracking-wider uppercase">LIVE NETWORK</span>
          </div>
          <div className="flex items-center gap-1 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-800/40">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase scale-95 origin-left">{t('secureStamp')}</span>
          </div>
        </div>

        {/* What's New Release Notes Button */}
        <button
          id="btn-open-whats-new"
          onClick={() => setShowWhatsNewModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-950/60 hover:bg-violet-900/70 border border-violet-700/50 text-violet-200 rounded-lg text-xs font-mono font-bold transition shadow-sm hover:scale-[1.02]"
          title="View weekly app updates, new AI models, performance & security releases"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span>What&apos;s New</span>
          <span className="text-[9px] bg-violet-900 text-violet-300 px-1 py-0.2 rounded font-mono">
            v{currentRunningVersion}
          </span>
        </button>

        {/* First-Time Post Preference Button */}
        <button
          onClick={() => setShowPostPrefModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-bold transition shadow-sm hover:scale-[1.02]"
          title="Describe how you want your posts to be tailored"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>My Post Style</span>
        </button>
      </header>

      {/* App Creator Workspace Quick-Access banner */}
      {isAppCreator && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-cyan-950 border-b border-emerald-800/40 px-6 py-3 flex flex-wrap items-center justify-between gap-4 animate-fadeIn" id="creator-download-banner">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-sans flex items-center gap-1.5">
                <span>Aura Live Monetization Node Active</span>
                <span className="text-[9px] bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">● ONLINE</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Verified Account: {currentUser.email || userProfile?.email || 'Bios Styles Creator Node'} | Connected OPAY Node Balance: <strong className="text-emerald-400">${(paymentConfig.totalMonetizedAmount || 0).toFixed(5)} USD</strong> (~₦{((paymentConfig.totalMonetizedAmount || 0) * 1630).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('monetization')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono text-[11px] font-bold rounded-lg border border-emerald-400/30 transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
              Open Live Revenue Ledger
            </button>
          </div>
        </div>
      )}

      {/* PWA Add to Home Screen Prompt Banner (PWA-Free) */}
      {showPwaBanner && (
        <div className="bg-gradient-to-r from-cyan-950/85 via-[#0A0F1D]/95 to-violet-950/85 border-b border-cyan-500/20 px-6 py-3 flex flex-wrap items-center justify-between gap-4 animate-fadeIn" id="pwa-install-banner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 flex items-center justify-center border border-cyan-500/40 text-cyan-400 relative">
              <img src="/icon.svg" className="w-5 h-5 object-contain" alt="" />
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 absolute opacity-20" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-sans flex items-center gap-1.5">
                Install Aura App (PWA-Free)
                <span className="text-[9px] bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold">Free Instant Install</span>
              </h4>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Add Aura to your phone's Home Screen to run it in elegant fullscreen standalone mode without any browser address bar!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallPWA}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold rounded-lg border border-cyan-400/20 shadow-md shadow-cyan-950/30 transition flex items-center gap-1.5 hover:scale-[1.01]"
              id="btn-pwa-install-trigger"
            >
              📱 Install App (Free)
            </button>
            <button
              onClick={handleDismissPwa}
              className="px-2.5 py-1.5 text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded border border-transparent hover:border-slate-800 transition"
              id="btn-pwa-dismiss"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* NAVIGATION SIDEBAR & MOBILE MENU */}
        <NavigationSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab as any)}
          unreadNotifCount={unreadNotifCount}
          username={username}
          avatar={avatar}
          userStatus={userStatus}
          isAppCreator={isAppCreator}
          isAdmin={userProfile?.role === 'admin'}
          onLogout={handleLogOut}
          theme={theme}
        />

        {/* RIGHT HAND VIEW CONTENT AREA (9 Columns) */}
        <main className="md:col-span-9" id="main-content-view">
          {activeTab === 'home' && (
            <HomeScreen
              username={username}
              avatar={avatar}
              posts={posts}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onAddPost={handleAddPost}
              theme={theme}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'calls' && (
            <CallsSection
              currentUserName={username}
              currentUserAvatar={avatar}
              theme={theme}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsSection
              currentUserId={currentUser?.uid}
              currentUserName={username}
              currentUserAvatar={avatar}
              onOpenChatWithUser={(userId, _userName) => {
                setActiveTab('messages');
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              theme={theme}
            />
          )}

          {activeTab === 'profile' && keys && (
            <ProfileSection
              username={username}
              avatar={avatar}
              userStatus={userStatus}
              myPublicKey={keys.publicKey}
              userEmail={currentUser?.email || ''}
              posts={posts}
              onOpenSettings={() => setActiveTab('settings')}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              theme={theme}
            />
          )}

          {activeTab === 'feed' && keys && (
            <div className="space-y-6">
              {/* Creator-only monetization control panel (Only visible to the creator) */}
              {isAppCreator && (
                <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-cyan-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-950/20 animate-fadeIn" id="creator-feed-download-board">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <TrendingUp className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                          <span>Welcome {userProfile?.displayName || 'Admin'} (Aura Control)</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Active Monetization Engine</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Your live swarm data-to-value transformation matrix is running. Every single viewer activity, navigation step, video watch-time block and comment has been connected to your central Aura Treasury Vault.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => setShowTermuxHelper(!showTermuxHelper)}
                        className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-mono font-bold transition duration-150 border ${
                          showTermuxHelper
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                        id="btn-toggle-termux-helper"
                      >
                        📱 {showTermuxHelper ? 'Hide Integration Guide' : 'Show Mobile Android Guide'}
                      </button>
                      <button 
                        onClick={() => setActiveTab('monetization')}
                        className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-100 rounded-xl text-xs font-mono font-bold border border-emerald-400/20 shadow-md shadow-cyan-950/30 transition hover:scale-[1.01] duration-150"
                        id="btn-feed-download-source-zip"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-200" />
                        View Live Income Ledger
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Mobile APK compilation helper (Option C) */}
                  {showTermuxHelper && (
                    <div className="mt-4 p-4 bg-slate-950/90 border border-cyan-500/20 rounded-xl space-y-4 animate-slideDown">
                      <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2">
                        <span className="text-xs font-bold text-cyan-400 font-sans uppercase">Option C: Mobile Termux Compilation Protocol</span>
                        <span className="text-[9px] bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono px-1.5 py-0.5 rounded font-bold">100% Free • No PC needed</span>
                      </div>

                      {/* STEP 1: TERMUX INSTALLATION & CHROME ALTERNATIVE */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                          <span>1. Install Official Termux on Phone</span>
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          To compile Android apps on your phone, download the official, free and open-source <strong>Termux</strong> terminal app (do not use the obsolete version from Play Store):
                        </p>
                        <div className="flex flex-wrap gap-2 pl-2">
                          <a 
                            href="https://f-droid.org/packages/com.termux/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] text-cyan-400 bg-cyan-950/80 hover:bg-cyan-900 px-3 py-1.5 border border-cyan-800 rounded-lg font-mono transition inline-block font-semibold"
                          >
                            🔗 Enter Termux (F-Droid)
                          </a>
                          <a 
                            href="https://termux.dev/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 border border-slate-700 rounded-lg font-mono transition inline-block"
                          >
                            🌐 Official Termux site
                          </a>
                        </div>

                        {/* HIGHLY EXPLICIT GOOGLE SEARCH ALTERNATIVE */}
                        <div className="mt-2 p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg">
                          <strong className="text-xs text-amber-400 block mb-1">🔒 Google Search / Chrome download block bypass:</strong>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            Sometimes, mobile Google Chrome blocks clicking direct links or installing packages due to sandbox security warnings. If you are unable to download from links above:
                          </p>
                          <ol className="list-decimal list-inside text-[10px] text-slate-400 mt-1 pl-1 space-y-1 font-mono">
                            <li>Open Google Search in your browser (Chrome/Firefox/Opera).</li>
                            <li>Search for: <strong className="text-amber-300 font-bold">&quot;Termux F-Droid&quot;</strong> or <strong className="text-amber-300 font-bold">&quot;F-Droid Termux download&quot;</strong>.</li>
                            <li>Click the first official result (from f-droid.org), download the free APK, and install it.</li>
                            <li>Use this exact same Google search alternative method if Chrome restricts other direct downloads.</li>
                          </ol>
                        </div>
                      </div>

                      {/* STEP 2: CHROME REPO DOWNLOAD ALTERNATIVE */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-cyan-300 font-mono">2. Download and Extract the Project ZIP</span>
                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          Download the full project zip using the <strong>Download Project ZIP</strong> button above. If Chrome prevents this download, search Google for your site link or open it in another browser, then download.
                        </p>
                      </div>

                      {/* STEP 3: TERMINAL COMMANDS */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-cyan-300 font-mono">3. Open Termux & run compiling instructions:</span>
                        <p className="text-[11px] text-slate-400 font-sans pl-1">
                          Paste these commands one after another in your Termux app:
                        </p>

                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-cyan-500 block mb-0.5">A. Allow Phone Storage access & install Node/Git:</span>
                            <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[10px] font-mono text-cyan-400 select-all font-semibold">
                              termux-setup-storage && pkg update && pkg install nodejs git python make clang unzip -y
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-mono text-cyan-500 block mb-0.5">B. Copy zip from downloads and unzip it:</span>
                            <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[10px] font-mono text-cyan-400 select-all font-semibold space-y-1">
                              <div>cp /sdcard/Download/aura-project.zip .</div>
                              <div>unzip aura-project.zip</div>
                              <div>cd aura-project</div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-mono text-cyan-500 block mb-0.5">C. Install dependencies, build web apps & compile APK:</span>
                            <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[10px] font-mono text-cyan-400 select-all font-semibold space-y-1">
                              <div>npm install</div>
                              <div>npm run build</div>
                              <div>npx cap sync android</div>
                              <div>cd android && ./gradlew assembleDebug</div>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-mono text-cyan-500 block mb-0.5">D. Move compiled APK back to phone downloads to install:</span>
                            <div className="bg-slate-900 p-2.5 rounded border border-slate-850 text-[10px] font-mono text-cyan-400 select-all font-semibold">
                              cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/aura-debug.apk
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 italic pl-1 font-sans">
                              👉 Now go to your phone Files / Downloads app, look for <strong>aura-debug.apk</strong> and install it for free!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Upgrades notice for Standard Users & Creator */}
              <div className="bg-gradient-to-r from-amber-950/20 via-slate-950 to-violet-950/20 border border-amber-800/30 rounded-2xl p-5 space-y-4 shadow-lg animate-fadeIn" id="direct-feed-upgrade-board">
                <div className="flex items-center justify-between flex-wrap gap-2 text-amber-400 font-bold font-sans text-sm">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>⭐ Get Aura Ultimate Core Upgrade & Remove Ads</span>
                  </div>

                  {/* Hover-enabled info icon with floating tooltip */}
                  <div className="relative group/tooltip inline-block cursor-help">
                    <div className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition shadow">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tier Advantages</span>
                    </div>

                    {/* Floating Tooltip Explaining Technical Advantages in Detail */}
                    <div className="absolute right-0 sm:right-auto sm:-left-20 top-full mt-2 w-72 sm:w-80 bg-slate-950 border border-amber-500/50 rounded-xl p-3.5 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none group-hover/tooltip:pointer-events-auto z-50 text-left font-sans space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-900/50 pb-1.5 font-mono text-[10px] text-amber-400 font-bold uppercase">
                        <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-400" /> Technical Advantages</span>
                        <span>Aura Core</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Technical benefits unlocked on higher membership tiers:
                      </p>
                      <ul className="space-y-1.5 text-[10px] text-slate-300 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold font-mono">⚡</span>
                          <span><strong>Zero-Queue AI Acceleration:</strong> Direct priority processing with zero queuing latency on Gemini Flash & Omni endpoints.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold font-mono">🔒</span>
                          <span><strong>Offline Edge Storage:</strong> Up to 50GB cloud & IndexedDB offline encryption keys for zero-trust storage.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold font-mono">🚫</span>
                          <span><strong>100% Ad-Free Web Experience:</strong> Complete exemption from sponsor banners and Google AdSense units.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-fuchsia-400 font-bold font-mono">👑</span>
                          <span><strong>Sovereign W3C Badge:</strong> Cryptographically signed Gold / Superstar badge across all gossip mesh nodes.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Want to experience the <strong className="text-amber-300">Highest Version of Aura</strong> (Enterprise Ultra Node with offline edge databases, advanced cryptographic keys, and unlimited bandwidth) or <strong className="text-amber-300">Remove All Advertisements Permanently</strong>? 
                  Simply make a direct payment to the verified creator account below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-3 border border-slate-900 rounded-xl font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 block">Bank Service</span>
                    <strong className="text-slate-200 text-sm font-semibold">{paymentConfig.bankName}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-slate-500 block">Account Number</span>
                    <strong className="text-cyan-400 text-sm font-bold select-all cursor-pointer hover:underline animate-pulse" title="Click to copy account number">{paymentConfig.accountNumber}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-sans bg-amber-950/60 border border-amber-900/40 text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    💎 Highest Version: Full local bandwidth, offline sync keys & enterprise tools
                  </span>
                  <span className="text-[10px] font-sans bg-cyan-950/60 border border-cyan-900/40 text-cyan-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    🚫 Remove Ads: Permanent ad-blocking across all peer interfaces
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 font-sans italic">
                  *Once transfer is complete, send a message or payment receipt screenshot to the creator via the <strong className="text-slate-300">Messages</strong> tab to instantly activate your unlimited license!
                </p>
              </div>

              <FeedSection
                posts={filteredPosts}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                currentUserKey={keys.publicKey}
                currentPrivateKey={keys.privateKey}
                username={username}
                avatar={avatar}
                balance={balance}
                onUpdateBalance={setBalance}
                theme={theme}
                isPremium={isPremium}
                isCreatorVerified={isCreatorVerified}
                postPreference={postPreference}
                onOpenPreferenceModal={() => setShowPostPrefModal(true)}
                onUpdateIdentity={(newUsername, newAvatar, _newBio, newKeys) => {
                  if (newUsername) setUsername(newUsername);
                  if (newAvatar) setAvatar(newAvatar);
                  if (newKeys) {
                    setKeys(newKeys);
                    localStorage.setItem('aether_p2p_keys', JSON.stringify(newKeys));
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'omnimind' && (
            <OmniMindSection
              username={username}
              avatar={avatar}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onAnimateImage={handleAnimateImage}
            />
          )}

          {activeTab === 'search' && (
            <SearchSection
              username={username}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'videogen' && (
            <TextToVideoStudio
              username={username}
              avatar={avatar}
              initialImageUrl={videoInitialImage}
              initialPrompt={videoInitialPrompt}
              onShareToFeed={(postData) => {
                const newPost: FeedPost = {
                  id: `post_vid_${Date.now()}`,
                  authorName: username,
                  authorPublicKey: keys?.publicKey || 'user_pubkey_local',
                  authorAvatar: avatar,
                  type: 'play',
                  title: postData.title,
                  content: postData.content || '',
                  mediaUrl: postData.mediaUrl,
                  timestamp: Date.now(),
                  signature: 'sig_local_veo_video_gen',
                  likes: 0,
                  commentsCount: 0,
                  comments: [],
                  isAiPost: true,
                  aiModel: postData.aiModel || 'Veo 3.1',
                  aiQualityTier: postData.aiQualityTier || 'HD Cinematic',
                  aiCapabilities: postData.aiCapabilities || ['Text-to-Video', 'Neural Motion']
                };
                handleAddPost(newPost);
                setActiveTab('feed');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
              theme={theme}
            />
          )}

          {activeTab === 'imagegen' && (
            <HighQualityImageStudio
              username={username}
              avatar={avatar}
              onAnimateImage={handleAnimateImage}
              onShareToFeed={(postData) => {
                const newPost: FeedPost = {
                  id: `post_img_${Date.now()}`,
                  authorName: username,
                  authorPublicKey: keys?.publicKey || 'user_pubkey_local',
                  authorAvatar: avatar,
                  type: (postData.type as any) || 'media',
                  content: postData.content || '',
                  mediaUrl: postData.mediaUrl,
                  timestamp: Date.now(),
                  signature: 'sig_local_image_gen',
                  likes: 0,
                  commentsCount: 0,
                  comments: [],
                  isAiPost: true,
                  aiModel: postData.aiModel,
                  aiQualityTier: postData.aiQualityTier,
                  aiCapabilities: postData.aiCapabilities
                };
                handleAddPost(newPost);
                setActiveTab('feed');
              }}
              onSetAvatar={(newAvatar) => {
                setAvatar(newAvatar);
                if (keys) {
                  saveUserProfile(keys.publicKey, {
                    username,
                    avatar: newAvatar
                  }).catch(e => console.warn("Failed saving avatar to db:", e));
                }
              }}
              theme={theme}
            />
          )}

          {activeTab === 'aitools' && (
            <AiToolsSection
              username={username}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'mycreations' && (
            <MyCreationsSection
              username={username}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onAnimateImage={handleAnimateImage}
            />
          )}

          {activeTab === 'audio' && (
            <AudioTranscriberStudio
              username={username}
              avatar={avatar}
              onShareToFeed={(postData) => {
                const newPost: FeedPost = {
                  id: `post_aud_${Date.now()}`,
                  authorName: username,
                  authorPublicKey: keys?.publicKey || 'user_pubkey_local',
                  authorAvatar: avatar,
                  type: (postData.type as any) || 'voice',
                  content: postData.content || '',
                  voiceUrl: postData.voiceUrl,
                  voiceDuration: postData.voiceDuration,
                  timestamp: Date.now(),
                  signature: 'sig_local_audio_transcribe',
                  likes: 0,
                  commentsCount: 0,
                  comments: [],
                  isAiPost: true,
                  aiModel: postData.aiModel,
                  aiQualityTier: postData.aiQualityTier,
                  aiCapabilities: postData.aiCapabilities
                };
                handleAddPost(newPost);
                setActiveTab('feed');
              }}
              theme={theme}
            />
          )}

          {activeTab === 'wallet' && keys && (
            !isCreatorVerified ? (
              <div className={`border rounded-2xl p-8 max-w-md mx-auto space-y-6 text-center shadow-xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-900'
              }`}>
                <div className="relative w-16 h-16 mx-auto bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-base font-bold font-sans uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                    Creator Security Checkpoint
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Access to creator balances, instant cash-out routing registers, and direct payout history logs is strictly isolated. Please verify your cryptographic authority.
                  </p>
                </div>

                <form onSubmit={handleGateUnlock} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-500 uppercase block tracking-wider font-bold">Creator Access Passcode</label>
                    <input
                      type="password"
                      value={gatePasscode}
                      onChange={e => setGatePasscode(e.target.value)}
                      placeholder="Enter Security Token"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {gateError && (
                    <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded-xl text-center">
                      {gateError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-center transition animate-pulse"
                  >
                    Verify Authority
                  </button>
                </form>

                <div className="border-t border-slate-900/60 pt-4 text-[10px] text-slate-500 font-mono space-y-1">
                  <div>● Standard mesh peers have no ledger access.</div>
                  <div>● Only authorized creators can view financial metrics.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsCreatorVerified(false)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-mono flex items-center gap-1.5 transition uppercase"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Creator Space
                  </button>
                </div>
                <WalletSection
                  username={username}
                  myPublicKey={keys.publicKey}
                  balance={balance}
                  setBalance={setBalance}
                />
              </div>
            )
          )}

          {activeTab === 'reviews' && keys && (
            <ReviewsSection
              username={username}
              myPublicKey={keys.publicKey}
              myPrivateKey={keys.privateKey}
              reviews={filteredReviews}
              onAddReview={handleAddReview}
              onHelpfulToggle={handleHelpfulToggle}
              isAppCreator={isAppCreator}
            />
          )}

          {activeTab === 'studio' && (
            <StudioSection
              characters={filteredCharacters}
              screenplay={filteredScreenplay}
              onAddCharacter={handleAddCharacter}
              onUpdateCharacter={handleUpdateCharacter}
              onDeleteCharacter={handleDeleteCharacter}
              onUpdateScreenplay={handleUpdateScreenplay}
            />
          )}

          {activeTab === 'network' && keys && (
            <NetworkMap
              nodes={filteredNodes}
              posts={filteredPosts}
              myPublicKey={keys.publicKey}
              myPrivateKey={keys.privateKey}
              onRefreshNodes={handleRefreshNodes}
              onGenerateNewKeys={handleGenerateNewKeys}
              onAddNode={handleAddNode}
              onRemoveNode={handleRemoveNode}
              isAppCreator={isAppCreator}
            />
          )}

          {activeTab === 'settings' && keys && (
            <SettingsModal
              username={username}
              avatar={avatar}
              userStatus={userStatus}
              onUpdateProfile={handleUpdateProfile}
              onClearCache={handleClearCache}
              myPublicKey={keys.publicKey}
              theme={theme}
              setTheme={setTheme}
              language={language}
              setLanguage={setLanguage}
              currentUserEmail={currentUser?.email || ''}
              isAppCreator={isAppCreator}
              uid={currentUser?.uid}
            />
          )}

          {activeTab === 'discovery' && keys && (
            <SovereignDiscoverySection
              posts={posts}
              onAddPost={handleAddPost}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              currentUserKey={keys.publicKey}
              currentPrivateKey={keys.privateKey}
              username={username}
              avatar={avatar}
              balance={balance}
              onUpdateBalance={setBalance}
              isPremium={isPremium}
            />
          )}

          {activeTab === 'monetization' && keys && (
            !(isAppCreator || isCreatorVerified) ? (
              <div className={`border rounded-2xl p-8 max-w-md mx-auto space-y-6 text-center shadow-xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-900'
              }`}>
                <div className="relative w-16 h-16 mx-auto bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-base font-bold font-sans uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                    Creator Security Checkpoint
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Access to ad networks, subscription plans, billing modules, and creator revenue dashboards is strictly isolated. Please verify your cryptographic authority.
                  </p>
                </div>

                <form onSubmit={handleGateUnlock} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-500 uppercase block tracking-wider font-bold">Creator Access Passcode</label>
                    <input
                      type="password"
                      value={gatePasscode}
                      onChange={e => setGatePasscode(e.target.value)}
                      placeholder="Enter Security Token"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-center tracking-widest text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {gateError && (
                    <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-900/30 p-2 rounded-xl text-center">
                      {gateError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-center transition animate-pulse"
                  >
                    Verify Authority
                  </button>
                </form>

                <div className="border-t border-slate-900/60 pt-4 text-[10px] text-slate-500 font-mono space-y-1">
                  <div>● Standard mesh peers have no ledger access.</div>
                  <div>● Only authorized creators can view financial metrics.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsCreatorVerified(false)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-mono flex items-center gap-1.5 transition uppercase"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Creator Space
                  </button>
                </div>
                <MonetizationSection
                  username={username}
                  myPublicKey={keys.publicKey}
                  balance={balance}
                  onUpdateBalance={setBalance}
                  theme={theme}
                  isPremium={isPremium}
                  setIsPremium={setIsPremium}
                  isBusiness={isBusiness}
                  setIsBusiness={setIsBusiness}
                  onAddSponsoredPost={handleAddSponsoredPost}
                  sponsoredAds={sponsoredAds}
                  setSponsoredAds={setSponsoredAds}
                  transactions={transactions}
                  setTransactions={setTransactions}
                  isAppCreator={isAppCreator}
                />
              </div>
            )
          )}

          {activeTab === 'videos' && keys && (
            <VideoTheaterSection
              posts={posts}
              onAddPost={handleAddPost}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              balance={balance}
              onUpdateBalance={setBalance}
              transactions={transactions}
              setTransactions={setTransactions}
              isPremium={isPremium}
              theme={theme}
              username={username}
              avatar={avatar}
              isAppCreator={isAppCreator}
              onNavigateToTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'messages' && currentUser && (
            <MessagingSection
              currentUserId={currentUser.uid}
              currentUserName={username}
              currentUserAvatar={avatar}
            />
          )}

          {activeTab === 'notifications' && currentUser && (
            <NotificationsSection
              currentUserId={currentUser.uid}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'admin' && currentUser && userProfile?.role === 'admin' && (
            <AdminDashboardSection
              adminUserId={currentUser.uid}
              adminUserName={username}
            />
          )}
        </main>
      </div>

      {/* Welcome Privacy & Terms Onboarding Modal */}
      <WelcomePrivacyModal
        isOpen={showWelcomePrivacyModal}
        onAgreeAndContinue={(enableLocationSafety) => {
          localStorage.setItem('omnisphere_terms_accepted', 'true');
          localStorage.setItem('omnisphere_location_safety', enableLocationSafety ? 'true' : 'false');
          setShowWelcomePrivacyModal(false);
        }}
        onDeclineAndExit={() => {
          // Graceful exit
        }}
      />

      {/* Web PWA Friendly Installation Prompt Banner */}
      <WebInstallBanner onInstall={handleInstallPWA} />

      {/* Download App to Home Screen Modal */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerNativeInstall={handleTriggerNativeInstall}
      />

      {/* Weekly App Updates & Release Notes Modal */}
      <WhatsNewModal
        isOpen={showWhatsNewModal}
        onClose={() => setShowWhatsNewModal(false)}
        updates={appUpdates}
        currentVersion={currentRunningVersion}
      />

      {/* 2-Hour Offline Usage Enforcement Modal */}
      <OfflineTrialLockModal isOffline={isOffline} />

      {/* Footer Branding */}
      <footer className="border-t border-slate-900/60 bg-[#05080E] py-4 text-center text-xs font-mono text-slate-600 mt-auto flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <span>Aura Swarm Network © 2026 • Encrypted Sovereign Digital Mesh</span>
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Zero Surveillance Server Architecture
        </span>
      </footer>
    </div>
  );
}
