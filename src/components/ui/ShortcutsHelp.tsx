import { useEffect, useRef } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["Ctrl/⌘", "N"], desc: "New chat" },
  { keys: ["Ctrl/⌘", ","], desc: "Open settings" },
  { keys: ["Ctrl/⌘", "Shift", "?"], desc: "Toggle shortcuts" },
  { keys: ["Enter"], desc: "Send message (when enabled)" },
  { keys: ["Shift", "Enter"], desc: "New line" },
  { keys: ["Ctrl/⌘", "Enter"], desc: "Send (when Ctrl+Enter mode)" },
  { keys: ["Escape"], desc: "Close modals / drawer" },
];

export default function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div ref={panelRef} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-[#1A1B26] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-[#F5F7FA]">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#4B5563] hover:text-[#D1D5DB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#9CA3AF]">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#D1D5DB] font-mono">{k}</kbd>
                    {j < s.keys.length - 1 && <span className="text-[#3B4050] mx-0.5 text-xs">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
