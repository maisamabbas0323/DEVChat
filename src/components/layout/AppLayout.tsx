import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeft, Keyboard } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSettingsStore } from "../../store/settingsStore";
import Toolbar from "./Toolbar";
import MobileDrawer from "./MobileDrawer";
import ConversationSidebar from "../sidebar/ConversationSidebar";
import Onboarding from "../onboarding/Onboarding";
import ShortcutsHelp from "../ui/ShortcutsHelp";
import { useKeyboardShortcuts } from "../../lib/hooks";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createConversation } = useChatStore();
  const { apiConfig, toggleMobileDrawer, isSidebarCollapsed, toggleSidebar, settings } = useSettingsStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleShowHelp = useCallback(() => setShowShortcuts((v) => !v), []);

  useKeyboardShortcuts(handleShowHelp);

  useEffect(() => {
    useSettingsStore.getState().closeMobileDrawer();
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const state = useSettingsStore.getState();
        if (state.isMobileDrawerOpen) {
          state.closeMobileDrawer();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewChat = () => {
    const id = createConversation(apiConfig.model);
    navigate(`/chat/${id}`);
  };

  return (
    <div className="flex h-dvh h-screen bg-[#0A0B10] text-[#F5F7FA] overflow-hidden">
      {!settings.hasCompletedOnboarding && <Onboarding />}
      <ShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <Toolbar />

      {/* Spacer for fixed toolbar */}
      <div className="hidden lg:block w-[88px] flex-shrink-0" />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full flex-shrink-0 relative">
        <div
          className={`flex flex-col h-full bg-[#0D0E14] border-r border-white/[0.04] transition-all duration-300 ${
            isSidebarCollapsed ? "w-0 overflow-hidden" : "w-[260px]"
          }`}
        >
          <ConversationSidebar onSelectConversation={(id) => navigate(`/chat/${id}`)} />
        </div>
        <button
          onClick={toggleSidebar}
          className="absolute top-4 -right-3 z-30 w-6 h-6 rounded-full bg-[#1A1B26] border border-white/[0.06] flex items-center justify-center text-[#4B5563] hover:text-[#D1D5DB] hover:bg-[#1A1B26] transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer>
        <ConversationSidebar onSelectConversation={(id) => { navigate(`/chat/${id}`); }} />
      </MobileDrawer>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="flex items-center h-12 px-3 sm:px-4 flex-shrink-0 lg:hidden gap-3 border-b border-white/[0.04]">
          <button
            onClick={toggleMobileDrawer}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-[#9CA3AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#F5F7FA] truncate">DEVChat</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-[#9CA3AF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewChat}
            className="px-3 h-8 rounded-lg bg-white/[0.06] text-sm text-[#9CA3AF] hover:text-white hover:bg-white/[0.1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            + New
          </button>
        </header>

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
