/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListMusic, Bookmark, FolderPlus, Film } from 'lucide-react';
import { FeedPost, VideoPlaylist } from '../types';
import { 
  getVideoPlaylists, 
  addVideoToPlaylist, 
  removeVideoFromPlaylist, 
  createVideoPlaylist 
} from '../utils/videoEngine';

interface VideoPlaylistModalProps {
  post: FeedPost;
  onClose: () => void;
}

export const VideoPlaylistModal: React.FC<VideoPlaylistModalProps> = ({ post, onClose }) => {
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>(() => getVideoPlaylists());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTogglePlaylist = (playlist: VideoPlaylist) => {
    const isAlreadyIn = playlist.items.some(item => item.id === post.id);
    if (isAlreadyIn) {
      removeVideoFromPlaylist(playlist.id, post.id);
      showToast(`Removed from "${playlist.name}"`);
    } else {
      addVideoToPlaylist(playlist.id, post);
      showToast(`Added to "${playlist.name}"`);
    }
    setPlaylists(getVideoPlaylists());
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPl = createVideoPlaylist(newTitle, newDescription);
    addVideoToPlaylist(newPl.id, post);
    setNewTitle('');
    setNewDescription('');
    setIsCreatingNew(false);
    setPlaylists(getVideoPlaylists());
    showToast(`Created "${newPl.name}" and added video!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-rose-500" />
            <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
              Save Video to Playlist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Snippet */}
        <div className="p-4 bg-slate-900/30 border-b border-slate-850 flex items-center gap-3">
          <div className="w-16 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
            <img
              src={post.mediaThumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
              alt={post.title || 'Video'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white opacity-80" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-200 truncate">
              {post.title || 'Broadcast Video Stream'}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              By {post.authorName || 'Bios Styles'}
            </p>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-800/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Playlist Items List */}
        <div className="p-4 max-h-60 overflow-y-auto space-y-2">
          {playlists.map((pl) => {
            const isContained = pl.items.some(item => item.id === post.id);
            return (
              <button
                key={pl.id}
                onClick={() => handleTogglePlaylist(pl)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition ${
                  isContained
                    ? 'bg-rose-950/30 border-rose-600/50 text-slate-100 shadow-sm'
                    : 'bg-slate-950/50 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isContained ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {isContained ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{pl.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {pl.items.length} {pl.items.length === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  isContained ? 'bg-rose-900/40 text-rose-300' : 'text-slate-500'
                }`}>
                  {isContained ? 'Saved' : 'Add'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create New Playlist Form or Button */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/80">
          {isCreatingNew ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-300 block">
                Create New Playlist
              </span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Playlist Name (e.g. Cyberpunk Streams)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold uppercase transition"
                >
                  Create & Save
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-mono text-slate-300 font-bold uppercase flex items-center justify-center gap-2 transition"
            >
              <FolderPlus className="w-4 h-4 text-rose-400" />
              <span>Create New Playlist</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VideoPlaylistModal;
