import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import type { Attachment } from "../../types";
import { FileUploadButton, AttachmentPreview } from "./FileUpload";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled: boolean;
  enterToSend: boolean;
  sendWithCtrlEnter: boolean;
  defaultValue?: string;
  onValueConsumed?: () => void;
}

export default function ChatInput({ onSend, onStop, isGenerating, disabled, enterToSend, sendWithCtrlEnter, defaultValue, onValueConsumed }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultValue) {
      setInput(defaultValue);
      onValueConsumed?.();
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) { el.focus(); const len = el.value.length; el.setSelectionRange(len, len); }
      });
    }
  }, [defaultValue, onValueConsumed]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxH = window.innerWidth < 640 ? 140 : 200;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, []);

  useEffect(() => { adjustHeight(); }, [input, adjustHeight]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || disabled || isGenerating) return;
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
  }, [input, attachments, disabled, isGenerating, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (enterToSend) {
        e.preventDefault();
        handleSubmit();
      }
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      if (sendWithCtrlEnter) {
        e.preventDefault();
        handleSubmit();
      }
    }
  }, [enterToSend, sendWithCtrlEnter, handleSubmit]);

  const handleDrop = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024;
    const process = async () => {
      const newAtt: Attachment[] = [];
      for (const f of arr) {
        if (f.size > maxSize) continue;
        if (!imageTypes.includes(f.type) && !f.type.startsWith("text/")) continue;
        const dataUrl = await new Promise<string>((r) => {
          const reader = new FileReader();
          reader.onload = () => r(reader.result as string);
          reader.readAsDataURL(f);
        });
        newAtt.push({ id: crypto.randomUUID(), name: f.name, type: f.type, size: f.size, dataUrl });
      }
      if (newAtt.length > 0) setAttachments((prev) => [...prev, ...newAtt]);
    };
    process();
  }, []);

  const hasInput = input.trim().length > 0 || attachments.length > 0;

  const getHint = () => {
    if (enterToSend) return "Enter to send · Shift+Enter for new line";
    if (sendWithCtrlEnter) return "Ctrl+Enter to send · Enter for new line";
    return "Enter for new line";
  };

  return (
    <div className="bg-[#0A0B10] safe-area-bottom flex-shrink-0">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-2">
        <div
          className="bg-[#14151C] rounded-2xl border border-white/[0.06] focus-within:border-indigo-500/30 transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleDrop(e.dataTransfer.files); }}
        >
          <AttachmentPreview
            attachments={attachments}
            onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
          />

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? "Add a message (optional)..." : "Ask DEVChat anything about code..."}
              disabled={disabled && !isGenerating}
              rows={1}
              className="w-full bg-transparent text-[#F5F7FA] text-sm placeholder:text-[#4B5563] resize-none px-4 py-3.5 pr-24 focus:outline-none disabled:opacity-50 min-h-[52px] leading-relaxed"
            />
            <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
              <FileUploadButton
                attachments={attachments}
                onChange={setAttachments}
                disabled={disabled && !isGenerating}
              />
              {isGenerating ? (
                <button onClick={onStop} className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95" aria-label="Stop generating">
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!hasInput || disabled}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${
                    hasInput && !disabled
                      ? "bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25"
                      : "bg-white/[0.06] text-[#4B5563] cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-[#3B4050] select-none">
          {getHint()}
        </p>
      </div>
    </div>
  );
}
