import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import type { Message } from "../../types";

interface ConversationSearchProps {
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
}

interface MatchInfo {
  messageId: string;
  messageIndex: number;
}

export default function ConversationSearch({ messages, onJumpToMessage }: ConversationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setCurrentIdx(0);
      return;
    }
    const q = query.toLowerCase();
    const found: MatchInfo[] = [];
    messages.forEach((m, i) => {
      if (m.content.toLowerCase().includes(q)) {
        found.push({ messageId: m.id, messageIndex: i });
      }
    });
    setMatches(found);
    setCurrentIdx(found.length > 0 ? 0 : -1);
  }, [query, messages]);

  const jumpTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= matches.length) return;
    setCurrentIdx(idx);
    onJumpToMessage(matches[idx].messageId);
  }, [matches, onJumpToMessage]);

  const handlePrev = useCallback(() => {
    jumpTo(currentIdx > 0 ? currentIdx - 1 : matches.length - 1);
  }, [currentIdx, matches.length, jumpTo]);

  const handleNext = useCallback(() => {
    jumpTo(currentIdx < matches.length - 1 ? currentIdx + 1 : 0);
  }, [currentIdx, matches.length, jumpTo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) { handlePrev(); } else { handleNext(); }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  }, [handlePrev, handleNext]);

  const toggle = useCallback(() => {
    setIsOpen((o) => {
      if (o) setQuery("");
      return !o;
    });
  }, []);

  if (!isOpen) {
    return (
      <button onClick={toggle} className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Search in conversation">
        <Search className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-150">
      <div className="flex items-center gap-1.5 bg-[#14151C] border border-white/[0.06] rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500/30 transition-colors">
        <Search className="w-3.5 h-3.5 text-[#4B5563] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="bg-transparent text-sm text-[#F5F7FA] placeholder:text-[#4B5563] focus:outline-none w-32 sm:w-48"
        />
        {query && (
          <span className="text-[11px] text-[#4B5563] flex-shrink-0 tabular-nums">
            {matches.length > 0 ? `${currentIdx + 1}/${matches.length}` : "No results"}
          </span>
        )}
        <div className="flex items-center gap-0.5">
          <button onClick={handlePrev} disabled={matches.length === 0} className="p-0.5 rounded text-[#4B5563] hover:text-[#9CA3AF] disabled:opacity-30 transition-colors focus-visible:outline-none" aria-label="Previous match">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleNext} disabled={matches.length === 0} className="p-0.5 rounded text-[#4B5563] hover:text-[#9CA3AF] disabled:opacity-30 transition-colors focus-visible:outline-none" aria-label="Next match">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <button onClick={() => { setIsOpen(false); setQuery(""); }} className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Close search">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
