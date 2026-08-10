import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Wand2, Check, ArrowRight, Zap, Target, Sliders, X, RefreshCw, Database } from 'lucide-react';

export interface PostPreference {
  description: string;
  category: string;
  tone: string;
  format: string;
  platformStyle: string;
  mediaQuality: string;
  feedWishlist: string;
  enableAiAssistance: boolean;
  createdAt: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (preference: PostPreference) => void;
  initialPreference?: PostPreference | null;
}

const PRESET_TOPICS = [
  { id: 'tech', label: '🚀 Tech & Innovation', prompt: 'Tech news, software development, decentralized mesh networks, and future innovations.' },
  { id: 'video', label: '🎥 Video Vlogs & Creator Content', prompt: 'Engaging video broadcasts, behind-the-scenes vlogs, and storytelling.' },
  { id: 'inspiration', label: '💡 Inspiration & Motivation', prompt: 'Daily motivational thoughts, life lessons, and personal growth insights.' },
  { id: 'entertainment', label: '🎭 Comedy & Viral Media', prompt: 'Fun, relatable comedy clips, funny observations, and trending memes.' },
  { id: 'business', label: '📊 Finance, Crypto & Web3', prompt: 'Market updates, startup growth strategies, crypto analysis, and money tips.' },
  { id: 'creative', label: '🎨 Art, Music & Fashion', prompt: 'Showcasing original digital art, music releases, fashion designs, and creative projects.' }
];

const PLATFORM_STYLES = [
  { id: 'aura_nexus', name: 'Aura Nexus Community Feed', desc: 'Community discussions, friendly stories, photo updates & engaging comments' },
  { id: 'pulse_flash', name: 'Pulse Flash Thread', desc: 'Short punchy updates, viral threads, breaking dispatches & trending hashtags' },
  { id: 'omnivision_hd', name: 'OmniVision HD Broadcasts', desc: 'Video-first broadcasts, 1080p/4K streams, chapters, vlogs & creator scripts' },
  { id: 'direct_status', name: 'Direct Instant Status Notes', desc: 'Direct status updates, broadcast notes, media clips & instant notes' }
];

const QUALITY_OPTIONS = [
  { id: '4k', name: '4K Ultra HD (2160p)', detail: 'Best picture quality, high bandwidth' },
  { id: '1080p', name: '1080p Full HD', detail: 'Crisp video & sharp images' },
  { id: '720p', name: '720p Balanced (Default)', detail: 'Fast loading & good video quality' },
  { id: '360p', name: '360p Data Saver', detail: 'Minimal data usage on mobile networks' }
];

const TONE_OPTIONS = [
  'Casual & Friendly',
  'Professional & Informative',
  'Energetic & Bold',
  'Humorous & Playful',
  'Inspirational & Uplifting'
];

const FORMAT_OPTIONS = [
  'HLS Broadcast Video & Caption',
  'Text Post & Image Visual',
  'Quick Update / Short Note',
  'Interactive Poll & Discussion'
];

