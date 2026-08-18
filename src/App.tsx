import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useChatStore } from "./store/chatStore";
import { useSettingsStore } from "./store/settingsStore";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ApiConfig from "./pages/ApiConfig";
import Settings from "./pages/Settings";

export default function App() {
  const initChat = useChatStore((s) => s.init);
  const initSettings = useSettingsStore((s) => s.init);

  useEffect(() => {
    initChat();
    initSettings();
  }, [initChat, initSettings]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/api" element={<ApiConfig />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
