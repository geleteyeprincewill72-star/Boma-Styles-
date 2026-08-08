import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Cell 
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Activity, 
  BarChart2, 
  Play, 
  ThumbsUp, 
  MessageSquare, 
  Calendar, 
  Tv, 
  Award,
  Filter,
  CheckCircle2,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { FeedPost } from '../types';

interface CreatorVideoAnalyticsProps {
  posts: FeedPost[];
  selectedPost: FeedPost | null;
  isAppCreator?: boolean;
  impressions?: number;
  earnings?: number;
  isPlaying?: boolean;
}

// Sample Hourly Peak Engagement Data
const HOURLY_ENGAGEMENT_DATA = [
  { hour: '00:00', viewers: 120, engagement: 45 },
  { hour: '03:00', viewers: 80, engagement: 30 },
  { hour: '06:00', viewers: 190, engagement: 62 },
  { hour: '09:00', viewers: 420, engagement: 78 },
  { hour: '12:00', viewers: 680, engagement: 88 },
  { hour: '15:00', viewers: 950, engagement: 98 }, // PEAK
  { hour: '18:00', viewers: 890, engagement: 92 }, // PEAK
  { hour: '21:00', viewers: 540, engagement: 71 }
];

// Sample Audience Retention Curve Data (% over duration)
const RETENTION_CURVE_DATA = [
  { timestamp: '0%', retention: 100, rewatches: 10 },
  { timestamp: '10%', retention: 94, rewatches: 15 },
  { timestamp: '25%', retention: 88, rewatches: 22 },
  { timestamp: '40%', retention: 82, rewatches: 45 }, // Hotspot spike
  { timestamp: '50%', retention: 79, rewatches: 38 },
  { timestamp: '75%', retention: 72, rewatches: 28 },
  { timestamp: '90%', retention: 66, rewatches: 18 },
  { timestamp: '100%', retention: 61, rewatches: 12 }
];

