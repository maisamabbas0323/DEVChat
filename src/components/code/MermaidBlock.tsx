import { useEffect, useRef, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "../../lib/utils";

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!containerRef.current) return;
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#6366f1",
            primaryTextColor: "#E2E8F0",
            primaryBorderColor: "#4B5563",
            lineColor: "#4B5563",
            secondaryColor: "#1E1B4B",
            tertiaryColor: "#0E0F14",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        });
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(code.trim());
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [code]);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.04] bg-[#0E0F14] max-w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] gap-2">
        <span className="text-[11px] font-medium text-[#4B5563] uppercase tracking-wide">mermaid</span>
        <div className="flex items-center gap-0.5">
          <button onClick={handleCopy} className="p-1.5 rounded-lg text-[#4B5563] hover:text-[#D1D5DB] hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Copy diagram source">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {error ? (
        <div className="p-4 text-sm text-red-400">
          <p className="font-medium mb-1">Diagram error</p>
          <p className="text-xs text-[#6B7280]">{error}</p>
        </div>
      ) : (
        <div ref={containerRef} className="p-4 overflow-x-auto flex justify-center [&>svg]:max-w-full" />
      )}
    </div>
  );
}
