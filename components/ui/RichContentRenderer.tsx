'use client';

import React from 'react';
import katex from 'katex';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Render a text string that may contain inline math $...$
  const renderInlineMathAndText = (text: string, keyPrefix: string): React.ReactNode => {
    if (!text) return null;

    // Split by single dollar sign inline math: $...$
    // Ensure we don't match empty $$
    const inlineParts = text.split(/\$([^\$\n]+?)\$/g);

    return inlineParts.map((part, index) => {
      // Odd indices are math expressions
      if (index % 2 === 1) {
        try {
          const html = katex.renderToString(part.trim(), {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`${keyPrefix}-inline-math-${index}`}
              className="inline-math px-1 py-0.5 text-[var(--text-clay)] align-baseline font-serif"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code
              key={`${keyPrefix}-math-fallback-${index}`}
              className="px-1.5 py-0.5 rounded border border-[var(--border-clay)] bg-[var(--bg-clay)] font-mono text-xs font-bold text-[var(--text-clay)]"
            >
              {part}
            </code>
          );
        }
      }

      // Even indices are regular text with possible bold or code formatting
      return (
        <span key={`${keyPrefix}-txt-${index}`}>
          {renderMarkdownStyles(part, `${keyPrefix}-${index}`)}
        </span>
      );
    });
  };

  // Render inline bold (**text**) and code (`code`)
  const renderMarkdownStyles = (text: string, keyPrefix: string): React.ReactNode => {
    // Handle bold: **text**
    const boldTokens = text.split(/\*\*([^\*]+?)\*\*/g);

    return boldTokens.map((bToken, bIdx) => {
      if (bIdx % 2 === 1) {
        return (
          <strong key={`${keyPrefix}-b-${bIdx}`} className="font-extrabold text-[var(--text-clay)]">
            {bToken}
          </strong>
        );
      }

      // Handle inline code: `code`
      const codeTokens = bToken.split(/`([^`]+?)`/g);
      return codeTokens.map((cToken, cIdx) => {
        if (cIdx % 2 === 1) {
          return (
            <code
              key={`${keyPrefix}-c-${bIdx}-${cIdx}`}
              className="px-1.5 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] font-mono text-xs font-black text-[var(--text-clay)]"
            >
              {cToken}
            </code>
          );
        }
        return cToken;
      });
    });
  };

  // Render non-math text block (can have headers, bullet lists, numbered lists, blockquotes)
  const renderTextBlock = (textBlock: string, blockKey: string): React.ReactNode => {
    const lines = textBlock.split('\n');
    const nodes: React.ReactNode[] = [];
    let lineIdx = 0;

    while (lineIdx < lines.length) {
      const raw = lines[lineIdx];
      const trimmed = raw.trim();

      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        nodes.push(
          <h3
            key={`${blockKey}-h3-${lineIdx}`}
            className="text-xl sm:text-2xl font-black text-[var(--text-clay)] pt-3 pb-1.5 border-b border-[var(--border-clay)]/20 tracking-tight"
          >
            {renderInlineMathAndText(trimmed.slice(4), `${blockKey}-h3-${lineIdx}`)}
          </h3>
        );
        lineIdx++;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        nodes.push(
          <h2
            key={`${blockKey}-h2-${lineIdx}`}
            className="text-2xl sm:text-3xl font-black text-[var(--text-clay)] pt-4 pb-2 border-b-[2px] border-[var(--border-clay)] tracking-tight"
          >
            {renderInlineMathAndText(trimmed.slice(3), `${blockKey}-h2-${lineIdx}`)}
          </h2>
        );
        lineIdx++;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        nodes.push(
          <h1
            key={`${blockKey}-h1-${lineIdx}`}
            className="text-3xl sm:text-4xl font-black text-[var(--text-clay)] pt-5 pb-2.5 border-b-[2.5px] border-[var(--border-clay)] tracking-tight"
          >
            {renderInlineMathAndText(trimmed.slice(2), `${blockKey}-h1-${lineIdx}`)}
          </h1>
        );
        lineIdx++;
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        nodes.push(
          <blockquote
            key={`${blockKey}-quote-${lineIdx}`}
            className="my-3 p-4 rounded-xl border-l-4 border-[var(--primary-clay)] bg-[var(--bg-clay)] text-sm sm:text-base font-semibold italic text-[var(--text-clay)] shadow-[2px_2px_0px_var(--border-clay)]"
          >
            {renderInlineMathAndText(trimmed.slice(2), `${blockKey}-quote-${lineIdx}`)}
          </blockquote>
        );
        lineIdx++;
        continue;
      }

      // Unordered list (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        nodes.push(
          <li
            key={`${blockKey}-li-${lineIdx}`}
            className="ml-6 list-disc text-[16px] sm:text-[17.5px] leading-relaxed text-[var(--text-clay)] my-1"
          >
            {renderInlineMathAndText(trimmed.slice(2), `${blockKey}-li-${lineIdx}`)}
          </li>
        );
        lineIdx++;
        continue;
      }

      // Numbered list (1. or 2.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        nodes.push(
          <div
            key={`${blockKey}-num-${lineIdx}`}
            className="flex items-start gap-2.5 my-1.5 text-[16px] sm:text-[17.5px] leading-relaxed text-[var(--text-clay)]"
          >
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] shrink-0 mt-1">
              {numMatch[1]}.
            </span>
            <span className="flex-1">
              {renderInlineMathAndText(numMatch[2], `${blockKey}-num-${lineIdx}`)}
            </span>
          </div>
        );
        lineIdx++;
        continue;
      }

      // Regular paragraph
      nodes.push(
        <p
          key={`${blockKey}-p-${lineIdx}`}
          className="text-[17px] sm:text-[18px] leading-[1.8] text-[var(--text-clay)] font-normal my-2.5"
        >
          {renderInlineMathAndText(trimmed, `${blockKey}-p-${lineIdx}`)}
        </p>
      );
      lineIdx++;
    }

    return nodes;
  };

  // Primary splitting by display math blocks: $$...$$
  const displayMathSegments = content.split(/\$\$([\s\S]*?)\$\$/g);

  return (
    <div className={`rich-content-renderer space-y-4 ${className}`}>
      {displayMathSegments.map((segment, segmentIndex) => {
        // Odd indices are display math equations ($$...$$)
        if (segmentIndex % 2 === 1) {
          const rawMath = segment.trim();
          try {
            const html = katex.renderToString(rawMath, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div
                key={`display-math-${segmentIndex}`}
                className="my-5 p-4 sm:p-6 rounded-[22px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] shadow-[4px_4px_0px_var(--border-clay)] overflow-x-auto text-center"
              >
                <div
                  className="katex-display-wrapper text-base sm:text-xl font-serif text-[var(--text-clay)]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            );
          } catch {
            return (
              <div
                key={`display-math-fallback-${segmentIndex}`}
                className="my-4 p-4 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] font-mono text-sm overflow-x-auto text-[var(--text-clay)]"
              >
                {rawMath}
              </div>
            );
          }
        }

        // Even indices are text blocks
        return (
          <React.Fragment key={`text-segment-${segmentIndex}`}>
            {renderTextBlock(segment, `seg-${segmentIndex}`)}
          </React.Fragment>
        );
      })}
    </div>
  );
};
