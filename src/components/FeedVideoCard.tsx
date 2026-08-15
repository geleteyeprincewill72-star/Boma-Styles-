/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ListPlus, 
  Film, 
  Clock, 
  Sparkles,
  Check
} from 'lucide-react';
import { FeedPost } from '../types';
import { VideoProgressBar } from './VideoProgressBar';
import { VideoPlaylistModal } from './VideoPlaylistModal';
import { 
  getAutoPlayOnScroll, 
  setAutoPlayOnScroll, 
  saveVideoWatchHistoryItem,
  formatVideoDuration 
} from '../utils/videoEngine';

interface FeedVideoCardProps {
  post: FeedPost;
  onOpenTheater?: (post: FeedPost) => void;
}

export const FeedVideoCard: React.FC<FeedVideoCardProps> = ({ post, onOpenTheater }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => getAutoPlayOnScroll());
  const [isHovered, setIsHovered] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Listen for global autoplay preference updates
  useEffect(() => {
    const handleAutoplayChange = (e: any) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setAutoPlayEnabled(e.detail.enabled);
      } else {
        setAutoPlayEnabled(getAutoPlayOnScroll());
      }
    };
    window.addEventListener('aura_autoplay_setting_changed', handleAutoplayChange);
    return () => {
      window.removeEventListener('aura_autoplay_setting_changed', handleAutoplayChange);
    };
  }, []);

  // IntersectionObserver for Auto-play while scrolling through feed
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // In view: if autoplay enabled, play muted
            if (getAutoPlayOnScroll()) {
              videoRef.current.muted = isMuted;
              videoRef.current.play().then(() => {
                setIsPlaying(true);
              }).catch(() => {
                // Browser policy fallback
              });
            }
          } else {
            // Out of view: pause
            if (!videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: [0.2, 0.6, 0.9] }
    );

    observer.observe(currentContainer);

    return () => {
      observer.disconnect();
    };
  }, [isMuted, autoPlayEnabled]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHasUserInteracted(true);
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);

    if (videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }

    // Save watch history state every 4 seconds of progress
    if (Math.floor(curr) % 4 === 0 && curr > 2) {
      saveVideoWatchHistoryItem({
        id: post.id,
        title: post.title || 'Broadcast Stream',
        authorName: post.authorName || 'Bios Styles',
        mediaThumbnail: post.mediaThumbnail,
        mediaUrl: post.mediaUrl,
        lastPositionSeconds: curr,
        durationSeconds: dur,
        post: post
      });
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleToggleAutoplayGlobal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !autoPlayEnabled;
    setAutoPlayOnScroll(nextVal);
    setAutoPlayEnabled(nextVal);
  };

  return (
    <div 
      ref={containerRef}
      className="bg-slate-950 border-b border-slate-900 group/feedvideo relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Viewport */}
      <div 
        className="aspect-video w-full relative bg-black cursor-pointer overflow-hidden flex items-center justify-center"
        onClick={() => togglePlay()}
      >
        <video
          ref={videoRef}
          src={post.mediaUrl}
          poster={post.mediaThumbnail}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />

        {/* Big Center Play/Pause button overlay on hover or when paused */}
        {(!isPlaying || isHovered) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity">
            <button
              onClick={togglePlay}
              className="p-3.5 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white border border-slate-700/60 shadow-xl transition transform hover:scale-110"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white translate-x-0.5" />}
            </button>
          </div>
        )}

        {/* Top Badges & Controls Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Autoplay status toggle badge */}
          <button
            onClick={handleToggleAutoplayGlobal}
            className={`pointer-events-auto px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold border transition flex items-center gap-1.5 shadow-md ${
              autoPlayEnabled 
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900' 
                : 'bg-slate-900/80 border-slate-750 text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle automatic playback on scroll for feed videos"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoPlayEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Autoplay: {autoPlayEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Save to playlist button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistModal(true);
              }}
              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-600 text-slate-200 border border-slate-800 transition"
              title="Save to Playlist / Watch Later"
            >
              <ListPlus className="w-3.5 h-3.5" />
            </button>

            {/* Mute/Unmute toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Bottom Control Overlay Bar (Always visible or on hover) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 z-10"
        >
          {/* Interactive Progress Bar */}
          <VideoProgressBar
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            onSeek={handleSeek}
            colorScheme="rose"
            showHoverTime={true}
            heightClassName="h-1.5"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{formatVideoDuration(currentTime)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{formatVideoDuration(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenTheater && (
                <button
                  onClick={() => onOpenTheater(post)}
                  className="text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                >
                  <Film className="w-3 h-3" />
                  <span>Theater Mode</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Details Header under card */}
      <div className="p-4 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-sans font-bold text-sm text-slate-100 leading-snug flex items-center gap-1.5 truncate">
            <Film className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="truncate">{post.title || 'Broadcast Video Stream'}</span>
          </h4>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
            Creator: {post.authorName} • {post.views?.toLocaleString() || '142'} Views • Solas P2P Swarm
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPlaylistModal(true)}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition"
          >
            <ListPlus className="w-3 h-3 text-rose-400" />
            <span>+ Playlist</span>
          </button>
        </div>
      </div>

      {/* Playlist Modal trigger */}
      {showPlaylistModal && (
        <VideoPlaylistModal
          post={post}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default FeedVideoCard;
