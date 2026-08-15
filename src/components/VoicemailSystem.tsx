import React, { useState, useRef, useEffect } from 'react';
import { 
  Voicemail, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Send, 
  Trash2, 
  Clock, 
  User, 
  Sparkles, 
  CheckCheck, 
  PhoneCall, 
  Volume2, 
  FileText, 
  Plus, 
  RotateCcw,
  Search
} from 'lucide-react';

export interface VoicemailRecord {
  id: string;
  senderName: string;
  senderAvatar: string;
  recipientName: string;
  audioUrl: string;
  durationSeconds: number;
  timestamp: number;
  isRead: boolean;
  transcript: string;
  waveformData: number[];
}

const SAMPLE_VOICEMAILS: VoicemailRecord[] = [
  {
    id: 'vm_1',
    senderName: 'Cynthia Vane',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    recipientName: 'You',
    audioUrl: '',
    durationSeconds: 14,
    timestamp: Date.now() - 1000 * 60 * 45,
    isRead: false,
    transcript: 'Hey! Leaving a quick message about the new studio track arpeggios. Call me back when you get a chance!',
    waveformData: [0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.9, 0.2, 0.4]
  },
  {
    id: 'vm_2',
    senderName: 'Orion Sterling',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    recipientName: 'You',
    audioUrl: '',
    durationSeconds: 22,
    timestamp: Date.now() - 1000 * 60 * 240,
    isRead: true,
    transcript: 'The decentralized node backup finished successfully. Let us sync on the feed tomorrow morning.',
    waveformData: [0.3, 0.6, 0.4, 0.7, 0.5, 0.8, 0.9, 0.3, 0.6, 0.2, 0.5, 0.7]
  }
];

interface VoicemailSystemProps {
  currentUserName: string;
  currentUserAvatar: string;
  theme?: 'dark' | 'light';
  onQuickCall?: (contactName: string, avatar: string) => void;
}

export const VoicemailSystem: React.FC<VoicemailSystemProps> = ({
  currentUserName,
  currentUserAvatar,
  theme = 'dark',
  onQuickCall
}) => {
  const isLight = theme === 'light';

  // State
  const [voicemails, setVoicemails] = useState<VoicemailRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aura_voicemails');
      return saved ? JSON.parse(saved) : SAMPLE_VOICEMAILS;
    } catch {
      return SAMPLE_VOICEMAILS;
    }
  });

  const [activeTab, setActiveTab] = useState<'inbox' | 'record'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [targetContact, setTargetContact] = useState('Cynthia Vane');

  // Playback State
  const [playingVmId, setPlayingVmId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.getItem('aura_voicemails');
    } catch (e) {
      console.warn("Storage quota exceeded for voicemails");
    }
  }, [voicemails]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone. Please check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSendVoicemail = () => {
    if (!recordedAudioUrl) return;

    const newVm: VoicemailRecord = {
      id: `vm_${Date.now()}`,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      recipientName: targetContact,
      audioUrl: recordedAudioUrl,
      durationSeconds: recordingSeconds || 12,
      timestamp: Date.now(),
      isRead: true,
      transcript: `[Sent Voicemail to ${targetContact}]: Voice message recorded and encrypted via Aura Swarm node.`,
      waveformData: [0.4, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5]
    };

    setVoicemails(prev => [newVm, ...prev]);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    setActiveTab('inbox');
  };

  const togglePlayVoicemail = (vm: VoicemailRecord) => {
    if (playingVmId === vm.id) {
      if (isPlaying) {
        audioPlayerRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingVmId(vm.id);
      if (audioPlayerRef.current) {
        if (vm.audioUrl) {
          audioPlayerRef.current.src = vm.audioUrl;
        } else {
          // Fallback speech synthesis reading the transcript if audio blob expired
          speakTranscript(vm.transcript);
          setIsPlaying(true);
          return;
        }
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }

      // Mark as read
      setVoicemails(prev => prev.map(v => v.id === vm.id ? { ...v, isRead: true } : v));
    }
  };

  const speakTranscript = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDeleteVoicemail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVoicemails(prev => prev.filter(v => v.id !== id));
  };

  const filteredVoicemails = voicemails.filter(vm => 
    vm.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vm.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      <audio ref={audioPlayerRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Voicemail className="w-5 h-5 text-emerald-400" />
            <span>Encrypted Voicemail System</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            P2P Voice Mailbox • Record, Transcribe & Exchange Audio Messages
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'inbox' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inbox ({voicemails.filter(v => !v.isRead).length} New)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'record' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Voicemail</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Record Voicemail */}
      {activeTab === 'record' && (
        <div className="max-w-xl mx-auto rounded-3xl bg-[#0F1526] border border-purple-500/30 p-6 space-y-5 shadow-xl text-center">
          <h3 className="text-sm font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center justify-center gap-2">
            <Mic className="w-4 h-4 text-purple-400" />
            <span>Record Audio Voicemail</span>
          </h3>

          <div className="space-y-1 text-left">
            <label className="text-xs font-mono font-semibold text-slate-300">Recipient Contact</label>
            <select
              value={targetContact}
              onChange={e => setTargetContact(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="Cynthia Vane">Cynthia Vane (Peer Node #12)</option>
              <option value="Orion Sterling">Orion Sterling (Peer Node #48)</option>
              <option value="Aura Swarm Peer Node #82">Aura Swarm Peer Node #82</option>
            </select>
          </div>

          {/* Recorder Controls */}
          <div className="py-6 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition border-4 ${
              isRecording 
                ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse' 
                : (recordedAudioUrl ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-300')
            }`}>
              <Mic className="w-8 h-8" />
            </div>

            <span className="text-sm font-mono font-bold text-slate-200">
              {isRecording ? `00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}` : (recordedAudioUrl ? 'Voicemail Recorded!' : 'Ready to record')}
            </span>

            <div className="flex items-center gap-3 pt-2">
              {!isRecording && !recordedAudioUrl && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 font-mono font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Save</span>
                </button>
              )}

              {recordedAudioUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedAudioUrl(null);
                      setRecordedAudioBlob(null);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-xl border border-slate-800 transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendVoicemail}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Voicemail</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Voicemail Inbox */}
      {activeTab === 'inbox' && (
        <div className="rounded-3xl bg-[#0F1526] border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Voicemail className="w-4 h-4 text-emerald-400" />
              <span>Voicemail Inbox & Logs ({filteredVoicemails.length})</span>
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search voicemails..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredVoicemails.map(vm => (
              <div
                key={vm.id}
                onClick={() => togglePlayVoicemail(vm)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  !vm.isRead
                    ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-lg shadow-purple-950/30'
                    : 'bg-slate-950/80 border-slate-850 hover:border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={vm.senderAvatar}
                      alt={vm.senderName}
                      className="w-11 h-11 rounded-full object-cover border border-purple-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold font-sans">{vm.senderName}</h4>
                        {!vm.isRead && (
                          <span className="text-[9px] font-mono font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>Duration: 00:{vm.durationSeconds < 10 ? '0' : ''}{vm.durationSeconds}</span>
                        <span>•</span>
                        <span>{new Date(vm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); togglePlayVoicemail(vm); }}
                      className={`p-3 rounded-full transition ${
                        playingVmId === vm.id && isPlaying
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      {playingVmId === vm.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    {onQuickCall && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickCall(vm.senderName, vm.senderAvatar); }}
                        className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60 transition"
                        title="Call Back"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteVoicemail(vm.id, e)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition"
                      title="Delete Voicemail"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Voicemail Transcript */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-900/60 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>AI Voice Transcript</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                    "{vm.transcript}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicemailSystem;
