import { ArrowDown, ArrowUp, FileCode2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import Prism from 'prismjs';
import type { Token, TokenStream } from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import type { CodeLanguage, CodeSnippet } from '../types/course';
import { CopyButton } from './CopyButton';

function grammarFor(language: CodeLanguage) {
  if (language === 'text') return undefined;
  if (language === 'vue') return Prism.languages.markup;
  return Prism.languages[language];
}

function renderTokens(tokens: TokenStream): ReactNode {
  if (typeof tokens === 'string') return tokens;
  if (Array.isArray(tokens)) {
    return tokens.map((token, index) => <span key={index}>{renderTokens(token)}</span>);
  }

  const token = tokens as Token;
  return (
    <span className={`token ${[token.type, ...(Array.isArray(token.alias) ? token.alias : [token.alias])].filter(Boolean).join(' ')}`}>
      {renderTokens(token.content)}
    </span>
  );
}

function HighlightedLine({ line, language }: { line: string; language: CodeLanguage }) {
  const grammar = grammarFor(language);
  const tokens = grammar ? Prism.tokenize(line, grammar) : line;
  return <>{renderTokens(tokens)}</>;
}

export function CodeExplorer({ snippet }: { snippet: CodeSnippet }) {
  const [selectedLine, setSelectedLine] = useState(0);
  const lines = snippet.code.split('\n');
  const lineCount = lines.length;

  useEffect(() => {
    setSelectedLine(0);
  }, [snippet.id]);

  function selectLine(index: number) {
    setSelectedLine(Math.max(0, Math.min(lineCount - 1, index)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectLine(selectedLine + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectLine(selectedLine - 1);
    }
  }

  return (
    <section
      aria-label={`โค้ด ${snippet.filename}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="min-w-0 overflow-hidden rounded-2xl border border-line bg-[#111827] shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b border-white/10 bg-[#1f2937] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FileCode2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
          <div className="min-w-0">
            <h4 className="break-all font-mono text-sm font-semibold text-white">{snippet.filename}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] text-indigo-200">
                {snippet.language}
              </span>
              {snippet.caption && <p className="text-xs leading-5 text-slate-300">{snippet.caption}</p>}
            </div>
          </div>
        </div>
        <CopyButton text={snippet.code} />
      </header>

      <div className="grid min-w-0 items-start gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0 max-w-full overflow-x-auto" tabIndex={0} aria-label="พื้นที่โค้ด เลื่อนแนวนอนได้">
          <pre className="m-0 min-w-max bg-transparent p-0 font-mono text-[13px] leading-6 text-slate-100">
            <code>
              {lines.map((line, index) => (
                <button
                  key={`${snippet.id}-${index}`}
                  type="button"
                  aria-label={`บรรทัด ${index + 1}`}
                  aria-pressed={selectedLine === index}
                  onClick={() => selectLine(index)}
                  className={`flex min-w-max items-start border-l-4 text-left transition-colors ${
                    selectedLine === index
                      ? 'border-indigo-400 bg-indigo-400/15'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`sticky left-0 w-14 shrink-0 select-none px-3 py-2 text-right text-slate-400 ${
                      selectedLine === index ? 'bg-[#172036] text-indigo-200' : 'bg-[#111827]'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <code className={`language-${snippet.language} block min-w-max whitespace-pre px-4 py-2`}>
                    <HighlightedLine line={line} language={snippet.language} />
                    {line.length === 0 ? '\u00a0' : null}
                  </code>
                </button>
              ))}
            </code>
          </pre>
        </div>

        <aside
          aria-label="รายละเอียดบรรทัด"
          className="min-w-0 border-t border-white/10 bg-white p-5 text-ink lg:min-h-full lg:border-l lg:border-t-0"
        >
          <div aria-live="polite" aria-atomic="true">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-brand">LINE NOTE</p>
            <h4 id={`code-note-${snippet.id}`} className="mt-2 text-lg font-semibold">
              บรรทัด {selectedLine + 1}
            </h4>
            <p className="mt-3 text-sm leading-7 text-muted">
              {snippet.notes[selectedLine] ?? 'ไม่มีคำอธิบายสำหรับบรรทัดนี้'}
            </p>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => selectLine(selectedLine - 1)}
              disabled={selectedLine === 0}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
              บรรทัดก่อนหน้า
            </button>
            <button
              type="button"
              onClick={() => selectLine(selectedLine + 1)}
              disabled={selectedLine === lineCount - 1}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            >
              บรรทัดถัดไป
              <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted">
            โฟกัส Code Explorer แล้วใช้ปุ่มลูกศรขึ้น/ลง เพื่อเปลี่ยนบรรทัดที่อ่าน
          </p>
        </aside>
      </div>
    </section>
  );
}
