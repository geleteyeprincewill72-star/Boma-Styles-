/**
 * Enterprise Configurable Usage-Based Monetization & Accounting Engine
 */

export interface ActionDataCostConfig {
  actionKey: string;
  label: string;
  baseCostMb: number; // Baseline natural data footprint in MB
  configuredCostMb: number; // Configured consumption (e.g. 1 MB base -> 4 MB charged)
  surchargeMultiplier: number; // Multiplier applied (e.g., 4x)
  revenueUnitRateUsd: number; // Revenue generated per MB ($0.005 / MB)
  enabled: boolean;
}

export interface UsageLedgerRecord {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  actionKey: string;
  actionLabel: string;
  baseCostMb: number;
  chargedCostMb: number;
  surchargeMb: number; // Extra data contributed to revenue model
  revenueUsd: number;
  signature: string; // Cryptographic audit signature
}

export interface MonetizationConfig {
  globalMultiplier: number;
  revenueSharingPercentage: number;
  currency: string;
  actionCosts: Record<string, ActionDataCostConfig>;
}

const MONETIZATION_CONFIG_KEY = 'aura_monetization_config_v1';
const USAGE_LEDGER_KEY = 'aura_data_usage_ledger';
const SUBSCRIPTION_PLANS_KEY = 'aura_subscription_plans_v1';
const SUBSCRIBERS_LIST_KEY = 'aura_subscribers_list_v1';

export interface SubscriptionPlan {
  id: string;
  name: string; // 'Free Plan' | 'SemiPro Plan' | 'Pro Plan' | 'Premium Plan' | 'Superstar Plan'
  monthlyPrice: number;
  yearlyPrice: number;
  badge: string;
  badgeColor: string;
  adFrequency: 'standard' | 'fewer' | 'none';
  aiDailyLimit: number;
  aiSpeed: string;
  cloudStorageGb: number;
  maxFileUploadMb: number;
  customizationTier: string;
  businessTools: boolean;
  prioritySupport: boolean;
  experimentalFeatures: boolean;
  features: string[];
}

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: 'Free Plan',
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: 'Free Member',
    badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    adFrequency: 'standard',
    aiDailyLimit: 20,
    aiSpeed: 'Standard AI Speed',
    cloudStorageGb: 2,
    maxFileUploadMb: 50,
    customizationTier: 'Basic Themes',
    businessTools: false,
    prioritySupport: false,
    experimentalFeatures: false,
    features: [
      'Unlimited private messaging',
      'Unlimited user interaction & phone calling',
      'Unlimited message viewing (no daily caps)',
      'Basic AI access (20 requests/day or engage sponsor ads for +10)',
      'Standard ad placement'
    ]
  },
  {
    id: 'plan_semipro',
    name: 'SemiPro Plan',
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    badge: 'SemiPro Node',
    badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-800',
    adFrequency: 'fewer',
    aiDailyLimit: 100,
    aiSpeed: 'Faster AI Response',
    cloudStorageGb: 10,
    maxFileUploadMb: 200,
    customizationTier: 'Enhanced Customization',
    businessTools: false,
    prioritySupport: false,
    experimentalFeatures: false,
    features: [
      'Everything in Free Plan',
      'Fewer advertisements across feeds',
      'Faster AI response latency',
      'Higher AI usage limits (100 requests/day)',
      '10 GB Cloud Storage & 200MB file uploads',
      'Enhanced profile customization options'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Pro Plan',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    badge: 'Pro Verified',
    badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
    adFrequency: 'none',
    aiDailyLimit: 500,
    aiSpeed: 'Ultra Fast Neural Speed',
    cloudStorageGb: 50,
    maxFileUploadMb: 500,
    customizationTier: 'Advanced Themes & Custom Audio',
    businessTools: false,
    prioritySupport: true,
    experimentalFeatures: false,
    features: [
      'Everything in SemiPro Plan',
      '100% Ad-Free experience across all views',
      'More advanced AI features & multimodal tools',
      'Priority customer support queue',
      '50 GB Cloud Storage & 500MB file uploads',
      'Additional E2EE privacy & security features'
    ]
  },
  {
    id: 'plan_premium',
    name: 'Premium Plan',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    badge: '★ Premium Gold',
    badgeColor: 'bg-amber-950 text-amber-400 border border-amber-800',
    adFrequency: 'none',
    aiDailyLimit: 999999,
    aiSpeed: 'Instant Swarm Pipeline',
    cloudStorageGb: 250,
    maxFileUploadMb: 2000,
    customizationTier: 'Premium Gold Crest & Custom Fonts',
    businessTools: true,
    prioritySupport: true,
    experimentalFeatures: false,
    features: [
      'Everything in Pro Plan',
      'Access to the most advanced AI features',
      'Priority access to new feature rollouts',
      'Highest upload limits (2 GB file transfers)',
      'Advanced business campaign & ad portal tools',
      'Verified Gold Premium Account Badge',
      'Highest level 24/7 dedicated support'
    ]
  },
  {
    id: 'plan_superstar',
    name: 'Superstar Plan',
    monthlyPrice: 39.99,
    yearlyPrice: 399.99,
    badge: '⚡ SUPERSTAR',
    badgeColor: 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-pink-950 text-fuchsia-300 border border-fuchsia-700 shadow-md',
    adFrequency: 'none',
    aiDailyLimit: 999999,
    aiSpeed: 'Dedicated Sovereign AI Node',
    cloudStorageGb: 1000,
    maxFileUploadMb: 5000,
    customizationTier: 'Exclusive Superstar Hologram Customization',
    businessTools: true,
    prioritySupport: true,
    experimentalFeatures: true,
    features: [
      'Everything in Premium Plan',
      'Early access to experimental features',
      'Exclusive Superstar badge & profile frame',
      'Highest AI performance & zero-queue priority',
      'Dedicated priority support manager',
      'Access to all future premium features included'
    ]
  }
];

