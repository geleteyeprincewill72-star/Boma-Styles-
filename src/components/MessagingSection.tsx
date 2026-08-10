import React, { useState, useEffect, useRef } from 'react';
import { 
  db, 
  auth, 
  sendMessage, 
  listenToChats, 
  listenToMessages, 
  updateTypingState, 
  reactToMessage, 
  createChatRoom,
  uploadFileToStorage,
  createReport,
  fetchUsersList,
  UserProfile,
  ChatRoom,
  ChatMessage
} from '../utils/firebase';
import { 
  encryptMessageE2E, 
  decryptMessageE2E, 
  generateE2EFingerprint 
} from '../utils/crypto';
import { 
  sanitizeInput, 
  detectMaliciousPayload, 
  checkRateLimit, 
  checkIsBanned, 
  logSecurityEvent 
} from '../utils/security';
import { 
  estimateActionCost, 
  recordDataUsage 
} from '../utils/monetization';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Trash2, 
  Edit, 
  CornerUpLeft, 
  Search, 
  Plus, 
  ShieldAlert, 
  CheckCheck, 
  Check, 
  Users,
  Eye,
  AlertTriangle,
  UserX,
  Volume2,
  Lock,
  ShieldCheck,
  Key
} from 'lucide-react';

interface MessagingSectionProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
}

// Helper component to render and decrypt E2EE text on device
function E2EEMessageText({ encryptedText, roomKey }: { encryptedText: string; roomKey: string }) {
  const [decryptedText, setDecryptedText] = useState<string>('Decrypting on device...');
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (encryptedText.startsWith('[E2EE-AES256-GCM]:')) {
      setIsEncrypted(true);
      decryptMessageE2E(encryptedText, roomKey).then(dec => {
        if (isMounted) setDecryptedText(dec);
      });
    } else {
      setIsEncrypted(false);
      setDecryptedText(encryptedText);
    }
    return () => { isMounted = false; };
  }, [encryptedText, roomKey]);

  return (
    <div className="space-y-0.5">
      {isEncrypted && (
        <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
          <Lock className="w-2.5 h-2.5 text-emerald-400" />
          <span>E2E Decrypted</span>
        </div>
      )}
      <p className="text-xs leading-relaxed break-words font-sans text-slate-200">{decryptedText}</p>
    </div>
  );
}

