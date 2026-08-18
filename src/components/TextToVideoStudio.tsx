import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  Maximize2, 
  X, 
  Wand2, 
  Layers, 
  Flame, 
  Eye, 
  Grid, 
  Trash2, 
  ExternalLink,
  Film,
  Camera,
  Compass,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Tv,
  Rss,
  Info
} from 'lucide-react';
import { FeedPost } from '../types';

export interface GeneratedVideoItem {
  id: string;
  operationName?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  enhancedPrompt?: string;
  model: string;
  style: string;
  cameraMotion: string;
  aspectRatio: string;
  resolution: string;
  duration: number;
  fps: number;
  timestamp: number;
  isLiveVeo?: boolean;
}

interface TextToVideoStudioProps {
  username: string;
  avatar: string;
  initialImageUrl?: string;
  initialPrompt?: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  onNavigateToTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
}

const STYLE_PRESETS = [
  { id: 'cinematic', label: '8K Hollywood Cinema', icon: Film, desc: '35mm anamorphic lens, shallow depth of field, dramatic cinematic lighting', badge: 'Popular' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Flame, desc: 'Rain-soaked futuristic city, holographic displays, volumetric neon haze', badge: 'Trending' },
  { id: 'anime', label: 'Anime Studio Masterpiece', icon: Sparkles, desc: 'Makoto Shinkai & Ghibli aesthetic, vibrant cel shading, atmospheric wind', badge: 'Artistic' },
  { id: 'drone', label: '4K Drone Aerial', icon: Compass, desc: 'Sweeping panoramic aerial landscape flyover with natural sunlight', badge: 'Scenic' },
  { id: 'unreal5', label: 'Unreal Engine 5 (3D)', icon: Zap, desc: 'Ray-traced photorealistic 3D render with dynamic physics and particles', badge: 'NextGen' },
  { id: 'nature', label: 'National Geographic Wildlife', icon: Camera, desc: 'Macro wildlife documentary, hyper-detailed natural textures and golden hour', badge: 'Documentary' }
];

const CAMERA_MOTIONS = [
  { id: 'smooth-tracking', label: 'Smooth Tracking Shot', desc: 'Fluid lateral camera glide maintaining steady cinematic focus' },
  { id: 'dolly-zoom', label: 'Slow Dolly Zoom (Vertigo)', desc: 'Camera glides smoothly forward while framing focal subject' },
  { id: 'orbit-360', label: '360° Circular Orbit', desc: 'Dynamic panoramic rotation around the primary subject' },
  { id: 'drone-flythrough', label: 'Drone Flythrough', desc: 'Fast aerial glide traveling through environments and obstacles' },
  { id: 'fpv-first-person', label: 'First-Person POV', desc: 'Immersive ground-level perspective with organic subtle motion' },
  { id: 'hyperlapse', label: 'Hyperlapse Time-Motion', desc: 'High-speed temporal compression with continuous steady drift' }
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Cinema Widescreen', desc: 'Desktop, YouTube & Theater (1920x1080)' },
  { id: '9:16', label: '9:16 Mobile Vertical', desc: 'Shorts, Stories & Mobile Feed (1080x1920)' },
  { id: '1:1', label: '1:1 Square Feed', desc: 'Square Posts & Dynamic Feeds (1080x1080)' }
];

const PROMPT_INSPIRATIONS = [
  'A neon-lit cybernetic drone soaring through rainy skyscrapers in New Berlin at midnight with reflection ripples',
  'Macro cinematic shot of a holographic quantum microchip self-assembling with golden neural threads',
  'Hyperrealistic aerial drone sweeping over bioluminescent waves crashing on black volcanic sand under starry aurora',
  'Anime swordsman standing on a rocky peak overlooking a floating cloud kingdom as cherry blossoms scatter in wind',
  'Slow motion cinematic water droplet impacting a glowing crystalline surface, creating concentric rainbow waves',
  'Futuristic sleek magnetic levitation train gliding across a glass bridge suspended between two misty mountain peaks'
];

const LOCAL_STORAGE_VIDEO_GALLERY_KEY = 'aura_text_to_video_gallery_v1';