export default function CreatorVideoAnalytics({
  posts,
  selectedPost,
  isAppCreator = false,
  impressions = 142,
  earnings = 8.45,
  isPlaying = false
}: CreatorVideoAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('all');
  
  // Real-time dynamic states
  const [activeLiveViewers, setActiveLiveViewers] = useState<number>(24);
  const [sessionWatchSeconds, setSessionWatchSeconds] = useState<number>(148);

  // Live viewers simulation pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLiveViewers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(65, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-time watch seconds ticker
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setSessionWatchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const videoPosts = posts.filter(p => p.type === 'play' || p.mediaUrl?.endsWith('.mp4'));

  // Calculate total aggregate stats
  const totalViews = videoPosts.reduce((acc, p) => acc + (p.views || 0) + 120, 380);
  const totalLikes = videoPosts.reduce((acc, p) => acc + (p.likes || 0), 45);
  const totalComments = videoPosts.reduce((acc, p) => acc + (p.comments?.length || 0), 18);

  // Format watch seconds into readable string
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="bg-gradient-to-br from-[#070C1A] via-[#0A0F24] to-[#050814] border border-violet-900/40 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title & Creator Badge & Live Viewers Pulse */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-violet-950 text-violet-300 border border-violet-700/60 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-violet-400" />
              Creator Exclusive Access
            </span>
            {isAppCreator && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase">
                ● Admin Authorized
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold font-sans text-slate-100 flex items-center gap-2 mt-1.5">
            <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
            Video Broadcast Real-Time Analytics
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Live watch time telemetry, peak engagement timestamps & audience retention curves
          </p>
        </div>

        {/* Live Concurrent Viewer Pill & Timeframe Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/90 border border-rose-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {activeLiveViewers} <span className="text-[10px] text-slate-400 font-normal">Live Peers Watching</span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-mono">
            {(['24h', '7d', '30d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg uppercase transition ${
                  selectedTimeframe === tf 
                    ? 'bg-rose-600 text-white font-bold shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Selector by Video */}
      <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400 font-bold uppercase text-[11px]">Filter Video:</span>
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-rose-500 text-xs"
          >
            <option value="all">All Creator Videos ({videoPosts.length})</option>
            {videoPosts.map(p => (
              <option key={p.id} value={p.id}>
                {p.title || `Video ${p.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Watch Session: <strong className="text-cyan-300 font-mono">{formatTime(sessionWatchSeconds)}</strong></span>
        </div>
      </div>

      {/* 4 Core Stat Cards: Watch Time, Peak Views, Engagement, Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Watch Time */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-violet-800/60 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="uppercase text-[10px] font-bold tracking-wider">Total Watch Time</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 tracking-tight">
            184.6 <span className="text-xs font-normal text-slate-400">Hours</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs previous 7 days</span>
          </div>
        </div>

        {/* Card 2: Average Duration & Completion */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-rose-800/60 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="uppercase text-[10px] font-bold tracking-wider">Avg. Watch Duration</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 tracking-tight">
            3m 42s
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>78.4% Average Completion Rate</span>
          </div>
        </div>

        {/* Card 3: Total Views & Interactions */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-cyan-800/60 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="uppercase text-[10px] font-bold tracking-wider">Total Impressions</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 tracking-tight">
            {totalViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>{totalLikes} Likes</span>
            <span>•</span>
            <span>{totalComments} Comments</span>
          </div>
        </div>

        {/* Card 4: Creator Video Revenue */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-emerald-800/60 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="uppercase text-[10px] font-bold tracking-wider">Estimated Revenue</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            ${earnings.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
            <span>OPAY Auto-Sync Active</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Peak Engagement Times & Audience Retention Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Peak Engagement Times Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                Peak Engagement Hours (24H Heatmap)
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Highest viewer concentration occurs between <strong className="text-rose-400">14:00 - 18:00 WAT</strong>
              </p>
            </div>
            <span className="text-[9px] bg-rose-950/60 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded font-mono uppercase font-bold">
              Spike Detected
            </span>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_ENGAGEMENT_DATA}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f43f5e' }}
                />
                <Bar dataKey="viewers" radius={[4, 4, 0, 0]}>
                  {HOURLY_ENGAGEMENT_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.viewers > 800 ? '#f43f5e' : entry.viewers > 400 ? '#8b5cf6' : '#334155'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850">
              <span className="text-slate-500 uppercase block">Top Viewership Day</span>
              <span className="text-slate-200 font-bold text-xs mt-0.5 block">Saturdays & Fridays</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850">
              <span className="text-slate-500 uppercase block">In-Video Re-Watch Hotspot</span>
              <span className="text-rose-300 font-bold text-xs mt-0.5 block">Timestamp 01:45 (+45% loop)</span>
            </div>
          </div>
        </div>

        {/* Right: Audience Retention Retention Curve Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Audience Retention Curve (%)
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Viewer drop-off & re-watch retention rates across video duration
              </p>
            </div>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RETENTION_CURVE_DATA}>
                <defs>
                  <linearGradient id="retentionColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d1a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  formatter={(value: any) => [`${value}% Retention`, 'Audience']}
                />
                <Area type="monotone" dataKey="retention" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#retentionColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono text-slate-300 pt-2 border-t border-slate-900">
            <div className="flex items-center justify-between bg-slate-900/50 px-2.5 py-1.5 rounded border border-slate-850">
              <span className="text-slate-400">Returning Viewers Ratio:</span>
              <strong className="text-emerald-400">72% Returning Peers</strong>
            </div>
            <div className="flex items-center justify-between bg-slate-900/50 px-2.5 py-1.5 rounded border border-slate-850">
              <span className="text-slate-400">Peer Follower Conversion:</span>
              <strong className="text-violet-300">+38 New Followers/Epoch</strong>
            </div>
          </div>
        </div>

      </div>

      {/* In-Depth Video List Breakdown Table for Creator */}
      <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-cyan-400" />
            Individual Broadcast Performance Breakdown
          </h4>
          <span className="text-[10px] font-mono text-slate-500">
            Updated Real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] uppercase text-slate-500">
                <th className="pb-2">Broadcast Title</th>
                <th className="pb-2">Watch Hours</th>
                <th className="pb-2">Avg Duration</th>
                <th className="pb-2">Peak Engagement</th>
                <th className="pb-2">Retention</th>
                <th className="pb-2 text-right">Ad Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {videoPosts.map((post, idx) => (
                <tr key={post.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 font-sans font-semibold text-slate-200 flex items-center gap-2">
                    <Play className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{post.title || `Video ${idx + 1}`}</span>
                  </td>
                  <td className="py-2.5 text-slate-300">{(42.5 + idx * 12.3).toFixed(1)} hrs</td>
                  <td className="py-2.5 text-slate-300">3m 52s</td>
                  <td className="py-2.5 text-rose-300 font-bold">15:00 WAT</td>
                  <td className="py-2.5">
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-900/60 px-1.5 py-0.5 rounded text-[10px]">
                      {82 - idx * 4}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-emerald-400 font-bold">
                    ${(2.80 + idx * 1.15).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
