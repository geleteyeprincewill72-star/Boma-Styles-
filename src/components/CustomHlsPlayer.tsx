import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  PictureInPicture2, 
  RotateCcw, 
  Activity, 
  Award, 
  Smartphone, 
  Wifi, 
  Zap,
  Check,
  Flame,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { VideoProgressBar } from './VideoProgressBar';

interface CustomHlsPlayerProps {
  key?: React.Key;
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  initialTime?: number;
  onEnded?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  onTimeUpdateCallback?: (time: number, dur: number) => void;
  isLiteMode?: boolean;
  onMonetizationEvent?: (desc: string, rewardUSD: number) => void;
  creatorName?: string;
}

export default function CustomHlsPlayer({
  src,
  poster,
  title = 'Broadcast Stream',
  autoPlay = false,
  initialTime = 0,
  onEnded,
  onPause,
  onPlay,
  onTimeUpdateCallback,
  isLiteMode = false,
  onMonetizationEvent,
  creatorName = 'Bios Styles'
}: CustomHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  // HLS & Quality Settings
  const [levels, setLevels] = useState<{ id: number; name: string; height?: number }[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(-1); // -1 is Auto
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [currentResolution, setCurrentResolution] = useState<string>('1080p HD');
  
  // Monetization Ad Break Overlay & OPAY Facebook Notification
  const [showAdBreak, setShowAdBreak] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(5);
  const [adEarned, setAdEarned] = useState<boolean>(false);
  const [opayNotifSent, setOpayNotifSent] = useState<boolean>(false);

  // Auto hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS or native playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHlsStream = src.includes('.m3u8') || src.endsWith('.m3u8');

    if (isHlsStream && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
        // Adapt low quality caps if lite mode is active on low end devices
        maxBufferLength: isLiteMode ? 10 : 30,
        maxMaxBufferLength: isLiteMode ? 20 : 60,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const parsedLevels = data.levels.map((lvl, index) => ({
          id: index,
          name: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
          height: lvl.height
        }));
        setLevels(parsedLevels);

        // Force low quality in Lite Mode for older mobile devices
        if (isLiteMode && data.levels.length > 0) {
          const lowestIdx = 0; // lowest level
          hls.currentLevel = lowestIdx;
          setSelectedLevel(lowestIdx);
          setCurrentResolution(`${data.levels[0].height || 360}p (Mobile Lite)`);
        } else {
          setCurrentResolution('Auto (Adaptive)');
        }

        if (autoPlay) {
          video.play().catch(e => console.warn("Autoplay blocked:", e));
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setCurrentResolution(lvl.height ? `${lvl.height}p` : `Level ${data.level}`);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsStream) {
      // Native HLS for Safari/iOS or standard MP4/WebM video
      video.src = src;
      setCurrentResolution(isLiteMode ? '480p (Mobile Adaptive)' : '1080p HD');
      if (autoPlay) {
        video.play().catch(e => console.warn("Autoplay blocked:", e));
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isLiteMode]);

  // Video Event Handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
    if (onTimeUpdateCallback) {
      onTimeUpdateCallback(video.currentTime, video.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    if (initialTime > 0 && initialTime < video.duration) {
      video.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      video.play().then(() => {
        setIsPlaying(true);
        if (onPlay) onPlay();
        if (onMonetizationEvent) {
          onMonetizationEvent(`Watched HLS stream: "${title}"`, 0.05);
        }
      }).catch(e => console.warn(e));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleLevelChange = (levelIdx: number) => {
    setSelectedLevel(levelIdx);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIdx;
    }
    setShowSettingsMenu(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => console.error(err));
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP not supported or failed:", err);
    }
  };

  // Trigger Creator Rewarded Ad Break
  const triggerAdBreak = () => {
    setShowAdBreak(true);
    setAdTimer(5);
    setAdEarned(false);
    setOpayNotifSent(false);

    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdEarned(true);
          setOpayNotifSent(true);
          if (onMonetizationEvent) {
            onMonetizationEvent(`Creator Ad Break Watched on "${title}" - Notification Dispatched to OPAY Node`, 0.25);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto Hide Controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatSecs = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying) setShowControls(false);
      }}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group border border-slate-900 shadow-2xl select-none"
    >
      {/* HTML5 Video Core */}
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={togglePlay}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Top Overlay Badge Bar */}
      <div className={`absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between z-20 ${
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="bg-rose-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1 shadow">
            <Activity className="w-3 h-3 animate-pulse" />
            HLS LIVE
          </span>
          <h4 className="text-xs font-bold font-sans text-slate-100 truncate max-w-[200px] sm:max-w-xs drop-shadow">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Low Resource Phone Lite Mode Badge */}
          {isLiteMode && (
            <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Lite Streaming (Saved Data)
            </span>
          )}

          {/* Quick Ad Button to generate creator revenue */}
          <button
            onClick={triggerAdBreak}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition flex items-center gap-1 shadow animate-pulse"
            title="Watch 5s ad to yield monetization revenue to creator OPAY node"
          >
            <DollarSign className="w-3 h-3" />
            Watch Ad (+₦400 NGN)
          </button>
        </div>
      </div>

      {/* Play/Pause Center Overlay Icon on Pause */}
      {!isPlaying && !showAdBreak && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 cursor-pointer backdrop-blur-[2px] transition"
        >
          <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl border border-rose-400/50 hover:scale-110 transition transform">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Creator Ad Break Overlay Window */}
      {showAdBreak && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Creator Revenue Boost Break
            </span>
            <h3 className="text-base font-bold font-sans text-slate-100 mt-2">
              Supporting Broadcast Node Creator: <span className="text-amber-400">{creatorName}</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto mt-1">
              Watching this sponsored ad break routes high-yield monetization tokens directly to the creator's connected OPAY account.
            </p>
          </div>

          {!adEarned ? (
            <div className="space-y-2">
              <div className="text-3xl font-black font-mono text-emerald-400">
                00:0{adTimer}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Ad break completing automatically...
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-sm mx-auto w-full">
              <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-xs p-3 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Successfully Monetized! +$0.25 USD (~₦407.50 NGN) credited to Creator OPAY</span>
              </div>

              {/* OPAY Account Owner Facebook Notification Banner */}
              <div className="bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-blue-950/90 border border-blue-500/50 text-slate-100 p-3.5 rounded-xl space-y-2 text-left text-xs font-mono shadow-xl">
                <div className="flex items-center justify-between text-blue-300 font-bold uppercase text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    OPAY Number Notification Dispatched
                  </span>
                  <span className="bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded text-[9px]">
                    08154561612
                  </span>
                </div>

                <p className="text-slate-200 text-[11px] leading-relaxed">
                  📢 <strong>Notice to OPAY Account Holder (08154561612):</strong> Money gained (+₦407.50) has entered your OPAY node. You are requested to chat me on Facebook at <strong className="text-amber-300">"Bios Styles"</strong> immediately to confirm you have seen it!
                </p>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold uppercase rounded-lg transition shadow flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Chat "Bios Styles" On Facebook</span>
                </a>
              </div>

              <button
                onClick={() => setShowAdBreak(false)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase font-bold rounded-xl transition shadow"
              >
                Resume Broadcast Stream
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 space-y-2 transition-opacity duration-300 z-20 ${
        showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        
        {/* Seek Bar Slider with Progress Buffer */}
        <VideoProgressBar
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onSeek={(time) => {
            if (videoRef.current) {
              videoRef.current.currentTime = time;
              setCurrentTime(time);
            }
          }}
          colorScheme="rose"
          showHoverTime={true}
        />

        {/* Control Buttons Deck */}
        <div className="flex items-center justify-between text-slate-200 text-xs font-mono">
          
          {/* Left Controls: Play, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:bg-slate-800/80 rounded-lg text-white transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1.5 hover:bg-slate-800/80 rounded-lg transition">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-[11px] text-slate-400 font-mono">
              {formatSecs(currentTime)} / {formatSecs(duration)}
            </span>
          </div>

          {/* Right Controls: Resolution Quality, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-2 relative">
            
            {/* Speed Selector Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSettingsMenu(false);
                }}
                className="px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded text-[10px] font-bold transition"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl space-y-0.5 z-30 min-w-[80px]">
                  {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full text-left px-2 py-1 rounded text-[10px] transition ${
                        playbackRate === speed ? 'bg-rose-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Level Settings Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowSpeedMenu(false);
                }}
                className="px-2 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded text-[10px] font-bold transition flex items-center gap-1 text-slate-200"
              >
                <Settings className="w-3 h-3 text-rose-400" />
                <span>{currentResolution}</span>
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-8 right-0 bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-2xl space-y-1 z-30 min-w-[140px]">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block px-1 pb-1 border-b border-slate-900">
                    Quality Level
                  </span>
                  <button
                    onClick={() => handleLevelChange(-1)}
                    className={`w-full text-left px-2 py-1 rounded text-[10px] flex items-center justify-between transition ${
                      selectedLevel === -1 ? 'bg-rose-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>Auto (Adaptive)</span>
                    {selectedLevel === -1 && <Check className="w-3 h-3" />}
                  </button>
                  {levels.map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => handleLevelChange(lvl.id)}
                      className={`w-full text-left px-2 py-1 rounded text-[10px] flex items-center justify-between transition ${
                        selectedLevel === lvl.id ? 'bg-rose-600 font-bold text-white' : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span>{lvl.name}</span>
                      {selectedLevel === lvl.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              className="p-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300 transition"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-slate-800/80 rounded-lg text-slate-300 transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
