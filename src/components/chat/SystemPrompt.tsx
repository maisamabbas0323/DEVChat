import { useState, useCallback } from "react";
import { Settings, ChevronDown } from "lucide-react";

interface SystemPromptProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SystemPrompt({ value, onChange }: SystemPromptProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = useCallback(() => {
    onChange(draft);
  }, [draft, onChange]);

  const handleToggle = useCallback(() => {
    if (open) {
      onChange(draft);
    }
    setOpen(!open);
  }, [open, draft, onChange]);

  return (
    <div className="px-3 sm:px-4 py-1 flex-shrink-0">
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#4B5563] hover:text-[#9CA3AF] hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={open}
      >
        <Settings className="w-3.5 h-3.5" />
        <span>Instructions</span>
        {value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 mb-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            placeholder="You are a helpful senior software engineer. Be concise, use code examples, and explain your reasoning..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-[#D1D5DB] placeholder:text-[#3B4050] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none leading-relaxed"
          />
          <p className="mt-1 text-[10px] text-[#3B4050]">
            System instructions for this conversation. Defines how the AI should behave.
          </p>
        </div>
      )}
    </div>
  );
}
