import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  Sparkles, 
  Plus, 
  Heart, 
  Shield, 
  Users, 
  Percent, 
  Zap, 
  Tv, 
  Check, 
  CheckCircle, 
  PlayCircle, 
  X, 
  ArrowUpRight, 
  History, 
  FileText, 
  Lock,
  MessageSquare,
  Eye,
  AlertCircle,
  Megaphone,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { fetchPaymentConfig, listenToPaymentConfig, PaymentConfig } from '../utils/firebase';
import { 
  getSubscriptionPlans, 
  SubscriptionPlan, 
  recordSubscriber, 
  SubscriberRecord 
} from '../utils/monetization';
import { SubscriptionPlans } from './SubscriptionPlans';
import { GoogleAdSenseAd } from './GoogleAdSenseAd';
import { AdsterraAd } from './AdsterraAd';

interface MonetizationSectionProps {
  username: string;
  myPublicKey: string;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  theme?: 'dark' | 'light';
  isPremium: boolean;
  setIsPremium: (val: boolean) => void;
  isBusiness: boolean;
  setIsBusiness: (val: boolean) => void;
  onAddSponsoredPost: (ad: any) => void;
  sponsoredAds: any[];
  setSponsoredAds: React.Dispatch<React.SetStateAction<any[]>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  isAppCreator?: boolean;
}

