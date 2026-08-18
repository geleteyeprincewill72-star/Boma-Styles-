import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Share2, 
  Trash2, 
  Eye, 
  Play, 
  Search, 
  Filter, 
  Clock, 
  ExternalLink, 
  X,
  Layers,
  ArrowRight,
  Maximize2,
  Copy,
  Check
} from 'lucide-react';
import { FeedPost } from '../types';

export interface CreationItem {
  id: string;
  type: 'image' | 'video' | 'tool' | 'script';
  title: string;
  prompt: string;
  url?: string;
  thumbnailUrl?: string;
  content?: string;
  style?: string;
  aspectRatio?: string;
  resolution?: string;
  duration?: number;
  timestamp: number;
  modelUsed?: string;
}

interface MyCreationsSectionProps {
  username: string;
  avatar?: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  onAnimateImage?: (imageUrl: string, prompt?: string) => void;
  onNavigateTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
}

const LOCAL_STORAGE_IMAGES_KEY = 'aura_ai_generated_images_gallery_v1';
const LOCAL_STORAGE_CREATIONS_KEY = 'aura_ai_studio_my_creations_v1';
const LOCAL_STORAGE_VIDEOS_KEY = 'aura_ai_generated_videos_gallery_v1';

export const MyCreationsSection: React.FC<MyCreationsSectionProps> = ({
  username,
  avatar = '',
  onShareToFeed,
  onAnimateImage,
  onNavigateTab,
  theme = 'dark'
}) => {
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CreationItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);

  // Load creations from all local storage vaults
  useEffect(() => {
    try {
      const allItems: CreationItem[] = [];

      // 1. Tool creations
      const toolItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CREATIONS_KEY) || '[]');
      if (Array.isArray(toolItems)) {
        allItems.push(...toolItems);
      }

      // 2. Image generations
      const imgItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_IMAGES_KEY) || '[]');
      if (Array.isArray(imgItems)) {
        const mappedImgs: CreationItem[] = imgItems.map((img: any) => ({
          id: img.id || `img_${img.timestamp}`,
          type: 'image',
          title: `Image: ${img.prompt?.slice(0, 30)}...`,
          prompt: img.prompt,
          url: img.url,
          style: img.style,
          aspectRatio: img.aspectRatio,
          resolution: img.resolution,
          timestamp: img.timestamp || Date.now(),
          modelUsed: 'Gemini 3.1 Flash Image'
        }));
        allItems.push(...mappedImgs);
      }

      // 3. Video generations
      const vidItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY) || '[]');
      if (Array.isArray(vidItems)) {
        const mappedVids: CreationItem[] = vidItems.map((vid: any) => ({
          id: vid.id || `vid_${vid.timestamp}`,
          type: 'video',
          title: `Video: ${vid.prompt?.slice(0, 30)}...`,
          prompt: vid.prompt,
          url: vid.url || vid.videoUrl,
          thumbnailUrl: vid.thumbnailUrl,
          style: vid.style,
          aspectRatio: vid.aspectRatio,
          duration: vid.duration,
          timestamp: vid.timestamp || Date.now(),
          modelUsed: 'Veo 3.1'
        }));
        allItems.push(...mappedVids);
      }

      // Sort by timestamp descending
      allItems.sort((a, b) => b.timestamp - a.timestamp);
      setCreations(allItems);
    } catch (e) {
      console.warn("Failed to parse creations history:", e);
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = creations.filter(c => c.id !== id);
    setCreations(updated);

    try {
      // Update individual stores
      const tools = updated.filter(c => c.type === 'tool' || c.type === 'script');
      localStorage.setItem(LOCAL_STORAGE_CREATIONS_KEY, JSON.stringify(tools));

      const imgs = updated.filter(c => c.type === 'image');
      localStorage.setItem(LOCAL_STORAGE_IMAGES_KEY, JSON.stringify(imgs));

      const vids = updated.filter(c => c.type === 'video');
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(vids));
    } catch {}

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleShareToFeed = (item: CreationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onShareToFeed) return;

    if (item.type === 'image' && item.url) {
      onShareToFeed({
        content: `🎨 **Generated AI Art: ${item.prompt}**\n\nStyle: ${item.style || 'Hyperrealistic'} | Ratio: ${item.aspectRatio || '1:1'}`,
        mediaUrl: item.url,
        mediaThumbnail: item.url,
        type: 'media',
        isAiPost: true,
        aiModel: item.modelUsed || 'Gemini 3.1 Flash Image'
      });
    } else if (item.type === 'video' && item.url) {
      onShareToFeed({
        title: item.title,
        content: `🎬 **Cinematic Video Generation: ${item.prompt}**`,
        mediaUrl: item.url,
        mediaThumbnail: item.thumbnailUrl || item.url,
        type: 'play',
        isAiPost: true,
        aiModel: item.modelUsed || 'Veo 3.1'
      });
    } else if (item.content) {
      onShareToFeed({
        content: `✨ **${item.title}**\n\n${item.content.slice(0, 400)}...\n\nCreated in Aura AI Studio.`,
        type: 'micro',
        isAiPost: true,
        aiModel: item.modelUsed || 'Gemini 3.7 Flash'
      });
    }

    setSharedId(item.id);
    setTimeout(() => setSharedId(null), 2500);
  };

  const filteredCreations = creations.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-[#0F1526] to-cyan-950/60 border border-purple-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>PERSONAL CREATION VAULT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My AI Creations & History
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            All your generated 4K images, cinematic videos, scripts, and analytical outputs securely stored in your personal vault.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 mt-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Creations', count: creations.length },
              { id: 'image', label: 'Images', count: creations.filter(c => c.type === 'image').length },
              { id: 'video', label: 'Videos', count: creations.filter(c => c.type === 'video').length },
              { id: 'tool', label: 'AI Tools & Scripts', count: creations.filter(c => c.type === 'tool' || c.type === 'script').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 text-[10px] font-mono opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt or title..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
          </div>
        </div>
      </div>

      {/* Grid of Creations */}
      {filteredCreations.length === 0 ? (
        <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Creations Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Generate images, videos, or scripts in the studio to build your personal creative history.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('imagegen')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                >
                  Create Image
                </button>
                <button
                  onClick={() => onNavigateTab('videogen')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  Create Video
                </button>
                <button
                  onClick={() => onNavigateTab('aitools')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
                >
                  AI Tools
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCreations.map((item) => {
            const isShared = sharedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-[#0F1526] border border-slate-800/80 hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col group"
              >
                {/* Media Preview Thumbnail / Text Card */}
                {item.type === 'image' && item.url ? (
                  <div className="relative aspect-square bg-slate-900 overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>{item.aspectRatio || '1:1'}</span>
                    </div>

                    {/* Animate to Video Quick Action */}
                    {onAnimateImage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnimateImage(item.url!, item.prompt);
                        }}
                        className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all"
                        title="Animate to Video with Veo"
                      >
                        <Film className="w-3 h-3" />
                        <span>Animate</span>
                      </button>
                    )}
                  </div>
                ) : item.type === 'video' && item.url ? (
                  <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.prompt} className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" muted />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      <span>{item.duration || 6}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-gradient-to-br from-slate-900 to-purple-950/40 border-b border-slate-800/80 min-h-[140px] flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
                      <FileText className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-3 font-mono">
                      {item.content || item.prompt}
                    </p>
                  </div>
                )}

                {/* Details Footer */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <span className="font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>

                    <div className="flex items-center gap-1">
                      {onShareToFeed && (
                        <button
                          onClick={(e) => handleShareToFeed(item, e)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition-colors"
                          title="Share to Feed"
                        >
                          <Share2 className={`w-3.5 h-3.5 ${isShared ? 'text-emerald-400' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Viewer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F1526] border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-5 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                {selectedItem.type.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-white">{selectedItem.title}</h2>
            </div>

            {/* Media Player or Full Image */}
            {selectedItem.type === 'image' && selectedItem.url ? (
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 max-h-[480px] flex items-center justify-center">
                <img src={selectedItem.url} alt={selectedItem.prompt} className="max-h-[480px] w-auto object-contain" />
              </div>
            ) : selectedItem.type === 'video' && selectedItem.url ? (
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video">
                <video src={selectedItem.url} controls autoPlay className="w-full h-full" />
              </div>
            ) : selectedItem.content ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar">
                {selectedItem.content}
              </div>
            ) : null}

            {/* Prompt details */}
            <div className="space-y-1.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-mono font-bold text-slate-400">Prompt Directive:</p>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedItem.prompt}</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400">
                Created: {new Date(selectedItem.timestamp).toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                {selectedItem.type === 'image' && selectedItem.url && onAnimateImage && (
                  <button
                    onClick={() => {
                      onAnimateImage(selectedItem.url!, selectedItem.prompt);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Animate with Veo</span>
                  </button>
                )}

                {selectedItem.url && (
                  <a
                    href={selectedItem.url}
                    download={`aura-creation-${selectedItem.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}

                {onShareToFeed && (
                  <button
                    onClick={() => handleShareToFeed(selectedItem)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share to Feed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
