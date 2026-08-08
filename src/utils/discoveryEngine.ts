/**
 * Sovereign Social Privacy-Preserving Content Discovery Engine (On-Device Personalization)
 * 
 * This engine tracks interactions, processes content metadata, and serves recommendations
 * entirely within the client container. NO raw personal interaction logs are ever transmitted
 * to central databases.
 */

import { FeedPost } from '../types';

export interface Interaction {
  id: string;
  postId: string;
  type: 'like' | 'comment' | 'tip' | 'view' | 'follow';
  timestamp: number;
  authorName: string;
  postType: string;
  tags: string[];
}

export interface UserPersonalizationProfile {
  tagScores: { [tag: string]: number };
  authorScores: { [author: string]: number };
  typeScores: { [type: string]: number };
  totalInteractions: number;
}

export interface PeerRecommendation {
  name: string;
  avatar: string;
  bio: string;
  alignmentScore: number; // 0 to 100 percentage
  reason: string;
  matchingInterests: string[];
}

// Score weights for different interaction types
const SCORING_WEIGHTS = {
  view: 1,
  like: 5,
  follow: 12,
  comment: 15,
  tip: 25,
};

// Simple stop words to filter out when parsing text for keywords
const STOP_WORDS = new Set([
  'the', 'and', 'this', 'that', 'with', 'from', 'your', 'their', 'about', 
  'here', 'there', 'what', 'some', 'gossip', 'node', 'mesh', 'block', 'peer',
  'will', 'have', 'been', 'with', 'your', 'onto', 'into', 'just', 'more'
]);

/**
 * Extracts hashtags and important keywords from a post content
 */
