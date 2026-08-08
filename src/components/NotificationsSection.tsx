import React, { useState, useEffect } from 'react';
import { 
  db, 
  listenToNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  AuraNotification
} from '../utils/firebase';
import { 
  Bell, 
  Check, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  CornerUpLeft, 
  AtSign, 
  Plus, 
  Trash2,
  Inbox
} from 'lucide-react';

interface NotificationsSectionProps {
  currentUserId: string;
  onNavigateToTab: (tab: 'feed' | 'wallet' | 'reviews' | 'studio' | 'network' | 'settings' | 'messages' | 'admin') => void;
  onSelectChatId?: (chatId: string) => void;
}

export default function NotificationsSection({ 
  currentUserId, 
  onNavigateToTab,
  onSelectChatId
}: NotificationsSectionProps) {
  const [notifications, setNotifications] = useState<AuraNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = listenToNotifications(currentUserId, (loadedNotifs) => {
      setNotifications(loadedNotifs);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    if (confirm("Mark all notifications as read?")) {
      await markAllNotificationsRead(currentUserId);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
      case 'message':
        return <Inbox className="w-4 h-4 text-emerald-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-pink-400" />;
      case 'invite':
        return <Plus className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleNotificationTap = async (n: AuraNotification) => {
    await markNotificationRead(n.id);
    
    if (n.type === 'message' && n.chatId) {
      if (onSelectChatId) onSelectChatId(n.chatId);
      onNavigateToTab('messages');
    } else if (n.type === 'follow') {
      onNavigateToTab('network');
    } else if (n.type === 'like' || n.type === 'comment' || n.type === 'reply') {
      onNavigateToTab('feed');
    }
  };

  return (
    <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-5 md:p-6 shadow-2xl font-sans text-slate-200">
      
      {/* Header and Filter triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5" id="notif-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black font-mono tracking-wider uppercase text-slate-100">
              Sovereign Notification Feed
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">Real-time incoming telemetry signals</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter options */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-900/80 flex items-center gap-1 font-mono text-[9px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded transition uppercase ${filter === 'all' ? 'bg-cyan-950 border border-cyan-900/50 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              All Signal ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded transition uppercase ${filter === 'unread' ? 'bg-cyan-950 border border-cyan-900/50 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Unread ({notifications.filter(n => !n.read).length})
            </button>
          </div>

          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 bg-slate-950 border border-slate-900/80 hover:border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-[10px] font-mono uppercase tracking-wide transition"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications Directory List */}
      <div className="space-y-2.5" id="notif-list">
        {filteredNotifs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <Bell className="w-8 h-8 text-slate-700 animate-pulse" />
            <span>No telemetry signals received. Secure and quiet.</span>
          </div>
        ) : (
          filteredNotifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationTap(notif)}
              className={`p-3.5 rounded-xl border transition flex items-start gap-4 text-left cursor-pointer group relative ${
                notif.read 
                  ? 'bg-slate-950/20 border-slate-950 hover:bg-[#080C16]/30' 
                  : 'bg-cyan-950/10 border-cyan-950 hover:bg-cyan-950/20 shadow shadow-cyan-950/10'
              }`}
            >
              {/* Unread dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-4 left-2.5 animate-ping"></span>
              )}

              {/* Sender Avatar */}
              <img
                src={notif.senderAvatar}
                className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-900 object-cover shrink-0 mt-0.5"
                alt=""
              />

              {/* Notification Details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-200 font-mono">@{notif.senderName}</span>
                  <span className="text-[11px] text-slate-400">
                    {notif.type === 'follow' && 'began following your digital coordinate.'}
                    {notif.type === 'like' && 'voted appreciation on your publication.'}
                    {notif.type === 'comment' && 'published commentary on your screenplay.'}
                    {notif.type === 'reply' && 'replied to your commentary block.'}
                    {notif.type === 'message' && 'linked messaging packets to you.'}
                    {notif.type === 'mention' && 'targeted your ID keyword in a publication.'}
                    {notif.type === 'invite' && 'invited you to a mesh peer circle.'}
                  </span>
                </div>

                {/* Subtext info/message preview */}
                {notif.messageText && (
                  <p className="mt-1.5 p-2 bg-slate-950/60 border border-slate-900/60 text-[11px] text-slate-400 font-sans italic rounded-lg break-words">
                    "{notif.messageText}"
                  </p>
                )}

                <span className="text-[9px] text-slate-600 font-mono block mt-1">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Type Badge icon */}
              <div className="flex flex-col items-center gap-2 shrink-0 self-center">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-900">
                  {getNotificationIcon(notif.type)}
                </div>
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    className="p-1 rounded bg-slate-950/60 border border-slate-900 text-slate-400 hover:text-cyan-400 text-[8px] font-mono tracking-widest uppercase"
                    title="Dismiss"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
