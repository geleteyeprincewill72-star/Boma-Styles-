import React, { useState } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Video, 
  VideoOff, 
  User, 
  Clock, 
  Search, 
  Plus, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Delete
} from 'lucide-react';

interface CallRecord {
  id: string;
  contactName: string;
  avatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: number;
  duration?: string;
}

const SAMPLE_CALL_LOGS: CallRecord[] = [
  {
    id: 'call_1',
    contactName: 'Cynthia Vane',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    type: 'incoming',
    callType: 'voice',
    timestamp: Date.now() - 1000 * 60 * 15,
    duration: '04:12',
  },
  {
    id: 'call_2',
    contactName: 'Orion Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    type: 'missed',
    callType: 'video',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'call_3',
    contactName: 'Aura Swarm Peer Node #82',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
    type: 'outgoing',
    callType: 'voice',
    timestamp: Date.now() - 1000 * 60 * 360,
    duration: '12:45',
  },
];

interface CallsSectionProps {
  currentUserName: string;
  currentUserAvatar: string;
  theme?: 'dark' | 'light';
}

export const CallsSection: React.FC<CallsSectionProps> = ({
  currentUserName,
  currentUserAvatar,
  theme = 'dark',
}) => {
  const [activeCall, setActiveCall] = useState<{
    contactName: string;
    avatar: string;
    callType: 'voice' | 'video';
    startTime: number;
  } | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callLogs, setCallLogs] = useState<CallRecord[]>(SAMPLE_CALL_LOGS);
  const [dialPadNumber, setDialPadNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const isLight = theme === 'light';

  const startNewCall = (contactName: string, avatar: string, type: 'voice' | 'video') => {
    setActiveCall({
      contactName,
      avatar,
      callType: type,
      startTime: Date.now(),
    });

    const newLog: CallRecord = {
      id: `call_${Date.now()}`,
      contactName,
      avatar,
      type: 'outgoing',
      callType: type,
      timestamp: Date.now(),
      duration: 'In progress',
    };

    setCallLogs([newLog, ...callLogs]);
  };

  const endActiveCall = () => {
    setActiveCall(null);
  };

  const handleDialPress = (digit: string) => {
    setDialPadNumber((prev) => prev + digit);
  };

  const filteredLogs = callLogs.filter((log) =>
    log.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Active Call Live Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-[#0F1526] border border-purple-500/40 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full animate-pulse" />

            <div className="relative inline-block">
              <img
                src={activeCall.avatar}
                alt={activeCall.contactName}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 mx-auto shadow-xl animate-pulse"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white font-sans">{activeCall.contactName}</h3>
              <p className="text-xs text-purple-400 font-mono mt-1 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>E2E Encrypted {activeCall.callType === 'video' ? 'Video Call' : 'Voice Call'}</span>
              </p>
              <span className="text-[10px] text-emerald-400 font-mono mt-2 inline-block bg-emerald-950/80 border border-emerald-800 px-3 py-0.5 rounded-full">
                Connected • 00:24
              </span>
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full border transition ${
                  isMuted
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full border transition ${
                  !isSpeakerOn
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>

              {activeCall.callType === 'video' && (
                <button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`p-4 rounded-full border transition ${
                    !isVideoEnabled
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoEnabled ? 'Disable Camera' : 'Enable Camera'}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
              )}

              <button
                onClick={endActiveCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 transition transform hover:scale-110"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <span>Voice & Video Calls</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Encrypted WebRTC P2P Voice and Video Call Routing
          </p>
        </div>

        <button
          onClick={() => startNewCall('Aura Swarm Friend', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'voice')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-md shadow-emerald-950/40 transition flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>New Voice Call</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Dial Pad & Quick Call */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#0F1526] border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Keypad & Call Dialer
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <input
                type="text"
                readOnly
                value={dialPadNumber || 'Enter Phone or Node ID'}
                className="w-full bg-transparent text-center font-mono text-sm text-cyan-400 focus:outline-none tracking-widest"
              />
            </div>

            {/* Dial Pad Grid */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDialPress(digit)}
                  className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-mono font-bold text-sm transition active:scale-95"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDialPadNumber('')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Clear Dialer"
              >
                <Delete className="w-5 h-5 mx-auto" />
              </button>

              <button
                onClick={() => {
                  if (dialPadNumber) {
                    startNewCall(`Node +${dialPadNumber}`, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'voice');
                  }
                }}
                disabled={!dialPadNumber}
                className="flex-grow py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Number</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Call Logs & Recent Activity */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-[#0F1526] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Recent Calls
              </h3>

              <div className="relative max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search call logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={log.avatar}
                      alt={log.contactName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 font-sans">{log.contactName}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                        {log.type === 'incoming' && <PhoneIncoming className="w-3 h-3 text-emerald-400" />}
                        {log.type === 'outgoing' && <PhoneOutgoing className="w-3 h-3 text-cyan-400" />}
                        {log.type === 'missed' && <PhoneMissed className="w-3 h-3 text-red-400" />}
                        <span className="capitalize">{log.type} {log.callType} call</span>
                        {log.duration && <span>• {log.duration}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startNewCall(log.contactName, log.avatar, 'voice')}
                      className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 transition"
                      title="Voice Call"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startNewCall(log.contactName, log.avatar, 'video')}
                      className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-400 hover:bg-purple-900/60 transition"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsSection;
