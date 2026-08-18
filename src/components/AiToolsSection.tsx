import React, { useState } from 'react';
import { 
  Wand2, 
  Film, 
  UserCheck, 
  FileText, 
  Compass, 
  Image as ImageIcon, 
  PlaySquare, 
  FileSearch, 
  Eye, 
  Code2, 
  Lightbulb, 
  BookOpen, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Upload, 
  X, 
  ChevronRight, 
  Layers, 
  Cpu,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import { FeedPost } from '../types';

export interface AiToolItem {
  id: string;
  name: string;
  category: 'story' | 'media' | 'analytics' | 'code';
  icon: any;
  description: string;
  badge: string;
  placeholder: string;
  defaultOptions?: Record<string, string>;
}

export const AI_TOOLS_LIST: AiToolItem[] = [
  {
    id: 'storyboard',
    name: 'Storyboard Generator',
    category: 'story',
    icon: Film,
    badge: 'Cinematic',
    description: 'Generates structured 4-scene visual storyboards with shot types, camera motion, audio cues, and visual prompts.',
    placeholder: 'Describe your film or video idea (e.g. "A cyberpunk detective investigates a mysterious neon glowing signal in rainy Neo-Tokyo").'
  },
  {
    id: 'character_creator',
    name: 'Character Bible & Consistency',
    category: 'story',
    icon: UserCheck,
    badge: 'Creative',
    description: 'Creates deep character backstories, signature attire, personality flaws, and consistent visual prompt tags.',
    placeholder: 'Enter character concept (e.g. "An eccentric quantum physicist with glowing cybernetic spectacles and a sarcastic wit").'
  },
  {
    id: 'script_writer',
    name: 'Screenplay & Script Writer',
    category: 'story',
    icon: FileText,
    badge: 'Hollywood',
    description: 'Formats professional Hollywood screenplays with sluglines, action blocks, character cues, and sharp dialogue.',
    placeholder: 'Enter your scene premise (e.g. "Two rival hackers discover an encrypted message hidden inside an AI art gallery").'
  },
  {
    id: 'scene_generator',
    name: 'Immersive Scene Generator',
    category: 'story',
    icon: Compass,
    badge: 'Worldbuilding',
    description: 'Builds rich multi-sensory environment descriptions with lighting, acoustics, climate, and spatial mood.',
    placeholder: 'Describe your location (e.g. "An ancient bioluminescent crystal cavern beneath an alien ocean").'
  },
  {
    id: 'poster_generator',
    name: 'Poster & Key Art Designer',
    category: 'media',
    icon: ImageIcon,
    badge: 'Design',
    description: 'Generates movie/event poster concepts, taglines, visual focal hierarchies, typography, and prompt tags.',
    placeholder: 'Enter your project title or theme (e.g. "Chrono Shift: An epic sci-fi time dilation thriller").'
  },
  {
    id: 'thumbnail_generator',
    name: 'Video Thumbnail Designer',
    category: 'media',
    icon: PlaySquare,
    badge: 'Viral',
    description: 'Creates high-converting YouTube and video thumbnail layouts with 3-word text hooks, colors, and focal composition.',
    placeholder: 'Enter video topic (e.g. "How I Built a Decentralized Social App in 48 Hours with AI").'
  },
  {
    id: 'document_analyzer',
    name: 'Document & Research Analyzer',
    category: 'analytics',
    icon: FileSearch,
    badge: 'Executive',
    description: 'Extracts executive summaries, data highlights, critical risk evaluations, and next steps from long text.',
    placeholder: 'Paste research paper, legal terms, whitepaper, or business proposal text here...'
  },
  {
    id: 'image_analyzer',
    name: 'Multimodal Visual Analyzer',
    category: 'analytics',
    icon: Eye,
    badge: 'Vision',
    description: 'Performs deep optical analysis of images: subject composition, lighting, style identification, and aesthetic grading.',
    placeholder: 'Describe the image or upload a photo below for complete multimodal analysis...'
  },
  {
    id: 'video_analyzer',
    name: 'Video Pacing & Content Analyzer',
    category: 'analytics',
    icon: PlaySquare,
    badge: 'Editorial',
    description: 'Analyzes narrative pacing, audience retention hooks, and audio-visual synchronization for video concepts.',
    placeholder: 'Paste video outline, script draft, or timing markers...'
  },
  {
    id: 'code_assistant',
    name: 'Principal Code Architect',
    category: 'code',
    icon: Code2,
    badge: 'Architect',
    description: 'Generates production-grade, type-safe full-stack code solutions with architecture strategies and security safeguards.',
    placeholder: 'Describe the component, algorithm, or backend endpoint you need (e.g. "Web Crypto AES-GCM zero-knowledge file encryption in React TypeScript").'
  },
  {
    id: 'brainstormer',
    name: 'Innovation & Strategy Engine',
    category: 'analytics',
    icon: Lightbulb,
    badge: 'Breakthrough',
    description: 'Divergent thinking catalyst generating 5 breakthrough, unconventional ideas with execution roadmaps.',
    placeholder: 'Enter your challenge or startup topic (e.g. "Innovative ways to monetize sovereign peer-to-peer media networks").'
  },
  {
    id: 'story_generator',
    name: 'Fiction & Dialogue Master',
    category: 'story',
    icon: BookOpen,
    badge: 'Literary',
    description: 'Crafts atmospheric, emotionally resonant short stories with vivid sensory prose and dynamic pacing.',
    placeholder: 'Enter story premise, theme, or character prompt...'
  }
];

interface AiToolsSectionProps {
  username: string;
  avatar?: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  onAnimateImage?: (imageUrl: string, prompt?: string) => void;
  onNavigateTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
}

const LOCAL_STORAGE_CREATIONS_KEY = 'aura_ai_studio_my_creations_v1';

export const AiToolsSection: React.FC<AiToolsSectionProps> = ({
  username,
  avatar = '',
  onShareToFeed,
  onAnimateImage,
  onNavigateTab,
  theme = 'dark'
}) => {
  const [selectedTool, setSelectedTool] = useState<AiToolItem>(AI_TOOLS_LIST[0]);
  const [inputVal, setInputVal] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ name: string; type: string; base64Data: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const filteredTools = activeCategory === 'all' 
    ? AI_TOOLS_LIST 
    : AI_TOOLS_LIST.filter(t => t.category === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        base64Data: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExecute = async () => {
    if (!inputVal.trim() && !attachment) return;
    setIsExecuting(true);
    setResultText(null);

    try {
      const res = await fetch('/api/ai-tool-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: selectedTool.id,
          input: inputVal,
          attachment: attachment
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResultText(data.result);

        // Save to My Creations
        try {
          const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CREATIONS_KEY) || '[]');
          const newCreation = {
            id: `tool_res_${Date.now()}`,
            type: 'tool',
            toolId: selectedTool.id,
            toolName: selectedTool.name,
            title: `${selectedTool.name}: ${inputVal.slice(0, 35)}...`,
            prompt: inputVal,
            content: data.result,
            timestamp: Date.now(),
            modelUsed: data.modelUsed || 'Gemini 3.7 Flash'
          };
          localStorage.setItem(LOCAL_STORAGE_CREATIONS_KEY, JSON.stringify([newCreation, ...existing].slice(0, 50)));
        } catch {}
      }
    } catch (err) {
      console.error("AI Tool execution error:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!resultText || !onShareToFeed) return;
    onShareToFeed({
      content: `✨ **${selectedTool.name} Output**\n\n${resultText.slice(0, 400)}...\n\nGenerated via Aura Creative AI Studio.`,
      type: 'micro',
      isAiPost: true,
      aiModel: 'Gemini 3.7 Flash'
    });
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Studio Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-[#0F1526] to-pink-950/60 border border-purple-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium">
            <Wand2 className="w-3.5 h-3.5" />
            <span>AURA CREATIVE AI SUITE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Creative AI Tools Hub
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Professional AI production tools for filmmakers, screenwriters, creators, researchers, and developers. Powered by Gemini 3.7 Flash.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 no-scrollbar">
          {[
            { id: 'all', label: 'All 12 Tools' },
            { id: 'story', label: 'Story & Scripts' },
            { id: 'media', label: 'Art & Video Media' },
            { id: 'analytics', label: 'Analysis & Vision' },
            { id: 'code', label: 'Code & Architecture' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Tool Selector Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto custom-scrollbar pr-1">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool.id === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool);
                  setResultText(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group relative ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/30'
                    : 'bg-[#0F1526] hover:bg-slate-850 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                  isSelected 
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/50' 
                    : 'bg-slate-900 text-purple-400 border-slate-800 group-hover:border-purple-500/40'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-grow space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {tool.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-purple-300 border border-purple-800/40 shrink-0">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Col: Active Tool Execution & Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-6 space-y-5 shadow-xl">
            {/* Active Tool Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300">
                  {React.createElement(selectedTool.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {selectedTool.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedTool.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Input Prompt / Directives</span>
                <span className="text-[10px] text-purple-400">Gemini 3.7 Flash</span>
              </label>

              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={selectedTool.placeholder}
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500/80 rounded-2xl p-4 text-white placeholder-slate-500 text-xs focus:outline-none transition-all resize-none shadow-inner"
              />

              {/* Attachment Preview / Upload */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all">
                    <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                    <span>{attachment ? 'Replace File' : 'Attach Image/Doc'}</span>
                    <input 
                      type="file" 
                      accept="image/*,.pdf,.txt,.json,.js,.ts" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  {attachment && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-300">
                      <span className="max-w-[140px] truncate">{attachment.name}</span>
                      <button 
                        onClick={() => setAttachment(null)}
                        className="text-purple-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExecute}
                  disabled={(!inputVal.trim() && !attachment) || isExecuting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Output...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Tool</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Execution Result Box */}
            {isExecuting ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-purple-900/30 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                <p className="text-xs text-slate-400">Processing structured generation with cognitive verification...</p>
              </div>
            ) : resultText ? (
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Generation Complete</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {onShareToFeed && (
                      <button
                        onClick={handleShare}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-500/40 text-xs flex items-center gap-1.5 transition-all"
                      >
                        {shared ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        <span>{shared ? 'Shared' : 'Share'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 text-slate-200 text-xs leading-relaxed max-h-[420px] overflow-y-auto custom-scrollbar whitespace-pre-wrap font-mono">
                  {resultText}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
