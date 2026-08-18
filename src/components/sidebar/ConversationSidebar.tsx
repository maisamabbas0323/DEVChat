import { useState, useCallback, useMemo } from "react";
import { Plus, Search, MessageSquare, Pin, Folder, ChevronRight, ChevronDown, FolderPlus } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSettingsStore } from "../../store/settingsStore";
import ConversationItem from "./ConversationItem";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import type { Conversation } from "../../types";

interface ConversationSidebarProps {
  onSelectConversation: (id: string) => void;
}

export default function ConversationSidebar({
  onSelectConversation,
}: ConversationSidebarProps) {
  const {
    activeConversationId,
    searchQuery,
    setSearchQuery,
    getFilteredConversations,
    deleteConversation,
    renameConversation,
    createConversation,
    togglePin,
    folders,
    moveToFolder,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useChatStore();
  const { apiConfig, closeMobileDrawer } = useSettingsStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  const allConversations = getFilteredConversations();
  const totalCount = useChatStore((s) => s.conversations.length);

  const { pinned, unpinned } = useMemo(() => {
    const p = allConversations.filter((c) => c.isPinned);
    const u = allConversations.filter((c) => !c.isPinned);
    return { pinned: p, unpinned: u };
  }, [allConversations]);

  const foldered = useMemo(() => {
    const map = new Map<string, typeof unpinned>();
    const noFolder: typeof unpinned = [];
    for (const c of unpinned) {
      if (c.folderId) {
        const arr = map.get(c.folderId) ?? [];
        arr.push(c);
        map.set(c.folderId, arr);
      } else {
        noFolder.push(c);
      }
    }
    return { map, noFolder };
  }, [unpinned]);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    const id = createConversation(apiConfig.model);
    onSelectConversation(id);
    closeMobileDrawer();
  }, [apiConfig.model, createConversation, onSelectConversation, closeMobileDrawer]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelectConversation(id);
      closeMobileDrawer();
    },
    [onSelectConversation, closeMobileDrawer]
  );

  const handleExportMarkdown = useCallback((conv: Conversation) => {
    const lines = [`# ${conv.title}`, ""];
    if (conv.systemPrompt) {
      lines.push("**System Prompt:**", conv.systemPrompt, "");
    }
    for (const msg of conv.messages) {
      const role = msg.role === "user" ? "You" : msg.role === "assistant" ? "DEVChat" : "System";
      lines.push(`## ${role}`, "", msg.content, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conv.title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "chat"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleCreateFolder = useCallback(() => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const id = createFolder(trimmed);
    setExpandedFolders((prev) => new Set([...prev, id]));
    setNewFolderName("");
    setShowNewFolderInput(false);
  }, [newFolderName, createFolder]);

  const handleRenameFolder = useCallback(() => {
    if (!editingFolderId) return;
    const trimmed = editFolderName.trim();
    if (trimmed) renameFolder(editingFolderId, trimmed);
    setEditingFolderId(null);
  }, [editingFolderId, editFolderName, renameFolder]);

  const hasAny = pinned.length > 0 || unpinned.length > 0;

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="p-3 flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-[#3B4050] uppercase tracking-wider">
            Conversations {totalCount > 0 && <span className="normal-case">({totalCount})</span>}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-sm text-[#F5F7FA] placeholder:text-[#4B5563] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-1.5 pb-2">
        {!hasAny && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-8 h-8 text-[#2A2D3A] mb-3" />
            <p className="text-sm text-[#4B5563]">
              {searchQuery ? "No matching conversations" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-2 text-[10px] font-semibold text-[#3B4050] uppercase tracking-wider flex items-center gap-1.5">
                  <Pin className="w-3 h-3" /> Pinned
                </p>
                <div className="space-y-0.5">
                  {pinned.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={handleSelect}
                      onRename={renameConversation}
                      onDelete={setDeleteTarget}
                      onTogglePin={togglePin}
                      onMoveToFolder={moveToFolder}
                      onExportMarkdown={handleExportMarkdown}
                      folders={folders}
                    />
                  ))}
                </div>
              </div>
            )}

            {folders.map((folder) => {
              const items = foldered.map.get(folder.id) ?? [];
              const isExpanded = expandedFolders.has(folder.id);
              return (
                <div key={folder.id} className="mb-1">
                  <div className="flex items-center group/folder">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold text-[#3B4050] uppercase tracking-wider hover:text-[#6B7280] transition-colors flex-1 text-left"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <Folder className="w-3 h-3" />
                      {editingFolderId === folder.id ? (
                        <input
                          value={editFolderName}
                          onChange={(e) => setEditFolderName(e.target.value)}
                          onBlur={handleRenameFolder}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameFolder(); if (e.key === "Escape") setEditingFolderId(null); }}
                          className="bg-transparent text-[10px] uppercase tracking-wider text-[#F5F7FA] focus:outline-none border-b border-indigo-500/50 py-0.5"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span onDoubleClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditFolderName(folder.name); }}>
                          {folder.name}
                        </span>
                      )}
                      <span className="text-[9px] text-[#2A2D3A] normal-case">({items.length})</span>
                    </button>
                    <button
                      onClick={() => setDeleteFolderTarget(folder.id)}
                      className="p-1 rounded text-[#2A2D3A] hover:text-red-400 opacity-0 group-hover/folder:opacity-100 transition-all mr-1"
                      aria-label={`Delete folder ${folder.name}`}
                    >
                      <span className="text-[10px]">&times;</span>
                    </button>
                  </div>
                  {isExpanded && items.length > 0 && (
                    <div className="space-y-0.5 ml-2">
                      {items.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={conv.id === activeConversationId}
                          onSelect={handleSelect}
                          onRename={renameConversation}
                          onDelete={setDeleteTarget}
                          onTogglePin={togglePin}
                          onMoveToFolder={moveToFolder}
                          onExportMarkdown={handleExportMarkdown}
                          folders={folders}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {foldered.noFolder.length > 0 && (
              <div className="mb-2">
                {folders.length > 0 && (
                  <p className="px-3 py-2 text-[10px] font-semibold text-[#3B4050] uppercase tracking-wider">
                    Unsorted
                  </p>
                )}
                <div className="space-y-0.5">
                  {foldered.noFolder.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={handleSelect}
                      onRename={renameConversation}
                      onDelete={setDeleteTarget}
                      onTogglePin={togglePin}
                      onMoveToFolder={moveToFolder}
                      onExportMarkdown={handleExportMarkdown}
                      folders={folders}
                    />
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <div className="px-2 pt-2">
                {showNewFolderInput ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolderInput(false); }}
                      placeholder="Folder name"
                      className="flex-1 h-8 px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-[#F5F7FA] placeholder:text-[#4B5563] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      autoFocus
                    />
                    <button onClick={handleCreateFolder} className="h-8 px-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/30 transition-colors">
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#3B4050] hover:text-[#6B7280] hover:bg-white/[0.03] transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    New folder
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete conversation"
        message="This will permanently delete this conversation and all its messages. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteConversation(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={deleteFolderTarget !== null}
        title="Delete folder"
        message="This will remove the folder. Conversations inside will be moved to Unsorted."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteFolderTarget) deleteFolder(deleteFolderTarget);
          setDeleteFolderTarget(null);
        }}
        onCancel={() => setDeleteFolderTarget(null)}
      />
    </div>
  );
}
