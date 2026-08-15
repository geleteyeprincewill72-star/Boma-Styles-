import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  UploadCloud, 
  FileAudio, 
  Play, 
  Pause, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Languages, 
  CheckSquare, 
  FileText, 
  Clock, 
  User, 
  Trash2, 
  Layers, 
  Bot, 
  AlertCircle,
  HelpCircle,
  Activity,
  Radio,
  FileCheck
} from 'lucide-react';
import { FeedPost } from '../types';

export interface TranscriptionRecord {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  actionItems: string[];
  keyTakeaways: string[];
  sentiment: string;
  language: string;
  segments: Array<{ time: string; speaker: string; text: string }>;
  durationSeconds: number;
  timestamp: number;
  audioBlobUrl?: string;
  fileName?: string;
}

interface AudioTranscriberStudioProps {
  username: string;
  avatar: string;
  onShareToFeed?: (post: Partial<FeedPost>) => void;
  theme?: 'dark' | 'light';
}

const LOCAL_STORAGE_TRANSCRIPTS_KEY = 'aura_audio_transcriptions_history_v1';

export const AudioTranscriberStudio: React.FC<AudioTranscriberStudioProps> = ({
  username,
  avatar,
  onShareToFeed,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [interimSpeechText, setInterimSpeechText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Audio Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // Active Selected Transcript
  const [activeRecord, setActiveRecord] = useState<TranscriptionRecord | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  // TTS Speech Player State
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);

  // Copy / Share Feedback
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [sharedFeedSuccess, setSharedFeedSuccess] = useState(false);

  // Transcriptions History
  const [history, setHistory] = useState<TranscriptionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRANSCRIPTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load transcripts from localStorage:", e);
    }
    // Default welcome transcript
    return [
      {
        id: 'init_trans_1',
        title: 'Project Architecture & Sovereign Network Briefing',
        transcript: "Welcome to Aura Sovereign Network audio intelligence system. All vocal inputs, peer call recordings, and uploaded audio tracks are processed with multi-tier cryptographic integrity. In today's session, we confirmed that decentralized node gossiping is operating with zero tracking and full zero-knowledge encryption.",
        summary: "Overview of Aura's sovereign audio intelligence system and verification of zero-knowledge node encryption protocols.",
        actionItems: [
          "Verify DHT gossip latency thresholds",
          "Deploy end-to-end voice note signing across peer channels"
        ],
        keyTakeaways: [
          "Zero tracking and decentralized privacy enforced",
          "Acoustic frequency transcribed cleanly with Gemini multimodal support"
        ],
        sentiment: "positive",
        language: "English (US)",
        segments: [
          { time: "00:00", speaker: "Speaker 1 (Host)", text: "Welcome to Aura Sovereign Network audio intelligence system." },
          { time: "00:06", speaker: "Speaker 1 (Host)", text: "All vocal inputs, peer call recordings, and uploaded audio tracks are processed with multi-tier cryptographic integrity." },
          { time: "00:15", speaker: "Speaker 2 (Architect)", text: "In today's session, we confirmed that decentralized node gossiping is operating with zero tracking and full zero-knowledge encryption." }
        ],
        durationSeconds: 24,
        timestamp: Date.now() - 3600000 * 4
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TRANSCRIPTS_KEY, JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  useEffect(() => {
    if (!activeRecord && history.length > 0) {
      setActiveRecord(history[0]);
    }
  }, [history, activeRecord]);

  // Audio Recording References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording, isPaused]);

  // Waveform visualization loop
  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#070B13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06b6d4'; // Cyan 500
    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  // Start Live Audio Recording
  const handleStartRecording = async () => {
    try {
      setStatusMessage('');
      setInterimSpeechText('');
      setRecordingSeconds(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio setup for visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawWaveform();

      // MediaRecorder setup
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);

      // Web Speech API for real-time live captions during recording
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = selectedLanguage;
        recog.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          setInterimSpeechText(currentText);
        };
        recog.onerror = (e: any) => console.warn("Speech recog err:", e);
        recog.start();
        speechRecognitionRef.current = recog;
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      alert("Microphone permission was denied or unavailable. Please check your browser microphone settings.");
    }
  };

  // Pause / Resume Recording
  const handleTogglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording and trigger AI Transcription Pipeline
  const handleStopAndTranscribe = async () => {
    if (!mediaRecorderRef.current) return;

    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }

    mediaRecorderRef.current.onstop = async () => {
      // Clean up stream & audio context
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      setIsRecording(false);
      setIsPaused(false);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const blobUrl = URL.createObjectURL(audioBlob);

      // Convert to Base64 for multimodal endpoint
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        await processAudioTranscription({
          audioBase64: base64Data,
          mimeType: 'audio/webm',
          clientTranscript: interimSpeechText,
          durationSeconds: recordingSeconds,
          blobUrl,
          title: `Voice Recording (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
  };

  // Cancel Recording
  const handleCancelRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setInterimSpeechText('');
    setRecordingSeconds(0);
  };

  // File Upload Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAudioFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleAudioFileSelected = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|webm)$/i)) {
      alert("Please upload a valid audio file (MP3, WAV, M4A, OGG, WebM, AAC).");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribeUploadedFile = async () => {
    if (!uploadedFile || !uploadedFileBase64) return;
    const blobUrl = URL.createObjectURL(uploadedFile);
    await processAudioTranscription({
      audioBase64: uploadedFileBase64,
      mimeType: uploadedFile.type || 'audio/mp3',
      fileName: uploadedFile.name,
      blobUrl,
      title: uploadedFile.name.replace(/\.[^/.]+$/, "")
    });
    setUploadedFile(null);
    setUploadedFileBase64('');
  };

  // Common Transcription Request Runner
  const processAudioTranscription = async (params: {
    audioBase64?: string;
    mimeType?: string;
    clientTranscript?: string;
    durationSeconds?: number;
    fileName?: string;
    blobUrl?: string;
    title: string;
  }) => {
    setIsProcessing(true);
    setStatusMessage('Transcribing speech acoustic frequencies with Gemini 2.5 multimodal...');

    try {
      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: params.audioBase64,
          mimeType: params.mimeType,
          clientTranscript: params.clientTranscript,
          language: selectedLanguage
        })
      });

      const data = await res.json();
      if (data.success) {
        const newRecord: TranscriptionRecord = {
          id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: params.title,
          transcript: data.transcript,
          summary: data.summary,
          actionItems: data.actionItems || [],
          keyTakeaways: data.keyTakeaways || [],
          sentiment: data.sentiment || 'positive',
          language: data.detectedLanguage || 'English',
          segments: data.segments || [{ time: '00:00', speaker: 'Speaker 1', text: data.transcript }],
          durationSeconds: params.durationSeconds || Math.max(10, Math.floor(data.transcript.length / 15)),
          timestamp: Date.now(),
          audioBlobUrl: params.blobUrl,
          fileName: params.fileName
        };

        setHistory(prev => [newRecord, ...prev]);
        setActiveRecord(newRecord);
        setStatusMessage('');
      } else {
        alert(data.error || "Failed to transcribe audio.");
      }
    } catch (err: any) {
      console.error("Audio transcription error:", err);
      alert("Error occurred while communicating with transcription engine.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-To-Speech Playback
  const handleToggleTts = () => {
    if (!activeRecord) return;
    if (isSpeakingTts) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeRecord.transcript);
      utterance.rate = ttsSpeed;
      utterance.onend = () => setIsSpeakingTts(false);
      utterance.onerror = () => setIsSpeakingTts(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingTts(true);
    }
  };

  // Export helpers
  const handleExportText = (format: 'txt' | 'srt' | 'json') => {
    if (!activeRecord) return;
    let content = '';
    let mime = 'text/plain';
    let filename = `transcript-${activeRecord.id}.${format}`;

    if (format === 'txt') {
      content = `AURA SPEECH TRANSCRIPTION REPORT\nTitle: ${activeRecord.title}\nDate: ${new Date(activeRecord.timestamp).toLocaleString()}\nLanguage: ${activeRecord.language}\nSentiment: ${activeRecord.sentiment}\n\n=== EXECUTIVE SUMMARY ===\n${activeRecord.summary}\n\n=== KEY TAKEAWAYS ===\n${activeRecord.keyTakeaways.map(k => `• ${k}`).join('\n')}\n\n=== ACTION ITEMS ===\n${activeRecord.actionItems.map(a => `[ ] ${a}`).join('\n')}\n\n=== VERBATIM TRANSCRIPT ===\n${activeRecord.segments.map(s => `[${s.time}] ${s.speaker}: ${s.text}`).join('\n\n')}`;
    } else if (format === 'srt') {
      content = activeRecord.segments.map((seg, idx) => {
        const startSec = idx * 5;
        const endSec = (idx + 1) * 5;
        const fmtTime = (s: number) => {
          const m = Math.floor(s / 60).toString().padStart(2, '0');
          const sec = (s % 60).toString().padStart(2, '0');
          return `00:${m}:${sec},000`;
        };
        return `${idx + 1}\n${fmtTime(startSec)} --> ${fmtTime(endSec)}\n${seg.speaker}: ${seg.text}\n`;
      }).join('\n');
    } else if (format === 'json') {
      content = JSON.stringify(activeRecord, null, 2);
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Share to Aura Feed
  const handleShareToFeed = () => {
    if (!activeRecord) return;
    if (onShareToFeed) {
      onShareToFeed({
        type: 'voice',
        content: `🎙️ **Audio Transcription & Intelligence Dispatch**: "${activeRecord.title}"\n\n📌 **Summary**: ${activeRecord.summary}\n\n📝 **Key Takeaways**:\n${activeRecord.keyTakeaways.map(k => `• ${k}`).join('\n')}`,
        voiceUrl: activeRecord.audioBlobUrl,
        voiceDuration: activeRecord.durationSeconds,
        isAiPost: true,
        aiModel: 'Gemini 2.5 Multimodal Speech Core',
        aiQualityTier: 'Ultra HD 1080p',
        aiCapabilities: ['Acoustic Transcription', 'Summary Extraction', 'Action Items']
      });
      setSharedFeedSuccess(true);
      setTimeout(() => setSharedFeedSuccess(false), 3000);
    } else {
      alert("Dispatched transcription report to Aura feed!");
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" id="audio-transcriber-studio">
      
      {/* Top Banner & Heading */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
                <span>AI Speech & Audio Transcription Studio</span>
                <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                  Multimodal Neural
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Live mic dictation • MP3/WAV file transcription • Speaker breakdown • Action items & summaries
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Acoustic Pipeline Online</span>
          </span>
        </div>
      </div>

      {/* Main Studio Grid: Left Input Box (5 cols) & Right Formatted Intelligence View (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE RECORDING & FILE UPLOAD (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Tab 1: Live Voice Recorder */}
          <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                Live Microphone Dictation
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-900">
                Web Audio 48kHz
              </span>
            </div>

            {/* Waveform Canvas */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={70} 
                className="w-full h-16 rounded-lg"
              />
              <div className="mt-2 flex items-center justify-between w-full text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  {isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-red-400 font-bold">RECORDING</span>
                    </>
                  ) : (
                    <span>Ready to record</span>
                  )}
                </span>
                <span className="text-cyan-300 font-bold font-mono text-sm">
                  {formatTime(recordingSeconds)}
                </span>
              </div>
            </div>

            {/* Realtime Live Speech Captions */}
            {isRecording && (
              <div className="p-3 bg-slate-950/90 border border-cyan-500/30 rounded-xl space-y-1 animate-fadeIn">
                <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-spin" />
                  Live Interim Transcription:
                </span>
                <p className="text-xs text-slate-200 font-sans italic line-clamp-3">
                  {interimSpeechText || "Speak clearly into your microphone..."}
                </p>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4 text-cyan-200" />
                  <span>Start Live Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStopAndTranscribe}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" />
                    <span>Stop & Transcribe</span>
                  </button>

                  <button
                    onClick={handleTogglePause}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleCancelRecording}
                    className="py-2.5 px-3 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 rounded-xl font-mono text-xs transition"
                    title="Cancel Recording"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab 2: Audio File Upload & Drop */}
          <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-purple-400" />
                Upload Audio File (MP3, WAV, M4A, OGG)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Max 25MB</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                dragOver 
                  ? 'border-cyan-400 bg-cyan-950/20' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
              onClick={() => document.getElementById('audio-file-input')?.click()}
            >
              <input
                id="audio-file-input"
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAudioFileSelected(e.target.files[0]);
                  }
                }}
              />

              <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto mb-2">
                <FileAudio className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-200 font-sans">
                {uploadedFile ? uploadedFile.name : 'Click to select or Drag & Drop audio file'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready` : 'Supports MP3, WAV, M4A, AAC, OGG, WebM'}
              </p>
            </div>

            {uploadedFile && (
              <button
                onClick={handleTranscribeUploadedFile}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Transcribe Uploaded Audio</span>
              </button>
            )}

            {/* Status indicator when processing */}
            {isProcessing && (
              <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-center space-y-2 animate-pulse">
                <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono font-bold">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Audio with Gemini Neural Engine...</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">{statusMessage}</p>
              </div>
            )}
          </div>

          {/* Tab 3: History Drawer */}
          <div className={`p-4 rounded-2xl border shadow-xl space-y-2.5 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
          }`}>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Transcription History ({history.length})
            </h4>

            <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {history.map(item => {
                const isActive = activeRecord?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveRecord(item)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold truncate font-sans">{item.title}</div>
                      <div className="text-[9px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item.durationSeconds}s</span>
                        <span>•</span>
                        <span className="uppercase text-cyan-400">{item.language}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory(prev => prev.filter(h => h.id !== item.id));
                        if (activeRecord?.id === item.id) {
                          const rem = history.filter(h => h.id !== item.id);
                          setActiveRecord(rem[0] || null);
                        }
                      }}
                      className="text-slate-600 hover:text-red-400 p-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FORMATTED TRANSCRIPT & EXTRACTED INTELLIGENCE (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeRecord ? (
            <div className={`p-5 rounded-2xl border shadow-xl space-y-5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0A0F1D] border-slate-850'
            }`}>
              
              {/* Header with Title and Language/Sentiment Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-400" />
                    <span>{activeRecord.title}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{new Date(activeRecord.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-bold">
                      {activeRecord.language}
                    </span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-bold capitalize">
                      {activeRecord.sentiment} Sentiment
                    </span>
                  </div>
                </div>

                {/* TTS Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTts}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 border ${
                      isSpeakingTts
                        ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                    title="Read aloud transcript with speech synthesizer"
                  >
                    {isSpeakingTts ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{isSpeakingTts ? 'Stop Voice' : 'Listen'}</span>
                  </button>

                  <select
                    value={ttsSpeed}
                    onChange={e => setTtsSpeed(parseFloat(e.target.value))}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono rounded-lg px-2 py-1.5 focus:outline-none"
                    title="Playback Speed"
                  >
                    <option value="0.8">0.8x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                  </select>
                </div>
              </div>

              {/* Audio Playback Element if recorded/uploaded */}
              {activeRecord.audioBlobUrl && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">Source Audio:</span>
                  <audio 
                    src={activeRecord.audioBlobUrl} 
                    controls 
                    className="w-full h-8 outline-none"
                  />
                </div>
              )}

              {/* Executive Summary Box */}
              <div className="bg-slate-950/80 border border-cyan-500/25 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    AI Executive Summary
                  </span>
                  <button
                    onClick={() => handleCopy(activeRecord.summary, 'summary')}
                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedSection === 'summary' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {activeRecord.summary}
                </p>
              </div>

              {/* Action Items & Key Takeaways Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Action Items */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Action Items ({activeRecord.actionItems.length})
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                    {activeRecord.actionItems.map((action, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold font-mono">▸</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Takeaways */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Key Takeaways ({activeRecord.keyTakeaways.length})
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                    {activeRecord.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold font-mono">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Speaker Segments / Verbatim Timestamps */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Timestamped Speaker Breakdown
                  </span>
                  <button
                    onClick={() => handleCopy(activeRecord.transcript, 'full')}
                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedSection === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'full' ? 'Copied Transcript' : 'Copy All Text'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                  {activeRecord.segments.map((seg, idx) => (
                    <div key={idx} className="border-b border-slate-900/60 last:border-b-0 pb-2.5 last:pb-0 space-y-1">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-900">
                          {seg.time}
                        </span>
                        <span className="text-slate-400 font-semibold">{seg.speaker}:</span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans leading-relaxed pl-1">
                        {seg.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export & Dispatch Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-850 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Export:</span>
                  <button
                    onClick={() => handleExportText('txt')}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>TXT</span>
                  </button>
                  <button
                    onClick={() => handleExportText('srt')}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>SRT Subtitles</span>
                  </button>
                  <button
                    onClick={() => handleExportText('json')}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>

                <button
                  onClick={handleShareToFeed}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                >
                  {sharedFeedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>Shared to Aura Feed!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-cyan-200" />
                      <span>Share Audio Report to Feed</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-slate-800 bg-[#0A0F1D]/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto">
                <FileAudio className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Record speech or upload an audio file on the left to view full transcripts and AI summaries!
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AudioTranscriberStudio;
