import { useMemo } from "react";
import {
  Code,
  Bug,
  Eye,
  RefreshCw,
  TestTube,
  HelpCircle,
  Terminal,
  Database,
  Globe,
  Lock,
  Layers,
  Cpu,
} from "lucide-react";
import { shuffle } from "../../lib/utils";

interface EmptyChatStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const suggestionPool = [
  { icon: Code, text: "Explain this React hook", hint: "Paste your custom hook code" },
  { icon: Code, text: "Explain this TypeScript type", hint: "Paste a complex type definition" },
  { icon: Code, text: "What does this regex do", hint: "Paste your regex pattern" },
  { icon: Bug, text: "Debug this error", hint: "Paste the full error message" },
  { icon: Bug, text: "Fix this TypeScript error", hint: "Paste the error and your code" },
  { icon: Bug, text: "Fix this build failure", hint: "Paste your build output" },
  { icon: Bug, text: "Fix this CSS layout issue", hint: "Describe the broken layout" },
  { icon: Eye, text: "Review my code", hint: "Paste a function or file" },
  { icon: Eye, text: "Review my API design", hint: "Share your endpoint structure" },
  { icon: Eye, text: "Review this PR diff", hint: "Paste the code changes" },
  { icon: RefreshCw, text: "Refactor for readability", hint: "Paste code that's hard to read" },
  { icon: RefreshCw, text: "Optimize this for performance", hint: "Paste slow code" },
  { icon: RefreshCw, text: "Simplify this logic", hint: "Paste complex code" },
  { icon: TestTube, text: "Write unit tests", hint: "Paste the function to test" },
  { icon: TestTube, text: "Add edge case tests", hint: "Paste code needing test coverage" },
  { icon: HelpCircle, text: "Design a REST API", hint: "Describe your endpoints" },
  { icon: Terminal, text: "Build a CLI tool", hint: "Describe the command" },
  { icon: Database, text: "Design a database schema", hint: "Describe your data model" },
  { icon: Database, text: "Optimize this SQL query", hint: "Paste your slow query" },
  { icon: Globe, text: "Build a webhook handler", hint: "Describe the integration" },
  { icon: Lock, text: "Audit for security issues", hint: "Paste code to audit" },
  { icon: Layers, text: "Suggest an architecture", hint: "Describe your feature" },
  { icon: Cpu, text: "Explain system design", hint: "Describe the system" },
];

export default function EmptyChatState({ onSelectPrompt }: EmptyChatStateProps) {
  const suggestions = useMemo(() => shuffle(suggestionPool).slice(0, 6), []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 min-h-0 overflow-y-auto">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] mb-2.5 text-center tracking-tight">
        What can I help you with?
      </h1>
      <p className="text-[#6B7280] text-center max-w-sm sm:max-w-md mb-10 text-sm sm:text-base leading-relaxed">
        Pick a prompt below to get started, or just type your question.
      </p>

      {/* Suggestion grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => onSelectPrompt(s.text)}
            className="group flex items-start gap-3.5 px-5 py-4 rounded-xl bg-[#14151C]/60 border border-white/[0.04] text-left transition-all duration-200 hover:border-indigo-500/20 hover:bg-[#1A1B26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5">
              <s.icon className="w-4 h-4 text-[#4B5563] group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#D1D5DB] group-hover:text-white">{s.text}</p>
              <p className="text-xs text-[#4B5563] mt-0.5">{s.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
