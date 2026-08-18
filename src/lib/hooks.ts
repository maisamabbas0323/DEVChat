import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";

export function useTheme() {
  return { isDark: true };
}

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const navigate = useNavigate();
  const { createConversation } = useChatStore();
  const { apiConfig } = useSettingsStore();

  const handler = useCallback((e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key === "n") {
      e.preventDefault();
      const id = createConversation(apiConfig.model);
      navigate(`/chat/${id}`);
    }

    if (mod && e.key === ",") {
      e.preventDefault();
      navigate("/settings");
    }

    if (mod && e.shiftKey && e.key === "?") {
      e.preventDefault();
      onShowHelp();
    }
  }, [navigate, createConversation, apiConfig.model, onShowHelp]);

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}