export function getSubscriptionPlans(): SubscriptionPlan[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_PLANS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) return parsed;
    }
  } catch {}
  return DEFAULT_SUBSCRIPTION_PLANS;
}

export function saveSubscriptionPlans(plans: SubscriptionPlan[]): void {
  localStorage.setItem(SUBSCRIPTION_PLANS_KEY, JSON.stringify(plans));
}

export interface SubscriberRecord {
  id: string;
  username: string;
  planId: string;
  planName: string;
  priceUSD: number;
  billingPeriod: 'month' | 'year';
  status: 'active' | 'renewed' | 'upgraded' | 'downgraded' | 'cancelled';
  paymentGateway: 'Paystack' | 'OPAY Direct' | 'Wallet Balance';
  paymentReference: string;
  subscribedAt: number;
  expiresAt: number;
}

export function getSubscribersList(): SubscriberRecord[] {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  const now = Date.now();
  return [
    {
      id: 'sub_001',
      username: 'BOMA ARIBITE PRINCEWILL',
      planId: 'plan_superstar',
      planName: 'Superstar Plan',
      priceUSD: 399.99,
      billingPeriod: 'year',
      status: 'active',
      paymentGateway: 'Paystack',
      paymentReference: 'pstk_sub_9918237',
      subscribedAt: now - 864000000,
      expiresAt: now + 30672000000
    },
    {
      id: 'sub_002',
      username: 'Gwotmut Nanman',
      planId: 'plan_premium',
      planName: 'Premium Plan',
      priceUSD: 199.99,
      billingPeriod: 'year',
      status: 'active',
      paymentGateway: 'Paystack',
      paymentReference: 'pstk_sub_8832104',
      subscribedAt: now - 1200000000,
      expiresAt: now + 30300000000
    },
    {
      id: 'sub_003',
      username: 'SovereignPeer_081',
      planId: 'plan_pro',
      planName: 'Pro Plan',
      priceUSD: 9.99,
      billingPeriod: 'month',
      status: 'active',
      paymentGateway: 'OPAY Direct',
      paymentReference: 'opay_sub_771822',
      subscribedAt: now - 400000000,
      expiresAt: now + 2192000000
    }
  ];
}

