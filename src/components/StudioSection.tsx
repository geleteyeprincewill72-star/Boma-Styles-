/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  AlignLeft, 
  Plus, 
  Trash2, 
  Link, 
  Sparkles, 
  Eye, 
  Edit3, 
  UserPlus, 
  Key, 
  FileText,
  Bookmark
} from 'lucide-react';
import { Character, ScreenplayBlock, ScreenplayBlockType } from '../types';

interface StudioSectionProps {
  characters: Character[];
  screenplay: ScreenplayBlock[];
  onAddCharacter: (character: Character) => void;
  onUpdateCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
  onUpdateScreenplay: (blocks: ScreenplayBlock[]) => void;
}

const BLOCK_TYPES: { type: ScreenplayBlockType; label: string; shortcut: string; style: string }[] = [
  { type: 'scene', label: 'Scene Heading', shortcut: 'Ctrl+1', style: 'font-mono text-xs uppercase font-bold tracking-wider text-slate-200 mt-6 mb-2 pt-2 bg-slate-950/40 p-2 border-l-2 border-cyan-500' },
  { type: 'action', label: 'Action', shortcut: 'Ctrl+2', style: 'font-sans text-sm text-slate-300 leading-relaxed mb-3' },
  { type: 'character', label: 'Character Name', shortcut: 'Ctrl+3', style: 'font-mono text-sm font-bold uppercase tracking-wide text-slate-100 text-center mt-4 mb-1 block' },
  { type: 'parenthetical', label: 'Parenthetical', shortcut: 'Ctrl+4', style: 'font-sans text-xs italic text-slate-400 text-center mb-1' },
  { type: 'dialogue', label: 'Dialogue', shortcut: 'Ctrl+5', style: 'font-sans text-sm text-slate-300 max-w-[70%] mx-auto text-center leading-relaxed mb-3' },
  { type: 'transition', label: 'Transition', shortcut: 'Ctrl+6', style: 'font-mono text-xs font-semibold text-slate-400 text-right uppercase tracking-wider my-4 block' }
];

