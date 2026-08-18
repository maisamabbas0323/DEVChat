import { useState, useCallback } from "react";
import hljs from "../../lib/highlight";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "../../lib/utils";
import { useSettingsStore } from "../../store/settingsStore";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { settings } = useSettingsStore();

  const trimmedCode = code.replace(/\n$/, "");
  const lang = language?.toLowerCase() ?? "";

  let highlighted: string;
  if (lang && hljs.getLanguage(lang)) {
    highlighted = hljs.highlight(trimmedCode, { language: lang }).value;
  } else if (trimmedCode.length < 10000) {
    try {
      highlighted = hljs.highlightAuto(trimmedCode).value;
    } catch {
      highlighted = trimmedCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  } else {
    highlighted = trimmedCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(trimmedCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [trimmedCode]);

  const themeClass = settings.codeHighlightTheme !== "default"
    ? `hljs-theme-${settings.codeHighlightTheme}`
    : "";

  return (
    <div className={`my-3 rounded-xl overflow-hidden border border-white/[0.04] bg-[#0E0F14] max-w-full ${themeClass}`}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] gap-2">
        <span className="text-[11px] font-medium text-[#4B5563] uppercase tracking-wide truncate min-w-0">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-[#4B5563] hover:text-[#D1D5DB] hover:bg-white/[0.04] transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 sm:p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code
          className={`hljs ${lang ? `language-${lang}` : ""}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