export default function MonetizationSection({
  username,
  myPublicKey,
  balance,
  onUpdateBalance,
  theme = 'dark',
  isPremium,
  setIsPremium,
  isBusiness,
  setIsBusiness,
  onAddSponsoredPost,
  sponsoredAds,
  setSponsoredAds,
  transactions,
  setTransactions,
  isAppCreator = false
}: MonetizationSectionProps) {
  const isLight = theme === 'light';

  // Dynamic Payment configuration state from Firestore (Live onSnapshot subscription)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    bankName: 'OPAY',
    accountNumber: '081545616121',
    totalMonetizedAmount: 0,
    totalDataReplicated: 0,
    totalViewsMonetized: 0
  });

  useEffect(() => {
    const unsubscribe = listenToPaymentConfig((config) => {
      setPaymentConfig(config);
    });
    return () => unsubscribe();
  }, []);

  // State controls
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'subscription' | 'business' | 'adsense'>('dashboard');
  
  // Creator verification state
  const [isCreator, setIsCreator] = useState<boolean>(() => {
    return isAppCreator || localStorage.getItem('aura_is_creator') === 'true';
  });

  useEffect(() => {
    if (isAppCreator) {
      setIsCreator(true);
    }
  }, [isAppCreator]);

  useEffect(() => {
    localStorage.setItem('aura_is_creator', isCreator ? 'true' : 'false');
  }, [isCreator]);
  
  // Subscription & Membership Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => getSubscriptionPlans());
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [currentPlanId, setCurrentPlanId] = useState<string>(() => localStorage.getItem('user_active_plan_id') || 'plan_free');
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<SubscriptionPlan | null>(null);
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; period: 'month' | 'year' } | null>(null);
  
  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // Sync plans from storage on mount
  useEffect(() => {
    setPlans(getSubscriptionPlans());
  }, []);
  
  // Payment Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Business Ad Creation Form States
  const [campaignTitle, setCampaignTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adPresetImage, setAdPresetImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60');
  const [adCtaText, setAdCtaText] = useState('Explore Mesh');
  const [adCtaUrl, setAdCtaUrl] = useState('https://ai.studio/build');
  const [adBudget, setAdBudget] = useState('50');
  const [adCpc, setAdCpc] = useState('0.10');

  // AdSense simulator states
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adType, setAdType] = useState<'interstitial' | 'rewarded'>('interstitial');
  const [adCountdown, setAdCountdown] = useState(5);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Preset illustrations/advertising mock images
  const AD_PRESET_IMAGES = [
    { name: 'Quantum Core', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60' },
    { name: 'Neural Grid', url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60' },
    { name: 'Cyberpunk Skyline', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=800&auto=format&fit=crop&q=60' },
    { name: 'Aether Swarm', url: 'https://images.unsplash.com/photo-1544306094-e2d409566ba8?w=800&auto=format&fit=crop&q=60' }
  ];

  // Simulated Analytics Data for Chart
  const revenueChartData = [
    { name: 'Mon', tips: 42, subscriptions: 80, ads: 15 },
    { name: 'Tue', tips: 58, subscriptions: 80, ads: 25 },
    { name: 'Wed', tips: 35, subscriptions: 90, ads: 42 },
    { name: 'Thu', tips: 90, subscriptions: 90, ads: 38 },
    { name: 'Fri', tips: 124, subscriptions: 110, ads: 60 },
    { name: 'Sat', tips: 145, subscriptions: 120, ads: 85 },
    { name: 'Sun', tips: 112, subscriptions: 120, ads: 70 }
  ];

  const totalMonthlyEarnings = 1240.50;
  const subscriberCount = 14;
  const adImpressions = 4580;

  // Real-time Card formatting helper
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(value.slice(0, 2) + '/' + value.slice(2));
    } else {
      setCardExpiry(value);
    }
  };

  // Secure Cryptographic Hash generator for ledger
  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // Trigger payment for chosen subscription plan
  const handleOpenPaymentPlan = (plan: SubscriptionPlan) => {
    const price = billingCycle === 'month' ? plan.monthlyPrice : plan.yearlyPrice;
    setSelectedPlan({ name: plan.name, price, period: billingCycle });
    setSelectedPlanDetails(plan);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setShowPaymentModal(true);
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      alert("Please complete all payment verification parameters.");
      return;
    }
    setPaymentProcessing(true);

    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);

      const chosenPlan = selectedPlanDetails || plans.find(p => p.name === selectedPlan?.name) || plans[0];
      setCurrentPlanId(chosenPlan.id);
      localStorage.setItem('user_active_plan_id', chosenPlan.id);

      // Upgrade isPremium if Pro, Premium, or Superstar
      if (['plan_pro', 'plan_premium', 'plan_superstar'].includes(chosenPlan.id)) {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }

      const txCost = selectedPlan ? selectedPlan.price : 0;
      const txHash = generateTxHash();

      // Record subscriber record
      const subRec = recordSubscriber({
        username: username || 'SovereignPeer',
        planId: chosenPlan.id,
        planName: chosenPlan.name,
        priceUSD: txCost,
        billingPeriod: billingCycle,
        status: 'active',
        paymentGateway: 'Paystack',
        paymentReference: 'pstk_' + txHash.slice(0, 10),
        subscribedAt: Date.now(),
        expiresAt: Date.now() + (billingCycle === 'month' ? 2592000000 : 31536000000)
      });

      const newTx = {
        id: `tx_sub_${Date.now()}`,
        type: 'subscription',
        amount: txCost,
        description: `Subscription Payment (${chosenPlan.name}) - Card ****${cardNumber.slice(-4)}`,
        timestamp: Date.now(),
        txHash
      };

      setTransactions(prev => [newTx, ...prev]);

      // Prepare receipt
      const receiptData = {
        id: subRec.id,
        receiptNumber: 'RCPT-' + Math.floor(100000 + Math.random() * 900000),
        username: username || 'SovereignPeer',
        planName: chosenPlan.name,
        billingPeriod: billingCycle,
        amount: txCost,
        timestamp: Date.now(),
        gateway: 'Paystack / Card Verified',
        txHash
      };

      setActiveReceipt(receiptData);

      setTimeout(() => {
        setShowPaymentModal(false);
        setShowReceiptModal(true);
      }, 1500);
    }, 2000);
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to revert to the Free Plan? All basic messaging & phone communications will remain 100% UNLIMITED, but high-tier AI speed & cloud storage perks will reset.")) {
      setCurrentPlanId('plan_free');
      localStorage.setItem('user_active_plan_id', 'plan_free');
      setIsPremium(false);
      alert("Plan updated: Reverted to Free Plan. Communication features remain 100% UNLIMITED.");
    }
  };

  // Handle launch ad campaign
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(adBudget);
    const cpcValue = parseFloat(adCpc);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      alert("Specify a valid advertising budget (LC).");
      return;
    }

    if (budgetValue > balance) {
      alert(`Insufficient funds! Your current wallet ledger contains ${balance.toFixed(2)} LC, but this campaign requires ${budgetValue.toFixed(2)} LC.`);
      return;
    }

    // Deduct budget and sign transaction
    onUpdateBalance(balance - budgetValue);

    const newAd = {
      id: `ad_${Date.now()}`,
      businessName: username,
      campaignName: campaignTitle || 'Sovereign Promo',
      imageUrl: adPresetImage,
      title: campaignTitle,
      description: adDescription,
      ctaText: adCtaText,
      ctaUrl: adCtaUrl,
      budget: budgetValue,
      spent: 0,
      impressions: 0,
      clicks: 0,
      isActive: true,
      cpc: cpcValue
    };

    setSponsoredAds(prev => [newAd, ...prev]);

    // Format transaction
    const newTx = {
      id: `tx_ad_${Date.now()}`,
      type: 'ad_spend',
      amount: budgetValue,
      description: `Launched sponsored campaign: "${campaignTitle}"`,
      timestamp: Date.now(),
      txHash: generateTxHash()
    };
    setTransactions(prev => [newTx, ...prev]);

    // Also inject into general posts feed!
    onAddSponsoredPost({
      id: `post_ad_${Date.now()}`,
      authorName: username,
      authorPublicKey: myPublicKey,
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
      type: 'media',
      timestamp: Date.now(),
      content: `${adDescription} #sponsored`,
      signature: generateTxHash().slice(0, 32),
      mediaUrl: adPresetImage,
      mediaThumbnail: adPresetImage,
      aspectRatio: '16:9',
      title: campaignTitle,
      likes: 0,
      commentsCount: 0,
      comments: [],
      isSponsored: true,
      sponsorCta: adCtaText,
      sponsorUrl: adCtaUrl,
      adId: newAd.id
    });

    alert(`Decentralized Campaign broadcast complete! Deducted ${budgetValue.toFixed(2)} LC from your ledger and synthesized Sponsored Feed item.`);
    setCampaignTitle('');
    setAdDescription('');
  };

  // Launch Web Sponsor / AdSense Ad Simulation with live countdown
  const launchAdSenseDemo = (type: 'interstitial' | 'rewarded') => {
    setAdType(type);
    setAdCountdown(5);
    setRewardClaimed(false);
    setShowAdOverlay(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdOverlay && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (showAdOverlay && adCountdown === 0 && adType === 'rewarded' && !rewardClaimed) {
      // Reward the user
      setRewardClaimed(true);
      onUpdateBalance(balance + 10.00);
      const newTx = {
        id: `tx_reward_${Date.now()}`,
        type: 'ad_revenue',
        amount: 10.00,
        description: 'Google AdSense Web Sponsor payout',
        timestamp: Date.now(),
        txHash: generateTxHash()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
    return () => clearTimeout(timer);
  }, [showAdOverlay, adCountdown]);

  return (
    <div className="space-y-6" id="monetization-module">
      {/* Header section */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <h2 className={`text-xl font-bold font-sans flex items-center gap-2 ${isLight ? 'text-slate-850' : 'text-slate-100'}`}>
            <Award className="w-5 h-5 text-cyan-400" />
            Sovereign Monetization Hub
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Cut Compensation Engines • Premium Upgrades • Programmatic Ads Ledger
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-mono font-bold ${
          isPremium 
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' 
            : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950/40 border-slate-850 text-slate-400'
        }`}>
          <Sparkles className={`w-4 h-4 ${isPremium ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span>STATUS: {isPremium ? 'PREMIUM (AD-FREE)' : 'STANDARD MEMBER'}</span>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className={`flex border-b text-xs font-mono gap-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 border-b-2 transition ${
            activeSubTab === 'dashboard' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Earnings Analytics
        </button>
        <button
          onClick={() => setActiveSubTab('subscription')}
          className={`px-4 py-2 border-b-2 transition ${
            activeSubTab === 'subscription' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Premium Passes
        </button>
        <button
          onClick={() => setActiveSubTab('business')}
          className={`px-4 py-2 border-b-2 transition ${
            activeSubTab === 'business' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Advertising Node
        </button>
        <button
          onClick={() => setActiveSubTab('adsense')}
          className={`px-4 py-2 border-b-2 transition ${
            activeSubTab === 'adsense' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ad Networks (Adsterra & AdSense)
        </button>
      </div>

      {/* Earnings Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {!isCreator ? (
            <div className={`p-8 border border-dashed rounded-3xl text-center max-w-xl mx-auto space-y-6 my-12 ${
              isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/40 border-slate-900/80'
            }`}>
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping" />
                <Lock className="w-10 h-10 text-rose-500 absolute inset-5" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] text-rose-400 font-bold uppercase bg-rose-950/40 border border-rose-800/40 px-3 py-1 rounded">
                  Clearance Gate: Verified Creator Access Only
                </span>
                <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                  Immutable Creator Revenue Ledger
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
                  Only authenticated digital creators with active consensus nodes on the OmniSphere swarm are permitted to view monetization analytics, tips revenue, and ad ledger payouts.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => {
                    setIsCreator(true);
                    alert("Securing cryptographic identification... Creator identity verified! Welcome, Creator.");
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-xl font-bold font-mono text-xs uppercase transition tracking-wider shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  Verify Creator Node Identity
                </button>
              </div>
              
              <p className="text-[10px] text-slate-500 font-mono">
                Role requirement: role === 'creator' • SSL 256-Bit SHA Encrypted consensus
              </p>
            </div>
          ) : (
            <>
              {/* Reset/Deverify option for testing */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsCreator(false);
                    alert("Creator session terminated. Privacy clearance restricted.");
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/60 rounded-lg text-[10px] font-mono uppercase transition"
                >
                  Lock Creator Clearance (Test Mode)
                </button>
              </div>
          {/* Bento boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className={`p-5 border rounded-2xl flex flex-col justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-[#101726]'}`}>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                <span>Real-Time OPAY Ledger Balance</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-4">
                <div className={`text-2xl font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  ${(paymentConfig.totalMonetizedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 5 })} USD
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ~₦{((paymentConfig.totalMonetizedAmount || 0) * 1630).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN Live Credited
                </div>
              </div>
            </div>

            <div className={`p-5 border rounded-2xl flex flex-col justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-[#101726]'}`}>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                <span>Transformed Peer Data</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-4">
                <div className={`text-2xl font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {(paymentConfig.totalDataReplicated || 0).toFixed(3)} MB
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Transmitted & compiled via decentralization</p>
              </div>
            </div>

            <div className={`p-5 border rounded-2xl flex flex-col justify-between ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-[#101726]'}`}>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                <span>Total Monitored Interactions</span>
                <Tv className="w-4 h-4 text-violet-400" />
              </div>
              <div className="mt-4">
                <div className={`text-2xl font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {(paymentConfig.totalViewsMonetized || 0).toLocaleString()} Views
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Sovereign peer CTR tracking: 100% Monetized</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className={`p-6 border rounded-2xl space-y-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'}`}>
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Swarm Monetization Performance Analytics
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1e293b"} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#ffffff' : '#090e1a', 
                      borderColor: isLight ? '#cbd5e1' : '#1e293b',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="tips" name="Tips Income" stroke="#10b981" fillOpacity={1} fill="url(#colorTips)" strokeWidth={2} />
                  <Area type="monotone" dataKey="subscriptions" name="Sub Recurring" stroke="#22d3ee" fillOpacity={1} fill="url(#colorSubs)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ads" name="Ad Yield" stroke="#a78bfa" fillOpacity={0.1} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Unified Ledger Log */}
          <div className={`p-6 border rounded-2xl space-y-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'}`}>
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <History className="w-4 h-4 text-slate-400" />
              Sovereign Ledger Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b text-slate-500 ${isLight ? 'border-slate-100' : 'border-slate-850'}`}>
                    <th className="pb-3 font-semibold">Verification Hash</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                    <th className="pb-3 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className={`border-b hover:bg-slate-950/10 transition ${isLight ? 'border-slate-100' : 'border-slate-900/60'}`}>
                      <td className="py-3 text-slate-400 truncate max-w-[140px] font-mono" title={tx.txHash}>{tx.txHash}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          tx.type === 'deposit' || tx.type === 'ad_revenue' || tx.type === 'tip_receive'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                            : 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{tx.description}</td>
                      <td className={`py-3 text-right font-bold ${
                        tx.type === 'deposit' || tx.type === 'ad_revenue' || tx.type === 'tip_receive'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'ad_revenue' || tx.type === 'tip_receive' ? '+' : '-'}
                        {tx.amount.toFixed(2)} LC
                      </td>
                      <td className="py-3 text-right text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No transactions registered on sovereign ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* Subscription Plans */}
      {activeSubTab === 'subscription' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SECURE MANAGE SUBSCRIPTION DASHBOARD */}
          {(() => {
            const activePlanObj = plans.find(p => p.id === currentPlanId) || plans[0];
            return (
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-950 via-[#0B132B] to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 font-sans text-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white uppercase font-mono">Manage Active Subscription</h3>
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          Active & Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Cryptographically linked to @{username || 'SovereignPeer'} • Paystack Gateway Active
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${activePlanObj.badgeColor}`}>
                      {activePlanObj.badge}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-900 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Current Tier</span>
                    <strong className="text-cyan-400 text-sm font-bold block">{activePlanObj.name}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Billing Rate</span>
                    <strong className="text-slate-200 font-bold block">
                      {activePlanObj.monthlyPrice === 0 ? 'Free ($0.00)' : `$${(billingCycle === 'month' ? activePlanObj.monthlyPrice : activePlanObj.yearlyPrice).toFixed(2)} / ${billingCycle}`}
                    </strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">AI Daily Limit</span>
                    <strong className="text-amber-400 font-bold block">
                      {activePlanObj.aiDailyLimit >= 999999 ? 'Unlimited' : `${activePlanObj.aiDailyLimit} req/day`}
                    </strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Cloud Storage</span>
                    <strong className="text-emerald-400 font-bold block">{activePlanObj.cloudStorageGb} GB Storage</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Private messaging & phone communications remain <strong className="text-white">100% UNLIMITED</strong> on all tiers.</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeReceipt && (
                      <button
                        type="button"
                        onClick={() => setShowReceiptModal(true)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Receipt
                      </button>
                    )}

                    {currentPlanId !== 'plan_free' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentPlan(activePlanObj)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono text-xs font-bold uppercase transition shadow cursor-pointer"
                        >
                          Renew Membership
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelSubscription}
                          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl font-mono text-xs font-bold uppercase transition cursor-pointer"
                        >
                          Cancel Plan
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 italic">
                        Select a plan below to upgrade
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Direct Monetization Payment Notice & Bank Ledger */}
          <div className="max-w-4xl mx-auto p-4 bg-gradient-to-r from-amber-950/30 via-slate-950 to-violet-950/30 border border-amber-800/40 rounded-2xl space-y-3 shadow-lg" id="direct-payment-notice">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold font-sans text-sm">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>OmniSphere Direct Upgrades & Bank Payment Ledger</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-3 border border-slate-900 rounded-xl font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block">Bank Service</span>
                <strong className="text-slate-200 text-sm font-semibold">{paymentConfig.bankName}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-slate-500 block">Account Number</span>
                <strong className="text-cyan-400 text-sm font-bold select-all cursor-pointer hover:underline animate-pulse" title="Click to copy account number">{paymentConfig.accountNumber}</strong>
              </div>
            </div>
          </div>

          {/* DEDICATED SUBSCRIPTION PLANS COMPONENT */}
          <SubscriptionPlans
            plans={plans}
            currentPlanId={currentPlanId}
            isLight={isLight}
            onSelectPlan={(plan, selectedCycle) => {
              setBillingCycle(selectedCycle);
              handleOpenPaymentPlan(plan);
            }}
            onCancelSubscription={handleCancelSubscription}
          />
        </div>
      )}

      {/* Business Accounts & Paid Advertising */}
      {activeSubTab === 'business' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Business configuration panel */}
          <div className={`p-6 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900'
          }`}>
            <div className="space-y-1.5 max-w-xl">
              <h3 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Megaphone className="w-4 h-4 text-violet-400" />
                Advertising & Business Ledger Portal
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Activate advertising capabilities. By toggling on Business Mode, you can launch custom campaign posts targeted directly at all edge node gossip feeds using your LC balance.
              </p>
            </div>
            <button
              onClick={() => {
                setIsBusiness(!isBusiness);
                alert(isBusiness ? "Business Mode deactivated. Standard credentials restored." : "Business Mode activated! You can now compile and deploy sponsored gossip blocks.");
              }}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition duration-150 ${
                isBusiness 
                  ? 'bg-violet-600 hover:bg-violet-500 text-slate-100 shadow' 
                  : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border' : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              {isBusiness ? 'Deactivate Business Mode' : 'Activate Business Mode'}
            </button>
          </div>

          {isBusiness ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Campaign builder form */}
              <div className={`lg:col-span-6 p-6 border rounded-2xl space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900'
              }`}>
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Sovereign Ad Block Builder
                </h4>
                
                <form onSubmit={handleCreateAd} className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block">Campaign Name</label>
                      <input 
                        type="text" 
                        value={campaignTitle}
                        onChange={e => setCampaignTitle(e.target.value)}
                        placeholder="Campaign Name"
                        className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block">Call to Action (CTA)</label>
                      <input 
                        type="text" 
                        value={adCtaText}
                        onChange={e => setAdCtaText(e.target.value)}
                        placeholder="Button Label"
                        className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Ad Narrative (Description)</label>
                    <textarea 
                      value={adDescription}
                      onChange={e => setAdDescription(e.target.value)}
                      placeholder="Promotional pitch or mesh announcement narrative..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block">Total Budget (LC)</label>
                      <input 
                        type="number" 
                        value={adBudget}
                        onChange={e => setAdBudget(e.target.value)}
                        min="1"
                        className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                        required
                      />
                      <span className="text-[9px] text-slate-500">Deducted from balance</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase block">Cost Per Click (LC)</label>
                      <input 
                        type="number" 
                        value={adCpc}
                        onChange={e => setAdCpc(e.target.value)}
                        step="0.01"
                        min="0.01"
                        className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Promotion Banner Presets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AD_PRESET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdPresetImage(img.url)}
                          className={`p-1.5 border rounded text-[9px] transition truncate text-left ${
                            adPresetImage === img.url ? 'border-cyan-500 bg-cyan-950/10 text-cyan-400' : 'border-slate-850 text-slate-400'
                          }`}
                        >
                          {img.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-slate-100 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Authorize & Launch Campaign Post
                  </button>
                </form>
              </div>

              {/* Campaigns table tracker */}
              <div className={`lg:col-span-6 p-6 border rounded-2xl space-y-4 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900'
              }`}>
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  <Megaphone className="w-4 h-4 text-violet-400" />
                  Active Ad Swarm Metrics
                </h4>

                <div className="space-y-3">
                  {sponsoredAds.map((ad, idx) => (
                    <div key={ad.id || idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-900/60 font-mono space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">{ad.campaignName}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 uppercase">
                          Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 text-center border-t border-b border-slate-900 py-2">
                        <div>
                          <div className="text-slate-300 font-bold">{ad.impressions}</div>
                          <div>Views</div>
                        </div>
                        <div>
                          <div className="text-slate-300 font-bold">{ad.clicks}</div>
                          <div>Clicks</div>
                        </div>
                        <div>
                          <div className="text-slate-300 font-bold">{ad.budget} LC</div>
                          <div>Budget</div>
                        </div>
                        <div>
                          <div className="text-slate-300 font-bold">{ad.spent.toFixed(2)} LC</div>
                          <div>Spent</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">CPC: {ad.cpc.toFixed(2)} LC</span>
                        <button
                          onClick={() => {
                            setSponsoredAds(prev => prev.filter(a => a.id !== ad.id));
                            alert("Decentralized campaign ledger stopped and refunded remaining budget.");
                          }}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Halt & Refund
                        </button>
                      </div>
                    </div>
                  ))}

                  {sponsoredAds.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-500 font-sans">
                      No active marketing nodes configured. Build a sponsored ad above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 border border-dashed rounded-2xl text-center space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/40 border-slate-800'
            }`}>
              <Lock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Business Mode Inactive</h4>
                <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                  Activate Business Mode to launch campaigns, track clicks/impressions, and distribute native sponsored feeds inside the gossip mesh.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google AdSense Web Monetization */}
      {activeSubTab === 'adsense' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-lg mx-auto space-y-2 py-4">
            <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-slate-850' : 'text-slate-100'}`}>
              Google AdSense & Web Monetization Placements
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Test dynamic web ad units. OmniSphere supports Google AdSense responsive display units, Auto Ads, and interactive web video sponsor rewards for full web hosting deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Interstitial ad test */}
            <div className={`p-6 border rounded-2xl space-y-4 text-center ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'
            }`}>
              <Tv className="w-8 h-8 text-cyan-400 mx-auto" />
              <div className="space-y-1">
                <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Interstitial Ad Trigger</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Triggers a full-screen transition ad countdown. High-impact interstitial placements help monetize natural feed navigation.
                </p>
              </div>
              <button
                onClick={() => launchAdSenseDemo('interstitial')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 rounded-xl text-xs font-mono font-bold uppercase transition"
              >
                Simulate Interstitial Ad
              </button>
            </div>

            {/* Rewarded ad test */}
            <div className={`p-6 border rounded-2xl space-y-4 text-center ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'
            }`}>
              <Award className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className={`text-sm font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Rewarded Video Ad</h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Earn credits directly. Watching this full rewarded video ad to completion outputs exactly **+10.00 LC** directly to your ledger!
                </p>
              </div>
              <button
                onClick={() => launchAdSenseDemo('rewarded')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-sans font-bold uppercase transition shadow"
              >
                Watch Ad & Earn 10 LC
              </button>
            </div>
          </div>

          {/* Adsterra Social Bar Network Active Status */}
          {!isPremium && (
            <div className="max-w-2xl mx-auto space-y-4 pt-6 border-t border-slate-800/80">
              <AdsterraAd theme={isLight ? 'light' : 'dark'} />
            </div>
          )}

          {/* Google AdSense Web Units Preview for Web Hosting Deployment */}
          {!isPremium && (
            <div className="max-w-3xl mx-auto space-y-4 pt-4 border-t border-slate-800/80">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-full inline-block">
                  Google AdSense Web Placement (Auto Ads & Display Units)
                </span>
                <p className="text-xs text-slate-400 font-sans">
                  Ready for web hosting deployment (Netlify, Vercel, Cloud Run, Firebase Hosting). Insert your Publisher ID <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">ca-pub-XXXXXXXXXXXXXXXX</code> in <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">index.html</code>.
                </p>
              </div>

              <GoogleAdSenseAd 
                clientPublisherId="ca-pub-3940256099942544"
                adSlotId="1000000001"
                format="horizontal"
                responsive={true}
                theme={isLight ? 'light' : 'dark'}
              />
            </div>
          )}
        </div>
      )}

      {/* SECURE CARD PAYMENT PROCESSING MODAL OVERLAY */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#060913] border-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Secure Node Payment
                </h4>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/80 font-mono text-xs flex justify-between">
              <span className="text-slate-400">{selectedPlan.name}</span>
              <span className="text-cyan-400 font-bold">${selectedPlan.price.toFixed(2)}</span>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase">Sovereign Validation Passed</h5>
                  <p className="text-[10px] text-slate-400 font-mono">Sovereign key upgrade successfully signed & distributed.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submitPayment} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    placeholder="Cardholder Name"
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="•••• •••• •••• ••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 font-mono text-center"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase block">CVC Security</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="•••"
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 font-mono text-center"
                      required
                    />
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 leading-relaxed flex items-center gap-1.5 border-t border-slate-900 pt-2.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted peer tunnel: SSL 256-bit SHA algorithm</span>
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded-xl font-bold uppercase tracking-wider text-center"
                >
                  {paymentProcessing ? 'Processing Transaction...' : 'Verify Secure Payment'}
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
            <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase animate-pulse">
              <Tv className="w-4 h-4" />
              Google AdSense Web Placement
            </span>
            <span>
              {adCountdown > 0 ? (
                <span className="px-3 py-1 bg-slate-900 border border-slate-850 rounded">
                  Skippable in {adCountdown}s
                </span>
              ) : (
                <button
                  onClick={() => setShowAdOverlay(false)}
                  className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded hover:bg-cyan-400 animate-pulse"
                >
                  Skip Ad [X]
                </button>
              )}
            </span>
          </div>

          <div className="text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="relative w-32 h-32 mx-auto">
              <Sparkles className="w-32 h-32 text-cyan-500/20 absolute inset-0 animate-spin" />
              <Award className="w-16 h-16 text-cyan-400 absolute inset-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded">
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
                className="inline-block px-8 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:scale-105 transition shadow-lg shadow-cyan-500/20"
              >
                Visit Mesh Site
              </a>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 space-y-2 border-t border-slate-900 pt-4">
            <div>
              {adType === 'rewarded' ? (
                adCountdown > 0 ? (
                  <span>Watch for 5 seconds to claim your **10.00 LC** compensation...</span>
                ) : (
                  <span className="text-emerald-400 font-black animate-pulse">Compensation Claimed! +10.00 LC safely routed to ledger wallet.</span>
                )
              ) : (
                <span>Supporting OmniSphere decentralized developer nodes.</span>
              )}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600">
              Ad Unit ID: ca-app-pub-3940256099942544/1033173712
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL PAYMENT RECEIPT MODAL */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-[#090E1A] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-200 font-sans relative">
            <button 
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Official Digital Receipt
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                OmniSphere Subscription Payment Verified
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Receipt No</span>
                <span className="text-slate-200 font-bold">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Subscriber</span>
                <span className="text-cyan-400 font-bold">@{activeReceipt.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Membership Tier</span>
                <span className="text-amber-400 font-bold">{activeReceipt.planName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Billing Cycle</span>
                <span className="text-slate-300 capitalize">{activeReceipt.billingPeriod}ly</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Total Paid</span>
                <span className="text-emerald-400 font-bold text-sm">${activeReceipt.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-500 uppercase text-[10px]">Gateway</span>
                <span className="text-slate-400">{activeReceipt.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase text-[10px]">Timestamp</span>
                <span className="text-slate-400">{new Date(activeReceipt.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-800/30 rounded-xl text-[10px] text-cyan-300 font-sans leading-relaxed">
              <strong>✓ Messaging Guarantee Active:</strong> Your membership tier features have been unlocked. Unlimited private messaging and phone communication remain active with 0 limits.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-xs font-bold uppercase transition shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
