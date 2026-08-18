import { useEffect, useCallback, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";
import MessageList from "../components/messages/MessageList";
import ChatInput from "../components/chat/ChatInput";
import QuickActions from "../components/chat/QuickActions";
import EmptyChatState from "../components/chat/EmptyChatState";
import ConfirmDialog from "../components/dialogs/ConfirmDialog";
import { streamChat, sendChat, formatMessagesForApi, type Usage } from "../services/openrouter";
import { generateId } from "../lib/utils";
import { Trash2 } from "lucide-react";
import type { Attachment } from "../types";
import SystemPrompt from "../components/chat/SystemPrompt";
import ConversationSearch from "../components/chat/ConversationSearch";

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    conversations,
    isGenerating,
    setGenerating,
    setAbortController,
    addMessage,
    updateLastAssistantMessage,
    removeMessagesFrom,
    clearMessages,
    createConversation,
    setActiveConversation,
    setSystemPrompt,
  } = useChatStore();
  const { apiConfig, settings } = useSettingsStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | undefined>(undefined);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const hasInjectedPrompt = useRef(false);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  useEffect(() => {
    if (
      conversation &&
      conversation.messages.length === 0 &&
      location.state?.initialPrompt &&
      !hasInjectedPrompt.current
    ) {
      hasInjectedPrompt.current = true;
      const prompt = location.state.initialPrompt as string;
      setPendingInput(prompt);
      window.history.replaceState({}, "");
    }
  }, [conversation, location.state]);

  const sendMessage = useCallback(
    async (conversationId: string, content: string, model: string, attachments?: Attachment[]) => {
      const conv = useChatStore.getState().conversations.find((c) => c.id === conversationId);
      const sysPrompt = conv?.systemPrompt || settings.defaultSystemPrompt;

      const userMsg = {
        id: generateId(),
        role: "user" as const,
        content,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
        createdAt: Date.now(),
      };
      addMessage(conversationId, userMsg);

      const assistantMsg = {
        id: generateId(),
        role: "assistant" as const,
        content: "",
        createdAt: Date.now(),
      };
      addMessage(conversationId, assistantMsg);

      const allMessages = [...(conv?.messages ?? []), userMsg];

      const abortCtrl = new AbortController();
      setAbortController(abortCtrl);
      setGenerating(true);

      try {
        const apiMessages = formatMessagesForApi(allMessages, sysPrompt || undefined);

        if (settings.streamResponses) {
          let fullContent = "";
          let usage: Usage | undefined;
          try {
            for await (const chunk of streamChat({
              apiKey: apiConfig.apiKey,
              model,
              messages: apiMessages,
              signal: abortCtrl.signal,
            })) {
              if (typeof chunk === "string") {
                fullContent += chunk;
                updateLastAssistantMessage(conversationId, fullContent);
              } else if (chunk.type === "usage") {
                usage = chunk.usage;
              }
            }
            if (usage) {
              updateLastAssistantMessage(conversationId, fullContent, { prompt: usage.prompt_tokens, completion: usage.completion_tokens, total: usage.total_tokens });
            }
          } catch (streamErr) {
            if (streamErr instanceof DOMException && streamErr.name === "AbortError") {
              return;
            }
            const result = await sendChat({
              apiKey: apiConfig.apiKey,
              model,
              messages: apiMessages,
              signal: abortCtrl.signal,
            });
            updateLastAssistantMessage(conversationId, result.content, result.usage ? { prompt: result.usage.prompt_tokens, completion: result.usage.completion_tokens, total: result.usage.total_tokens } : undefined);
          }
        } else {
          const result = await sendChat({
            apiKey: apiConfig.apiKey,
            model,
            messages: apiMessages,
            signal: abortCtrl.signal,
          });
          updateLastAssistantMessage(conversationId, result.content, result.usage ? { prompt: result.usage.prompt_tokens, completion: result.usage.completion_tokens, total: result.usage.total_tokens } : undefined);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        updateLastAssistantMessage(
          conversationId,
          `**Error:** ${msg}\n\nCheck your [API Configuration](/api) and try again.`
        );
      } finally {
        setGenerating(false);
        setAbortController(null);
      }
    },
    [apiConfig.apiKey, settings.streamResponses, addMessage, updateLastAssistantMessage, setGenerating, setAbortController]
  );

  const handleSend = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!conversationId) return;
      if (!apiConfig.apiKey) {
        navigate("/api");
        return;
      }
      await sendMessage(conversationId, content, apiConfig.model, attachments);
    },
    [conversationId, apiConfig, sendMessage, navigate]
  );

  const handleRetry = useCallback(
    async (messageId: string) => {
      if (!conversationId || !apiConfig.apiKey) return;
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;

      const msgIdx = conv.messages.findIndex((m) => m.id === messageId);
      if (msgIdx === -1) return;

      const userMsg = conv.messages[msgIdx];

      removeMessagesFrom(conversationId, messageId);
      await sendMessage(conversationId, userMsg.content, apiConfig.model);
    },
    [conversationId, apiConfig, conversations, removeMessagesFrom, sendMessage]
  );

  const handleEdit = useCallback(
    async (messageId: string, newContent: string) => {
      if (!conversationId || !apiConfig.apiKey) return;
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;

      const msgIdx = conv.messages.findIndex((m) => m.id === messageId);
      if (msgIdx === -1) return;

      removeMessagesFrom(conversationId, messageId);
      await sendMessage(conversationId, newContent, apiConfig.model);
    },
    [conversationId, apiConfig, conversations, removeMessagesFrom, sendMessage]
  );

  const handleStop = useCallback(() => {
    const ctrl = useChatStore.getState().abortController;
    if (ctrl) ctrl.abort();
    setGenerating(false);
    setAbortController(null);
  }, [setGenerating, setAbortController]);

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      setPendingInput(prompt);
    },
    []
  );

  const handleJumpToMessage = useCallback((messageId: string) => {
    setHighlightMessageId(messageId);
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightMessageId(null), 2000);
  }, []);

  if (!conversationId) {
    return <EmptyChatState onSelectPrompt={handleSelectPrompt} />;
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#4B5563] mb-4">Conversation not found</p>
          <button
            onClick={() => {
              const id = createConversation(apiConfig.model);
              navigate(`/chat/${id}`);
            }}
            className="text-sm text-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-3 py-2"
          >
            Start a new chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {conversation.messages.length > 0 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#4B5563] truncate">{conversation.model}</span>
          </div>
          <div className="flex items-center gap-1">
            <ConversationSearch
              messages={conversation.messages}
              onJumpToMessage={handleJumpToMessage}
            />
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#3B4050] hover:text-red-400 hover:bg-red-500/[0.06] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      )}

      <MessageList
        messages={conversation.messages}
        isGenerating={isGenerating}
        autoScroll={settings.autoScroll}
        showTimestamps={settings.showTimestamps}
        compact={settings.compactMode}
        showTokenCount={settings.showTokenCount}
        developerMode={settings.developerMode}
        model={apiConfig.model}
        fontSize={settings.fontSize}
        onRetry={handleRetry}
        onEdit={handleEdit}
        highlightMessageId={highlightMessageId}
      />

      {conversation.messages.length === 0 && !isGenerating && (
        <>
          <SystemPrompt
            value={conversation.systemPrompt}
            onChange={(prompt) => setSystemPrompt(conversationId, prompt)}
          />
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <EmptyChatState onSelectPrompt={handleSelectPrompt} />
          </div>
        </>
      )}

      {conversation.messages.length > 0 &&
        conversation.messages.length < 3 &&
        !isGenerating && <QuickActions onSelect={handleSelectPrompt} />}

      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isGenerating={isGenerating}
        disabled={!apiConfig.apiKey}
        enterToSend={settings.enterToSend}
        sendWithCtrlEnter={settings.sendWithCtrlEnter}
        defaultValue={pendingInput}
        onValueConsumed={() => setPendingInput(undefined)}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear messages"
        message="Remove all messages from this conversation? This action cannot be undone."
        confirmLabel="Clear"
        onConfirm={() => {
          clearMessages(conversationId);
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
