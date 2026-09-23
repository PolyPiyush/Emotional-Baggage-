/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Note } from "../types";
import { Plus, Pin, Search, Trash2, Edit2, CheckSquare, Square, Mic, MicOff, Star, X, Save, Sparkles, FolderOpen } from "lucide-react";

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onAddLog: (log: string) => void;
}

export default function NotesView({ notes, setNotes, onAddLog }: NotesViewProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Study");
  const [noteType, setNoteType] = useState<"text" | "checklist" | "voice">("text");

  // Checklist Creation Helpers
  const [checklistInput, setChecklistInput] = useState("");
  const [createdChecklist, setCreatedChecklist] = useState<{ text: string; checked: boolean }[]>([]);

  // Editing State
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Mock Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTicks, setVoiceTicks] = useState(0);
  const [voiceInterval, setVoiceInterval] = useState<NodeJS.Timeout | null>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setVoiceTicks(0);
    setNoteContent("Compiling voice waveform... listening...");

    const interval = setInterval(() => {
      setVoiceTicks((prev) => {
        const next = prev + 1;
        if (next === 3) {
          setNoteContent('"Reviewing React algorithms with Hiro Sensei..."');
        } else if (next === 6) {
          setNoteContent('"Reviewing React algorithms with Hiro Sensei... and planning tomorrow\'s 12-week milestones."');
        } else if (next === 9) {
          clearInterval(interval);
          setIsRecording(false);
        }
        return next;
      });
    }, 1000);

    setVoiceInterval(interval);
  };

  const stopVoiceRecording = () => {
    if (voiceInterval) clearInterval(voiceInterval);
    setIsRecording(false);
  };

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    setCreatedChecklist((prev) => [...prev, { text: checklistInput, checked: false }]);
    setChecklistInput("");
  };

  const handleCreateNote = () => {
    if (!noteTitle.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: noteType === "voice" ? `[Voice Note summary]: ${noteContent}` : noteContent,
      category: noteCategory,
      pinned: false,
      checklist: noteType === "checklist" ? createdChecklist : undefined,
      isVoiceMock: noteType === "voice",
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };

    setNotes((prev) => [newNote, ...prev]);
    resetForm();
    setShowAddModal(false);
    onAddLog(`Created note: "${newNote.title}"`);
  };

  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("Study");
    setNoteType("text");
    setCreatedChecklist([]);
    setChecklistInput("");
    setIsRecording(false);
    if (voiceInterval) clearInterval(voiceInterval);
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleChecklistItem = (noteId: string, itemIdx: number) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId && n.checklist) {
          const updated = [...n.checklist];
          updated[itemIdx] = { ...updated[itemIdx], checked: !updated[itemIdx].checked };
          return { ...n, checklist: updated };
        }
        return n;
      })
    );
  };

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || n.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    // Sort pinned notes to the top
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  const categories = ["All", "Study", "Coding", "Brainstorm", "Fitness"];

  return (
    <div id="notes-view-container" className="flex flex-col h-full overflow-y-auto px-5 py-5 text-white space-y-4 pb-24 relative dot-grid">
      <div className="absolute top-24 right-5 w-24 h-24 bg-[#7B2EFF]/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Dojo Archives</span>
          <h2 className="text-lg font-black tracking-tight text-white purple-text-glow">Training Log & Notes</h2>
        </div>
      </div>

      {/* Search and Category filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
          <input
            id="notes-search-input"
            type="text"
            placeholder="Search notes or lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none font-bold placeholder-white/20"
          />
        </div>

        {/* Scrollable Categories List */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`note-cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xxs font-mono border transition-all shrink-0 cursor-pointer uppercase tracking-wider font-bold ${
                activeCategory === cat
                  ? "bg-[#7B2EFF]/15 border-[#7B2EFF]/35 text-[#7B2EFF] font-black"
                  : "bg-black/40 border-white/5 text-white/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NOTES GRID DISPLAY */}
      <div className="space-y-3 flex-1">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-2">
            <FolderOpen className="w-8 h-8 text-[#7B2EFF]/35 mx-auto" />
            <h4 className="text-xxs font-mono text-white/40 font-bold">No Records Compiled</h4>
            <p className="text-[10px] text-white/30 font-mono">Create study concepts or checklists using the floating Dojo Brush (+).</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ y: -2 }}
                className={`p-3.5 glass border ${
                  note.pinned ? "border-[#7B2EFF]/45 shadow-[0_0_15px_rgba(123,46,255,0.15)]" : "border-white/5"
                } rounded-2xl space-y-3 flex flex-col justify-between relative group overflow-hidden`}
              >
                <div className="space-y-1.5">
                  {/* Top card flags */}
                  <div className="flex justify-between items-center">
                    <span className="text-[8.5px] font-mono uppercase text-[#7B2EFF] bg-[#7B2EFF]/15 border border-[#7B2EFF]/25 px-1.5 py-0.5 rounded font-bold">
                      {note.category}
                    </span>
                    <button
                      id={`pin-note-btn-${note.id}`}
                      onClick={() => togglePinNote(note.id)}
                      className={`text-white/40 hover:text-[#7B2EFF] transition-colors cursor-pointer ${
                        note.pinned ? "text-[#7B2EFF]" : ""
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Note Title */}
                  <h4 className="text-xs font-bold leading-tight font-sans text-white line-clamp-1">
                    {note.title}
                  </h4>

                  {/* Note Content based on Type */}
                  {note.checklist ? (
                    <div className="space-y-1.5 py-1">
                      {note.checklist.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xxs font-sans text-white/60">
                          <button
                            id={`check-list-item-${note.id}-${idx}`}
                            onClick={() => toggleChecklistItem(note.id, idx)}
                            className="shrink-0 text-[#7B2EFF] cursor-pointer"
                          >
                            {item.checked ? (
                              <CheckSquare className="w-3.5 h-3.5 fill-[#7B2EFF]/5" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-white/20" />
                            )}
                          </button>
                          <span className={`line-clamp-1 font-bold ${item.checked ? "line-through text-white/30" : ""}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                      {note.checklist.length > 3 && (
                        <span className="text-[9px] font-mono text-white/30 block pl-1">
                          +{note.checklist.length - 3} more items...
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10.5px] leading-relaxed text-white/60 font-sans line-clamp-4">
                      {note.content}
                    </p>
                  )}
                </div>

                {/* Footer and interactive triggers */}
                <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[9px] font-mono text-white/30 font-bold">
                  <span>{note.createdAt}</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-note-btn-${note.id}`}
                      onClick={() => setEditingNote(note)}
                      className="hover:text-purple-300 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      id={`delete-note-btn-${note.id}`}
                      onClick={() => handleDeleteNote(note.id)}
                      className="hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ADD BUTTON */}
      <motion.button
        id="notes-floating-add-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 w-12 h-12 bg-[#7B2EFF] border border-[#7B2EFF]/35 text-white rounded-full flex items-center justify-center shadow-lg shadow-[#7B2EFF]/30 z-30 cursor-pointer hover:brightness-110 transition-all"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* COMPREHENSIVE CREATE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md z-40 flex flex-col justify-between p-6 overflow-y-auto dot-grid"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#7B2EFF] animate-pulse" /> Ink Dojo Log
              </span>
              <button
                id="close-add-note-modal"
                onClick={() => { resetForm(); setShowAddModal(false); }}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note creation forms */}
            <div className="space-y-4 pt-5 flex-1">
              {/* Type toggle selection */}
              <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/10 font-mono text-xxs">
                {["text", "checklist", "voice"].map((type) => (
                  <button
                    key={type}
                    id={`note-type-toggle-${type}`}
                    onClick={() => { setNoteType(type as any); setNoteContent(""); }}
                    className={`flex-1 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer font-bold ${
                      noteType === type ? "bg-[#7B2EFF] text-white font-black" : "text-white/40"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Form elements */}
              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Title</label>
                  <input
                    id="add-note-title-input"
                    type="text"
                    placeholder="Enter objective title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none placeholder-white/20 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Category</label>
                  <select
                    id="add-note-category-input"
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono font-bold"
                  >
                    {["Study", "Coding", "Brainstorm", "Fitness"].map((cat) => (
                      <option className="bg-zinc-950" key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* CONTENT CONDITIONAL ON TYPE */}
                {noteType === "text" && (
                  <div>
                    <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Rich Content</label>
                    <textarea
                      id="add-note-text-input"
                      rows={6}
                      placeholder="Ink your thoughts and formulas..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none font-bold placeholder-white/20"
                    />
                  </div>
                )}

                {noteType === "checklist" && (
                  <div className="space-y-2">
                    <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Checklist Items</label>
                    <div className="flex gap-2">
                      <input
                        id="checklist-item-input"
                        type="text"
                        placeholder="Add checklist target..."
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
                      />
                      <button
                        id="add-checklist-item-btn"
                        onClick={handleAddChecklistItem}
                        className="bg-[#7B2EFF]/10 border border-[#7B2EFF]/30 hover:bg-[#7B2EFF]/25 text-[#7B2EFF] px-3 rounded-xl text-xs font-mono font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto pt-2 pl-1">
                      {createdChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xxs font-mono text-white/60 font-bold">
                          <Square className="w-3.5 h-3.5 text-white/20" />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {noteType === "voice" && (
                  <div className="glass border border-white/5 rounded-xl p-5 text-center space-y-4">
                    <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest block font-bold">Japanese Voice Dictation (Mock UI)</span>
                    
                    {/* Animated Microphone Icon */}
                    <div className="relative inline-block">
                      <button
                        id="voice-mic-trigger"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isRecording
                            ? "bg-red-600 border-red-500 animate-pulse text-white scale-105 shadow-lg shadow-red-600/20"
                            : "bg-[#7B2EFF] border-[#7B2EFF]/35 hover:brightness-110 text-white"
                        }`}
                      >
                        {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                      </button>
                    </div>

                    {isRecording ? (
                      <div className="space-y-2">
                        <div className="flex justify-center gap-1 py-1.5">
                          {[...Array(6)].map((_, i) => (
                            <span
                              key={i}
                              className="w-1 h-4 bg-red-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 100}ms` }}
                            ></span>
                          ))}
                        </div>
                        <p className="text-xxs font-mono text-red-400 uppercase tracking-wider animate-pulse font-bold">RECORDING ACTIVE: dictating transcript summary...</p>
                      </div>
                    ) : (
                      <p className="text-xxs text-white/40 font-mono font-bold">Tap the microphone and start speaking to simulate auto-summarization.</p>
                    )}

                    {/* Transcribing summary container */}
                    <div className="bg-black/50 border border-white/10 p-3 rounded-xl text-xxs font-mono text-left italic text-white/70 min-h-[44px]">
                      {noteContent || "Dictated summary will appear here..."}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit note */}
            <div className="pt-4 border-t border-white/10">
              <button
                id="add-note-submit-btn"
                onClick={handleCreateNote}
                className="w-full bg-[#7B2EFF] hover:brightness-110 py-3 rounded-xl text-xs font-mono font-black tracking-wider text-white shadow-lg shadow-[#7B2EFF]/30 flex items-center justify-center gap-1.5 uppercase cursor-pointer"
              >
                <img referrerPolicy="no-referrer" src="https://img.icons8.com/?size=100&id=82767&format=png&color=ffffff" className="w-4 h-4" alt="Save" /> Save Record to Archives
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE EDIT MODAL */}
      <AnimatePresence>
        {editingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md z-40 flex flex-col justify-between p-6 dot-grid"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-xxs font-mono text-[#7B2EFF] uppercase tracking-widest font-bold">Update Archive Record</span>
              <button
                id="close-edit-note-modal"
                onClick={() => setEditingNote(null)}
                className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-5 flex-1 font-sans">
              <div>
                <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Title</label>
                <input
                  id="edit-note-title-input"
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Category</label>
                <select
                  id="edit-note-category-input"
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                >
                  {["Study", "Coding", "Brainstorm", "Fitness"].map((cat) => (
                    <option className="bg-zinc-950" key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {!editingNote.checklist && (
                <div>
                  <label className="block text-xxs font-mono text-white/40 uppercase tracking-widest mb-1 font-bold">Content</label>
                  <textarea
                    id="edit-note-text-input"
                    rows={8}
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2 text-xs text-white outline-none resize-none font-bold"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                id="edit-note-submit-btn"
                onClick={() => {
                  setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? editingNote : n)));
                  setEditingNote(null);
                  onAddLog(`Edited note: "${editingNote.title}"`);
                }}
                className="w-full bg-[#7B2EFF] hover:brightness-110 py-3 rounded-xl text-xs font-mono font-black text-white shadow-lg shadow-[#7B2EFF]/35 uppercase cursor-pointer"
              >
                Confirm Updates
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
