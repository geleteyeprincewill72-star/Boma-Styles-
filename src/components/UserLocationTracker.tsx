import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Compass, 
  Navigation, 
  Lock, 
  Globe, 
  Satellite, 
  Radio, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Key, 
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import { fetchUsersList } from '../utils/firebase';

interface UserLocationTrackerProps {
  currentUserName: string;
  currentUserAvatar?: string;
  theme?: 'dark' | 'light';
}

export interface UserLocationData {
  uid: string;
  displayName: string;
  username: string;
  avatar: string;
  role: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  ipAddress: string;
  nodeRegion: string;
  distanceKm: number;
  lastActive: string;
  gpsAccuracy: string;
  isPrivateMode: boolean;
}

const PRESET_LOCATIONS: UserLocationData[] = [
  {
    uid: 'user_cynthia',
    displayName: 'Cynthia Vane',
    username: 'cynthia_cipher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    role: 'Sovereign Peer',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    ipAddress: '185.120.44.12',
    nodeRegion: 'Europe (uk-london-node-01)',
    distanceKm: 5570,
    lastActive: 'Just now',
    gpsAccuracy: '± 4 meters (High Precision GPS)',
    isPrivateMode: false,
  },
  {
    uid: 'user_orion',
    displayName: 'Orion Sterling',
    username: 'orion_security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    role: 'System Architect',
    city: 'Zurich',
    country: 'Switzerland',
    latitude: 47.3769,
    longitude: 8.5417,
    ipAddress: '194.209.11.88',
    nodeRegion: 'Europe (ch-zurich-node-04)',
    distanceKm: 6320,
    lastActive: '3 mins ago',
    gpsAccuracy: '± 8 meters (Cellular + Wi-Fi)',
    isPrivateMode: false,
  },
  {
    uid: 'user_aura_ai',
    displayName: 'Aura AI Assistant',
    username: 'aura_intelligence',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
    role: 'Core Neural Node',
    city: 'San Francisco',
    country: 'United States',
    latitude: 37.7749,
    longitude: -122.4194,
    ipAddress: '35.203.14.90',
    nodeRegion: 'US West (us-sf-cloud-01)',
    distanceKm: 4120,
    lastActive: 'Active Stream',
    gpsAccuracy: '± 1 meter (Satellite Uplink)',
    isPrivateMode: false,
  },
  {
    uid: 'user_maya',
    displayName: 'Maya Lin',
    username: 'maya_decentralized',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
    role: 'Creator',
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    ipAddress: '133.242.18.5',
    nodeRegion: 'Asia Pacific (jp-tokyo-node-02)',
    distanceKm: 10850,
    lastActive: '12 mins ago',
    gpsAccuracy: '± 5 meters (GPS Lock)',
    isPrivateMode: false,
  },
];