export const FirstTimePostPreferenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSavePreferences,
  initialPreference
}) => {
  const [description, setDescription] = useState<string>(initialPreference?.description || '');
  const [feedWishlist, setFeedWishlist] = useState<string>(initialPreference?.feedWishlist || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialPreference?.category || 'Tech & Innovation');
  const [selectedTone, setSelectedTone] = useState<string>(initialPreference?.tone || 'Casual & Friendly');
  const [selectedFormat, setSelectedFormat] = useState<string>(initialPreference?.format || 'HLS Broadcast Video & Caption');
  const [platformStyle, setPlatformStyle] = useState<string>(initialPreference?.platformStyle || 'Pulse Flash Thread');
  const [mediaQuality, setMediaQuality] = useState<string>(initialPreference?.mediaQuality || '1080p Full HD');
  const [enableAiAssistance, setEnableAiAssistance] = useState<boolean>(
    initialPreference?.enableAiAssistance !== undefined ? initialPreference.enableAiAssistance : true
  );
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  useEffect(() => {
    if (initialPreference) {
      setDescription(initialPreference.description || '');
      setFeedWishlist(initialPreference.feedWishlist || '');
      setSelectedCategory(initialPreference.category || 'Tech & Innovation');
      setSelectedTone(initialPreference.tone || 'Casual & Friendly');
      setSelectedFormat(initialPreference.format || 'HLS Broadcast Video & Caption');
      setPlatformStyle(initialPreference.platformStyle || 'Pulse Flash Thread');
      setMediaQuality(initialPreference.mediaQuality || '1080p Full HD');
      setEnableAiAssistance(initialPreference.enableAiAssistance);
    }
  }, [initialPreference]);

  // 15-Second Auto-Bypass Interview Countdown Timer
  useEffect(() => {
    if (!isOpen || isSaving || isTimerPaused) return;

    if (countdown <= 0) {
      handleSave();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, isSaving, isTimerPaused]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_TOPICS[0]) => {
    setSelectedCategory(preset.label);
    if (!description.trim() || description === PRESET_TOPICS.find(p => p.label === selectedCategory)?.prompt) {
      setDescription(preset.prompt);
    }
  };

  const handleSave = () => {
    if (!description.trim()) {
      setDescription('Inspiring, engaging posts focused on technology, creative videos, and community updates.');
    }

    setIsSaving(true);

    const preference: PostPreference = {
      description: description.trim() || 'Inspiring and engaging posts tailored for my audience.',
      category: selectedCategory,
      tone: selectedTone,
      format: selectedFormat,
      platformStyle,
      mediaQuality,
      feedWishlist: feedWishlist.trim() || 'Viral tech updates, funny comedy vlogs, breaking news, and high-quality creator videos.',
      enableAiAssistance,
      createdAt: Date.now()
    };

    setTimeout(() => {
      localStorage.setItem('aura_post_preference', JSON.stringify(preference));
      localStorage.setItem('aura_first_time_onboarding_completed', 'true');
      onSavePreferences(preference);
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#070B19] border border-amber-500/40 w-full max-w-xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
        
        {/* Subtle Ambient Background Accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-mono uppercase text-amber-300 tracking-wider">
                First-Time Creator Preferences
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Customize How You Want Your Posts & Feed To Be
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSave()}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition flex items-center gap-1 text-xs font-mono"
            title="Skip and enter app now"
          >
            <span>Skip</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 15-Second Auto-Bypass Interview Banner */}
        <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-amber-200 relative z-10 shadow-md">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Auto-bypassing interview in <strong className="text-amber-300 font-bold text-sm">{countdown}s</strong>...</span>
          </div>
          <button
            onClick={() => handleSave()}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono font-bold text-[11px] rounded-lg transition uppercase tracking-wider shadow"
          >
            Bypass Now
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between gap-1.5 font-mono text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded-xl border border-slate-800 relative z-10 overflow-x-auto">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition text-center font-bold flex items-center justify-center gap-1 whitespace-nowrap ${
              step === 1 ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>1. Focus & Wishlist</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition text-center font-bold flex items-center justify-center gap-1 whitespace-nowrap ${
              step === 2 ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Social Platform & Quality</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition text-center font-bold flex items-center justify-center gap-1 whitespace-nowrap ${
              step === 3 ? 'bg-amber-500 text-slate-950 shadow' : 'hover:bg-slate-900 text-slate-300'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>3. Tone & AI</span>
          </button>
        </div>

        {/* STEP 1: Description & What Users Want To See */}
        {step === 1 && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Describe your post style:</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your post style and content interests..."
                rows={2.5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-sans shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>What do you want to see in your feed?</span>
              </label>
              <textarea
                value={feedWishlist}
                onChange={(e) => setFeedWishlist(e.target.value)}
                placeholder="Describe what content you would like to see in your feed..."
                rows={2.5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-sans shadow-inner"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-400 mb-1.5">
                Choose a topic focus:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TOPICS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-left transition font-mono text-xs flex items-center justify-between gap-2 ${
                      selectedCategory === preset.label
                        ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {selectedCategory === preset.label && (
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Social Platform Style & Video/Media Quality */}
        {step === 2 && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            {/* Social Platform Selection */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Social Platform Style Preference:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PLATFORM_STYLES.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => setPlatformStyle(ps.name)}
                    className={`p-2.5 rounded-xl border text-left transition font-mono text-xs space-y-1 ${
                      platformStyle === ps.name
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-slate-200">
                      <span>{ps.name}</span>
                      {platformStyle === ps.name && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug line-clamp-2">
                      {ps.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Quality Preference */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Preferred Viewing Quality:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setMediaQuality(q.name)}
                    className={`p-2.5 rounded-xl border text-left transition font-mono text-xs flex items-center justify-between ${
                      mediaQuality === q.name
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{q.name}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{q.detail}</div>
                    </div>
                    {mediaQuality === q.name && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Tone, Format & AI Options */}
        {step === 3 && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            {/* Tone Selection */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Select Preferred Post Tone:
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
                      selectedTone === tone
                        ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Preferred Post Format:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition text-left flex items-center justify-between ${
                      selectedFormat === fmt
                        ? 'bg-teal-950/70 border-teal-500/70 text-teal-200 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{fmt}</span>
                    {selectedFormat === fmt && <Check className="w-4 h-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Automated Creator Feed Toggle with Database Sync */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-200 flex items-center gap-2">
                    <span>Automated Creator Feed Sync</span>
                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] rounded font-mono">Database Synced</span>
                  </h4>
                  <p className="text-[10px] font-sans text-slate-400">
                    Continuously sync high-fidelity creator posts & 1080p video broadcasts directly to your real-time cloud database
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableAiAssistance}
                onChange={(e) => setEnableAiAssistance(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 relative z-10">
          {step < 3 ? (
            <div className="flex gap-2 w-full">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono uppercase font-bold rounded-xl transition"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-mono font-bold uppercase rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono uppercase font-bold rounded-xl transition"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-slate-950" />
                    <span>Save My Preferences</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FirstTimePostPreferenceModal;
