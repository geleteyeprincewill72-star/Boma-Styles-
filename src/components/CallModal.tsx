import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  SwitchCamera, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  BellRing,
  RefreshCw,
  X
} from 'lucide-react';
import { CallSession, CallState } from '../types';
import { webrtcManager } from '../utils/webrtcService';

interface CallModalProps {
  session: CallSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (targetUsername: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  session,
  isOpen,
  onClose,
  onSendMessage
}) => {
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isOnlineNotifRequested, setIsOnlineNotifRequested] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !session) {
      handleEndCall();
      return;
    }

    setCallState(session.state || 'CALLING');
    setErrorMessage(null);
    setDurationSeconds(0);
    setIsMuted(false);
    setIsVideoOff(false);

    // Initiate WebRTC Call
    webrtcManager.initiateCall(session, {
      onStateChange: (newState, err) => {
        setCallState(newState);
        if (err) setErrorMessage(err);

        if (newState === 'CONNECTED') {
          startTimer();
        } else if (newState === 'ENDED' || newState === 'FAILED' || newState === 'DECLINED' || newState === 'BUSY') {
          stopTimer();
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      },
      onLocalStream: (stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
    });

    return () => {
      stopTimer();
      webrtcManager.cleanup();
    };
  }, [isOpen, session]);

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const muted = webrtcManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = () => {
    const videoOff = webrtcManager.toggleVideo();
    setIsVideoOff(videoOff);
  };

  const handleSwitchCamera = async () => {
    await webrtcManager.switchCamera();
  };

  const handleEndCall = () => {
    stopTimer();
    webrtcManager.endCall();
    onClose();
  };

  const handleNotifyWhenOnline = () => {
    setIsOnlineNotifRequested(true);
    setTimeout(() => {
      alert(`🔔 You will be notified as soon as @${session?.recipientUsername || 'user'} comes back online.`);
    }, 300);
  };

  if (!isOpen || !session) return null;

  const isVideoCall = session.callType === 'video';
  const targetDisplayName = session.recipientDisplayName || session.recipientUsername;
  const targetUsername = session.recipientUsername.startsWith('@') ? session.recipientUsername : `@${session.recipientUsername}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0B0F19] border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[520px] justify-between">
        
        {/* Header / Security Badge */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block leading-none">
                Aura P2P Encrypted Call
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {isVideoCall ? 'HD WebRTC Video Mesh' : 'Opus HD Voice Codec'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callState === 'CONNECTED' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {formatDuration(durationSeconds)}
              </span>
            )}
            <button 
              onClick={handleEndCall}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Surface or Voice Visualization Surface */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden min-h-[320px]">
          {isVideoCall && (
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* Remote Video Stream */}
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />

              {/* Local Video Stream Preview (Picture in Picture) */}
              <div className="absolute top-4 right-4 w-28 h-40 bg-slate-900 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl z-10">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono">
                    <VideoOff className="w-4 h-4 mb-1 text-slate-500" />
                    <span>Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Avatar & Identity Display (or Video Call Fallback) */}
          {(!isVideoCall || callState !== 'CONNECTED') && (
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="relative">
                {/* Ripple animation for calling state */}
                {(callState === 'CALLING' || callState === 'RINGING' || callState === 'CONNECTING') && (
                  <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping duration-1000" />
                )}
                {callState === 'CONNECTED' && (
                  <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse" />
                )}
                
                <img 
                  src={session.recipientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60'} 
                  alt={targetDisplayName} 
                  className="relative w-28 h-28 rounded-3xl object-cover border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/50"
                  referrerPolicy="no-referrer"
                />

                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                  callState === 'CONNECTED' ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'
                }`}>
                  <Phone className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-sans">
                  {targetDisplayName}
                </h3>
                <p className="text-sm font-mono text-cyan-400 font-semibold">
                  {targetUsername}
                </p>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    callState === 'CONNECTED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : callState === 'RECONNECTING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : callState === 'BUSY'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                      : callState === 'FAILED' || callState === 'DECLINED' || callState === 'ENDED'
                      ? 'bg-red-950 text-red-300 border border-red-500/40'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse'
                  }`}>
                    {callState === 'CALLING' && 'Calling...'}
                    {callState === 'RINGING' && 'Ringing...'}
                    {callState === 'CONNECTING' && 'Establishing P2P Tunnel...'}
                    {callState === 'CONNECTED' && 'Connected'}
                    {callState === 'RECONNECTING' && 'Reconnecting Signal...'}
                    {callState === 'BUSY' && `${targetDisplayName} is currently on another call`}
                    {callState === 'NO_ANSWER' && 'No Answer'}
                    {callState === 'DECLINED' && 'Call Declined'}
                    {callState === 'FAILED' && (errorMessage || 'Call Failed')}
                    {callState === 'ENDED' && 'Call Ended'}
                  </span>
                </div>
              </div>

                {/* Offline or Busy Fallback Options */}
                {(callState === 'BUSY' || callState === 'FAILED' || callState === 'NO_ANSWER') && (
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSendMessage?.(session.recipientUsername);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                    
                    <button
                      onClick={handleNotifyWhenOnline}
                      disabled={isOnlineNotifRequested}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition flex items-center gap-1.5 border border-slate-700"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isOnlineNotifRequested ? 'Alert Scheduled' : 'Notify When Online'}</span>
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Call Control Toolbar */}
        <div className="p-5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isMuted 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle (If Video Call) */}
          {isVideoCall && (
            <>
              <button
                onClick={handleToggleVideo}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
                  isVideoOff 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
                title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={handleSwitchCamera}
                className="w-12 h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition shadow-lg"
                title="Switch Camera (Front/Rear)"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg ${
              isSpeakerOn 
                ? 'bg-slate-800/90 text-cyan-300 border border-cyan-500/30' 
                : 'bg-slate-850 text-slate-400 border border-slate-700'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center transition shadow-xl shadow-red-950/60 border border-red-400/40"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
export default CallModal;
