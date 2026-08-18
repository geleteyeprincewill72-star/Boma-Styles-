import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  Users, 
  PhoneCall, 
  Bot, 
  Rss, 
  Video, 
  Bell, 
  User, 
  Settings, 
  Wallet, 
  Award, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  Shield, 
  Menu, 
  X,
  TrendingUp,
  BrainCircuit,
  Image as ImageIcon,
  Mic,
  Film,
  Globe,
  Wand2,
  Layers,
  MessageSquareCode
} from 'lucide-react';

export type TabType = 
  | 'home' 
  | 'messages' 
  | 'friends' 
  | 'calls' 
  | 'omnimind' 
  | 'search'
  | 'imagegen'
  | 'videogen'
  | 'aitools'
  | 'mycreations'
  | 'audio'
  | 'feed' 
  | 'videos' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'wallet' 
  | 'monetization'
  | 'reviews'
  | 'admin';

interface NavigationSidebarProps {
  activeTab: string;
  setActiveTab: (tab: TabType) => void;
  unreadNotifCount: number;
  username: string;
  avatar: string;
  userStatus?: string;
  isAppCreator?: boolean;
  isAdmin?: boolean;
  onLogout: () => void;
  theme?: 'dark' | 'light';
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifCount,
  username,
  avatar,
  userStatus = 'Active Node',
  isAppCreator = false,
  isAdmin = false,
  onLogout,
  theme = 'dark',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLight = theme === 'light';

  const NAV_ITEMS = [
    { id: 'home', label: 'HOME', icon: Home, badge: null, color: 'text-purple-400' },
    { id: 'omnimind', label: 'AI ASSISTANT', icon: Bot, badge: 'AI', color: 'text-purple-400' },
    { id: 'search', label: 'AI WEB SEARCH', icon: Globe, badge: 'Live', color: 'text-cyan-400' },
    { id: 'imagegen', label: 'AI IMAGE GEN', icon: ImageIcon, badge: '4K', color: 'text-purple-300' },
    { id: 'videogen', label: 'AI VIDEO GEN', icon: Film, badge: 'Veo', color: 'text-amber-400' },
    { id: 'aitools', label: 'AI TOOLS HUB', icon: Wand2, badge: '12+', color: 'text-pink-400' },
    { id: 'mycreations', label: 'MY CREATIONS', icon: Layers, badge: null, color: 'text-indigo-400' },
    { id: 'audio', label: 'AUDIO TRANSCRIBE', icon: Mic, badge: 'AI', color: 'text-cyan-300' },
    { id: 'messages', label: 'MESSAGES', icon: MessageSquare, badge: null, color: 'text-cyan-400' },
    { id: 'calls', label: 'CALLS', icon: PhoneCall, badge: null, color: 'text-emerald-400' },
    { id: 'friends', label: 'FRIENDS', icon: Users, badge: null, color: 'text-indigo-400' },
    { id: 'feed', label: 'POSTS', icon: Rss, badge: null, color: 'text-pink-400' },
    { id: 'videos', label: 'VIDEO HUB', icon: Video, badge: null, color: 'text-amber-400' },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : null, color: 'text-cyan-400' },
    { id: 'profile', label: 'PROFILE', icon: User, badge: null, color: 'text-purple-400' },
    { id: 'reviews', label: 'REVIEWS & RATING', icon: MessageSquareCode, badge: '5★', color: 'text-amber-400' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, badge: null, color: 'text-amber-400' },
    { id: 'wallet', label: 'WALLET', icon: Wallet, badge: null, color: 'text-emerald-400' },
  ];

  if (isAppCreator) {
    NAV_ITEMS.push({ id: 'monetization', label: 'REVENUE LEDGER', icon: TrendingUp, badge: 'Vault', color: 'text-emerald-400' });
  }

  if (isAdmin) {
    NAV_ITEMS.push({ id: 'admin', label: 'ADMIN PANEL', icon: Shield, badge: 'Admin', color: 'text-red-400' });
  }

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md screens and up) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 space-y-6 sticky top-20 h-[calc(100vh-6rem)]">
        {/* Navigation Box */}
        <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-4 space-y-1.5 shadow-xl flex-grow overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              Aura Navigation
            </span>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm shadow-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE MODE</span>
            </span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-mono font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-white border border-purple-500/40 shadow-lg shadow-purple-950/40 translate-x-1'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-300' : item.color} group-hover:scale-110 transition`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-extrabold ${
                      typeof item.badge === 'number'
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Mini Footer Box */}
        <div className="bg-[#0F1526] border border-slate-800/80 rounded-3xl p-3.5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={avatar} alt={username} className="w-9 h-9 rounded-2xl object-cover border border-purple-500/30 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-slate-100 font-sans block truncate">{username}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {userStatus}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/40 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-purple-500/20 px-3 py-2 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition ${
            activeTab === 'home' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('omnimind')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition ${
            activeTab === 'omnimind' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono relative transition ${
            activeTab === 'messages' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition ${
            activeTab === 'calls' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
          <span>Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-mono transition ${
            activeTab === 'feed' ? 'text-pink-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Rss className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-mono text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* MOBILE FULL DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              <h3 className="text-base font-extrabold text-white font-sans">Aura Mobile Menu</h3>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 py-6 flex-grow overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-mono font-bold transition ${
                    activeTab === item.id
                      ? 'bg-purple-900/50 text-white border border-purple-500/40'
                      : 'text-slate-300 bg-slate-900/60 border border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full py-3.5 rounded-2xl bg-red-950/40 border border-red-900/60 text-red-400 font-mono font-bold text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Session</span>
          </button>
        </div>
      )}
    </>
  );
};

export default NavigationSidebar;
