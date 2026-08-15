import React, { useState, useEffect } from 'react';
import UserLocationTracker from './UserLocationTracker';
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Video, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  UserCheck, 
  Clock, 
  MoreVertical,
  Key,
  MapPin,
  Compass,
  Lock
} from 'lucide-react';
import { fetchUsersList, UserProfile } from '../utils/firebase';

interface FriendsSectionProps {
  currentUserId?: string;
  currentUserName: string;
  currentUserAvatar: string;
  onOpenChatWithUser?: (userId: string, userName: string) => void;
  onNavigateTab: (tab: string) => void;
  theme?: 'dark' | 'light';
}

const PRESEEDED_FRIENDS = [
  {
    uid: 'user_cynthia',
    displayName: 'Cynthia Vane',
    username: 'cynthia_cipher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    status: 'online',
    bio: 'Autonomous memory miner & swarm network peer',
    role: 'Sovereign Peer',
    isFriend: true,
  },
  {
    uid: 'user_orion',
    displayName: 'Orion Sterling',
    username: 'orion_security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    status: 'online',
    bio: 'Chief Security Architect @ Sovereign Silo',
    role: 'System Architect',
    isFriend: true,
  },
  {
    uid: 'user_aura_ai',
    displayName: 'Aura AI Assistant',
    username: 'aura_intelligence',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
    status: 'online',
    bio: 'Gemini 2.5 Neural Intelligence Node',
    role: 'Core AI',
    isFriend: true,
  },
  {
    uid: 'user_maya',
    displayName: 'Maya Lin',
    username: 'maya_decentralized',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
    status: 'offline',
    bio: 'Creative media producer & Web3 digital artist',
    role: 'Creator',
    isFriend: false,
  },
];

export const FriendsSection: React.FC<FriendsSectionProps> = ({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onOpenChatWithUser,
  onNavigateTab,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState(PRESEEDED_FRIENDS);
  const [activeTab, setActiveTab] = useState<'all' | 'location_tracker' | 'requests'>('all');
  const [addedFriendUids, setAddedFriendUids] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadRealUsers() {
      try {
        const users = await fetchUsersList();
        if (users && users.length > 0) {
          const mapped = users.map((u) => ({
            uid: u.uid,
            displayName: u.displayName || u.username || 'Swarm Peer',
            username: u.username || 'peer',
            avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: u.status || 'online',
            bio: u.email ? `Email Verified: ${u.email}` : 'Decentralized Swarm Peer',
            role: u.role || 'Member',
            isFriend: true,
          }));
          setFriendsList(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch real users list', err);
      }
    }
    loadRealUsers();
  }, []);

  const handleToggleAddFriend = (uid: string) => {
    setAddedFriendUids((prev) => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };

  const filteredFriends = friendsList.filter(
    (f) =>
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Friends & Peer Location Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Connect with peers & search private user GPS location coordinates
          </p>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs font-bold w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Friends ({friendsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location_tracker')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'location_tracker'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            <span>Private User Locator</span>
            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
              Encrypted
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'location_tracker' && (
        <UserLocationTracker
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          theme={theme}
        />
      )}

      {activeTab === 'all' && (
      <>
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search friends or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0F1526] border border-slate-800 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
          />
        </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFriends.map((friend) => {
          const isAdded = friend.isFriend || addedFriendUids[friend.uid];

          return (
            <div
              key={friend.uid}
              className="rounded-2xl bg-[#0F1526] border border-slate-800/80 p-5 space-y-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.displayName}
                      className="w-12 h-12 rounded-2xl object-cover border border-purple-500/30"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        friend.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                      title={friend.status}
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-1.5">
                      <span>{friend.displayName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono block">@{friend.username}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 font-bold">
                  {friend.role}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                {friend.bio}
              </p>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    if (onOpenChatWithUser) {
                      onOpenChatWithUser(friend.uid, friend.displayName);
                    } else {
                      onNavigateTab('messages');
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => onNavigateTab('calls')}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition"
                  title="Call Friend"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleAddFriend(friend.uid)}
                  className={`p-2.5 rounded-xl border transition ${
                    isAdded
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title={isAdded ? 'Added Friend' : 'Add Friend'}
                >
                  {isAdded ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
};

export default FriendsSection;
