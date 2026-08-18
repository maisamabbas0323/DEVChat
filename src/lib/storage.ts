import type { Conversation, ApiConfig, Settings, StoredData, Folder } from "../types";
import { idbSet, idbClear } from "./idb";
import { loadFolders, saveFolders } from "./folderStorage";

const STORAGE_PREFIX = "devchat_";
const STORAGE_VERSION = 1;

const KEYS = {
  conversations: `${STORAGE_PREFIX}conversations`,
  apiConfig: `${STORAGE_PREFIX}api_config`,
  settings: `${STORAGE_PREFIX}settings`,
  version: `${STORAGE_PREFIX}version`,
};

const DEFAULT_SETTINGS: Settings = {
  enterToSend: true,
  showTimestamps: true,
  autoScroll: true,
  compactMode: false,
  fontSize: "base",
  sendWithCtrlEnter: false,
  streamResponses: true,
  showTokenCount: false,
  developerMode: false,
  codeHighlightTheme: "default",
  defaultSystemPrompt: "",
  hasCompletedOnboarding: false,
};

export { DEFAULT_SETTINGS };

const DEFAULT_API_CONFIG: ApiConfig = {
  provider: "openrouter",
  apiKey: "",
  model: "openrouter/free",
};

// Sync wrappers (reads from localStorage, writes to both localStorage + IndexedDB)
function readJsonSync<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJsonSync(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadConversations(): Conversation[] {
  return readJsonSync<Conversation[]>(KEYS.conversations) ?? [];
}

export function saveConversations(conversations: Conversation[]): boolean {
  writeJsonSync(KEYS.conversations, conversations);
  // Also persist to IndexedDB in background
  idbSet(KEYS.conversations, conversations);
  return true;
}

export function loadApiConfig(): ApiConfig {
  return readJsonSync<ApiConfig>(KEYS.apiConfig) ?? DEFAULT_API_CONFIG;
}

export function saveApiConfig(config: ApiConfig): boolean {
  writeJsonSync(KEYS.apiConfig, config);
  idbSet(KEYS.apiConfig, config);
  return true;
}

export function loadSettings(): Settings {
  return readJsonSync<Settings>(KEYS.settings) ?? DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): boolean {
  writeJsonSync(KEYS.settings, settings);
  idbSet(KEYS.settings, settings);
  return true;
}

export function clearAllData(): boolean {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    saveFolders([]);
    idbClear();
    return true;
  } catch {
    return false;
  }
}

export function exportAllData(): StoredData & { folders: Folder[] } {
  return {
    version: STORAGE_VERSION,
    conversations: loadConversations(),
    apiConfig: loadApiConfig(),
    settings: loadSettings(),
    folders: loadFolders(),
  };
}

export function importData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.conversations)) return false;
  if (typeof d.apiConfig !== "object" || d.apiConfig === null) return false;
  if (typeof d.settings !== "object" || d.settings === null) return false;

  writeJsonSync(KEYS.conversations, d.conversations);
  writeJsonSync(KEYS.apiConfig, d.apiConfig);
  writeJsonSync(KEYS.settings, d.settings);
  writeJsonSync(KEYS.version, STORAGE_VERSION);

  if (Array.isArray(d.folders)) {
    saveFolders(d.folders as Folder[]);
  }

  idbSet(KEYS.conversations, d.conversations);
  idbSet(KEYS.apiConfig, d.apiConfig);
  idbSet(KEYS.settings, d.settings);
  idbSet(KEYS.version, STORAGE_VERSION);
  return true;
}

export function getStorageSize(): number {
  let total = 0;
  try {
    for (const key of Object.values(KEYS)) {
      const item = localStorage.getItem(key);
      if (item) total += item.length * 2;
    }
  } catch {
    // ignore
  }
  return total;
}
