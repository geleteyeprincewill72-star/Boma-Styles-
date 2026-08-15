/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { formatVideoDuration } from '../utils/videoEngine';

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  buffered?: number;
  onSeek: (time: number) => void;
  colorScheme?: 'rose' | 'cyan' | 'amber' | 'emerald';
  showHoverTime?: boolean;
  className?: string;
  heightClassName?: string;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  currentTime,
  duration,
  buffered = 0,
  onSeek,
  colorScheme = 'rose',
  showHoverTime = true,
  className = '',
  heightClassName = 'h-2'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0); // 0 to 1
  const [hoverTime, setHoverTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const safeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const bufferPercent = Math.min(100, Math.max(0, (buffered / safeDuration) * 100));

  const calculateTimeFromEvent = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = clickX / rect.width;
    return ratio * safeDuration;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = mouseX / rect.width;
    setHoverPosition(ratio);
    setHoverTime(ratio * safeDuration);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const newTime = calculateTimeFromEvent(e);
    onSeek(newTime);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newTime = calculateTimeFromEvent(e);
        onSeek(newTime);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, safeDuration]);

  // Color mappings
  const colorMap = {
    rose: 'from-rose-500 to-amber-500 bg-rose-500',
    cyan: 'from-cyan-500 to-blue-500 bg-cyan-400',
    amber: 'from-amber-500 to-yellow-400 bg-amber-400',
    emerald: 'from-emerald-500 to-teal-400 bg-emerald-400'
  };

  const thumbColorMap = {
    rose: 'bg-rose-400 ring-rose-300',
    cyan: 'bg-cyan-300 ring-cyan-200',
    amber: 'bg-amber-300 ring-amber-200',
    emerald: 'bg-emerald-300 ring-emerald-200'
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      className={`relative group/progressbar flex items-center cursor-pointer select-none py-1 ${className}`}
      title="Click or drag to seek video progress"
    >
      {/* Background Track */}
      <div className={`relative w-full ${heightClassName} bg-slate-900/80 rounded-full overflow-hidden transition-all group-hover/progressbar:h-3`}>
        {/* Buffer Track */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-slate-700/60 transition-all duration-300"
          style={{ width: `${bufferPercent}%` }}
        />

        {/* Hover ghost track */}
        {isHovering && (
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 transition-all"
            style={{ width: `${hoverPosition * 100}%` }}
          />
        )}

        {/* Active Played Track */}
        <div
          className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${colorMap[colorScheme]} transition-all`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Scrub Scrubber Thumb Handle */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full ${thumbColorMap[colorScheme]} shadow-lg ring-2 opacity-0 group-hover/progressbar:opacity-100 transition-opacity pointer-events-none`}
        style={{ left: `${progressPercent}%` }}
      />

      {/* Hover Time Tooltip */}
      {showHoverTime && isHovering && (
        <div
          className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 bg-slate-950/95 border border-slate-700 text-slate-100 text-[10px] font-mono font-bold rounded shadow-lg pointer-events-none transition-all z-30"
          style={{ left: `${hoverPosition * 100}%` }}
        >
          {formatVideoDuration(hoverTime)}
        </div>
      )}
    </div>
  );
};

export default VideoProgressBar;