export const TextToVideoStudio: React.FC<TextToVideoStudioProps> = ({
  username,
  avatar,
  initialImageUrl,
  initialPrompt,
  onShareToFeed,
  onNavigateToTab,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  // Input states
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [model, setModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>('veo-3.1-lite-generate-preview');
  const [style, setStyle] = useState('cinematic');
  const [cameraMotion, setCameraMotion] = useState('smooth-tracking');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [duration, setDuration] = useState<number>(6);
  const [fps, setFps] = useState<number>(24);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Optional starting frame image
  const [startingImageBase64, setStartingImageBase64] = useState<string | null>(null);
  const [startingImagePreview, setStartingImagePreview] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update starting image if initialImageUrl changes
  useEffect(() => {
    if (initialImageUrl) {
      setStartingImagePreview(initialImageUrl);
      setStartingImageBase64(initialImageUrl);
    }
  }, [initialImageUrl]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Processing states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Active / selected video
  const [activeVideo, setActiveVideo] = useState<GeneratedVideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  const [videoCurrentTimeSec, setVideoCurrentTimeSec] = useState(0);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Action status indicators
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Gallery
  const [gallery, setGallery] = useState<GeneratedVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VIDEO_GALLERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load video gallery:", e);
    }
    // Seed initial high quality example
    return [
      {
        id: 'vid_seed_01',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-street-with-neon-lights-41553-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
        prompt: 'Futuristic neon city street at night with glowing holographic banners and high-speed motion',
        enhancedPrompt: 'Cinematic 8K, smooth tracking shot through futuristic neon city streets at midnight, volumetric rain reflections, anamorphic 35mm lens, 24fps motion.',
        model: 'veo-3.1-generate-preview',
        style: 'cyberpunk',
        cameraMotion: 'smooth-tracking',
        aspectRatio: '16:9',
        resolution: '1080p',
        duration: 6,
        fps: 24,
        timestamp: Date.now() - 3600000
      },
      {
        id: 'vid_seed_02',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
        prompt: 'Sovereign decentralized cryptographic terminal rendering peer-to-peer routing ledger',
        enhancedPrompt: 'Masterwork macro shot of green terminal stream executing real-time cryptographic hash verification with volumetric scan lines.',
        model: 'veo-3.1-lite-generate-preview',
        style: 'cinematic',
        cameraMotion: 'dolly-zoom',
        aspectRatio: '16:9',
        resolution: '720p',
        duration: 6,
        fps: 24,
        timestamp: Date.now() - 7200000
      }
    ];
  });

  // Save gallery to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VIDEO_GALLERY_KEY, JSON.stringify(gallery));
    } catch (e) {
      console.warn("Could not save video gallery:", e);
    }
  }, [gallery]);

  // Set initial active video
  useEffect(() => {
    if (!activeVideo && gallery.length > 0) {
      setActiveVideo(gallery[0]);
    }
  }, []);

  // Handle image file selection for starting frame
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setStartingImageBase64(result);
      setStartingImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeStartingImage = () => {
    setStartingImageBase64(null);
    setStartingImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enhance Prompt using Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a short concept or description first to enhance.');
      return;
    }
    setIsEnhancingPrompt(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/enhance-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          cameraMotion,
          duration
        })
      });
      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.warn('Enhance video prompt error:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generate Video
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMessage('Please describe the video you want to generate.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setGenerationProgress(5);
    setCurrentStepText('Initializing Veo Neural Engine & Storyboard Matrix...');

    // Progress simulation steps
    const stepInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 25) {
          setCurrentStepText('Synthesizing Keyframes & Temporal Composition...');
          return prev + 6;
        } else if (prev < 65) {
          setCurrentStepText('Veo Diffusion: Interpolating 24fps Motion Dynamics...');
          return prev + 5;
        } else if (prev < 88) {
          setCurrentStepText('Applying Volumetric Lighting, Physics & Anamorphic Lens Flare...');
          return prev + 3;
        } else if (prev < 95) {
          setCurrentStepText('Finalizing MP4 Stream & Encoding Bitrate...');
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      // Step 1: Start generation operation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          style,
          cameraMotion,
          aspectRatio,
          resolution,
          fps,
          duration,
          startingImageBase64: startingImageBase64 || undefined
        })
      });

      const startData = await startRes.json();
      if (!startData.success || !startData.operationName) {
        throw new Error(startData.error || 'Failed to start video generation.');
      }

      const operationName = startData.operationName;

      // Step 2: Poll operation until completed
      let isDone = false;
      let pollAttempts = 0;
      let finalVideoUrl = '';
      let finalThumbnail = startData.thumbnailUrl;

      while (!isDone && pollAttempts < 40) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        pollAttempts++;

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });

        const statusData = await statusRes.json();
        if (statusData.done) {
          isDone = true;
          finalVideoUrl = statusData.videoUrl || `/api/video-stream/${encodeURIComponent(operationName)}`;
          if (statusData.thumbnailUrl) finalThumbnail = statusData.thumbnailUrl;
          break;
        }
      }

      clearInterval(stepInterval);
      setGenerationProgress(100);
      setCurrentStepText('Video generation complete!');

      const newVideoItem: GeneratedVideoItem = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        operationName: operationName,
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnail || startingImagePreview || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
        prompt: prompt.trim(),
        enhancedPrompt: startData.enhancedPrompt || prompt.trim(),
        model: model,
        style: style,
        cameraMotion: cameraMotion,
        aspectRatio: aspectRatio,
        resolution: resolution,
        duration: duration,
        fps: fps,
        timestamp: Date.now(),
        isLiveVeo: Boolean(startData.isLiveVeo)
      };

      setGallery((prev) => [newVideoItem, ...prev]);
      setActiveVideo(newVideoItem);
      setIsPlaying(true);

      // Trigger playback on active video
      setTimeout(() => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.play().catch(() => {});
        }
      }, 300);

    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Video generation failure:', err);
      setErrorMessage(err.message || 'An error occurred during video generation. Please retry.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  // Video playback handlers
  const togglePlayPause = () => {
    if (!videoPlayerRef.current) return;
    if (isPlaying) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      videoPlayerRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      setVideoCurrentTimeSec(videoPlayerRef.current.currentTime);
      setVideoDurationSec(videoPlayerRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = time;
      setVideoCurrentTimeSec(time);
    }
  };

  const handleFullscreen = () => {
    if (videoPlayerRef.current) {
      if (videoPlayerRef.current.requestFullscreen) {
        videoPlayerRef.current.requestFullscreen();
      }
    }
  };

  // Share to Aura Feed
  const handlePublishToFeed = (vid: GeneratedVideoItem) => {
    if (onShareToFeed) {
      onShareToFeed({
        type: 'play',
        content: `🎬 Generated with Veo AI (${vid.style.toUpperCase()} • ${vid.cameraMotion}):\n\n"${vid.prompt}"`,
        mediaUrl: vid.videoUrl,
        title: vid.prompt.slice(0, 45) + (vid.prompt.length > 45 ? '...' : ''),
        aiModel: vid.model === 'veo-3.1-generate-preview' ? 'Veo 3.1 Pro 4K' : 'Veo 3.1 Lite',
        aiQualityTier: `${vid.resolution} @ ${vid.fps}fps`,
        aiCapabilities: ['Text-to-Video', 'Neural Motion', vid.style]
      });
      setSharedId(vid.id);
      setTimeout(() => setSharedId(null), 3000);
    }
  };

  // Copy video link
  const handleCopyLink = (vid: GeneratedVideoItem) => {
    navigator.clipboard.writeText(vid.videoUrl).then(() => {
      setCopiedId(vid.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Delete video from gallery
  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery((prev) => prev.filter((item) => item.id !== id));
    if (activeVideo?.id === id) {
      const remaining = gallery.filter((item) => item.id !== id);
      setActiveVideo(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16" id="text-to-video-studio-root">
      {/* Hero Header Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border shadow-2xl backdrop-blur-md ${
        isLight 
          ? 'bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-purple-50/80 border-amber-200/80 text-slate-800' 
          : 'bg-gradient-to-r from-[#140D26] via-[#101426] to-[#0A1624] border-amber-500/30 text-white'
      }`}>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>VEO 3.1 TEXT-TO-VIDEO ENGINE</span>
              <span className="text-slate-500">|</span>
              <span className="text-purple-300">4K HIGH-FIDELITY MOTION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
              AI Video <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Generator</span>
            </h1>
            <p className={`text-xs md:text-sm max-w-xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Transform descriptive text prompts and starting frames into fluid, cinematic video streams with camera motion control, dynamic lighting, and photorealistic physics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab && onNavigateToTab('videos')}
              className="px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition flex items-center gap-2 bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Explore Video Theater</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Side Controls & Form, Right Side Cinema Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Customization Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleGenerateVideo} className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F1C]/90 border-slate-800'
          }`}>
            
            {/* Prompt Input Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-200">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Video Prompt & Storyboard Description</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 transition ${
                    isEnhancingPrompt
                      ? 'bg-amber-950/60 border border-amber-700 text-amber-300 animate-pulse'
                      : !prompt.trim()
                      ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300'
                  }`}
                  title="Supercharge prompt with cinematic lighting, camera lens & motion dynamics"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isEnhancingPrompt ? 'animate-spin' : 'text-amber-400'}`} />
                  <span>{isEnhancingPrompt ? 'Directing...' : 'Enhance Prompt'}</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene in detail (e.g., A cybernetic drone soaring through rainy neon skyscrapers in Tokyo at night, cinematic volumetric lighting, 35mm lens, 4K motion)..."
                rows={3}
                className={`w-full p-4 rounded-2xl text-xs md:text-sm font-sans leading-relaxed transition focus:outline-none focus:ring-2 resize-none ${
                  isLight 
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-amber-400' 
                    : 'bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-amber-500/50 focus:border-amber-500'
                }`}
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Prompt Inspirations:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_INSPIRATIONS.map((insp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(insp)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition truncate max-w-[280px] sm:max-w-xs ${
                      isLight
                        ? 'bg-slate-100 hover:bg-amber-50 border-slate-200 text-slate-700 hover:border-amber-300'
                        : 'bg-slate-950 hover:bg-amber-950/40 border-slate-850 text-slate-300 hover:border-amber-500/40'
                    }`}
                    title={insp}
                  >
                    ✨ {insp}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Frame Image Upload (Optional Image-to-Video) */}
            <div className="space-y-2 border-t border-slate-800/60 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Starting Frame / Reference Image (Optional)</span>
                </label>
                {startingImagePreview && (
                  <button
                    type="button"
                    onClick={removeStartingImage}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove Frame</span>
                  </button>
                )}
              </div>

              {startingImagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 group max-h-40 bg-slate-950">
                  <img 
                    src={startingImagePreview} 
                    alt="Starting Frame" 
                    className="w-full h-36 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-xs font-mono text-purple-300 font-bold bg-slate-900/90 px-3 py-1 rounded-lg border border-purple-500/40">
                      🎬 Starting frame active for motion diffusion
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    isLight 
                      ? 'border-slate-300 hover:border-purple-400 bg-slate-50/50' 
                      : 'border-slate-800 hover:border-purple-500/50 bg-slate-950/40 hover:bg-purple-950/10'
                  }`}
                >
                  <Upload className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    Click to upload a starting image to animate into video
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Supports PNG, JPG, WebP (Image-to-Video Mode)
                  </span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange}
                    className="hidden" 
                  />
                </div>
              )}
            </div>

            {/* Visual Style Presets Selection */}
            <div className="space-y-2 border-t border-slate-800/60 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Cinematic Visual Style</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {STYLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = style === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setStyle(preset.id)}
                      className={`p-3 rounded-2xl border text-left transition relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md shadow-amber-950/30'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-950/60 hover:bg-slate-900 border-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          isSelected ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800/80 text-slate-400'
                        }`}>
                          {preset.badge}
                        </span>
                      </div>
                      <div className="font-bold text-xs font-sans leading-snug">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-1 font-sans">
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Camera Motion Selection */}
            <div className="space-y-2 border-t border-slate-800/60 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Camera Motion & Cinematography</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMERA_MOTIONS.map((motion) => {
                  const isSelected = cameraMotion === motion.id;
                  return (
                    <button
                      key={motion.id}
                      type="button"
                      onClick={() => setCameraMotion(motion.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-950/60 hover:bg-slate-900 border-slate-850 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs font-sans">{motion.label}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{motion.desc}</div>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio & Model Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aspect Ratio</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`p-2 rounded-xl border text-center font-mono text-xs font-bold transition ${
                        aspectRatio === ar.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : isLight
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ar.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Video Model</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModel('veo-3.1-lite-generate-preview')}
                    className={`p-2 rounded-xl border text-center font-mono text-xs font-bold transition ${
                      model === 'veo-3.1-lite-generate-preview'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Veo 3.1 Lite (Fast)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModel('veo-3.1-generate-preview')}
                    className={`p-2 rounded-xl border text-center font-mono text-xs font-bold transition ${
                      model === 'veo-3.1-generate-preview'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Veo 3.1 Pro (4K)
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Multi-Step Generation Progress Indicator */}
            {isGenerating && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-amber-500/40 animate-pulse">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{currentStepText}</span>
                  </span>
                  <span className="text-amber-400 font-bold">{generationProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Veo Diffusion Neural Stream</span>
                  <span>Target: {resolution} @ {fps}fps</span>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl font-bold font-mono text-sm tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2.5 active:scale-[0.99] ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:via-pink-500 hover:to-purple-500 text-white border border-amber-300/30 shadow-amber-950/40 hover:shadow-purple-900/40'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Video Stream...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>Generate Video with Veo</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Cinematic Canvas Player & Video Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Cinema Player Stage */}
          <div className={`rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F1C] border-slate-800'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between font-mono text-xs font-bold ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-850 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Cinematic Preview Stage</span>
              </div>
              {activeVideo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  {activeVideo.resolution} • {activeVideo.aspectRatio}
                </span>
              )}
            </div>

            {/* Video Screen */}
            <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[380px] overflow-hidden group">
              {activeVideo ? (
                <>
                  <video
                    ref={videoPlayerRef}
                    src={activeVideo.videoUrl}
                    poster={activeVideo.thumbnailUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    loop
                    className="w-full h-full object-contain max-h-[380px]"
                  />

                  {/* Centered Play/Pause Overlay */}
                  <div 
                    onClick={togglePlayPause}
                    className={`absolute inset-0 bg-black/30 flex items-center justify-center transition cursor-pointer ${
                      isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl transform transition hover:scale-110">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </div>
                  </div>

                  {/* Bottom Video Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
                    <input
                      type="range"
                      min={0}
                      max={videoDurationSec || 10}
                      step={0.1}
                      value={videoCurrentTimeSec}
                      onChange={handleSeek}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex items-center justify-between text-white text-[11px] font-mono">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={togglePlayPause} className="hover:text-amber-400 transition">
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button type="button" onClick={toggleMute} className="hover:text-amber-400 transition">
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <span>
                          {Math.floor(videoCurrentTimeSec)}s / {Math.floor(videoDurationSec || activeVideo.duration || 6)}s
                        </span>
                      </div>

                      <button type="button" onClick={handleFullscreen} className="hover:text-amber-400 transition">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-500 font-mono text-xs">
                  <Video className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                  <p>No video selected. Type a prompt to generate your first clip!</p>
                </div>
              )}
            </div>

            {/* Video Details & Quick Action Buttons */}
            {activeVideo && (
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs font-sans text-slate-100 line-clamp-2">
                    {activeVideo.prompt}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Model: {activeVideo.model === 'veo-3.1-generate-preview' ? 'Veo 3.1 Pro (4K)' : 'Veo 3.1 Lite'} • Style: {activeVideo.style} • Camera: {activeVideo.cameraMotion}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                  
                  {/* Download MP4 */}
                  <a
                    href={activeVideo.videoUrl}
                    download={`aura-video-${activeVideo.id}.mp4`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition text-center font-bold bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download</span>
                  </a>

                  {/* Share to Aura Feed */}
                  <button
                    type="button"
                    onClick={() => handlePublishToFeed(activeVideo)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition text-center font-bold ${
                      sharedId === activeVideo.id
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-purple-400/30 text-white shadow-md'
                    }`}
                  >
                    {sharedId === activeVideo.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Published!</span>
                      </>
                    ) : (
                      <>
                        <Rss className="w-3.5 h-3.5" />
                        <span>Post to Feed</span>
                      </>
                    )}
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeVideo)}
                    className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition text-center font-bold bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-200"
                  >
                    {copiedId === activeVideo.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Generated Video Gallery Drawer */}
          <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F1C] border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                <Grid className="w-4 h-4 text-amber-400" />
                <span>My Generated Video Gallery ({gallery.length})</span>
              </div>
            </div>

            {gallery.length === 0 ? (
              <div className="text-center p-6 text-slate-500 font-mono text-xs">
                No videos in your gallery yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {gallery.map((item) => {
                  const isCurrent = activeVideo?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveVideo(item);
                        setIsPlaying(true);
                        setTimeout(() => {
                          if (videoPlayerRef.current) videoPlayerRef.current.play().catch(() => {});
                        }, 200);
                      }}
                      className={`relative rounded-2xl overflow-hidden border cursor-pointer transition group flex flex-col justify-end p-2.5 min-h-[110px] ${
                        isCurrent
                          ? 'border-amber-400 ring-2 ring-amber-500/30'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                      }`}
                    >
                      {/* Background Thumbnail */}
                      <img 
                        src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60'} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover transition transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Play Badge Icon */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-750 flex items-center justify-center text-amber-400">
                        <Play className="w-3 h-3 ml-0.5" />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteVideo(item.id, e)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-slate-950/80 text-slate-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        title="Delete video"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Info Label */}
                      <div className="relative z-10 space-y-0.5">
                        <div className="text-[11px] font-bold text-white font-sans truncate drop-shadow">
                          {item.prompt}
                        </div>
                        <div className="text-[9px] font-mono text-amber-300 font-bold uppercase">
                          {item.resolution} • {item.style}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TextToVideoStudio;
