'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface SocraticMessageRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

/**
 * Pre-processes markdown content from LLMs to fix common formatting defects:
 * 1. Replaces raw HTML `<br>` and `<br/>` tags with real Markdown linebreaks.
 * 2. Un-collapses single-line markdown tables where rows were output on the same line.
 * 3. Normalizes LaTeX delimiters so KaTeX renders inline and block formulas cleanly.
 */
function cleanMessageContent(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Replace raw HTML breaks with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // 2. Fix collapsed single-line markdown tables: e.g. "| a | b | | c | d |" -> "| a | b |\n| c | d |"
  text = text.replace(/\|\s*\|\s*([^|\n]+)\|/g, '|\n| $1|');

  // Also fix: "| row 1 | |---|" pattern where delimiter row is glued to header
  text = text.replace(/\|\s*\|\s*(\-{3,})/g, '|\n| $1');

  // 3. Ensure double newlines around blockquotes and headers for crisp markdown parsing
  text = text.replace(/([^\n])\n(#{1,4}\s)/g, '$1\n\n$2');
  text = text.replace(/([^\n])\n(>\s)/g, '$1\n\n$2');

  return text;
}

export const SocraticMessageRenderer: React.FC<SocraticMessageRendererProps> = ({
  content,
  isUser = false,
  className = '',
}) => {
  const cleaned = cleanMessageContent(content);

  return (
    <div
      className={`socratic-message-content leading-relaxed text-inherit break-words ${
        isUser ? 'text-white' : 'text-[var(--text-clay)]'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-4 mb-2 pb-1 border-b border-current/20">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-black tracking-tight mt-3 mb-2 pb-0.5 border-b border-current/15">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-black tracking-normal mt-3 mb-1.5 flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-extrabold mt-2 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs & Text
          p: ({ children }) => (
            <p className="my-2 leading-relaxed text-[13.5px] sm:text-sm font-medium">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-black text-inherit underline-offset-2">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic opacity-90">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1.5 text-[13px] sm:text-sm marker:text-current/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1.5 text-[13px] sm:text-sm marker:font-black">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),

          // Socratic Thought Prompts & Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-4 py-2.5 pr-3 border-l-4 border-[#FF6B4A] bg-black/5 dark:bg-white/5 rounded-r-2xl font-semibold text-xs sm:text-sm shadow-sm space-y-1">
              {children}
            </blockquote>
          ),

          // Clean Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border-2 border-black/30 dark:border-white/30 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] bg-white/70 dark:bg-black/30 max-w-full">
              <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-black/10 dark:bg-white/10 font-black uppercase tracking-wider text-[11px] border-b-2 border-black/20 dark:border-white/20">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-black text-inherit">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top text-inherit leading-snug">
              {children}
            </td>
          ),

          // Code
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded-md border border-current/25 bg-current/10 font-mono text-xs font-bold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 my-2.5 rounded-xl bg-[#1A1A1A] text-[#50FA7B] font-mono text-xs overflow-x-auto border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <code>{children}</code>
              </pre>
            );
          },

          // Horizontal rule
          hr: () => (
            <hr className="my-3 border-t-2 border-current/20" />
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
};