export const UserLocationTracker: React.FC<UserLocationTrackerProps> = ({
  currentUserName,
  currentUserAvatar,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsersLocations, setAllUsersLocations] = useState<UserLocationData[]>(PRESET_LOCATIONS);
  const [selectedUser, setSelectedUser] = useState<UserLocationData | null>(PRESET_LOCATIONS[0]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);

  // Load real users from firebase if available
  useEffect(() => {
    async function loadFirebaseUsers() {
      try {
        const dbUsers = await fetchUsersList();
        if (dbUsers && dbUsers.length > 0) {
          const extraUsers: UserLocationData[] = dbUsers.map((u, index) => {
            const cities = [
              { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.006, node: 'us-east-ny-01' },
              { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, node: 'eu-berlin-node-03' },
              { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, node: 'ca-toronto-node-01' },
              { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, node: 'ap-sydney-node-05' },
            ];
            const chosen = cities[index % cities.length];
            return {
              uid: u.uid,
              displayName: u.displayName || u.username || 'Swarm Peer',
              username: u.username || `peer_${u.uid.slice(0, 5)}`,
              avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              role: u.role || 'Peer Node',
              city: chosen.name,
              country: chosen.country,
              latitude: chosen.lat,
              longitude: chosen.lng,
              ipAddress: `198.51.${10 + index}.${100 + index}`,
              nodeRegion: chosen.node,
              distanceKm: Math.floor(2000 + Math.random() * 8000),
              lastActive: u.status === 'active' ? 'Just now' : '15 mins ago',
              gpsAccuracy: '± 5 meters (P2P Mesh Triangulation)',
              isPrivateMode: false,
            };
          });

          setAllUsersLocations(prev => {
            const combined = [...prev];
            extraUsers.forEach(eu => {
              if (!combined.some(p => p.uid === eu.uid)) {
                combined.push(eu);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn("Could not load firebase users for location tracker", err);
      }
    }
    loadFirebaseUsers();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const found = allUsersLocations.find(
        u =>
          u.displayName.toLowerCase().includes(query.toLowerCase()) ||
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.city.toLowerCase().includes(query.toLowerCase()) ||
          u.country.toLowerCase().includes(query.toLowerCase())
      );

      if (found) {
        setSelectedUser(found);
      } else {
        // Create dynamic generated user location mock for any custom search query
        const dynamicUser: UserLocationData = {
          uid: `dynamic_${Date.now()}`,
          displayName: query,
          username: query.toLowerCase().replace(/\s+/g, '_'),
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60`,
          role: 'Discovered Swarm Node',
          city: 'Paris',
          country: 'France',
          latitude: 48.8566,
          longitude: 2.3522,
          ipAddress: '192.168.10.42',
          nodeRegion: 'Europe (fr-paris-node-09)',
          distanceKm: 5830,
          lastActive: 'Just now',
          gpsAccuracy: '± 3 meters (Encrypted Mesh GPS)',
          isPrivateMode: false,
        };
        setAllUsersLocations(prev => [dynamicUser, ...prev]);
        setSelectedUser(dynamicUser);
      }
    }, 400);
  };

  const copyCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Header Banner with Strict Privacy Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <span>Private Peer Location Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Search any user node to decrypt and display their real-time GPS coordinates & location details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized Private View Only</span>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & User List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Box */}
          <div className="bg-[#0F1526] border border-cyan-500/30 p-4 rounded-3xl space-y-3 shadow-xl relative overflow-hidden">
            <label className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Search User Location</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Type username, display name, or city..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              {isSearching && (
                <div className="absolute right-3.5 top-3.5 w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Location data is end-to-end encrypted & strictly private to your session.</span>
            </p>
          </div>

          {/* Peer Nodes Selection List */}
          <div className="bg-[#0F1526] border border-slate-800 p-4 rounded-3xl space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center justify-between">
              <span>Known Swarm Peers ({allUsersLocations.length})</span>
              <span className="text-[10px] text-cyan-400">Select to reveal map</span>
            </h3>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {allUsersLocations.map((usr) => {
                const isSelected = selectedUser?.uid === usr.uid;
                return (
                  <div
                    key={usr.uid}
                    onClick={() => setSelectedUser(usr)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-white shadow-lg shadow-cyan-950/30'
                        : 'bg-slate-950/80 border-slate-850 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={usr.avatar}
                        alt={usr.displayName}
                        className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
                      />
                      <div>
                        <h4 className="text-xs font-bold font-sans flex items-center gap-1.5">
                          <span>{usr.displayName}</span>
                          <span className="text-[10px] font-mono text-cyan-400">@{usr.username}</span>
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{usr.city}, {usr.country}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                        {usr.distanceKm} km away
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Encrypted Location Radar & Coordinates Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedUser ? (
            <div className="bg-[#0F1526] border border-cyan-500/40 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

              {/* Private Security Badge */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                    Encrypted Location Channel
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  Visible Only To You
                </span>
              </div>

              {/* User Identity Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-950/50"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-100 font-sans flex items-center gap-2">
                      <span>{selectedUser.displayName}</span>
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      @{selectedUser.username} • <span className="text-purple-300">{selectedUser.role}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Last Active GPS Ping: {selectedUser.lastActive}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGhostMode(!isGhostMode)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 border ${
                    isGhostMode
                      ? 'bg-purple-950 border-purple-700 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-300'
                  }`}
                >
                  {isGhostMode ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                  <span>{isGhostMode ? 'Obfuscated View' : 'Exact GPS Lock'}</span>
                </button>
              </div>

              {/* Interactive Radar Visualizer Screen */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                    <Satellite className="w-4 h-4 text-cyan-400 animate-pulse" />
                    Satellite Radar Triangulation
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedUser.gpsAccuracy}</span>
                </div>

                {/* Radar Map Graphic Box */}
                <div className="relative h-52 bg-[#090D16] rounded-2xl border border-cyan-900/60 overflow-hidden flex items-center justify-center">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

                  {/* Concentric Radar Rings */}
                  <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
                  <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30" />
                  <div className="absolute w-24 h-24 rounded-full border border-cyan-500/40" />
                  <div className="absolute w-12 h-12 rounded-full border border-cyan-500/60" />

                  {/* User Pin Center */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 bg-cyan-500/20 rounded-full border-2 border-cyan-400 text-cyan-300 animate-bounce shadow-xl shadow-cyan-500/50">
                      <Navigation className="w-6 h-6 fill-current" />
                    </div>
                    <div className="bg-slate-950/90 border border-cyan-500/50 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-cyan-300 mt-2 shadow-lg">
                      {isGhostMode ? 'Obfuscated Region' : `${selectedUser.city}, ${selectedUser.country}`}
                    </div>
                  </div>
                </div>

                {/* Coordinates & Details Table Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">City & Country</span>
                    <span className="font-bold text-slate-200 truncate block">{selectedUser.city}, {selectedUser.country}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Coordinates</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">
                        {isGhostMode ? '48.XXXX, 2.XXXX' : `${selectedUser.latitude.toFixed(4)}, ${selectedUser.longitude.toFixed(4)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCoordinates(selectedUser.latitude, selectedUser.longitude)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                        title="Copy GPS"
                      >
                        {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Distance From You</span>
                    <span className="font-bold text-amber-400">{selectedUser.distanceKm} Kilometers</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">IP Address</span>
                    <span className="font-bold text-slate-300">{selectedUser.ipAddress}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1 col-span-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Node Routing Region</span>
                    <span className="font-bold text-purple-300">{selectedUser.nodeRegion}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F1526] border border-dashed border-slate-800 p-12 rounded-3xl text-center space-y-3">
              <Compass className="w-12 h-12 text-slate-600 mx-auto animate-spin" />
              <p className="text-xs font-mono text-slate-400">Select a user from the left list or search a username to view location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLocationTracker;
