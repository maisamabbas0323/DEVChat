import { create } from "zustand";
import type { ApiConfig, Settings } from "../types";
import {
  loadApiConfig,
  saveApiConfig,
  loadSettings,
  saveSettings,
} from "../lib/storage";

interface SettingsState {
  apiConfig: ApiConfig;
  settings: Settings;
  isMobileDrawerOpen: boolean;
  isSidebarCollapsed: boolean;

  init: () => void;
  updateApiConfig: (config: Partial<ApiConfig>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiConfig: { provider: "openrouter", apiKey: "", model: "openrouter/free" },
  settings: {
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
  },
  isMobileDrawerOpen: false,
  isSidebarCollapsed: false,

  init: () => {
    const apiConfig = loadApiConfig();
    const settings = loadSettings();
    try {
      const raw = localStorage.getItem("devchat_sidebar_collapsed");
      const collapsed = raw === "true";
      set({ apiConfig, settings, isSidebarCollapsed: collapsed });
    } catch {
      set({ apiConfig, settings });
    }
  },

  updateApiConfig: (config: Partial<ApiConfig>) => {
    const updated = { ...get().apiConfig, ...config };
    saveApiConfig(updated);
    set({ apiConfig: updated });
  },

  updateSettings: (settings: Partial<Settings>) => {
    const updated = { ...get().settings, ...settings };
    saveSettings(updated);
    set({ settings: updated });
  },

  toggleMobileDrawer: () =>
    set({ isMobileDrawerOpen: !get().isMobileDrawerOpen }),

  closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),

  toggleSidebar: () => {
    const next = !get().isSidebarCollapsed;
    set({ isSidebarCollapsed: next });
    try {
      localStorage.setItem("devchat_sidebar_collapsed", String(next));
    } catch {
      // ignore
    }
  },
}));
