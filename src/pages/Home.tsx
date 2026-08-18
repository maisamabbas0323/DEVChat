import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";
import EmptyChatState from "../components/chat/EmptyChatState";
import ChatInput from "../components/chat/ChatInput";

export default function Home() {
  const navigate = useNavigate();
  const { createConversation } = useChatStore();
  const { apiConfig, settings } = useSettingsStore();
  const [pendingInput, setPendingInput] = useState<string | undefined>(undefined);

  const handleSend = useCallback(
    (content: string) => {
      if (!apiConfig.apiKey) {
        navigate("/api");
        return;
      }
      const id = createConversation(apiConfig.model);
      navigate(`/chat/${id}`, { state: { initialPrompt: content } });
    },
    [apiConfig.model, apiConfig.apiKey, createConversation, navigate]
  );

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      setPendingInput(prompt);
    },
    []
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <EmptyChatState onSelectPrompt={handleSelectPrompt} />
      </div>
      <ChatInput
        onSend={handleSend}
        onStop={() => {}}
        isGenerating={false}
        disabled={false}
        enterToSend={settings.enterToSend}
        sendWithCtrlEnter={settings.sendWithCtrlEnter}
        defaultValue={pendingInput}
        onValueConsumed={() => setPendingInput(undefined)}
      />
    </div>
  );
}
