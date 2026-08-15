import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Disc, 
  Wand2, 
  Radio, 
  ListMusic, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Copy,
  Plus
} from 'lucide-react';
import { generateSynthesizedMusic, GeneratedTrack, MusicTrackConfig } from '../utils/audioSynthesizer';

interface MusicGeneratorProps {
  theme?: 'dark' | 'light';
  onShareToFeed?: (trackTitle: string, audioUrl: string) => void;
}

const PRESET_GENRES: { id: MusicTrackConfig['genre']; label: string; defaultBpm: number; desc: string; color: string }[] = [
  { id: 'synthwave', label: 'Synthwave 80s', defaultBpm: 120, desc: 'Analog synthesizers, retro arpeggios & punchy bass', color: 'from-purple-600 to-pink-600' },
  { id: 'lofi', label: 'Lo-Fi Chill', defaultBpm: 84, desc: 'Warm lowpass filters, vinyl crackle & mellow chords', color: 'from-amber-600 to-orange-600' },
  { id: 'afrobeat', label: 'Afrobeat Club', defaultBpm: 108, desc: 'Syncopated polyrhythms, log drum bass & percussion', color: 'from-emerald-600 to-teal-600' },
  { id: 'ambient', label: 'Cyber Ambient', defaultBpm: 70, desc: 'Ethereal pads, atmospheric drones & space soundscapes', color: 'from-cyan-600 to-blue-600' },
  { id: 'darktrap', label: 'Dark Trap', defaultBpm: 140, desc: 'Sub-bass 808s, fast hi-hat rolls & eerie melody', color: 'from-red-600 to-rose-700' },
  { id: 'house', label: 'House & EDM', defaultBpm: 128, desc: 'Four-on-the-floor kick, synth stabs & energetic bounce', color: 'from-indigo-600 to-violet-600' },
];

