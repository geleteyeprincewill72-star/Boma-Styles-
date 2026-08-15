/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeedPost, VideoPlaylist, VideoWatchHistoryItem, VideoRecommendation } from '../types';

const AUTOPLAY_STORAGE_KEY = 'aura_video_autoplay_on_scroll';
const HISTORY_STORAGE_KEY = 'aura_video_persistent_history';
const PLAYLISTS_STORAGE_KEY = 'aura_video_playlists';

// Default starter playlists
const DEFAULT_PLAYLISTS: VideoPlaylist[] = [
  {
    id: 'pl_watch_later',
    name: 'Watch Later',
    description: 'Saved streams and episodes to watch anytime',
    items: [],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    isDefault: true
  },
  {
    id: 'pl_favorites',
    name: 'Favorite Broadcasts',
    description: 'Top rated cyberpunk and community streams',
    items: [],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    isDefault: true
  }
];

// ==========================================
// 1. AUTOPLAY ON SCROLL PREFERENCE
// ==========================================

export function getAutoPlayOnScroll(): boolean {
  try {
    const val = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
    if (val === null) return true; // Default to true (or enabled)
    return JSON.parse(val) === true;
  } catch (e) {
    return true;
  }
}

export function setAutoPlayOnScroll(enabled: boolean): void {
  try {
    localStorage.setItem(AUTOPLAY_STORAGE_KEY, JSON.stringify(enabled));
    window.dispatchEvent(new CustomEvent('aura_autoplay_setting_changed', { detail: { enabled } }));
  } catch (e) {
    console.error('Failed to set autoplay preference', e);
  }
}

// ==========================================
// 2. VIDEO WATCH HISTORY
// ==========================================

export function getVideoWatchHistory(): VideoWatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveVideoWatchHistoryItem(item: Omit<VideoWatchHistoryItem, 'watchedAt'> & { watchedAt?: number }): void {
  try {
    const history = getVideoWatchHistory();
    const existingIndex = history.findIndex(h => h.id === item.id);
    
    const newEntry: VideoWatchHistoryItem = {
      ...item,
      watchedAt: Date.now(),
      lastPositionSeconds: item.lastPositionSeconds || 0,
      durationSeconds: item.durationSeconds || 100,
      completed: item.completed ?? false
    };

    let updated: VideoWatchHistoryItem[];
    if (existingIndex >= 0) {
      updated = [newEntry, ...history.filter(h => h.id !== item.id)];
    } else {
      updated = [newEntry, ...history];
    }

    // Cap history at 50 items
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('aura_video_history_updated'));
  } catch (e) {
    console.error('Failed to save watch history item', e);
  }
}

export function removeVideoWatchHistoryItem(id: string): void {
  try {
    const history = getVideoWatchHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aura_video_history_updated'));
  } catch (e) {
    console.error('Failed to remove watch history item', e);
  }
}

export function clearVideoWatchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('aura_video_history_updated'));
  } catch (e) {
    console.error('Failed to clear watch history', e);
  }
}

// ==========================================
// 3. VIDEO PLAYLISTS
// ==========================================

export function getVideoPlaylists(): VideoPlaylist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(DEFAULT_PLAYLISTS));
      return DEFAULT_PLAYLISTS;
    }
    const parsed: VideoPlaylist[] = JSON.parse(raw);
    if (!parsed || parsed.length === 0) {
      return DEFAULT_PLAYLISTS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PLAYLISTS;
  }
}

export function createVideoPlaylist(name: string, description = ''): VideoPlaylist {
  const playlists = getVideoPlaylists();
  const newPl: VideoPlaylist = {
    id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    description: description.trim(),
    items: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDefault: false
  };

  const updated = [...playlists, newPl];
  localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('aura_video_playlists_updated'));
  return newPl;
}

export function addVideoToPlaylist(playlistId: string, post: FeedPost): boolean {
  try {
    const playlists = getVideoPlaylists();
    const plIndex = playlists.findIndex(p => p.id === playlistId);
    if (plIndex === -1) return false;

    const playlist = playlists[plIndex];
    if (playlist.items.some(item => item.id === post.id)) {
      return false; // Already in playlist
    }

    const newItem = {
      id: post.id,
      title: post.title || 'Broadcast Stream',
      authorName: post.authorName || 'Bios Styles',
      mediaThumbnail: post.mediaThumbnail || '',
      mediaUrl: post.mediaUrl || '',
      addedAt: Date.now(),
      post: post
    };

    playlist.items.push(newItem);
    playlist.updatedAt = Date.now();
    if (!playlist.coverImage && post.mediaThumbnail) {
      playlist.coverImage = post.mediaThumbnail;
    }

    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    window.dispatchEvent(new CustomEvent('aura_video_playlists_updated'));
    return true;
  } catch (e) {
    console.error('Failed to add to playlist', e);
    return false;
  }
}

