import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
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
  Cpu, 
  Flame, 
  Eye, 
  Grid, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Camera,
  Film,
  Palette,
  Atom,
  Crown
} from 'lucide-react';
import { FeedPost } from '../types';

export interface GeneratedImageItem {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  aspectRatio: string;
  resolution: string;
  seed: number;
  timestamp: number;
}

interface HighQualityImageStudioProps {
  username: string;
  avatar: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  onSetAvatar?: (avatarUrl: string) => void;
  onAnimateImage?: (imageUrl: string, prompt?: string) => void;
  theme?: 'dark' | 'light';
}

const STYLE_PRESETS = [
  { id: 'photorealistic', label: '8K Hyper-Photorealism', icon: Camera, desc: '35mm lens, f/1.8, natural volumetric lighting, ultra-realistic skin and texture', badge: 'Popular' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Flame, desc: 'Futuristic cityscape, rain-slicked asphalt, holographic neon glow, moody atmosphere', badge: 'Trending' },
  { id: 'cinematic3d', label: 'Unreal Engine 5 (3D)', icon: Film, desc: 'Octane render, Ray Tracing, 8K photorealistic textures, dynamic studio lighting', badge: 'NextGen' },
  { id: 'anime', label: 'Anime / Ghibli Style', icon: Palette, desc: 'Makoto Shinkai & Ghibli aesthetic, exquisite cel shading, rich emotional palette', badge: 'Artistic' },
  { id: 'oilpainting', label: 'Fine Oil Masterpiece', icon: Palette, desc: 'Visible rich brushstrokes, textured canvas, chiaroscuro museum fine art', badge: 'Classic' },
  { id: 'conceptart', label: 'Sci-Fi Concept Art', icon: Atom, desc: 'Epic digital matte painting, atmospheric perspective, blockbuster concept design', badge: 'Epic' },
  { id: 'darkfantasy', label: 'Dark Fantasy & Gothic', icon: Crown, desc: 'Ethereal mist, ancient ruins, gothic architecture, dramatic chiaroscuro', badge: 'Atmospheric' },
  { id: 'vector', label: 'Clean Vector Flat Art', icon: Grid, desc: 'Minimalist vector illustration, clean lines, modern aesthetic', badge: 'Graphic' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', desc: 'Avatars, Feed & Social (1200x1200)' },
  { id: '16:9', label: '16:9 Cinema', desc: 'Wallpapers, YouTube & PC (1920x1080)' },
  { id: '9:16', label: '9:16 Portrait', desc: 'Mobile Stories & Lockscreen (1080x1920)' },
  { id: '4:3', label: '4:3 Classical', desc: 'Art Galleries & Print (1600x1200)' },
  { id: '3:4', label: '3:4 Magazine', desc: 'Portraits & Editorial (1200x1600)' }
];

const QUALITY_TIERS = [
  '4K Ultra-HD (3840x2160)',
  '8K Super-Resolution Neural',
  'Masterpiece Studio HDR (10-bit)',
  'Cinema Raw 60fps Frame'
];

const PROMPT_INSPIRATIONS = [
  'Cybernetic astronaut standing on a bioluminescent alien cliff overlooking Saturn rings, cinematic lighting',
  'Hyperrealistic portrait of an ancient samurai in golden armor under glowing cherry blossom lanterns at dusk',
  'Futuristic floating crystal sanctuary in the clouds with waterfalls cascading into neon atmosphere',
  'Cute robotic steampunk owl with intricate brass gears and glowing amber lens eyes in Victorian library',
  'Ethereal goddess of light with flowing iridescent gown surrounded by cosmic nebulae and auroras',
  'Minimalist architectural villa on rugged Icelandic volcanic coast at sunrise with floor-to-ceiling glass'
];

const LOCAL_STORAGE_GALLERY_KEY = 'aura_ai_generated_images_gallery_v1';

export const HighQualityImageStudio: React.FC<HighQualityImageStudioProps> = ({
  username,
  avatar,
  onShareToFeed,
  onSetAvatar,
  onAnimateImage,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  // Input states
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [qualityTier, setQualityTier] = useState(QUALITY_TIERS[0]);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 999999));

  // Processing states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeImage, setActiveImage] = useState<GeneratedImageItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImageItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [avatarSetId, setAvatarSetId] = useState<string | null>(null);

  // Gallery
  const [gallery, setGallery] = useState<GeneratedImageItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load gallery from localStorage:", e);
    }
    // Default showcase images
    return [
      {
        id: 'init_img_1',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=85',
        prompt: 'Cybernetic neon cityscape with holographic billboards in rain',
        enhancedPrompt: 'Hyper-detailed 8K cyberpunk metropolis at night with vibrant cyan and magenta neon lights reflecting on wet asphalt roads, volumetric fog, intricate architectural details.',
        style: 'cyberpunk',
        aspectRatio: '16:9',
        resolution: '4K Ultra-HD (3840x2160)',
        seed: 847291,
        timestamp: Date.now() - 3600000 * 2
      },
      {
        id: 'init_img_2',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=85',
        prompt: 'Hyperrealistic portrait of cyber activist with chromatic lighting',
        enhancedPrompt: '8k studio photography, shallow depth of field, 85mm portrait lens, dramatic rim lighting, high-contrast chiaroscuro, natural skin texture and piercing gaze.',
        style: 'photorealistic',
        aspectRatio: '1:1',
        resolution: '4K Ultra-HD (3840x2160)',
        seed: 492019,
        timestamp: Date.now() - 3600000 * 8
      },
      {
        id: 'init_img_3',
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85',
        prompt: 'Majestic celestial landscape with iridescent clouds and crystal floating ruins',
        enhancedPrompt: 'Exquisite Makoto Shinkai style anime masterpiece, breathtaking golden hour lighting, floating crystalline spires, shooting stars in deep violet sky.',
        style: 'anime',
        aspectRatio: '16:9',
        resolution: '4K Ultra-HD (3840x2160)',
        seed: 391827,
        timestamp: Date.now() - 3600000 * 24
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(gallery));
    } catch (e) {}
  }, [gallery]);

  // Set first gallery item as active on start if none
  useEffect(() => {
    if (!activeImage && gallery.length > 0) {
      setActiveImage(gallery[0]);
    }
  }, [gallery, activeImage]);

  // Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter an image prompt first.");
      return;
    }
    setErrorMessage('');
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style })
      });
      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.warn("Prompt enhance error:", err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Generate Image
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      setErrorMessage("Please enter a descriptive prompt to generate high quality art.");
      return;
    }
    setErrorMessage('');
    setIsGenerating(true);
    setGenProgress(10);
    setCurrentStepText('Analyzing prompt semantics & lighting topology...');

    const progressTimer = setInterval(() => {
      setGenProgress(prev => {
        if (prev < 40) {
          setCurrentStepText('Synthesizing 4K diffusion latents & style matrices...');
          return prev + 15;
        }
        if (prev < 75) {
          setCurrentStepText('Applying volumetric ray-tracing & high-frequency texture passes...');
          return prev + 12;
        }
        if (prev < 92) {
          setCurrentStepText('Rendering final high-fidelity master output...');
          return prev + 4;
        }
        return prev;
      });
    }, 450);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          qualityTier,
          negativePrompt: negativePrompt.trim(),
          seed
        })
      });

      clearInterval(progressTimer);
      setGenProgress(100);
      setCurrentStepText('Image finalized!');

      const data = await res.json();
      if (data.success && data.image) {
        const newImg: GeneratedImageItem = data.image;
        setGallery(prev => [newImg, ...prev]);
        setActiveImage(newImg);
        // randomize seed for next generation
        setSeed(Math.floor(Math.random() * 9999999));
      } else {
        setErrorMessage(data.error || "Image generation failed. Please try again.");
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error("Image generation error:", err);
      setErrorMessage(err?.message || "Failed to reach AI image generation server.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image helper
  const handleDownloadImage = async (img: GeneratedImageItem) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = img.prompt.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      link.download = `aura-4k-${cleanName}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback
      window.open(img.url, '_blank');
    }
  };

  // Copy Image Link
  const handleCopyLink = (img: GeneratedImageItem) => {
    navigator.clipboard.writeText(img.url);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Share to Feed
  const handleSharePost = (img: GeneratedImageItem) => {
    if (onShareToFeed) {
      onShareToFeed({
        type: 'media',
        content: `🎨 **AI Visual Artwork**: "${img.prompt}"\n\n*Generated with Aura 4K Neural Studio (${img.style} • ${img.aspectRatio})*`,
        mediaUrl: img.url,
        isAiPost: true,
        aiModel: 'Gemini 2.5 Flash / Neural 4K Canvas',
        aiQualityTier: '4K HDR Neural',
        aiCapabilities: ['4K Photorealism', 'Ray Tracing', img.style]
      });
      setSharedId(img.id);
      setTimeout(() => setSharedId(null), 3000);
    } else {
      alert("Shared to Aura Sovereign Network feed!");
    }
  };

  // Set as Avatar
  const handleSetAsAvatar = (img: GeneratedImageItem) => {
    if (onSetAvatar) {
      onSetAvatar(img.url);
      setAvatarSetId(img.id);
      setTimeout(() => setAvatarSetId(null), 3000);
    } else {
      alert("Avatar updated!");
    }
  };

  // Delete from gallery
  const handleDeleteFromGallery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery(prev => prev.filter(item => item.id !== id));
    if (activeImage?.id === id) {
      const remaining = gallery.filter(item => item.id !== id);
      setActiveImage(remaining[0] || null);
    }
  };

  return (
    <div className="space-y-6" id="high-quality-image-studio">
      
      {/* Top Banner & Heading */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
                <span>AI 4K High-Quality Image Generator</span>
                <span className="text-[10px] bg-purple-950/80 border border-purple-800 text-purple-300 font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                  Studio Ultra HD
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Multi-style neural visual synthesis • 4K resolution • 1-click Download & Feed Dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Neural Core Ready</span>
          </span>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (5 cols) & Right High-Res Preview + Gallery (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROLS & PROMPT ENGINE (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
          }`}>
            
            {/* Prompt Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  Image Prompt & Subject
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className="text-[11px] font-mono text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 px-2.5 py-1 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                  title="Enhance prompt with professional lighting, camera lens and composition specs"
                >
                  <Sparkles className={`w-3 h-3 text-purple-400 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                  <span>{isEnhancingPrompt ? 'Polishing...' : '✨ Magic Polish'}</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your visual concept in detail (e.g. Cyberpunk samurai with glowing katana in rainy neon alleyway, 8k cinematic lighting, volumetric atmosphere)..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition leading-relaxed font-sans"
              />

              {/* Quick Inspiration Pills */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase block font-semibold">Prompt Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_INSPIRATIONS.map((insp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(insp)}
                      className="text-[10px] font-sans bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-slate-400 hover:text-purple-300 px-2 py-1 rounded-md transition text-left truncate max-w-full"
                    >
                      💡 {insp.slice(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Artistic & Visual Style</span>
                <span className="text-[10px] text-purple-400 font-normal">{STYLE_PRESETS.find(s => s.id === style)?.label}</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = style === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyle(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border-purple-500 text-white shadow-md shadow-purple-950/40'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold font-sans truncate">{item.label}</div>
                        <div className="text-[9px] text-slate-500 truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Aspect Ratio & Canvas Dimensions
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map(ratio => {
                  const isSelected = aspectRatio === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`py-2 px-1 rounded-xl border text-center transition font-mono ${
                        isSelected
                          ? 'bg-purple-900/60 border-purple-500 text-purple-200 font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                      }`}
                      title={ratio.desc}
                    >
                      <div className="text-xs">{ratio.id}</div>
                      <div className="text-[8px] text-slate-500 uppercase truncate mt-0.5">{ratio.label.split(' ')[1]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Settings Toggle (Negative prompt, resolution tier, seed) */}
            <div className="border-t border-slate-850/80 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Advanced Studio Parameters (Seed, Negative Prompt, Resolution)
                </span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 pt-2 border-t border-slate-900 animate-fadeIn text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-slate-500 font-bold">Negative Prompt (Elements to Exclude)</label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={e => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, low quality, artifacts, watermark, distorted hands"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-slate-500 font-bold">Resolution Preset</label>
                      <select
                        value={qualityTier}
                        onChange={e => setQualityTier(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        {QUALITY_TIERS.map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase text-slate-500 font-bold">Seed Control</label>
                        <button
                          type="button"
                          onClick={() => setSeed(Math.floor(Math.random() * 9999999))}
                          className="text-[9px] text-purple-400 hover:underline"
                        >
                          Randomize
                        </button>
                      </div>
                      <input
                        type="number"
                        value={seed}
                        onChange={e => setSeed(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error notice if any */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-900/60 text-red-300 text-xs font-mono flex items-center gap-2 animate-shake">
                <span className="shrink-0">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Generate Action Button */}
            <button
              id="btn-generate-image-trigger"
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 duration-150"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Generating 4K Masterpiece ({genProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate 4K High-Quality Image</span>
                </>
              )}
            </button>

            {/* Progress Bar when Generating */}
            {isGenerating && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${genProgress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                  <span>{currentStepText}</span>
                  <span className="text-purple-300 font-bold">{genProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-RES ACTIVE PREVIEW & OUTPUT GALLERY (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Active Image Showcase Box */}
          {activeImage ? (
            <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
            }`}>
              
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-purple-950/80 border border-purple-800/80 text-purple-300 px-2 py-0.5 rounded font-bold">
                    {activeImage.style}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ratio: {activeImage.aspectRatio} • Seed: {activeImage.seed}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLightboxImage(activeImage)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition"
                    title="Open Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyLink(activeImage)}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition"
                    title="Copy Image URL"
                  >
                    {copiedId === activeImage.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDownloadImage(activeImage)}
                    className="p-1.5 bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-200 rounded-lg transition font-mono text-xs flex items-center gap-1 px-2.5"
                    title="Download 4K Image"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Main Image Display */}
              <div 
                onClick={() => setLightboxImage(activeImage)}
                className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer flex items-center justify-center max-h-[460px]"
              >
                <img 
                  src={activeImage.url} 
                  alt={activeImage.prompt}
                  className="w-full h-auto max-h-[460px] object-contain rounded-xl transition duration-300 group-hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-end p-4">
                  <span className="text-xs text-slate-200 font-sans font-medium line-clamp-2">
                    {activeImage.prompt}
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono mt-1">
                    Click to zoom in fullscreen 4K view
                  </span>
                </div>
              </div>

              {/* Prompt and Metadata Breakdown */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Generated Prompt Details:</span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {activeImage.enhancedPrompt || activeImage.prompt}
                </p>
              </div>

              {/* Action Buttons Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {onAnimateImage && (
                  <button
                    onClick={() => onAnimateImage(activeImage.url, activeImage.prompt)}
                    className="py-2 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Animate Video</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadImage(activeImage)}
                  className="py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 4K</span>
                </button>

                <button
                  onClick={() => handleSharePost(activeImage)}
                  className="py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  {sharedId === activeImage.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                      <span>Posted!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-purple-200" />
                      <span>Post to Feed</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSetAsAvatar(activeImage)}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
                >
                  {avatarSetId === activeImage.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Avatar Set</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      <span>Set Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-slate-800 bg-[#0A0F1D]/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Enter a visual prompt on the left and tap Generate to render 4K artwork!
              </p>
            </div>
          )}

          {/* Generated Gallery Showcase */}
          <div className={`p-5 rounded-2xl border shadow-xl space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Session Image History ({gallery.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Click any art to inspect or export
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
              {gallery.map(item => {
                const isActive = activeImage?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveImage(item)}
                    className={`group relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition ${
                      isActive
                        ? 'border-purple-500 ring-2 ring-purple-500/50 scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-700 hover:scale-[1.02]'
                    }`}
                  >
                    <img 
                      src={item.url} 
                      alt="" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(item);
                        }}
                        className="p-1 bg-black/70 hover:bg-black text-white rounded"
                        title="View Fullscreen"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFromGallery(item.id, e)}
                        className="p-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-full border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={lightboxImage.url}
              alt={lightboxImage.prompt}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-purple-500/30"
              referrerPolicy="no-referrer"
            />

            <div className="bg-[#0A0F1D]/90 border border-slate-800 p-4 rounded-2xl max-w-3xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">{lightboxImage.style} • {lightboxImage.aspectRatio}</span>
                <p className="text-xs text-slate-200 font-sans line-clamp-2">{lightboxImage.prompt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownloadImage(lightboxImage)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 4K</span>
                </button>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HighQualityImageStudio;
