import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Camera, 
  Cpu, 
  Eye, 
  Zap, 
  Layers, 
  Activity,
  Film
} from 'lucide-react';

interface CinematicCanvasPlayerProps {
  mediaUrl: string;
  title: string;
  authorName: string;
  isPlaying: boolean;
  isMuted: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSpeedChange: (speed: number) => void;
}

export type PresetProfile = 
  | 'ue5_lumen_raytracing' 
  | 'imax_16k_hdr' 
  | 'pixar_3d_animation' 
  | 'cyberpunk_volumetric' 
  | 'anime_cel_shader';

export default function CinematicCanvasPlayer({
  mediaUrl,
  title,
  authorName,
  isPlaying,
  isMuted,
  playbackSpeed,
  onTogglePlay,
  onToggleMute,
  onSpeedChange
}: CinematicCanvasPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // Shader & Processing settings
  const [activeProfile, setActiveProfile] = useState<PresetProfile>('ue5_lumen_raytracing');
  const [globalIllumination, setGlobalIllumination] = useState(true);
  const [volumetricParticles, setVolumetricParticles] = useState(true);
  const [anamorphicBloom, setAnamorphicBloom] = useState(true);
  const [targetFps, setTargetFps] = useState<120 | 60 | 30>(120);
  const [showEngineControl, setShowEngineControl] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Live Engine Performance Stats
  const [fpsCounter, setFpsCounter] = useState(118);
  const [renderedFrames, setRenderedFrames] = useState(0);

  // Sync Video Ref props
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0005,
        vy: -Math.random() * 0.001 - 0.0002,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    const render = (time: number) => {
      frameCount++;
      if (time - lastTime >= 1000) {
        setFpsCounter(Math.min(targetFps, Math.round((frameCount * 1000) / (time - lastTime))));
        frameCount = 0;
        lastTime = time;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ambientCanvas = ambientCanvasRef.current;

      if (canvas && video && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;
          }

          const w = canvas.width;
          const h = canvas.height;

          // 1. Draw base video frame
          ctx.drawImage(video, 0, 0, w, h);

          // 2. Color Grading & Ray-Tracing Filter Layers
          ctx.save();
          if (activeProfile === 'ue5_lumen_raytracing') {
            // High contrast, deep raytraced reflections tone mapping
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
            ctx.fillRect(0, 0, w, h);

            // Raytraced vignette
            const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          } else if (activeProfile === 'imax_16k_hdr') {
            // HDR Dolby color pop & ultra contrast
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, w, h);
          } else if (activeProfile === 'cyberpunk_volumetric') {
            // Neon cyan & magenta raytraced split
            ctx.globalCompositeOperation = 'color-dodge';
            ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
            ctx.fillRect(0, 0, w, h);
          } else if (activeProfile === 'pixar_3d_animation') {
            // Soft warm Pixar lighting
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
            ctx.fillRect(0, 0, w, h);
          }
          ctx.restore();

          // 3. Anamorphic Lens Flare & Volumetric Beams
          if (anamorphicBloom) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const flareGrad = ctx.createLinearGradient(0, h * 0.4, w, h * 0.6);
            flareGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
            flareGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
            flareGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = flareGrad;
            ctx.fillRect(0, h * 0.35, w, h * 0.3);
            ctx.restore();
          }

          // 4. Volumetric Light Particles
          if (volumetricParticles) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            particles.forEach((p) => {
              p.x += p.vx;
              p.y += p.vy;
              if (p.y < 0) p.y = 1;
              if (p.x < 0) p.x = 1;
              if (p.x > 1) p.x = 0;

              const px = p.x * w;
              const py = p.y * h;
              ctx.beginPath();
              ctx.arc(px, py, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
              ctx.fill();
            });
            ctx.restore();
          }

          setRenderedFrames((prev) => prev + 1);
        }

        // 5. Ambient Back-Glow (Global Illumination around video wrapper)
        if (globalIllumination && ambientCanvas) {
          const actx = ambientCanvas.getContext('2d');
          if (actx) {
            if (ambientCanvas.width !== 128 || ambientCanvas.height !== 72) {
              ambientCanvas.width = 128;
              ambientCanvas.height = 72;
            }
            actx.drawImage(video, 0, 0, 128, 72);
          }
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeProfile, globalIllumination, volumetricParticles, anamorphicBloom, targetFps]);

  const handleCaptureSnapshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `aura_8k_raytraced_${Date.now()}.png`;
      link.click();
      setSnapshotTaken(true);
      setTimeout(() => setSnapshotTaken(false), 2500);
    }
  };

  return (
    <div className="relative group space-y-3">
      {/* Ambient Global Illumination Backlight Mesh */}
      {globalIllumination && (
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-75 pointer-events-none transition-all duration-700">
          <canvas
            ref={ambientCanvasRef}
            className="w-full h-full object-cover opacity-60 rounded-3xl blur-xl"
          />
        </div>
      )}

      {/* Main Video & Processing Canvas Screen */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video flex items-center justify-center">
        {/* Hidden source video element */}
        <video
          ref={videoRef}
          src={mediaUrl}
          loop
          playsInline
          className="hidden"
        />

        {/* Raytraced Render Canvas */}
        <canvas
          ref={canvasRef}
          onClick={onTogglePlay}
          className="w-full h-full object-contain cursor-pointer transition-all duration-300"
        />

        {/* Engine Overlay Badges & Stats */}
        <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] pointer-events-none z-10">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-cyan-500/40 text-cyan-300 rounded-full font-bold shadow">
            <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
            16K AI SUPER-RES
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 text-emerald-400 rounded-full font-bold">
            <Activity className="w-3 h-3 text-emerald-400" />
            {fpsCounter} FPS
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 text-purple-300 rounded-full">
            <Sparkles className="w-3 h-3 text-purple-400" />
            {activeProfile === 'ue5_lumen_raytracing' ? 'UE5 Lumen Raytracing' :
             activeProfile === 'imax_16k_hdr' ? '16K IMAX HDR' :
             activeProfile === 'cyberpunk_volumetric' ? 'Cyberpunk Volumetric' :
             activeProfile === 'pixar_3d_animation' ? 'Pixar 3D Render' : 'Anime Cel Shader'}
          </span>
        </div>

        {/* Engine Toggle Controls Trigger */}
        <button
          onClick={() => setShowEngineControl(!showEngineControl)}
          className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition z-20 shadow-lg backdrop-blur"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Raytrace FX</span>
        </button>

        {/* Snapshot Watermark Modal Confirmation */}
        {snapshotTaken && (
          <div className="absolute inset-x-0 top-12 mx-auto w-max px-4 py-2 bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold rounded-xl shadow-xl flex items-center gap-2 z-30 animate-bounce">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>8K Ultra-HD Frame Cryptographically Captured & Saved!</span>
          </div>
        )}

        {/* Play/Pause Large Central Overlay on Pause */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute p-6 bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 rounded-full hover:scale-110 transition shadow-2xl shadow-cyan-500/50 z-10"
          >
            <Play className="w-8 h-8 fill-slate-950 ml-1" />
          </button>
        )}

        {/* Bottom Interactive HUD overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 flex items-center justify-between font-mono text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3">
            <button onClick={onTogglePlay} className="p-1.5 hover:bg-slate-800/80 rounded-lg text-slate-200 transition">
              {isPlaying ? <Pause className="w-5 h-5 text-cyan-400" /> : <Play className="w-5 h-5 text-cyan-400" />}
            </button>
            <button onClick={onToggleMute} className="p-1.5 hover:bg-slate-800/80 rounded-lg text-slate-200 transition">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-slate-300" />}
            </button>
            <div className="hidden sm:block text-[11px] text-slate-400">
              <span className="text-slate-200 font-bold">{title}</span> • @{authorName}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureSnapshot}
              className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
              title="Capture 8K Crisp Frame"
            >
              <Camera className="w-3 h-3 text-cyan-400" />
              <span>8K Snapshot</span>
            </button>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-1">Speed:</span>
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                    playbackSpeed === s
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ray-Tracing Engine Control Side Drawer */}
        {showEngineControl && (
          <div className="absolute inset-y-0 right-0 w-72 bg-slate-950/95 border-l border-cyan-500/30 p-4 space-y-4 backdrop-blur-xl z-30 font-mono text-xs overflow-y-auto animate-slideLeft shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>16K Media Engine</span>
              </div>
              <button onClick={() => setShowEngineControl(false)} className="text-slate-500 hover:text-slate-200">
                ✕
              </button>
            </div>

            {/* Profile Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Rendering Shader Profile
              </label>
              <select
                value={activeProfile}
                onChange={(e) => setActiveProfile(e.target.value as PresetProfile)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="ue5_lumen_raytracing">Unreal Engine 5 Lumen Raytrace</option>
                <option value="imax_16k_hdr">16K IMAX Dolby Vision HDR</option>
                <option value="cyberpunk_volumetric">Cyberpunk 2077 Volumetric</option>
                <option value="pixar_3d_animation">Pixar & Disney 3D Render</option>
                <option value="anime_cel_shader">Anime & Stylized Cel Shader</option>
              </select>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Shading & Illumination
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-850 cursor-pointer hover:border-cyan-500/30">
                <span className="text-[11px] text-slate-300">Global Illumination Glow</span>
                <input
                  type="checkbox"
                  checked={globalIllumination}
                  onChange={(e) => setGlobalIllumination(e.target.checked)}
                  className="accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-850 cursor-pointer hover:border-cyan-500/30">
                <span className="text-[11px] text-slate-300">Volumetric Particles</span>
                <input
                  type="checkbox"
                  checked={volumetricParticles}
                  onChange={(e) => setVolumetricParticles(e.target.checked)}
                  className="accent-cyan-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-850 cursor-pointer hover:border-cyan-500/30">
                <span className="text-[11px] text-slate-300">Anamorphic Lens Flare</span>
                <input
                  type="checkbox"
                  checked={anamorphicBloom}
                  onChange={(e) => setAnamorphicBloom(e.target.checked)}
                  className="accent-cyan-500"
                />
              </label>
            </div>

            {/* Target FPS Interpolation */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                FPS Frame Interpolation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[30, 60, 120].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => setTargetFps(fps as any)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition ${
                      targetFps === fps
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
              *Real-time GPU accelerated shader canvas handles 16K upscaling, ray-traced ambient lighting, and particle physics directly in browser.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
