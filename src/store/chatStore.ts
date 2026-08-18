import { create } from "zustand";
import type { Conversation, Message, Folder } from "../types";
import { loadConversations, saveConversations } from "../lib/storage";
import { loadFolders, saveFolders } from "../lib/folderStorage";
import { generateId } from "../lib/utils";

interface ChatState {
  conversations: Conversation[];
  folders: Folder[];
  activeConversationId: string | null;
  isGenerating: boolean;
  abortController: AbortController | null;
  searchQuery: string;

  init: () => void;
  createConversation: (model: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  updateConversationModel: (id: string, model: string) => void;
  setSystemPrompt: (id: string, prompt: string) => void;
  togglePin: (id: string) => void;
  moveToFolder: (conversationId: string, folderId: string | null) => void;
  createFolder: (name: string) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateLastAssistantMessage: (conversationId: string, content: string, usage?: { prompt: number; completion: number; total: number }) => void;
  clearMessages: (conversationId: string) => void;
  removeMessagesFrom: (conversationId: string, messageId: string) => void;
  setGenerating: (val: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  setSearchQuery: (query: string) => void;
  getActiveConversation: () => Conversation | undefined;
  getFilteredConversations: () => Conversation[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  folders: [],
  activeConversationId: null,
  isGenerating: false,
  abortController: null,
  searchQuery: "",

  init: () => {
    const conversations = loadConversations();
    const folders = loadFolders();
    set({ conversations, folders });
  },

  createConversation: (model: string) => {
    const id = generateId();
    const now = Date.now();
    const conv: Conversation = {
      id,
      title: "New Chat",
      model,
      systemPrompt: "",
      isPinned: false,
      folderId: null,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const updated = [conv, ...get().conversations];
    saveConversations(updated);
    set({ conversations: updated, activeConversationId: id });
    return id;
  },

  deleteConversation: (id: string) => {
    const updated = get().conversations.filter((c) => c.id !== id);
    saveConversations(updated);
    const activeId =
      get().activeConversationId === id ? null : get().activeConversationId;
    set({ conversations: updated, activeConversationId: activeId });
  },

  renameConversation: (id: string, title: string) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, title, updatedAt: Date.now() } : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  updateConversationModel: (id: string, model: string) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, model, updatedAt: Date.now() } : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  setSystemPrompt: (id: string, prompt: string) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, systemPrompt: prompt, updatedAt: Date.now() } : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  togglePin: (id: string) => {
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  moveToFolder: (conversationId: string, folderId: string | null) => {
    const updated = get().conversations.map((c) =>
      c.id === conversationId ? { ...c, folderId, updatedAt: Date.now() } : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  createFolder: (name: string) => {
    const folder: Folder = { id: generateId(), name, createdAt: Date.now() };
    const updated = [...get().folders, folder];
    saveFolders(updated);
    set({ folders: updated });
    return folder.id;
  },

  renameFolder: (id: string, name: string) => {
    const updated = get().folders.map((f) =>
      f.id === id ? { ...f, name } : f
    );
    saveFolders(updated);
    set({ folders: updated });
  },

  deleteFolder: (id: string) => {
    const updatedFolders = get().folders.filter((f) => f.id !== id);
    saveFolders(updatedFolders);
    const updatedConvs = get().conversations.map((c) =>
      c.folderId === id ? { ...c, folderId: null } : c
    );
    saveConversations(updatedConvs);
    set({ folders: updatedFolders, conversations: updatedConvs });
  },

  setActiveConversation: (id: string | null) => {
    set({ activeConversationId: id });
  },

  addMessage: (conversationId: string, message: Message) => {
    const updated = get().conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages, message];
      const title =
        c.title === "New Chat" && message.role === "user"
          ? message.content.slice(0, 60) + (message.content.length > 60 ? "…" : "")
          : c.title;
      return { ...c, messages, title, updatedAt: Date.now() };
    });
    saveConversations(updated);
    set({ conversations: updated });
  },

  updateLastAssistantMessage: (conversationId: string, content: string, usage?: { prompt: number; completion: number; total: number }) => {
    const updated = get().conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const messages = [...c.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant") {
          messages[i] = { ...messages[i], content, ...(usage ? { tokenUsage: usage } : {}) };
          break;
        }
      }
      return { ...c, messages, updatedAt: Date.now() };
    });
    saveConversations(updated);
    set({ conversations: updated });
  },

  clearMessages: (conversationId: string) => {
    const updated = get().conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages: [], title: "New Chat", updatedAt: Date.now() }
        : c
    );
    saveConversations(updated);
    set({ conversations: updated });
  },

  removeMessagesFrom: (conversationId: string, messageId: string) => {
    const updated = get().conversations.map((c) => {
      if (c.id !== conversationId) return c;
      const idx = c.messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return c;
      const messages = c.messages.slice(0, idx);
      return { ...c, messages, updatedAt: Date.now() };
    });
    saveConversations(updated);
    set({ conversations: updated });
  },

  setGenerating: (val: boolean) => set({ isGenerating: val }),

  setAbortController: (controller: AbortController | null) =>
    set({ abortController: controller }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  getFilteredConversations: () => {
    const { conversations, searchQuery } = get();
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  },
}));