export function removeVideoFromPlaylist(playlistId: string, postId: string): void {
  try {
    const playlists = getVideoPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;

    pl.items = pl.items.filter(item => item.id !== postId);
    pl.updatedAt = Date.now();
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    window.dispatchEvent(new CustomEvent('aura_video_playlists_updated'));
  } catch (e) {
    console.error('Failed to remove from playlist', e);
  }
}

export function deleteVideoPlaylist(playlistId: string): void {
  try {
    const playlists = getVideoPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId || p.isDefault);
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('aura_video_playlists_updated'));
  } catch (e) {
    console.error('Failed to delete playlist', e);
  }
}

// ==========================================
// 4. SIMILARITY & RECOMMENDATION ENGINE
// ==========================================

const KEYWORD_GROUPS: Record<string, string[]> = {
  cyberpunk: ['cyberpunk', 'neon', 'matrix', 'synthwave', 'solas', 'future', 'blade', 'dystopian', 'p2p'],
  ai: ['ai', 'gemini', 'neural', 'robotics', 'intelligence', 'omnimind', 'synthesizer', 'algorithm'],
  gaming: ['game', 'fps', 'speedrun', 'stream', 'gameplay', 'multiplayer', 'esports', 'twitch'],
  music: ['audio', 'music', 'beats', 'track', 'soundtrack', 'synth', 'melody', 'bass', 'ambient'],
  crypto: ['blockchain', 'zk', 'crypto', 'ledger', 'sovereign', 'token', 'wallet', 'mining', 'web3'],
  cinema: ['film', 'cinematic', 'screenplay', 'actor', 'theater', 'hdr', 'director', 'action']
};

function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

export function calculateVideoRecommendations(
  posts: FeedPost[],
  currentPostId?: string
): VideoRecommendation[] {
  // Only consider video posts
  const videoPosts = posts.filter(p => p.type === 'play' || !!p.mediaUrl);
  if (videoPosts.length === 0) return [];

  const history = getVideoWatchHistory();
  const likedPosts = posts.filter(p => p.hasLiked);
  const watchedIds = new Set(history.map(h => h.id));
  const watchedAuthors = new Set(history.map(h => h.authorName));
  const likedAuthors = new Set(likedPosts.map(p => p.authorName));

  // Build interest keywords from liked posts and history
  const interestTokens: string[] = [];
  likedPosts.forEach(p => {
    interestTokens.push(...extractTokens(p.title || ''));
    interestTokens.push(...extractTokens(p.content || ''));
  });
  history.forEach(h => {
    interestTokens.push(...extractTokens(h.title || ''));
  });

  const recommendations: VideoRecommendation[] = videoPosts.map(post => {
    let score = 0.3; // Baseline score
    const reasons: string[] = [];
    const matchedTags: string[] = [];

    // Skip if exactly the same video currently watching (low priority)
    if (currentPostId && post.id === currentPostId) {
      score -= 0.5;
    }

    const postTokens = new Set([
      ...extractTokens(post.title || ''),
      ...extractTokens(post.content || ''),
      ...extractTokens(post.authorName || '')
    ]);

    // 1. Author Affinity
    if (likedAuthors.has(post.authorName)) {
      score += 0.35;
      reasons.push(`From ${post.authorName}, a creator you liked`);
    } else if (watchedAuthors.has(post.authorName)) {
      score += 0.25;
      reasons.push(`Because you watch ${post.authorName}`);
    }

    // 2. Keyword Match with User's Liked/Watched History
    let tokenOverlap = 0;
    interestTokens.forEach(token => {
      if (postTokens.has(token)) tokenOverlap++;
    });

    if (tokenOverlap > 0) {
      const boost = Math.min(0.4, tokenOverlap * 0.08);
      score += boost;
      reasons.push(`Similar theme to videos you engaged with`);
    }

    // 3. Category Match
    for (const [category, keywords] of Object.entries(KEYWORD_GROUPS)) {
      const hasCat = keywords.some(k => postTokens.has(k));
      if (hasCat) {
        matchedTags.push(category.toUpperCase());
        const interestCat = keywords.some(k => interestTokens.includes(k));
        if (interestCat) {
          score += 0.2;
          reasons.push(`Matches your ${category} interests`);
        }
      }
    }

    // 4. Social Proof / High Engagement Boost
    if (post.likes && post.likes > 5) {
      score += Math.min(0.2, post.likes * 0.01);
    }
    if (post.views && post.views > 200) {
      score += 0.1;
    }

    // 5. Watch Status (Unwatched gets a fresh discovery boost)
    if (!watchedIds.has(post.id)) {
      score += 0.15;
    }

    const finalReason = reasons.length > 0
      ? reasons[0]
      : 'Trending in Solas P2P Swarm';

    return {
      post,
      score: Math.max(0.1, Math.min(0.99, score)),
      matchReason: finalReason,
      tags: matchedTags.length > 0 ? matchedTags : ['BROADCAST']
    };
  });

  return recommendations.sort((a, b) => b.score - a.score);
}

// ==========================================
// 5. TIME FORMATTING HELPER
// ==========================================

export function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    const remainMins = mins % 60;
    return `${hrs}:${remainMins < 10 ? '0' : ''}${remainMins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
