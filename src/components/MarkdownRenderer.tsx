import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse markdown blocks (code blocks vs regular paragraphs/headings/lists)
  const renderFormattedText = (text: string) => {
    // Split into segments by code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Push text before code block
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        segments.push(
          <div key={`text-${lastIndex}`} className="space-y-2">
            {renderMarkdownParagraphs(textBefore)}
          </div>
        );
      }

      const lang = match[1] || 'code';
      const code = match[2];
      segments.push(<CodeBlock key={`code-${matchIndex}`} language={lang} code={code} />);

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      segments.push(
        <div key={`text-${lastIndex}`} className="space-y-2">
          {renderMarkdownParagraphs(textAfter)}
        </div>
      );
    }

    return segments;
  };

  const renderMarkdownParagraphs = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    let isNumberedList = false;

    const flushList = () => {
      if (listBuffer.length > 0) {
        const key = `list-${Math.random()}`;
        if (isNumberedList) {
          elements.push(
            <ol key={key} className="list-decimal pl-5 space-y-1.5 my-2 text-slate-200">
              {listBuffer.map((item, i) => (
                <li key={i}>{formatInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key} className="list-disc pl-5 space-y-1.5 my-2 text-slate-200">
              {listBuffer.map((item, i) => (
                <li key={i}>{formatInline(item)}</li>
              ))}
            </ul>
          );
        }
        listBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="text-base font-bold text-slate-100 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#8B5CF6] rounded-full inline-block" />
            {formatInline(trimmed.substring(4))}
          </h4>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold text-slate-100 mt-5 mb-2.5 flex items-center gap-2">
            <span className="w-2 h-4 bg-[#B7FF3C] rounded-full inline-block" />
            {formatInline(trimmed.substring(3))}
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-extrabold text-slate-50 mt-6 mb-3">
            {formatInline(trimmed.substring(2))}
          </h2>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote
            key={`bq-${i}`}
            className="border-l-4 border-[#B7FF3C] bg-[#121624] px-4 py-2.5 rounded-r-lg my-2.5 text-slate-300 italic"
          >
            {formatInline(trimmed.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Unordered list items (- or *)
      if (/^[-*]\s+/.test(trimmed)) {
        isNumberedList = false;
        listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
        continue;
      }

      // Numbered list items (1., 2., etc)
      if (/^\d+\.\s+/.test(trimmed)) {
        isNumberedList = true;
        listBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
        continue;
      }

      // Normal paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-slate-200 leading-relaxed text-sm md:text-base my-1.5">
          {formatInline(line)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  // Helper for inline styles: **bold**, *italic*, `code`, [link](url)
  const formatInline = (text: string): React.ReactNode => {
    // Regex for inline code: `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-[#1A1F30] text-[#B7FF3C] font-mono text-xs md:text-sm border border-[#2B324D]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return <div className={`markdown-body space-y-3 ${className}`}>{renderFormattedText(content)}</div>;
};

// Isolated Code Block with Copy Button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  return (
    <div className="relative my-4 rounded-xl border border-[#23283D] bg-[#0E111C] overflow-hidden shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#141826] border-b border-[#23283D]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#B7FF3C]" />
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-[#1C2237] hover:bg-[#252D48] text-slate-300 hover:text-white transition-all active:scale-95 border border-[#2C3452]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#B7FF3C]" />
              <span className="text-[#B7FF3C] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Content */}
      <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-emerald-300/90 leading-relaxed scrollbar-thin">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};
