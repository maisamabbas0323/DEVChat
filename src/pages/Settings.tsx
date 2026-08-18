import { useState, useCallback, useRef } from "react";
import {
  Download,
  Upload,
  Trash2,
  Type,
  MessageSquare,
  Database,
  ArrowLeft,
  Code2,
  Braces,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../store/settingsStore";
import { useChatStore } from "../store/chatStore";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/dialogs/ConfirmDialog";
import {
  exportAllData,
  importData,
  clearAllData,
  saveConversations,
  saveApiConfig,
  saveSettings,
  getStorageSize,
  DEFAULT_SETTINGS,
} from "../lib/storage";
import { saveFolders } from "../lib/folderStorage";
import { formatFileSize } from "../lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, updateApiConfig } = useSettingsStore();
  const { init: initChat } = useChatStore();
  const { init: initSettings } = useSettingsStore();
  const [showClearConversations, setShowClearConversations] = useState(false);
  const [showClearApi, setShowClearApi] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);
  const [showResetSettings, setShowResetSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleExportAll = useCallback(() => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devchat-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (importData(data)) {
            setImportStatus({ type: "success", message: "Data imported successfully. Reloading..." });
            setTimeout(() => { initChat(); initSettings(); setImportStatus(null); }, 1500);
          } else {
            setImportStatus({ type: "error", message: "Invalid file format. Please select a valid DEVChat export file." });
          }
        } catch {
          setImportStatus({ type: "error", message: "Could not read the file. Make sure it is valid JSON." });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [initChat, initSettings]
  );

  const handleClearConversations = useCallback(() => { saveConversations([]); saveFolders([]); initChat(); setShowClearConversations(false); }, [initChat]);
  const handleClearApi = useCallback(() => { saveApiConfig({ provider: "openrouter", apiKey: "", model: "openrouter/free" }); updateApiConfig({ apiKey: "", model: "openrouter/free" }); setShowClearApi(false); }, [updateApiConfig]);
  const handleClearAll = useCallback(() => { clearAllData(); initChat(); initSettings(); setShowClearAll(false); }, [initChat, initSettings]);

  const handleResetSettings = useCallback(() => {
    const current = useSettingsStore.getState().settings;
    const reset = { ...DEFAULT_SETTINGS, hasCompletedOnboarding: current.hasCompletedOnboarding };
    saveSettings(reset);
    initSettings();
    setShowResetSettings(false);
  }, [initSettings]);

  const handleChatToggle = useCallback((key: string, value: boolean) => {
    if (key === "enterToSend" && value) {
      updateSettings({ enterToSend: true, sendWithCtrlEnter: false });
    } else if (key === "sendWithCtrlEnter" && value) {
      updateSettings({ sendWithCtrlEnter: true, enterToSend: false });
    } else {
      updateSettings({ [key]: value });
    }
  }, [updateSettings]);

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${checked ? "bg-indigo-500" : "bg-[#2A2D3A]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );

  const Section = ({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl bg-[#14151C]/60 border border-white/[0.04] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#6B7280]" />
        </div>
        <h2 className="text-sm font-semibold text-[#F5F7FA]">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/[0.04] text-[#6B7280] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">Settings</h1>
            <p className="text-sm text-[#4B5563]">Customize your DEVChat experience.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Appearance — Font Size */}
          <Section icon={Type} title="Appearance">
            <div>
              <p className="text-sm text-[#D1D5DB] mb-3">Chat font size</p>
              <div className="flex gap-2">
                {(["sm", "base", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      settings.fontSize === size
                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                        : "bg-white/[0.03] text-[#6B7280] border border-white/[0.04] hover:bg-white/[0.06]"
                    }`}
                  >
                    {size === "sm" ? "Small" : size === "base" ? "Default" : "Large"}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className={`leading-relaxed ${settings.fontSize === "sm" ? "text-xs" : settings.fontSize === "lg" ? "text-base" : "text-sm"} text-[#D1D5DB]`}>
                  Preview: This is how your chat messages will appear with the {settings.fontSize === "sm" ? "small" : settings.fontSize === "lg" ? "large" : "default"} font size.
                </p>
              </div>
            </div>
          </Section>

          {/* Chat */}
          <Section icon={MessageSquare} title="Chat">
            <div className="space-y-1">
              {[
                { key: "enterToSend" as const, label: "Enter to send", desc: "Press Enter to send messages" },
                { key: "sendWithCtrlEnter" as const, label: "Ctrl+Enter to send", desc: "Hold Ctrl/Cmd and press Enter to send" },
                { key: "showTimestamps" as const, label: "Show timestamps", desc: "Display time on messages" },
                { key: "autoScroll" as const, label: "Auto-scroll", desc: "Scroll to bottom on new messages" },
                { key: "compactMode" as const, label: "Compact mode", desc: "Reduce spacing in chat" },
                { key: "streamResponses" as const, label: "Stream responses", desc: "Show tokens as they arrive" },
                { key: "showTokenCount" as const, label: "Show token count", desc: "Display token usage per message" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-[#D1D5DB]">{item.label}</p>
                    <p className="text-xs text-[#4B5563]">{item.desc}</p>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={(v) => handleChatToggle(item.key, v)} label={item.label} />
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.04]">
              <p className="text-sm text-[#D1D5DB] mb-2">Default system prompt</p>
              <textarea
                value={settings.defaultSystemPrompt}
                onChange={(e) => updateSettings({ defaultSystemPrompt: e.target.value })}
                placeholder="You are a helpful senior software engineer..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-[#D1D5DB] placeholder:text-[#3B4050] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none leading-relaxed"
              />
              <p className="mt-1 text-[10px] text-[#3B4050]">Applied to all new conversations unless overridden per-chat.</p>
            </div>
          </Section>

          {/* Developer */}
          <Section icon={Code2} title="Developer">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-[#D1D5DB]">Developer mode</p>
                  <p className="text-xs text-[#4B5563]">Show raw JSON, token counts, and model info</p>
                </div>
                <Toggle checked={settings.developerMode} onChange={(v) => updateSettings({ developerMode: v })} label="Developer mode" />
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3">
                  <Braces className="w-4 h-4 text-[#6B7280]" />
                  <p className="text-sm text-[#D1D5DB]">Code highlight theme</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["default", "github", "monokai", "dracula"] as const).map((th) => (
                    <button
                      key={th}
                      onClick={() => updateSettings({ codeHighlightTheme: th })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium capitalize transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        settings.codeHighlightTheme === th
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                          : "bg-white/[0.03] text-[#6B7280] border border-white/[0.04] hover:bg-white/[0.06] hover:text-[#D1D5DB]"
                      }`}
                    >
                      {th === "default" ? "Default" : th === "github" ? "GitHub" : th === "monokai" ? "Monokai" : "Dracula"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Data */}
          <Section icon={Database} title="Data & Storage">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-[#D1D5DB]">Local storage</p>
                  <p className="text-xs text-[#4B5563]">{formatFileSize(getStorageSize())} used in browser</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={handleExportAll}>
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> Import
                </Button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              </div>

              {importStatus && (
                <p className={`text-xs ${importStatus.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {importStatus.message}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.04]">
                <Button variant="ghost" size="sm" onClick={() => setShowClearConversations(true)}>
                  <Trash2 className="w-4 h-4" /> Clear conversations
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowClearApi(true)}>
                  <Trash2 className="w-4 h-4" /> Clear API config
                </Button>
                <Button variant="danger" size="sm" onClick={() => setShowClearAll(true)}>
                  <Trash2 className="w-4 h-4" /> Clear all data
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowResetSettings(true)}>
                  <Trash2 className="w-4 h-4" /> Reset settings
                </Button>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-8 pb-8 text-center">
          <p className="text-xs text-[#2A2D3A]">DEVChat v0.1.0 — Built with React, Vite, and OpenRouter</p>
        </div>

        <ConfirmDialog open={showClearConversations} title="Clear conversations" message="Delete all conversations and messages? This cannot be undone." confirmLabel="Clear all" onConfirm={handleClearConversations} onCancel={() => setShowClearConversations(false)} />
        <ConfirmDialog open={showClearApi} title="Clear API configuration" message="Remove your saved API key and model selection?" confirmLabel="Clear" onConfirm={handleClearApi} onCancel={() => setShowClearApi(false)} />
        <ConfirmDialog open={showClearAll} title="Clear all data" message="This will permanently delete all conversations, settings, and API configuration. This action cannot be undone." confirmLabel="Delete everything" onConfirm={handleClearAll} onCancel={() => setShowClearAll(false)} />
        <ConfirmDialog open={showResetSettings} title="Reset settings" message="Reset all settings to defaults? Your conversations, API key, and folders will not be affected." confirmLabel="Reset" onConfirm={handleResetSettings} onCancel={() => setShowResetSettings(false)} />
      </div>
    </div>
  );
}