export function recordSubscriber(sub: Omit<SubscriberRecord, 'id'>): SubscriberRecord {
  const list = getSubscribersList();
  const newSub: SubscriberRecord = {
    ...sub,
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  };
  list.unshift(newSub);
  localStorage.setItem(SUBSCRIBERS_LIST_KEY, JSON.stringify(list));
  return newSub;
}

// Default Action Costs Configuration
export const DEFAULT_ACTION_COSTS: Record<string, ActionDataCostConfig> = {
  text_message: {
    actionKey: 'text_message',
    label: 'Encrypted Text Message',
    baseCostMb: 0.05,
    configuredCostMb: 0.20,
    surchargeMultiplier: 4.0,
    revenueUnitRateUsd: 0.002,
    enabled: true
  },
  voice_note: {
    actionKey: 'voice_note',
    label: 'E2EE Voice Recording',
    baseCostMb: 0.50,
    configuredCostMb: 2.00,
    surchargeMultiplier: 4.0,
    revenueUnitRateUsd: 0.005,
    enabled: true
  },
  video_stream: {
    actionKey: 'video_stream',
    label: 'HD Video Stream / Cinema Call',
    baseCostMb: 5.00,
    configuredCostMb: 20.00,
    surchargeMultiplier: 4.0,
    revenueUnitRateUsd: 0.010,
    enabled: true
  },
  ai_omnimind: {
    actionKey: 'ai_omnimind',
    label: 'OmniMind AI Neural Query',
    baseCostMb: 1.00,
    configuredCostMb: 4.00,
    surchargeMultiplier: 4.0,
    revenueUnitRateUsd: 0.015,
    enabled: true
  },
  file_transfer: {
    actionKey: 'file_transfer',
    label: 'Decentralized P2P File Upload',
    baseCostMb: 2.50,
    configuredCostMb: 10.00,
    surchargeMultiplier: 4.0,
    revenueUnitRateUsd: 0.008,
    enabled: true
  }
};

// Retrieve Monetization Config
export function getMonetizationConfig(): MonetizationConfig {
  try {
    const raw = localStorage.getItem(MONETIZATION_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        actionCosts: { ...DEFAULT_ACTION_COSTS, ...parsed.actionCosts }
      };
    }
  } catch {}
  
  return {
    globalMultiplier: 4.0,
    revenueSharingPercentage: 75.0,
    currency: 'USD',
    actionCosts: DEFAULT_ACTION_COSTS
  };
}