export default function StudioSection({
  characters,
  screenplay,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onUpdateScreenplay
}: StudioSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'writer' | 'characters'>('writer');
  
  // Script editor states
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingBlockText, setEditingBlockText] = useState('');
  const [editingBlockType, setEditingBlockType] = useState<ScreenplayBlockType>('action');
  const [editingBlockCharLink, setEditingBlockCharLink] = useState<string>('');

  // Character drawer/modal states
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [charName, setCharName] = useState('');
  const [charBio, setCharBio] = useState('');
  const [charPhysical, setCharPhysical] = useState('');
  const [charPersonality, setCharPersonality] = useState('');
  const [charMotivations, setCharMotivations] = useState('');
  const [charAvatar, setCharAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60');

  // Preview character popup state
  const [previewCharId, setPreviewCharId] = useState<string | null>(null);

  // Character Avatar Options
  const AVATAR_OPTIONS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60', // Rogue Cipher-Activist
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60', // Orion Sterling
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60', // Cypher Architect
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'  // Network Hacker
  ];

  const handleAddBlock = () => {
    const newBlock: ScreenplayBlock = {
      id: `block_${Date.now()}`,
      type: 'action',
      text: 'Describe the movement, action, or digital environment...'
    };
    onUpdateScreenplay([...screenplay, newBlock]);
    setEditingBlockId(newBlock.id);
    setEditingBlockText(newBlock.text);
    setEditingBlockType(newBlock.type);
    setEditingBlockCharLink('');
  };

  const handleSaveBlock = (blockId: string) => {
    const updated = screenplay.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          type: editingBlockType,
          text: editingBlockText,
          characterId: editingBlockCharLink || undefined
        };
      }
      return b;
    });
    onUpdateScreenplay(updated);
    setEditingBlockId(null);
  };

  const handleDeleteBlock = (blockId: string) => {
    onUpdateScreenplay(screenplay.filter(b => b.id !== blockId));
    if (editingBlockId === blockId) setEditingBlockId(null);
  };

  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: charName,
      bio: charBio,
      physicalDesc: charPhysical,
      personality: charPersonality,
      motivations: charMotivations,
      avatar: charAvatar,
      createdAt: Date.now()
    };

    onAddCharacter(newChar);
    setIsAddingCharacter(false);
    // Reset forms
    setCharName('');
    setCharBio('');
    setCharPhysical('');
    setCharPersonality('');
    setCharMotivations('');
  };

  // Helper to re-arrange blocks (move up/down)
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= screenplay.length) return;

    const copy = [...screenplay];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onUpdateScreenplay(copy);
  };

  const linkedCharacter = (charId?: string) => {
    return characters.find(c => c.id === charId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="studio-container">
      {/* LEFT COLUMN: Screenplay Editor Workshop (7 Cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
        {/* Editor Toolbar Header */}
        <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-bold font-sans text-slate-200">Decentralized Screenplay Workshop</h2>
          </div>
          
          <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSubTab('writer')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                activeSubTab === 'writer' ? 'bg-slate-800 text-cyan-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Script Draft
            </button>
            <button
              onClick={() => setActiveSubTab('characters')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
                activeSubTab === 'characters' ? 'bg-slate-800 text-cyan-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5 inline mr-1.5" />
              Character Profiles ({characters.length})
            </button>
          </div>
        </div>

        {/* Screenplay Writer Draft */}
        {activeSubTab === 'writer' && (
          <div className="flex-grow p-6 flex flex-col justify-between">
            <div className="space-y-1 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin">
              {/* Screenplay Metadata card */}
              <div className="text-center py-6 border-b border-slate-800 mb-6 bg-slate-950/20 rounded-xl">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                  Secure Draft Ledger Block
                </span>
                <h1 className="text-xl font-bold font-sans tracking-wide text-slate-100 mt-2">AETHER'S AWAKENING</h1>
                <p className="text-xs text-slate-500 font-mono mt-1">Written & Signed Decentralized • v1.0.0 Alpha</p>
              </div>

              {screenplay.map((block, idx) => {
                const isEditing = editingBlockId === block.id;
                const blockStyleInfo = BLOCK_TYPES.find(bt => bt.type === block.type);
                const isDialogue = block.type === 'dialogue';
                const charLink = linkedCharacter(block.characterId);

                return (
                  <div 
                    key={block.id}
                    className={`group relative p-2 rounded-lg transition duration-150 ${
                      isEditing ? 'bg-slate-950 border border-cyan-500/50' : 'hover:bg-slate-950/30'
                    }`}
                  >
                    {isEditing ? (
                      /* Active Block Editor Panel */
                      <div className="space-y-3 p-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Format:</label>
                            <select
                              value={editingBlockType}
                              onChange={(e) => setEditingBlockType(e.target.value as ScreenplayBlockType)}
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                            >
                              {BLOCK_TYPES.map(bt => (
                                <option key={bt.type} value={bt.type}>{bt.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Link character dropdown */}
                          <div className="flex items-center gap-1.5">
                            <Link className="w-3 h-3 text-cyan-400" />
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Link Bio:</label>
                            <select
                              value={editingBlockCharLink}
                              onChange={(e) => setEditingBlockCharLink(e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none max-w-[120px]"
                            >
                              <option value="">-- No Link --</option>
                              {characters.map(char => (
                                <option key={char.id} value={char.id}>{char.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <textarea
                          value={editingBlockText}
                          onChange={(e) => setEditingBlockText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                          rows={block.type === 'action' || block.type === 'dialogue' ? 3 : 1}
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1.5 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded text-xs transition"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBlockId(null)}
                            className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs font-mono transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveBlock(block.id)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded text-xs font-mono transition"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Static Screenplay Content Block Render */
                      <div>
                        {/* Hover Overlay Actions */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded px-1.5 py-1 z-10 transition">
                          <button
                            onClick={() => {
                              setEditingBlockId(block.id);
                              setEditingBlockText(block.text);
                              setEditingBlockType(block.type);
                              setEditingBlockCharLink(block.characterId || '');
                            }}
                            className="text-slate-400 hover:text-cyan-400 p-0.5 transition"
                            title="Edit Block"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="text-slate-400 hover:text-slate-200 disabled:opacity-30 p-0.5 transition"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === screenplay.length - 1}
                            className="text-slate-400 hover:text-slate-200 disabled:opacity-30 p-0.5 transition"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Text Output formatted like an industry standard screenplay */}
                        <p className={blockStyleInfo?.style || 'font-sans text-sm'}>
                          {/* Highlight linked characters names */}
                          {charLink ? (
                            <span 
                              onClick={() => setPreviewCharId(charLink.id)}
                              className="cursor-help bg-cyan-950/40 border border-cyan-800/50 rounded-md px-1.5 py-0.5 text-cyan-400 font-bold inline-flex items-center gap-1 hover:bg-cyan-900/50 transition duration-150"
                              title={`Linked Character Bio: ${charLink.name}\nClick to view physical traits & personality motivations.`}
                            >
                              <Bookmark className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                              {block.text}
                            </span>
                          ) : (
                            block.text
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Editor Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/20 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500">
                Format complies with Fountain Draft syntax • Total blocks: {screenplay.length}
              </span>
              <button
                onClick={handleAddBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Screenplay Block
              </button>
            </div>
          </div>
        )}

        {/* Characters Database Sub-Draft */}
        {activeSubTab === 'characters' && (
          <div className="flex-grow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-200">Character Asset Library</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Linked profiles appear as interactive nodes in dialogue blocks</p>
              </div>
              <button
                onClick={() => setIsAddingCharacter(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-slate-100 rounded-lg text-xs font-mono transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add New Profile
              </button>
            </div>

            {/* Character Form overlay */}
            {isAddingCharacter && (
              <form onSubmit={handleCreateCharacter} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">New Character Record</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCharacter(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                  >
                    [Cancel]
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Character Name</label>
                    <input
                      type="text"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="e.g., Lyra Vesper"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Avatar Preset</label>
                    <div className="flex gap-2">
                      {AVATAR_OPTIONS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCharAvatar(av)}
                          className={`w-8 h-8 rounded overflow-hidden border-2 transition ${
                            charAvatar === av ? 'border-cyan-400' : 'border-transparent hover:border-slate-700'
                          }`}
                        >
                          <img src={av} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Physical Description</label>
                    <input
                      type="text"
                      value={charPhysical}
                      onChange={(e) => setCharPhysical(e.target.value)}
                      placeholder="e.g., Midnight leather jacket, cyan holographic wrist array."
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Personality Traits</label>
                    <input
                      type="text"
                      value={charPersonality}
                      onChange={(e) => setCharPersonality(e.target.value)}
                      placeholder="e.g., Cynical, fiercely loyal, hyper-logical under pressure."
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Core Biography & Background</label>
                  <textarea
                    value={charBio}
                    onChange={(e) => setCharBio(e.target.value)}
                    placeholder="Short bio explaining their origin, status on the network, and story arc..."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Internal Motivations & Intentions</label>
                  <input
                    type="text"
                    value={charMotivations}
                    onChange={(e) => setCharMotivations(e.target.value)}
                    placeholder="e.g., Seeks to decentralize the local municipal power ledger..."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded text-xs font-mono transition"
                  >
                    Commit Character
                  </button>
                </div>
              </form>
            )}

            {/* Characters grid list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map(char => (
                <div key={char.id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex gap-3 relative group">
                  <img src={char.avatar} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-800" alt="" referrerPolicy="no-referrer" />
                  <div className="space-y-1.5 flex-grow">
                    <h4 className="font-sans font-bold text-sm text-slate-100">{char.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{char.bio || 'No biography compiled.'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {char.personality && (
                        <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 rounded-md px-1.5 py-0.5">
                          {char.personality.slice(0, 20)}...
                        </span>
                      )}
                      {char.motivations && (
                        <span className="text-[9px] font-mono bg-violet-950/40 border border-violet-800/40 text-violet-400 rounded-md px-1.5 py-0.5">
                          Motivations: {char.motivations.slice(0, 20)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteCharacter(char.id)}
                    className="absolute right-3 top-3 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                    title="Remove Character Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Character Interactive Bio Overlay Drawer (4 Cols) */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-sm min-h-[400px]">
        {/* Dynamic Sidebar Content */}
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold font-sans text-slate-200 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              Dynamic Bio Reference Panel
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Click character tags in screenplay blocks to view traits</p>
          </div>

          {previewCharId ? (
            /* Character Details Visual Card */
            (() => {
              const char = characters.find(c => c.id === previewCharId);
              if (!char) return null;

              return (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                    <img 
                      src={char.avatar} 
                      className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-800" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-sans font-bold text-base text-slate-100">{char.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mt-0.5">Verified Profile</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Physical Characteristics</h5>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-800">
                        {char.physicalDesc || 'Not designated.'}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Personality Traits</h5>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-800">
                        {char.personality || 'Not designated.'}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Biography & Roots</h5>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed bg-slate-950/20 p-2.5 rounded-lg border border-slate-800">
                        {char.bio || 'Not designated.'}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Motivations & Driver</h5>
                      <p className="text-xs text-violet-300 mt-0.5 leading-relaxed bg-violet-950/10 p-2.5 rounded-lg border border-violet-900/30 font-sans">
                        {char.motivations || 'Not designated.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewCharId(null)}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-300 rounded-lg text-xs font-mono transition"
                  >
                    Clear Focus
                  </button>
                </div>
              );
            })()
          ) : (
            /* Default Slate State */
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
              <User className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs font-sans text-slate-400">No Character Profile Focused</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1 max-w-[200px] mx-auto">
                Tap on any cyan bracketed name in the screenplay draft to load their details.
              </p>
            </div>
          )}
        </div>

        {/* Studio Statistics */}
        <div className="pt-4 border-t border-slate-800 bg-slate-950/10 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Key className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] font-mono text-slate-400">Asset Signing Protocol</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">SHA-256 ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
