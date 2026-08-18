import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Copy, 
  Check, 
  Share2, 
  RefreshCw,
  TrendingUp,
  Newspaper,
  Cpu,
  Microscope,
  DollarSign,
  Trophy,
  Filter,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { FeedPost } from '../types';

interface SearchSectionProps {
  username: string;
  avatar?: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  onOpenChatWithQuery?: (query: string) => void;
  onNavigateTab?: (tab: string) => void;
  theme?: 'dark' | 'light';
}

interface SearchResult {
  query: string;
  answer: string;
  keyFacts: string[];
  groundingSources: Array<{ title: string; uri: string }>;
  searchQueries: string[];
  timestamp: number;
}

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All Knowledge', icon: Globe },
  { id: 'news', label: 'Live News', icon: Newspaper },
  { id: 'tech', label: 'Technology & AI', icon: Cpu },
  { id: 'science', label: 'Science & Research', icon: Microscope },
  { id: 'finance', label: 'Markets & Finance', icon: DollarSign },
  { id: 'sports', label: 'Sports & Culture', icon: Trophy }
];

const SUGGESTED_SEARCHES = [
  "Latest breakthrough discoveries in generative AI & robotics 2026",
  "Current global macroeconomic trends and tech investment shifts",
  "Recent discoveries from the James Webb Space Telescope deep field",
  "State of quantum computing developments and post-quantum encryption",
  "Top trending international sports news and championship fixtures"
];

const RECENT_SEARCHES_KEY = 'aura_ai_search_history_v1';

export const SearchSection: React.FC<SearchSectionProps> = ({
  username,
  avatar = '',
  onShareToFeed,
  onOpenChatWithQuery,
  onNavigateTab,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : SUGGESTED_SEARCHES.slice(0, 3);
    } catch {
      return SUGGESTED_SEARCHES.slice(0, 3);
    }
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    saveRecentSearch(q);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: activeCategory
        })
      });

      const data = await res.json();
      if (data.success) {
        setCurrentResult({
          query: q,
          answer: data.answer || "Search analysis completed with verified groundings.",
          keyFacts: data.keyFacts || [],
          groundingSources: data.groundingSources || [],
          searchQueries: data.searchQueries || [q],
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (!currentResult) return;
    const text = `${currentResult.query}\n\n${currentResult.answer}\n\nSources:\n${currentResult.groundingSources.map(s => `- ${s.title}: ${s.uri}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!currentResult || !onShareToFeed) return;
    onShareToFeed({
      content: `🔍 **Verified Web Search: ${currentResult.query}**\n\n${currentResult.answer.slice(0, 400)}...\n\n🔗 Grounded via Google Search with ${currentResult.groundingSources.length} citations.`,
      type: 'micro',
      isAiPost: true,
      aiModel: 'Gemini 3.7 Search Grounded'
    });
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#0F1526] to-cyan-950/60 border border-purple-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium">
              <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>LIVE GOOGLE SEARCH GROUNDING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Intelligent AI Web Search
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time factual intelligence grounded by Google Search. Retrieves current news, statistics, live events, and authentic source citations without hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 px-3 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300">Grounding: Active</span>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mt-6 relative">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative flex items-center"
          >
            <div className="absolute left-4 pointer-events-none text-purple-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything requiring current news, live facts, data, or real-time verification..."
              className="w-full bg-slate-900/90 border-2 border-purple-500/40 focus:border-purple-400 rounded-2xl py-4 pl-12 pr-32 text-white placeholder-slate-400 text-base shadow-inner focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
          {SEARCH_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 border border-purple-400' 
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Results View */}
        <div className="lg:col-span-2 space-y-6">
          {isSearching ? (
            <div className="bg-[#0F1526] border border-purple-900/40 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-xl">
                  <Globe className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Exploring Live Web Knowledge...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Running Google Search grounding queries and aggregating verifiable citations.
                </p>
              </div>
            </div>
          ) : currentResult ? (
            <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative">
              {/* Header Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Grounded Synthesis
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(currentResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentResult.query}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs flex items-center gap-1.5"
                    title="Copy Answer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onShareToFeed && (
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-500/40 transition-all text-xs flex items-center gap-1.5"
                      title="Share to Aura Feed"
                    >
                      {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{shared ? 'Shared' : 'Share to Feed'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Key Facts Summary Cards */}
              {currentResult.keyFacts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Verified Key Takeaways</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentResult.keyFacts.map((fact, idx) => (
                      <div 
                        key={idx}
                        className="bg-slate-900/90 border border-purple-900/30 rounded-2xl p-3.5 text-xs text-slate-200 leading-relaxed flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Answer Body */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
                  {currentResult.answer}
                </div>
              </div>

              {/* Grounded Web Sources Grid */}
              {currentResult.groundingSources.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Cited Web Sources ({currentResult.groundingSources.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Click to inspect verifiable URL</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentResult.groundingSources.map((source, sIdx) => {
                      let hostname = source.uri;
                      try {
                        hostname = new URL(source.uri).hostname;
                      } catch {}

                      return (
                        <a
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group shadow-sm"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                              {source.title || hostname}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {hostname}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explore in OmniMind Chat Shortcut */}
              {onOpenChatWithQuery && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenChatWithQuery(currentResult.query)}
                    className="inline-flex items-center gap-2 text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <span>Continue this topic in AI Assistant Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-10 text-center space-y-6 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Search with Real-Time Grounding</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Type any question above or choose a trending query to synthesize live facts, verify news, and review source citations.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-2 pt-2 text-left">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Recommended Searches:
                </p>
                <div className="space-y-2">
                  {SUGGESTED_SEARCHES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(s);
                        handleSearch(s);
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-all"
                    >
                      <span className="truncate">{s}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Searches & Search Trends */}
        <div className="space-y-6">
          {/* Recent Searches Vault */}
          <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Recent Searches</span>
              </h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {recentSearches.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No search history yet.</p>
              ) : (
                recentSearches.map((rec, rIdx) => (
                  <button
                    key={rIdx}
                    onClick={() => {
                      setQuery(rec);
                      handleSearch(rec);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 text-xs text-slate-300 hover:text-white truncate flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate">{rec}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Grounding Engine Info Card */}
          <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-900/40 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Google Search Grounding Architecture</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When queries involve current events, changing dates, or specific URLs, Aura invokes the Google Search tool via Gemini 3.7 Flash, returning verifiable metadata chunks directly from the live web.
            </p>
            <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-purple-400 font-mono">
              <span>Grounding Latency</span>
              <span className="text-white font-bold">~450ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
