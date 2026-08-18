import { useMemo } from "react";
import {
  Code,
  Bug,
  Eye,
  RefreshCw,
  TestTube,
  FileText,
  Terminal,
  Database,
  Globe,
  Lock,
  Layers,
  Cpu,
  GitBranch,
  Workflow,
} from "lucide-react";
import { shuffle } from "../../lib/utils";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

const promptPool = [
  { icon: Code, label: "Explain this React hook", prompt: "Explain what this custom React hook does and how it works:\n\n```js\n\n```" },
  { icon: Code, label: "Explain this TypeScript type", prompt: "Explain this TypeScript type definition and when you'd use it:\n\n```ts\n\n```" },
  { icon: Code, label: "Explain this algorithm", prompt: "Explain this algorithm step by step and its time complexity:\n\n```\n\n```" },
  { icon: Code, label: "What does this regex do", prompt: "What does this regular expression match? Break it down:\n\n```\n\n```" },
  { icon: Bug, label: "Debug this error", prompt: "I'm getting this error. Help me debug it:\n\n```\n\n```\n\nHere's the relevant code:\n\n```js\n\n```" },
  { icon: Bug, label: "Fix this Vite build error", prompt: "My Vite build is failing with this error:\n\n```\n\n```\n\nMy vite.config.ts:\n\n```ts\n\n```" },
  { icon: Bug, label: "Fix this TypeScript error", prompt: "TypeScript is throwing this error:\n\n```\n\n```\n\nHere's the code:\n\n```ts\n\n```" },
  { icon: Bug, label: "Fix this CSS layout issue", prompt: "My CSS layout is broken. The element should look like X but instead looks like Y. Here's my CSS:\n\n```css\n\n```" },
  { icon: Eye, label: "Review this code", prompt: "Review this code for bugs, performance issues, and best practices:\n\n```ts\n\n```" },
  { icon: Eye, label: "Review my API design", prompt: "Review my REST API design and suggest improvements:\n\n```ts\n\n```" },
  { icon: Eye, label: "Review this PR diff", prompt: "Review this code change and flag any issues:\n\n```diff\n\n```" },
  { icon: RefreshCw, label: "Refactor for readability", prompt: "Refactor this code to be more readable and maintainable:\n\n```ts\n\n```" },
  { icon: RefreshCw, label: "Optimize performance", prompt: "This code is slow. Help me optimize it:\n\n```ts\n\n```" },
  { icon: RefreshCw, label: "Simplify this logic", prompt: "This function is too complex. Simplify it:\n\n```ts\n\n```" },
  { icon: TestTube, label: "Write unit tests", prompt: "Write comprehensive unit tests for this function:\n\n```ts\n\n```" },
  { icon: TestTube, label: "Write integration tests", prompt: "Write integration tests for this API endpoint:\n\n```ts\n\n```" },
  { icon: TestTube, label: "Add edge case tests", prompt: "What edge cases should I test for this function? Write the tests:\n\n```ts\n\n```" },
  { icon: FileText, label: "Generate JSDoc", prompt: "Generate JSDoc documentation for this function:\n\n```ts\n\n```" },
  { icon: FileText, label: "Write a README section", prompt: "Write a clear README section explaining this module:\n\n```ts\n\n```" },
  { icon: FileText, label: "Document this API", prompt: "Generate API documentation for these endpoints:\n\n```ts\n\n```" },
  { icon: Terminal, label: "Write a CLI command", prompt: "Help me build a CLI command that does the following:\n\n" },
  { icon: Database, label: "Design a database schema", prompt: "Design a PostgreSQL schema for this requirement:\n\n" },
  { icon: Database, label: "Optimize this SQL query", prompt: "This SQL query is slow. Help me optimize it:\n\n```sql\n\n```" },
  { icon: Globe, label: "Design a REST API", prompt: "Design a REST API for this feature:\n\n" },
  { icon: Lock, label: "Audit for security issues", prompt: "Audit this code for security vulnerabilities:\n\n```ts\n\n```" },
  { icon: Layers, label: "Suggest architecture", prompt: "I'm building a feature that does X. Suggest a clean architecture:\n\n" },
  { icon: Cpu, label: "Explain system design", prompt: "Explain the system design for a feature like:\n\n" },
  { icon: GitBranch, label: "Write a commit message", prompt: "Write a clear conventional commit message for this change:\n\n```diff\n\n```" },
  { icon: Workflow, label: "Create a GitHub Action", prompt: "Help me create a GitHub Actions workflow that:\n\n" },
];

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const selected = useMemo(() => shuffle(promptPool).slice(0, 6), []);

  return (
    <div className="flex flex-wrap justify-center gap-2 px-3 sm:px-4 py-3">
      {selected.map((action) => (
        <button
          key={action.label}
          onClick={() => onSelect(action.prompt)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14151C]/60 border border-white/[0.04] text-sm text-[#6B7280] hover:text-[#D1D5DB] hover:border-indigo-500/20 hover:bg-[#1A1B26] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.97]"
        >
          <action.icon className="w-4 h-4 flex-shrink-0 opacity-60" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