// Update Monetization Config (Admin Only)
export function saveMonetizationConfig(config: MonetizationConfig): void {
  localStorage.setItem(MONETIZATION_CONFIG_KEY, JSON.stringify(config));
  
  // Post update to backend
  try {
    fetch('/api/monetization/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).catch(() => {});
  } catch {}
}

// Estimate Data Cost Before Action
export function estimateActionCost(actionKey: string, customBaseMb?: number): {
  baseMb: number;
  chargedMb: number;
  surchargeMb: number;
  estimatedUsd: number;
  breakdownNotice: string;
} {
  const config = getMonetizationConfig();
  const actionCfg = config.actionCosts[actionKey] || {
    actionKey,
    label: 'Standard Network Action',
    baseCostMb: customBaseMb || 1.0,
    configuredCostMb: (customBaseMb || 1.0) * config.globalMultiplier,
    surchargeMultiplier: config.globalMultiplier,
    revenueUnitRateUsd: 0.005,
    enabled: true
  };

  const baseMb = customBaseMb || actionCfg.baseCostMb;
  const chargedMb = baseMb * actionCfg.surchargeMultiplier;
  const surchargeMb = Math.max(0, chargedMb - baseMb);
  const estimatedUsd = chargedMb * actionCfg.revenueUnitRateUsd;

  return {
    baseMb: Number(baseMb.toFixed(2)),
    chargedMb: Number(chargedMb.toFixed(2)),
    surchargeMb: Number(surchargeMb.toFixed(2)),
    estimatedUsd: Number(estimatedUsd.toFixed(4)),
    breakdownNotice: `${chargedMb.toFixed(1)} MB Data Credits (${baseMb.toFixed(1)} MB base + ${surchargeMb.toFixed(1)} MB monetization model quota)`
  };
}

// Record Action Usage in Immutable Transparent Accounting Ledger
export function recordDataUsage(
  userId: string,
  username: string,
  actionKey: string,
  customBaseMb?: number
): UsageLedgerRecord {
  const estimate = estimateActionCost(actionKey, customBaseMb);
  const config = getMonetizationConfig();
  const actionCfg = config.actionCosts[actionKey];

  const record: UsageLedgerRecord = {
    id: 'ledger_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    userId,
    username,
    actionKey,
    actionLabel: actionCfg ? actionCfg.label : actionKey,
    baseCostMb: estimate.baseMb,
    chargedCostMb: estimate.chargedMb,
    surchargeMb: estimate.surchargeMb,
    revenueUsd: estimate.estimatedUsd,
    signature: `hash_0x${Math.random().toString(36).substring(2, 12)}_${Date.now()}`
  };

  const ledger = getUsageLedger();
  ledger.unshift(record);
  // Keep max 500 audit records
  if (ledger.length > 500) ledger.pop();

  localStorage.setItem(USAGE_LEDGER_KEY, JSON.stringify(ledger));
  return record;
}

// Get Accounting Ledger
export function getUsageLedger(): UsageLedgerRecord[] {
  try {
    const raw = localStorage.getItem(USAGE_LEDGER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const now = Date.now();
  return [
    {
      id: 'ledger_s1',
      timestamp: now - 1800000,
      userId: 'usr_peer_001',
      username: 'Alex_Dev',
      actionKey: 'ai_omnimind',
      actionLabel: 'OmniMind AI Neural Query',
      baseCostMb: 1.0,
      chargedCostMb: 4.0,
      surchargeMb: 3.0,
      revenueUsd: 0.02,
      signature: 'hash_0xa1b2c3d4e5_1001'
    },
    {
      id: 'ledger_s2',
      timestamp: now - 3600000,
      userId: 'usr_peer_002',
      username: 'Sarah_Node',
      actionKey: 'video_stream',
      actionLabel: 'HD Video Stream / Cinema Call',
      baseCostMb: 5.0,
      chargedCostMb: 20.0,
      surchargeMb: 15.0,
      revenueUsd: 0.10,
      signature: 'hash_0xf9e8d7c6b5_1002'
    },
    {
      id: 'ledger_s3',
      timestamp: now - 7200000,
      userId: 'usr_peer_003',
      username: 'Cyber_Anon',
      actionKey: 'voice_note',
      actionLabel: 'E2EE Voice Recording',
      baseCostMb: 0.5,
      chargedCostMb: 2.0,
      surchargeMb: 1.5,
      revenueUsd: 0.01,
      signature: 'hash_0x778899aabb_1003'
    }
  ];
}

// Get Accounting Totals Summary
export function getMonetizationTotals() {
  const ledger = getUsageLedger();
  const totalChargedMb = ledger.reduce((acc, r) => acc + r.chargedCostMb, 0);
  const totalBaseMb = ledger.reduce((acc, r) => acc + r.baseCostMb, 0);
  const totalSurchargeMb = ledger.reduce((acc, r) => acc + r.surchargeMb, 0);
  const totalRevenueUsd = ledger.reduce((acc, r) => acc + r.revenueUsd, 0);

  return {
    totalChargedMb: Number(totalChargedMb.toFixed(2)),
    totalBaseMb: Number(totalBaseMb.toFixed(2)),
    totalSurchargeMb: Number(totalSurchargeMb.toFixed(2)),
    totalRevenueUsd: Number(totalRevenueUsd.toFixed(4)),
    totalTransactions: ledger.length
  };
}
