import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Settings,
  Key,
  Home,
} from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSettingsStore } from "../../store/settingsStore";
import Tooltip from "../ui/Tooltip";

export default function Toolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createConversation } = useChatStore();
  const { apiConfig } = useSettingsStore();

  const handleNewChat = () => {
    const id = createConversation(apiConfig.model);
    navigate(`/chat/${id}`);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { icon: Home, label: "Home", description: "Go to home screen", path: "/", onClick: () => navigate("/") },
    { icon: Plus, label: "New Chat", description: "Start a new conversation", path: "__new__", onClick: handleNewChat, isPlus: true },
    { icon: MessageSquare, label: "Recent", description: "Browse conversations", path: "/chat", onClick: () => navigate("/") },
    { icon: Key, label: "API Config", description: "Configure OpenRouter key", path: "/api", onClick: () => navigate("/api") },
    { icon: Settings, label: "Settings", description: "Customize DEVChat", path: "/settings", onClick: () => navigate("/settings") },
  ];

  return (
    <nav
      className="
        hidden lg:flex flex-col items-center
        fixed left-4 top-1/2 -translate-y-1/2
        w-[64px]
        py-3 px-2
        gap-1.5
        rounded-2xl
        bg-white/[0.03]
        backdrop-blur-2xl
        border border-white/[0.06]
        shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]
        overflow-visible
        z-50
      "
      aria-label="Navigation toolbar"
    >
      {/* Glass shine */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-indigo-500/[0.06] to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-cyan-500/[0.04] to-transparent rounded-full blur-2xl" />
      </div>

      {/* Logo */}
      <div className="relative w-full flex justify-center pb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 mx-auto h-px bg-white/[0.06]" />

      {/* Nav icons */}
      <div className="flex flex-col items-center gap-1 w-full pt-2">
        {navItems.map((item) => {
          const active = item.path === "__new__" ? false : isActive(item.path);
          return (
            <Tooltip key={item.label} content={item.label} description={item.description} side="right" delay={250}>
              <button
                onClick={item.onClick}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${item.isPlus
                    ? "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.06] active:scale-95"
                    : active
                      ? "bg-white/[0.08] text-white"
                      : "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.06] active:scale-95"
                  }
                `}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="w-5 h-5" />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