export function extractContentTags(content: string): string[] {
  const tags: string[] = [];
  
  // 1. Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(content)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  // 2. Extract high-value words
  const words = content
    .toLowerCase()
    .replace(/[^\w\s#]/g, '') // remove punctuation except hashtags
    .split(/\s+/);

  words.forEach(word => {
    if (word.length > 3 && !STOP_WORDS.has(word) && !word.startsWith('#')) {
      tags.push(word);
    }
  });

  return Array.from(new Set(tags)).slice(0, 10); // return unique top tags
}

/**
 * Loads interaction ledger from local storage
 */
export function getLocalInteractionLedger(): Interaction[] {
  try {
    const data = localStorage.getItem('aura_discovery_ledger');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load discovery ledger:', e);
    return [];
  }
}

/**
 * Saves interaction ledger to local storage
 */
export function saveLocalInteractionLedger(ledger: Interaction[]) {
  try {
    localStorage.setItem('aura_discovery_ledger', JSON.stringify(ledger));
  } catch (e) {
    console.error('Failed to save discovery ledger:', e);
  }
}

/**
 * Logs a new user interaction locally on-device
 */
export function logOnDeviceInteraction(
  postId: string,
  authorName: string,
  postType: string,
  content: string,
  interactionType: keyof typeof SCORING_WEIGHTS
) {
  const ledger = getLocalInteractionLedger();
  const tags = extractContentTags(content);

  const newInteraction: Interaction = {
    id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    postId,
    type: interactionType,
    timestamp: Date.now(),
    authorName,
    postType,
    tags,
  };

  ledger.push(newInteraction);
  
  // Cap ledger size to last 500 records to save space
  const trimmed = ledger.slice(-500);
  saveLocalInteractionLedger(trimmed);
  
  // Dispatch custom event to trigger UI updates
  window.dispatchEvent(new CustomEvent('aura_discovery_update'));
}

/**
 * Compiles the user's localized personalization profile from the local ledger
 */
export function compilePersonalizationProfile(): UserPersonalizationProfile {
  const ledger = getLocalInteractionLedger();
  
  const tagScores: { [tag: string]: number } = {};
  const authorScores: { [author: string]: number } = {};
  const typeScores: { [type: string]: number } = {
    micro: 0,
    media: 0,
    play: 0,
    node: 0,
  };

  // Base preference boosts so newly initialized users don't start at absolute zero
  typeScores.micro = 2;
  typeScores.media = 2;
  typeScores.play = 2;
  typeScores.node = 2;

  ledger.forEach(interaction => {
    const weight = SCORING_WEIGHTS[interaction.type] || 1;

    // 1. Accumulate type scores
    if (interaction.postType in typeScores) {
      typeScores[interaction.postType] += weight;
    }

    // 2. Accumulate author scores
    authorScores[interaction.authorName] = (authorScores[interaction.authorName] || 0) + weight;

    // 3. Accumulate tag/keyword scores
    interaction.tags.forEach(tag => {
      tagScores[tag] = (tagScores[tag] || 0) + weight;
    });
  });

  return {
    tagScores,
    authorScores,
    typeScores,
    totalInteractions: ledger.length,
  };
}

/**
 * Core on-device personalization ranking algorithm.
 * Uses local interests profile to score and sort public posts/videos in-browser.
 */
export function personalizeAndDiscoverContent(posts: FeedPost[]): { post: FeedPost; score: number; matchReasons: string[] }[] {
  const profile = compilePersonalizationProfile();
  
  // Pre-calculate maximum scores to normalize scoring
  const tagVals = Object.values(profile.tagScores);
  const authorVals = Object.values(profile.authorScores);
  const typeVals = Object.values(profile.typeScores);

  const maxTagScore = tagVals.length > 0 ? Math.max(...tagVals) : 1;
  const maxAuthorScore = authorVals.length > 0 ? Math.max(...authorVals) : 1;
  const maxTypeScore = typeVals.length > 0 ? Math.max(...typeVals) : 1;

  return posts.map(post => {
    let score = 0;
    const matchReasons: string[] = [];
    
    // 1. Tag matching score (Content-Based Personalization)
    const postTags = extractContentTags(post.content);
    let matchedTagsCount = 0;
    let tagScoreSum = 0;

    postTags.forEach(tag => {
      if (profile.tagScores[tag]) {
        matchedTagsCount++;
        tagScoreSum += profile.tagScores[tag];
      }
    });

    if (matchedTagsCount > 0) {
      // Normalize tag score contributions
      const averageTagWeight = tagScoreSum / maxTagScore;
      score += averageTagWeight * 40; // Tag affinity represents up to 40% of recommendation score
      
      const topMatchedTags = postTags
        .filter(t => profile.tagScores[t])
        .sort((a, b) => profile.tagScores[b] - profile.tagScores[a])
        .slice(0, 2);
      matchReasons.push(`Shares interest in #${topMatchedTags.join(', #')}`);
    }

    // 2. Author affinity score (Personalization & Social alignment)
    if (profile.authorScores[post.authorName]) {
      const authorAffinity = profile.authorScores[post.authorName] / maxAuthorScore;
      score += authorAffinity * 30; // Author affinity represents up to 30% of recommendation score
      matchReasons.push(`From high-interaction peer ${post.authorName}`);
    }

    // 3. Format type affinity score
    if (profile.typeScores[post.type]) {
      const typeAffinity = profile.typeScores[post.type] / maxTypeScore;
      score += typeAffinity * 20; // Format preference represents up to 20% of recommendation score
    }

    // 4. Hotness / Decay factor (keeps content fresh and dynamic)
    const hoursOld = (Date.now() - post.timestamp) / (1000 * 60 * 60);
    // Exponential decay multiplier over a 48 hour window
    const freshnessMultiplier = Math.exp(-hoursOld / 24);
    score = score * (0.4 + 0.6 * freshnessMultiplier);

    // 5. Baseline engagement factor
    const engagementScore = (post.likes * 2 + post.commentsCount * 5);
    score += Math.min(engagementScore, 10); // Up to 10 points for global community popularity

    // Guarantee a positive score
    score = Math.max(score, 0.5);

    // If no specific match reason, add format or general community interest
    if (matchReasons.length === 0) {
      if (post.likes > 150) {
        matchReasons.push(`Trending across the mesh network`);
      } else {
        matchReasons.push(`Discovered on ${post.type} channel`);
      }
    }

    return {
      post,
      score: parseFloat(score.toFixed(1)),
      matchReasons: Array.from(new Set(matchReasons)),
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * On-device local lookalike collaborative peer recommendations.
 * Ranks peers with who the user shares overlapping interest vectors.
 */
export function discoverPeerConnections(posts: FeedPost[], currentUsername: string): PeerRecommendation[] {
  const profile = compilePersonalizationProfile();
  
  // Extract all distinct authors from posts who are NOT the current user
  const peerMap: { [name: string]: { avatar: string; tags: Set<string>; sampleBio: string } } = {};
  
  // Predefined bios for known characters to keep them authentic
  const BIOS: { [name: string]: string } = {
    'Lyra Vesper': 'Berlin node architect. Focused on peer-to-peer encryption, zero-knowledge storage, and Solas layout patterns.',
    'Orion Sterling': 'Core cryptography maintainer. Building sovereign ledger synchronization protocols and offline networks.',
    'Cypher Architect': 'Distributed systems developer & artist. Expressing decentralized mesh networks through cinematic streams.',
    'Privacy Activists Node': 'Collective monitoring central tracking and censorship efforts. Protecting creative sovereign rights.',
    'Aura Protocol Core': 'The official dev group compiling the next major client-side releases for Aura social mesh.'
  };

  const AVATARS: { [name: string]: string } = {
    'Lyra Vesper': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    'Orion Sterling': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    'Cypher Architect': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
    'Privacy Activists Node': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
    'Aura Protocol Core': 'https://api.dicebear.com/7.x/bottts/svg?seed=auracore'
  };

  posts.forEach(post => {
    if (post.authorName === currentUsername) return;

    if (!peerMap[post.authorName]) {
      peerMap[post.authorName] = {
        avatar: post.authorAvatar || AVATARS[post.authorName] || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorName}`,
        tags: new Set<string>(),
        sampleBio: BIOS[post.authorName] || 'Active peer in the decentralized Aura mesh network.'
      };
    }
    
    // Extract keywords this author writes about
    extractContentTags(post.content).forEach(tag => {
      peerMap[post.authorName].tags.add(tag);
    });
  });

  const userTags = Object.keys(profile.tagScores);
  const recommendations: PeerRecommendation[] = [];

  Object.entries(peerMap).forEach(([peerName, peerData]) => {
    const peerTagsArray = Array.from(peerData.tags);
    const matchingInterests = peerTagsArray.filter(tag => profile.tagScores[tag] !== undefined);
    
    // Collaborative matching score
    let score = 30; // base potential match
    
    if (userTags.length > 0) {
      // Calculate intersection ratio
      const matchRatio = matchingInterests.length / Math.max(userTags.length, 1);
      score += matchRatio * 50;
    }

    // Boost if the user has directly interacted with this author before
    if (profile.authorScores[peerName]) {
      score += Math.min(profile.authorScores[peerName] * 3, 20);
    }

    score = Math.min(score, 99); // capped at 99% lookalike ratio

    let reason = 'Based on common content keywords in the mesh';
    if (matchingInterests.length > 0) {
      reason = `Both share high affinity for #${matchingInterests.slice(0, 2).join(', #')}`;
    } else if (profile.authorScores[peerName]) {
      reason = `Frequent interaction alignment with their nodes`;
    }

    recommendations.push({
      name: peerName,
      avatar: peerData.avatar,
      bio: peerData.sampleBio,
      alignmentScore: Math.round(score),
      reason,
      matchingInterests: matchingInterests.slice(0, 3)
    });
  });

  return recommendations.sort((a, b) => b.alignmentScore - a.alignmentScore);
}

/**
 * Fully wipes the local interaction ledger and scores
 */
export function purgeDiscoveryIntelligence() {
  localStorage.removeItem('aura_discovery_ledger');
  window.dispatchEvent(new CustomEvent('aura_discovery_update'));
}
