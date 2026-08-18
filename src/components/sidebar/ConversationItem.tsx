import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, MoreVertical, Pencil, Trash2, Pin, PinOff, FolderInput, Download } from "lucide-react";
import type { Conversation, Folder } from "../../types";
import { formatTimestamp, truncate } from "../../lib/utils";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onExportMarkdown: (conversation: Conversation) => void;
  folders: Folder[];
}

export default function ConversationItem({ conversation, isActive, onSelect, onRename, onDelete, onTogglePin, onMoveToFolder, onExportMarkdown, folders }: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKeyDown); };
  }, [menuOpen]);

  const handleRename = useCallback(() => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conversation.title) onRename(conversation.id, trimmed);
    setIsEditing(false);
  }, [editTitle, conversation.id, conversation.title, onRename]);

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        isActive ? "bg-white/[0.06] text-[#F5F7FA]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.03]"
      }`}
      onClick={() => { if (!isEditing) onSelect(conversation.id); }}
    >
      {conversation.isPinned ? (
        <Pin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 fill-indigo-400/30" />
      ) : (
        <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
      )}
      {isEditing ? (
        <input ref={inputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setIsEditing(false); }}
          className="flex-1 min-w-0 bg-transparent text-sm text-[#F5F7FA] focus:outline-none border-b border-indigo-500/50 py-0.5"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 text-[13px] truncate">{truncate(conversation.title, 26)}</span>
      )}
      {!isEditing && <span className="text-[10px] text-[#3B4050] flex-shrink-0 whitespace-nowrap">{formatTimestamp(conversation.updatedAt)}</span>}
      {!isEditing && (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 -mr-1 rounded-lg text-[#3B4050] hover:text-[#D1D5DB] hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100 touch-show focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Conversation options" aria-expanded={menuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-[#1A1B26] border border-white/[0.06] rounded-xl shadow-2xl z-50 py-1">
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setIsEditing(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#D1D5DB] hover:bg-white/[0.04] transition-colors">
                <Pencil className="w-4 h-4 flex-shrink-0 opacity-60" />Rename
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onTogglePin(conversation.id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#D1D5DB] hover:bg-white/[0.04] transition-colors">
                {conversation.isPinned ? <PinOff className="w-4 h-4 flex-shrink-0 opacity-60" /> : <Pin className="w-4 h-4 flex-shrink-0 opacity-60" />}
                {conversation.isPinned ? "Unpin" : "Pin"}
              </button>
              {folders.length > 0 && (
                <>
                  <div className="h-px bg-white/[0.04] my-1" />
                  <button onClick={(e) => { e.stopPropagation(); setShowFolders(!showFolders); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#D1D5DB] hover:bg-white/[0.04] transition-colors">
                    <FolderInput className="w-4 h-4 flex-shrink-0 opacity-60" />Move to folder
                  </button>
                  {showFolders && (
                    <div className="ml-4 border-l border-white/[0.04]">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveToFolder(conversation.id, null); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${!conversation.folderId ? "text-indigo-400 bg-indigo-500/[0.06]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04]"}`}>
                        None
                      </button>
                      {folders.map((f) => (
                        <button key={f.id} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onMoveToFolder(conversation.id, f.id); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${conversation.folderId === f.id ? "text-indigo-400 bg-indigo-500/[0.06]" : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04]"}`}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="h-px bg-white/[0.04] my-1" />
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExportMarkdown(conversation); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#D1D5DB] hover:bg-white/[0.04] transition-colors">
                <Download className="w-4 h-4 flex-shrink-0 opacity-60" />Export as Markdown
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(conversation.id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/[0.08] transition-colors">
                <Trash2 className="w-4 h-4 flex-shrink-0 opacity-60" />Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
