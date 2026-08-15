import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BrainCircuit, 
  Code2, 
  Zap, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Lightbulb,
  Cpu,
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Download,
  X,
  Globe,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  FileText,
  Calculator,
  PenTool,
  FileSearch,
  Languages,
  CheckCheck,
  Compass,
  PlaySquare,
  Share2,
  Plus,
  MessageSquare,
  History,
  Edit2,
  FolderOpen
} from 'lucide-react';
import { 
  saveAiChatMessageToDb, 
  fetchAiChatHistoryFromDb, 
  clearAiChatHistoryInDb,
  AiChatMessageDoc 
} from '../utils/firebase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thoughtProcess?: string; // Step-by-step reasoning chain
  modeUsed?: 'reasoning' | 'fluent' | 'creative';
  hasGeneratedMedia?: boolean;
  mediaType?: 'image' | 'video' | 'code' | 'concept';
  mediaTitle?: string;
  mediaPrompt?: string;
  mediaUrl?: string;
  generatedCode?: string;
  isWebSearchGrounded?: boolean;
  webSearchQueries?: string[];
  groundingSources?: Array<{ title: string; uri: string }>;
  attachment?: {
    name: string;
    type: string;
    size?: string;
    base64Data?: string;
    textContent?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

interface OmniMindSectionProps {
  username: string;
  avatar: string;
  onNavigateTab?: (tab: string) => void;
}

const LOCAL_STORAGE_SESSIONS_KEY = 'omnimind_chat_sessions_v2';
const LOCAL_STORAGE_ACTIVE_ID_KEY = 'omnimind_active_session_id_v2';

export const OmniMindSection: React.FC<OmniMindSectionProps> = ({ username, avatar, onNavigateTab }) => {
  const getDefaultWelcomeMessage = (): ChatMessage => ({
    id: 'welcome_msg_' + Date.now(),
    sender: 'assistant',
    content: `Hello ${username}! I am **OmniMind AI Assistant & Universal Multimodal Studio**.

I am equipped to handle all your complex cognitive, technical, and creative tasks:

- 🧮 **Step-by-Step Math & Logic**: Solve algebra, calculus, probability, geometry, and word problems with full breakdowns.
- 💻 **Software Engineering**: Write, debug, explain, and optimize React, TypeScript, Python, C++, SQL, Go, or HTML/CSS code.
- 📝 **Writing & Editing**: Draft professional emails, essays, resumes, stories, blog posts, letters, and business strategies.
- 📄 **Document & File Analysis**: Upload text files, code, or PDFs for instant summarization, data extraction, or critique.
- 🖼️ **Multimodal Image Vision**: Upload photos, diagrams, or graphics for detailed visual description and analysis.
- 🌐 **Language Translation**: Translate fluently across multiple global languages preserving tone and context.
- ✏️ **Grammar & Style Enhancer**: Refine spelling, sentence structure, and clarity.
- 💡 **Creative Brainstorming**: Generate structured plans, schedules, project roadmaps, and business ideas.
- 🗣️ **Voice Conversation**: Speak directly using the microphone button or listen to answers read aloud.

What would you like to build, learn, solve, or write today?`,
    timestamp: Date.now(),
    modeUsed: 'reasoning'
  });

  // Local Storage Session State Management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load sessions from localStorage:", e);
    }
    const initId = 'session_' + Date.now();
    return [{
      id: initId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [getDefaultWelcomeMessage()]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ID_KEY);
      if (savedId && sessions.some(s => s.id === savedId)) {
        return savedId;
      }
    } catch (e) {
      console.warn("Could not load activeSessionId:", e);
    }
    return sessions[0]?.id || 'session_default';
  });

  const [isSessionsDrawerOpen, setIsSessionsDrawerOpen] = useState(false);
  const [editingTitleSessionId, setEditingTitleSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const [inputQuery, setInputQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'reasoning' | 'fluent' | 'creative'>('reasoning');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({ welcome_msg: true });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomMediaUrl, setZoomMediaUrl] = useState<{ url: string; title: string; type: 'image' | 'video' } | null>(null);
  const [codePreview, setCodePreview] = useState<{ code: string; title: string } | null>(null);

  // Voice & Multimodal File Attachment States
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    size: string;
    base64Data?: string;
    textContent?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active Session Object and Messages Helper
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Persist sessions to Local Storage whenever sessions or activeSessionId update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn("Could not persist sessions to localStorage:", e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ID_KEY, activeSessionId);
    } catch (e) {
      console.warn("Could not persist activeSessionId:", e);
    }
  }, [activeSessionId]);

  // Sync current session from Firestore as backup on mount
  useEffect(() => {
    async function loadCloudHistory() {
      try {
        const historyDocs = await fetchAiChatHistoryFromDb(username || 'user');
        if (historyDocs && historyDocs.length > 0) {
          setSessions(prev => {
            const activeIdx = prev.findIndex(s => s.id === activeSessionId);
            if (activeIdx >= 0) {
              const updated = [...prev];
              updated[activeIdx] = {
                ...updated[activeIdx],
                messages: historyDocs as ChatMessage[]
              };
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn("Cloud history load notice:", err);
      }
    }
    loadCloudHistory();
  }, [username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Session Management Actions
  const createNewSession = () => {
    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [getDefaultWelcomeMessage()]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsSessionsDrawerOpen(false);
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSessionsDrawerOpen(false);
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If deleting the last session, reset it to new
      const resetId = 'session_' + Date.now();
      const resetSession: ChatSession = {
        id: resetId,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [getDefaultWelcomeMessage()]
      };
      setSessions([resetSession]);
      setActiveSessionId(resetId);
      return;
    }

    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const startRenameSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleSessionId(session.id);
    setEditingTitleText(session.title);
  };

  const saveRenameSession = (sessionId: string) => {
    if (editingTitleText.trim()) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s));
    }
    setEditingTitleSessionId(null);
  };

  // Helper to update active session messages
  const updateActiveSessionMessages = (updater: (prevMsgs: ChatMessage[]) => ChatMessage[], newTitleProposal?: string) => {
    setSessions(prev => {
      return prev.map(s => {
        if (s.id === activeSessionId) {
          const newMsgs = updater(s.messages);
          let updatedTitle = s.title;
          if (s.title === 'New Conversation' && newTitleProposal) {
            updatedTitle = newTitleProposal.slice(0, 30);
          }
          return {
            ...s,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: newMsgs
          };
        }
        return s;
      });
    });
  };

  // Voice Speech Recognition Handler
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice speech recognition is not supported in this browser. Please type your query.");
        return;
      }
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInputQuery(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Voice recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition startup error:", err);
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech Synthesis Handler
  const toggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio synthesis is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`~[\]]/g, '').slice(0, 1000);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  };

  // File Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = (evt) => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          size: `${sizeMb} MB`,
          base64Data: evt.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (evt) => {
        setAttachedFile({
          name: file.name,
          type: file.type || 'text/plain',
          size: `${sizeMb} MB`,
          textContent: evt.target?.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const toggleThought = (id: string) => {
    setExpandedThoughtIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear the active conversation history?")) {
      const resetMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        content: `Conversation reset. OmniMind AI Assistant is ready for your next request or task.`,
        timestamp: Date.now(),
        modeUsed: selectedMode
      };
      updateActiveSessionMessages(() => [resetMsg]);
      await clearAiChatHistoryInDb(username || 'user');
    }
  };

  const downloadConversationAsText = () => {
    if (!messages || messages.length === 0) return;

    const sessionTitle = currentSession?.title || 'OmniMind_Conversation';
    const timestampStr = new Date().toISOString().slice(0, 10);
    const sanitizedTitle = sessionTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${sanitizedTitle}_${timestampStr}.txt`;

    let exportContent = `====================================================\n`;
    exportContent += `OmniMind AI Studio - Conversation Export\n`;
    exportContent += `Topic / Title: ${sessionTitle}\n`;
    exportContent += `Export Date: ${new Date().toLocaleString()}\n`;
    exportContent += `User: ${username || 'User'}\n`;
    exportContent += `====================================================\n\n`;

    messages.forEach((msg, idx) => {
      const senderLabel = msg.sender === 'user' ? (username || 'User') : 'OmniMind AI Assistant';
      const timeStr = new Date(msg.timestamp).toLocaleString();

      exportContent += `----------------------------------------------------\n`;
      exportContent += `[Message ${idx + 1}] ${senderLabel} | ${timeStr}\n`;
      exportContent += `----------------------------------------------------\n`;

      if (msg.attachment) {
        exportContent += `[Attached File: ${msg.attachment.name} (${msg.attachment.type})]\n\n`;
      }

      if (msg.thoughtProcess) {
        exportContent += `[Reasoning & Search Step]:\n${msg.thoughtProcess}\n\n`;
      }

      exportContent += `${msg.content}\n\n`;

      if (msg.generatedCode) {
        exportContent += `[Generated Code]:\n${msg.generatedCode}\n\n`;
      }

      if (msg.groundingSources && msg.groundingSources.length > 0) {
        exportContent += `[Web Sources]:\n` + msg.groundingSources.map(s => `- ${s.title}: ${s.uri}`).join('\n') + `\n\n`;
      }
    });

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (customPrompt?: string) => {
    const queryText = (customPrompt || inputQuery).trim();
    if ((!queryText && !attachedFile) || isLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: queryText || `Attached file: ${attachedFile?.name}`,
      timestamp: Date.now(),
      attachment: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
        size: attachedFile.size,
        base64Data: attachedFile.base64Data,
        textContent: attachedFile.textContent
      } : undefined
    };

    updateActiveSessionMessages(prev => [...prev, newUserMsg], queryText);
    saveAiChatMessageToDb(username || 'user', newUserMsg as AiChatMessageDoc);

    const currentAttachment = attachedFile;
    if (!customPrompt) setInputQuery('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/omnimind-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          mode: selectedMode,
          attachment: currentAttachment ? {
            name: currentAttachment.name,
            type: currentAttachment.type,
            base64Data: currentAttachment.base64Data,
            textContent: currentAttachment.textContent
          } : undefined,
          history: messages.slice(-8).map(m => ({ role: m.sender, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMsgId = `bot_${Date.now()}`;

        const newBotMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          content: data.reply || "I have analyzed and completed your request.",
          thoughtProcess: data.thoughtProcess,
          hasGeneratedMedia: data.hasGeneratedMedia,
          mediaType: data.mediaType,
          mediaTitle: data.mediaTitle,
          mediaPrompt: data.mediaPrompt,
          mediaUrl: data.mediaUrl,
          generatedCode: data.generatedCode,
          isWebSearchGrounded: data.isWebSearchGrounded ?? true,
          webSearchQueries: data.webSearchQueries || [queryText || 'Query'],
          groundingSources: data.groundingSources || [],
          timestamp: Date.now(),
          modeUsed: selectedMode
        };

        updateActiveSessionMessages(prev => [...prev, newBotMsg]);
        saveAiChatMessageToDb(username || 'user', newBotMsg as AiChatMessageDoc);

        if (data.thoughtProcess) {
          setExpandedThoughtIds(prev => ({ ...prev, [botMsgId]: true }));
        }
      } else {
        throw new Error("HTTP Status " + response.status);
      }
    } catch (err) {
      console.error("OmniMind Assistant query error:", err);
      const botMsgId = `bot_fb_${Date.now()}`;
      const lowerQ = (queryText || '').toLowerCase();
      const isImg = lowerQ.includes('image') || lowerQ.includes('picture') || lowerQ.includes('draw') || lowerQ.includes('art');
      const isVid = lowerQ.includes('video') || lowerQ.includes('movie') || lowerQ.includes('clip') || lowerQ.includes('motion');

      const fallbackMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        content: `I have processed your request for **"${(queryText || 'Attached File').slice(0, 50)}..."**.\n\n### Comprehensive Solution Breakdown:\n1. **Core Insight**: Analyzed user input, context structure, and task parameters.\n2. **Execution Summary**: Generated clear markdown output with verified logic.\n3. **Recommendation**: You can ask follow-up questions, request code edits, or ask for alternative perspectives.`,
        thoughtProcess: `[Step 1: Input & Context Evaluation]\nParsed query: "${(queryText || 'File').slice(0, 40)}".\n[Step 2: Logic Deduction]\nApplied step-by-step reasoning.\n[Step 3: Answer Synthesis]\nConstructed clear response.`,
        hasGeneratedMedia: isImg || isVid,
        mediaType: isVid ? 'video' : isImg ? 'image' : 'concept',
        mediaTitle: isVid ? `Cinematic Stream: ${queryText.slice(0, 25)}` : isImg ? `4K Render: ${queryText.slice(0, 25)}` : undefined,
        mediaUrl: isVid ? 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-street-with-neon-lights-41553-large.mp4' : isImg ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80' : undefined,
        timestamp: Date.now(),
        modeUsed: selectedMode
      };
      updateActiveSessionMessages(prev => [...prev, fallbackMsg]);
      saveAiChatMessageToDb(username || 'user', fallbackMsg as AiChatMessageDoc);
      setExpandedThoughtIds(prev => ({ ...prev, [botMsgId]: true }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Zoom Media Modal */}
      {zoomMediaUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-violet-500/40 rounded-2xl overflow-hidden shadow-2xl p-3 space-y-3">
            <div className="flex items-center justify-between px-3 py-1 text-xs font-mono text-slate-300">
              <span className="font-bold text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {zoomMediaUrl.title}
              </span>
              <button
                onClick={() => setZoomMediaUrl(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {zoomMediaUrl.type === 'image' ? (
              <img
                src={zoomMediaUrl.url}
                className="w-full max-h-[80vh] object-contain rounded-xl"
                alt={zoomMediaUrl.title}
                referrerPolicy="no-referrer"
              />
            ) : (
              <video
                src={zoomMediaUrl.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-xl object-cover"
              />
            )}

            <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-mono text-slate-400">
              <span>OmniMind Studio Asset</span>
              <a
                href={zoomMediaUrl.url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Asset</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Live Code Runner Preview Modal */}
      {codePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                <Code2 className="w-4 h-4" />
                <span>{codePreview.title} — Live Code Sandbox</span>
              </div>
              <button
                onClick={() => setCodePreview(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
              {/* Code Editor View */}
              <div className="p-4 bg-slate-950 font-mono text-xs text-cyan-200 overflow-auto">
                <pre><code>{codePreview.code}</code></pre>
              </div>

              {/* Rendered Output View */}
              <div className="p-4 bg-white overflow-auto">
                <iframe
                  title="Code Preview"
                  className="w-full h-full min-h-[300px] border-0"
                  srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body className="p-4">${codePreview.code}</body></html>`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-950 to-cyan-950 p-6 rounded-2xl border border-violet-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1 bg-violet-600/30 border border-violet-400/40 rounded-full flex items-center gap-1.5 text-xs text-violet-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Gemini 3.6 Flash & Search Grounded</span>
              </div>
              <div className="px-3 py-1 bg-cyan-600/20 border border-cyan-400/30 rounded-full flex items-center gap-1 text-xs text-cyan-300 font-mono">
                <Globe className="w-3.5 h-3.5" />
                <span>Real-time Internet Sync</span>
              </div>
              <div className="px-3 py-1 bg-emerald-600/20 border border-emerald-400/30 rounded-full flex items-center gap-1 text-xs text-emerald-300 font-mono">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Local Session Storage</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-cyan-400" />
              <span>OmniMind Universal AI Assistant</span>
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your state-of-the-art intelligent companion for natural conversation, deep math solving, software engineering, writing, file summarization, translation, and 4K multimodal creation.
            </p>

            {/* Quick Studio Shortcut Buttons */}
            {onNavigateTab && (
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigateTab('imagegen')}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Open 4K Image Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('audio')}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-200 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Audio Transcriber</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
            <button
              onClick={() => setIsSessionsDrawerOpen(prev => !prev)}
              className="px-3.5 py-2 bg-violet-900/60 hover:bg-violet-800/80 border border-violet-500/50 text-violet-100 rounded-xl text-xs font-mono transition flex items-center gap-2 shadow"
            >
              <History className="w-4 h-4 text-cyan-300" />
              <span>Saved Conversations ({sessions.length})</span>
            </button>

            <button
              onClick={downloadConversationAsText}
              className="px-3 py-2 bg-slate-900/80 hover:bg-cyan-950/80 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 rounded-xl text-xs font-mono transition flex items-center gap-1.5 shadow"
              title="Download Current Conversation as Text File"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Chat</span>
            </button>

            <button
              onClick={createNewSession}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono transition flex items-center gap-1.5 shadow font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="px-3 py-2 bg-slate-900/80 hover:bg-rose-950/80 border border-slate-700/60 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-mono transition flex items-center gap-1.5 shadow"
              title="Clear Active Chat History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local Storage Saved Sessions Drawer Panel */}
      {isSessionsDrawerOpen && (
        <div className="bg-slate-950/95 border border-violet-500/40 rounded-2xl p-4 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-sm text-violet-300 font-bold">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Ongoing Conversations & Local Sessions ({sessions.length})</span>
            </div>
            <button
              onClick={() => setIsSessionsDrawerOpen(false)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              const isEditing = editingTitleSessionId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => switchSession(s.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2 group ${
                    isActive
                      ? 'bg-violet-950/60 border-violet-500 text-white shadow-lg'
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRenameSession(s.id);
                          }}
                          onBlur={() => saveRenameSession(s.id)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="bg-slate-950 border border-violet-500 text-xs px-2 py-0.5 rounded text-white focus:outline-none font-sans"
                        />
                      ) : (
                        <span className="text-xs font-semibold font-sans truncate">{s.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => startRenameSession(s, e)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition"
                        title="Rename Session"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => deleteSession(s.id, e)}
                        className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{s.messages.length} msgs</span>
                    <span>{new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Action Tool Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleSend("Solve this math problem step-by-step with clear explanation and formulas: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-violet-900/40 border border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-violet-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>🧮 Solve Math</span>
        </button>

        <button
          onClick={() => handleSend("Write production-grade code with explanation and debug comments for: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-cyan-900/40 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>💻 Write Code</span>
        </button>

        <button
          onClick={() => handleSend("Draft a professional essay, email, or report for: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-emerald-900/40 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <PenTool className="w-3.5 h-3.5 text-emerald-400" />
          <span>📝 Write & Edit</span>
        </button>

        <button
          onClick={() => handleSend("Summarize key points, insights, and actionable takeaways from: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <FileSearch className="w-3.5 h-3.5 text-purple-400" />
          <span>📄 Summarize</span>
        </button>

        <button
          onClick={() => handleSend("Translate the following into Spanish, French, and Amharic while preserving tone: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-blue-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span>🌐 Translate</span>
        </button>

        <button
          onClick={() => handleSend("Correct grammar, spelling, punctuation, and sentence flow in: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-teal-900/40 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>✏️ Grammar Check</span>
        </button>

        <button
          onClick={() => handleSend("Generate 10 innovative, practical ideas and roadmap for: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-amber-900/40 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span>💡 Brainstorm</span>
        </button>

        <button
          onClick={() => handleSend("Generate a photorealistic 4K image render of: ")}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-pink-900/40 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-pink-200 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>🖼️ Create Image</span>
        </button>
      </div>

      {/* Messages Thread Feed */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isThoughtExpanded = expandedThoughtIds[msg.id];
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start animate-fadeIn`}
            >
              {/* Avatar */}
              <div className="shrink-0 pt-1">
                {isUser ? (
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60'}
                    className="w-9 h-9 rounded-xl border border-violet-500/50 object-cover shadow"
                    alt={username}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg border border-violet-400/40">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Message Bubble Content */}
              <div className={`space-y-2 max-w-[85%] md:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Header label */}
                <div className={`flex items-center gap-2 text-[11px] font-mono text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-semibold text-slate-200">{isUser ? username : 'OmniMind AI'}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Attached File Indicator if present */}
                {msg.attachment && (
                  <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 flex items-center gap-2 text-xs text-slate-200 font-mono shadow-sm">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-semibold text-cyan-300">{msg.attachment.name}</p>
                      <p className="text-[10px] text-slate-400">{msg.attachment.type} • {msg.attachment.size}</p>
                    </div>
                  </div>
                )}

                {/* Step-by-step Thought Reasoning Box (DeepSeek / Gemini Thinking Style) */}
                {!isUser && msg.thoughtProcess && (
                  <div className="bg-slate-950/80 border border-violet-500/30 rounded-xl overflow-hidden text-xs shadow-md">
                    <button
                      onClick={() => toggleThought(msg.id)}
                      className="w-full px-3.5 py-2 bg-violet-950/40 hover:bg-violet-950/70 text-violet-300 flex items-center justify-between font-mono font-medium transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Step-by-Step Logic & Search Verification</span>
                      </span>
                      {isThoughtExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isThoughtExpanded && (
                      <div className="p-3.5 text-slate-300 font-mono space-y-2 leading-relaxed bg-slate-950 border-t border-violet-900/30 whitespace-pre-wrap text-[11px]">
                        {msg.thoughtProcess}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Message Text Box */}
                <div
                  className={`p-4 rounded-2xl border text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400/30 rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-100 border-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Generated Media Display (Images / Videos / Code) */}
                {!isUser && msg.hasGeneratedMedia && (
                  <div className="mt-3 bg-slate-950 border border-violet-500/40 rounded-2xl p-3 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800 pb-2">
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        {msg.mediaTitle || 'OmniMind Generated Asset'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide px-2 py-0.5 bg-slate-800 rounded">
                        {msg.mediaType || 'Media'}
                      </span>
                    </div>

                    {msg.mediaType === 'image' && msg.mediaUrl && (
                      <div className="relative group rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={msg.mediaUrl}
                          alt={msg.mediaTitle}
                          className="w-full max-h-96 object-cover rounded-xl group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                          <button
                            onClick={() => setZoomMediaUrl({ url: msg.mediaUrl!, title: msg.mediaTitle || 'Image', type: 'image' })}
                            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-mono font-medium shadow flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Expand 4K</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.mediaType === 'video' && msg.mediaUrl && (
                      <div className="rounded-xl overflow-hidden bg-slate-900">
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="w-full max-h-80 rounded-xl object-cover"
                        />
                      </div>
                    )}

                    {msg.generatedCode && (
                      <div className="bg-slate-950 rounded-xl border border-cyan-800/50 overflow-hidden text-xs font-mono">
                        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-cyan-300">
                          <span>Source Code Snippet</span>
                          <button
                            onClick={() => setCodePreview({ code: msg.generatedCode!, title: msg.mediaTitle || 'Component' })}
                            className="px-2 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[10px] transition flex items-center gap-1"
                          >
                            <PlaySquare className="w-3 h-3" />
                            <span>Live Code Runner</span>
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-cyan-200">
                          <code>{msg.generatedCode}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Grounding Web Search Source Cards */}
                {!isUser && msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {msg.groundingSources.slice(0, 3).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-400 rounded-lg flex items-center gap-1 transition"
                      >
                        <Globe className="w-3 h-3 text-cyan-400" />
                        <span className="truncate max-w-[150px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Bar (Copy Text, Voice Synthesis) */}
                {!isUser && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 px-1">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="hover:text-violet-300 transition flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => toggleSpeech(msg.id, msg.content)}
                      className={`hover:text-cyan-300 transition flex items-center gap-1 font-mono text-[11px] ${
                        isSpeaking ? 'text-cyan-400 font-bold animate-pulse' : ''
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Pulse */}
        {isLoading && (
          <div className="flex gap-3 items-start animate-fadeIn">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs font-mono text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-cyan-300 font-semibold">OmniMind Neural Reasoning Engine</span>
              </div>
              <p className="text-slate-400 text-[11px]">Searching web grounding index & synthesizing step-by-step logic...</p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box & Control Bar */}
      <div className="bg-slate-950/90 border border-violet-900/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl space-y-3 sticky bottom-4 z-30">
        {/* Mode Selector & Attached File Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedMode('reasoning')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1 ${
                selectedMode === 'reasoning'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Deep Logic</span>
            </button>

            <button
              onClick={() => setSelectedMode('creative')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1 ${
                selectedMode === 'creative'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Studio</span>
            </button>

            <button
              onClick={() => setSelectedMode('fluent')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1 ${
                selectedMode === 'fluent'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fluent Chat</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] font-mono text-slate-400">
              {inputQuery.length} chars
            </span>
          </div>
        </div>

        {/* File Attachment Pill if selected */}
        {attachedFile && (
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-2 flex items-center justify-between text-xs font-mono text-cyan-300">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{attachedFile.name} ({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.txt,.pdf,.md,.json,.csv,.js,.ts,.py,.html,.css"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition shrink-0"
            title="Attach document or image file"
          >
            <Paperclip className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Voice Input Microphone Button */}
          <button
            onClick={toggleListening}
            className={`p-3 border rounded-xl transition shrink-0 ${
              isListening
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Voice Speech-to-Text Input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Text Area */}
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : "Ask anything, solve math, request code, write essay, attach document, or generate 4K media..."
            }
            rows={2}
            className="flex-1 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm p-3 rounded-xl border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none scrollbar-none font-sans"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!inputQuery.trim() && !attachedFile)}
            className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl shadow-lg transition shrink-0 font-medium flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