const PRESET_PROMPTS = [
  'Cyberpunk neon highway drive with heavy retro arpeggios',
  'Lo-fi study session under midnight rain with vinyl warmth',
  'Lagos afrobeat rhythm with syncopated percussion & deep bass',
  'Deep space exploration ambient drone with shimmering pads',
  'Dark underground trap beat with rolling hi-hats & 808 bass',
];

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({
  theme = 'dark',
  onShareToFeed
}) => {
  const isLight = theme === 'light';

  // Form States
  const [promptText, setPromptText] = useState(PRESET_PROMPTS[0]);
  const [selectedGenre, setSelectedGenre] = useState<MusicTrackConfig['genre']>('synthwave');
  const [bpm, setBpm] = useState<number>(120);
  const [musicalKey, setMusicalKey] = useState<string>('C');
  const [mood, setMood] = useState<MusicTrackConfig['mood']>('energetic');
  const [duration, setDuration] = useState<number>(15); // seconds

  // Generation & Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  
  // Track Library State
  const [tracks, setTracks] = useState<GeneratedTrack[]>(() => {
    try {
      const saved = localStorage.getItem('aura_generated_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Playing Track State
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_generated_tracks', JSON.stringify(tracks));
    } catch (e) {
      console.warn("Storage quota exceeded for tracks");
    }
  }, [tracks]);

  // Audio Playback Listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setTrackDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeTrackId]);

  // Animated Audio Visualizer Canvas
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const height = Math.abs(Math.sin((frame * 0.1) + (i * 0.3))) * (canvas.height * 0.8) + 4;
        const x = i * (barWidth + 2);
        const y = canvas.height - height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const handleGenreSelect = (genreId: MusicTrackConfig['genre']) => {
    setSelectedGenre(genreId);
    const found = PRESET_GENRES.find(g => g.id === genreId);
    if (found) setBpm(found.defaultBpm);
  };

  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing music prompt & tone parameters...');

    try {
      await new Promise(r => setTimeout(r, 600));
      setGenerationStep('Initializing Web Audio DSP Oscillators & Drum Sequencer...');
      
      await new Promise(r => setTimeout(r, 800));
      setGenerationStep('Synthesizing harmonic polyphonic arpeggios & basslines...');

      const config: MusicTrackConfig = {
        title: promptText.trim() || `${selectedGenre.toUpperCase()} Aura Groove`,
        genre: selectedGenre,
        bpm,
        key: musicalKey,
        mood,
        durationSeconds: duration,
      };

      const result = await generateSynthesizedMusic(config);

      setGenerationStep('Rendering final WAV buffer & waveform spectral data...');
      await new Promise(r => setTimeout(r, 500));

      const newTrack: GeneratedTrack = {
        id: `track_${Date.now()}`,
        title: promptText.trim() ? promptText.slice(0, 40) : `${selectedGenre.toUpperCase()} Beat #${tracks.length + 1}`,
        genre: selectedGenre,
        bpm,
        key: musicalKey,
        mood,
        audioUrl: result.audioUrl,
        duration,
        createdAt: Date.now(),
        waveformData: result.waveformData,
      };

      setTracks(prev => [newTrack, ...prev]);
      setActiveTrackId(newTrack.id);
      
      if (audioRef.current) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Music generation error:", err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const togglePlayTrack = (track: GeneratedTrack) => {
    if (activeTrackId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setActiveTrackId(track.id);
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const activeTrack = tracks.find(t => t.id === activeTrackId);

  return (
    <div className="space-y-6 pb-10 animate-fadeIn">
      <audio ref={audioRef} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>AI Music Generator & Synthesizer Studio</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Generative Web Audio DSP Engine • Create Custom Beats, Loops & Ambient Soundtracks
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Audio Synthesis</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Music Studio Generator Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl bg-[#0F1526] border border-purple-500/20 p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span>Music Style & Concept Prompt</span>
              </label>
              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Describe the musical vibe, atmosphere, rhythm, or soundtrack..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition leading-relaxed resize-none"
                />
              </div>

              {/* Preset Prompts Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptText(p)}
                    className="text-[10px] font-mono text-slate-400 bg-slate-900 hover:bg-slate-850 hover:text-cyan-300 border border-slate-800 px-2.5 py-1 rounded-lg transition truncate max-w-xs"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <Disc className="w-4 h-4 text-cyan-400" />
                <span>Select Genre Preset</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreSelect(genre.id)}
                    className={`p-3 rounded-2xl border text-left transition relative overflow-hidden ${
                      selectedGenre === genre.id
                        ? `bg-gradient-to-br ${genre.color} border-white/40 text-white shadow-lg`
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <h4 className="text-xs font-bold font-sans flex items-center justify-between">
                      <span>{genre.label}</span>
                      {selectedGenre === genre.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </h4>
                    <p className="text-[10px] opacity-80 mt-1 line-clamp-2 leading-tight font-sans">{genre.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine-Tuning Audio Parameters */}
            <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-4 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Synthesizer Parameters
                </span>
                <span className="text-[10px] text-cyan-400">{bpm} BPM • Key of {musicalKey}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tempo BPM Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Tempo (BPM)</span>
                    <span className="text-cyan-400 font-bold">{bpm}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={180}
                    step={2}
                    value={bpm}
                    onChange={e => setBpm(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Key Selector */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">Root Key</span>
                  <select
                    value={musicalKey}
                    onChange={e => setMusicalKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(k => (
                      <option key={k} value={k}>Key of {k}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">Length</span>
                  <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value={10}>10 Seconds Loop</option>
                    <option value={15}>15 Seconds Track</option>
                    <option value={30}>30 Seconds Full Demo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateMusic}
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-400 hover:to-pink-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2.5 transition transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                  <span>SYNTHESIZING AUDIO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>GENERATE AI MUSIC TRACK</span>
                </>
              )}
            </button>

            {/* Generation Progress Indicator */}
            {isGenerating && (
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/80 text-center animate-pulse space-y-1">
                <p className="text-xs font-mono text-purple-300 font-semibold">{generationStep}</p>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full animate-pulse w-3/4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Player & Generated Tracks Library */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Audio Player & Visualizer */}
          <div className="rounded-3xl bg-[#0F1526] border border-cyan-500/30 p-5 space-y-4 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400" />
              <span>Studio Monitor & Visualizer</span>
            </h3>

            {activeTrack ? (
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 font-sans truncate max-w-[200px]">{activeTrack.title}</h4>
                      <p className="text-[10px] text-cyan-400 font-mono mt-0.5 uppercase">{activeTrack.genre} • {activeTrack.bpm} BPM • Key of {activeTrack.key}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                      {Math.floor(currentTime)}s / {activeTrack.duration}s
                    </span>
                  </div>

                  {/* Animated Equalizer Canvas */}
                  <div className="bg-slate-900/90 rounded-xl p-2 border border-slate-800/80 h-20 flex items-center justify-center relative overflow-hidden">
                    <canvas ref={canvasRef} width={280} height={60} className="w-full h-full" />
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
                        <span className="text-[10px] font-mono text-slate-400">Press play to start playback & spectrum</span>
                      </div>
                    )}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => togglePlayTrack(activeTrack)}
                      className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/50 transition transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={activeTrack.audioUrl}
                        download={`${activeTrack.title.replace(/\s+/g, '_')}.wav`}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition"
                        title="Download WAV Track"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {onShareToFeed && (
                        <button
                          type="button"
                          onClick={() => onShareToFeed(activeTrack.title, activeTrack.audioUrl)}
                          className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 transition"
                          title="Share Track to Feed"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 p-6 space-y-2">
                <Disc className="w-10 h-10 text-slate-600 mx-auto animate-spin" />
                <p className="text-xs text-slate-400 font-mono">No active track selected</p>
                <p className="text-[11px] text-slate-500">Configure parameters on the left and click Generate AI Music Track.</p>
              </div>
            )}
          </div>

          {/* Generated Track History List */}
          <div className="rounded-3xl bg-[#0F1526] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-purple-400" />
                <span>Track Library ({tracks.length})</span>
              </h3>
            </div>

            {tracks.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-6">Your generated music tracks will appear here.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                      activeTrackId === track.id
                        ? 'bg-purple-950/50 border-purple-500/50 text-white'
                        : 'bg-slate-950/80 border-slate-850 hover:border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePlayTrack(track)}
                        className={`p-2 rounded-full transition ${
                          activeTrackId === track.id && isPlaying
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-900 text-cyan-400 hover:bg-slate-800'
                        }`}
                      >
                        {activeTrackId === track.id && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div>
                        <h4 className="text-xs font-bold font-sans truncate max-w-[140px]">{track.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">{track.genre} • {track.bpm} BPM</p>
                      </div>
                    </div>

                    <a
                      href={track.audioUrl}
                      download={`${track.title.replace(/\s+/g, '_')}.wav`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
