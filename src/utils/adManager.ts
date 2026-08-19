/**
 * Centralized Paid Ad Removal & Ad-Free System Manager for Aura
 * 
 * Rules:
 * - if user.adsRemoved === true (and not expired) -> do NOT render advertisements
 * - if user.adsRemoved === false (or expired) -> render advertisements
 * - No ads are rendered via CSS hiding; components check this logic directly to prevent DOM loading.
 */

import { AdRemovalPlan, UserProfile } from '../types';

export const TARGET_OPAY_ACCOUNT = {
  accountNumber: '8105341700',
  bankName: 'OPAY',
  accountName: 'Aura Sovereign / Princewill Geleteye',
  supportContact: '08154561612 (WhatsApp / Facebook: Bios Styles)'
};

export const AD_REMOVAL_PLANS: AdRemovalPlan[] = [
  {
    id: 'monthly',
    title: '30-Day Ad-Free Pass',
    durationLabel: '30 Days Access',
    priceNgn: 1500,
    priceFormatted: '₦1,500',
    features: [
      'Zero Banner Ads & Interstitials across Aura',
      'No Sponsored Posts in your Social Feed',
      'Instant Video & Live Stream Playback with 0 Ads',
      'Clean, uninterrupted Chat & Calling UI'
    ]
  },
  {
    id: 'yearly',
    title: '1-Year Sovereign Ad-Free',
    durationLabel: '365 Days Access',
    priceNgn: 10000,
    priceFormatted: '₦10,000',
    popular: true,
    savings: 'Save 44%',
    badge: 'Most Popular',
    features: [
      'All 30-Day Ad-Free benefits for 1 full year',
      '3x Faster Page Loads & Reduced Bandwidth',
      'Priority Broadcast & Discovery Mesh Bandwidth',
      'Sovereign Ad-Free Badge on Profile'
    ]
  },
  {
    id: 'lifetime',
    title: 'Lifetime Permanent Ad Removal',
    durationLabel: 'Permanent / Never Expires',
    priceNgn: 18000,
    priceFormatted: '₦18,000',
    savings: 'Best Value',
    badge: 'Permanent Access',
    features: [
      'Permanent Ad-Free status for your Aura Identity',
      'Never pay renewal fees or see ads forever',
      'Exempt from all current & future ad placements',
      'Permanent Gold Ad-Free Sovereign Verification',
      'Direct VIP Admin Verification Priority'
    ]
  }
];

export interface UserAdStatus {
  isAdFree: boolean;
  statusText: string;
  statusBadge: string;
  expiresAt: number | null;
  expiryFormatted?: string;
  planTitle?: string;
  daysRemaining?: number;
}

/**
 * Checks if ads should be completely suppressed for this user.
 * Returns TRUE if user is Ad-Free (no ads should render).
 * Returns FALSE if ads should render normally.
 */
export function isUserAdFree(user?: Partial<UserProfile> | null): boolean {
  if (!user) {
    // Check local storage fallback
    try {
      const raw = localStorage.getItem('aura_user');
      if (raw) {
        const u = JSON.parse(raw);
        return checkAdFree(u);
      }
    } catch (_) {}
    return false;
  }

  return checkAdFree(user);
}

function checkAdFree(u: Partial<UserProfile>): boolean {
  // Administrators are always ad-free
  if (u.role === 'admin') {
    return true;
  }

  if (u.adsRemoved === true) {
    // Check if there is an expiration timestamp
    if (u.adsRemovedUntil) {
      const now = Date.now();
      if (now > u.adsRemovedUntil) {
        // Expired!
        return false;
      }
      return true; // Still within subscription period
    }
    // Null/undefined expiration means Lifetime Ad-Free
    return true;
  }

  return false;
}

/**
 * Returns user-friendly subscription & ad status metadata for Account & Profile pages.
 */
export function getUserAdStatus(user?: Partial<UserProfile> | null): UserAdStatus {
  const isAdFree = isUserAdFree(user);

  if (!isAdFree) {
    return {
      isAdFree: false,
      statusText: 'Ads: Active',
      statusBadge: 'Active Ads (Free Tier)',
      expiresAt: null
    };
  }

  if (user?.role === 'admin') {
    return {
      isAdFree: true,
      statusText: 'Ads: Removed ✅ (Administrator)',
      statusBadge: 'Admin Ad-Free Access',
      expiresAt: null
    };
  }

  if (!user?.adsRemovedUntil) {
    return {
      isAdFree: true,
      statusText: 'Ads: Removed ✅ (Lifetime)',
      statusBadge: 'Lifetime Sovereign Ad-Free',
      expiresAt: null,
      planTitle: 'Lifetime Sovereign'
    };
  }

  const now = Date.now();
  const diffMs = user.adsRemovedUntil - now;
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const dateStr = new Date(user.adsRemovedUntil).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return {
    isAdFree: true,
    statusText: `Ads: Removed ✅ (Valid until ${dateStr})`,
    statusBadge: `${days} Days Remaining`,
    expiresAt: user.adsRemovedUntil,
    expiryFormatted: dateStr,
    daysRemaining: days,
    planTitle: user.adsRemovedPlan === 'yearly' ? '1-Year Pass' : '30-Day Pass'
  };
}

/**
 * Generates a unique reference ID for a new ad removal purchase.
 */
export function generateAdRemovalReference(username?: string): string {
  const prefix = username ? username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'USER';
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const time = Date.now().toString().slice(-4);
  return `AURA-ADFREE-${prefix}-${rand}${time}`;
}
