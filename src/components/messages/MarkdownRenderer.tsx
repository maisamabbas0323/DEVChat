import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import CodeBlock from "../code/CodeBlock";
import MermaidBlock from "../code/MermaidBlock";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className ?? "");
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[#C4B5FD] text-[0.85em] font-mono break-all"
                {...rest}
              >
                {children}
              </code>
            );
          }

          const lang = match?.[1] ?? "";
          const codeStr = String(children).replace(/\n$/, "");

          if (lang === "mermaid") {
            return <MermaidBlock code={codeStr} />;
          }

          return (
            <CodeBlock
              code={codeStr}
              language={lang}
            />
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-sm">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-white/[0.03]">{children}</thead>;
        },
        th({ children }) {
          return (
            <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider border-b border-white/[0.04] whitespace-nowrap">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-3 sm:px-4 py-2.5 border-b border-white/[0.03] text-[#D1D5DB] min-w-0">
              {children}
            </td>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote className="my-3 pl-3 sm:pl-4 border-l-2 border-indigo-500/40 text-[#6B7280] italic">
              {children}
            </blockquote>
          );
        },
        h1({ children }) {
          return (
            <h1 className="text-lg sm:text-xl font-bold text-[#F5F7FA] mt-4 mb-2">
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2 className="text-base sm:text-lg font-semibold text-[#F5F7FA] mt-3 mb-2">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="text-sm sm:text-base font-semibold text-[#F5F7FA] mt-3 mb-1">
              {children}
            </h3>
          );
        },
        ul({ children }) {
          return (
            <ul className="my-2 ml-4 list-disc space-y-1 text-[#D1D5DB]">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="my-2 ml-4 list-decimal space-y-1 text-[#D1D5DB]">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return <li className="pl-1 min-w-0 overflow-wrap-anywhere">{children}</li>;
        },
        p({ children }) {
          return (
            <p className="my-2 leading-relaxed text-[#D1D5DB] min-w-0 overflow-wrap-anywhere break-words">
              {children}
            </p>
          );
        },
        hr() {
          return <hr className="my-4 border-white/[0.06]" />;
        },
      }}
    >
      {content}
    </Markdown>
  );
}
