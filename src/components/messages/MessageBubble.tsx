import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw, Pencil, X, Check as CheckIcon } from "lucide-react";
import type { Message } from "../../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { copyToClipboard, formatTimestamp } from "../../lib/utils";

interface MessageBubbleProps {
  message: Message;
  showTimestamp: boolean;
  compact: boolean;
  showTokenCount: boolean;
  developerMode: boolean;
  model?: string;
  fontSize?: "sm" | "base" | "lg";
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  isHighlighted?: boolean;
}

const FONT_SIZE_CLASS = { sm: "text-xs", base: "text-sm", lg: "text-base" } as const;

export default function MessageBubble({ message, showTimestamp, compact, showTokenCount, developerMode, model, fontSize = "base", onRetry, onEdit, isHighlighted }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isUser = message.role === "user";

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(message.content);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setEditing(false);
  }, [editContent, message.content, message.id, onEdit]);

  const tokenEstimate = message.tokenUsage ? message.tokenUsage.total : Math.ceil(message.content.length / 4);

  const mb = compact ? "mb-2" : "mb-4";
  const mbAssistant = compact ? "mb-2" : "mb-5";
  const textSize = FONT_SIZE_CLASS[fontSize];

  if (isUser) {
    return (
      <div className={`flex justify-end ${mb} ${isHighlighted ? "animate-highlight-pulse" : ""}`} id={`message-${message.id}`}>
        <div className="max-w-[85%] sm:max-w-[75%]">
          {editing ? (
            <div className="bg-indigo-600/15 border border-indigo-500/20 rounded-2xl rounded-br-md overflow-hidden">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full bg-transparent ${textSize} text-[#E2E8F0] p-4 resize-none focus:outline-none min-h-[60px]`}
                autoFocus
              />
              <div className="flex items-center justify-end gap-1 px-3 pb-2">
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04] transition-colors" aria-label="Cancel edit">
                  <X className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleSaveEdit} className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/[0.1] transition-colors" aria-label="Save edit">
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 rounded-2xl rounded-br-md bg-indigo-600/15 border border-indigo-500/20 group relative">
              <p className={`${textSize} leading-relaxed text-[#E2E8F0] whitespace-pre-wrap break-words overflow-wrap-anywhere`}>
                {message.content}
              </p>
              {onEdit && (
                <button onClick={() => { setEditContent(message.content); setEditing(true); }} className="absolute top-2 right-2 p-1.5 rounded-lg text-[#4B5563] hover:text-[#D1D5DB] hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100 touch-show focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Edit message">
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {showTimestamp && <p className="text-[10px] text-[#4B5563] mt-1.5 text-right">{formatTimestamp(message.createdAt)}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${mbAssistant} group ${isHighlighted ? "animate-highlight-pulse" : ""}`} id={`message-${message.id}`}>
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center mt-0.5 shadow-md shadow-purple-500/10">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`${textSize} font-semibold text-[#F5F7FA]`}>DEVChat</span>
          {showTimestamp && <span className="text-[10px] text-[#4B5563]">{formatTimestamp(message.createdAt)}</span>}
        </div>
        <div className={`${textSize} leading-relaxed min-w-0`}>
          <MarkdownRenderer content={message.content} />
        </div>
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 touch-show transition-opacity">
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label={copied ? "Copied" : "Copy response"}>
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="w-3.5 h-3.5" />Copy</>}
          </button>
          {onRetry && (
            <button onClick={() => onRetry(message.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Regenerate">
              <RotateCcw className="w-3.5 h-3.5" />Retry
            </button>
          )}
        </div>
        {showTokenCount && (
          <p className="text-[10px] text-[#3B4050] mt-1">
            {message.tokenUsage
              ? `${message.tokenUsage.total} tokens (${message.tokenUsage.prompt} prompt + ${message.tokenUsage.completion} completion)`
              : `~${tokenEstimate} tokens (estimated)`}
          </p>
        )}
        {developerMode && message.content && (
          <div className="mt-2 text-[10px] text-[#3B4050] space-y-0.5">
            {model && <p>Model: {model}</p>}
            {message.tokenUsage
              ? <p>Tokens: {message.tokenUsage.total} ({message.tokenUsage.prompt}p + {message.tokenUsage.completion}c)</p>
              : <p>Tokens: ~{tokenEstimate} (estimated)</p>}
            <p>ID: {message.id.slice(0, 8)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
