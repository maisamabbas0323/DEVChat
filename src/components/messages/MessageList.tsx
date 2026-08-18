import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import MessageBubble from "./MessageBubble";
import Spinner from "../ui/Spinner";

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compact: boolean;
  showTokenCount: boolean;
  developerMode: boolean;
  model?: string;
  fontSize?: "sm" | "base" | "lg";
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  highlightMessageId?: string | null;
}

export default function MessageList({
  messages,
  isGenerating,
  autoScroll,
  showTimestamps,
  compact,
  showTokenCount,
  developerMode,
  model,
  fontSize = "base",
  onRetry,
  onEdit,
  highlightMessageId,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const thinkingSize = { sm: "text-xs", base: "text-sm", lg: "text-base" }[fontSize];

  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, autoScroll]);

  if (messages.length === 0 && !isGenerating) return null;

  const thinkingGap = compact ? "mb-2" : "mb-5";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            showTimestamp={showTimestamps}
            compact={compact}
            showTokenCount={showTokenCount}
            developerMode={developerMode}
            model={model}
            fontSize={fontSize}
            onRetry={onRetry}
            onEdit={onEdit}
            isHighlighted={msg.id === highlightMessageId}
          />
        ))}
        {isGenerating && (
          <div className={`flex gap-3 ${thinkingGap}`}>
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center mt-0.5 shadow-md shadow-purple-500/10">
              <Spinner size="sm" />
            </div>
            <div className="flex items-center min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <span className={`${thinkingSize} text-[#6B7280]`}>
                  Thinking
                </span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
