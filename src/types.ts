/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export type PostType = 'micro' | 'media' | 'play' | 'node' | 'voice';

export interface FeedPost {
  id: string;
  authorName: string;
  authorPublicKey: string;
  authorAvatar: string;
  type: PostType;
  timestamp: number;
  content: string;
  signature: string; // Cryptographic signature of the content
  // Media fields (YouTube / Instagram)
  mediaUrl?: string;
  mediaThumbnail?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3';
  title?: string; // For YouTube style videos
  views?: number;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  hasLiked?: boolean;
  // Facebook style Node/Circle
  nodeName?: string;
  // Bookmarks and Reposts
  isBookmarked?: boolean;
  isReposted?: boolean;
  repostedBy?: string;
  // Voice note fields
  voiceUrl?: string;
  voiceDuration?: number;
  // Monetization fields
  isSponsored?: boolean;
  adId?: string;
  sponsorCta?: string;
  sponsorUrl?: string;
  // Zero-Knowledge Anonymous Posting
  isAnonymous?: boolean;
  anonymousBadge?: string;
  // AI Post Enhancements & Superior Attributes
  isAiPost?: boolean;
  aiModel?: string;
  aiQualityTier?: '4K HDR Neural' | 'Ultra HD 1080p' | 'Gemini 2.5 Flash Supercharged';
  aiCapabilities?: string[];
  aiSummary?: string;
  aiOriginalityScore?: number;
  // Decentralized Content Moderation
  moderationStatus?: 'approved' | 'flagged' | 'removed_by_council' | 'pending_review';
  moderationVotes?: { approve: number; remove: number; warning: number };
  flaggedReason?: string;
  flaggedAt?: number;
  flaggedBy?: string;
}

export interface ModerationCouncilMember {
  id: string;
  username: string;
  avatar: string;
  role: 'Elected Council Lead' | 'Community Moderator' | 'Sovereign Juror';
  reputationScore: number;
  decisionsCount: number;
  joinedAt: number;
  isActive: boolean;
}

export interface ModerationDecisionLog {
  id: string;
  postId: string;
  postTitle?: string;
  postAuthorName: string;
  category: 'Spam' | 'Hate Speech' | 'Misinformation' | 'Harassment' | 'Graphic Media' | 'Community Guideline';
  votedApprove: number;
  votedRemove: number;
  votedWarning: number;
  finalVerdict: 'Post Approved' | 'Removed by Community Council' | 'Content Warning Added';
  timestamp: number;
  councilSignature: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'tip_send' | 'tip_receive' | 'subscription' | 'ad_spend' | 'ad_revenue';
  amount: number;
  description: string;
  timestamp: number;
  sender?: string;
  receiver?: string;
  txHash: string;
}

export interface SponsoredAd {
  id: string;
  businessName: string;
  campaignName: string;
  imageUrl: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  isActive: boolean;
  cpc: number; // Cost per click
}

export interface CommentReply {
  id: string;
  authorName: string;
  content: string;
  timestamp: number;
  signature: string;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  timestamp: number;
  signature: string;
  replies?: CommentReply[];
}

export interface Character {
  id: string;
  name: string;
  bio: string;
  physicalDesc: string;
  personality: string;
  motivations: string;
  avatar: string;
  createdAt: number;
}

export type ScreenplayBlockType = 'scene' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition';

export interface ScreenplayBlock {
  id: string;
  type: ScreenplayBlockType;
  text: string;
  characterId?: string; // Links block directly to a Character ID if it's dialogue or mentions them
}

export interface NetworkNode {
  id: string;
  name: string;
  status: 'online' | 'syncing' | 'offline';
  ip: string;
  ping: number;
  syncedBlocks: number;
  isSelf?: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorPublicKey: string;
  rating: number;
  content: string;
  likeAspects?: string;       // Why the user likes the app
  dislikeAspects?: string;    // Why the user doesn't like the app / requested upgrade
  upgradeCategory?: 'ui_design' | 'performance' | 'features' | 'monetization' | 'bug_fix' | 'general';
  upgradeStatus?: 'pending' | 'reviewed_for_4day_cycle' | 'implemented';
  timestamp: number;
  signature: string;
  helpfulCount: number;
  hasMarkedHelpful?: boolean;
}

export interface SharedState {
  posts: FeedPost[];
  characters: Character[];
  screenplay: ScreenplayBlock[];
  keyPair: KeyPair | null;
  username: string;
  avatar: string;
  networkNodes: NetworkNode[];
}
