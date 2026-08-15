import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  Bot, 
  User, 
  Settings, 
  Zap, 
  RefreshCw, 
  MessageSquare, 
  Play, 
  Pause,
  Sliders,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface VoiceConversationProps {
  currentUserName: string;
  theme?: 'dark' | 'light';
}

interface SpeechTurn {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const AI_PERSONAS = [
  { id: 'aura_companion', name: 'Aura Core AI', desc: 'Balanced, insightful & responsive neural assistant', pitch: 1.0, rate: 1.0 },
  { id: 'cyber_sage', name: 'Cyberpunk Sage', desc: 'Philosophical, technical & futuristic tone', pitch: 0.8, rate: 0.95 },
  { id: 'creative_studio', name: 'Studio Director', desc: 'Energetic, creative music & media advisor', pitch: 1.1, rate: 1.05 },
];

export const VoiceConversation: React.FC<VoiceConversationProps> = ({
  currentUserName,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [transcriptHistory, setTranscriptHistory] = useState<SpeechTurn[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: `Hello ${currentUserName}! I am your Aura Live Voice Assistant. Tap the microphone and speak to start our voice conversation.`,
      timestamp: Date.now() - 1000 * 30
    }
  ]);
  const [interimUserText, setInterimUserText] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setInterimUserText(currentText);

        if (event.results[0].isFinal) {
          handleUserSpokenMessage(currentText);
          setInterimUserText('');
        }
      };

      recog.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, []);

  // Visualizer Animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isActive = isListening || isSpeaking;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 45;

      // Pulse circle
      ctx.beginPath();
      const pulseSize = isActive ? radius + Math.sin(frame * 0.1) * 8 : radius;
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = isListening 
        ? 'rgba(6, 182, 212, 0.2)' 
        : (isSpeaking ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.4)');
      ctx.fill();

      // Soundwave bars around circle
      const barCount = 24;
      for (let i = 0; i < barCount; i++) {
        const angle = (i * Math.PI * 2) / barCount;
        const amp = isActive ? Math.abs(Math.sin((frame * 0.12) + i)) * 30 + 10 : 8;
        
        const x1 = centerX + Math.cos(angle) * (radius + 5);
        const y1 = centerY + Math.sin(angle) * (radius + 5);
        const x2 = centerX + Math.cos(angle) * (radius + 5 + amp);
        const y2 = centerY + Math.sin(angle) * (radius + 5 + amp);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isListening ? '#06b6d4' : (isSpeaking ? '#a855f7' : '#475569');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isListening, isSpeaking]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn("Could not start recognition:", err);
        }
      } else {
        // Fallback prompt
        const userPrompt = prompt("Speech Recognition API unavailable in browser. Type your spoken message:");
        if (userPrompt) {
          handleUserSpokenMessage(userPrompt);
        }
      }
    }
  };

  const speakAiResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate * selectedPersona.rate;
      utterance.pitch = speechPitch * selectedPersona.pitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserSpokenMessage = (userSpeechText: string) => {
    if (!userSpeechText.trim()) return;

    const userTurn: SpeechTurn = {
      id: `turn_${Date.now()}`,
      sender: 'user',
      text: userSpeechText,
      timestamp: Date.now()
    };

    setTranscriptHistory(prev => [...prev, userTurn]);

    // Simulate AI Smart Intelligent Voice Answer
    setTimeout(() => {
      const lower = userSpeechText.toLowerCase();
      let aiResponseText = `I heard you say "${userSpeechText}". I am processing your voice command and syncing with the Aura Network node.`;

      if (lower.includes('hello') || lower.includes('hi')) {
        aiResponseText = `Greetings ${currentUserName}! It is wonderful to speak with you directly. How can I assist your creative workflow today?`;
      } else if (lower.includes('music') || lower.includes('song') || lower.includes('beat')) {
        aiResponseText = `You can generate custom AI music directly in our Studio Section! Try selecting Synthwave, Lo-Fi, or Afrobeat presets.`;
      } else if (lower.includes('voicemail') || lower.includes('message')) {
        aiResponseText = `You can record and send audio voicemails directly to your node peers in our Voicemail tab.`;
      } else if (lower.includes('who are you')) {
        aiResponseText = `I am your personal AI Voice Assistant running on the decentralized Aura Swarm architecture.`;
      }

      const aiTurn: SpeechTurn = {
        id: `turn_ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: Date.now()
      };

      setTranscriptHistory(prev => [...prev, aiTurn]);
      speakAiResponse(aiResponseText);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>Interactive AI Voice Conversation</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time Conversational AI • Natural Speech Synthesis & Voice Processing
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Aura Neural Speech Engine</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Voice Sphere & Controller */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-3xl bg-[#0F1526] border border-cyan-500/30 p-6 space-y-6 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />

            {/* Persona Selector Header */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>AI Persona Mode</span>
              </label>
              <select
                value={selectedPersona.id}
                onChange={e => {
                  const found = AI_PERSONAS.find(p => p.id === e.target.value);
                  if (found) setSelectedPersona(found);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
              >
                {AI_PERSONAS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.desc}</option>
                ))}
              </select>
            </div>

            {/* Animated Sound Wave Canvas */}
            <div className="relative flex items-center justify-center my-4">
              <canvas ref={canvasRef} width={260} height={200} className="mx-auto" />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute p-6 rounded-full border-2 transition transform hover:scale-110 active:scale-95 shadow-2xl ${
                  isListening
                    ? 'bg-cyan-500 border-white text-slate-950 shadow-cyan-500/50 animate-pulse'
                    : (isSpeaking
                        ? 'bg-purple-600 border-purple-300 text-white shadow-purple-900/50'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400')
                }`}
                title={isListening ? 'Stop Listening' : 'Start Voice Conversation'}
              >
                {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <MicOff className="w-8 h-8" />}
              </button>
            </div>

            {/* Status Feedback Banner */}
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {isListening ? 'LISTENING TO YOUR SPEECH...' : (isSpeaking ? 'AI IS SPEAKING...' : 'TAP MIC TO START CONVERSATION')}
              </p>
              {interimUserText && (
                <p className="text-xs text-slate-300 italic bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  "{interimUserText}"
                </p>
              )}
            </div>

            {/* Voice Tuning Sliders */}
            <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Voice Controls
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Speech Speed ({speechRate.toFixed(1)}x)</span>
                  <input
                    type="range"
                    min={0.7}
                    max={1.4}
                    step={0.1}
                    value={speechRate}
                    onChange={e => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Pitch Tone ({speechPitch.toFixed(1)}x)</span>
                  <input
                    type="range"
                    min={0.7}
                    max={1.4}
                    step={0.1}
                    value={speechPitch}
                    onChange={e => setSpeechPitch(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcript History */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl bg-[#0F1526] border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Conversation Transcript Log</span>
              </h3>

              <button
                type="button"
                onClick={() => setTranscriptHistory([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {transcriptHistory.map(turn => (
                <div
                  key={turn.id}
                  className={`p-3.5 rounded-2xl border space-y-1 ${
                    turn.sender === 'user'
                      ? 'bg-cyan-950/30 border-cyan-500/30 ml-6 text-right'
                      : 'bg-slate-950/80 border-slate-800 mr-6 text-left'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold ${
                    turn.sender === 'user' ? 'justify-end text-cyan-400' : 'text-purple-400'
                  }`}>
                    {turn.sender === 'user' ? (
                      <>
                        <span>{currentUserName}</span>
                        <User className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        <span>{selectedPersona.name}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{turn.text}</p>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConversation;
