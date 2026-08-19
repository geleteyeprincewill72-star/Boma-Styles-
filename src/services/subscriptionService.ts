/**
 * AURA MODULAR BACKEND SERVICE ABSTRACTION LAYER
 * Subscription & Membership Service
 */

import { authService, UserProfile } from './authService';

export interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'studio';
  isPremium: boolean;
  expiresAt?: number;
  features: string[];
}

class SubscriptionService {
  async getStatus(userProfile: UserProfile | null): Promise<SubscriptionStatus> {
    if (!userProfile) {
      return {
        tier: 'free',
        isPremium: false,
        features: ['Standard Feed', 'Direct Messaging', '25 Min Video Quota']
      };
    }

    const isAdmin = userProfile.role === 'admin' || userProfile.email === 'geleteyeprincewill72@gmail.com';
    const isCreator = userProfile.role === 'creator';

    if (isAdmin || isCreator) {
      return {
        tier: 'studio',
        isPremium: true,
        features: [
          'Unlimited Video Generation (Fair Use)',
          '4K Ultra-HD Visual Synthesis',
          'Cinematic Anamorphic Rendering',
          'Voice Synthesis & Speech Intelligence',
          'Verified Creator Badge',
          'Zero-Knowledge P2P Encryption'
        ]
      };
    }

    // Check server-side subscription or local cache
    const cachedPlan = localStorage.getItem(`aura_plan_${userProfile.uid}`);
    if (cachedPlan === 'pro' || cachedPlan === 'studio') {
      return {
        tier: cachedPlan,
        isPremium: true,
        features: [
          'High Resolution Video Generation',
          'Priority GPU Queue',
          'Creator Node Live Streaming & Studio Tools',
          'Verified Member Profile'
        ]
      };
    }

    return {
      tier: 'free',
      isPremium: false,
      features: ['Standard Feed', 'Direct Messaging', '25 Min Video Quota']
    };
  }

  async verifyPaymentTransaction(reference: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/verify-payment?reference=${encodeURIComponent(reference)}`);
      const data = await res.json();
      return data.status === 'success';
    } catch {
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();