export default function MessagingSection({ 
  currentUserId, 
  currentUserName, 
  currentUserAvatar 
}: MessagingSectionProps) {
  // Chat rooms lists and selection
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  
  // Input fields
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // New Chat Dialog
  const [showNewChat, setShowNewChat] = useState(false);
  const [peers, setPeers] = useState<UserProfile[]>([]);
  const [newChatType, setNewChatType] = useState<'private' | 'circle'>('private');
  const [newChatName, setNewChatName] = useState('');
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [newChatSearch, setNewChatSearch] = useState('');

  // Media Attachment simulator
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice Note recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Message operational states
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [showPeerOptions, setShowPeerOptions] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const cached = localStorage.getItem('omnisphere_blocked_users');
    return cached ? JSON.parse(cached) : [];
  });

  // Load chat rooms of current user
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = listenToChats(currentUserId, (loadedRooms) => {
      // Filter out chats with fully blocked users
      const activeRooms = loadedRooms.filter(room => {
        if (room.type === 'private') {
          const otherUser = room.members.find(m => m !== currentUserId);
          return !otherUser || !blockedUsers.includes(otherUser);
        }
        return true;
      });
      setRooms(activeRooms);
    });
    return () => unsubscribe();
  }, [currentUserId, blockedUsers]);

  // Load messages of selected room
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }
    const unsubscribe = listenToMessages(selectedRoom.id, (loadedMessages) => {
      setMessages(loadedMessages);
    });
    return () => unsubscribe();
  }, [selectedRoom]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch registered peers for start chat dialog
  useEffect(() => {
    const loadPeers = async () => {
      const users = await fetchUsersList();
      // Exclude self and blocked peers
      const filtered = users.filter(u => u.uid !== currentUserId && !blockedUsers.includes(u.uid));
      setPeers(filtered);
    };
    if (showNewChat) {
      loadPeers();
    }
  }, [showNewChat, currentUserId, blockedUsers]);

  // Typing indicator debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (!selectedRoom) return;

    if (!typing) {
      setTyping(true);
      updateTypingState(selectedRoom.id, currentUserId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      updateTypingState(selectedRoom.id, currentUserId, false);
    }, 1500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    if (!inputText.trim() && !replyingTo) return;

    // 1. Check if user account or device is banned
    const banCheck = checkIsBanned(currentUserId);
    if (banCheck.banned) {
      alert(`Access Restricted: ${banCheck.reason}`);
      return;
    }

    // 2. Check Rate Limit (25 messages / minute)
    const rateCheck = checkRateLimit('send_message', 25, 60000);
    if (!rateCheck.allowed) {
      alert("Security Notice: Message rate limit reached. Please wait a few seconds before sending another message.");
      return;
    }

    const rawText = inputText.trim();

    // 3. Security Payload Analysis (SQLi & XSS Detection)
    const payloadCheck = detectMaliciousPayload(rawText);
    if (payloadCheck.isMalicious) {
      logSecurityEvent({
        type: payloadCheck.type === 'SQLI' ? 'SQLI_ATTEMPT' : 'XSS_ATTEMPT',
        severity: 'high',
        details: `Malicious payload intercepted in message text: "${rawText.slice(0, 50)}..."`,
        userId: currentUserId,
        actionTaken: 'BLOCKED'
      });
      alert("Security Guard: Your message contains forbidden code characters or SQL keywords and was blocked.");
      return;
    }

    // Sanitize input text
    const textToSend = sanitizeInput(rawText);
    const replyId = replyingTo?.id;
    const replyText = replyingTo?.text;

    setInputText('');
    setReplyingTo(null);
    setEditingMessage(null);

    // Stop typing state immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
    updateTypingState(selectedRoom.id, currentUserId, false);

    // 4. Record Configurable Data Usage Monetization Ledger Record
    recordDataUsage(currentUserId, currentUserName, 'text_message');

    // End-to-End Encryption: Encrypt message client-side on sender device
    const e2eRoomKey = `e2ee_room_${selectedRoom.id}`;
    const encryptedText = await encryptMessageE2E(textToSend, e2eRoomKey);

    await sendMessage(selectedRoom.id, {
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      text: encryptedText,
      replyToId: replyId,
      replyToText: replyText
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;

    setUploading(true);
    setUploadProgress(10);
    
    try {
      // Compress/simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      const filePath = `chats/${selectedRoom.id}/${Date.now()}_${file.name}`;
      const url = await uploadFileToStorage(file, filePath);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Determine mediaType
      let mediaType: 'image' | 'video' | 'voice' | 'file' = 'file';
      if (file.type.startsWith('image/')) mediaType = 'image';
      else if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type.startsWith('audio/')) mediaType = 'voice';

      await sendMessage(selectedRoom.id, {
        senderId: currentUserId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: `Shared a ${mediaType}: ${file.name}`,
        mediaUrl: url,
        mediaType: mediaType
      });

    } catch (err) {
      console.error(err);
      alert("Attachment transit failed. Check node storage allocations.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Cleanup recording timer and streams on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVoiceRecording = async () => {
    if (!selectedRoom) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access failed:", err);
      alert("Microphone permission denied or audio recording device unavailable.");
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const stopAndSendVoiceRecording = async () => {
    if (!selectedRoom || !mediaRecorderRef.current) return;

    setIsProcessingVoice(true);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const duration = recordingDuration;

    const audioBlob = await new Promise<Blob>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        resolve(blob);
      };
      recorder.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    });

    setIsRecording(false);
    setRecordingDuration(0);

    if (!audioBlob || audioBlob.size === 0) {
      setIsProcessingVoice(false);
      return;
    }

    try {
      const filename = `voice_note_${Date.now()}.${audioBlob.type.includes('mp4') ? 'mp4' : 'webm'}`;
      const voiceFile = new File([audioBlob], filename, { type: audioBlob.type });

      let mediaUrl = '';
      try {
        const filePath = `chats/${selectedRoom.id}/voice/${Date.now()}_${filename}`;
        mediaUrl = await uploadFileToStorage(voiceFile, filePath);
      } catch (uploadErr) {
        console.warn("Storage upload fallback to DataURL for voice note:", uploadErr);
        mediaUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });
      }

      const e2eRoomKey = `e2ee_room_${selectedRoom.id}`;
      const textNotice = `🎤 Encrypted Voice Note (${formatDuration(duration)})`;
      const encryptedText = await encryptMessageE2E(textNotice, e2eRoomKey);

      await sendMessage(selectedRoom.id, {
        senderId: currentUserId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar,
        text: encryptedText,
        mediaUrl: mediaUrl,
        mediaType: 'voice'
      });
    } catch (err) {
      console.error("Failed to send voice note:", err);
      alert("Voice note transmission failed. Please try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleBlockUser = (peerId: string) => {
    if (confirm("Block this user? You will not receive any further messages from them.")) {
      const nextList = [...blockedUsers, peerId];
      setBlockedUsers(nextList);
      localStorage.setItem('omnisphere_blocked_users', JSON.stringify(nextList));
      setSelectedRoom(null);
    }
  };

  const handleReportMessage = async (msg: ChatMessage) => {
    const reason = prompt("Enter reason for reporting this chat message:");
    if (!reason) return;

    await createReport({
      reporterId: currentUserId,
      reporterName: currentUserName,
      reportedType: 'comment',
      reportedId: msg.id,
      reason: reason,
      contentSnippet: `Message: "${msg.text}" by ${msg.senderName}`
    });
    alert("Telemetry dispatch complete. Admin nodes will investigate.");
  };

  const handleCreateChat = async () => {
    if (newChatType === 'private') {
      if (selectedPeers.length !== 1) {
        alert("Please select exactly one peer to link keys.");
        return;
      }
      const existing = rooms.find(r => r.type === 'private' && r.members.includes(selectedPeers[0]));
      if (existing) {
        setSelectedRoom(existing);
        setShowNewChat(false);
        return;
      }
      const id = await createChatRoom('private', [currentUserId, selectedPeers[0]]);
      setShowNewChat(false);
    } else {
      if (!newChatName.trim()) {
        alert("Circle requires a label.");
        return;
      }
      const id = await createChatRoom('circle', [currentUserId, ...selectedPeers], newChatName.trim());
      setShowNewChat(false);
    }
    setSelectedPeers([]);
    setNewChatName('');
  };

  return (
    <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl grid grid-cols-1 md:grid-cols-12 min-h-[620px] shadow-2xl relative font-sans text-slate-200 overflow-hidden" id="messaging-hub">
      
      {/* LEFT CHATS DIRECTORY (4 columns) */}
      <div className="md:col-span-4 border-r border-slate-900/80 flex flex-col h-[620px] bg-[#080C16]">
        
        {/* Search & Action header */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between gap-2 bg-[#0A0F1D]">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Active Links
          </h3>
          <button 
            onClick={() => setShowNewChat(true)}
            className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-400 transition"
            title="Start new encrypted link"
            id="start-chat-btn"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Chats Input */}
        <div className="px-4 py-2 bg-slate-950/30 border-b border-slate-900 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-7 top-4" />
          <input
            type="text"
            placeholder="Search active channels..."
            value={chatSearch}
            onChange={e => setChatSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-900/60 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-300 placeholder-slate-600 font-sans"
          />
        </div>

        {/* Chats Rooms List */}
        <div className="flex-grow overflow-y-auto space-y-1 p-2" id="rooms-list">
          {rooms.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-500 font-mono text-xs">
              No active sovereign lines. Tap '+' to discover peer nodes.
            </div>
          ) : (
            rooms
              .filter(r => {
                if (r.type === 'circle') return (r.name || '').toLowerCase().includes(chatSearch.toLowerCase());
                return true; // Simple display of private chats
              })
              .map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const otherMemberId = room.members.find(m => m !== currentUserId);
                const typingPeers = Object.entries(room.typing || {})
                  .filter(([uid, isTyping]) => uid !== currentUserId && isTyping)
                  .map(([uid]) => uid);
                
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      setReplyingTo(null);
                      setEditingMessage(null);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition text-left ${
                      isSelected 
                        ? 'bg-slate-900/80 border border-slate-800/80' 
                        : 'hover:bg-slate-950/40 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      {room.type === 'circle' ? (
                        <div className="w-9 h-9 rounded-lg bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400">
                          <Users className="w-4.5 h-4.5" />
                        </div>
                      ) : (
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${otherMemberId || 'mesh'}`}
                          className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-900 object-cover" 
                          alt="" 
                        />
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080C16]"></span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate font-mono">
                          {room.type === 'circle' ? room.name : `@peer_${otherMemberId?.slice(0, 5)}`}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      
                      {typingPeers.length > 0 ? (
                        <span className="text-[10px] text-cyan-400 font-mono animate-pulse block truncate">
                          typing...
                        </span>
                      ) : (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans leading-snug">
                          {room.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* RIGHT MESSAGE PORTAL (8 columns) */}
      <div className="md:col-span-8 flex flex-col h-[620px] bg-[#0A0F1D]">
        
        {selectedRoom ? (
          <>
            {/* Header / Meta */}
            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-[#0A0F1D]/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedRoom.type === 'circle' ? (
                    <div className="w-9 h-9 rounded-lg bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedRoom.members.find(m => m !== currentUserId) || 'mesh'}`} 
                      className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-900 object-cover" 
                      alt="" 
                    />
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0F1D]"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 font-mono">
                    {selectedRoom.type === 'circle' ? selectedRoom.name : `@peer_${selectedRoom.members.find(m => m !== currentUserId)?.slice(0, 10)}`}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                    Secure P2P Mesh Channel • Online
                  </span>
                </div>
              </div>

              {/* Action dropdown for reports / block */}
              <div className="relative">
                <button 
                  onClick={() => setShowPeerOptions(showPeerOptions ? null : selectedRoom.id)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showPeerOptions === selectedRoom.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-slate-950 border border-slate-900 rounded-lg py-1 shadow-2xl z-30 font-mono text-[10px]">
                    {selectedRoom.type === 'private' && (
                      <button 
                        onClick={() => {
                          const otherUser = selectedRoom.members.find(m => m !== currentUserId);
                          if (otherUser) handleBlockUser(otherUser);
                        }}
                        className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-slate-900 flex items-center gap-1.5 transition"
                      >
                        <UserX className="w-3.5 h-3.5" /> Block Peer
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const reason = prompt("Describe circle or channel policy violation:");
                        if (reason) {
                          createReport({
                            reporterId: currentUserId,
                            reportedType: 'user',
                            reportedId: selectedRoom.id,
                            reason: reason,
                            contentSnippet: `Channel Type: ${selectedRoom.type}`
                          });
                          alert("Channel telemetry flagged.");
                        }
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-400 hover:bg-slate-900 flex items-center gap-1.5 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Flag Channel
                    </button>
                  </div>
                )}
              </div>

              {/* End-to-End Encryption Banner */}
              <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider">End-to-End Encrypted (AES-256-GCM)</span>
                </div>
                <span className="text-slate-400 text-[9px] hidden sm:inline">
                  Zero Intermediary Access • Key FP: E2EE-{selectedRoom.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Messages Display */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#080C16]/20" id="messages-window">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                  <span className="p-3 bg-slate-950/40 rounded-full border border-slate-900 mb-2">🔒</span>
                  Sovereign mesh conversation initialized. Messages are secure.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUserId;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex items-start gap-2.5 max-w-[85%] ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`} 
                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 object-cover" 
                        alt="" 
                      />
                      
                      <div className="space-y-1">
                        {/* Sender metadata info */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="font-bold text-slate-300">{isMe ? 'You' : msg.senderName}</span>
                          <span>•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Text card balloon */}
                        <div className={`p-3 rounded-xl relative group border ${
                          isMe 
                            ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900/60 border-cyan-900/50 text-slate-200 rounded-tr-none' 
                            : 'bg-slate-950/80 border-slate-900 text-slate-300 rounded-tl-none'
                        }`}>
                          {/* Reply Quote Block */}
                          {msg.replyToText && (
                            <div className="mb-2 p-2 rounded bg-slate-950/60 border-l-2 border-cyan-400 text-[10px] text-slate-400 font-sans italic truncate">
                              Replying to: "{msg.replyToText}"
                            </div>
                          )}

                          {/* Media asset rendering */}
                          {msg.mediaUrl && (
                            <div className="mb-2.5 max-w-sm rounded-lg overflow-hidden border border-slate-900 shadow">
                              {msg.mediaType === 'image' && (
                                <img src={msg.mediaUrl} className="max-h-56 w-full object-cover" alt="Attachment" referrerPolicy="no-referrer" />
                              )}
                              {msg.mediaType === 'video' && (
                                <video src={msg.mediaUrl} controls className="max-h-56 w-full" />
                              )}
                              {msg.mediaType === 'voice' && (
                                <div className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 space-y-1.5 my-1">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                                    <div className="flex items-center gap-1.5">
                                      <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                      <span className="font-bold uppercase tracking-wider">Encrypted Voice Note</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                      E2EE Audio
                                    </span>
                                  </div>
                                  <audio src={msg.mediaUrl} controls className="w-full h-8 rounded bg-slate-900 border border-slate-800" />
                                </div>
                              )}
                              {msg.mediaType === 'file' && (
                                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-slate-950 text-[11px] text-cyan-400 font-mono hover:underline">
                                  <Paperclip className="w-4 h-4 shrink-0" />
                                  Download Asset
                                </a>
                              )}
                            </div>
                          )}

                          {/* Main Text Content (E2EE Decrypted Client-Side) */}
                          <E2EEMessageText encryptedText={msg.text} roomKey={`e2ee_room_${selectedRoom.id}`} />

                          {/* Interactive reactions container */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(msg.reactions).map(([uid, emoji]) => (
                                <span 
                                  key={uid} 
                                  className="px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-900 text-[9px] flex items-center gap-1"
                                  title={`Reacted by @peer_${uid.slice(0, 5)}`}
                                >
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Hover rapid operational commands */}
                          <div className={`absolute top-1 hidden group-hover:flex items-center gap-1 bg-slate-950 border border-slate-900 px-1.5 py-0.5 rounded-lg shadow-xl z-20 ${
                            isMe ? 'right-full mr-2' : 'left-full ml-2'
                          }`}>
                            <button 
                              onClick={() => {
                                reactToMessage(selectedRoom.id, msg.id, currentUserId, '❤️');
                              }}
                              className="p-1 text-slate-400 hover:text-red-400 text-xs transition"
                              title="React Heart"
                            >
                              ❤️
                            </button>
                            <button 
                              onClick={() => {
                                reactToMessage(selectedRoom.id, msg.id, currentUserId, '👍');
                              }}
                              className="p-1 text-slate-400 hover:text-cyan-400 text-xs transition"
                              title="React Thumbs Up"
                            >
                              👍
                            </button>
                            <button 
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 text-slate-400 hover:text-slate-200 transition"
                              title="Reply to message"
                            >
                              <CornerUpLeft className="w-3 h-3" />
                            </button>
                            {!isMe && (
                              <button 
                                onClick={() => handleReportMessage(msg)}
                                className="p-1 text-slate-400 hover:text-amber-400 transition"
                                title="Report/Flag message"
                              >
                                <ShieldAlert className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Read Receipts */}
                        {isMe && idx === messages.length - 1 && (
                          <div className="flex items-center justify-end gap-1 text-[8px] font-mono text-slate-600">
                            <span>Transmitted</span>
                            <CheckCheck className="w-3 h-3 text-cyan-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying Status banner */}
            {replyingTo && (
              <div className="p-2 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between text-xs font-mono px-4 text-slate-400">
                <span className="flex items-center gap-2">
                  <CornerUpLeft className="w-3.5 h-3.5 text-cyan-400" />
                  Replying to @{replyingTo.senderName}
                </span>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="text-[10px] hover:text-slate-200 uppercase"
                >
                  cancel
                </button>
              </div>
            )}

            {/* Media Upload Banner */}
            {uploading && (
              <div className="p-3 border-t border-slate-900 bg-slate-950 text-xs font-mono px-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 animate-pulse flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 animate-spin" />
                    Transmitting asset payload...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            {isRecording ? (
              <div className="p-4 border-t border-slate-900 bg-[#070B14] flex flex-wrap items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-red-500/20 animate-ping"></span>
                    <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow">
                      <Mic className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider animate-pulse">
                        Recording Voice Note...
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[10px] text-red-300 font-bold">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      End-to-End Encrypted Audio Stream
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    disabled={isProcessingVoice}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    title="Discard Recording"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopAndSendVoiceRecording}
                    disabled={isProcessingVoice}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/40"
                  >
                    {isProcessingVoice ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Encrypting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Voice Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-900 bg-[#0A0F1D] p-3 space-y-1.5">
                <div className="px-1 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Data usage rate: <strong className="text-emerald-400">{estimateActionCost('text_message').chargedMb} MB</strong> per message</span>
                  <span className="text-slate-600">[{estimateActionCost('text_message').baseMb} MB base + {estimateActionCost('text_message').surchargeMb} MB revenue surcharge]</span>
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="file-attachment-input"
                  />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition shrink-0"
                  title="Attach files/media"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition shrink-0 border border-cyan-900/40 shadow-sm shadow-cyan-950/30"
                  title="Record Encrypted Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Enter sovereign mesh signal..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-grow bg-slate-950 border border-slate-900 focus:border-cyan-500/80 rounded-lg px-3.5 py-2 text-xs focus:outline-none text-slate-200 placeholder-slate-600 font-mono"
                  id="message-text-input"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-slate-100 rounded-lg font-bold transition disabled:opacity-50 disabled:pointer-events-none shrink-0 shadow-md shadow-cyan-950/20"
                  id="message-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            )}
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-6 text-center font-mono text-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center mb-4 text-cyan-400 text-xl">
              🛸
            </div>
            <h4 className="text-slate-300 font-bold uppercase tracking-wider mb-2">No Sovereign Channel Selected</h4>
            <p className="max-w-xs text-slate-500 text-[11px] leading-relaxed">
              Initiate a cryptographic secure-line tunnel to synchronize with another active creation peer in Aura.
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="mt-4 px-4 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 rounded-lg text-cyan-400 font-bold transition text-[10px] tracking-wider uppercase"
            >
              Start New Link
            </button>
          </div>
        )}
      </div>

      {/* DIALOG MODEL: START NEW CHAT ROOM */}
      {showNewChat && (
        <div className="absolute inset-0 bg-[#070B13]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
            <h4 className="text-sm font-black font-mono tracking-wider text-slate-100 mb-4 uppercase">
              Establish Peer Connection
            </h4>

            {/* Room Type Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-1 rounded-lg border border-slate-900 text-center font-mono text-[10px]">
              <button
                onClick={() => setNewChatType('private')}
                className={`py-1 rounded transition ${newChatType === 'private' ? 'bg-cyan-950 border border-cyan-900/60 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🔒 PRIVATE KEY
              </button>
              <button
                onClick={() => setNewChatType('circle')}
                className={`py-1 rounded transition ${newChatType === 'circle' ? 'bg-cyan-950 border border-cyan-900/60 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ⭕ CREATOR CIRCLE
              </button>
            </div>

            {/* Circle Name input */}
            {newChatType === 'circle' && (
              <div className="mb-4">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Circle Name / Label</label>
                <input
                  type="text"
                  placeholder="Circle Name"
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Select peer list search */}
            <div className="mb-4">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Search Swarm Peers</label>
              <input
                type="text"
                placeholder="Search username..."
                value={newChatSearch}
                onChange={e => setNewChatSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>

            {/* Peers Checklist directory */}
            <div className="max-h-40 overflow-y-auto space-y-1 mb-6 border border-slate-900/80 rounded-lg p-2 bg-slate-950/40">
              {peers
                .filter(p => p.username.toLowerCase().includes(newChatSearch.toLowerCase()))
                .map(peer => {
                  const isChecked = selectedPeers.includes(peer.uid);
                  return (
                    <button
                      key={peer.uid}
                      onClick={() => {
                        if (newChatType === 'private') {
                          setSelectedPeers([peer.uid]);
                        } else {
                          setSelectedPeers(prev => 
                            isChecked ? prev.filter(uid => uid !== peer.uid) : [...prev, peer.uid]
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-900/60 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img src={peer.avatar} className="w-5.5 h-5.5 rounded bg-slate-950" alt="" />
                        <div className="text-[10px] font-mono leading-tight">
                          <span className="font-bold text-slate-300 block">@{peer.username}</span>
                          <span className="text-slate-500">{peer.displayName}</span>
                        </div>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded border border-slate-700 flex items-center justify-center ${
                        isChecked ? 'bg-cyan-500 border-cyan-400' : ''
                      }`}>
                        {isChecked && <span className="text-[8px] text-slate-950">✓</span>}
                      </div>
                    </button>
                  );
                })}
              {peers.length === 0 && (
                <div className="text-center py-4 text-[10px] text-slate-600 font-mono">
                  No compatible peers discovered.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setSelectedPeers([]);
                }}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 font-bold rounded-lg text-[10px] font-mono tracking-wider uppercase transition"
              >
                Close
              </button>
              <button
                onClick={handleCreateChat}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-600 hover:to-violet-700 text-slate-100 font-bold rounded-lg text-[10px] font-mono tracking-wider uppercase transition shadow-lg shadow-cyan-950/40"
              >
                Transmit Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
