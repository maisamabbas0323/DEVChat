export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  tokenUsage?: { prompt: number; completion: number; total: number };
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  systemPrompt: string;
  isPinned: boolean;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface ApiConfig {
  provider: "openrouter";
  apiKey: string;
  model: string;
}

export interface Settings {
  enterToSend: boolean;
  showTimestamps: boolean;
  autoScroll: boolean;
  compactMode: boolean;
  fontSize: "sm" | "base" | "lg";
  sendWithCtrlEnter: boolean;
  streamResponses: boolean;
  showTokenCount: boolean;
  developerMode: boolean;
  codeHighlightTheme: "default" | "github" | "monokai" | "dracula";
  defaultSystemPrompt: string;
  hasCompletedOnboarding: boolean;
}

export interface StoredData {
  version: number;
  conversations: Conversation[];
  folders: Folder[];
  apiConfig: ApiConfig;
  settings: Settings;
}

export type ErrorType =
  | "401"
  | "403"
  | "404"
  | "429"
  | "500"
  | "502"
  | "503"
  | "network"
  | "invalid_key"
  | "invalid_model"
  | "missing_key"
  | "malformed"
  | "unknown";
